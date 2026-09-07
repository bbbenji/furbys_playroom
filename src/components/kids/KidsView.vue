<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFurbyStore } from "../../stores/furby";
import { vibrate } from "./haptics";
import KidFurbyMascot from "./KidFurbyMascot.vue";
import { speak } from "./speech";
import {
  playBoing,
  playChew,
  playChime,
  playFartSound,
  playGiggle,
  playPop,
} from "./soundFx";

const store = useFurbyStore();
type TabKey = "food" | "tricks" | "music" | "mood";
const activeTab = ref<TabKey>("tricks");

const KIDS_ONBOARDING_KEY = "furby-console:kids-onboarding-dismissed:v1";
const onboardingDismissed = ref(
  localStorage.getItem(KIDS_ONBOARDING_KEY) === "1",
);

function dismissOnboarding() {
  onboardingDismissed.value = true;
  try {
    localStorage.setItem(KIDS_ONBOARDING_KEY, "1");
  } catch {
    // ignore
  }
}

interface KidItem {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  sound?: "chew" | "fart" | "boing" | "giggle" | "chime" | "pop";
}

const FOOD_ITEMS: KidItem[] = [
  {
    id: 350,
    title: "Pizza Party",
    subtitle: "Yummy meal!",
    icon: "🍕",
    color: "#f59e0b",
    sound: "chew",
  },
  {
    id: 352,
    title: "Cookie Snack",
    subtitle: "Crunch crunch!",
    icon: "🍪",
    color: "#d97706",
    sound: "chew",
  },
  {
    id: 353,
    title: "Sweet Banana",
    subtitle: "Soft & tasty",
    icon: "🍌",
    color: "#eab308",
    sound: "chew",
  },
  {
    id: 354,
    title: "Spaghetti",
    subtitle: "Slurp it up!",
    icon: "🍝",
    color: "#ef4444",
    sound: "chew",
  },
  {
    id: 355,
    title: "Fruit Juice",
    subtitle: "Gulp gulp gulp!",
    icon: "🧃",
    color: "#06b6d4",
    sound: "chew",
  },
  {
    id: 356,
    title: "Funny Bone",
    subtitle: "Blehh! Not tasty",
    icon: "🦴",
    color: "#94a3b8",
    sound: "boing",
  },
  {
    id: 358,
    title: "Spicy Pepper",
    subtitle: "Hot hot hot!",
    icon: "🌶️",
    color: "#dc2626",
    sound: "chew",
  },
  {
    id: 359,
    title: "Big Veggie",
    subtitle: "Eat your greens!",
    icon: "🥦",
    color: "#16a34a",
    sound: "chew",
  },
  {
    id: 372,
    title: "Magic Beans",
    subtitle: "Ooh la la!",
    icon: "🫘",
    color: "#8b5cf6",
    sound: "chew",
  },
  {
    id: 417,
    title: "Toilet Paper",
    subtitle: "Hey! That's not food!",
    icon: "🧻",
    color: "#ec4899",
    sound: "boing",
  },
];

const TRICK_ITEMS: KidItem[] = [
  {
    id: 865,
    title: "Furby Fart",
    subtitle: "Toot toot!",
    icon: "💨",
    color: "#10b981",
    sound: "fart",
  },
  {
    id: 864,
    title: "Giant Burp",
    subtitle: "Excuse me!",
    icon: "🫧",
    color: "#06b6d4",
    sound: "boing",
  },
  {
    id: 863,
    title: "Giggle & Laugh",
    subtitle: "Hahaha!",
    icon: "😂",
    color: "#f59e0b",
    sound: "giggle",
  },
  {
    id: 866,
    title: "Happy Purr",
    subtitle: "So cuddly!",
    icon: "🐱",
    color: "#ec4899",
    sound: "chime",
  },
  {
    id: 867,
    title: "Big Sneeze",
    subtitle: "Achoo!",
    icon: "🤧",
    color: "#8b5cf6",
    sound: "boing",
  },
  {
    id: 868,
    title: "Sing a Song",
    subtitle: "La la la!",
    icon: "🎤",
    color: "#3b82f6",
    sound: "chime",
  },
  {
    id: 869,
    title: "Tell a Secret",
    subtitle: "Chatterbox!",
    icon: "🗣️",
    color: "#a855f7",
    sound: "pop",
  },
  {
    id: 862,
    title: "Nap Time",
    subtitle: "Go to sleep",
    icon: "😴",
    color: "#6366f1",
    sound: "pop",
  },
];

