import type { Player } from '#shared/types'
import type { TierKey } from '#shared/utils/tier'
import { getTierKey } from '#shared/utils/tier'

export interface DraftTeam {
  index: number
  name: string
  players: Player[]
  score: number
}

export interface CaseReelSlot {
  key: string
  player: Player
}

export interface CaseReelPlan {
  slots: CaseReelSlot[]
  initialIndex: number
  winnerIndex: number
  signature: string
}

export interface DraftVerdict {
  tierKey: TierKey
  label: string
  message: string
}

export interface DraftSequence {
  preselectedPlayerIds: string[]
  rounds: Player[]
}

type RandomSource = () => number

function browserRandom(): number {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1)
    globalThis.crypto.getRandomValues(value)
    return value[0] / 0x1_0000_0000
  }
  return Math.random()
}

function sameOrder<T extends { id: string }>(left: T[], right: T[]): boolean {
  return left.length === right.length && left.every((item, index) => item.id === right[index]?.id)
}

function avoidBoundaryDuplicate<T extends { id: string }>(items: T[], previousId?: string): T[] {
  if (!previousId || items.length < 2 || items[0]?.id !== previousId) return items

  const replacementIndex = items.findIndex(item => item.id !== previousId)
  if (replacementIndex <= 0) return items

  const copy = [...items]
  ;[copy[0], copy[replacementIndex]] = [copy[replacementIndex], copy[0]]
  return copy
}

/** Fisher-Yates with an injectable source so the reel contract is deterministic in tests. */
export function shufflePlayers<T>(items: T[], random: RandomSource = browserRandom): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
}

export function getUnrevealedPlayers(players: Player[], revealedPlayerIds: string[]): Player[] {
  const revealedIds = new Set(revealedPlayerIds)
  return players.filter(player => !revealedIds.has(player.id))
}

/**
 * Seals the full multi-round draft before the first reel starts. Manually locked players are
 * already public knowledge, so they begin on the board. Each team's remaining player queue is
 * randomized, then the queues are consumed in round-robin order. Reserves never leak into the
 * active-team selection order.
 */
export function createDraftSequence(
  teams: DraftTeam[],
  lockedPlayerIds: string[],
  random: RandomSource = browserRandom
): DraftSequence {
  const orderedTeams = [...teams].sort((left, right) => left.index - right.index)
  const activeIds = new Set(orderedTeams.flatMap(team => team.players.map(player => player.id)))
  const lockedIds = new Set(lockedPlayerIds)
  const preselectedPlayerIds = lockedPlayerIds.filter((id, index) => (
    activeIds.has(id) && lockedPlayerIds.indexOf(id) === index
  ))
  const teamQueues = orderedTeams.map(team => shufflePlayers(
    team.players.filter(player => !lockedIds.has(player.id)),
    random
  ))
  const rounds: Player[] = []

  while (teamQueues.some(queue => queue.length)) {
    for (const queue of teamQueues) {
      const nextPlayer = queue.shift()
      if (nextPlayer) rounds.push(nextPlayer)
    }
  }

  return { preselectedPlayerIds, rounds }
}

/**
 * Builds a fresh, long reel before any motion starts. Each full roster pass is shuffled and
 * prevented from matching the pass immediately before it. The predetermined winner is placed
 * at the final stop so GSAP can use one continuous deceleration with no fake stop or reversal.
 */
