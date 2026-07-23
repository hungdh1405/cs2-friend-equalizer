import type { Player } from '../types'

export type TeamSlot = 'A' | 'B'
export type LockedAssignments = Record<string, TeamSlot>

export interface BalanceOption {
  teamA: Player[]
  teamB: Player[]
  reserves: Player[]
  scoreA: number
  scoreB: number
  diff: number
  rolePenalty: number
}

export function scoreOf(players: Player[]): number {
  return players.reduce((total, player) => total + player.score, 0)
}

/** `Math.min(...values)` spreads the whole array as individual call arguments — fine for a
 * handful of values, but a "random balance" accepted-pool of hundreds of thousands of options
 * (a wide tolerance over an exhaustive search) blows the call stack. A plain reduce has no
 * such limit regardless of array size. */
function minOf(values: number[]): number {
  return values.reduce((min, value) => (value < min ? value : min), values[0])
}

export function desiredTeamSizes(totalPlayers: number) {
  const activePlayers = Math.min(Math.max(0, totalPlayers), 10)
  const larger = Math.min(5, Math.ceil(activePlayers / 2))
  const smaller = Math.min(5, Math.floor(activePlayers / 2))
  const reserves = Math.max(0, totalPlayers - activePlayers)
  return { activePlayers, larger, smaller, reserves }
}

export function combinations<T>(items: T[], size: number): T[][] {
  const result: T[][] = []

  function walk(start: number, current: T[]) {
    if (current.length === size) {
      result.push(current.slice())
      return
    }

    for (let index = start; index <= items.length - (size - current.length); index++) {
      current.push(items[index])
      walk(index + 1, current)
      current.pop()
    }
  }

  walk(0, [])
  return result
}

function teamProfile(players: Player[]) {
  return {
    awp: players.filter(player => player.role === 'awper').length,
    tactics: players.filter(player => player.role === 'igl' || player.role === 'support').length,
    top: players.filter(player => player.score >= 80).length
  }
}

function rolePenalty(teamA: Player[], teamB: Player[]): number {
  const a = teamProfile(teamA)
  const b = teamProfile(teamB)
  let penalty = 0

  penalty += Math.abs(a.awp - b.awp) * 2
  penalty += Math.abs(a.tactics - b.tactics) * 1.5
  penalty += Math.abs(a.top - b.top) * 3

  if (a.awp === 0 || b.awp === 0) penalty += 4
  if (a.tactics === 0 || b.tactics === 0) penalty += 3

  return penalty
}

/**
 * All valid 2-team splits for the given players, respecting locked assignments,
 * sorted by score difference then role-balance penalty. Ported from the reference
 * app's exhaustive-combinations approach — only tractable because each team caps at 5.
 */
export function balancedOptions(players: Player[], locked: LockedAssignments = {}): BalanceOption[] {
  if (players.length < 2) return []

  const { activePlayers, larger, smaller } = desiredTeamSizes(players.length)
  const lockedAIds = Object.entries(locked).filter(([, team]) => team === 'A').map(([id]) => id)
  const lockedBIds = Object.entries(locked).filter(([, team]) => team === 'B').map(([id]) => id)
  const allLockedIds = new Set([...lockedAIds, ...lockedBIds])

  if (lockedAIds.length > 5 || lockedBIds.length > 5 || allLockedIds.size > activePlayers) {
    return []
  }

  const activeGroups = players.length > activePlayers
    ? combinations(players, activePlayers)
    : [players]

  const teamASizes = larger === smaller ? [larger] : [larger, smaller]
  const seen = new Set<string>()
  const options: BalanceOption[] = []

  for (const activeGroup of activeGroups) {
    const activeIds = new Set(activeGroup.map(player => player.id))

    if ([...allLockedIds].some(id => !activeIds.has(id))) continue

    for (const teamASize of teamASizes) {
      const teamBSize = activePlayers - teamASize

      if (teamASize > 5 || teamBSize > 5) continue
      if (lockedAIds.length > teamASize || lockedBIds.length > teamBSize) continue

      for (const teamA of combinations(activeGroup, teamASize)) {
        const idsA = new Set(teamA.map(player => player.id))

        if (lockedAIds.some(id => !idsA.has(id))) continue
        if (lockedBIds.some(id => idsA.has(id))) continue

        const teamB = activeGroup.filter(player => !idsA.has(player.id))
        const idsB = new Set(teamB.map(player => player.id))

        if (lockedBIds.some(id => !idsB.has(id))) continue
        if (teamA.length > 5 || teamB.length > 5) continue

        const keyA = teamA.map(player => player.id).sort().join(',')
        const keyB = teamB.map(player => player.id).sort().join(',')
        const activeKey = activeGroup.map(player => player.id).sort().join(',')
        const key = `${activeKey}|A:${keyA}|B:${keyB}`

        if (seen.has(key)) continue
        seen.add(key)

        const scoreA = scoreOf(teamA)
        const scoreB = scoreOf(teamB)
        const reserves = players.filter(player => !activeIds.has(player.id))

        options.push({
          teamA,
          teamB,
          reserves,
          scoreA,
          scoreB,
          diff: Math.abs(scoreA - scoreB),
          rolePenalty: rolePenalty(teamA, teamB)
        })
      }
    }
  }

  return options.sort((a, b) => a.diff - b.diff || a.rolePenalty - b.rolePenalty)
}

