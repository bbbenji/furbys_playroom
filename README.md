# Furby Console

A browser-based remote control for **2012 / Furby Boom** toys, built on their
acoustic **ComAir** protocol - no Bluetooth, no companion hardware, just your
device's speaker and (optionally) its microphone.

**[Live demo →](https://bbbenji.github.io/furbys_playroom/)**

This is not a clone of Hasbro's Furby Boom app or its virtual Furblings city -
that content is proprietary and its assets aren't reproduced here. This is a
control surface for the _physical_ toy, in the spirit of the open-source
[Hacksby](https://github.com/iafan/Hacksby) project, whose reverse-engineered
protocol this implementation is ported from.

## Features

- **Kids Playroom** - a touch-friendly mode with an animated, reactive Furby
  mascot (with randomized, non-mechanical blinking), big tap-to-play cards for
  tricks/food/songs, a sound-collection tracker with a "Surprise Me" shuffle,
  optional read-aloud and haptic feedback, and a one-tap Furby mood/
  personality check with a live "can I hear it?" signal indicator.
- **Pro Console** - the full technical surface: command grids (actions, food,
  requests, experimental), a raw command sender, the searchable Furbish
  phrasebook, a live activity log, a personality tracker, and an RX signal
  debug panel (live per-tone Goertzel magnitude meters plus an adjustable
  detection threshold) for tuning reception against a real unit.
- Furby wakes itself automatically the moment you send a command, and stays
  awake in the background for as long as you're using the app - no manual
  "wake up" step. This mirrors how the official app behaves (it's the only
  reason the keep-alive re-send interval is known at all - see `Status`
  below); you can still ask Furby to sleep from the Kids Playroom.
- Installable PWA with offline support and update prompts.
- Runs entirely client-side - no server, no account, no data leaves the
  device (microphone audio for RX is processed locally, never uploaded).

## Status

- **Transmit (TX): solid, informally confirmed against a real 2012 Furby.**
  The packet encoder is a faithful port of `Furby::Packet` / `Furby::Audio`
  from Hacksby, including its full 64-entry checksum table and its exact
  audio synthesis timings. `src/comair/packet.test.ts` round-trips all 1024
  possible commands through encode → decode and checks byte-exact output
  against the reference Perl implementation for a known command. Beyond that,
  a tester with a physical unit has confirmed several commands working
  end-to-end (tricks, sleep). Food commands specifically are still uncertain
  in practice - same encoder/synth path as everything else, so if they're not
  landing it's more likely a physical/range issue than a code bug.
- **Receive (RX): experimental, but now tunable without touching code.**
  Decoding Furby's spoken responses via the microphone (Goertzel tone
  detection in `public/goertzel-processor.js`) has not yet been confirmed
  working end-to-end against a physical unit. Mic auto-gain/noise-suppression
  and ultrasonic roll-off vary a lot by device, so `ComAirReceiver`'s
  `magnitudeThreshold` will likely need tuning per-device - Pro Console's
  **RX signal debug** panel now makes that a live slider against real-time
  per-tone magnitude meters instead of a source-code edit.
- **App shell: polished, and hardened by real-device bugs found and fixed
  during testing** - not just desk-tested anymore. Fixes that came directly
  out of testing against a physical Furby: the AudioWorklet failing to load
  under the GitHub Pages subpath deploy (`import.meta.env.BASE_URL` instead
  of an absolute `/`-rooted path), a WebKit bug where a stalled
  `AudioContext.resume()`/`onended` after an audio-session interruption could
  wedge the playback queue permanently (now times out and rebuilds the
  context instead), and the mic staying "in use" on iOS after being switched
  off (an unreleased `MediaStreamAudioSourceNode` - now explicitly
  disconnected on stop). Also: iOS/Safari audio unlock on first tap, friendly
  error messages for mic/AudioWorklet failures, an offline/update toast,
  activity log persisted across reloads, real PNG app icons (192/512 +
  apple-touch-icon), first-run guidance in both UI modes, and a pass of
  mobile-specific fixes (safe-area insets for the notch/home-indicator, a
  `100dvh` fallback so the layout doesn't jump as the browser toolbar
  shows/hides, touch targets brought up to ~40-44px, momentum scrolling on
  internal lists, and a fixed-overlay "sending" banner so it no longer
  shoves the page down and back up on every tap).
- **Protocol coverage: deep.** `src/comair/phrasebook.ts` carries all 352
  entries of Hacksby's reverse-engineered Furbish dictionary (mechanically
  parsed from the upstream Perl source, not hand-typed - see the file header
  for how), searchable/sendable from the in-app Phrasebook. The personality
  tracker records 900–911 sightings from RX over time so you can see what
  Furby's current personality is and how it's drifted, without implying it
  can be set on demand (it can't - see below).
- **Tests** go beyond the packet round-trip now: `src/stores/furby.ts`'s
  send-debounce and auto-wake orchestration, and `ComAirPlayer`'s timeout/
  recovery behavior (the WebKit `resume()`/`onended` fix above) are both
  covered with mocked transmitter/receiver and a fake `AudioContext`, since
  neither is available in the Node test environment this project uses (no
  jsdom dependency - see `src/test-setup.ts`).

### What's left before this is "done"

1. **Validate RX against a real Furby using the new debug panel** (Pro
   Console → RX signal debug) - watch the per-tone meters while Furby talks,
   dial in `magnitudeThreshold` live, and confirm "Ask Furby's Mood" actually
   decodes a personality response end-to-end. This is the main thing
   blocking RX from graduating out of "experimental."
2. **Re-confirm food commands** now that Furby wakes itself automatically
   before every command - the earlier "feeding does nothing" reports may
   share the same root cause as RX not detecting anything (Furby not
   actually awake yet), now fixed as a side effect.
3. Broader TX coverage beyond tricks/sleep - actions, songs, and the
   experimental command set are still only verified by encode/decode
   round-trip, not against the physical toy.

## Corrections vs. common online write-ups

A few details repeated in online write-ups about ComAir don't match the
actual reverse-engineered source. Verified straight from the Hacksby code:

- The four data tones are **not** in ascending frequency order by digit value:
  digit `2` is 18614Hz, _higher_ than digit `3` at 18057Hz. See
  `src/comair/frequencies.ts`.
- Personality codes (900–905, "Princess/Diva/Warrior/Joker/Gossip Queen") are
  **responses Furby sends about its own current personality**, not commands
  you can send to force a personality change. Personality drifts over time
  based on how the toy is treated; it can't be set instantly. The UI reflects
  this - there's no "force personality" button.
- Each packet's audible tone is much shorter than "0.5 seconds" - it's the
  _silence gap between_ the two packets that's ~0.5s, not the tone itself.

## Getting started

### Prerequisites

- Node.js 20+

### Install & run

```sh
npm install
npm run dev
```

Open the app on the same device you'll use to play sound at Furby (a phone is
easiest). Set media volume to ~80%, hold the speaker close to Furby's chest
microphone, and tap a command.

