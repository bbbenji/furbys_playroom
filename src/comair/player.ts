import { SAMPLE_RATE } from "./frequencies";
import { synthesizeCommand } from "./synth";

/**
 * Plays synthesized ComAir commands through the device speaker. Reuses a
 * single AudioContext and serializes playback so overlapping calls don't
 * corrupt the two-packet timing a Furby expects.
 */
export class ComAirPlayer {
  private ctx: AudioContext | null = null;
  private queue: Promise<void> = Promise.resolve();

  private getContext(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      // Some older WebKit builds throw on an explicit sampleRate; the buffer
      // we play back always declares its own rate, so the context's native
      // rate doesn't affect correctness - Web Audio resamples on playback.
      try {
        this.ctx = new Ctor({ sampleRate: SAMPLE_RATE });
      } catch {
        this.ctx = new Ctor();
      }
    }
    return this.ctx;
  }

  /**
   * Must be called synchronously from a user gesture handler (e.g. the very
   * first tap) on iOS/Safari, which suspends new AudioContexts until a
   * same-tick resume() call. Safe to call repeatedly.
   */
  unlock(): void {
    const ctx = this.getContext();
    if (ctx.state === "suspended") void ctx.resume();
  }

  /** Sends a command, resolving once its audio has finished playing. */
  async send(command: number): Promise<void> {
    const task = this.queue.then(() => this.playNow(command));
    // Keep the queue alive even if this send fails, so later sends aren't blocked.
    this.queue = task.catch(() => undefined);
    return task;
  }

  private async playNow(command: number): Promise<void> {
    const ctx = this.getContext();
    if (ctx.state === "suspended") await ctx.resume();

    const samples = synthesizeCommand(command);
    const buffer = ctx.createBuffer(1, samples.length, SAMPLE_RATE);
    buffer.copyToChannel(samples, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    await new Promise<void>((resolve) => {
      source.onended = () => resolve();
      source.start();
    });
  }
}
