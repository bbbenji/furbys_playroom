import { describe, expect, it } from "vitest";

const FREQUENCIES: Record<string, number> = {
  X: 17500,
  "0": 16386,
  "1": 16943,
  "3": 18057,
  "2": 18614,
};
const WINDOW_SIZE = 512;

interface Coeffs {
  coeff: number;
  cosine: number;
  sinOmega: number;
}

function computeCoeffs(sr: number): Record<string, Coeffs> {
  const coeffs: Record<string, Coeffs> = {};
  for (const symbol in FREQUENCIES) {
    const freq = FREQUENCIES[symbol];
    const k = Math.round((WINDOW_SIZE * freq) / sr);
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

function goertzelMagnitude(samples: Float32Array, config: Coeffs): number {
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

function generateSineWave(freq: number, sr: number, length: number): Float32Array {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = Math.sin((2 * Math.PI * freq * i) / sr);
  }
  return out;
}

describe("Goertzel Tone Detector", () => {
  const sampleRates = [44100, 48000];

  for (const sr of sampleRates) {
    describe(`Sample Rate ${sr} Hz`, () => {
      const coeffs = computeCoeffs(sr);

      for (const [targetSymbol, targetFreq] of Object.entries(FREQUENCIES)) {
        it(`accurately detects pure tone ${targetFreq} Hz as '${targetSymbol}'`, () => {
          const signal = generateSineWave(targetFreq, sr, WINDOW_SIZE);

          let strongestSymbol = "";
          let maxMag = -1;
          const mags: Record<string, number> = {};

          for (const symbol of Object.keys(FREQUENCIES)) {
            const mag = goertzelMagnitude(signal, coeffs[symbol]);
            mags[symbol] = mag;
            if (mag > maxMag) {
              maxMag = mag;
              strongestSymbol = symbol;
            }
          }

          expect(strongestSymbol).toBe(targetSymbol);
          // Target tone should have strong magnitude (>0.3 even for off-bin frequencies like 18614Hz at 48kHz)
          expect(maxMag).toBeGreaterThan(0.3);

          // And should clearly dominate any non-matching ComAir frequency
          for (const [symbol, mag] of Object.entries(mags)) {
            if (symbol !== targetSymbol) {
              expect(mag).toBeLessThan(maxMag * 0.25);
            }
          }
        });
      }

      it("evaluates silence as near-zero magnitude across all frequencies", () => {
        const silence = new Float32Array(WINDOW_SIZE);
        for (const symbol of Object.keys(FREQUENCIES)) {
          const mag = goertzelMagnitude(silence, coeffs[symbol]);
          expect(mag).toBe(0);
        }
      });

      it("discriminates against audible/ambient frequencies (e.g. 440 Hz, 1 kHz)", () => {
        const a440 = generateSineWave(440, sr, WINDOW_SIZE);
        for (const symbol of Object.keys(FREQUENCIES)) {
          const mag = goertzelMagnitude(a440, coeffs[symbol]);
          // Must not cross detection threshold
          expect(mag).toBeLessThan(0.01);
        }

        const voice1k = generateSineWave(1000, sr, WINDOW_SIZE);
        for (const symbol of Object.keys(FREQUENCIES)) {
          const mag = goertzelMagnitude(voice1k, coeffs[symbol]);
          expect(mag).toBeLessThan(0.01);
        }
      });
    });
  }
});