const MUSIC_ITEMS: KidItem[] = [
  {
    id: 721,
    title: "Party Jam A",
    subtitle: "Furby dance beat!",
    icon: "🎵",
    color: "#ec4899",
    sound: "chime",
  },
  {
    id: 722,
    title: "Boogie Beat B",
    subtitle: "Groovy tunes!",
    icon: "🎷",
    color: "#f59e0b",
    sound: "chime",
  },
  {
    id: 723,
    title: "Rock Anthem C",
    subtitle: "Guitar vibes!",
    icon: "🎸",
    color: "#ef4444",
    sound: "chime",
  },
  {
    id: 724,
    title: "Disco Fever D",
    subtitle: "Spin and dance!",
    icon: "🪩",
    color: "#8b5cf6",
    sound: "chime",
  },
  {
    id: 889,
    title: "Ahh-Tahoo!",
    subtitle: "Special victory cheer!",
    icon: "🌟",
    color: "#eab308",
    sound: "giggle",
  },
  {
    id: 718,
    title: "Sleepy Yawn",
    subtitle: "Yaaawn...",
    icon: "🥱",
    color: "#64748b",
    sound: "pop",
  },
];

const ALL_ITEMS: KidItem[] = [...TRICK_ITEMS, ...FOOD_ITEMS, ...MUSIC_ITEMS];
const ALL_ITEM_IDS = new Set(ALL_ITEMS.map((item) => item.id));
const TOTAL_DISCOVERABLE = ALL_ITEMS.length;
const ITEM_TAB: Record<number, TabKey> = Object.fromEntries([
  ...TRICK_ITEMS.map((item) => [item.id, "tricks" as TabKey]),
  ...FOOD_ITEMS.map((item) => [item.id, "food" as TabKey]),
  ...MUSIC_ITEMS.map((item) => [item.id, "music" as TabKey]),
]);

const discoveredIds = computed(() => {
  const seen = new Set<number>();
  for (const entry of store.log) {
    if (entry.direction === "tx" && ALL_ITEM_IDS.has(entry.command))
      seen.add(entry.command);
  }
  return seen;
});
const discoveredCount = computed(() => discoveredIds.value.size);
const discoveryPercent = computed(() =>
  Math.round((discoveredCount.value / TOTAL_DISCOVERABLE) * 100),
);

const justDiscovered = ref(false);
let discoveryToastTimer: ReturnType<typeof setTimeout> | null = null;
watch(discoveredCount, (next, prev) => {
  if (next <= prev) return;
  justDiscovered.value = true;
  if (discoveryToastTimer) clearTimeout(discoveryToastTimer);
  discoveryToastTimer = setTimeout(() => {
    justDiscovered.value = false;
  }, 2200);
});

function playKidSound(sound?: string) {
  if (!store.soundFxEnabled) return;
  switch (sound) {
    case "chew":
      playChew();
      break;
    case "fart":
      playFartSound();
      break;
    case "boing":
      playBoing();
      break;
    case "giggle":
      playGiggle();
      break;
    case "chime":
      playChime();
      break;
    default:
      playPop();
      break;
  }
}

function handleItemClick(item: KidItem) {
  vibrate(15);
  playKidSound(item.sound);
  if (store.readAloudEnabled) speak(item.title);
  store.send(item.id);
}

function handleSurprise() {
  vibrate([10, 40, 10]);
  const undiscovered = ALL_ITEMS.filter(
    (item) => !discoveredIds.value.has(item.id),
  );
  const pool = undiscovered.length > 0 ? undiscovered : ALL_ITEMS;
  const item = pool[Math.floor(Math.random() * pool.length)];
  activeTab.value = ITEM_TAB[item.id];
  handleItemClick(item);
}

function handleWakeToggle() {
  vibrate(20);
  if (store.soundFxEnabled) {
    if (!store.keepAliveActive) playChime();
    else playPop();
  }
  store.toggleKeepAlive();
}

function handleMicToggle() {
  vibrate(12);
  if (store.soundFxEnabled) playPop();
  store.toggleMic();
}

