import { describe, expect, it } from "vitest";
import { makePacket } from "./packet";
import {
  ComAirReceiver,
  friendlyReceiverError,
  type ReceivedCommand,
  type ReceivedPacket,
} from "./receiver";

function feedSequence(receiver: ComAirReceiver, symbols: string[]) {
  for (const sym of symbols) {
    receiver.handleSymbol({
      symbol: sym,
      magnitude: 0.05,
      magnitudes: { [sym]: 0.05 },
    });
  }
}

function packetToInterleavedSymbols(quad12: string): string[] {
  const chars = quad12.split("");
  const res: string[] = ["X"];
  for (const ch of chars) {
    res.push(ch);
    res.push("X");
  }
  return res;
}

describe("ComAirReceiver symbol decoding", () => {
  it("decodes a valid two-packet command sequence end-to-end", () => {
    const receiver = new ComAirReceiver(0.01);
    const receivedPackets: ReceivedPacket[] = [];
    const receivedCommands: ReceivedCommand[] = [];

    receiver.onPacket((p) => receivedPackets.push(p));
    receiver.onCommand((c) => receivedCommands.push(c));

    const [p1, p2] = makePacket(820);
    const p1Symbols = packetToInterleavedSymbols(p1);
    const p2Symbols = packetToInterleavedSymbols(p2);

    feedSequence(receiver, p1Symbols);
    expect(receivedPackets).toHaveLength(1);
    expect(receivedPackets[0].isHighHalf).toBe(true);
    expect(receivedPackets[0].value).toBe(25); // command 820 high byte = 25

    // ComAir packets are separated by ~0.5s of silence, resetting lastSymbol
    receiver.handleSymbol({ symbol: null, magnitude: 0, magnitudes: {} });

    feedSequence(receiver, p2Symbols);
    expect(receivedPackets).toHaveLength(2);
    expect(receivedPackets[1].isHighHalf).toBe(false);
    expect(receivedPackets[1].value).toBe(52); // command 820 low byte = 52

    expect(receivedCommands).toHaveLength(1);
    expect(receivedCommands[0].command).toBe(820);
  });

  it("does not freeze when encountering an invalid checksum packet and still decodes subsequent valid packets", () => {
    const receiver = new ComAirReceiver(0.01);
    const receivedPackets: ReceivedPacket[] = [];
    receiver.onPacket((p) => receivedPackets.push(p));

    // A corrupt 12-digit sequence with invalid checksum
    const corruptSymbols = packetToInterleavedSymbols("000000000000");
    feedSequence(receiver, corruptSymbols);
    expect(receivedPackets).toHaveLength(0);

    // Followed immediately by a valid packet (command 820 high byte)
    const [p1] = makePacket(820);
    const p1Symbols = packetToInterleavedSymbols(p1);
    feedSequence(receiver, p1Symbols);

    // Must successfully decode p1 despite the prior invalid packet
    expect(receivedPackets).toHaveLength(1);
    expect(receivedPackets[0].value).toBe(25);
  });

  it("ignores symbols whose magnitude falls below the threshold", () => {
    const receiver = new ComAirReceiver(0.02);
    const receivedPackets: ReceivedPacket[] = [];
    receiver.onPacket((p) => receivedPackets.push(p));

    const [p1] = makePacket(820);
    const p1Symbols = packetToInterleavedSymbols(p1);

    // Feed with magnitude below 0.02 threshold
    for (const sym of p1Symbols) {
      receiver.handleSymbol({
        symbol: sym,
        magnitude: 0.005,
        magnitudes: { [sym]: 0.005 },
      });
    }

    expect(receivedPackets).toHaveLength(0);
  });
});

describe("friendlyReceiverError", () => {
  it("translates common DOMExceptions to helpful user messages", () => {
    expect(
      friendlyReceiverError(new DOMException("Denied", "NotAllowedError")),
    ).toMatch(/permission was denied/i);

    expect(
      friendlyReceiverError(new DOMException("Not found", "NotFoundError")),
    ).toMatch(/no microphone was found/i);

    expect(
      friendlyReceiverError(new DOMException("Busy", "NotReadableError")),
    ).toMatch(/microphone is busy/i);

    expect(
      friendlyReceiverError(
        new DOMException("Not supported", "NotSupportedError"),
      ),
    ).toMatch(/not supported/i);

    expect(
      friendlyReceiverError(new DOMException("Aborted", "AbortError")),
    ).toMatch(/listener module/i);

    expect(friendlyReceiverError(new Error("Generic mic glitch"))).toBe(
      "Generic mic glitch",
    );
  });
});
