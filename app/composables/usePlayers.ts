import type { Player, Role } from '#shared/types'

export interface PlayerInput {
  name: string
  score: number
  role: Role
  tagLevels?: Record<string, number>
  discordUserId?: string
  /** `null` explicitly clears the bank link on update; omit the key entirely to leave it
   * unchanged. See shared/types' Player.bankAccount doc comment. */
  bankAccount?: { bankKey: string, accountNumber: string, accountName?: string } | null
}

export function usePlayers() {
  const players = useState<Player[]>('players', () => [])
  const pending = useState<boolean>('players-pending', () => false)

  async function refresh() {
    pending.value = true
    const requestFetch = import.meta.server ? useRequestFetch() : $fetch
    try {
      players.value = await requestFetch<Player[]>('/api/players')
    } finally {
      pending.value = false
    }
  }

  async function createPlayer(input: PlayerInput) {
    await ensureCrudToken()
    const player = await $fetch<Player>('/api/players', { method: 'POST', body: input })
    players.value = [...players.value, player]
    return player
  }

  async function updatePlayer(id: string, patch: Partial<PlayerInput>) {
    await ensureCrudToken()
    const updated = await $fetch<Player>(`/api/players/${id}`, { method: 'PATCH', body: patch })
    players.value = players.value.map(player => player.id === id ? updated : player)
    return updated
  }

  async function deletePlayer(id: string) {
    await ensureCrudToken()
    await $fetch(`/api/players/${id}`, { method: 'DELETE' })
    players.value = players.value.filter(player => player.id !== id)
  }

  async function uploadPhoto(id: string, dataUrl: string) {
    await ensureCrudToken()
    await $fetch(`/api/players/${id}/photo`, { method: 'PUT', body: { dataUrl } })
    players.value = players.value.map(player => player.id === id ? { ...player, hasPhoto: true } : player)
  }

  return { players, pending, refresh, createPlayer, updatePlayer, deletePlayer, uploadPhoto }
}