function handleSoundFxToggle() {
  vibrate(12);
  playPop();
  store.toggleSoundFx();
}

function handleReadAloudToggle() {
  vibrate(12);
  if (store.soundFxEnabled) playPop();
  store.toggleReadAloud();
}

function handleHapticsToggle() {
  if (store.soundFxEnabled) playPop();
  store.toggleHaptics();
  if (store.hapticsEnabled) vibrate(12);
}

async function handleMoodCheck() {
  vibrate(15);
  if (store.soundFxEnabled) playChime();
  if (!store.micActive) await store.toggleMic();
  store.send(813);
}

interface PersonalityBadge {
  title: string;
  emoji: string;
  desc: string;
  badgeColor: string;
}

const personalityBadge = computed<PersonalityBadge | null>(() => {
  const personality = store.currentPersonality;
  return personality
    ? getPersonalityBadge(personality.id, personality.label)
    : null;
});

watch(personalityBadge, (badge) => {
  if (badge && store.readAloudEnabled) speak(`Furby is a ${badge.title}!`);
});

function getPersonalityBadge(id: number, label: string): PersonalityBadge {
  switch (id) {
    case 901:
      return {
        title: "Princess Furby",
        emoji: "👑",
        desc: "Loves sweet treats, royal pampering, and good manners!",
        badgeColor: "#ec4899",
      };
    case 902:
      return {
        title: "Superstar Diva",
        emoji: "✨",
        desc: "Loves the spotlight, loud singing, and big applause!",
        badgeColor: "#f59e0b",
      };
    case 903:
      return {
        title: "Brave Warrior",
        emoji: "⚔️",
        desc: "Karate chops and roars! Always ready for high adventure!",
        badgeColor: "#ef4444",
      };
    case 904:
      return {
        title: "Silly Joker",
        emoji: "🃏",
        desc: "Loves laughs, funny noises, giggles, and silly pranks!",
        badgeColor: "#10b981",
      };
    case 905:
      return {
        title: "Gossip Queen",
        emoji: "💅",
        desc: "Chatterbox! Always has the latest news and secrets!",
        badgeColor: "#8b5cf6",
      };
    default:
      return {
        title: label || "Playful Furby",
        emoji: "🐣",
        desc: "Happy, curious, and loves playing songs and games!",
        badgeColor: "#06b6d4",
      };
  }
}
</script>

