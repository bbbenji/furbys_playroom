/**
 * Canonical Goertzel tone-detection math for the ComAir RX path. This is the
 * source of truth for tests; the live decoder is public/goertzel-processor.js,
 * a plain-JS AudioWorklet processor loaded standalone via
 * audioWorklet.addModule() (see that file's header comment for why it can't
 * just import this module directly). goertzel.test.ts cross-checks that copy
 * against this one so the two can't silently drift apart.
 */
import { BASE_FREQ } from "./frequencies";

// 512 samples (~11.6ms at 44.1kHz / ~10.7ms at 48kHz) fits snugly inside the
// 16-20ms symbol duration without straddling symbol boundaries, while preserving
// ~86Hz frequency resolution (far finer than the 557Hz ComAir tone spacing).
export const WINDOW_SIZE = 512;

export interface GoertzelCoeffs {
  coeff: number;
  cosine: number;
  sinOmega: number;
}

export function computeCoeffs(
  sampleRate: number,
): Record<string, GoertzelCoeffs> {
  const coeffs: Record<string, GoertzelCoeffs> = {};
  for (const symbol in BASE_FREQ) {
    const freq = BASE_FREQ[symbol];
    const k = Math.round((WINDOW_SIZE * freq) / sampleRate);
    const omega = (2 * Math.PI * k) / WINDOW_SIZE;
    const cosine = Math.cos(omega);
    coeffs[symbol] = {
      coeff: 2 * cosine,
      cosine,
      sinOmega: Math.sin(omega),
    };
  }
  return coeffs;
}

export function goertzelMagnitude(
  samples: Float32Array,
  config: GoertzelCoeffs,
): number {
  const n = samples.length;
  const { coeff, cosine, sinOmega } = config;
  let q0 = 0;
  let q1 = 0;
  let q2 = 0;
  for (let i = 0; i < n; i++) {
    q0 = coeff * q1 - q2 + samples[i];
    q2 = q1;
    q1 = q0;
  }
  const real = q1 - q2 * cosine;
  const imag = q2 * sinOmega;
  return Math.sqrt(real * real + imag * imag) / n;
}
