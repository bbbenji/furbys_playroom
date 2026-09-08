import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KEEP_ALIVE_COMMAND, KEEP_ALIVE_INTERVAL_MS } from "./commands";
import { ComAirTransmitter } from "./transmitter";

const playerMocks = vi.hoisted(() => ({
  sendMock: vi.fn(async () => {}),
  unlockMock: vi.fn(),
}));

vi.mock("./player", () => ({
  ComAirPlayer: vi.fn().mockImplementation(() => ({
    send: playerMocks.sendMock,
    unlock: playerMocks.unlockMock,
  })),
}));

describe("ComAirTransmitter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playerMocks.sendMock.mockClear();
    playerMocks.unlockMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delegates unlock() to the underlying player", () => {
    const transmitter = new ComAirTransmitter();
    transmitter.unlock();
    expect(playerMocks.unlockMock).toHaveBeenCalledTimes(1);
  });

  it("sends commands and invokes all registered onSent handlers", async () => {
    const transmitter = new ComAirTransmitter();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    transmitter.onSent(handler1);
    transmitter.onSent(handler2);

    await transmitter.send(865);

    expect(playerMocks.sendMock).toHaveBeenCalledWith(865);
    expect(handler1).toHaveBeenCalledWith(865);
    expect(handler2).toHaveBeenCalledWith(865);
  });

  it("starts keep-alive, sends immediately, and periodically re-transmits on the interval", async () => {
    const transmitter = new ComAirTransmitter();
    expect(transmitter.keepAliveActive).toBe(false);

    const startPromise = transmitter.startKeepAlive();
    await startPromise;

    expect(transmitter.keepAliveActive).toBe(true);
    expect(playerMocks.sendMock).toHaveBeenCalledTimes(1);
    expect(playerMocks.sendMock).toHaveBeenCalledWith(KEEP_ALIVE_COMMAND);

    // Advance by interval
    await vi.advanceTimersByTimeAsync(KEEP_ALIVE_INTERVAL_MS);
    expect(playerMocks.sendMock).toHaveBeenCalledTimes(2);

    // Advance by interval again
    await vi.advanceTimersByTimeAsync(KEEP_ALIVE_INTERVAL_MS);
    expect(playerMocks.sendMock).toHaveBeenCalledTimes(3);

    transmitter.stopKeepAlive();
    expect(transmitter.keepAliveActive).toBe(false);

    // After stopping, timer should not fire anymore
    await vi.advanceTimersByTimeAsync(KEEP_ALIVE_INTERVAL_MS * 2);
    expect(playerMocks.sendMock).toHaveBeenCalledTimes(3);
  });

  it("coalesces concurrent startKeepAlive calls into a single in-flight promise", async () => {
    const transmitter = new ComAirTransmitter();
    let resolveSend: () => void = () => {};
    playerMocks.sendMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        }),
    );

    const p1 = transmitter.startKeepAlive();
    const p2 = transmitter.startKeepAlive();

    resolveSend();
    await Promise.all([p1, p2]);

    expect(playerMocks.sendMock).toHaveBeenCalledTimes(1);
    expect(transmitter.keepAliveActive).toBe(true);

    // Subsequent startKeepAlive call when already active should be an immediate no-op
    await transmitter.startKeepAlive();
    expect(playerMocks.sendMock).toHaveBeenCalledTimes(1);

    transmitter.stopKeepAlive();
  });

  it("handles failure during keep-alive send without getting wedged", async () => {
    const transmitter = new ComAirTransmitter();
    playerMocks.sendMock.mockImplementationOnce(async () => {
      throw new Error("send failed");
    });

    await expect(transmitter.startKeepAlive()).rejects.toThrow("send failed");
    expect(transmitter.keepAliveActive).toBe(false);

    // Can retry cleanly after failure
    playerMocks.sendMock.mockImplementationOnce(async () => {});
    await expect(transmitter.startKeepAlive()).resolves.toBeUndefined();
    expect(transmitter.keepAliveActive).toBe(true);

    transmitter.stopKeepAlive();
  });
});
