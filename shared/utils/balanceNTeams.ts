import type { Player } from '../types'
import { scoreOf } from './balance'

/** playerId -> team index (0-based) */
export type NTeamLocks = Record<string, number>

export interface NTeamOption {
  teams: Player[][]
  scores: number[]
  diff: number
}

/**
 * Balances players across an arbitrary number of teams (validated by the caller to be
 * `2 <= teamCount <= players.length`). Exhaustive search is only tractable for 2 teams
 * (shared/utils/balance.ts) — for any other count this uses a greedy draft (place locked
 * players first, then always give the next unlocked player to the currently-lowest-scoring
 * team) followed by a bounded local-search pass that swaps players between the most- and
 * least-loaded teams whenever it shrinks the spread.
 */
export function balanceNTeams(
  players: Player[],
  teamCount: number,
  locked: NTeamLocks = {},
  maxIterations = 500
): NTeamOption | null {
  if (teamCount < 2 || players.length < teamCount) return null

  const teams: Player[][] = Array.from({ length: teamCount }, () => [])
  const lockedIds = new Set(Object.keys(locked))

  for (const player of players) {
    const teamIndex = locked[player.id]
    if (teamIndex !== undefined && teamIndex >= 0 && teamIndex < teamCount) {
      teams[teamIndex].push(player)
    }
  }

  const unlocked = players
    .filter(player => !lockedIds.has(player.id))
    .sort((a, b) => b.score - a.score)

  for (const player of unlocked) {
    let targetIndex = 0
    let targetScore = scoreOf(teams[0])

    for (let i = 1; i < teamCount; i++) {
      const teamScore = scoreOf(teams[i])
      if (teamScore < targetScore) {
        targetScore = teamScore
        targetIndex = i
      }
    }

    teams[targetIndex].push(player)
  }

  const isLocked = (player: Player) => lockedIds.has(player.id)
  let improved = true
  let iterations = 0

  while (improved && iterations < maxIterations) {
    improved = false
    iterations++

    const scores = teams.map(scoreOf)
    let maxIndex = 0
    let minIndex = 0

    for (let i = 1; i < teamCount; i++) {
      if (scores[i] > scores[maxIndex]) maxIndex = i
      if (scores[i] < scores[minIndex]) minIndex = i
    }

    if (maxIndex === minIndex) break

    const currentDiff = scores[maxIndex] - scores[minIndex]
    let bestSwap: { i: number, j: number, newDiff: number } | null = null

    for (let i = 0; i < teams[maxIndex].length; i++) {
      if (isLocked(teams[maxIndex][i])) continue

      for (let j = 0; j < teams[minIndex].length; j++) {
        if (isLocked(teams[minIndex][j])) continue

        const a = teams[maxIndex][i]
        const b = teams[minIndex][j]
        const newMax = scores[maxIndex] - a.score + b.score
        const newMin = scores[minIndex] - b.score + a.score
        const newDiff = Math.abs(newMax - newMin)

        if (newDiff < currentDiff && (!bestSwap || newDiff < bestSwap.newDiff)) {
          bestSwap = { i, j, newDiff }
        }
      }
    }

    if (bestSwap) {
      const a = teams[maxIndex][bestSwap.i]
      const b = teams[minIndex][bestSwap.j]
      teams[maxIndex][bestSwap.i] = b
      teams[minIndex][bestSwap.j] = a
      improved = true
    }
  }

  const scores = teams.map(scoreOf)
  return { teams, scores, diff: Math.max(...scores) - Math.min(...scores) }
}

/** `teamCount >= 2` and every team can have at least one player. */
export function validateTeamCount(teamCount: number, selectedPlayerCount: number): string | null {
  if (!Number.isFinite(teamCount) || teamCount < 2) {
    return 'Choose at least 2 teams.'
  }
  if (teamCount > selectedPlayerCount) {
    return `Select at least ${teamCount} players to form ${teamCount} teams (currently ${selectedPlayerCount}).`
  }
  return null
}
