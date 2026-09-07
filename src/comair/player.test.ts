import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComAirPlayer, PLAYBACK_TIMEOUT_MS, RESUME_TIMEOUT_MS } from "./player";

interface ContextConfig {
  initialState?: "running" | "suspended";
  resumeImpl?: () => Promise<void>;
  /** If false, the source's onended callback is never fired - simulates the WebKit "stuck playback" bug. */
  autoEndSource?: boolean;
}

// getContext() builds a new context each time this.ctx is null (first call,
// or after a prior failure resets it) - queue one config per construction so
// each test can control exactly how that context misbehaves (or doesn't).
let contextConfigQueue: ContextConfig[] = [];
let contextConstructionCount = 0;

class FakeSourceNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  constructor(private autoEnd: boolean) {}
  connect() {}
  start() {
    if (this.autoEnd) setTimeout(() => this.onended?.(), 5);
    // else: never resolves - the stuck-playback case.
  }
}

class FakeAudioContext {
  state: "running" | "suspended" | "closed";
  destination = {};
  closed = false;
  private resumeImpl: () => Promise<void>;
  private autoEndSource: boolean;

  constructor() {
    contextConstructionCount++;
    const config = contextConfigQueue.shift() ?? {};
    this.state = config.initialState ?? "running";
    this.resumeImpl =
      config.resumeImpl ??
      (async () => {
        this.state = "running";
      });
    this.autoEndSource = config.autoEndSource ?? true;
  }

  resume(): Promise<void> {
    return this.resumeImpl();
  }

  close(): Promise<void> {
    this.closed = true;
    this.state = "closed";
    return Promise.resolve();
  }

  createBuffer(_channels: number, length: number, sampleRate: number) {
    return { length, sampleRate, copyToChannel: () => {} };
  }

  createBufferSource(): FakeSourceNode {
    return new FakeSourceNode(this.autoEndSource);
  }
}

describe("ComAirPlayer", () => {
  beforeEach(() => {
    contextConfigQueue = [];
    contextConstructionCount = 0;
    vi.stubGlobal("window", { AudioContext: FakeAudioContext });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("plays a command end to end against a healthy context", async () => {
    contextConfigQueue.push({ initialState: "running" });
    const player = new ComAirPlayer();
    await expect(player.send(820)).resolves.toBeUndefined();
  });

  it("recovers once a stuck ctx.resume() times out, instead of wedging future sends forever", async () => {
    vi.useFakeTimers();
    contextConfigQueue.push({
      initialState: "suspended",
      resumeImpl: () => new Promise<void>(() => {}), // never resolves
    });

    const player = new ComAirPlayer();
    const stuckSend = player.send(820);
    const assertion = expect(stuckSend).rejects.toThrow(/didn't resume/i);

    await vi.advanceTimersByTimeAsync(RESUME_TIMEOUT_MS + 50);
    await assertion;

    // The queue must not stay wedged behind the failed send - the next one,
    // against a fresh healthy context, should succeed normally.
    contextConfigQueue.push({ initialState: "running" });
    const nextSend = player.send(820);
    await vi.advanceTimersByTimeAsync(50);
    await expect(nextSend).resolves.toBeUndefined();
    expect(contextConstructionCount).toBe(2); // the wedged one, then a fresh one
  });

  it("recovers once a stuck source.onended times out, instead of wedging future sends forever", async () => {
    vi.useFakeTimers();
    contextConfigQueue.push({
      initialState: "running",
      autoEndSource: false, // source.start() is called but onended never fires
    });

    const player = new ComAirPlayer();
    const stuckSend = player.send(820);
    const assertion = expect(stuckSend).rejects.toThrow(/stuck/i);

    await vi.advanceTimersByTimeAsync(PLAYBACK_TIMEOUT_MS + 50);
    await assertion;

    contextConfigQueue.push({ initialState: "running" });
    const nextSend = player.send(820);
    await vi.advanceTimersByTimeAsync(50);
    await expect(nextSend).resolves.toBeUndefined();
    expect(contextConstructionCount).toBe(2); // the wedged one, then a fresh one
  });

  it("queues concurrent sends against the same context rather than each building a new one", async () => {
    // The player reuses a single AudioContext across sends, so only one
    // config is ever consumed here even though two sends happen.
    contextConfigQueue.push({ initialState: "running" });
    const player = new ComAirPlayer();

    const first = player.send(820);
    const second = player.send(821);

    await expect(Promise.all([first, second])).resolves.toBeDefined();
    expect(contextConstructionCount).toBe(1);
  });
});
