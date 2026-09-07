<script setup lang="ts">
import type { CommandInfo } from '../comair/commands'
import { useFurbyStore } from '../stores/furby'

defineProps<{
  title: string
  commands: CommandInfo[]
}>()

const store = useFurbyStore()
</script>

<template>
  <section class="grid-section">
    <h2>{{ title }}</h2>
    <div class="grid">
      <button
        v-for="cmd in commands"
        :key="cmd.id"
        class="cmd-btn"
        :class="{ busy: store.sending === cmd.id }"
        :disabled="store.sending !== null"
        :title="cmd.description"
        @click="store.send(cmd.id)"
      >
        {{ cmd.label }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.grid-section {
  margin-bottom: 1.5rem;
}
h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0 0 0.6rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}
.cmd-btn {
  padding: 0.7rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.08s ease, background 0.15s ease;
}
.cmd-btn:hover {
  background: var(--surface-hover);
}
.cmd-btn:active {
  transform: scale(0.96);
}
.cmd-btn.busy {
  background: var(--accent);
  color: white;
}
.cmd-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.cmd-btn.busy:disabled {
  opacity: 1;
}
</style>
