/**
 * ComAir packet encoding/decoding, ported from Furby::Packet (Hacksby project,
 * Igor Afanasyev, MIT-licensed): https://github.com/iafan/Hacksby
 */
import { CHECKSUMS } from './checksums'

export interface ComAirPacket {
  /** 12 quaternary digits ('0'-'3'): 4 data digits + 4 checksum digits + 4 fixed footer digits */
  digits: string
}

function dec2bin6(n: number): string {
  return n.toString(2).padStart(6, '0')
}

/** Groups a binary string into 2-bit chunks and maps each chunk to a quaternary digit. */
function bin2quad(bin: string): string {
  let out = ''
  for (let i = 0; i < bin.length; i += 2) {
    out += parseInt(bin.slice(i, i + 2), 2).toString()
  }
  return out
}

/** Reads a quaternary digit string as a big-endian base-4 integer. */
export function quad2dec(quad: string): number {
  let out = 0
  for (const ch of quad) {
    out = (out << 2) | Number(ch)
  }
  return out
}

const FOOTER = '1032'

/**
 * Encodes a command (0..1023) into the two ComAir packets that must be
 * transmitted 0.5s apart. Each returned string is 12 quaternary digits.
 */
export function makePacket(command: number): [string, string] {
  if (!Number.isInteger(command) || command < 0 || command > 1023) {
    throw new RangeError('Command number must be in [0..1023] range')
  }

  const highByte = command >> 5 // 0..31
  const lowByte = (command & 31) + 32 // 32..63, 6th bit forced to 1

  const encodeByte = (byte: number) => bin2quad('11' + dec2bin6(byte)) + CHECKSUMS[byte] + FOOTER

  return [encodeByte(highByte), encodeByte(lowByte)]
}

/**
 * Parses a single received packet's quaternary digit string (with or without
 * the trailing '1032' footer) back into its 6-bit byte value, or -1 if the
 * framing bits or checksum don't match.
 */
export function parsePacket(sequence: string): number {
  const digitsOnly = sequence.replace(/[^0-3]/g, '').replace(/1032$/, '')
  const match = /^([0-3]{4})([0-3]{4})$/.exec(digitsOnly)
  if (!match) return -1

  const byte = quad2dec(match[1])
  if ((byte & 0b11_0000_00) !== 0b11_0000_00) return -1

  const value = byte & 0b0011_1111
  const checksum = CHECKSUMS[value]
  if (checksum !== match[2]) return -1

  return value
}

/** Combines the two 6-bit packet values (0..31 and 32..63) back into a command number. */
export function combinePacketValues(highByte: number, lowByte: number): number {
  return ((highByte & 31) << 5) | (lowByte & 31)
}