<template>
  <div class="kids-view">
    <!-- First-Visit Onboarding -->
    <div v-if="!onboardingDismissed" class="kids-onboarding">
      <span class="onboarding-emoji" aria-hidden="true">👋</span>
      <p>
        First time here? Tap <strong>Wake Up Furby!</strong> below, then explore
        <strong>Silly Tricks</strong>, <strong>Feed Furby</strong>, and
        <strong>Dance Party</strong>
        to hear magic sounds!
      </p>
      <button
        type="button"
        class="onboarding-dismiss"
        aria-label="Got it, dismiss this tip"
        @click="dismissOnboarding"
      >
        ✕
      </button>
    </div>

    <!-- Top Wake-Up & Listening Station -->
    <div class="wake-station">
      <div
        class="wake-card"
        :class="{ awake: store.keepAliveActive }"
        @click="handleWakeToggle"
      >
        <div class="wake-icon-wrap" aria-hidden="true">
          <span class="wake-icon">{{
            store.keepAliveActive ? "🌟" : "💤"
          }}</span>
        </div>
        <div class="wake-text">
          <h2 class="wake-title">
            {{
              store.keepAliveActive
                ? "Furby is Awake & Ready!"
                : "Wake Up Furby!"
            }}
          </h2>
          <p class="wake-subtitle">
            {{
              store.keepAliveActive
                ? "Furby is listening for your commands (tap to let sleep)"
                : "Tap here so Furby stays awake and ready to play!"
            }}
          </p>
        </div>
        <button
          type="button"
          class="wake-btn"
          :class="{ awake: store.keepAliveActive }"
        >
          {{ store.keepAliveActive ? "Sleep 💤" : "Wake Up! ✨" }}
        </button>
      </div>

      <!-- Quick Control Pills -->
      <div class="quick-controls">
        <button
          class="control-pill"
          :class="{ active: store.micActive }"
          @click="handleMicToggle"
          :title="
            store.micActive
              ? 'Mic listening to Furby'
              : 'Enable mic to hear Furby'
          "
        >
          <span class="pill-icon">👂</span>
          <span>{{
            store.micActive ? "Listening to Furby" : "Listen to Furby"
          }}</span>
        </button>

        <button
          class="control-pill sfx-pill"
          :class="{ active: store.soundFxEnabled }"
          @click="handleSoundFxToggle"
          :title="store.soundFxEnabled ? 'Sound FX On' : 'Sound FX Muted'"
        >
          <span class="pill-icon">{{
            store.soundFxEnabled ? "🔊" : "🔇"
          }}</span>
          <span>{{ store.soundFxEnabled ? "Sound FX On" : "Muted" }}</span>
        </button>

        <button
          class="control-pill read-pill"
          :class="{ active: store.readAloudEnabled }"
          @click="handleReadAloudToggle"
          :title="
            store.readAloudEnabled
              ? 'Furby will say each sound out loud'
              : 'Turn on read-aloud for each sound'
          "
        >
          <span class="pill-icon">🗣️</span>
          <span>Read Aloud</span>
        </button>

        <button
          class="control-pill haptics-pill"
          :class="{ active: store.hapticsEnabled }"
          @click="handleHapticsToggle"
          :title="
            store.hapticsEnabled
              ? 'Buzzes on every tap'
              : 'Turn on buzzing for taps'
          "
        >
          <span class="pill-icon">{{
            store.hapticsEnabled ? "📳" : "📴"
          }}</span>
          <span>Buzz</span>
        </button>
      </div>

      <p v-if="store.micError" class="kids-error">
        ⚠️ Microphone note: {{ store.micError }}
      </p>
      <p v-if="store.sendError" class="kids-error">
        ⚠️ Oops, that sound didn't send: {{ store.sendError }}
      </p>
    </div>

    <!-- Interactive Furby Mascot -->
    <KidFurbyMascot />

    <!-- Sending Banner: fixed/overlaid so it doesn't push the page down
         when it appears and back up when it disappears. -->
    <Transition name="beam-fade">
      <div v-if="store.sending !== null" class="beaming-banner">
        <span class="beaming-pulse"></span>
        <span>📡 Beaming magic sound to Furby... Keep speaker close!</span>
      </div>
    </Transition>

    <!-- Sound Collection & Surprise Me -->
    <div class="discovery-panel">
      <div class="discovery-info">
        <div class="discovery-header">
          <span aria-hidden="true">🌟</span>
          <span>Sound Collection</span>
        </div>
        <div class="discovery-bar-track">
          <div
            class="discovery-bar-fill"
            :style="{ width: discoveryPercent + '%' }"
          ></div>
        </div>
        <p class="discovery-count" :class="{ celebrate: justDiscovered }">
          {{
            justDiscovered
              ? "🎉 New sound discovered!"
              : `${discoveredCount} / ${TOTAL_DISCOVERABLE} sounds found!`
          }}
        </p>
      </div>
      <button
        type="button"
        class="surprise-btn"
        :disabled="store.sending !== null"
        @click="handleSurprise"
      >
        <span class="surprise-icon" aria-hidden="true">🎲</span>
        <span>Surprise Me!</span>
      </button>
    </div>

    <!-- Category Tabs -->
    <nav class="category-tabs" aria-label="Play Categories" role="tablist">
      <button
        id="tab-tricks"
        class="tab-btn"
        :class="{ active: activeTab === 'tricks' }"
        role="tab"
        :aria-selected="activeTab === 'tricks'"
        aria-controls="panel-tricks"
        @click="activeTab = 'tricks'"
      >
        <span class="tab-emoji">🤪</span>
        <span class="tab-label">Silly Tricks</span>
      </button>

      <button
        id="tab-food"
        class="tab-btn"
        :class="{ active: activeTab === 'food' }"
        role="tab"
        :aria-selected="activeTab === 'food'"
        aria-controls="panel-food"
        @click="activeTab = 'food'"
      >
        <span class="tab-emoji">🍕</span>
        <span class="tab-label">Feed Furby</span>
      </button>

      <button
        id="tab-music"
        class="tab-btn"
        :class="{ active: activeTab === 'music' }"
        role="tab"
        :aria-selected="activeTab === 'music'"
        aria-controls="panel-music"
        @click="activeTab = 'music'"
      >
        <span class="tab-emoji">🎶</span>
        <span class="tab-label">Dance Party</span>
      </button>

      <button
        id="tab-mood"
        class="tab-btn"
        :class="{ active: activeTab === 'mood' }"
        role="tab"
        :aria-selected="activeTab === 'mood'"
        aria-controls="panel-mood"
        @click="activeTab = 'mood'"
      >
        <span class="tab-emoji">🔮</span>
        <span class="tab-label">Furby Mood</span>
      </button>
    </nav>

    <!-- TAB: SILLY TRICKS -->
    <section
      v-if="activeTab === 'tricks'"
      id="panel-tricks"
      class="play-grid-section"
      role="tabpanel"
      aria-labelledby="tab-tricks"
    >
      <div class="grid-cards">
        <button
          v-for="item in TRICK_ITEMS"
          :key="item.id"
          class="play-card trick-card"
          :class="{ busy: store.sending === item.id }"
          :disabled="store.sending !== null"
          :style="{ '--card-color': item.color }"
          @click="handleItemClick(item)"
        >
          <span class="card-emoji">{{ item.icon }}</span>
          <span class="card-title">{{ item.title }}</span>
          <span class="card-subtitle">{{ item.subtitle }}</span>
        </button>
      </div>
    </section>

    <!-- TAB: FEED FURBY -->
    <section
      v-if="activeTab === 'food'"
      id="panel-food"
      class="play-grid-section"
      role="tabpanel"
      aria-labelledby="tab-food"
    >
      <div class="grid-cards">
        <button
          v-for="item in FOOD_ITEMS"
          :key="item.id"
          class="play-card food-card"
          :class="{ busy: store.sending === item.id }"
          :disabled="store.sending !== null"
          :style="{ '--card-color': item.color }"
          @click="handleItemClick(item)"
        >
          <span class="card-emoji">{{ item.icon }}</span>
          <span class="card-title">{{ item.title }}</span>
          <span class="card-subtitle">{{ item.subtitle }}</span>
        </button>
      </div>
    </section>

    <!-- TAB: DANCE & MUSIC -->
    <section
      v-if="activeTab === 'music'"
      id="panel-music"
      class="play-grid-section"
      role="tabpanel"
      aria-labelledby="tab-music"
    >
      <div class="grid-cards">
        <button
          v-for="item in MUSIC_ITEMS"
          :key="item.id"
          class="play-card music-card"
          :class="{ busy: store.sending === item.id }"
          :disabled="store.sending !== null"
          :style="{ '--card-color': item.color }"
          @click="handleItemClick(item)"
        >
          <span class="card-emoji">{{ item.icon }}</span>
          <span class="card-title">{{ item.title }}</span>
          <span class="card-subtitle">{{ item.subtitle }}</span>
        </button>
      </div>
    </section>

    <!-- TAB: FURBY MOOD -->
    <section
      v-if="activeTab === 'mood'"
      id="panel-mood"
      class="play-grid-section mood-section"
      role="tabpanel"
      aria-labelledby="tab-mood"
    >
      <div class="mood-box">
        <div class="mood-header">
          <h3>How is Furby feeling?</h3>
          <p>Tap the magic crystal to ask Furby its current personality!</p>
          <button
            class="ask-mood-btn"
            :class="{ busy: store.sending === 813 }"
            :disabled="store.sending !== null"
            @click="handleMoodCheck"
          >
            <span class="crystal-icon">🔮</span>
            <span>Ask Furby's Mood</span>
          </button>
        </div>

        <div v-if="personalityBadge" class="personality-card">
          <div
            class="personality-badge"
            :style="{ '--badge-color': personalityBadge.badgeColor }"
          >
            <span class="badge-emoji">{{ personalityBadge.emoji }}</span>
            <div class="badge-info">
              <h4 class="badge-title">{{ personalityBadge.title }}</h4>
              <p class="badge-desc">{{ personalityBadge.desc }}</p>
            </div>
          </div>
        </div>
        <div v-else class="personality-empty">
          <span class="empty-icon">💭</span>
          <p>
            Furby hasn't told us its personality yet! Tap
            <strong>Ask Furby's Mood</strong> above - we'll turn on listening
            for you.
          </p>
        </div>
      </div>
    </section>

    <!-- Pro Tip Card -->
    <footer class="kids-tip-card">
      <span class="tip-icon">📱</span>
      <p class="tip-text">
        <strong>Play Tip:</strong> Hold your phone close to Furby's tummy with
        volume at about <strong>80%</strong> so Furby can hear the magic sounds!
      </p>
    </footer>
  </div>
