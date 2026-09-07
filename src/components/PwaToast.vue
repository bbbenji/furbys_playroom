<script setup lang="ts">
import { dismissPwaToast, needRefresh, offlineReady, reloadApp } from "../pwa";
</script>

<template>
  <div v-if="offlineReady || needRefresh" class="pwa-toast" role="status">
    <span v-if="needRefresh">A new version is ready.</span>
    <span v-else>Installed - works offline now.</span>
    <button v-if="needRefresh" class="reload" @click="reloadApp">Reload</button>
    <button class="dismiss" aria-label="Dismiss" @click="dismissPwaToast">
      ✕
    </button>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  left: 1rem;
  right: 1rem;
  bottom: max(1rem, env(safe-area-inset-bottom));
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  font-size: 0.85rem;
  z-index: 50;
}
.pwa-toast span {
  flex: 1;
}
.reload {
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  margin-block: -0.6rem;
  margin-right: -0.4rem;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
</style>
