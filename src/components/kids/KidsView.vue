<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useFurbyStore } from "../../stores/furby";
import { vibrate } from "./haptics";
import KidFurbyMascot from "./KidFurbyMascot.vue";
import KidItemGrid, { type KidItem } from "./KidItemGrid.vue";
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
const TAB_KEYS: TabKey[] = ["tricks", "food", "music", "mood"];

function onTabKeydown(e: KeyboardEvent, currentTab: TabKey) {
  const idx = TAB_KEYS.indexOf(currentTab);
  if (e.key === "ArrowRight") {
    e.preventDefault();
    const next = TAB_KEYS[(idx + 1) % TAB_KEYS.length];
    activeTab.value = next;
    document.getElementById(`tab-${next}`)?.focus();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    const prev = TAB_KEYS[(idx - 1 + TAB_KEYS.length) % TAB_KEYS.length];
    activeTab.value = prev;
    document.getElementById(`tab-${prev}`)?.focus();
  }
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

const DISCOVERED_STORAGE_KEY = "furby-console:discovered:v1";

function loadDiscovered(): Set<number> {
  try {
    const raw = localStorage.getItem(DISCOVERED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((n): n is number => typeof n === "number"))
      : new Set();
  } catch {
    return new Set();
  }
}

function persistDiscovered(ids: Set<number>) {
  try {
    localStorage.setItem(DISCOVERED_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage full or unavailable (e.g. private browsing) - won't survive a reload.
  }
}

// Backed by localStorage (not just store.log) so a kid's collection rank
// can't regress when older entries scroll out of the log's LOG_LIMIT cap.
const optimisticDiscovered = ref<Set<number>>(loadDiscovered());

const discoveredIds = computed(() => {
  const seen = new Set<number>(optimisticDiscovered.value);
  for (const entry of store.log) {
    if (entry.direction === "tx" && ALL_ITEM_IDS.has(entry.command))
      seen.add(entry.command);
  }
  if (store.sending !== null && ALL_ITEM_IDS.has(store.sending)) {
    seen.add(store.sending);
  }
  return seen;
});
const discoveredCount = computed(() => discoveredIds.value.size);
const discoveryPercent = computed(() =>
  Math.round((discoveredCount.value / TOTAL_DISCOVERABLE) * 100),
);

const collectionRank = computed(() => {
  const count = discoveredCount.value;
  if (count >= TOTAL_DISCOVERABLE)
    return { title: "Grand Furby Whisperer!", emoji: "👑" };
  if (count >= 18) return { title: "Magic Maestro", emoji: "🔮" };
  if (count >= 12) return { title: "Furby DJ", emoji: "🎩" };
  if (count >= 6) return { title: "Sound Explorer", emoji: "🌟" };
  return { title: "Curious Furbling", emoji: "🐣" };
});

interface ParticleBurst {
  id: number;
  x: number;
  y: number;
  emoji: string;
}
const bursts = ref<ParticleBurst[]>([]);
let burstCounter = 0;
const burstTimers = new Set<ReturnType<typeof setTimeout>>();

function spawnBurst(e: MouseEvent | undefined, emoji: string) {
  if (!e) return;
  const id = burstCounter++;
  bursts.value.push({ id, x: e.clientX, y: e.clientY, emoji });
  const timer = setTimeout(() => {
    burstTimers.delete(timer);
    bursts.value = bursts.value.filter((b) => b.id !== id);
  }, 750);
  burstTimers.add(timer);
}

const highlightedCardId = ref<number | null>(null);
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

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

onUnmounted(() => {
  if (highlightTimer) clearTimeout(highlightTimer);
  if (discoveryToastTimer) clearTimeout(discoveryToastTimer);
  burstTimers.forEach((t) => clearTimeout(t));
  burstTimers.clear();
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

function handleItemClick(item: KidItem, event?: MouseEvent) {
  vibrate(15);
  if (!optimisticDiscovered.value.has(item.id)) {
    optimisticDiscovered.value.add(item.id);
    persistDiscovered(optimisticDiscovered.value);
  }
  if (event) spawnBurst(event, item.icon);
  playKidSound(item.sound);
  if (store.readAloudEnabled) speak(item.title);
  store.send(item.id);
}

function handleSurprise(e?: MouseEvent) {
  vibrate([10, 40, 10]);
  const undiscovered = ALL_ITEMS.filter(
    (item) => !discoveredIds.value.has(item.id),
  );
  const pool = undiscovered.length > 0 ? undiscovered : ALL_ITEMS;
  const item = pool[Math.floor(Math.random() * pool.length)];
  activeTab.value = ITEM_TAB[item.id];
  highlightedCardId.value = item.id;
  if (highlightTimer) clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    highlightedCardId.value = null;
  }, 2200);
  handleItemClick(item, e);
}

function handleSleepToggle() {
  vibrate(20);
  if (store.soundFxEnabled) playPop();
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

/** Whether the mic is currently picking up any tone loud enough to count - a friendly stand-in for the technical RX debug panel in Pro Console. */
const hasLiveRxSignal = computed(() =>
  Object.values(store.rxMagnitudes).some((m) => m >= store.rxThreshold),
);

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
    case 906:
      return {
        title: "Snuggleby",
        emoji: "🧸",
        desc: "Extra cuddly and loves warm, cozy hugs!",
        badgeColor: "#f472b6",
      };
    case 907:
      return {
        title: "Sassby",
        emoji: "😼",
        desc: "A little bit sassy with a big personality!",
        badgeColor: "#a855f7",
      };
    case 908:
      return {
        title: "Scoffby",
        emoji: "😏",
        desc: "Cheeky and full of playful teasing!",
        badgeColor: "#f59e0b",
      };
    case 909:
      return {
        title: "Chuckleby",
        emoji: "😆",
        desc: "Can't stop giggling at everything!",
        badgeColor: "#22c55e",
      };
    case 910:
      return {
        title: "Gassby",
        emoji: "💨",
        desc: "Toots and tummy rumbles are just part of the fun!",
        badgeColor: "#10b981",
      };
    case 911:
      return {
        title: "Lateby",
        emoji: "⏰",
        desc: "Always sleepy and running a little behind schedule!",
        badgeColor: "#6366f1",
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
    <!-- Floating emoji bursts from card taps -->
    <div class="burst-container" aria-hidden="true">
      <span
        v-for="b in bursts"
        :key="b.id"
        class="floating-burst"
        :style="{ left: b.x + 'px', top: b.y + 'px' }"
      >
        {{ b.emoji }}
      </span>
    </div>

    <!-- Hero Playroom Stage Card -->
    <section class="playroom-stage" aria-label="Furby Stage">
      <!-- Stage Top Control Header -->
      <div class="stage-header">
        <div class="stage-status-group">
          <!-- Awake / Sleep Toggle -->
          <button
            type="button"
            class="stage-chip wake-chip"
            :class="{ awake: store.keepAliveActive }"
            :title="store.keepAliveActive ? 'Furby is awake and listening - tap to let sleep' : 'Tap to wake up Furby'"
            @click="handleSleepToggle"
          >
            <span class="chip-glow-dot" aria-hidden="true"></span>
            <span class="chip-icon">{{ store.keepAliveActive ? "🌟" : "💤" }}</span>
            <span class="chip-text">{{ store.keepAliveActive ? "Awake" : "Sleeping" }}</span>
          </button>

          <!-- Mic Listening Toggle -->
          <button
            type="button"
            class="stage-chip mic-chip"
            :class="{ active: store.micActive, hearing: hasLiveRxSignal }"
            :title="store.micActive ? 'Mic listening to Furby - tap to turn off' : 'Enable mic to listen to Furby'"
            @click="handleMicToggle"
          >
            <span class="chip-icon">👂</span>
            <span class="chip-text">
              {{ store.micActive ? (hasLiveRxSignal ? "Hearing Furby!" : "Listening") : "Hear Furby" }}
            </span>
          </button>
        </div>

        <!-- Compact Play Tools Bar -->
        <div class="stage-tools-group" role="group" aria-label="Audio & Haptics Settings">
          <button
            type="button"
            class="tool-btn"
            :class="{ active: store.soundFxEnabled }"
            :title="store.soundFxEnabled ? 'Sound FX On - tap to mute' : 'Sound FX Muted - tap to turn on'"
            @click="handleSoundFxToggle"
          >
            <span class="tool-icon">{{ store.soundFxEnabled ? "🔊" : "🔇" }}</span>
          </button>

          <button
            type="button"
            class="tool-btn"
            :class="{ active: store.readAloudEnabled }"
            :title="store.readAloudEnabled ? 'Read Aloud On - tap to turn off' : 'Read Aloud Off - tap to turn on'"
            @click="handleReadAloudToggle"
          >
            <span class="tool-icon">🗣️</span>
          </button>

          <button
            type="button"
            class="tool-btn"
            :class="{ active: store.hapticsEnabled }"
            :title="store.hapticsEnabled ? 'Vibration On - tap to turn off' : 'Vibration Off - tap to turn on'"
            @click="handleHapticsToggle"
          >
            <span class="tool-icon">{{ store.hapticsEnabled ? "📳" : "📴" }}</span>
          </button>
        </div>
      </div>

      <!-- Centerpiece Interactive Furby Mascot -->
      <div class="stage-mascot-arena">
        <KidFurbyMascot />

        <!-- In-situ Radiant Beaming Sonic Rings (dialogue bubble inside mascot handles status) -->
        <Transition name="beam-pop">
          <div v-if="store.sending !== null" class="stage-beaming-pulse" role="status">
            <span class="beaming-sonic-ring ring-1"></span>
            <span class="beaming-sonic-ring ring-2"></span>
          </div>
        </Transition>
      </div>

      <!-- Stage Bottom Audio Proximity Guide -->
      <div class="stage-footer-guide">
        <span class="guide-speaker-icon" aria-hidden="true">🔊</span>
        <span>Hold speaker close to Furby's tummy • Volume ~80%</span>
      </div>

      <p v-if="store.micError" class="stage-error">⚠️ Mic note: {{ store.micError }}</p>
      <p v-if="store.sendError" class="stage-error">⚠️ Sound didn't send: {{ store.sendError }}</p>
    </section>

    <!-- Compact Discovery Capsule & Surprise Me Bar -->
    <div class="discovery-capsule-bar">
      <div class="discovery-capsule">
        <div class="capsule-progress-group">
          <div class="capsule-count-row">
            <span class="capsule-title">
              <span aria-hidden="true">⭐</span>
              <strong>{{ discoveredCount }}</strong>/{{ TOTAL_DISCOVERABLE }} Found
            </span>
            <span class="capsule-rank-tag">{{ collectionRank.emoji }} {{ collectionRank.title }}</span>
          </div>
          <div class="capsule-track">
            <div
              class="capsule-fill"
              :style="{ width: discoveryPercent + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="capsule-surprise-btn"
        :disabled="store.sending !== null"
        title="Pick a random surprise sound!"
        @click="handleSurprise($event)"
      >
        <span class="surprise-dice-icon" aria-hidden="true">🎲</span>
        <span>Surprise Me!</span>
      </button>
    </div>

    <!-- Playful Segmented Category Tabs -->
    <nav class="category-tabs" aria-label="Play Categories" role="tablist">
      <button
        id="tab-tricks"
        class="tab-btn"
        :class="{ active: activeTab === 'tricks' }"
        role="tab"
        :aria-selected="activeTab === 'tricks'"
        aria-controls="panel-tricks"
        @click="activeTab = 'tricks'"
        @keydown="onTabKeydown($event, 'tricks')"
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
        @keydown="onTabKeydown($event, 'food')"
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
        @keydown="onTabKeydown($event, 'music')"
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
        @keydown="onTabKeydown($event, 'mood')"
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
      <KidItemGrid
        :items="TRICK_ITEMS"
        :discovered-ids="discoveredIds"
        :highlighted-card-id="highlightedCardId"
        :sending="store.sending"
        @select="handleItemClick"
      />
    </section>

    <!-- TAB: FEED FURBY -->
    <section
      v-if="activeTab === 'food'"
      id="panel-food"
      class="play-grid-section"
      role="tabpanel"
      aria-labelledby="tab-food"
    >
      <KidItemGrid
        :items="FOOD_ITEMS"
        :discovered-ids="discoveredIds"
        :highlighted-card-id="highlightedCardId"
        :sending="store.sending"
        @select="handleItemClick"
      />
    </section>

    <!-- TAB: DANCE & MUSIC -->
    <section
      v-if="activeTab === 'music'"
      id="panel-music"
      class="play-grid-section"
      role="tabpanel"
      aria-labelledby="tab-music"
    >
      <KidItemGrid
        :items="MUSIC_ITEMS"
        :discovered-ids="discoveredIds"
        :highlighted-card-id="highlightedCardId"
        :sending="store.sending"
        @select="handleItemClick"
      />
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
          <p v-if="store.micActive" class="mic-status" :class="{ hearing: hasLiveRxSignal }">
            <span class="mic-status-dot" aria-hidden="true"></span>
            {{
              hasLiveRxSignal
                ? "I can hear something!"
                : "Listening... hold me closer if Furby's talking!"
            }}
          </p>
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
              <button
                type="button"
                class="read-again-btn"
                aria-label="Read Furby personality out loud"
                @click="speak(`Furby is a ${personalityBadge.title}! ${personalityBadge.desc}`)"
              >
                🗣️ Hear Furby Speak
              </button>
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
  </div>
</template>

<style scoped>
.kids-view {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-bottom: 2rem;
}

/* Floating Burst Particles */
.burst-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.floating-burst {
  position: absolute;
  font-size: 2.2rem;
  pointer-events: none;
  animation: floatUpAndFade 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  transform: translate(-50%, -50%);
  user-select: none;
}

@keyframes floatUpAndFade {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
  }
  50% {
    transform: translate(-50%, -80px) scale(1.3) rotate(12deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -130px) scale(1.1) rotate(-8deg);
    opacity: 0;
  }
}

/* Hero Playroom Stage Card */
.playroom-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.75rem 0.9rem 0.65rem;
  border-radius: 26px;
  background: linear-gradient(
    180deg,
    rgba(124, 58, 237, 0.12) 0%,
    rgba(236, 72, 153, 0.08) 50%,
    var(--surface) 100%
  );
  border: 2px solid rgba(124, 58, 237, 0.25);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.12);
  overflow: hidden;
}

/* Stage Header Bar */
.stage-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  z-index: 2;
}

