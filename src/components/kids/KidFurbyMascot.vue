<script setup lang="ts">
import { ref } from "vue";
import { useFurbyStore } from "../../stores/furby";
import { vibrate } from "./haptics";
import { playGiggle } from "./soundFx";

const store = useFurbyStore();
const isWiggling = ref(false);
const showHearts = ref(false);

function onFurbyClick() {
  vibrate(25);
  if (store.soundFxEnabled) {
    playGiggle();
  }
  isWiggling.value = true;
  showHearts.value = true;
  store.triggerMascotReaction("happy", 2200);

  setTimeout(() => {
    isWiggling.value = false;
  }, 600);
  setTimeout(() => {
    showHearts.value = false;
  }, 1800);
}
</script>

<template>
  <div class="mascot-container">
    <div
      class="furby-stage"
      :class="[
        store.mascotMood,
        {
          sending: store.sending !== null,
          awake: store.keepAliveActive,
          wiggle: isWiggling,
        },
      ]"
      role="button"
      tabindex="0"
      aria-label="Interactive Furby Mascot - Tap to tickle!"
      @click="onFurbyClick"
      @keydown.enter="onFurbyClick"
      @keydown.space.prevent="onFurbyClick"
    >
      <!-- Soundwave ripples when transmitting -->
      <div v-if="store.sending !== null" class="soundwaves">
        <span class="wave wave-1"></span>
        <span class="wave wave-2"></span>
        <span class="wave wave-3"></span>
      </div>

      <!-- Floating particle effects based on mood -->
      <div
        v-if="store.mascotMood === 'sleeping'"
        class="particles sleep-particles"
      >
        <span class="zzz z1">Z</span>
        <span class="zzz z2">z</span>
        <span class="zzz z3">z</span>
      </div>

      <div
        v-if="store.mascotMood === 'singing'"
        class="particles music-particles"
      >
        <span class="note n1">♪</span>
        <span class="note n2">♫</span>
        <span class="note n3">♬</span>
      </div>

      <div
        v-if="store.mascotMood === 'eating'"
        class="particles food-particles"
      >
        <span class="crumb c1">✨</span>
        <span class="crumb c2">🍪</span>
        <span class="crumb c3">⭐</span>
      </div>

      <div
        v-if="store.mascotMood === 'farting'"
        class="particles fart-particles"
      >
        <span class="cloud cl1">💨</span>
        <span class="cloud cl2">🫧</span>
      </div>

      <div v-if="showHearts" class="particles heart-particles">
        <span class="heart h1">💖</span>
        <span class="heart h2">⭐</span>
        <span class="heart h3">✨</span>
      </div>

      <!-- SVG Furby Character -->
      <svg
        class="furby-svg"
        viewBox="0 0 200 200"
        width="170"
        height="170"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#9333ea" />
            <stop offset="65%" stop-color="#6b21a8" />
            <stop offset="100%" stop-color="#4c1d95" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#f472b6" />
            <stop offset="100%" stop-color="#db2777" />
          </radialGradient>
          <filter id="furGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              flood-color="#a855f7"
              flood-opacity="0.35"
            />
          </filter>
        </defs>

        <!-- Ears -->
        <g class="ear left-ear">
          <ellipse
            cx="44"
            cy="56"
            rx="22"
            ry="36"
            fill="#7e22ce"
            transform="rotate(-30 44 56)"
          />
          <ellipse
            cx="44"
            cy="56"
            rx="12"
            ry="24"
            fill="#f472b6"
            transform="rotate(-30 44 56)"
          />
        </g>
        <g class="ear right-ear">
          <ellipse
            cx="156"
            cy="56"
            rx="22"
            ry="36"
            fill="#7e22ce"
            transform="rotate(30 156 56)"
          />
          <ellipse
            cx="156"
            cy="56"
            rx="12"
            ry="24"
            fill="#f472b6"
            transform="rotate(30 156 56)"
          />
        </g>

        <!-- Main Body -->
        <circle
          cx="100"
          cy="115"
          r="72"
          fill="url(#bodyGrad)"
          filter="url(#furGlow)"
        />

        <!-- Tummy Patch -->
        <ellipse
          cx="100"
          cy="138"
          rx="42"
          ry="38"
          fill="url(#bellyGrad)"
          opacity="0.9"
        />

        <!-- Feet -->
        <ellipse cx="65" cy="180" rx="18" ry="11" fill="#f59e0b" />
        <ellipse cx="135" cy="180" rx="18" ry="11" fill="#f59e0b" />

        <!-- Face Mask Faceplate -->
        <ellipse cx="100" cy="94" rx="52" ry="42" fill="#1e1b4b" />
        <ellipse cx="100" cy="94" rx="49" ry="39" fill="#2e1065" />

        <!-- Cheeks -->
        <circle
          cx="62"
          cy="106"
          r="8"
          fill="#f43f5e"
          opacity="0.45"
          class="blush"
        />
        <circle
          cx="138"
          cy="106"
          r="8"
          fill="#f43f5e"
          opacity="0.45"
          class="blush"
        />

        <!-- EYES -->
        <g class="eyes-group">
          <!-- Left Eye Socket -->
          <ellipse cx="78" cy="86" rx="18" ry="20" fill="#ffffff" />
          <!-- Right Eye Socket -->
          <ellipse cx="122" cy="86" rx="18" ry="20" fill="#ffffff" />

          <!-- Normal / Active Eyes -->
          <g
            v-if="
              store.mascotMood !== 'sleeping' && store.mascotMood !== 'happy'
            "
            class="normal-pupils"
          >
            <!-- Left Pupil -->
            <ellipse
              cx="78"
              cy="87"
              :rx="
                store.mascotMood === 'farting' ||
                store.mascotMood === 'surprised'
                  ? 14
                  : 10
              "
              :ry="
                store.mascotMood === 'farting' ||
                store.mascotMood === 'surprised'
                  ? 14
                  : 12
              "
              fill="#06b6d4"
            />
            <circle cx="78" cy="87" r="6" fill="#0f172a" />
            <circle cx="74" cy="82" r="3.5" fill="#ffffff" />
            <circle cx="81" cy="90" r="1.8" fill="#ffffff" />

            <!-- Right Pupil -->
            <ellipse
              cx="122"
              cy="87"
              :rx="
                store.mascotMood === 'farting' ||
                store.mascotMood === 'surprised'
                  ? 14
                  : 10
              "
              :ry="
                store.mascotMood === 'farting' ||
                store.mascotMood === 'surprised'
                  ? 14
                  : 12
              "
              fill="#06b6d4"
            />
            <circle cx="122" cy="87" r="6" fill="#0f172a" />
            <circle cx="118" cy="82" r="3.5" fill="#ffffff" />
            <circle cx="125" cy="90" r="1.8" fill="#ffffff" />
          </g>

          <!-- Happy Eyes (^ ^) -->
          <g v-else-if="store.mascotMood === 'happy'" class="happy-eyes">
            <path
              d="M 66 88 Q 78 72 90 88"
              stroke="#1e1b4b"
              stroke-width="4.5"
              fill="none"
              stroke-linecap="round"
            />
            <path
              d="M 110 88 Q 122 72 134 88"
              stroke="#1e1b4b"
              stroke-width="4.5"
              fill="none"
              stroke-linecap="round"
            />
          </g>

          <!-- Sleeping Eyes (- -) -->
          <g v-else-if="store.mascotMood === 'sleeping'" class="sleepy-eyes">
            <path
              d="M 66 88 Q 78 96 90 88"
              stroke="#1e1b4b"
              stroke-width="4.5"
              fill="none"
              stroke-linecap="round"
            />
            <path
              d="M 110 88 Q 122 96 134 88"
              stroke="#1e1b4b"
              stroke-width="4.5"
              fill="none"
              stroke-linecap="round"
            />
          </g>

          <!-- Eyelids (Blinking) -->
          <g class="eyelid-layer">
            <ellipse
              cx="78"
              cy="86"
              rx="19"
              ry="21"
              fill="#2e1065"
              class="eyelid eyelid-left"
            />
            <ellipse
              cx="122"
              cy="86"
              rx="19"
              ry="21"
              fill="#2e1065"
              class="eyelid eyelid-right"
            />
          </g>

          <!-- Eyelashes -->
          <path
            d="M 68 67 L 62 62"
            stroke="#4c1d95"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M 78 64 L 78 57"
            stroke="#4c1d95"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M 88 67 L 94 62"
            stroke="#4c1d95"
            stroke-width="2.5"
            stroke-linecap="round"
          />

          <path
            d="M 112 67 L 106 62"
            stroke="#4c1d95"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M 122 64 L 122 57"
            stroke="#4c1d95"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M 132 67 L 138 62"
            stroke="#4c1d95"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </g>

        <!-- BEAK -->
        <g class="beak-group">
          <!-- Open mouth interior when talking/eating/singing -->
          <ellipse
            v-if="
              store.mascotMood === 'eating' ||
              store.mascotMood === 'singing' ||
              store.mascotMood === 'talking'
            "
            cx="100"
            cy="114"
            rx="14"
            ry="11"
            fill="#881337"
          />
          <ellipse
            v-if="
              store.mascotMood === 'eating' ||
              store.mascotMood === 'singing' ||
              store.mascotMood === 'talking'
            "
            cx="100"
            cy="117"
            rx="8"
            ry="5"
            fill="#fb7185"
          />

          <!-- Upper Beak -->
          <path
            d="M 86 106 Q 100 98 114 106 Q 100 120 86 106 Z"
            fill="#fb923c"
            stroke="#ea580c"
            stroke-width="1.5"
          />

          <!-- Lower Beak -->
          <path
            d="M 89 110 Q 100 118 111 110 Q 100 126 89 110 Z"
            fill="#f97316"
            stroke="#c2410c"
            stroke-width="1.5"
            class="lower-beak"
          />
        </g>
      </svg>

      <!-- Interactive Badge -->
      <div class="tap-hint">
        <span v-if="store.sending !== null">✨ Sending sound... ✨</span>
        <span v-else-if="store.mascotMood === 'eating'">Nom nom nom! 😋</span>
        <span v-else-if="store.mascotMood === 'farting'"
          >Oops! Excuse me! 💨</span
        >
        <span v-else-if="store.mascotMood === 'surprised'">Whoa! 😲</span>
        <span v-else-if="store.mascotMood === 'happy'">Tee-hee! 💖</span>
        <span v-else-if="store.mascotMood === 'singing'">Tra-la-la! 🎶</span>
        <span v-else-if="store.mascotMood === 'talking'"
          >Chit chat chat! 💬</span
        >
        <span v-else-if="store.mascotMood === 'sleeping'">Zzzz... 😴</span>
        <span v-else>Tap to tickle me! 👋</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mascot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.8rem 0;
  position: relative;
}

