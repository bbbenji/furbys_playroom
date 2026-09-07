<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>

<template>
  <span class="mascot-wrap" :class="{ active }">
    <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
      <ellipse cx="14" cy="20" rx="9" ry="13" fill="var(--accent)" transform="rotate(-25 14 20)" />
      <ellipse cx="50" cy="20" rx="9" ry="13" fill="var(--accent)" transform="rotate(25 50 20)" />
      <ellipse cx="14" cy="20" rx="4.5" ry="7" fill="#f9a8d4" transform="rotate(-25 14 20)" />
      <ellipse cx="50" cy="20" rx="4.5" ry="7" fill="#f9a8d4" transform="rotate(25 50 20)" />
      <circle cx="32" cy="36" r="22" fill="#8b5cf6" />
      <path d="M20 24 Q24 20 28 23" stroke="#3b0764" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M44 24 Q40 20 36 23" stroke="#3b0764" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <g class="eyes">
        <circle cx="24" cy="34" r="8" fill="#fff" />
        <circle cx="40" cy="34" r="8" fill="#fff" />
        <circle cx="24" cy="36" r="4" fill="#1a1a22" />
        <circle cx="40" cy="36" r="4" fill="#1a1a22" />
        <circle cx="22.5" cy="34.5" r="1.3" fill="#fff" />
        <circle cx="38.5" cy="34.5" r="1.3" fill="#fff" />
      </g>
      <path d="M26 44 Q32 42 38 44 Q36 53 32 55 Q28 53 26 44 Z" fill="#fb923c" />
      <path d="M32 45 L32 52" stroke="#c2410c" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </span>
</template>

<style scoped>
.mascot-wrap {
  display: inline-flex;
  flex-shrink: 0;
}
.mascot-wrap.active {
  animation: bounce 0.5s ease-in-out infinite;
}
.eyes {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 5s ease-in-out infinite;
}
@keyframes blink {
  0%, 92%, 100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.12);
  }
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(-4deg);
  }
}
</style>
