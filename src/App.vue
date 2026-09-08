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
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <div class="header-main">
      <div class="title-area">
        <h1>
          {{ store.uiMode === "kids" ? "Furby's Playroom" : "Furby Console" }}
        </h1>
        <!-- Kids mode shows the same awake/mic status as chips right on the
             stage below, so this line + the badges to the right would just
             be a second, redundant readout eating vertical space. -->
        <p v-if="store.uiMode !== 'kids'" class="subtitle">
          Acoustic ComAir remote for 2012 / Furby Boom toys. Point speaker at
          Furby's chest, volume ~80%.
        </p>
      </div>

      <!-- Quick Status Badges -->
      <div
        v-if="store.uiMode !== 'kids'"
        class="header-status-pills"
        role="status"
        aria-live="polite"
      >
        <span
          class="status-badge"
          :class="{ active: store.keepAliveActive }"
          :title="store.keepAliveActive ? 'Furby listening mode is active' : 'Furby listening mode is idle / asleep'"
        >
          <span class="dot" aria-hidden="true"></span>
          <span>{{ store.keepAliveActive ? "Awake" : "Idle" }}</span>
        </span>
        <span
          class="status-badge mic-badge"
          :class="{ active: store.micActive }"
          :title="store.micActive ? 'Microphone listening for Furby' : 'Microphone is off'"
        >
          <span class="dot" aria-hidden="true"></span>
          <span>{{ store.micActive ? "Mic On" : "Mic Off" }}</span>
        </span>
      </div>
    </div>

    <!-- Mode Selector Navigation -->
    <nav class="mode-bar" aria-label="Mode Switcher">
      <button
        class="mode-tab"
        :class="{ active: store.uiMode === 'kids' }"
        :aria-pressed="store.uiMode === 'kids'"
        @click="switchMode('kids')"
      >
        <span class="mode-icon">🧸</span>
        <span>Kids Playroom</span>
      </button>
      <button
        class="mode-tab"
        :class="{ active: store.uiMode === 'console' }"
        :aria-pressed="store.uiMode === 'console'"
        @click="switchMode('console')"
      >
        <span class="mode-icon">🎛️</span>
        <span>Pro Console</span>
      </button>
    </nav>
  </header>

  <main id="main-content">
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
            :disabled="store.keepAliveBusy"
            :aria-pressed="store.keepAliveActive"
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
            :disabled="store.micBusy"
            :aria-pressed="store.micActive"
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

  <footer v-if="store.uiMode !== 'kids'">
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

@media (max-width: 767px) {
  header {
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-shrink: 0;
  }

  main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
}
.title-area {
  flex: 1;
}
.header-status-pills {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
  align-items: center;
  margin-top: 0.2rem;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
  transition: all 0.15s ease;
}
.status-badge.active {
  color: var(--text);
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
}
.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}
.status-badge.active .dot {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
}
h1 {
  margin: 0 0 0.3rem;
  font-size: 1.4rem;
}

@media (max-width: 767px) {
  h1 {
    margin: 0;
    font-size: 1.25rem;
  }
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

@media (max-width: 767px) {
  .mode-bar {
    padding: 0.3rem;
    flex-shrink: 0;
  }

  .mode-tab {
    padding: 0.5rem 0.8rem;
  }
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

@media (max-width: 767px) {
  footer {
    flex-shrink: 0;
  }
}
footer a {
  color: var(--accent);
}

@media (prefers-color-scheme: light) {
  .mode-bar {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1);
  }

  .mode-tab {
    color: #64748b;
  }

  .mode-tab:hover {
    color: #0f172a;
  }

  .mode-tab:first-child.active {
    background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%);
    border-color: #c4b5fd;
    color: #6d28d9;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
  }

  .mode-tab:last-child.active {
    background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
    border-color: #a5b4fc;
    color: #4338ca;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  }

  .status-badge {
    background: #ffffff;
    border-color: #e2e8f0;
    color: #64748b;
    box-shadow: 0 1px 4px rgba(148, 163, 184, 0.1);
  }

  .status-badge.active {
    background: #dcfce7;
    border-color: #86efac;
    color: #15803d;
  }

  .status-badge.active .dot {
    background: #16a34a;
    box-shadow: 0 0 6px #16a34a;
  }

  .status-badge.mic-badge.active {
    background: #cffafe;
    border-color: #67e8f9;
    color: #0e7490;
  }

  .status-badge.mic-badge.active .dot {
    background: #0891b2;
    box-shadow: 0 0 6px #0891b2;
  }
}
</style>