</template>

<style scoped>
.kids-view {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding-bottom: 2rem;
}

/* First-Visit Onboarding */
.kids-onboarding {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.18),
    rgba(236, 72, 153, 0.14)
  );
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.onboarding-emoji {
  font-size: 1.3rem;
  line-height: 1.3;
}

.kids-onboarding p {
  flex: 1;
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text);
}

.kids-onboarding p strong {
  color: var(--text);
}

.onboarding-dismiss {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  margin: -0.6rem -0.5rem -0.6rem 0;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.onboarding-dismiss:hover {
  color: var(--text);
}

/* Wake Station Card */
.wake-station {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.wake-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.25),
    rgba(236, 72, 153, 0.2)
  );
  border: 2px solid rgba(168, 85, 247, 0.4);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.wake-card:hover {
  transform: translateY(-2px);
  border-color: rgba(168, 85, 247, 0.7);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.25);
}

.wake-card.awake {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.2),
    rgba(6, 182, 212, 0.2)
  );
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.wake-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  font-size: 1.8rem;
  flex-shrink: 0;
}

.wake-text {
  flex: 1;
}

.wake-title {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.01em;
}

.wake-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.35;
}

.wake-btn {
  padding: 0.65rem 1.1rem;
  border-radius: 9999px;
  border: none;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
  transition: transform 0.15s ease;
}

