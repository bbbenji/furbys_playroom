<script setup lang="ts">
import { computed, ref } from "vue";
import { PHRASEBOOK } from "../comair/phrasebook";
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();
const query = ref("");
const selectedTag = ref<string | null>(null);
const expanded = ref(false);

const QUICK_TAGS = [
  { label: "All", value: null },
  { label: "👋 Greetings", value: "kah" },
  { label: "❓ Questions", value: "?" },
  { label: "🍕 Food", value: "yum" },
  { label: "🎶 Songs & Fun", value: "song" },
  { label: "💖 Love & Happy", value: "love" },
] as const;

function selectTag(tag: string | null) {
  selectedTag.value = tag;
  expanded.value = false;
}

const matchingPhrases = computed(() => {
  const q = query.value.trim().toLowerCase();
  const tag = selectedTag.value?.toLowerCase() ?? "";

  return PHRASEBOOK.filter((e) => {
    const matchesQuery =
      !q ||
      String(e.id).includes(q) ||
      e.english.toLowerCase().includes(q) ||
      e.furbish.toLowerCase().includes(q);

    const matchesTag =
      !tag ||
      e.english.toLowerCase().includes(tag) ||
      e.furbish.toLowerCase().includes(tag);

    return matchesQuery && matchesTag;
  });
});

const displayedPhrases = computed(() =>
  expanded.value ? matchingPhrases.value : matchingPhrases.value.slice(0, 30),
);

function toggleExpanded() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <section class="phrasebook">
    <div class="phrasebook-header">
      <h2>Furbish phrasebook</h2>
      <span class="count-badge">
        Showing {{ displayedPhrases.length }} of {{ matchingPhrases.length }}
      </span>
    </div>
    <p class="hint">
      {{ PHRASEBOOK.length }} known response codes, straight from Hacksby's
      reverse-engineered dictionary. Sending one isn't guaranteed to do
      anything, but many work as prompts.
    </p>

    <!-- Quick Filter Chips -->
    <div class="tag-chips" role="group" aria-label="Phrase Categories">
      <button
        v-for="tag in QUICK_TAGS"
        :key="tag.label"
        type="button"
        class="chip-btn"
        :class="{ active: selectedTag === tag.value }"
        @click="selectTag(tag.value)"
      >
        {{ tag.label }}
      </button>
    </div>

    <input
      v-model="query"
      type="search"
      placeholder="Search by id, English, or Furbish…"
      class="search"
      aria-label="Search phrasebook"
    />

    <p v-if="matchingPhrases.length === 0" class="no-matches">
      No phrases matched your search.
    </p>

    <ul v-else class="entries">
      <li v-for="e in displayedPhrases" :key="e.id">
        <span class="id">#{{ e.id }}</span>
        <span class="text">
          <span class="english">{{ e.english }}</span>
          <span class="furbish">{{ e.furbish }}</span>
        </span>
        <button
          class="send"
          :class="{ busy: store.sending === e.id }"
          :disabled="store.sending !== null"
          :title="'Send phrase #' + e.id"
          @click="store.send(e.id)"
        >
          {{ store.sending === e.id ? "Sending..." : "Send" }}
        </button>
      </li>
    </ul>

    <button
      v-if="matchingPhrases.length > 30"
      type="button"
      class="more"
      @click="toggleExpanded"
    >
      {{
        expanded
          ? "Show fewer (top 30)"
          : `Show all ${matchingPhrases.length} matches`
      }}
    </button>
  </section>
</template>

<style scoped>
.phrasebook {
  margin-bottom: 1.5rem;
}
.phrasebook-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}
h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0;
}
.count-badge {
  font-size: 0.76rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.hint {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  color: var(--muted);
}
.tag-chips {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}
.chip-btn {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip-btn:hover {
  color: var(--text);
  background: var(--surface-hover);
}
.chip-btn.active {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.search {
  width: 100%;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
}
.search:focus {
  border-color: var(--accent);
}
.no-matches {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0.5rem 0;
}
.entries {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.entries li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.85rem;
}
.id {
  color: var(--muted);
  flex-shrink: 0;
  width: 3.2em;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.english {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.furbish {
  color: var(--muted);
  font-size: 0.78rem;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.send {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.12s ease;
}
.send:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--accent);
}
.send.busy {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.send.busy:disabled {
  opacity: 1;
}
.more {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.82rem;
  text-decoration: underline;
  padding: 0;
}
.more:hover {
  opacity: 0.85;
}
</style>