.furby-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.furby-stage:hover {
  transform: scale(1.04);
}

/* Soft aura while Furby is in listening mode - the only mascot-level cue for it */
.furby-stage.awake::before {
  content: "";
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.28),
    transparent 70%
  );
  animation: awakeGlow 2.4s ease-in-out infinite;
}

@keyframes awakeGlow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.furby-svg {
  filter: drop-shadow(0 10px 22px rgba(124, 58, 237, 0.25));
  overflow: visible;
}

/* Ears animations */
.left-ear {
  transform-origin: 50px 70px;
  animation: earSwayLeft 3.5s ease-in-out infinite;
}

.right-ear {
  transform-origin: 150px 70px;
  animation: earSwayRight 3.5s ease-in-out infinite;
}

@keyframes earSwayLeft {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-8deg);
  }
}

@keyframes earSwayRight {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

/* Eyes Blinking */
.eyelid {
  transform-origin: center;
  transform: scaleY(0);
  transition: transform 0.1s ease;
}

.furby-stage:not(.sleeping) .eyelid {
  animation: blinkEyelids 4.8s infinite;
}

@keyframes blinkEyelids {
  0%,
  93%,
  100% {
    transform: scaleY(0);
  }
  96% {
    transform: scaleY(1);
  }
}

/* Mood behaviors */
.furby-stage.eating .lower-beak,
.furby-stage.talking .lower-beak,
.furby-stage.singing .lower-beak {
  animation: beakChomp 0.24s ease-in-out infinite alternate;
}

@keyframes beakChomp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(4px);
  }
}

