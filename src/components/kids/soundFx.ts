/**
 * Kid-friendly synthesized Web Audio sound effects.
 *
 * Tonal oscillators are kept below 1500 Hz. The noise-burst textures used
 * for crunch/rasp/thud layers below use a low-pass cutoff up to 3.5kHz for
 * character, but always through two cascaded lowpass stages (~24dB/octave
 * combined) - even at the brightest cutoff used here that's >50dB down by
 * 17.5kHz, i.e. inaudible/negligible there. Both are so nothing here
 * overlaps or interferes with Furby's ultrasonic ComAir carrier frequencies
 * (17.5 kHz - 19 kHz), even though a sound effect and an actual ComAir
 * transmission can be playing out the same speaker at the same moment.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (Ctx) audioCtx = new Ctx()
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/** A short burst of white noise run through two cascaded lowpass stages (~24dB/octave combined), so even at a bright cutoff it's negligible by 17.5kHz+. */
function playNoiseBurst(
  ctx: AudioContext,
  { startTime, duration, cutoff, peakGain }: { startTime: number; duration: number; cutoff: number; peakGain: number },
) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter1 = ctx.createBiquadFilter()
  filter1.type = 'lowpass'
  filter1.frequency.value = cutoff
  const filter2 = ctx.createBiquadFilter()
  filter2.type = 'lowpass'
  filter2.frequency.value = cutoff

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(peakGain, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  source.connect(filter1)
  filter1.connect(filter2)
  filter2.connect(gain)
  gain.connect(ctx.destination)

  source.start(startTime)
  source.stop(startTime + duration + 0.02)
}

/** Wires a fast LFO into an oscillator's frequency param for a buzzy/wobbly flutter. */
function addVibrato(
  ctx: AudioContext,
  target: AudioParam,
  { startTime, duration, rateHz, depthHz }: { startTime: number; duration: number; rateHz: number; depthHz: number },
) {
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = rateHz
  lfoGain.gain.value = depthHz
  lfo.connect(lfoGain)
  lfoGain.connect(target)
  lfo.start(startTime)
  lfo.stop(startTime + duration)
}

export function playPop() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(500, now)
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.08)

  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.09)

  // A touch of soft thud under the tone gives it a tactile "click" instead
  // of a bare whistle.
  playNoiseBurst(ctx, { startTime: now, duration: 0.03, cutoff: 1200, peakGain: 0.06 })
}

export function playBoing() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.12)
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.25)

  gain.gain.setValueAtTime(0.14, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

  addVibrato(ctx, osc.frequency, { startTime: now, duration: 0.25, rateHz: 22, depthHz: 12 })

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.26)

  // A quick thwack at the very start of the bounce gives the spring some snap.
  playNoiseBurst(ctx, { startTime: now, duration: 0.02, cutoff: 1400, peakGain: 0.08 })
}

export function playChime() {
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  const startTime = ctx.currentTime

  notes.forEach((freq, idx) => {
    const now = startTime + idx * 0.07

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.33)

    // A quiet unison layer, detuned a few cents, under each note - the
    // classic "chorus" trick (beating between two near-identical pitches)
    // for turning a flat sine into something that reads as magical/sparkly
    // instead of a plain beep. Detuned in cents rather than pitched up an
    // octave, so it stays under the 1500 Hz ceiling like everything else.
    const shimmer = ctx.createOscillator()
    const shimmerGain = ctx.createGain()
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(freq, now)
    shimmer.detune.setValueAtTime(14, now)
    shimmerGain.gain.setValueAtTime(0.05, now)
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    shimmer.connect(shimmerGain)
    shimmerGain.connect(ctx.destination)
    shimmer.start(now)
    shimmer.stop(now + 0.41)
  })
}

export function playChew() {
  const ctx = getAudioContext()
  if (!ctx) return
  const startTime = ctx.currentTime

  for (let i = 0; i < 3; i++) {
    const now = startTime + i * 0.08
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320 - i * 30, now)
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.06)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.07)

    // A short crunchy noise burst under each bite - the pitch blip alone
    // reads as a beep, not a bite; the noise texture is what sells "crunch."
    playNoiseBurst(ctx, { startTime: now, duration: 0.05, cutoff: 3500, peakGain: 0.09 })
  }
}

export function playFartSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const duration = 0.32

  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(95, now)
  osc.frequency.linearRampToValueAtTime(55, now + 0.18)
  osc.frequency.linearRampToValueAtTime(40, now + 0.28)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(380, now)
  filter.frequency.linearRampToValueAtTime(150, now + 0.28)

  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  // Fast flutter on pitch is what makes a buzzy tone read as a "raspberry"
  // instead of a clean synth sweep.
  addVibrato(ctx, osc.frequency, { startTime: now, duration, rateHz: 32, depthHz: 16 })

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.01)

  // Low, muffled noise layered underneath for the "air" texture real
  // raspberries have that a pure tone sweep can't capture on its own.
  playNoiseBurst(ctx, { startTime: now, duration, cutoff: 900, peakGain: 0.1 })
}

export function playGiggle() {
  const ctx = getAudioContext()
  if (!ctx) return
  const startTime = ctx.currentTime
  const notes = [440, 554, 440, 587, 523]

  let t = 0
  notes.forEach((f) => {
    const now = startTime + t
    // Slightly humanized spacing/length so it doesn't tick along like a
    // metronome - real "ha-ha-ha" giggling isn't perfectly even.
    const noteDuration = 0.055 + Math.random() * 0.025
    const gap = 0.05 + Math.random() * 0.025

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, now)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration)

    // A quick wobble on each note is what turns a flat arpeggio into
    // something that sounds like a laugh instead of a xylophone run.
    addVibrato(ctx, osc.frequency, { startTime: now, duration: noteDuration, rateHz: 26, depthHz: 14 })

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + noteDuration + 0.01)

    t += gap
  })
}
