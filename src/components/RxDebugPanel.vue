<script setup lang="ts">
import { computed, ref } from "vue";
import { DEFAULT_RX_THRESHOLD, useFurbyStore } from "../stores/furby";

const store = useFurbyStore();

const SYMBOLS = [
  { symbol: "0", freq: "16.4 kHz", label: "0" },
  { symbol: "1", freq: "16.9 kHz", label: "1" },
  { symbol: "X", freq: "17.5 kHz", label: "X" },
  { symbol: "3", freq: "18.1 kHz", label: "3" },
  { symbol: "2", freq: "18.6 kHz", label: "2" },
] as const;

const isTestingTone = ref(false);

/** Auto-ranges the meters to whatever signal is actually present, with a
 * small floor so a silent room doesn't make every bar look maxed out. */
const maxMagnitude = computed(() => {
  const values = Object.values(store.rxMagnitudes);
  const observedMax = values.length ? Math.max(...values) : 0;
  return Math.max(observedMax, store.rxThreshold * 2, 0.02);
});

function barPercent(symbol: string): number {
  const mag = store.rxMagnitudes[symbol] ?? 0;
  return Math.min(100, (mag / maxMagnitude.value) * 100);
}

const thresholdPercent = computed(() =>
  Math.min(100, (store.rxThreshold / maxMagnitude.value) * 100),
);

function isOverThreshold(symbol: string): boolean {
  return (store.rxMagnitudes[symbol] ?? 0) >= store.rxThreshold;
}

const hasActiveTone = computed(() =>
  SYMBOLS.some((s) => isOverThreshold(s.symbol)),
);

async function runSelfTest() {
  isTestingTone.value = true;
  if (!store.micActive) {
    await store.toggleMic();
  }
  store.playTestTone(17500, 350);
  setTimeout(() => {
    isTestingTone.value = false;
  }, 600);
}

function onThresholdInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value);
  if (Number.isFinite(value) && value >= 0) store.setRxThreshold(value);
}

function resetThreshold() {
  store.setRxThreshold(DEFAULT_RX_THRESHOLD);
}
</script>

<template>
  <section class="rx-debug">
    <div class="rx-header">
      <h2>RX signal debug</h2>
      <button
        type="button"
        class="test-tone-btn"
        :class="{ active: isTestingTone }"
        :disabled="isTestingTone"
        title="Plays a safe 17.5 kHz pip through your speaker to test if your mic can detect ultrasonic audio"
        @click="runSelfTest"
      >
        <span aria-hidden="true">🔊</span>
        <span>{{ isTestingTone ? "Playing 17.5 kHz..." : "Test Mic (17.5 kHz)" }}</span>
      </button>
    </div>

    <p class="hint">
      Live Goertzel magnitude per tone from the mic. Furby's ComAir carrier sits
      at 17.5 kHz ('X'), with data digits at 16.4, 16.9, 18.1, and 18.6 kHz.
    </p>

    <div v-if="!store.micActive" class="idle-note">
      Mic is currently off. Tap <strong>Enable mic</strong> above or <strong>Test Mic</strong> to start monitoring.
    </div>
    <div v-else class="status-banner" :class="{ hearing: hasActiveTone }">
      <span class="status-dot" aria-hidden="true"></span>
      <span v-if="hasActiveTone">
        Tone detected! Strongest: <strong>{{ store.rxSymbol }}</strong> (cleared {{ store.rxThreshold.toFixed(4) }} threshold)
      </span>
      <span v-else>
        Listening for Furby... (quiet / room ambient)
      </span>
    </div>

    <div class="meters">
      <div
        v-for="item in SYMBOLS"
        :key="item.symbol"
        class="meter"
        :class="{ current: store.rxSymbol === item.symbol }"
      >
        <div class="meter-track">
          <div
            class="threshold-line"
            :style="{ bottom: thresholdPercent + '%' }"
            title="Detection threshold"
          />
          <div
            class="meter-fill"
            :class="{ over: isOverThreshold(item.symbol) }"
            :style="{ height: barPercent(item.symbol) + '%' }"
          />
        </div>
        <span class="meter-label">{{ item.label }}</span>
        <span class="meter-freq">{{ item.freq }}</span>
        <span class="meter-value">
          {{ (store.rxMagnitudes[item.symbol] ?? 0).toFixed(4) }}
        </span>
      </div>
    </div>

    <div class="threshold-control">
      <label for="rx-threshold">
        Detection threshold: <strong>{{ store.rxThreshold.toFixed(4) }}</strong>
      </label>
      <div class="threshold-inputs">
        <input
          id="rx-threshold"
          type="range"
          min="0"
          max="0.1"
          step="0.001"
          :value="store.rxThreshold"
          @input="onThresholdInput"
        />
        <input
          type="number"
          min="0"
          step="0.001"
          class="threshold-number"
          :value="store.rxThreshold"
          aria-label="Detection threshold (exact value)"
          @input="onThresholdInput"
        />
        <button type="button" class="reset-btn" @click="resetThreshold">
          Reset
        </button>
      </div>
      <p class="threshold-hint">
        A tone only counts as "heard" once its bar clears the red line.
        Too low: ambient room noise causes false packets. Too high: real Furby tones get missed.
      </p>
    </div>
  </section>
</template>

<style scoped>
.rx-debug {
  margin-bottom: 1.5rem;
}
.rx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}
h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0;
}
.test-tone-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.test-tone-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--accent);
}
.test-tone-btn.active {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.test-tone-btn:disabled {
  opacity: 0.8;
  cursor: wait;
}
.status-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.8rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.82rem;
  color: var(--muted);
  transition: all 0.15s ease;
}
.status-banner.hearing {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
  color: var(--text);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}
.status-banner.hearing .status-dot {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
}
.hint {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  color: var(--muted);
}
.idle-note {
  margin: 0 0 0.8rem;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px dashed var(--border);
  color: var(--muted);
  font-size: 0.82rem;
}
.meter-freq {
  font-size: 0.68rem;
  color: var(--muted);
}
.meters {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}
.meter {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.meter-track {
  position: relative;
  width: 100%;
  height: 100px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
}
.meter.current .meter-track {
  border-color: var(--accent);
}
.meter-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--muted);
  opacity: 0.5;
  transition: height 0.05s linear;
}
.meter-fill.over {
  background: var(--accent-2);
  opacity: 1;
}
.threshold-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed #ef4444;
  z-index: 1;
}
.meter-label {
  font-weight: 700;
  font-size: 0.9rem;
}
.meter-value {
  font-size: 0.7rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.threshold-control {
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.threshold-control label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}
.threshold-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.threshold-inputs input[type="range"] {
  flex: 1;
}
.threshold-number {
  width: 5.5rem;
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.85rem;
}
.reset-btn {
  flex-shrink: 0;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.8rem;
}
.reset-btn:hover {
  background: var(--surface-hover);
}
.threshold-hint {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: var(--muted);
}
</style>