### Build, preview & test

```sh
npm run build     # type-check + production build
npm run preview   # serve the production build locally
npm run test      # run the test suite
```

## What's not included, on purpose

This project does not extract or reproduce assets - sprites, audio,
artwork - from Hasbro's Furby Boom app or its `.obb`/APK. Those assets are
copyrighted and proprietary. Every visual and sound here, including the Kids
Playroom mascot and sound effects, is original and built for this project;
none of it is a recreation of the official app.

## Project structure

```
src/comair/          ComAir protocol: checksums, packet encode/decode,
                      PCM synthesis, Web Audio playback, Goertzel RX, and
                      the known command dictionary
public/goertzel-processor.js   AudioWorklet used for RX tone detection
src/stores/furby.ts  Pinia store wiring the protocol layer to the UI
src/components/      Pro Console UI: command grids, activity log, raw
                      command sender, RX signal debug panel
src/components/kids/ Kids Playroom UI: mascot, play cards, sound effects
src/test-setup.ts    Vitest setup (localStorage polyfill - no jsdom dependency)
```

## License & attribution

Protocol knowledge ported from [iafan/Hacksby](https://github.com/iafan/Hacksby)
(MIT). Educational hobbyist project; no affiliation with Hasbro or GeneralPlus.

---

_Built with AI assistance._
