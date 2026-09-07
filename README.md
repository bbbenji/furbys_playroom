# Furby Console

A browser-based remote control for **2012 / Furby Boom** toys, built on their
acoustic **ComAir** protocol — no Bluetooth, no companion hardware, just your
device's speaker and (optionally) its microphone.

This is not a clone of Hasbro's Furby Boom app or its virtual Furblings city —
that content is proprietary and its assets aren't reproduced here. This is a
control surface for the *physical* toy, in the spirit of the open-source
[Hacksby](https://github.com/iafan/Hacksby) project, whose reverse-engineered
protocol this implementation is ported from.

## Status

- **Transmit (TX): solid.** The packet encoder is a faithful port of
  `Furby::Packet` / `Furby::Audio` from Hacksby, including its full 64-entry
  checksum table and its exact audio synthesis timings. `src/comair/packet.test.ts`
  round-trips all 1024 possible commands through encode → decode and checks
  byte-exact output against the reference Perl implementation for a known
  command.
- **Receive (RX): experimental.** Decoding Furby's spoken responses via the
  microphone (Goertzel tone detection in `public/goertzel-processor.js`) is
  implemented but **not validated against a physical unit** — I built this
  without hardware on hand. Mic auto-gain/noise-suppression and ultrasonic
  roll-off vary a lot by device, so treat RX as a starting point that will
  likely need threshold tuning (`ComAirReceiver`'s `magnitudeThreshold`) for
  your hardware.
- **App shell: polished.** iOS/Safari audio unlock on first tap, friendly
  error messages for mic/AudioWorklet failures, an offline/update toast,
  activity log persisted across reloads, real PNG app icons (192/512 +
  apple-touch-icon), and a first-run hint. What's still unverified is
  everything under "Receive" above, plus real-device behavior in general —
  see the punch list below.
- **Protocol coverage: deep.** `src/comair/phrasebook.ts` carries all 352
  entries of Hacksby's reverse-engineered Furbish dictionary (mechanically
  parsed from the upstream Perl source, not hand-typed — see the file header
  for how), searchable/sendable from the in-app Phrasebook. A personality
  tracker (`PersonalityTracker.vue`) records 900-911 sightings from RX over
  time so you can see what Furby's current personality is and how it's
  drifted, without implying it can be set on demand (it can't — see below).

### What's left before this is "done"

1. **Test TX against a real Furby** — the one thing that actually matters
   most and can't be verified from a laptop.
2. Tune (or, if it doesn't pan out, cut) RX based on that test.
3. iOS Safari's AudioWorklet + getUserMedia combination should get an
   explicit pass on real hardware — desk-tested via dev server only so far.

## Corrections vs. common online write-ups

A few details repeated online (and in a plan I was initially handed for this
project) don't match the actual reverse-engineered source. Verified straight
from the Hacksby code:

- The four data tones are **not** in ascending frequency order by digit value:
  digit `2` is 18614Hz, *higher* than digit `3` at 18057Hz. See
  `src/comair/frequencies.ts`.
- Personality codes (900-905, "Princess/Diva/Warrior/Joker/Gossip Queen") are
  **responses Furby sends about its own current personality**, not commands
  you can send to force a personality change. Personality drifts over time
  based on how the toy is treated; it can't be set instantly. The UI reflects
  this — there's no "force personality" button.
- Each packet's audible tone is much shorter than "0.5 seconds" — it's the
  *silence gap between* the two packets that's ~0.5s, not the tone itself.
- There is no real `pyfurbycomm` Python library — I couldn't find one, and it
  doesn't appear in Hacksby's own references either.

## Running it

```sh
npm install
npm run dev
```

Open the app on the same device you'll use to play sound at Furby (a phone is
easiest). Set media volume to ~80%, hold the speaker close to Furby's chest
microphone, and tap a command.

## What's not included, on purpose

The original brief for this project suggested extracting Hasbro's asset
bundles from the Furby Boom `.obb`/APK to restore the original game's sprites
and audio. That means unpacking a copyrighted commercial app's assets — not
something this project does. UI here is original and functional, not a visual
recreation of the Hasbro app.

## Layout

```
src/comair/          ComAir protocol: checksums, packet encode/decode,
                      PCM synthesis, Web Audio playback, Goertzel RX, and
                      the known command dictionary
public/goertzel-processor.js   AudioWorklet used for RX tone detection
src/stores/furby.ts  Pinia store wiring the protocol layer to the UI
src/components/      UI: command grids, activity log, raw command sender
```

## License / attribution

Protocol knowledge ported from [iafan/Hacksby](https://github.com/iafan/Hacksby)
(MIT). Educational hobbyist project; no affiliation with Hasbro or GeneralPlus.
