import { describe, expect, it } from "vitest";
import {
  ACTIONS,
  ALL_KNOWN_COMMANDS,
  describeCommand,
  EXPERIMENTAL,
  FOOD,
  isPersonalityResponse,
  PERSONALITY_RESPONSES,
  REQUESTS,
} from "./commands";

describe("commands dictionary", () => {
  it("describes curated commands accurately", () => {
    const fart = describeCommand(865);
    expect(fart).toBeDefined();
    expect(fart?.label).toBe("Fart");
    expect(fart?.sendable).toBe(true);

    const keepAlive = describeCommand(820);
    expect(keepAlive).toBeDefined();
    expect(keepAlive?.label).toMatch(/keep-alive/i);
    expect(keepAlive?.sendable).toBe(true);

    const sleep = describeCommand(862);
    expect(sleep).toBeDefined();
    expect(sleep?.label).toBe("Sleep");
  });

  it("falls back to phrasebook when a command is not in the curated table", () => {
    // 0 is in phrasebook: "Me like." / "Da may-may."
    const phrase0 = describeCommand(0);
    expect(phrase0).toBeDefined();
    expect(phrase0?.label).toBe("Me like.");
    expect(phrase0?.sendable).toBe(false);
  });

  it("returns undefined for completely unmapped commands", () => {
    // Check an ID that is neither in curated table nor phrasebook
    expect(describeCommand(999)).toBeUndefined();
  });

  it("correctly identifies personality response IDs", () => {
    for (let id = 900; id <= 911; id++) {
      expect(isPersonalityResponse(id)).toBe(true);
    }
    expect(isPersonalityResponse(899)).toBe(false);
    expect(isPersonalityResponse(912)).toBe(false);
    expect(isPersonalityResponse(820)).toBe(false);
    expect(isPersonalityResponse(865)).toBe(false);
  });

  it("ensures all curated command IDs are integers within [0, 1023]", () => {
    for (const cmd of ALL_KNOWN_COMMANDS) {
      expect(Number.isInteger(cmd.id)).toBe(true);
      expect(cmd.id).toBeGreaterThanOrEqual(0);
      expect(cmd.id).toBeLessThanOrEqual(1023);
      expect(cmd.label.length).toBeGreaterThan(0);
      expect(cmd.description.length).toBeGreaterThan(0);
    }
  });

  it("contains all expected curated lists", () => {
    expect(ACTIONS.length).toBeGreaterThan(0);
    expect(FOOD.length).toBeGreaterThan(0);
    expect(REQUESTS.length).toBeGreaterThan(0);
    expect(EXPERIMENTAL.length).toBeGreaterThan(0);
    expect(PERSONALITY_RESPONSES.length).toBe(12);
  });
});