.wake-btn.awake {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.wake-btn:active {
  transform: scale(0.95);
}

/* On narrow phones the icon + title + pill button can't all fit on one
   row - the title was wrapping to one word per line. Let the button drop
   to its own full-width row instead. */
@media (max-width: 480px) {
  .wake-card {
    flex-wrap: wrap;
  }
  .wake-text {
    min-width: 180px;
  }
  .wake-btn {
    flex: 1 0 100%;
    margin-top: 0.2rem;
  }
}

/* Quick Control Pills */
.quick-controls {
  display: grid;
  /* A fixed 2-column grid always breaks evenly (2+2), unlike flex-wrap
     which - depending on how each pill's label happens to measure at a
     given screen width - could wrap into an uneven 3-then-1. */
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

@media (min-width: 480px) {
  .quick-controls {
    grid-template-columns: repeat(4, 1fr);
  }
}

.control-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 0.8rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.control-pill:hover {
  background: var(--surface-hover);
}

.control-pill.active {
  background: rgba(16, 185, 129, 0.18);
  border-color: #10b981;
  color: #10b981;
}

.control-pill.sfx-pill.active {
  background: rgba(124, 58, 237, 0.18);
  border-color: #a855f7;
  color: #c084fc;
}

.control-pill.read-pill.active {
  background: rgba(6, 182, 212, 0.18);
  border-color: #06b6d4;
  color: #22d3ee;
}

.control-pill.haptics-pill.active {
  background: rgba(245, 158, 11, 0.18);
  border-color: #f59e0b;
  color: #fbbf24;
}

.pill-icon {
  font-size: 1.1rem;
}

.kids-error {
  margin: 0;
  font-size: 0.82rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
}

/* Beaming magic banner - fixed/overlaid on top of the page instead of
   sitting in normal flow, so it doesn't shove everything below it down
   when it appears and back up when it disappears. */
.beaming-banner {
  position: fixed;
  top: max(0.8rem, env(safe-area-inset-top));
  left: 1rem;
  right: 1rem;
  max-width: 480px;
  margin: 0 auto;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(245, 158, 11, 0.95),
    rgba(236, 72, 153, 0.95)
  );
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  animation: pulseBeaming 1s infinite alternate ease-in-out;
}

.beam-fade-enter-active,
.beam-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.beam-fade-enter-from,
.beam-fade-leave-to {
  opacity: 0;
  transform: translate(0, -8px);
}

@keyframes pulseBeaming {
  0% {
    transform: scale(0.99);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.01);
    opacity: 1;
  }
}

