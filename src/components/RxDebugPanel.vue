<script setup lang="ts">
import { computed } from "vue";
import { DEFAULT_RX_THRESHOLD, useFurbyStore } from "../stores/furby";

const store = useFurbyStore();

const SYMBOLS = ["X", "0", "1", "2", "3"] as const;

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
    <h2>RX signal debug</h2>
    <p class="hint">
      Live Goertzel magnitude per tone, straight from the mic - this is the
      raw signal "Ask Furby's Mood" and RX in general depend on. Enable the
      mic above, hold your phone near Furby while it's talking, and watch
      which bars actually move.
    </p>

    <p v-if="!store.micActive" class="idle-note">
      Mic is off - enable it above to see live signal.
    </p>

    <div class="meters">
      <div
        v-for="symbol in SYMBOLS"
        :key="symbol"
        class="meter"
        :class="{ current: store.rxSymbol === symbol }"
      >
        <div class="meter-track">
          <div class="threshold-line" :style="{ bottom: thresholdPercent + '%' }" />
          <div
            class="meter-fill"
            :class="{ over: isOverThreshold(symbol) }"
            :style="{ height: barPercent(symbol) + '%' }"
          />
        </div>
        <span class="meter-label">{{ symbol }}</span>
        <span class="meter-value">{{ (store.rxMagnitudes[symbol] ?? 0).toFixed(4) }}</span>
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
        A tone only counts as "heard" once its bar clears the dashed line.
        Too low and noise gets picked up as false symbols; too high and real
        tones get missed.
      </p>
    </div>
  </section>
</template>

<style scoped>
.rx-debug {
  margin-bottom: 1.5rem;
}
h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0 0 0.4rem;
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
