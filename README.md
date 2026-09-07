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
  mascot, big tap-to-play cards for tricks/food/songs, a sound-collection
  tracker with a "Surprise Me" shuffle, optional read-aloud and haptic
  feedback, and a one-tap Furby mood/personality check.
- **Pro Console** - the full technical surface: command grids (actions, food,
  requests, experimental), a raw command sender, the searchable Furbish
  phrasebook, a live activity log, and a personality tracker.
- Installable PWA with offline support and update prompts.
- Runs entirely client-side - no server, no account, no data leaves the
  device (microphone audio for RX is processed locally, never uploaded).

## Status

- **Transmit (TX): solid.** The packet encoder is a faithful port of
  `Furby::Packet` / `Furby::Audio` from Hacksby, including its full 64-entry
  checksum table and its exact audio synthesis timings. `src/comair/packet.test.ts`
  round-trips all 1024 possible commands through encode → decode and checks
  byte-exact output against the reference Perl implementation for a known
  command.
- **Receive (RX): experimental.** Decoding Furby's spoken responses via the
  microphone (Goertzel tone detection in `public/goertzel-processor.js`) is
  implemented but **not validated against a physical unit** - built without
  hardware on hand. Mic auto-gain/noise-suppression and ultrasonic roll-off
  vary a lot by device, so treat RX as a starting point that will likely need
  threshold tuning (`ComAirReceiver`'s `magnitudeThreshold`) for your
  hardware.
- **App shell: polished.** iOS/Safari audio unlock on first tap, friendly
  error messages for mic/AudioWorklet failures, an offline/update toast,
  activity log persisted across reloads, real PNG app icons (192/512 +
  apple-touch-icon), and first-run guidance in both UI modes. What's still
  unverified is everything under "Receive" above, plus real-device behavior
  in general - see the punch list below.
- **Protocol coverage: deep.** `src/comair/phrasebook.ts` carries all 352
  entries of Hacksby's reverse-engineered Furbish dictionary (mechanically
  parsed from the upstream Perl source, not hand-typed - see the file header
  for how), searchable/sendable from the in-app Phrasebook. The personality
  tracker records 900–911 sightings from RX over time so you can see what
  Furby's current personality is and how it's drifted, without implying it
  can be set on demand (it can't - see below).

### What's left before this is "done"

1. **Test TX against a real Furby** - the one thing that actually matters
   most and can't be verified from a laptop.
2. Tune (or, if it doesn't pan out, cut) RX based on that test.
3. iOS Safari's AudioWorklet + getUserMedia combination should get an
   explicit pass on real hardware - desk-tested via dev server only so far.

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
                      command sender
src/components/kids/ Kids Playroom UI: mascot, play cards, sound effects
```

## License & attribution

Protocol knowledge ported from [iafan/Hacksby](https://github.com/iafan/Hacksby)
(MIT). Educational hobbyist project; no affiliation with Hasbro or GeneralPlus.

---

_Built with AI assistance._
