import { describe, expect, it } from 'vitest'
import type { Player } from '../types'
import { balanceNTeams, validateTeamCount } from './balanceNTeams'

function player(id: string, score: number): Player {
  return {
    id,
    name: id,
    score,
    role: 'rifler',
    tagLevels: {},
    hasPhoto: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
}

describe('validateTeamCount', () => {
  it('rejects fewer than 2 teams', () => {
    expect(validateTeamCount(1, 10)).toMatch(/at least 2 teams/)
  })

  it('rejects more teams than selected players', () => {
    expect(validateTeamCount(5, 3)).toMatch(/Select at least 5 players/)
  })

  it('accepts a valid count', () => {
    expect(validateTeamCount(3, 9)).toBeNull()
  })

  it('accepts the degenerate case of one player per team', () => {
    expect(validateTeamCount(4, 4)).toBeNull()
  })
})

describe('balanceNTeams', () => {
  it('returns null when there are more teams than players', () => {
    expect(balanceNTeams([player('a', 10)], 2)).toBeNull()
  })

  it('splits players across every team with none left over', () => {
    const players = Array.from({ length: 12 }, (_, i) => player(`p${i}`, 40 + i * 3))
    const result = balanceNTeams(players, 4)!
    expect(result.teams).toHaveLength(4)
    expect(result.teams.reduce((total, team) => total + team.length, 0)).toBe(12)
  })

  it('keeps the max-min score spread small for a divisible, uniform group', () => {
    const players = Array.from({ length: 20 }, (_, i) => player(`p${i}`, 60 + (i % 5)))
    const result = balanceNTeams(players, 4)!
    expect(result.diff).toBeLessThanOrEqual(5)
  })

  it('handles the degenerate case of one player per team', () => {
    const players = [player('a', 100), player('b', 10), player('c', 55), player('d', 40)]
    const result = balanceNTeams(players, 4)!
    expect(result.teams.every(team => team.length === 1)).toBe(true)
  })

  it('respects locked team assignments', () => {
    const players = [player('a', 100), player('b', 10), player('c', 50), player('d', 50), player('e', 50), player('f', 50)]
    const result = balanceNTeams(players, 3, { a: 0, b: 1 })!
    expect(result.teams[0].some(p => p.id === 'a')).toBe(true)
    expect(result.teams[1].some(p => p.id === 'b')).toBe(true)
  })

  it('keeps the two highest scorers on separate teams', () => {
    const players = [
      player('whale1', 100),
      player('whale2', 95),
      player('a', 20),
      player('b', 20),
      player('c', 20),
      player('d', 20)
    ]
    const result = balanceNTeams(players, 2)!
    const teamOfWhale1 = result.teams.findIndex(team => team.some(p => p.id === 'whale1'))
    const teamOfWhale2 = result.teams.findIndex(team => team.some(p => p.id === 'whale2'))
    expect(teamOfWhale1).not.toBe(teamOfWhale2)
  })

  it('still produces a full, valid partition when locks force an upfront imbalance', () => {
    // Both high scorers are pinned to the same team — no swap can fix that (locked
    // players never move), but every player must still land on exactly one team.
    const players = [
      player('whale1', 100),
      player('whale2', 95),
      player('a', 30),
      player('b', 30),
      player('c', 30),
      player('d', 30)
    ]
    const result = balanceNTeams(players, 2, { whale1: 0, whale2: 0 })!
    expect(result.teams[0]).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'whale1' }),
      expect.objectContaining({ id: 'whale2' })
    ]))
    expect(result.teams.reduce((total, team) => total + team.length, 0)).toBe(players.length)
  })
})
