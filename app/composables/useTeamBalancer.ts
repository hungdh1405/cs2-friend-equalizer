import type { Player } from '#shared/types'
import type { LockedAssignments } from '#shared/utils/balance'
import type { NTeamLocks } from '#shared/utils/balanceNTeams'
import { validateTeamCount } from '#shared/utils/balanceNTeams'
import { runBalanceInWorker } from './useBalanceWorker'

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Deep-clone into plain JSON-safe data — Vue's reactive proxies aren't structured-cloneable
 * and postMessage() throws DataCloneError if handed one directly. */
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function useTeamBalancer() {
  const { players } = usePlayers()
  const builder = useTeamBuilder()
  const isComputing = ref(false)

  const selectedPlayers = computed<Player[]>(() =>
    builder.state.value.selectedIds
      .map(id => players.value.find(player => player.id === id))
      .filter((player): player is Player => Boolean(player))
  )

  const teamCount = computed(() => builder.state.value.teamCount)

  const teams = computed<Player[][]>(() => {
    const result: Player[][] = Array.from({ length: teamCount.value }, () => [])
    for (const player of selectedPlayers.value) {
      const index = builder.state.value.assignments[player.id]
      if (index !== undefined && index < teamCount.value) {
        result[index].push(player)
      }
    }
    return result
  })

  const teamScores = computed(() => teams.value.map(team => team.reduce((total, p) => total + p.score, 0)))

  const waitingPlayers = computed<Player[]>(() =>
    selectedPlayers.value.filter(player => builder.state.value.assignments[player.id] === undefined)
  )

  const validationError = computed(() => validateTeamCount(teamCount.value, selectedPlayers.value.length))

  function lockedForTwoTeam(): LockedAssignments {
    const locked: LockedAssignments = {}
    for (const id of builder.state.value.lockedIds) {
      const index = builder.state.value.assignments[id]
      if (index === 0) locked[id] = 'A'
      else if (index === 1) locked[id] = 'B'
    }
    return locked
  }

  function lockedForNTeam(): NTeamLocks {
    const locked: NTeamLocks = {}
    for (const id of builder.state.value.lockedIds) {
      const index = builder.state.value.assignments[id]
      if (index !== undefined) locked[id] = index
    }
    return locked
  }

  /** Both the exhaustive 2-team search and the N-team heuristic run in a Web Worker
   * (useBalanceWorker.ts) — with a full 14-player roster the 2-team search alone is a
   * ~250k-combination exhaustive enumeration that can block the main thread for half a
   * second or more; running it off-thread keeps the UI (and the loading state below)
   * responsive instead of freezing on click.
   *
   * Returns the target assignment map WITHOUT applying it — callers (teams.vue) apply it
   * progressively, one player at a time, in sync with each player's fly-into-slot animation,
   * rather than all at once. */
  async function computeInWorker(mode: 'optimize' | 'random', inputPlayers: Player[]): Promise<Record<string, number> | null> {
    isComputing.value = true
    try {
      const response = await runBalanceInWorker({
        mode,
        players: toPlain(inputPlayers),
        teamCount: teamCount.value,
        tolerance: builder.state.value.tolerance,
        lockedTwoTeam: lockedForTwoTeam(),
        lockedNTeam: lockedForNTeam()
      })

      if (teamCount.value === 2) {
        if (!response.twoTeamOption) return null
        const assignments: Record<string, number> = {}
        response.twoTeamOption.teamA.forEach(player => { assignments[player.id] = 0 })
        response.twoTeamOption.teamB.forEach(player => { assignments[player.id] = 1 })
        return assignments
      }
      if (!response.nTeamResult) return null
      const assignments: Record<string, number> = {}
      response.nTeamResult.teams.forEach((team, index) => team.forEach(player => { assignments[player.id] = index }))
      return assignments
    } finally {
      isComputing.value = false
    }
  }

  function computeOptimize(): Promise<Record<string, number> | null> {
    if (validationError.value) return Promise.resolve(null)
    return computeInWorker('optimize', selectedPlayers.value)
  }

  function computeRandomBalance(): Promise<Record<string, number> | null> {
    if (validationError.value) return Promise.resolve(null)

    let inputPlayers = selectedPlayers.value
    if (teamCount.value !== 2) {
      // balanceNTeams is deterministic given input order — shuffle unlocked players first so
      // "random balance" still gives a different-looking (still well-balanced) result each time.
      const lockedIds = new Set(builder.state.value.lockedIds)
      const locked = inputPlayers.filter(player => lockedIds.has(player.id))
      const unlocked = shuffled(inputPlayers.filter(player => !lockedIds.has(player.id)))
      inputPlayers = [...locked, ...unlocked]
    }
    return computeInWorker('random', inputPlayers)
  }

  return {
    selectedPlayers,
    teamCount,
    teams,
    teamScores,
    waitingPlayers,
    validationError,
    isComputing,
    computeOptimize,
    computeRandomBalance
  }
}
