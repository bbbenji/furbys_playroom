<script setup lang="ts">
import { ref } from "vue";
import { useFurbyStore } from "../stores/furby";

const store = useFurbyStore();
const value = ref(820);

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
      <input v-model.number="value" type="number" min="0" max="1023" />
      <button type="submit">Send</button>
    </form>
    <p class="hint">
      Any command in 0-1023. Most of the space is undocumented - see the README
      for what's known.
    </p>
  </section>
</template>

<style scoped>
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
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
}
button {
  padding: 0.6rem 1.1rem;
  min-height: 44px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.hint {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