.beaming-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
  animation: beamingDot 0.6s infinite alternate ease-in-out;
}

@keyframes beamingDot {
  0% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* Sound Collection & Surprise Me */
.discovery-panel {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1.1rem;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.discovery-info {
  flex: 1;
  min-width: 0;
}

.discovery-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.discovery-bar-track {
  height: 8px;
  border-radius: 9999px;
  background: var(--border);
  overflow: hidden;
}

.discovery-bar-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #f59e0b, #ec4899);
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.discovery-count {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: var(--muted);
}

.discovery-count.celebrate {
  color: #f59e0b;
  font-weight: 700;
  animation: celebratePop 0.4s ease-in-out;
}

@keyframes celebratePop {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

.surprise-btn {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.65rem 1rem;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  color: white;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(236, 72, 153, 0.3);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.surprise-btn:hover {
  transform: scale(1.05);
}

.surprise-btn:active {
  transform: scale(0.94);
}

.surprise-icon {
  font-size: 1.3rem;
}

.surprise-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

/* Category Tabs */
.category-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  background: var(--surface);
  padding: 0.4rem;
  border-radius: 18px;
  border: 1px solid var(--border);
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.65rem 0.3rem;
  border-radius: 14px;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.tab-emoji {
  font-size: 1.5rem;
  transition: transform 0.2s ease;
}

.tab-label {
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.3),
    rgba(236, 72, 153, 0.25)
  );
  color: var(--text);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.2);
}

.tab-btn.active .tab-emoji {
  transform: scale(1.18);
}

/* Grid Cards */
.play-grid-section {
  display: flex;
  flex-direction: column;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 540px) {
  .grid-cards {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  }
}

.play-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.1rem 0.6rem;
  border-radius: 20px;
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--text);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  user-select: none;
  touch-action: manipulation;
  position: relative;
  overflow: hidden;
}

.play-card:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: var(--card-color);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}

.play-card:active {
  transform: scale(0.94);
}

.play-card.busy {
  background: var(--card-color);
  color: #ffffff;
  border-color: transparent;
  animation: cardBounce 0.4s ease-in-out infinite alternate;
}

@keyframes cardBounce {
  0% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1.02);
  }
}

.card-emoji {
  font-size: 2.3rem;
  margin-bottom: 0.35rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
  transition: transform 0.2s ease;
}

.play-card:hover .card-emoji {
  transform: scale(1.15) rotate(4deg);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 800;
  margin-bottom: 0.15rem;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.2;
}

.play-card.busy .card-subtitle {
  color: rgba(255, 255, 255, 0.85);
}

.play-card:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.play-card.busy:disabled {
  opacity: 1;
}

/* Mood & Personality Section */
.mood-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mood-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.4rem 1.2rem;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(6, 182, 212, 0.15)
  );
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.mood-header h3 {
  margin: 0 0 0.3rem;
  font-size: 1.2rem;
  font-weight: 800;
}

.mood-header p {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--muted);
  max-width: 320px;
}

.ask-mood-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border-radius: 9999px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ask-mood-btn:hover {
  transform: scale(1.05);
}

.ask-mood-btn:active {
  transform: scale(0.96);
}

.ask-mood-btn.busy {
  opacity: 0.8;
  filter: brightness(1.2);
}

.ask-mood-btn:disabled:not(.busy) {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.crystal-icon {
  font-size: 1.3rem;
}

.personality-card {
  display: flex;
  justify-content: center;
}

.personality-badge {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  width: 100%;
  padding: 1.2rem 1.4rem;
  border-radius: 20px;
  background: var(--surface);
  border: 2px solid var(--badge-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.badge-emoji {
  font-size: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-info {
  flex: 1;
}

.badge-title {
  margin: 0 0 0.3rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--badge-color);
}

.badge-desc {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.4;
}

.personality-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.4rem 1rem;
  border-radius: 18px;
  background: var(--surface);
  border: 1px dashed var(--border);
  color: var(--muted);
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2rem;
}

.personality-empty p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.4;
}

/* Pro Tip Card */
.kids-tip-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 1.1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
}

.tip-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.tip-text {
  margin: 0;
  font-size: 0.84rem;
  color: var(--muted);
  line-height: 1.35;
}

.tip-text strong {
  color: var(--text);
}
</style>
