import { describe, expect, it } from "vitest";
import { CHECKSUMS } from "./checksums";

describe("CHECKSUMS", () => {
  it("contains exactly 64 empirical checksum strings", () => {
    expect(CHECKSUMS).toBeInstanceOf(Array);
    expect(CHECKSUMS).toHaveLength(64);
  });

  it("ensures every checksum is formatted as a 4-digit quaternary string [0-3]", () => {
    const validQuaternaryPattern = /^[0-3]{4}$/;
    CHECKSUMS.forEach((chk, index) => {
      expect(
        validQuaternaryPattern.test(chk),
        `Checksum at index ${index} ('${chk}') must be a 4-digit quaternary string`,
      ).toBe(true);
    });
  });

  it("verifies packet 1 and packet 2 checksum partitions", () => {
    const packet1Checksums = CHECKSUMS.slice(0, 32);
    const packet2Checksums = CHECKSUMS.slice(32, 64);

    expect(packet1Checksums).toHaveLength(32);
    expect(packet2Checksums).toHaveLength(32);

    // Index 0 for packet 1 is "0000"
    expect(packet1Checksums[0]).toBe("0000");

    // Index 32 (start of packet 2) is "1033"
    expect(packet2Checksums[0]).toBe("1033");

    // Index 63 (end of packet 2) is "3232"
    expect(packet2Checksums[31]).toBe("3232");
  });
});
