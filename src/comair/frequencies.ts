/**
 * ComAir tone frequencies, ported from Furby::Audio (Hacksby project).
 * 'X' is the reference/framing tone (no data). '0'..'3' are the four
 * quaternary data tones. Note the frequency order is NOT monotonic with
 * digit value: digit '2' (18614Hz) is higher than digit '3' (18057Hz).
 */
export const BASE_FREQ: Readonly<Record<string, number>> = {
  '0': 16386,
  '1': 16943,
  X: 17500,
  '3': 18057,
  '2': 18614,
}

export function baseFreq(symbol: string): number {
  const freq = BASE_FREQ[symbol]
  if (freq === undefined) throw new Error(`Unknown ComAir symbol '${symbol}'`)
  return freq
}

export const SAMPLE_RATE = 44100
export const TOP_FREQ = SAMPLE_RATE / 2

export const BASE_FREQ_LENGTH = 0.016 // hold length per symbol
export const XFADE_LENGTH = 0.004 // crossfade length between symbols
export const LEAD_SILENCE_GAP_LENGTH = 0.005 // silence before/after a full command
export const LEAD_LENGTH = 0.005 // ramp in/out of a packet
export const SILENCE_GAP_LENGTH = 0.5 - LEAD_LENGTH * 2 // gap between the two packets
export const XFADE_VOLUME_SAMPLES = 220
export const LEAD_XFADE_VOLUME_SAMPLES = SAMPLE_RATE * LEAD_LENGTH