.stage-status-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.stage-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.stage-chip:hover {
  transform: scale(1.04);
  background: rgba(255, 255, 255, 0.14);
}

.stage-chip:active {
  transform: scale(0.96);
}

.wake-chip.awake {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.chip-glow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
  flex-shrink: 0;
}

.wake-chip.awake .chip-glow-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.mic-chip.active {
  border-color: rgba(6, 182, 212, 0.5);
  background: rgba(6, 182, 212, 0.18);
  color: #22d3ee;
}

.mic-chip.hearing {
  border-color: rgba(245, 158, 11, 0.6);
  background: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
  animation: pulseChip 0.8s infinite alternate ease-in-out;
}

@keyframes pulseChip {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
}

.stage-tools-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.08);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tool-btn:hover {
  transform: scale(1.12);
  color: var(--text);
  background: rgba(255, 255, 255, 0.16);
}

.tool-btn:active {
  transform: scale(0.92);
}

.tool-btn.active {
  background: rgba(124, 58, 237, 0.3);
  border-color: #a855f7;
  color: #e9d5ff;
}

/* Mascot Arena */
.stage-mascot-arena {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0.1rem 0;
}

/* In-situ Beaming Pulse */
.stage-beaming-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}


.beaming-sonic-ring {
  position: absolute;
  width: 140px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(236, 72, 153, 0.6);
  animation: sonicRings 1.2s infinite ease-out;
}