export function createCaseReelPlan(
  players: Player[],
  winnerId: string,
  random: RandomSource = browserRandom
): CaseReelPlan {
  if (!players.length) throw new Error('The selection reel needs at least one player.')

  const uniquePlayers = players.filter((player, index) => (
    players.findIndex(candidate => candidate.id === player.id) === index
  ))
  const winner = uniquePlayers.find(player => player.id === winnerId)
  if (!winner) throw new Error('The predetermined winner must be in the player pool.')

  const reelPlayers: Player[] = []
  let previousPass: Player[] = []
  const minimumLeadSlots = Math.max(72, uniquePlayers.length * 6)

  while (reelPlayers.length < minimumLeadSlots) {
    let nextPass = shufflePlayers(uniquePlayers, random)
    if (sameOrder(nextPass, previousPass) && nextPass.length > 1) {
      nextPass = [...nextPass.slice(1), nextPass[0]]
    }
    nextPass = avoidBoundaryDuplicate(nextPass, reelPlayers.at(-1)?.id)
    reelPlayers.push(...nextPass)
    previousPass = nextPass
  }

  // The final stop is appended after the shuffled passes. If the preceding card happens to
  // be the winner too, insert one legitimate decoy so two copies never sit side by side.
  if (uniquePlayers.length > 1 && reelPlayers.at(-1)?.id === winner.id) {
    const decoy = shufflePlayers(uniquePlayers.filter(player => player.id !== winner.id), random)[0]
    if (decoy) reelPlayers.push(decoy)
  }

  const winnerIndex = reelPlayers.length
  reelPlayers.push(winner)

  const slots = reelPlayers.map((player, index) => ({
    key: `case-slot-${index}-${player.id}`,
    player
  }))

  const initialIndex = Math.min(2, winnerIndex)

  return {
    slots,
    initialIndex,
    winnerIndex,
    signature: slots.map(slot => slot.player.id).join('|')
  }
}

export function buildDraftTeams(
  players: Player[],
  assignments: Record<string, number>,
  teamNames: string[],
  teamCount: number
): DraftTeam[] {
  return Array.from({ length: teamCount }, (_, index) => {
    const teamPlayers = players
      .filter(player => assignments[player.id] === index)
      .sort((left, right) => right.score - left.score)

    return {
      index,
      name: teamNames[index] ?? `Team ${index + 1}`,
      players: teamPlayers,
      score: teamPlayers.reduce((total, player) => total + player.score, 0)
    }
  })
}

const VERDICT_COPY: Record<TierKey, Array<(name: string, team: string) => string>> = {
  S: [
    (name, team) => `${name} brings S-tier main-character energy to ${team}. The lobby just got serious.`,
    (name, team) => `${team} opened the gold card. ${name} is already checking the highlight folder.`,
    (name, team) => `${name} enters like the final boss. ${team} approves this message.`
  ],
  A: [
    (name, team) => `Power pick secured. ${name} has joined ${team} with the confidence already enabled.`,
    (name, team) => `${team} pulled an A-tier operator. ${name}, please pretend this was all planned.`,
    (name, team) => `${name} is locked in. ${team} can start printing the tactics now.`
  ],
  B: [
    (name, team) => `${name} is the solid pull. ${team} gets reliable aim and optional chaos.`,
    (name, team) => `B-tier card, S-tier Discord reaction. ${name} joins ${team}.`,
    (name, team) => `${team} found the dependable operator. ${name}, no pressure — only everyone watching.`
  ],
  C: [
    (name, team) => `Chaos specialist unlocked. ${name} joins ${team}, and the script has left the building.`,
    (name, team) => `${team} pulled the plot twist. ${name} is now legally required to hit one impossible shot.`,
    (name, team) => `${name} brings unpredictable energy to ${team}. LAN legends have started with less.`
  ],
  D: [
    (name, team) => `Plot twist unlocked: ${name} joins ${team}. Someone cue the comeback music.`,
    (name, team) => `${team} pulled the surprise card. ${name}, the highlight reel is waiting for its origin story.`,
    (name, team) => `${name} enters with zero spoilers and maximum possibilities. ${team} is ready.`
  ]
}

export function getDraftVerdict(
  winner: Player,
  team: DraftTeam,
  random: RandomSource = browserRandom
): DraftVerdict {
  const tierKey = getTierKey(winner.score)
  const copyPool = VERDICT_COPY[tierKey]
  const message = copyPool[Math.floor(random() * copyPool.length)](winner.name, team.name)

  const labels: Record<TierKey, string> = {
    S: 'Main character',
    A: 'Power pick',
    B: 'Solid pull',
    C: 'Chaos specialist',
    D: 'Plot twist unlocked'
  }

  return {
    tierKey,
    label: labels[tierKey],
    message
  }
}
