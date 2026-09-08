import { describe, expect, it } from "vitest";
import { synthesizeCommand } from "./synth";

describe("synthesizeCommand", () => {
  it("synthesizes valid float PCM samples within [-1, 1]", () => {
    const samples = synthesizeCommand(820);
    expect(samples).toBeInstanceOf(Float32Array);
    expect(samples.length).toBeGreaterThan(44100 * 0.5);

    let maxSample = -Infinity;
    let minSample = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      if (s > maxSample) maxSample = s;
      if (s < minSample) minSample = s;
      expect(s).toBeGreaterThanOrEqual(-1.0);
      expect(s).toBeLessThanOrEqual(1.0);
    }
    // Must contain actual non-zero audio content
    expect(maxSample).toBeGreaterThan(0.5);
    expect(minSample).toBeLessThan(-0.5);
  });

  it("begins and ends with silence samples", () => {
    const samples = synthesizeCommand(865);
    // The first 100 samples should be zero (lead silence gap)
    for (let i = 0; i < 100; i++) {
      expect(samples[i]).toBe(0);
    }
    // The last 100 samples should also be zero
    for (let i = samples.length - 100; i < samples.length; i++) {
      expect(samples[i]).toBe(0);
    }
  });

  it("produces deterministic sample output across multiple runs", () => {
    const run1 = synthesizeCommand(820);
    const run2 = synthesizeCommand(820);
    expect(run1.length).toBe(run2.length);
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i]).toBe(run2[i]);
    }
  });

  it("produces distinct audio for distinct commands", () => {
    const fart = synthesizeCommand(865);
    const sleep = synthesizeCommand(862);
    expect(fart.length).toBe(sleep.length);

    let differs = false;
    for (let i = 0; i < fart.length; i++) {
      if (fart[i] !== sleep[i]) {
        differs = true;
        break;
      }
    }
    expect(differs).toBe(true);
  });

  it("rejects out-of-range commands", () => {
    expect(() => synthesizeCommand(-1)).toThrow(RangeError);
    expect(() => synthesizeCommand(1024)).toThrow(RangeError);
  });

  it("synthesizes valid audio across boundary commands (0 and 1023)", () => {
    const cmd0 = synthesizeCommand(0);
    const cmd1023 = synthesizeCommand(1023);

    expect(cmd0).toBeInstanceOf(Float32Array);
    expect(cmd1023).toBeInstanceOf(Float32Array);
    expect(cmd0.length).toBe(cmd1023.length);

    // Verify neither contains NaN or Infinity
    for (let i = 0; i < cmd0.length; i++) {
      expect(Number.isFinite(cmd0[i])).toBe(true);
      expect(Number.isFinite(cmd1023[i])).toBe(true);
    }
  });

  it("contains an internal silence gap separating Packet 1 and Packet 2", () => {
    const samples = synthesizeCommand(820);
    // There is a ~0.49s silence gap between packets (around sample ~30,000 to ~50,000)
    // Find consecutive zero-sample streaks
    let maxZeroStreak = 0;
    let currentZeroStreak = 0;

    for (let i = 0; i < samples.length; i++) {
      if (samples[i] === 0) {
        currentZeroStreak++;
        if (currentZeroStreak > maxZeroStreak) {
          maxZeroStreak = currentZeroStreak;
        }
      } else {
        currentZeroStreak = 0;
      }
    }

    // 0.49s at 44.1kHz is ~21,609 samples
    expect(maxZeroStreak).toBeGreaterThan(20000);
    expect(maxZeroStreak).toBeLessThan(23000);
  });
});

