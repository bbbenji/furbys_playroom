import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BASE_FREQ } from "./frequencies";
import { WINDOW_SIZE, computeCoeffs, goertzelMagnitude } from "./goertzel";

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

      for (const [targetSymbol, targetFreq] of Object.entries(BASE_FREQ)) {
        it(`accurately detects pure tone ${targetFreq} Hz as '${targetSymbol}'`, () => {
          const signal = generateSineWave(targetFreq, sr, WINDOW_SIZE);

          let strongestSymbol = "";
          let maxMag = -1;
          const mags: Record<string, number> = {};

          for (const symbol of Object.keys(BASE_FREQ)) {
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
        for (const symbol of Object.keys(BASE_FREQ)) {
          const mag = goertzelMagnitude(silence, coeffs[symbol]);
          expect(mag).toBe(0);
        }
      });

      it("discriminates against audible/ambient frequencies (e.g. 440 Hz, 1 kHz)", () => {
        const a440 = generateSineWave(440, sr, WINDOW_SIZE);
        for (const symbol of Object.keys(BASE_FREQ)) {
          const mag = goertzelMagnitude(a440, coeffs[symbol]);
          // Must not cross detection threshold
          expect(mag).toBeLessThan(0.01);
        }

        const voice1k = generateSineWave(1000, sr, WINDOW_SIZE);
        for (const symbol of Object.keys(BASE_FREQ)) {
          const mag = goertzelMagnitude(voice1k, coeffs[symbol]);
          expect(mag).toBeLessThan(0.01);
        }
      });
    });
  }
});

describe("public/goertzel-processor.js sync check", () => {
  // The AudioWorklet processor is loaded standalone at runtime (plain JS, not
  // bundled by Vite - see its header comment) and hand-maintains its own copy
  // of the frequency table and window size. Nothing at build time ties that
  // copy back to frequencies.ts/goertzel.ts, so a TX tuning change here could
  // silently break real-device RX. This test parses the worklet source and
  // fails loudly the moment the two fall out of sync.
  const workletPath = fileURLToPath(
    new URL("../../public/goertzel-processor.js", import.meta.url),
  );
  const workletSource = readFileSync(workletPath, "utf-8");

  it("uses the same tone frequencies as frequencies.ts", () => {
    const match = workletSource.match(/const FREQUENCIES = \{([^}]+)\}/);
    expect(match, "couldn't find FREQUENCIES in goertzel-processor.js").not.toBeNull();

    const entries: Record<string, number> = {};
    const pairPattern = /['"]?(\w+)['"]?\s*:\s*(\d+)/g;
    let pair: RegExpExecArray | null;
    while ((pair = pairPattern.exec(match![1])) !== null) {
      entries[pair[1]] = Number(pair[2]);
    }

    expect(entries).toEqual(BASE_FREQ);
  });

  it("uses the same window size as goertzel.ts", () => {
    const match = workletSource.match(/const WINDOW_SIZE = (\d+)/);
    expect(match, "couldn't find WINDOW_SIZE in goertzel-processor.js").not.toBeNull();
    expect(Number(match![1])).toBe(WINDOW_SIZE);
  });
});
