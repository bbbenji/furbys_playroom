# Furby Console & Playroom

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-FF5E5B?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Vitest](https://img.shields.io/badge/Vitest-60%20passed-259d2a?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> A browser-based acoustic remote control and reverse-engineered protocol playground for **2012 / Furby Boom** toys. Works using near-ultrasonic sound waves via your device’s ordinary speaker and microphone - no Bluetooth, no dongles, and no companion hardware required.

**[Launch Live Demo](https://bbbenji.github.io/furbys_playroom/)**

---

## Table of Contents

- [Overview](#overview)
- [Quick Start (Play in 30 Seconds)](#quick-start-play-in-30-seconds)
- [Features](#features)
  - [Kids Playroom](#kids-playroom)
  - [Pro Console](#pro-console)
- [How It Works: The ComAir Protocol](#how-it-works-the-comair-protocol)
  - [Carrier Frequencies & Quaternary Modulation](#carrier-frequencies--quaternary-modulation)
  - [Packet Framing & Checksums](#packet-framing--checksums)
  - [PCM Audio Synthesis](#pcm-audio-synthesis)
  - [AudioWorklet & Goertzel Tone Detection](#audioworklet--goertzel-tone-detection)
  - [Mobile & Web Audio Resilience](#mobile--web-audio-resilience)
- [Corrections & Protocol Facts](#corrections--protocol-facts)
- [Project Architecture](#project-architecture)
- [Development & Testing](#development--testing)
- [What's Not Included, on Purpose](#whats-not-included-on-purpose)
- [Attribution & License](#attribution--license)

## Overview

In 2012, Hasbro and GeneralPlus introduced an acoustic communication system dubbed **ComAir** for the Furby and Furby Boom line. Instead of expensive Bluetooth radios or infrared transceivers, Furby listens and speaks through near-ultrasonic chirps (~16 kHz – 19 kHz) played through standard speakers and detected by small electret microphones.

**Furby Console & Playroom** brings this communication system to the modern web. Built with Vue 3, TypeScript, the Web Audio API, and AudioWorklet DSP, it turns any modern mobile or desktop browser into a fully functioning Furby controller and protocol research laboratory:

- **100% Client-Side**: Zero backend servers, zero account signups, and zero tracking. Microphone audio is analyzed in-memory on the device and never leaves your browser.
- **Installable PWA**: Works offline as a Progressive Web App on iOS, Android, macOS, Windows, and Linux.
- **Dual-Surface Interface**: A colorful, kid-friendly playground with an animated mascot alongside a deep, technical reverse-engineering console.

## Quick Start (Play in 30 Seconds)

```text
[ Your Phone / Laptop ]  --- Ultrasonic Chirps (16-19 kHz) --->  [ Physical Furby ]
     (Media Volume ~80%)                                          (Chest Microphone)
```

1. **Open the App**: Launch **[Live Demo](https://bbbenji.github.io/furbys_playroom/)** on the device you want to play audio from (smartphones work best).
2. **Set Volume**: Adjust your device’s media volume to **around 80–90%**. Avoid 100% on small smartphone speakers to prevent harmonic distortion.
3. **Position Your Speaker**: Hold your device’s speaker **10–20 cm (4–8 inches)** away from Furby’s chest (where its microphone is located).
4. **Tap a Command**: Tap any trick, snack, or song. Furby wakes up automatically on your first tap and stays awake while you use the app!

> [!TIP]
> **Furby not reacting?**
>
> - Ensure Furby has fresh batteries - the acoustic demodulator is sensitive to voltage drops.
> - Move closer to Furby’s belly/chest in rooms with heavy background noise or echo.
> - Verify your device isn’t connected to Bluetooth headphones.

## Features

The application provides two purpose-built modes toggled with a single tap in the header.

### Kids Playroom

Designed for young players and casual fun, featuring an original animated Furby character and tactile cards.

- **Interactive Furby Mascot**:
  - **Smooth Eye Tracking**: Eyes follow your mouse cursor or finger on screen.
  - **Randomized Lifelike Blinking**: Organic intervals with natural double-blinking animations.
  - **Interactive Touch Zones**:
    - Tap forehead to cuddle/pet (hearts & gentle chime).
    - Tap belly to tickle (giggles & joyful wiggle).
    - Tap beak to feed (crunch/chew effects).
    - Tap ears to wiggle (playful boing).
  - **Reactive Expressions**: Visual reactions for happy, eating, singing, surprised, farting, and sleeping states.
- **Sound & Trick Categories**:
  - **Tricks & Pranks**: Laughs, burps, farts, sneezes, and purrs.
  - **Feeding Pantry**: Pizza, cookies, hot peppers, bananas, spaghetti, and veggies.
  - **Music & Beats**: Catchy tunes, party songs, and techno beats.
  - **Mood Check**: Query Furby's current personality in real-time.
- **Collection Tracker & Ranks**:
  - Unlocks items in real-time as you interact with Furby.
  - Progression ranks: _Curious Furbling_ → _Sound Explorer_ → _Furby DJ_ → _Magic Maestro_ → _Grand Furby Whisperer_.
  - Celebratory **confetti particle bursts** when leveling up.
- **Sensory & Accessibility Polish**:
  - **Read-Aloud (TTS)**: Web Speech API voice announcements for titles and reactions.
  - **Haptic Feedback**: Subtle vibration cues on supported mobile devices.
  - **Procedural Audio FX**: Web Audio synthesizer creating retro sound effects (boings, giggles, purrs, chimes) without external audio files.
  - **Surprise Me**: Shuffle button that triggers a random discoverable command.

### Pro Console

A comprehensive technical interface for reverse-engineers, enthusiasts, and debugging physical hardware.

- **Categorized Command Grids**:
  - **Actions**: Sleep, laugh, burp, fart, purr, sneeze, dance, scream, and hiccup.
  - **Food & Feedings**: Snacks, meals, treats, and unpalatable surprises.
  - **Requests & Inquiries**: Ask mood, prompt conversation, and check device state.
  - **Experimental**: Rare and undocumented command sequences discovered through protocol research.
- **352-Word Furbish Phrasebook**:
  - Complete Furbish-to-English dictionary ported from community reverse-engineering data.
  - Live full-text search across Furbish phrases, English translations, and categories.
  - Direct transmission buttons to trigger any phrase instantly.
- **Raw 10-Bit Command Injector**:
  - Transmit any command code from `0` to `1023`.
  - Live packet inspection displaying quaternary encoding and checksum breakdown.
- **Live Goertzel RX Debug Panel**:
  - Real-time spectrum meters monitoring signal magnitudes across all 5 ComAir tones (`0`, `1`, `X`, `3`, `2`).
  - Adjustable sensitivity slider (`magnitudeThreshold`) for tuning reception to individual room acoustics and microphone hardware.
  - **Self-Test Loopback**: Emits a calibrated test tone while listening to verify AudioWorklet microphone capture.
- **Personality Tracker**:
  - Automatically decodes and records Furby Boom personality reports (`900`–`911`: _Princess_, _Diva_, _Joker_, _Chatterbox_, _Warrior_, _Pop Star_).
  - Historical timeline tracking how Furby’s personality drifts over time.
- **Activity Log**:
  - Timestamped stream of all sent (TX) and received (RX) packets.
  - Direction filters (All, TX only, RX only).
  - One-click copy to clipboard for test reports and debugging.

## How It Works: The ComAir Protocol

### Carrier Frequencies & Quaternary Modulation

ComAir encodes 10-bit numerical commands into dual audio packets using 4 data frequencies plus 1 framing/reference frequency. All frequencies lie in the upper audible and near-ultrasonic spectrum (~16.4 kHz to 18.6 kHz):

| Symbol  | Role                      |   Frequency   | Note                            |
| :-----: | :------------------------ | :-----------: | :------------------------------ |
| **`0`** | Quaternary data digit `0` | **16,386 Hz** | Lowest data carrier             |
| **`1`** | Quaternary data digit `1` | **16,943 Hz** | +557 Hz offset                  |
| **`X`** | Framing / Reference tone  | **17,500 Hz** | Separator & sync tone           |
| **`3`** | Quaternary data digit `3` | **18,057 Hz** | _Lower_ frequency than digit 2  |
| **`2`** | Quaternary data digit `2` | **18,614 Hz** | _Higher_ frequency than digit 3 |

> [!IMPORTANT]
> **Non-monotonic tone ordering**: In ComAir, quaternary digit `2` (18,614 Hz) is higher in frequency than digit `3` (18,057 Hz). Implementations that assume a monotonic ascending relationship fail to communicate with physical toys.

### Packet Framing & Checksums

A command number $C \in [0, 1023]$ is broken down and transmitted as **two separate packets** spaced by a **~0.5 second silence interval**:

```text
[ Command (0..1023) ]
  ├── High Byte (5 bits): C >> 5        ──> Packet 1 (12 Quads)
  └── Low Byte  (6 bits): (C & 31) + 32 ──> Packet 2 (12 Quads)

Each Packet Structure:
[ Prefix '11' + 6-bit Data ]  ──>  4 Quaternary Digits (Data)
[ 64-Entry Lookup Checksum ]  ──>  4 Quaternary Digits (Checksum)
[ Fixed Trailing Footer    ]  ──>  4 Quaternary Digits ('1032')
─────────────────────────────────────────────────────────────
Total per packet:                 12 Quaternary Digits
```

1. **Packet 1 (High Byte)**: Carries the top 5 bits of the command.
2. **Inter-Packet Silence**: A ~500 ms gap allows the toy's micro-controller to complete processing and verify the first byte.
3. **Packet 2 (Low Byte)**: Carries the lower 5 bits, with the 6th bit forced to `1` (offset $+32$) to distinguish it as the terminating byte.
4. **Empirical Checksum Table**: The 4-digit checksums are derived from an empirical 64-entry lookup table reverse-engineered from the original hardware ROM.

### PCM Audio Synthesis

Audio frames are synthesized directly in JavaScript into 32-bit floating-point PCM buffers at 44.1 kHz:

- **Symbol Duration**: Each quaternary symbol is held for 16 ms with a 4 ms crossfade window to adjacent symbols.
- **Sine Sweep Midpoint Interpolation**: Rather than abrupt frequency switching, transitions perform a sine sweep towards the midpoint frequency between consecutive symbols.
- **Hann Windowing**: Smooth cosine ramp-in and ramp-out envelopes eliminate ultrasonic clicks and DC transients that would otherwise trip the toy's high-pass filters.

### AudioWorklet & Goertzel Tone Detection

Decoding incoming signals spoken by Furby (RX) requires real-time frequency analysis with minimal CPU latency. Instead of running continuous full-spectrum FFTs, this project implements the **Goertzel Algorithm** inside a dedicated **AudioWorklet**:

```text
Microphone Input
       │
       ▼
[ AudioWorkletNode ] (public/goertzel-processor.js)
       │
       ├── 512-Sample Sliding Window (~11.6ms @ 44.1kHz)
       ├── Targeted Goertzel Evaluation for [16386, 16943, 17500, 18057, 18614] Hz
       └── Spectral Magnitude Thresholding
       │
       ▼ (MessagePort IPC)
[ ComAirReceiver ] (src/comair/receiver.ts)
       │
       ├── Tone Sequence Extraction & Debounce
       ├── Checksum & Framing Verification
       └── Parsed Command / Personality Event
```

- **Frequency Resolution**: The 512-sample window preserves $\approx 86\text{ Hz}$ frequency resolution, cleanly separating the 557 Hz spacing between ComAir carriers.
- **Zero Main-Thread Jitter**: Signal processing runs on the browser's dedicated high-priority audio rendering thread.

### Mobile & Web Audio Resilience

Browsers impose strict security constraints on Web Audio and microphone access, particularly on mobile devices:

- **First-Tap Audio Unlocking**: iOS and Safari suspend `AudioContext` until triggered within a user-gesture call stack. The app captures the first pointer interaction to unlock and warm the audio pipeline before commands are sent.
- **WebKit Stall Recovery Watchdog**: If playback stalls due to OS background interruptions or audio session changes, `ComAirPlayer` enforces an automatic timeout that terminates the stalled node and transparently reconstructs the `AudioContext`.
- **iOS Microphone Cleanup**: Lingering `MediaStreamAudioSourceNode` references on iOS can leave the orange "mic active" indicator on even after stopping. The receiver explicitly tears down and disconnects all audio source nodes.
- **Auto-Wake & Keep-Alive Daemon**: Physical Furbies enter deep sleep after ~60 seconds of inactivity. The console automatically starts a background keep-alive loop (`cmd 820` every 35 seconds, matching the official app's interval) whenever an active session begins.

## Corrections & Protocol Facts

Many hobbyist articles and forum write-ups contain errors regarding ComAir. Based on verified reverse-engineered sources and hardware tests:

1. **Carrier Order is Non-Monotonic**: Digit `2` is **18,614 Hz**, which is _higher_ than digit `3` at **18,057 Hz**. Code assuming sequential ordering will fail.
2. **Personality Codes are Read-Only Reports**: Commands `900`–`911` (_Princess_, _Diva_, _Joker_, etc.) are **status reports sent by Furby to the app**, not commands you can send to force a personality switch. Furby's personality drifts gradually based on physical interactions (petting, feeding, music, rough play).
3. **Tone Timing vs. Gap Timing**: Individual quaternary chirps last only ~20 ms each. The commonly cited "0.5-second tone" is actually the **silence gap** between Packet 1 and Packet 2, not the sound itself.
4. **Auto-Wake Necessity**: Furby cannot receive complex trick or food commands while asleep. Transmitting a short wake pulse first is essential for reliable operation.

## Project Architecture

```text
furby/
├── public/
│   ├── goertzel-processor.js      # Dedicated AudioWorklet for Goertzel RX tone detection
│   ├── favicon.svg / icons        # PWA icons (192x192, 512x512, apple-touch-icon)
│   └── manifest.webmanifest       # PWA offline installation manifest
│
├── src/
│   ├── comair/                    # Core ComAir Protocol Engine
│   │   ├── frequencies.ts         # Tone mappings, sample rate, timing constants
│   │   ├── checksums.ts           # 64-entry empirical checksum table
│   │   ├── packet.ts              # 10-bit encode/decode & quaternary framing
│   │   ├── synth.ts               # Float32 PCM sine sweep synthesis
│   │   ├── player.ts              # Web Audio buffer playback & Safari recovery
│   │   ├── transmitter.ts         # High-level command dispatcher & keep-alive
│   │   ├── goertzel.ts            # Canonical Goertzel math & coefficient generator
│   │   ├── receiver.ts            # AudioWorklet listener & RX packet parser
│   │   ├── commands.ts            # Known command registry & personality mappings
│   │   └── phrasebook.ts          # 352-word reverse-engineered Furbish dictionary
│   │
│   ├── components/                # User Interface Components
│   │   ├── kids/                  # Kids Playroom UI
│   │   │   ├── KidFurbyMascot.vue # Interactive SVG mascot (eye tracking, touch zones, blink)
│   │   │   ├── KidItemGrid.vue    # Tactile category grids (food, tricks, songs)
│   │   │   ├── KidsView.vue       # Main Playroom container, collection ranks, particles
│   │   │   ├── soundFx.ts         # Procedural Web Audio SFX (boings, purrs, chimes)
│   │   │   ├── speech.ts          # Web Speech API TTS wrapper
│   │   │   └── haptics.ts         # Vibration API helper
│   │   │
│   │   ├── ActivityLog.vue        # Live TX/RX activity stream & clipboard export
│   │   ├── CommandGrid.vue        # Pro Console categorized command buttons
│   │   ├── PersonalityTracker.vue # Personality drift history & mood interrogation
│   │   ├── Phrasebook.vue         # Searchable Furbish dictionary
│   │   ├── RawSender.vue          # Arbitrary 10-bit packet injector
│   │   ├── RxDebugPanel.vue       # Real-time tone spectrum meters & threshold slider
│   │   ├── OnboardingHint.vue     # First-run usage banner
│   │   └── PwaToast.vue           # Offline ready & update notification toast
│   │
│   ├── stores/
│   │   └── furby.ts               # Pinia store orchestrating UI, audio, and state
│   ├── style.css                  # Design tokens, dark/light themes, mobile shell
│   └── test-setup.ts              # Headless Vitest environment polyfills
```

## Development & Testing

### Prerequisites

- **Node.js**: `20.x` or later
- **npm**: `10.x` or later

### Installation & Local Server

```bash
# Clone the repository
git clone https://github.com/bbbenji/furbys_playroom.git
cd furbys_playroom

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Test Suite

The test suite covers packet encoding, checksum verification, PCM synthesis, Goertzel mathematical accuracy, AudioWorklet parity, player timeout recovery, and Pinia store orchestration:

```bash
npm run test
```

```text
Test Files  9 passed (9)
     Tests  60 passed (60)
  Duration  4.35s
```

### Production Build & Preview

```bash
# Type-check and generate production PWA bundle
npm run build

# Preview production build locally
npm run preview
```

## What's Not Included, on Purpose

This project **does not contain or reproduce proprietary assets** from Hasbro's official _Furby Boom_ mobile application or its APK/`.obb` archives:

- No copyrighted artwork, sprites, 3D meshes, textures, or animations.
- No proprietary audio samples, sound effects, or voice recordings.
- All visual elements (including the interactive SVG mascot) and all sound effects (procedurally synthesized via Web Audio) are **100% original works created specifically for this open-source project**.

## Attribution & License

- **Protocol Knowledge & Reverse-Engineering**: Ported and adapted from the open-source [iafan/Hacksby](https://github.com/iafan/Hacksby) project by Igor Afanasyev (licensed under MIT).
- **Trademarks & Disclaimer**: Furby, Furblings, and Furby Boom are trademarks of Hasbro, Inc. This project is an independent, non-commercial educational and hobbyist effort and is **not affiliated with, endorsed by, or sponsored by Hasbro or GeneralPlus**.
- **Software License**: Released under the [MIT License](LICENSE).

---

_Built with AI assistance._