.beaming-sonic-ring.ring-2 {
  animation-delay: 0.6s;
}

@keyframes sonicRings {
  0% {
    transform: scale(0.5);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.beam-pop-enter-active,
.beam-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.beam-pop-enter-from,
.beam-pop-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Stage Bottom Guide */
.stage-footer-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.75rem;
  padding: 0.22rem 0.8rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 500;
  text-align: center;
  user-select: none;
}

.guide-speaker-icon {
  font-size: 0.85rem;
}

.stage-error {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

/* Compact Discovery & Surprise Bar */
.discovery-capsule-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.discovery-capsule {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0.55rem 0.9rem;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.capsule-progress-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.capsule-count-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.capsule-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.capsule-title strong {
  color: #f59e0b;
}

.capsule-rank-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.2),
    rgba(236, 72, 153, 0.2)
  );
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 0.72rem;
  font-weight: 700;
  color: #fbbf24;
}

.capsule-track {
  height: 6px;
  border-radius: 9999px;
  background: var(--border);
  overflow: hidden;
}

.capsule-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #f59e0b, #ec4899);
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.capsule-surprise-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem 0.95rem;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  color: white;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 #be185d, 0 8px 18px rgba(236, 72, 153, 0.35);
  transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.capsule-surprise-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #be185d, 0 10px 22px rgba(236, 72, 153, 0.45);
}