/**
 * Above this many players, `balancedOptions()`'s exhaustive enumeration stops being
 * tractable: it materializes every candidate split as a full object (not just the running
 * best), so both time and memory scale combinatorially. 14 players is ~250k candidates and
 * finishes in well under a second; 16 is already ~2M candidates and multiple GB of garbage,
 * which is what actually caused a real 5-minute non-terminating "random balance" click on a
 * 16-player roster (18 players goes further and reliably OOMs). Past this limit,
 * `heuristicTwoTeamOption()` is used instead — not guaranteed perfectly optimal, but
 * converges to a near-optimal split in milliseconds regardless of roster size.
 */
export const EXHAUSTIVE_PLAYER_LIMIT = 14

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Bounded local search: repeatedly swaps one player between teamA/teamB whenever it shrinks
 * the score gap, same pattern as balanceNTeams.ts's swap loop. Mutates teamA/teamB in place. */
function refineTwoTeamSplit(teamA: Player[], teamB: Player[], lockedIds: Set<string>, maxIterations = 300) {
  let scoreA = scoreOf(teamA)
  let scoreB = scoreOf(teamB)
  let improved = true
  let iterations = 0

  while (improved && iterations < maxIterations) {
    improved = false
    iterations++

    const currentDiff = Math.abs(scoreA - scoreB)
    let bestSwap: { i: number, j: number, newDiff: number } | null = null

    for (let i = 0; i < teamA.length; i++) {
      if (lockedIds.has(teamA[i].id)) continue

      for (let j = 0; j < teamB.length; j++) {
        if (lockedIds.has(teamB[j].id)) continue

        const a = teamA[i]
        const b = teamB[j]
        const newDiff = Math.abs((scoreA - a.score + b.score) - (scoreB - b.score + a.score))

        if (newDiff < currentDiff && (!bestSwap || newDiff < bestSwap.newDiff)) {
          bestSwap = { i, j, newDiff }
        }
      }
    }

    if (bestSwap) {
      const a = teamA[bestSwap.i]
      const b = teamB[bestSwap.j]
      teamA[bestSwap.i] = b
      teamB[bestSwap.j] = a
      scoreA = scoreA - a.score + b.score
      scoreB = scoreB - b.score + a.score
      improved = true
    }
  }
}

/**
 * Greedy bin-balance (assign each player, in `order`, to whichever open team currently has
 * the lower score) followed by `refineTwoTeamSplit`'s local search — a fast stand-in for
 * `balancedOptions()` once the roster is too large to enumerate exhaustively. `mode: 'optimize'`
 * runs once on a score-descending order (the classic largest-first partition heuristic);
 * `mode: 'random'` runs many attempts on randomly shuffled orders and picks among the
 * near-best results, mirroring `randomBalancedOption`'s own tolerance/role-penalty pooling.
 */
