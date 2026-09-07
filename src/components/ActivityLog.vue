<script setup lang="ts">
import { useFurbyStore } from '../stores/furby'

const store = useFurbyStore()

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}
</script>

<template>
  <section class="log-section">
    <div class="log-header">
      <h2>Activity</h2>
      <button v-if="store.log.length > 0" class="clear" @click="store.clearLog">Clear</button>
    </div>
    <p v-if="store.log.length === 0" class="empty">Nothing sent or heard yet.</p>
    <ul class="log">
      <li v-for="entry in store.log" :key="entry.id" :class="entry.direction">
        <span class="dir">{{ entry.direction === 'tx' ? '→' : '←' }}</span>
        <span class="label">{{ entry.label }}</span>
        <span class="id">#{{ entry.command }}</span>
        <span class="time">{{ formatTime(entry.at) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 0.6rem;
}
.log-section h2 {
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
.empty {
  color: var(--muted);
  font-size: 0.9rem;
}
.log {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 260px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.log li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.85rem;
}
.log li.rx {
  border-left: 3px solid var(--accent-2);
}
.log li.tx {
  border-left: 3px solid var(--accent);
}
.dir {
  font-weight: bold;
  opacity: 0.7;
}
.label {
  flex: 1;
}
.id {
  color: var(--muted);
}
.time {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
</style>
