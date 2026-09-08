import { defineStore } from "pinia";
import { describeCommand, isPersonalityResponse } from "../comair/commands";
import { ComAirReceiver, friendlyReceiverError } from "../comair/receiver";
import { ComAirTransmitter } from "../comair/transmitter";

export interface LogEntry {
  id: number;
  direction: "tx" | "rx";
  command: number;
  label: string;
  at: number;
}

export interface PersonalitySighting {
  id: number;
  label: string;
  at: number;
}

const LOG_STORAGE_KEY = "furby-console:log:v1";
const LOG_LIMIT = 200;
const PERSONALITY_STORAGE_KEY = "furby-console:personality:v1";
const PERSONALITY_LIMIT = 50;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function persistJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private browsing) - just won't survive a reload.
  }
}

const initialLog = loadJson<LogEntry[]>(LOG_STORAGE_KEY, []);
let nextLogId =
  initialLog.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;

const initialPersonalityHistory = loadJson<PersonalitySighting[]>(
  PERSONALITY_STORAGE_KEY,
  [],
);

const transmitter = new ComAirTransmitter();
let receiver: ComAirReceiver | null = null;

export type UiMode = "kids" | "console";
export type MascotMood =
  | "idle"
  | "happy"
  | "eating"
  | "farting"
  | "sleeping"
  | "singing"
  | "surprised"
  | "talking";

const UI_MODE_STORAGE_KEY = "furby-console:mode:v1";
const SOUND_FX_STORAGE_KEY = "furby-console:soundfx:v1";
const READ_ALOUD_STORAGE_KEY = "furby-console:readaloud:v1";
const HAPTICS_STORAGE_KEY = "furby-console:haptics:v1";
const RX_THRESHOLD_STORAGE_KEY = "furby-console:rxthreshold:v1";

/** Default Goertzel magnitude a tone needs to clear to count as "heard" - see ComAirReceiver. */
export const DEFAULT_RX_THRESHOLD = 0.01;

const initialMode: UiMode =
  (localStorage.getItem(UI_MODE_STORAGE_KEY) as UiMode) || "kids";
const initialSoundFx = localStorage.getItem(SOUND_FX_STORAGE_KEY) !== "0";
const initialReadAloud = localStorage.getItem(READ_ALOUD_STORAGE_KEY) === "1";
const initialHaptics = localStorage.getItem(HAPTICS_STORAGE_KEY) !== "0";
const initialRxThreshold = (() => {
  const parsed = Number(localStorage.getItem(RX_THRESHOLD_STORAGE_KEY));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RX_THRESHOLD;
})();

let moodTimer: ReturnType<typeof setTimeout> | null = null;

function getMoodForCommand(cmd: number): MascotMood {
  if (cmd === 865) return "farting";
  if (cmd === 864) return "surprised";
  if (cmd === 863 || cmd === 866) return "happy";
  if (cmd === 867) return "surprised";
  if (
    cmd === 868 ||
    cmd === 721 ||
    cmd === 722 ||
    cmd === 723 ||
    cmd === 724 ||
    cmd === 889
  )
    return "singing";
  if (cmd === 869 || cmd === 813) return "talking";
  if (cmd === 862 || cmd === 718) return "sleeping";
  if ((cmd >= 350 && cmd <= 360) || cmd === 372 || cmd === 417) return "eating";
  return "happy";
}

