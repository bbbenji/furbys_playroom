<script setup lang="ts">
import { ref } from "vue";

const STORAGE_KEY = "furby-console:onboarding-dismissed";
const dismissed = ref(localStorage.getItem(STORAGE_KEY) === "1");

function dismiss() {
  dismissed.value = true;
  localStorage.setItem(STORAGE_KEY, "1");
}
</script>

<template>
  <p v-if="!dismissed" class="hint">
    New here? Furby ignores most commands unless it's awake - tap
    <strong>Enable listening mode</strong> first.
    <button class="dismiss" aria-label="Dismiss" @click="dismiss">✕</button>
  </p>
</template>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.8rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--text);
}
.dismiss {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0.2rem;
  flex-shrink: 0;
}
</style>
