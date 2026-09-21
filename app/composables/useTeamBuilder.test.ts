import type { TeamBuilderState } from './useTeamBuilder'
import { describe, expect, it } from 'vitest'
import { retainSelectedTeamState } from './useTeamBuilder'

function state(): TeamBuilderState {
  return {
    selectedIds: ['fixed', 'assigned', 'removed'],
    assignments: { fixed: 0, assigned: 1, removed: 0 },
    lockedIds: ['fixed', 'removed'],
    teamNames: ['Team A', 'Team B'],
    teamCount: 2,
    tolerance: 6
  }
}

describe('team builder selection', () => {
  it('keeps retained assignments and fixed players when selecting the full roster', () => {
    const retained = retainSelectedTeamState(state(), ['fixed', 'assigned', 'new-player', 'fixed'])

    expect(retained).toEqual({
      selectedIds: ['fixed', 'assigned', 'new-player'],
      assignments: { fixed: 0, assigned: 1 },
      lockedIds: ['fixed']
    })
  })

  it('clears team state when the selection is cleared', () => {
    expect(retainSelectedTeamState(state(), [])).toEqual({
      selectedIds: [],
      assignments: {},
      lockedIds: []
    })
  })
})