export function heuristicTwoTeamOption(
  players: Player[],
  mode: 'optimize' | 'random',
  tolerance: number,
  locked: LockedAssignments = {}
): BalanceOption | null {
  if (players.length < 2) return null

  const { activePlayers } = desiredTeamSizes(players.length)
  const lockedAIds = new Set(Object.entries(locked).filter(([, team]) => team === 'A').map(([id]) => id))
  const lockedBIds = new Set(Object.entries(locked).filter(([, team]) => team === 'B').map(([id]) => id))

  if (lockedAIds.size > 5 || lockedBIds.size > 5 || lockedAIds.size + lockedBIds.size > activePlayers) {
    return null
  }

  const lockedIds = new Set([...lockedAIds, ...lockedBIds])
  const freePlayers = players.filter(player => !lockedIds.has(player.id))
  const attempts = mode === 'random' ? 150 : 1
  const candidates: BalanceOption[] = []

  for (let attempt = 0; attempt < attempts; attempt++) {
    const order = mode === 'random' ? shuffle(freePlayers) : [...freePlayers].sort((a, b) => b.score - a.score)
    const teamA = players.filter(player => lockedAIds.has(player.id))
    const teamB = players.filter(player => lockedBIds.has(player.id))
    const reserves: Player[] = []
    let scoreA = scoreOf(teamA)
    let scoreB = scoreOf(teamB)

    for (const player of order) {
      if (teamA.length + teamB.length >= activePlayers) {
        reserves.push(player)
        continue
      }

      const aOpen = teamA.length < 5
      const bOpen = teamB.length < 5
      if (!aOpen && !bOpen) {
        reserves.push(player)
        continue
      }

      if (aOpen && (!bOpen || scoreA <= scoreB)) {
        teamA.push(player)
        scoreA += player.score
      } else {
        teamB.push(player)
        scoreB += player.score
      }
    }

    refineTwoTeamSplit(teamA, teamB, lockedIds)
    scoreA = scoreOf(teamA)
    scoreB = scoreOf(teamB)

    candidates.push({
      teamA,
      teamB,
      reserves,
      scoreA,
      scoreB,
      diff: Math.abs(scoreA - scoreB),
      rolePenalty: rolePenalty(teamA, teamB)
    })
  }

  candidates.sort((a, b) => a.diff - b.diff || a.rolePenalty - b.rolePenalty)

  if (mode === 'optimize') return candidates[0] ?? null

  const bestDiff = candidates[0].diff
  const acceptedDiff = Math.max(bestDiff, tolerance)
  const accepted = candidates.filter(option => option.diff <= acceptedDiff)
  const minRolePenalty = minOf(accepted.map(option => option.rolePenalty))
  const fairPool = accepted.filter(option => option.rolePenalty <= minRolePenalty + 4)
  const pool = fairPool.length ? fairPool : accepted

  return pool[Math.floor(Math.random() * pool.length)]
}

export function optimalOption(players: Player[], locked: LockedAssignments = {}): BalanceOption | null {
  if (players.length > EXHAUSTIVE_PLAYER_LIMIT) {
    return heuristicTwoTeamOption(players, 'optimize', 0, locked)
  }
  const options = balancedOptions(players, locked)
  return options[0] ?? null
}

export function randomBalancedOption(
  players: Player[],
  tolerance: number,
  locked: LockedAssignments = {}
): BalanceOption | null {
  if (players.length > EXHAUSTIVE_PLAYER_LIMIT) {
    return heuristicTwoTeamOption(players, 'random', tolerance, locked)
  }

  const options = balancedOptions(players, locked)
  if (!options.length) return null

  const bestDiff = options[0].diff
  const acceptedDiff = Math.max(bestDiff, tolerance)
  const accepted = options.filter(option => option.diff <= acceptedDiff)
  const minRolePenalty = minOf(accepted.map(option => option.rolePenalty))
  const fairPool = accepted.filter(option => option.rolePenalty <= minRolePenalty + 4)
  const pool = fairPool.length ? fairPool : accepted

  return pool[Math.floor(Math.random() * pool.length)]
}
