import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock(...) factories below are hoisted above every import in this file,
// but plain const/let declarations aren't hoisted along with them - vi.hoisted
// is what lets the factories close over shared, mutable mock state.
const mocks = vi.hoisted(() => {
  let keepAliveActive = false;
  return {
    sendMock: vi.fn(async () => {}),
    startKeepAliveMock: vi.fn(async () => {
      keepAliveActive = true;
    }),
    stopKeepAliveMock: vi.fn(() => {
      keepAliveActive = false;
    }),
    getKeepAliveActive: () => keepAliveActive,
    resetKeepAliveActive: () => {
      keepAliveActive = false;
    },
  };
});

// The store constructs ComAirTransmitter/ComAirReceiver singletons at module
// load time, so both need mocking to avoid touching real Web Audio/
// getUserMedia APIs that don't exist in this Node test environment.
vi.mock("../comair/transmitter", () => ({
  ComAirTransmitter: vi.fn().mockImplementation(() => ({
    unlock: vi.fn(),
    send: mocks.sendMock,
    get keepAliveActive() {
      return mocks.getKeepAliveActive();
    },
    startKeepAlive: mocks.startKeepAliveMock,
    stopKeepAlive: mocks.stopKeepAliveMock,
    onSent: vi.fn(),
  })),
}));

vi.mock("../comair/receiver", () => ({
  ComAirReceiver: vi.fn().mockImplementation(() => ({
    onPacket: vi.fn(),
    onCommand: vi.fn(),
    onSymbol: vi.fn(),
    start: vi.fn(async () => {}),
    stop: vi.fn(),
    magnitudeThreshold: 0.01,
  })),
  friendlyReceiverError: vi.fn((err: unknown) => String(err)),
}));

import { useFurbyStore } from "./furby";

describe("useFurbyStore.send", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    mocks.sendMock.mockClear();
    mocks.startKeepAliveMock.mockClear();
    mocks.stopKeepAliveMock.mockClear();
    mocks.resetKeepAliveActive();
  });

  it("ignores a second send() while one is already in flight", async () => {
    const store = useFurbyStore();
    let resolveFirstSend: () => void = () => {};
    mocks.sendMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFirstSend = resolve;
        }),
    );

    const first = store.send(865); // Furby Fart
    // this.sending is set synchronously before any await, so a concurrent
    // tap should be dropped immediately rather than queuing a second sound.
    expect(store.sending).toBe(865);

    // Let the first call's internal awaits (auto-wake, etc.) actually reach
    // transmitter.send() before testing that a second tap is ignored.
    await vi.waitFor(() => expect(mocks.sendMock).toHaveBeenCalledTimes(1));

    await store.send(866); // should be a no-op - sending is still in flight
    expect(mocks.sendMock).toHaveBeenCalledTimes(1);

    resolveFirstSend();
    await first;
    expect(store.sending).toBeNull();
  });

  it("auto-starts the keep-alive daemon before the first command of a session", async () => {
    const store = useFurbyStore();
    expect(store.keepAliveActive).toBe(false);

    await store.send(865);

    expect(mocks.startKeepAliveMock).toHaveBeenCalledTimes(1);
    expect(store.keepAliveActive).toBe(true);
    // The keep-alive ping must go out before the real command.
    const keepAliveOrder = mocks.startKeepAliveMock.mock.invocationCallOrder[0];
    const sendOrder = mocks.sendMock.mock.invocationCallOrder[0];
    expect(keepAliveOrder).toBeLessThan(sendOrder);
  });

  it("does not re-trigger the keep-alive daemon once it's already active", async () => {
    const store = useFurbyStore();
    await store.send(865);
    expect(mocks.startKeepAliveMock).toHaveBeenCalledTimes(1);

    await store.send(866);
    // Still active from the first send, so no second keep-alive ping.
    expect(mocks.startKeepAliveMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendMock).toHaveBeenCalledTimes(2);
  });

  it("surfaces a failed send as sendError and still clears sending", async () => {
    const store = useFurbyStore();
    mocks.sendMock.mockImplementationOnce(async () => {
      throw new Error("boom");
    });

    await store.send(865);

    expect(store.sendError).toBe("boom");
    expect(store.sending).toBeNull();
  });

  it("toggleKeepAlive stops the daemon and clears keepAliveActive", async () => {
    const store = useFurbyStore();
    await store.send(865); // auto-starts it
    expect(store.keepAliveActive).toBe(true);

    await store.toggleKeepAlive();

    expect(mocks.stopKeepAliveMock).toHaveBeenCalledTimes(1);
    expect(store.keepAliveActive).toBe(false);
  });
});
