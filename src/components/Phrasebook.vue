<script setup lang="ts">
import { computed, ref } from "vue";
import { PHRASEBOOK } from "../comair/phrasebook";
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();
const query = ref("");
const expanded = ref(false);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const list = q
    ? PHRASEBOOK.filter(
        (e) =>
          String(e.id).includes(q) ||
          e.english.toLowerCase().includes(q) ||
          e.furbish.toLowerCase().includes(q),
      )
    : PHRASEBOOK;
  return expanded.value ? list : list.slice(0, 30);
});
</script>

<template>
  <section class="phrasebook">
    <h2>Furbish phrasebook</h2>
    <p class="hint">
      {{ PHRASEBOOK.length }} known response codes, straight from Hacksby's
      reverse-engineered dictionary. These are mostly things Furby says on its
      own - sending one isn't guaranteed to do anything, but many do work as
      prompts.
    </p>
    <input
      v-model="query"
      type="search"
      placeholder="Search by id, English, or Furbish…"
      class="search"
    />
    <ul class="entries">
      <li v-for="e in filtered" :key="e.id">
        <span class="id">#{{ e.id }}</span>
        <span class="text">
          <span class="english">{{ e.english }}</span>
          <span class="furbish">{{ e.furbish }}</span>
        </span>
        <button
          class="send"
          :class="{ busy: store.sending === e.id }"
          @click="store.send(e.id)"
        >
          Send
        </button>
      </li>
    </ul>
    <button
      v-if="!expanded && filtered.length < PHRASEBOOK.length"
      class="more"
      @click="expanded = true"
    >
      Show all {{ query ? "matches" : PHRASEBOOK.length }}
    </button>
  </section>
</template>

<style scoped>
.phrasebook {
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
.search {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
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
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.8rem;
}
.send.busy {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.more {
  margin-top: 0.5rem;
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.82rem;
  text-decoration: underline;
  padding: 0;
}
</style>