/* Every mood gets its own whole-body motion so nothing just sits there flapping its mouth */
.furby-stage.idle {
  animation: idleBreathe 3s ease-in-out infinite;
}

@keyframes idleBreathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.015);
  }
}

.furby-stage.eating {
  animation: munchBob 0.24s ease-in-out infinite alternate;
}

@keyframes munchBob {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(2px);
  }
}

.furby-stage.talking {
  animation: talkNod 0.5s ease-in-out infinite alternate;
}

@keyframes talkNod {
  0% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(2deg);
  }
}

.furby-stage.singing {
  animation: singSway 0.6s ease-in-out infinite alternate;
}

@keyframes singSway {
  0% {
    transform: rotate(-4deg) translateY(-2px);
  }
  100% {
    transform: rotate(4deg) translateY(-2px);
  }
}

.furby-stage.happy {
  animation: happyBounce 0.4s ease-in-out infinite alternate;
}

@keyframes happyBounce {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-7px) scale(1.03);
  }
}

.furby-stage.happy .blush,
.furby-stage.wiggle .blush {
  animation: blushPulse 0.5s ease-in-out infinite alternate;
}

@keyframes blushPulse {
  0% {
    opacity: 0.45;
  }
  100% {
    opacity: 0.85;
  }
}

.furby-stage.farting {
  animation: fartShake 0.15s ease-in-out 4;
}

