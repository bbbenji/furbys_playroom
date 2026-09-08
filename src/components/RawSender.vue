<script setup lang="ts">
import { computed, ref } from "vue";
import { describeCommand } from "../comair/commands";
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();
const value = ref(820);

const commandPreview = computed(() => {
  const n = Math.trunc(value.value);
  if (!Number.isFinite(n) || n < 0 || n > 1023) return null;
  return describeCommand(n);
});

function submit() {
  const n = Math.trunc(value.value);
  if (Number.isFinite(n) && n >= 0 && n <= 1023) {
    store.send(n);
  }
}
</script>

<template>
  <section class="raw-section">
    <h2>Raw command</h2>
    <form class="raw-form" @submit.prevent="submit">
      <input
        v-model.number="value"
        type="number"
        min="0"
        max="1023"
        aria-label="Raw command number (0-1023)"
        placeholder="0-1023"
      />
      <button
        type="submit"
        class="busy-btn"
        :disabled="store.sending !== null"
        :class="{ busy: store.sending === value }"
      >
        {{ store.sending === value ? "Sending..." : "Send" }}
      </button>
    </form>

    <div v-if="commandPreview" class="preview-card">
      <span class="preview-name">💡 #{{ value }}: {{ commandPreview.label }}</span>
      <span class="preview-desc">{{ commandPreview.description }}</span>
    </div>
    <div
      v-else-if="Number.isFinite(value) && value >= 0 && value <= 1023"
      class="preview-card unmapped"
    >
      <span class="preview-name">🔍 #{{ value }}: Undocumented command</span>
      <span class="preview-desc">Effect unknown - safe to explore against physical Furby</span>
    </div>

    <p class="hint">
      Any command in 0–1023. Known commands are automatically labeled above.
    </p>
  </section>
</template>

<style scoped>
.raw-section {
  margin-bottom: 1.5rem;
}
.raw-section h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0 0 0.6rem;
}
.raw-form {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  outline: none;
}
input:focus {
  border-color: var(--accent);
}
button {
  padding: 0.6rem 1.2rem;
  min-height: 44px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
button:hover:not(:disabled) {
  opacity: 0.9;
}
.preview-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.82rem;
}
.preview-card.unmapped {
  border-style: dashed;
}
.preview-name {
  font-weight: 600;
  color: var(--text);
}
.preview-desc {
  color: var(--muted);
  font-size: 0.78rem;
}
.hint {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
