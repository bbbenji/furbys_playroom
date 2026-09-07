/**
 * PCM synthesis of ComAir commands, ported from Furby::Audio (Hacksby project,
 * Igor Afanasyev, MIT-licensed): https://github.com/iafan/Hacksby
 *
 * The original generates a 16-bit PCM WAV; here we synthesize directly into
 * float samples in [-1, 1] for playback via the Web Audio API.
 */
import { makePacket } from './packet'
import {
  BASE_FREQ_LENGTH,
  LEAD_LENGTH,
  LEAD_SILENCE_GAP_LENGTH,
  LEAD_XFADE_VOLUME_SAMPLES,
  SAMPLE_RATE,
  SILENCE_GAP_LENGTH,
  TOP_FREQ,
  XFADE_LENGTH,
  XFADE_VOLUME_SAMPLES,
  baseFreq,
} from './frequencies'

const TWO_PI = 2 * Math.PI

class SampleWriter {
  private chunks: number[] = []

  push(sample: number) {
    this.chunks.push(sample)
  }

  toFloat32Array(): Float32Array {
    return Float32Array.from(this.chunks)
  }
}

function addSilence(out: SampleWriter, lengthSeconds: number) {
  const n = Math.round(lengthSeconds * SAMPLE_RATE)
  for (let i = 0; i <= n; i++) out.push(0)
}

/**
 * Renders a sine sweep from hz1 towards the midpoint of hz1/hz2 (this
 * halfway target is intentional in the original implementation, not a bug —
 * kept for bit-for-bit fidelity with the field-tested reference encoder),
 * with independent linear fade-in/fade-out envelopes.
 */
function addSine(
  out: SampleWriter,
  hz1: number,
  hz2raw: number,
  lengthSeconds: number,
  fadeInSamples: number,
  fadeOutSamples: number,
) {
  const hz2 = (hz1 + hz2raw) / 2
  const lengthSamples = Math.round(lengthSeconds * SAMPLE_RATE)

  for (let pos = 0; pos < lengthSamples; pos++) {
    const time = pos / SAMPLE_RATE
    const hz = (pos / (lengthSamples - 1)) * (hz2 - hz1) + hz1
    const phase = TWO_PI * time * hz

    let vol = 1
    if (fadeInSamples > 0 && pos < fadeInSamples) {
      vol = (pos / (fadeInSamples + 1)) * vol
    }
    if (fadeOutSamples > 0 && lengthSamples - 1 - pos < fadeOutSamples) {
      vol = ((lengthSamples - 1 - pos) / (fadeOutSamples + 1)) * vol
    }

    out.push(Math.sin(phase) * vol)
  }
}

function addRawPacket(out: SampleWriter, symbols: string) {
  const chars = symbols.split('')
  const maxIdx = chars.length - 1

  addSine(out, TOP_FREQ, baseFreq(chars[0]), LEAD_LENGTH, LEAD_XFADE_VOLUME_SAMPLES, XFADE_VOLUME_SAMPLES)

  for (let i = 0; i <= maxIdx; i++) {
    const f = baseFreq(chars[i])
    addSine(out, f, f, BASE_FREQ_LENGTH, XFADE_VOLUME_SAMPLES, XFADE_VOLUME_SAMPLES)
    if (i < maxIdx) {
      addSine(out, f, baseFreq(chars[i + 1]), XFADE_LENGTH, XFADE_VOLUME_SAMPLES, XFADE_VOLUME_SAMPLES)
    }
  }

  addSine(out, baseFreq(chars[maxIdx]), TOP_FREQ, LEAD_LENGTH, XFADE_VOLUME_SAMPLES, LEAD_XFADE_VOLUME_SAMPLES)
}

/** Interleaves the 12 data digits of a packet with the 'X' reference tone: 0123 => X0X1X2X3X */
function addPacket(out: SampleWriter, digits: string) {
  const interleaved = ['', ...digits.split(''), ''].join('X')
  addRawPacket(out, interleaved)
}

/**
 * Synthesizes the full two-packet audio sequence for a command (0..1023) as
 * mono float PCM samples at 44.1kHz, ready to load into an AudioBuffer.
 */
export function synthesizeCommand(command: number): Float32Array {
  const [packet1, packet2] = makePacket(command)
  const out = new SampleWriter()

  addSilence(out, LEAD_SILENCE_GAP_LENGTH)
  addPacket(out, packet1)
  addSilence(out, SILENCE_GAP_LENGTH)
  addPacket(out, packet2)
  addSilence(out, LEAD_SILENCE_GAP_LENGTH)

  return out.toFloat32Array()
}
