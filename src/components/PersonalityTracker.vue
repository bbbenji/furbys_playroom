<script setup lang="ts">
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}
</script>

<template>
  <section class="personality">
    <div class="header">
      <h2>Personality</h2>
      <button
        v-if="store.personalityHistory.length > 0"
        class="clear"
        @click="store.clearPersonalityHistory"
      >
        Clear
      </button>
    </div>

    <div v-if="store.currentPersonality" class="current">
      <span class="current-label">{{ store.currentPersonality.label }}</span>
      <span class="current-time"
        >since {{ formatTime(store.currentPersonality.at) }}</span
      >
    </div>
    <p v-else class="empty">
      Unknown yet - send <strong>Ask personality</strong> with the mic listening
      to find out.
    </p>

    <ul v-if="store.personalityHistory.length > 1" class="history">
      <li
        v-for="sighting in store.personalityHistory.slice(1)"
        :key="sighting.at"
      >
        <span>{{ sighting.label }}</span>
        <span class="time">{{ formatTime(sighting.at) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0;
}
.clear {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}
.current {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 0.5rem;
}
.current-label {
  font-weight: 600;
  font-size: 1.05rem;
}
.current-time {
  color: var(--muted);
  font-size: 0.8rem;
}
.empty {
  color: var(--muted);
  font-size: 0.85rem;
}
.history {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 140px;
  overflow-y: auto;
}
.history li {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  background: var(--surface);
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
