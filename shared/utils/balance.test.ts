import { describe, expect, it } from 'vitest'
import type { Player, Role } from '../types'
import { balancedOptions, combinations, desiredTeamSizes, EXHAUSTIVE_PLAYER_LIMIT, optimalOption, randomBalancedOption, scoreOf } from './balance'

function player(id: string, score: number, role: Role = 'rifler'): Player {
  return {
    id,
    name: id,
    score,
    role,
    tagLevels: {},
    hasPhoto: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
}

describe('combinations', () => {
  it('produces every unique subset of the requested size', () => {
    const result = combinations([1, 2, 3, 4], 2)
    expect(result).toHaveLength(6)
    expect(result).toContainEqual([1, 2])
    expect(result).toContainEqual([3, 4])
  })
})

describe('desiredTeamSizes', () => {
  it('splits an even count evenly', () => {
    expect(desiredTeamSizes(8)).toMatchObject({ activePlayers: 8, larger: 4, smaller: 4, reserves: 0 })
  })

  it('gives the extra seat to "larger" for odd counts', () => {
    expect(desiredTeamSizes(7)).toMatchObject({ activePlayers: 7, larger: 4, smaller: 3, reserves: 0 })
  })

  it('caps active players at 10 and reserves the rest', () => {
    expect(desiredTeamSizes(13)).toMatchObject({ activePlayers: 10, larger: 5, smaller: 5, reserves: 3 })
  })
})

describe('balancedOptions', () => {
  it('returns nothing for fewer than 2 players', () => {
    expect(balancedOptions([player('a', 50)])).toEqual([])
  })

  it('finds a perfectly balanced split when one exists', () => {
    const players = [player('a', 50), player('b', 50), player('c', 60), player('d', 60)]
    const best = optimalOption(players)
    expect(best).not.toBeNull()
    expect(best!.diff).toBe(0)
    expect(best!.teamA.length + best!.teamB.length).toBe(4)
  })

  it('reserves players beyond the 10-active cap and only fills 5v5', () => {
    const players = Array.from({ length: 13 }, (_, i) => player(`p${i}`, 50 + i))
    const best = optimalOption(players)
    expect(best).not.toBeNull()
    expect(best!.teamA.length).toBeLessThanOrEqual(5)
    expect(best!.teamB.length).toBeLessThanOrEqual(5)
    expect(best!.teamA.length + best!.teamB.length).toBe(10)
    expect(best!.reserves).toHaveLength(3)
  })

  it('respects locked assignments — a locked player always stays on their team', () => {
    const players = [player('a', 90), player('b', 10), player('c', 50), player('d', 50)]
    const options = balancedOptions(players, { a: 'A' })
    expect(options.length).toBeGreaterThan(0)
    for (const option of options) {
      expect(option.teamA.some(p => p.id === 'a')).toBe(true)
    }
  })

  it('returns no options when locks are contradictory (more than 5 on one side)', () => {
    const players = Array.from({ length: 6 }, (_, i) => player(`p${i}`, 50))
    const locked = Object.fromEntries(players.map(p => [p.id, 'A' as const]))
    expect(balancedOptions(players, locked)).toEqual([])
  })

  it('random balance stays within tolerance of the best possible split', () => {
    const players = [player('a', 100), player('b', 40), player('c', 70), player('d', 65), player('e', 55), player('f', 50)]
    const tolerance = 6
    const best = optimalOption(players)!
    for (let i = 0; i < 20; i++) {
      const picked = randomBalancedOption(players, tolerance)!
      expect(picked.diff).toBeLessThanOrEqual(Math.max(best.diff, tolerance))
    }
  })

  it('falls back to the fast heuristic above EXHAUSTIVE_PLAYER_LIMIT instead of hanging/OOMing', () => {
    const players = Array.from({ length: EXHAUSTIVE_PLAYER_LIMIT + 4 }, (_, i) => player(`p${i}`, 30 + i * 5))
    const start = Date.now()
    const best = optimalOption(players)!
    expect(Date.now() - start).toBeLessThan(500)
    expect(best.teamA.length).toBeLessThanOrEqual(5)
    expect(best.teamB.length).toBeLessThanOrEqual(5)
    expect(best.diff).toBeLessThanOrEqual(5)

    for (let i = 0; i < 10; i++) {
      const picked = randomBalancedOption(players, 6)!
      expect(picked.teamA.length + picked.teamB.length).toBe(10)
      expect(picked.reserves).toHaveLength(players.length - 10)
    }
  })

  it('heuristic path still respects locked assignments', () => {
    const players = Array.from({ length: EXHAUSTIVE_PLAYER_LIMIT + 4 }, (_, i) => player(`p${i}`, 30 + i * 5))
    const best = optimalOption(players, { p0: 'A', p1: 'B' })!
    expect(best.teamA.some(p => p.id === 'p0')).toBe(true)
    expect(best.teamB.some(p => p.id === 'p1')).toBe(true)
  })
})

describe('scoreOf', () => {
  it('sums player scores', () => {
    expect(scoreOf([player('a', 10), player('b', 15)])).toBe(25)
  })
})
