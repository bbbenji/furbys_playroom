<script setup lang="ts">
import { onMounted } from 'vue'
import ActivityLog from './components/ActivityLog.vue'
import CommandGrid from './components/CommandGrid.vue'
import FurbyMascot from './components/FurbyMascot.vue'
import OnboardingHint from './components/OnboardingHint.vue'
import PersonalityTracker from './components/PersonalityTracker.vue'
import Phrasebook from './components/Phrasebook.vue'
import PwaToast from './components/PwaToast.vue'
import RawSender from './components/RawSender.vue'
import { ACTIONS, EXPERIMENTAL, FOOD, REQUESTS } from './comair/commands'
import { useFurbyStore } from './stores/furby'

const store = useFurbyStore()

// iOS/Safari suspends new AudioContexts until a resume() happens inside a
// user gesture's call stack; unlocking on the very first tap anywhere means
// the first real command tap already has an unsuspended context to use.
onMounted(() => {
  window.addEventListener('pointerdown', () => store.unlockAudio(), { once: true })
})
</script>

<template>
  <header>
    <FurbyMascot :active="store.sending !== null || store.keepAliveActive" />
    <div>
      <h1>Furby Console</h1>
      <p class="subtitle">
        Acoustic ComAir remote for 2012 / Furby Boom toys. Point your speaker at Furby's chest,
        volume around 80%.
      </p>
    </div>
  </header>

  <OnboardingHint />

  <section class="power-row">
    <button class="power-btn" :class="{ on: store.keepAliveActive }" @click="store.toggleKeepAlive">
      {{ store.keepAliveActive ? 'Listening mode: ON' : 'Enable listening mode' }}
    </button>
    <button class="power-btn" :class="{ on: store.micActive }" @click="store.toggleMic">
      {{ store.micActive ? 'Mic: listening' : 'Enable mic (hear Furby)' }}
    </button>
  </section>
  <p v-if="store.micError" class="error">Mic error: {{ store.micError }}</p>
  <p v-if="store.sendError" class="error">Send error: {{ store.sendError }}</p>

  <PersonalityTracker />

  <CommandGrid title="Requests" :commands="REQUESTS" />
  <CommandGrid title="Actions" :commands="ACTIONS" />
  <CommandGrid title="Food" :commands="FOOD" />
  <CommandGrid title="Experimental (uncertain effects)" :commands="EXPERIMENTAL" />
  <Phrasebook />
  <RawSender />
  <ActivityLog />

  <footer>
    Protocol reverse-engineered by the
    <a href="https://github.com/iafan/Hacksby" target="_blank" rel="noreferrer">Hacksby</a>
    project. Educational use — no affiliation with Hasbro.
  </footer>

  <PwaToast />
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}
h1 {
  margin: 0 0 0.3rem;
  font-size: 1.4rem;
}
.subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.power-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}
.power-btn {
  flex: 1;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
}
.power-btn.on {
  background: var(--accent-2);
  color: white;
  border-color: transparent;
}
.error {
  color: #ef4444;
  font-size: 0.85rem;
}
footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.8rem;
}
footer a {
  color: var(--accent);
}
</style>
