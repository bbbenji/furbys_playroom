<script setup lang="ts">
import { onMounted } from "vue";
import ActivityLog from "./components/ActivityLog.vue";
import CommandGrid from "./components/CommandGrid.vue";
import KidsView from "./components/kids/KidsView.vue";
import { playPop } from "./components/kids/soundFx";
import OnboardingHint from "./components/OnboardingHint.vue";
import PersonalityTracker from "./components/PersonalityTracker.vue";
import Phrasebook from "./components/Phrasebook.vue";
import PwaToast from "./components/PwaToast.vue";
import RawSender from "./components/RawSender.vue";
import RxDebugPanel from "./components/RxDebugPanel.vue";
import { ACTIONS, EXPERIMENTAL, FOOD, REQUESTS } from "./comair/commands";
import { useFurbyStore, type UiMode } from "./stores/furby";

const store = useFurbyStore();

function switchMode(mode: UiMode) {
  if (store.uiMode !== mode) {
    if (store.soundFxEnabled) playPop();
    store.setUiMode(mode);
  }
}

// iOS/Safari suspends new AudioContexts until a resume() happens inside a
// user gesture's call stack; unlocking on the very first tap anywhere means
// the first real command tap already has an unsuspended context to use.
onMounted(() => {
  window.addEventListener("pointerdown", () => store.unlockAudio(), {
    once: true,
  });
});
</script>

<template>
  <header>
    <div class="header-main">
      <div>
        <h1>
          {{ store.uiMode === "kids" ? "Furby's Playroom" : "Furby Console" }}
        </h1>
        <p class="subtitle">
          {{
            store.uiMode === "kids"
              ? "Magic sound remote for your Furby toy!"
              : "Acoustic ComAir remote for 2012 / Furby Boom toys. Point speaker at Furby's chest, volume ~80%."
          }}
        </p>
      </div>
    </div>

    <!-- Mode Selector Navigation -->
    <nav class="mode-bar" aria-label="Mode Switcher">
      <button
        class="mode-tab"
        :class="{ active: store.uiMode === 'kids' }"
        @click="switchMode('kids')"
      >
        <span class="mode-icon">🧸</span>
        <span>Kids Playroom</span>
      </button>
      <button
        class="mode-tab"
        :class="{ active: store.uiMode === 'console' }"
        @click="switchMode('console')"
      >
        <span class="mode-icon">🎛️</span>
        <span>Pro Console</span>
      </button>
    </nav>
  </header>

  <main>
    <Transition name="view-fade" mode="out-in">
      <!-- Kids Friendly Playroom UI -->
      <KidsView v-if="store.uiMode === 'kids'" />

      <!-- Pro Developer / Technical Console UI -->
      <div v-else class="console-view">
        <OnboardingHint />

        <section class="power-row">
          <button
            class="power-btn"
            :class="{ on: store.keepAliveActive }"
            @click="store.toggleKeepAlive"
          >
            {{
              store.keepAliveActive
                ? "Listening mode: ON"
                : "Enable listening mode"
            }}
          </button>
          <button
            class="power-btn"
            :class="{ on: store.micActive }"
            @click="store.toggleMic"
          >
            {{ store.micActive ? "Mic: listening" : "Enable mic (hear Furby)" }}
          </button>
        </section>
        <p v-if="store.micError" class="error">
          Mic error: {{ store.micError }}
        </p>
        <p v-if="store.sendError" class="error">
          Send error: {{ store.sendError }}
        </p>

        <PersonalityTracker />
        <RxDebugPanel />

        <CommandGrid title="Requests" :commands="REQUESTS" />
        <CommandGrid title="Actions" :commands="ACTIONS" />
        <CommandGrid title="Food" :commands="FOOD" />
        <CommandGrid
          title="Experimental (uncertain effects)"
          :commands="EXPERIMENTAL"
        />
        <Phrasebook />
        <RawSender />
        <ActivityLog />
      </div>
    </Transition>
  </main>

  <footer>
    Protocol reverse-engineered by the
    <a href="https://github.com/iafan/Hacksby" target="_blank" rel="noreferrer"
      >Hacksby</a
    >
    project. Educational use - no affiliation with Hasbro.
  </footer>

  <PwaToast />
</template>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.2rem;
}
.header-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
h1 {
  margin: 0 0 0.3rem;
  font-size: 1.4rem;
}
.subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.35;
}
.mode-bar {
  display: flex;
  gap: 0.4rem;
  background: var(--surface);
  padding: 0.35rem;
  border-radius: 14px;
  border: 1px solid var(--border);
}
.mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}
.mode-tab:hover {
  color: var(--text);
}
.mode-tab.active {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.mode-tab:first-child.active {
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.22),
    rgba(236, 72, 153, 0.18)
  );
  border-color: rgba(168, 85, 247, 0.4);
}
.mode-tab:last-child.active {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.22),
    rgba(139, 92, 246, 0.18)
  );
  border-color: rgba(99, 102, 241, 0.4);
}
.mode-icon {
  font-size: 1.15rem;
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
