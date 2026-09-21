import { useStorage } from '@vueuse/core'

export interface TeamBuilderState {
  selectedIds: string[]
  /** playerId -> team index (0-based) */
  assignments: Record<string, number>
  /** subset of assignments' keys that are manually locked (won't move on optimize/random) */
  lockedIds: string[]
  teamNames: string[]
  teamCount: number
  tolerance: number
}

function defaultTeamNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => i === 0 ? 'Team A' : i === 1 ? 'Team B' : `Team ${i + 1}`)
}

function defaultState(): TeamBuilderState {
  return {
    selectedIds: [],
    assignments: {},
    lockedIds: [],
    teamNames: defaultTeamNames(2),
    teamCount: 2,
    tolerance: 6
  }
}

export function retainSelectedTeamState(state: TeamBuilderState, ids: string[]) {
  const selectedIds = [...new Set(ids)]
  const selected = new Set(selectedIds)
  const assignments = Object.fromEntries(
    Object.entries(state.assignments).filter(([id]) => selected.has(id))
  )
  const lockedIds = state.lockedIds.filter(id => selected.has(id) && assignments[id] !== undefined)

  return { selectedIds, assignments, lockedIds }
}

/**
 * Client-only team-building state (selection, assignment, locks, tolerance, team count/names).
 * Persisted to localStorage — never sent to the server. See DESIGN.md decisions log #1-2.
 */
export function useTeamBuilder() {
  const state = useStorage<TeamBuilderState>('cs2fe-team-builder', defaultState())

  function toggleSelect(id: string) {
    if (state.value.selectedIds.includes(id)) {
      state.value.selectedIds = state.value.selectedIds.filter(x => x !== id)
      unassign(id)
    } else {
      state.value.selectedIds = [...state.value.selectedIds, id]
    }
  }

  function selectIds(ids: string[]) {
    const retained = retainSelectedTeamState(state.value, ids)
    state.value.selectedIds = retained.selectedIds
    state.value.assignments = retained.assignments
    state.value.lockedIds = retained.lockedIds
  }

  function clearSelection() {
    selectIds([])
  }

  function assign(id: string, teamIndex: number) {
    state.value.assignments = { ...state.value.assignments, [id]: teamIndex }
    if (!state.value.lockedIds.includes(id)) {
      state.value.lockedIds = [...state.value.lockedIds, id]
    }
  }

  function unassign(id: string) {
    const rest = { ...state.value.assignments }
    delete rest[id]
    state.value.assignments = rest
    state.value.lockedIds = state.value.lockedIds.filter(x => x !== id)
  }

  function toggleLock(id: string) {
    if (state.value.lockedIds.includes(id)) {
      state.value.lockedIds = state.value.lockedIds.filter(x => x !== id)
    } else if (state.value.assignments[id] !== undefined) {
      state.value.lockedIds = [...state.value.lockedIds, id]
    }
  }

  function clearTeams() {
    state.value.assignments = {}
    state.value.lockedIds = []
  }

  function setAssignments(assignments: Record<string, number>) {
    // Optimize/random-balance results replace assignments wholesale, but preserve which
    // ids were already locked — those are the only ones the algorithms were required to keep put.
    state.value.assignments = assignments
  }

  function setTeamCount(count: number) {
    const safeCount = Math.max(2, Math.floor(count))
    const names = state.value.teamNames.slice(0, safeCount)
    while (names.length < safeCount) {
      names.push(defaultTeamNames(safeCount)[names.length])
    }
    state.value.teamNames = names
    state.value.teamCount = safeCount

    // Drop any assignment/lock that no longer has a valid team slot.
    const assignments = { ...state.value.assignments }
    let changed = false
    for (const [id, index] of Object.entries(assignments)) {
      if (index >= safeCount) {
        delete assignments[id]
        changed = true
      }
    }
    if (changed) {
      state.value.assignments = assignments
      state.value.lockedIds = state.value.lockedIds.filter(id => assignments[id] !== undefined)
    }
  }

  function setTeamName(index: number, name: string) {
    const names = [...state.value.teamNames]
    names[index] = name || defaultTeamNames(names.length)[index]
    state.value.teamNames = names
  }

  function setTolerance(value: number) {
    state.value.tolerance = Math.max(0, Math.round(value))
  }

  return {
    state,
    toggleSelect,
    selectIds,
    clearSelection,
    assign,
    unassign,
    toggleLock,
    clearTeams,
    setAssignments,
    setTeamCount,
    setTeamName,
    setTolerance
  }
}
