import type { Player } from '../../shared/types'
import type { LockedAssignments } from '../../shared/utils/balance'
import { optimalOption, randomBalancedOption } from '../../shared/utils/balance'
import type { NTeamLocks } from '../../shared/utils/balanceNTeams'
import { balanceNTeams } from '../../shared/utils/balanceNTeams'

export interface BalanceWorkerRequest {
  id: number
  mode: 'optimize' | 'random'
  /** Already shuffled by the caller for the N-team random case — see useTeamBalancer.ts. */
  players: Player[]
  teamCount: number
  tolerance: number
  lockedTwoTeam: LockedAssignments
  lockedNTeam: NTeamLocks
}

export interface BalanceWorkerResponse {
  id: number
  twoTeamOption: ReturnType<typeof optimalOption> | null
  nTeamResult: ReturnType<typeof balanceNTeams> | null
}

// The 2-team case is an exhaustive search over every combination (see balance.ts) — with a
// full 14-player roster that's ~250k combinations and can block the main thread for half a
// second or more. Running it here keeps the UI (and a loading indicator) responsive while it churns.
addEventListener('message', (event: MessageEvent<BalanceWorkerRequest>) => {
  const { id, mode, players, teamCount, tolerance, lockedTwoTeam, lockedNTeam } = event.data

  if (teamCount === 2) {
    const twoTeamOption = mode === 'optimize'
      ? optimalOption(players, lockedTwoTeam)
      : randomBalancedOption(players, tolerance, lockedTwoTeam)
    const response: BalanceWorkerResponse = { id, twoTeamOption, nTeamResult: null }
    postMessage(response)
    return
  }

  const nTeamResult = balanceNTeams(players, teamCount, lockedNTeam)
  const response: BalanceWorkerResponse = { id, twoTeamOption: null, nTeamResult }
  postMessage(response)
})
