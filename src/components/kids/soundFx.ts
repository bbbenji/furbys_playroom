/**
 * Kid-friendly synthesized Web Audio sound effects.
 *
 * All frequencies are strictly kept below 1500 Hz so they never overlap
 * or interfere with Furby's ultrasonic ComAir carrier frequencies (17.5 kHz – 19 kHz).
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

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.26)
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
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.23)
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
  }
}

export function playFartSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

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
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.31)
}

export function playGiggle() {
  const ctx = getAudioContext()
  if (!ctx) return
  const startTime = ctx.currentTime
  const notes = [440, 554, 440, 587, 523]

  notes.forEach((f, i) => {
    const now = startTime + i * 0.06
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, now)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  })
}
