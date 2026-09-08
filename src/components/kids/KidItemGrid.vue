<script setup lang="ts">
export interface KidItem {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  sound?: "chew" | "fart" | "boing" | "giggle" | "chime" | "pop";
}

defineProps<{
  items: KidItem[];
  discoveredIds: Set<number>;
  highlightedCardId: number | null;
  sending: number | null;
}>();

const emit = defineEmits<{
  select: [item: KidItem, event: MouseEvent];
}>();
</script>

<template>
  <div class="grid-cards">
    <button
      v-for="item in items"
      :key="item.id"
      class="play-card"
      :class="{
        busy: sending === item.id,
        highlighted: highlightedCardId === item.id,
        discovered: discoveredIds.has(item.id),
      }"
      :disabled="sending !== null"
      :style="{ '--card-color': item.color }"
      @click="emit('select', item, $event)"
    >
      <span class="card-badge" :class="{ found: discoveredIds.has(item.id) }">
        {{ discoveredIds.has(item.id) ? "⭐ Found" : "✨ New" }}
      </span>
      <span class="card-emoji">{{ item.icon }}</span>
      <span class="card-title">{{ item.title }}</span>
      <span class="card-subtitle">{{ item.subtitle }}</span>
    </button>
  </div>
</template>

<style scoped>
.grid-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

@media (min-width: 520px) {
  .grid-cards {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

.play-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.15rem 0.6rem 0.95rem;
  border-radius: 22px;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  color: var(--text);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  overflow: hidden;
  box-shadow: 0 6px 0 var(--card-bevel), var(--card-shadow);
  transition:
    transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.16s ease,
    background 0.16s ease;
}

.play-card:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: var(--card-color);
  box-shadow: 0 9px 0 var(--card-bevel-hover), 0 14px 26px rgba(0, 0, 0, 0.25);
}

.play-card:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 1px 0 var(--card-bevel), 0 4px 10px rgba(0, 0, 0, 0.12);
}

.play-card.busy {
  background: var(--card-color);
  color: #ffffff;
  border-color: transparent;
  transform: translateY(2px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
  animation: cardSquish 0.35s ease-in-out infinite alternate;
}

@keyframes cardSquish {
  0% {
    transform: translateY(2px) scale(0.97);
  }
  100% {
    transform: translateY(2px) scale(1.02);
  }
}

.card-badge {
  position: absolute;
  top: 7px;
  right: 7px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.14rem 0.45rem;
  border-radius: 9999px;
  background: var(--badge-new-bg);
  color: var(--badge-new-color);
  border: 1px solid var(--badge-new-border);
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

.card-badge.found {
  background: var(--badge-found-bg);
  color: var(--badge-found-color);
  border-color: var(--badge-found-border);
}

.play-card.busy .card-badge {
  display: none;
}

.play-card.highlighted {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.6), 0 6px 0 rgba(0, 0, 0, 0.35), 0 10px 24px rgba(245, 158, 11, 0.4);
  animation: surpriseSpotlight 1s ease-in-out infinite alternate;
}

@keyframes surpriseSpotlight {
  0% {
    transform: scale(1.02);
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.4), 0 5px 0 rgba(0, 0, 0, 0.35), 0 8px 18px rgba(245, 158, 11, 0.3);
  }
  100% {
    transform: scale(1.06);
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.8), 0 7px 0 rgba(0, 0, 0, 0.35), 0 12px 28px rgba(245, 158, 11, 0.55);
  }
}

.card-emoji {
  font-size: 2.4rem;
  margin-bottom: 0.3rem;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.2));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.play-card:hover .card-emoji {
  transform: scale(1.18) rotate(4deg);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 800;
  margin-bottom: 0.15rem;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.2;
}

.play-card.busy .card-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.play-card:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
  transform: none;
}

.play-card.busy:disabled {
  opacity: 1;
}

@media (prefers-color-scheme: light) {
  .play-card {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 5px 0 #cbd5e1, 0 6px 16px rgba(148, 163, 184, 0.15);
  }

  .play-card:hover:not(:disabled) {
    border-color: var(--card-color);
    box-shadow: 0 8px 0 #94a3b8, 0 10px 22px rgba(100, 116, 139, 0.2);
  }

  .play-card:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #cbd5e1, 0 2px 6px rgba(100, 116, 139, 0.12);
  }

  .play-card.discovered {
    border-color: #86efac;
  }

  .card-title {
    color: #0f172a;
  }

  .card-subtitle {
    color: #64748b;
  }
}
</style>
