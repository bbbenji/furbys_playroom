<script setup lang="ts">
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function getPersonalityEmoji(id: number): string {
  switch (id) {
    case 901:
      return "👑";
    case 902:
      return "✨";
    case 903:
      return "⚔️";
    case 904:
      return "🃏";
    case 905:
      return "💅";
    case 906:
      return "🧸";
    case 907:
      return "😼";
    case 908:
      return "😏";
    case 909:
      return "😆";
    case 910:
      return "💨";
    case 911:
      return "⏰";
    default:
      return "🐣";
  }
}

async function askPersonality() {
  if (!store.micActive) {
    await store.toggleMic();
  }
  store.send(813);
}
</script>

<template>
  <section class="personality">
    <div class="header">
      <div class="title-wrap">
        <h2>Personality</h2>
        <button
          type="button"
          class="ask-btn"
          :disabled="store.sending !== null || store.micBusy"
          :class="{ busy: store.sending === 813 }"
          title="Sends command #813 to request Furby's current personality (enables mic if needed)"
          @click="askPersonality"
        >
          {{ store.sending === 813 ? "Asking..." : "Ask Furby (#813)" }}
        </button>
      </div>

      <button
        v-if="store.personalityHistory.length > 0"
        class="clear"
        @click="store.clearPersonalityHistory"
      >
        Clear
      </button>
    </div>

    <div v-if="store.currentPersonality" class="current">
      <span class="personality-emoji" aria-hidden="true">
        {{ getPersonalityEmoji(store.currentPersonality.id) }}
      </span>
      <div class="current-body">
        <div class="current-title-row">
          <span class="current-label">{{ store.currentPersonality.label }}</span>
          <span class="code-id">#{{ store.currentPersonality.id }}</span>
        </div>
        <span class="current-time">
          Detected at {{ formatTime(store.currentPersonality.at) }}
        </span>
      </div>
    </div>

    <p v-else class="empty">
      No personality received yet. Tap <strong>Ask Furby (#813)</strong> with the mic listening to query your Furby.
    </p>

    <ul v-if="store.personalityHistory.length > 1" class="history">
      <li
        v-for="sighting in store.personalityHistory.slice(1)"
        :key="sighting.at"
      >
        <span class="history-item-label">
          <span aria-hidden="true">{{ getPersonalityEmoji(sighting.id) }}</span>
          <span>{{ sighting.label }} (#{{ sighting.id }})</span>
        </span>
        <span class="time">{{ formatTime(sighting.at) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.personality {
  margin-bottom: 1.5rem;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0;
}
.ask-btn {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ask-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--accent);
}
.ask-btn.busy {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.ask-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ask-btn.busy:disabled {
  opacity: 1;
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
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 0.5rem;
}
.personality-emoji {
  font-size: 1.5rem;
}
.current-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.current-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.current-label {
  font-weight: 700;
  font-size: 1.05rem;
}
.code-id {
  color: var(--muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
.current-time {
  color: var(--muted);
  font-size: 0.78rem;
}
.empty {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0.5rem 0;
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
  -webkit-overflow-scrolling: touch;
}
.history li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  background: var(--surface);
  font-size: 0.8rem;
  color: var(--muted);
}
.history-item-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