.capsule-surprise-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #be185d, 0 3px 8px rgba(236, 72, 153, 0.3);
}

.capsule-surprise-btn:hover .surprise-dice-icon {
  transform: rotate(20deg) scale(1.15);
}

.surprise-dice-icon {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.capsule-surprise-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Playful Segmented Category Tabs */
.category-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
  background: var(--surface);
  padding: 0.35rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.65rem 0.2rem;
  border-radius: 16px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  min-height: 48px;
}

.tab-emoji {
  font-size: 1.4rem;
  transition: transform 0.2s ease;
}

.tab-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.15;
}

.tab-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
}

.tab-btn.active {
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.28),
    rgba(236, 72, 153, 0.22)
  );
  border-color: rgba(124, 58, 237, 0.4);
  color: var(--text);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.22);
}

.tab-btn.active .tab-emoji {
  transform: scale(1.16);
}

/* Tactile 3D Toy Cards Grid */
.play-grid-section {
  display: flex;
  flex-direction: column;
}

/* Mood & Personality Section */
.mood-box {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.mood-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.3rem 1.1rem;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.16),
    rgba(6, 182, 212, 0.14)
  );
  border: 2px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.1);
}

.mood-header h3 {
  margin: 0 0 0.3rem;
  font-size: 1.2rem;
  font-weight: 800;
}

