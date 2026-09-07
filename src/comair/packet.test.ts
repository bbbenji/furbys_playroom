import { describe, expect, it } from 'vitest'
import { combinePacketValues, makePacket, parsePacket } from './packet'

describe('makePacket / parsePacket round-trip', () => {
  it('round-trips every command in [0, 1023]', () => {
    for (let command = 0; command <= 1023; command++) {
      const [p1, p2] = makePacket(command)
      expect(p1).toHaveLength(12)
      expect(p2).toHaveLength(12)

      const high = parsePacket(p1)
      const low = parsePacket(p2)
      expect(high).toBeGreaterThanOrEqual(0)
      expect(low).toBeGreaterThanOrEqual(0)

      expect(combinePacketValues(high, low)).toBe(command)
    }
  })

  it('matches the known Perl-reference encoding for command 820 (keep-alive)', () => {
    // command 820 = 0b1100110100 -> high5 = 0b11001 = 25, low5 = 0b10100 = 20
    const [p1, p2] = makePacket(820)
    // high byte = 25 -> '11' + '011001' = '11011001' -> quad '3121'; checksum[25] = '1011'
    expect(p1).toBe('31211011' + '1032')
    // low byte = 20 + 32 = 52 -> '11' + '110100' = '11110100' -> quad '3310'; checksum[52] = '2213'
    expect(p2).toBe('33102213' + '1032')
  })

  it('rejects garbage input', () => {
    expect(parsePacket('000000000000')).toBe(-1)
    expect(parsePacket('')).toBe(-1)
  })

  it('rejects out-of-range commands', () => {
    expect(() => makePacket(-1)).toThrow()
    expect(() => makePacket(1024)).toThrow()
  })
})
