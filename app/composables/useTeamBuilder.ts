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
    state.value.selectedIds = ids
    state.value.assignments = {}
    state.value.lockedIds = []
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

  /** Sets one player's assignment without touching lockedIds — unlike assign() (a manual,
   * deliberate move that also locks the player in place), this is for progressively applying
   * a computed optimize/random-balance result one player at a time as each one's fly-in
   * animation lands, where auto-locking every player would defeat the point of "locked"
   * meaning "the user pinned this one." */
  function setAssignment(id: string, teamIndex: number) {
    state.value.assignments = { ...state.value.assignments, [id]: teamIndex }
  }

  /** Unassigns every NOT-locked player (back to waiting) while leaving locked players' team
   * and lock status untouched. Used before a fresh optimize/random-balance run so every player
   * who's actually being reshuffled visibly starts from "waiting" and flies into their new
   * slot — locked players were never moving anyway, so they correctly stay put throughout. */
  function clearUnlockedAssignments() {
    const assignments: Record<string, number> = {}
    for (const [id, index] of Object.entries(state.value.assignments)) {
      if (state.value.lockedIds.includes(id)) assignments[id] = index
    }
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
    setAssignment,
    clearUnlockedAssignments,
    setTeamCount,
    setTeamName,
    setTolerance
  }
}
