<script setup lang="ts">
import { computed, ref } from "vue";
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();

type DirectionFilter = "all" | "tx" | "rx";
const filter = ref<DirectionFilter>("all");
const copied = ref(false);

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

const txCount = computed(
  () => store.log.filter((e) => e.direction === "tx").length,
);
const rxCount = computed(
  () => store.log.filter((e) => e.direction === "rx").length,
);

const filteredLog = computed(() => {
  if (filter.value === "tx") {
    return store.log.filter((e) => e.direction === "tx");
  }
  if (filter.value === "rx") {
    return store.log.filter((e) => e.direction === "rx");
  }
  return store.log;
});

async function copyLog() {
  if (store.log.length === 0) return;
  const text = store.log
    .map(
      (e) =>
        `[${formatTime(e.at)}] ${e.direction.toUpperCase()} #${e.command}: ${e.label}`,
    )
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // fallback or ignore
  }
}
</script>

<template>
  <section class="log-section">
    <div class="log-header">
      <div class="title-group">
        <h2>Activity</h2>
        <span v-if="store.log.length > 0" class="log-count">
          {{ store.log.length }} events
        </span>
      </div>

      <div class="action-buttons">
        <button
          v-if="store.log.length > 0"
          type="button"
          class="action-link"
          :title="'Copy ' + store.log.length + ' entries to clipboard'"
          @click="copyLog"
        >
          {{ copied ? "✓ Copied" : "Copy Log" }}
        </button>
        <button
          v-if="store.log.length > 0"
          type="button"
          class="action-link clear"
          @click="store.clearLog"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Filter chips -->
    <div v-if="store.log.length > 0" class="log-filters" role="group" aria-label="Log direction filters">
      <button
        type="button"
        class="filter-pill"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        All ({{ store.log.length }})
      </button>
      <button
        type="button"
        class="filter-pill"
        :class="{ active: filter === 'tx' }"
        @click="filter = 'tx'"
      >
        Sent TX ({{ txCount }})
      </button>
      <button
        type="button"
        class="filter-pill"
        :class="{ active: filter === 'rx' }"
        @click="filter = 'rx'"
      >
        Heard RX ({{ rxCount }})
      </button>
    </div>

    <p v-if="store.log.length === 0" class="empty">
      Nothing sent or heard yet. Tap any command or test tone to begin.
    </p>
    <p v-else-if="filteredLog.length === 0" class="empty">
      No {{ filter.toUpperCase() }} events recorded yet.
    </p>

    <ul v-else class="log">
      <li v-for="entry in filteredLog" :key="entry.id" :class="entry.direction">
        <span class="dir-badge" :class="entry.direction">
          {{ entry.direction === "tx" ? "TX →" : "← RX" }}
        </span>
        <span class="label">{{ entry.label }}</span>
        <span class="id">#{{ entry.command }}</span>
        <span class="time">{{ formatTime(entry.at) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.log-section {
  margin-bottom: 1.5rem;
}
.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 0.5rem;
}
.title-group {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.log-section h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0;
}
.log-count {
  font-size: 0.75rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.action-link {
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.action-link.clear {
  color: var(--muted);
  text-decoration: underline;
}
.action-link:hover {
  opacity: 0.85;
}
.log-filters {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}
.filter-pill {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.12s ease;
}
.filter-pill:hover {
  color: var(--text);
  background: var(--surface-hover);
}
.filter-pill.active {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.empty {
  color: var(--muted);
  font-size: 0.88rem;
  margin: 0.5rem 0;
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
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.85rem;
  border-left: 3px solid transparent;
}
.log li.rx {
  border-left-color: var(--accent-2);
}
.log li.tx {
  border-left-color: var(--accent);
}
.dir-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.dir-badge.tx {
  background: rgba(124, 58, 237, 0.18);
  color: #a78bfa;
}
.dir-badge.rx {
  background: rgba(34, 197, 94, 0.18);
  color: #4ade80;
}
.label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.id {
  color: var(--muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
.time {
  color: var(--muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}
</style>