.mood-header p {
  margin: 0 0 0.9rem;
  font-size: 0.85rem;
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
  font-size: 0.98rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 #6d28d9, 0 8px 20px rgba(139, 92, 246, 0.35);
  transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ask-mood-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #6d28d9, 0 10px 24px rgba(139, 92, 246, 0.45);
}

.ask-mood-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #6d28d9, 0 3px 8px rgba(139, 92, 246, 0.25);
}

.ask-mood-btn.busy {
  opacity: 0.85;
  filter: brightness(1.15);
}

.ask-mood-btn:disabled:not(.busy) {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.crystal-icon {
  font-size: 1.25rem;
}

.mic-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.7rem 0 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
}

.mic-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted);
  flex-shrink: 0;
}

.mic-status.hearing {
  color: var(--accent-2);
}

.mic-status.hearing .mic-status-dot {
  background: var(--accent-2);
  animation: micHearingPulse 0.8s infinite alternate ease-in-out;
}

@keyframes micHearingPulse {
  0% {
    opacity: 0.5;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1.15);
  }
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
  padding: 1.1rem 1.3rem;
  border-radius: 22px;
  background: var(--surface);
  border: 2px solid var(--badge-color);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.25), 0 10px 24px rgba(0, 0, 0, 0.15);
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
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--badge-color);
}