export const useFurbyStore = defineStore("furby", {
  state: () => ({
    uiMode: initialMode as UiMode,
    soundFxEnabled: initialSoundFx,
    readAloudEnabled: initialReadAloud,
    hapticsEnabled: initialHaptics,
    mascotMood: "idle" as MascotMood,
    keepAliveActive: false,
    micActive: false,
    micError: null as string | null,
    sendError: null as string | null,
    log: initialLog as LogEntry[],
    personalityHistory: initialPersonalityHistory as PersonalitySighting[],
    sending: null as number | null,
    rxThreshold: initialRxThreshold as number,
    /** Live per-tone Goertzel magnitudes from the current mic window, for the RX debug view. Empty while mic is off. */
    rxMagnitudes: {} as Record<string, number>,
    /** Whichever tone was strongest in the most recent mic window (regardless of threshold). */
    rxSymbol: null as string | null,
  }),

  getters: {
    currentPersonality(state): PersonalitySighting | null {
      return state.personalityHistory[0] ?? null;
    },
  },

  actions: {
    _log(direction: "tx" | "rx", command: number) {
      const label = describeCommand(command)?.label ?? `#${command}`;
      this.log.unshift({
        id: nextLogId++,
        direction,
        command,
        label,
        at: Date.now(),
      });
      if (this.log.length > LOG_LIMIT) this.log.length = LOG_LIMIT;
      persistJson(LOG_STORAGE_KEY, this.log);

      if (direction === "rx" && isPersonalityResponse(command)) {
        this._recordPersonality(command, label);
      }
    },

    _recordPersonality(id: number, label: string) {
      // Skip consecutive repeats (e.g. re-confirmed on every keep-alive handshake) -
      // only log actual sightings/transitions.
      if (this.personalityHistory[0]?.id === id) return;
      this.personalityHistory.unshift({ id, label, at: Date.now() });
      if (this.personalityHistory.length > PERSONALITY_LIMIT)
        this.personalityHistory.length = PERSONALITY_LIMIT;
      persistJson(PERSONALITY_STORAGE_KEY, this.personalityHistory);
    },

    clearLog() {
      this.log = [];
      persistJson(LOG_STORAGE_KEY, this.log);
    },

    clearPersonalityHistory() {
      this.personalityHistory = [];
      persistJson(PERSONALITY_STORAGE_KEY, this.personalityHistory);
    },

    setUiMode(mode: UiMode) {
      this.uiMode = mode;
      try {
        localStorage.setItem(UI_MODE_STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    },

    toggleSoundFx() {
      this.soundFxEnabled = !this.soundFxEnabled;
      try {
        localStorage.setItem(
          SOUND_FX_STORAGE_KEY,
          this.soundFxEnabled ? "1" : "0",
        );
      } catch {
        // ignore
      }
    },

    toggleReadAloud() {
      this.readAloudEnabled = !this.readAloudEnabled;
      try {
        localStorage.setItem(
          READ_ALOUD_STORAGE_KEY,
          this.readAloudEnabled ? "1" : "0",
        );
      } catch {
        // ignore
      }
    },

    toggleHaptics() {
      this.hapticsEnabled = !this.hapticsEnabled;
      try {
        localStorage.setItem(
          HAPTICS_STORAGE_KEY,
          this.hapticsEnabled ? "1" : "0",
        );
      } catch {
        // ignore
      }
    },

    triggerMascotReaction(mood: MascotMood, durationMs = 2500) {
      if (moodTimer) clearTimeout(moodTimer);
      this.mascotMood = mood;
      moodTimer = setTimeout(() => {
        this.mascotMood = "idle";
      }, durationMs);
    },

    /** Call synchronously on the very first tap anywhere in the app (iOS/Safari autoplay gate). */
    unlockAudio() {
      transmitter.unlock();
    },

    async send(command: number) {
      // Ignore taps while a command is already in flight - each one queues
      // behind the last through ComAirPlayer's serialized playback, so
      // spamming buttons would just pile up a long backlog of sounds rather
      // than doing anything useful.
      if (this.sending !== null) return;

      this.sending = command;
      this.sendError = null;
      try {
        // Furby ignores most commands outside its ~60s listening window. The
        // official app kept this refreshed silently in the background the
        // whole time it was open rather than exposing it as a user-facing
        // step (that's the only reason we know the 35s re-send interval at
        // all - see KEEP_ALIVE_INTERVAL_MS) - so ensure it here rather than
        // requiring a separate "wake up" tap first.
        if (!transmitter.keepAliveActive) {
          await this._startKeepAlive();
          if (this.sendError) return;
        }

        this.triggerMascotReaction(getMoodForCommand(command));
        await transmitter.send(command);
        this._log("tx", command);
      } catch (err) {
        this.sendError = err instanceof Error ? err.message : String(err);
      } finally {
        this.sending = null;
      }
    },

    /** Plays a short ultrasonic calibration pip for hardware/microphone loopback testing. */
    playTestTone(freq = 17500, durationMs = 300) {
      this.unlockAudio();
      if (typeof window === "undefined") return;
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      try {
        const ctx = new Ctor();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
        gain.gain.setValueAtTime(0.35, now + durationMs / 1000 - 0.04);
        gain.gain.linearRampToValueAtTime(0.001, now + durationMs / 1000);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durationMs / 1000 + 0.05);
        setTimeout(() => {
          void ctx.close().catch(() => {});
        }, durationMs + 200);
      } catch {
        // ignore
      }
    },

    /** Starts the keep-alive daemon; errors are surfaced via sendError rather than thrown. */
    async _startKeepAlive() {
      try {
        await transmitter.startKeepAlive();
        this._log("tx", 820);
        this.keepAliveActive = true;
        this.triggerMascotReaction("happy", 2500);
      } catch (err) {
        this.sendError = err instanceof Error ? err.message : String(err);
      }
    },

    /** Manual override, still exposed in Pro Console for explicit control/debugging. */
    async toggleKeepAlive() {
      if (transmitter.keepAliveActive) {
        transmitter.stopKeepAlive();
        this.keepAliveActive = false;
        this.triggerMascotReaction("sleeping", 2000);
        return;
      }

      this.sendError = null;
      await this._startKeepAlive();
    },

    async toggleMic() {
      if (this.micActive) {
        receiver?.stop();
        receiver = null;
        this.micActive = false;
        this.rxMagnitudes = {};
        this.rxSymbol = null;
        return;
      }

      this.micError = null;
      try {
        receiver = new ComAirReceiver(this.rxThreshold);
        receiver.onCommand(({ command }) => this._log("rx", command));
        receiver.onSymbol(({ symbol, magnitudes }) => {
          this.rxSymbol = symbol;
          this.rxMagnitudes = magnitudes;
        });
        await receiver.start();
        this.micActive = true;
      } catch (err) {
        this.micError = friendlyReceiverError(err);
        receiver = null;
        this.micActive = false;
      }
    },

    /** Live-tunable from the RX debug panel while the mic is running, not just at start. */
    setRxThreshold(value: number) {
      this.rxThreshold = value;
      if (receiver) receiver.magnitudeThreshold = value;
      try {
        localStorage.setItem(RX_THRESHOLD_STORAGE_KEY, String(value));
      } catch {
        // ignore
      }
    },
  },
});
