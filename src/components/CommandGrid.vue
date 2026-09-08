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
        :title="cmd.label + ' (#' + cmd.id + '): ' + cmd.description"
        @click="store.send(cmd.id)"
      >
        <span class="cmd-label">{{ cmd.label }}</span>
        <span class="cmd-id">#{{ cmd.id }}</span>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.65rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
}
.cmd-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--accent);
}
.cmd-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.cmd-label {
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}
.cmd-id {
  font-size: 0.72rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.cmd-btn.busy {
  background: var(--accent);
  color: white;
  border-color: transparent;
}
.cmd-btn.busy .cmd-id {
  color: rgba(255, 255, 255, 0.85);
}
.cmd-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.cmd-btn.busy:disabled {
  opacity: 1;
}
</style>