.badge-desc {
  margin: 0;
  font-size: 0.86rem;
  color: var(--text);
  line-height: 1.4;
}

.read-again-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.55rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--badge-color);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.read-again-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: scale(1.04);
}

.read-again-btn:active {
  transform: scale(0.96);
}

.personality-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.3rem 1rem;
  border-radius: 20px;
  background: var(--surface);
  border: 2px dashed var(--border);
  color: var(--muted);
  gap: 0.45rem;
}

.empty-icon {
  font-size: 2rem;
}

.personality-empty p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.4;
}

@media (prefers-color-scheme: light) {
  .category-tabs {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 4px 16px rgba(148, 163, 184, 0.12);
  }

  .tab-btn {
    color: #64748b;
  }

  .tab-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .tab-btn.active {
    background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%);
    border-color: #c4b5fd;
    color: #6d28d9;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
  }

  .discovery-capsule {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
  }

  .capsule-track {
    background: #e2e8f0;
  }

  .capsule-title strong {
    color: #d97706;
  }

  .capsule-rank-tag {
    background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%);
    border-color: #fde68a;
    color: #b45309;
  }

  .capsule-surprise-btn {
    box-shadow: 0 4px 0 #be185d, 0 8px 18px rgba(236, 72, 153, 0.28);
  }

  .capsule-surprise-btn:hover:not(:disabled) {
    box-shadow: 0 6px 0 #be185d, 0 10px 22px rgba(236, 72, 153, 0.38);
  }

  .playroom-stage {
    background: linear-gradient(180deg, #f5f3ff 0%, #fdf2f8 55%, #ffffff 100%);
    border-color: #ddd6fe;
    box-shadow: 0 8px 30px rgba(168, 85, 247, 0.08);
  }

  .stage-chip {
    background: #ffffff;
    border-color: #e2e8f0;
    color: #1e293b;
    box-shadow: 0 2px 6px rgba(148, 163, 184, 0.12);
  }

  .stage-chip:hover {
    background: #f8fafc;
  }

  .wake-chip.awake {
    background: #dcfce7;
    border-color: #86efac;
    color: #15803d;
  }

  .wake-chip.awake .chip-glow-dot {
    background: #16a34a;
    box-shadow: 0 0 6px #16a34a;
  }

  .mic-chip.active {
    background: #cffafe;
    border-color: #67e8f9;
    color: #0e7490;
  }

  .tool-btn {
    background: #ffffff;
    border-color: #e2e8f0;
    color: #64748b;
    box-shadow: 0 2px 6px rgba(148, 163, 184, 0.1);
  }

  .tool-btn:hover {
    background: #f8fafc;
    color: #0f172a;
  }

  .tool-btn.active {
    background: #ede9fe;
    border-color: #c4b5fd;
    color: #6d28d9;
  }

  .stage-footer-guide {
    background: #ffffff;
    border-color: #e2e8f0;
    color: #64748b;
    box-shadow: 0 2px 6px rgba(148, 163, 184, 0.06);
  }

  .mood-header {
    background: linear-gradient(135deg, #f5f3ff 0%, #ecfeff 100%);
    border-color: #c4b5fd;
  }

  .personality-card {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 4px 16px rgba(148, 163, 184, 0.12);
  }

  .personality-empty {
    background: #ffffff;
    border-color: #cbd5e1;
  }
}
</style>
