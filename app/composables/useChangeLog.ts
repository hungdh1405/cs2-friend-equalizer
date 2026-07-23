import type { ChangeLogEntry } from '#shared/types'

export function useChangeLog() {
  function fetchLog(params?: { playerId?: string, limit?: number, offset?: number }) {
    return $fetch<{ entries: ChangeLogEntry[], total: number }>('/api/changelog', { query: params })
  }

  return { fetchLog }
}
