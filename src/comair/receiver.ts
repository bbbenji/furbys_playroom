import { SAMPLE_RATE } from "./frequencies";
import { combinePacketValues, parsePacket } from "./packet";

export interface ReceivedPacket {
  /** 6-bit packet value: 0-31 is the high half of a command, 32-63 is the low half */
  value: number;
  isHighHalf: boolean;
  at: number;
}

export interface ReceivedCommand {
  command: number;
  at: number;
}

export type SymbolMsg = {
  symbol: string | null;
  magnitude: number;
  magnitudes: Record<string, number>;
};

/**
 * Best-effort live decoder for Furby's acoustic responses. This is the
 * inverse of the TX path: it classifies incoming audio into the 5 ComAir
 * tones via a Goertzel filter (see public/goertzel-processor.js), collapses
 * repeated frames, looks for the same X-interleaved 12-digit pattern the
 * transmitter produces, and runs it through the same checksum table.
 *
 * NOTE: this hasn't been validated against a physical Furby (no hardware
 * available while building this) - treat it as experimental. Mic AGC/noise
 * suppression and ultrasonic roll-off vary a lot across devices/browsers,
 * so detection quality will vary.
 */
export class ComAirReceiver {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private node: AudioWorkletNode | null = null;
  private collapsed: string[] = [];
  private lastSymbol: string | null = null;
  private lastEmittedHigh: ReceivedPacket | null = null;

  /** Live-adjustable (unlike the rest of the decoder state) so a debug UI can tune it while the mic is running. */
  magnitudeThreshold: number;
  private packetHandlers: Array<(p: ReceivedPacket) => void> = [];
  private commandHandlers: Array<(c: ReceivedCommand) => void> = [];
  private symbolHandlers: Array<(m: SymbolMsg) => void> = [];

  constructor(magnitudeThreshold = 0.01) {
    this.magnitudeThreshold = magnitudeThreshold;
  }

  onPacket(handler: (p: ReceivedPacket) => void): void {
    this.packetHandlers.push(handler);
  }

  onCommand(handler: (c: ReceivedCommand) => void): void {
    this.commandHandlers.push(handler);
  }

  /** Raw per-window magnitudes for every tone, before thresholding - for a live signal-strength debug view. */
  onSymbol(handler: (m: SymbolMsg) => void): void {
    this.symbolHandlers.push(handler);
  }

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException(
        "This browser has no microphone API",
        "NotSupportedError",
      );
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    });

    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      try {
        this.ctx = new Ctor({ sampleRate: SAMPLE_RATE });
      } catch {
        this.ctx = new Ctor();
      }

      if (!this.ctx.audioWorklet) {
        throw new DOMException(
          "This browser has no AudioWorklet support",
          "NotSupportedError",
        );
      }
      await this.ctx.audioWorklet.addModule(
        `${import.meta.env.BASE_URL}goertzel-processor.js`,
      );

      this.source = this.ctx.createMediaStreamSource(this.stream);
      this.node = new AudioWorkletNode(this.ctx, "goertzel-processor");
      this.node.port.onmessage = (event: MessageEvent<SymbolMsg>) =>
        this.handleSymbol(event.data);
      this.source.connect(this.node);
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  stop(): void {
    this.node?.port.close();
    this.node?.disconnect();
    this.node = null;
    // Disconnecting the source node explicitly (rather than relying on it
    // being torn down implicitly by stopping tracks/closing the context)
    // matters on iOS Safari, where a MediaStreamAudioSourceNode left attached
    // to the graph can keep the OS recording indicator on even after its
    // tracks are stopped.
    this.source?.disconnect();
    this.source = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close();
    this.ctx = null;
    this.collapsed = [];
    this.lastSymbol = null;
  }

  private handleSymbol(msg: SymbolMsg): void {
    this.symbolHandlers.forEach((h) => h(msg));

    const symbol = msg.magnitude >= this.magnitudeThreshold ? msg.symbol : null;
    if (symbol === this.lastSymbol) return;
    this.lastSymbol = symbol;
    if (symbol === null) return;

    this.collapsed.push(symbol);
    if (this.collapsed.length > 64) this.collapsed = this.collapsed.slice(-64);

    this.tryDecode();
  }

  /** Looks for an X-digit-X-digit-...-X run (13 X's around 12 digits) anywhere in the buffer. */
  private tryDecode(): void {
    const buf = this.collapsed;
    for (let start = 0; start < buf.length; start++) {
      if (buf[start] !== "X") continue;

      const digits: string[] = [];
      let i = start + 1;
      while (i + 1 < buf.length && buf[i] !== "X" && buf[i + 1] === "X") {
        digits.push(buf[i]);
        i += 2;
        if (digits.length === 12) break;
      }

      if (digits.length === 12) {
        const value = parsePacket(digits.join(""));
        if (value >= 0) {
          this.collapsed = buf.slice(i + 1);
          this.emitPacket(value);
        }
        return;
      }
    }
  }

  private emitPacket(value: number): void {
    const isHighHalf = value < 32;
    const packet: ReceivedPacket = { value, isHighHalf, at: Date.now() };
    this.packetHandlers.forEach((h) => h(packet));

    if (isHighHalf) {
      this.lastEmittedHigh = packet;
      return;
    }

    if (this.lastEmittedHigh && packet.at - this.lastEmittedHigh.at < 2000) {
      const command = combinePacketValues(this.lastEmittedHigh.value, value);
      this.commandHandlers.forEach((h) => h({ command, at: packet.at }));
      this.lastEmittedHigh = null;
    }
  }
}

/** Turns getUserMedia/AudioWorklet failures into messages worth showing a user. */
export function friendlyReceiverError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : undefined;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Microphone permission was denied. Allow it in your browser/site settings and try again.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone was found on this device.";
    case "NotReadableError":
      return "The microphone is busy or unavailable (another app may be using it).";
    case "NotSupportedError":
      return err instanceof Error && err.message
        ? err.message
        : "This browser doesn't support the audio features needed to listen.";
    case "AbortError":
      return "Couldn't load the audio listener module - try reloading the page.";
    default:
      return err instanceof Error ? err.message : String(err);
  }
}
