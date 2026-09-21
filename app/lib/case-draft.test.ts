import type { Player } from '#shared/types'
import { describe, expect, it } from 'vitest'
import { createCaseReelPlan, createDraftSequence, getDraftVerdict, shufflePlayers } from './case-draft'

function player(index: number, score = 50): Player {
  return {
    id: `player-${index}`,
    name: `Player ${index}`,
    score,
    role: 'rifler',
    tagLevels: {},
    hasPhoto: false,
    createdAt: '',
    updatedAt: ''
  }
}

function seeded(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x1_0000_0000
  }
}

describe('case draft reel', () => {
  it('shuffles without dropping or duplicating a player', () => {
    const players = Array.from({ length: 20 }, (_, index) => player(index))
    const shuffled = shufflePlayers(players, seeded(4))

    expect(shuffled.map(item => item.id).sort()).toEqual(players.map(item => item.id).sort())
    expect(shuffled.map(item => item.id)).not.toEqual(players.map(item => item.id))
  })

  it.each([5, 20])('lands exactly on a predetermined winner with %i players', (count) => {
    const players = Array.from({ length: count }, (_, index) => player(index))
    const winner = players[Math.floor(count / 2)]
    const plan = createCaseReelPlan(players, winner.id, seeded(count))

    expect(plan.slots[plan.winnerIndex]?.player.id).toBe(winner.id)
    expect(plan.winnerIndex).toBe(plan.slots.length - 1)
    expect(plan.winnerIndex - plan.initialIndex).toBeGreaterThanOrEqual(70)
    expect(new Set(plan.slots.map(slot => slot.player.id))).toEqual(new Set(players.map(item => item.id)))
  })

  it('supports the final ceremonial spin when one player remains', () => {
    const onlyPlayer = player(1)
    const plan = createCaseReelPlan([onlyPlayer], onlyPlayer.id, seeded(9))

    expect(plan.slots[plan.winnerIndex]?.player.id).toBe(onlyPlayer.id)
    expect(plan.winnerIndex).toBeGreaterThanOrEqual(72)
  })

  it('creates a different carousel order for a new spin', () => {
    const players = Array.from({ length: 10 }, (_, index) => player(index))
    const first = createCaseReelPlan(players, players[3].id, seeded(1))
    const second = createCaseReelPlan(players, players[3].id, seeded(2))

    expect(first.signature).not.toBe(second.signature)
  })

  it.each([2, 5, 20])('never places duplicate player cards side by side with %i players', (count) => {
    const players = Array.from({ length: count }, (_, index) => player(index))

    for (let seed = 1; seed <= 25; seed++) {
      const plan = createCaseReelPlan(players, players[seed % count].id, seeded(seed))
      for (let index = 1; index < plan.slots.length; index++) {
        expect(plan.slots[index]?.player.id).not.toBe(plan.slots[index - 1]?.player.id)
      }
    }
  })

  it('keeps locked players visible and drafts every other active player exactly once', () => {
    const players = Array.from({ length: 8 }, (_, index) => player(index))
    const activeIds = players.slice(0, 6).map(item => item.id)
    const sequence = createDraftSequence(
      players,
      activeIds,
      [players[1].id, players[4].id, players[7].id, players[1].id],
      seeded(7)
    )

    expect(sequence.preselectedPlayerIds).toEqual([players[1].id, players[4].id])
    expect(sequence.rounds.map(item => item.id).sort()).toEqual(
      activeIds.filter(id => id !== players[1].id && id !== players[4].id).sort()
    )
    expect(new Set(sequence.rounds.map(item => item.id)).size).toBe(sequence.rounds.length)
  })
})

describe('draft verdict', () => {
  it.each([
    [95, 'S'],
    [85, 'A'],
    [65, 'B'],
    [45, 'C'],
    [30, 'D']
  ] as const)('uses the home-page tier for a %i-point player (%s)', (winnerScore, tierKey) => {
    const winner = player(1, winnerScore)
    const teammate = player(2, 100)
    const verdict = getDraftVerdict(winner, {
      index: 0,
      name: 'Team A',
      players: [winner, teammate],
      score: winnerScore + teammate.score
    }, seeded(3))

    expect(verdict.tierKey).toBe(tierKey)
    expect(verdict.message).not.toMatch(/below|average|carry job|danger/i)
  })
})