@keyframes fartShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px) rotate(-2deg);
  }
  75% {
    transform: translateX(4px) rotate(2deg);
  }
}

.furby-stage.surprised {
  animation: startleJump 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes startleJump {
  0% {
    transform: scale(1) translateY(0);
  }
  30% {
    transform: scale(1.12) translateY(-10px);
  }
  60% {
    transform: scale(0.97) translateY(2px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

.furby-stage.sleeping {
  animation: sleepBreathe 3.2s ease-in-out infinite;
}

@keyframes sleepBreathe {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.02) translateY(-2px);
  }
}

.furby-stage.sending .furby-svg {
  animation: glowPulse 0.5s ease-in-out infinite alternate;
}

@keyframes glowPulse {
  0% {
    filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));
  }
  100% {
    filter: drop-shadow(0 0 24px rgba(245, 158, 11, 0.85));
  }
}

/* Declared last so a fresh tap's wiggle always wins over whatever mood animation is running
   (equal specificity everywhere above - last rule in the cascade takes it). */
.furby-stage:active,
.furby-stage.wiggle {
  animation: tickleWiggle 0.4s ease-in-out;
}

@keyframes tickleWiggle {
  0% {
    transform: scale(1) rotate(0deg);
  }
  20% {
    transform: scale(1.1) rotate(-8deg);
  }
  40% {
    transform: scale(1.1) rotate(8deg);
  }
  60% {
    transform: scale(1.06) rotate(-5deg);
  }
  80% {
    transform: scale(1.03) rotate(3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* Soundwaves animation */
.soundwaves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 170px;
  height: 170px;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(245, 158, 11, 0.7);
  animation: ripple 1.2s ease-out infinite;
}

.wave-2 {
  animation-delay: 0.4s;
}

.wave-3 {
  animation-delay: 0.8s;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}

/* Floating Particles */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.sleep-particles .zzz {
  position: absolute;
  font-weight: 900;
  color: #a855f7;
  animation: floatZzz 2.2s infinite ease-out;
}

.z1 {
  right: 30px;
  top: 20px;
  font-size: 1.4rem;
  animation-delay: 0s;
}
.z2 {
  right: 18px;
  top: -2px;
  font-size: 1.1rem;
  animation-delay: 0.7s;
}
.z3 {
  right: 8px;
  top: -22px;
  font-size: 0.85rem;
  animation-delay: 1.4s;
}

@keyframes floatZzz {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.6);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-26px) translateX(12px) scale(1.2);
  }
}

.music-particles .note {
  position: absolute;
  font-size: 1.5rem;
  color: #ec4899;
  animation: floatNote 1.6s infinite ease-out;
}

.n1 {
  left: 24px;
  top: 15px;
  animation-delay: 0s;
}
.n2 {
  right: 28px;
  top: 18px;
  animation-delay: 0.5s;
}
.n3 {
  left: 45px;
  top: -10px;
  animation-delay: 1s;
}

@keyframes floatNote {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.7);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) rotate(15deg) scale(1.1);
  }
}

.food-particles span,
.fart-particles span,
.heart-particles span {
  position: absolute;
  font-size: 1.6rem;
  animation: floatBurst 1.2s ease-out forwards;
}

.c1 {
  left: 30px;
  top: 40px;
}
.c2 {
  right: 25px;
  top: 45px;
  animation-delay: 0.15s;
}
.c3 {
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  animation-delay: 0.25s;
}

.cl1 {
  right: 15px;
  bottom: 35px;
  animation: fartPuff 1.2s ease-out forwards;
}
.cl2 {
  right: 5px;
  bottom: 50px;
  animation: fartPuff 1.2s ease-out 0.2s forwards;
}

@keyframes fartPuff {
  0% {
    opacity: 0;
    transform: scale(0.5) translateX(-10px);
  }
  40% {
    opacity: 1;
    transform: scale(1.3) translateX(10px);
  }
  100% {
    opacity: 0;
    transform: scale(1.6) translateX(25px);
  }
}

.h1 {
  left: 25px;
  top: 20px;
}
.h2 {
  right: 25px;
  top: 20px;
  animation-delay: 0.15s;
}
.h3 {
  left: 50%;
  top: -15px;
  transform: translateX(-50%);
  animation-delay: 0.3s;
}

@keyframes floatBurst {
  0% {
    opacity: 0;
    transform: scale(0.4) translateY(0);
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.2) translateY(-25px);
  }
}

/* Tap Hint / Speech Bubble */
.tap-hint {
  margin-top: 0.3rem;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background 0.2s ease;
}
</style>
