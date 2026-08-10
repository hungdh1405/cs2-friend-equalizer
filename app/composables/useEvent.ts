import type { GameEvent, Host } from '#shared/types'

export function useEvent() {
  const currentEvent = useState<GameEvent | null>('current-event', () => null)
  const hosts = useState<Host[]>('hosts', () => [])
  const pending = useState<boolean>('event-pending', () => false)

  async function refresh() {
    pending.value = true
    const requestFetch = import.meta.server ? useRequestFetch() : $fetch
    try {
      const [event, hostList] = await Promise.all([
        requestFetch<GameEvent | null>('/api/events/current'),
        requestFetch<Host[]>('/api/hosts')
      ])
      currentEvent.value = event
      hosts.value = hostList
    } finally {
      pending.value = false
    }
  }

  async function createEvent(input: { startsAt: string, description?: string }) {
    await ensureCrudToken()
    const created = await $fetch<GameEvent>('/api/events', { method: 'POST', body: input })
    currentEvent.value = created
    return created
  }

  async function updateEvent(input: { startsAt?: string, description?: string }) {
    await ensureCrudToken()
    const updated = await $fetch<GameEvent>('/api/events/current', { method: 'PATCH', body: input })
    currentEvent.value = updated
    return updated
  }

  async function cancelEvent() {
    await ensureCrudToken()
    const canceled = await $fetch<GameEvent>('/api/events/current', { method: 'DELETE' })
    currentEvent.value = canceled
    return canceled
  }

  async function addHost(input: { discordUserId: string, username?: string }) {
    await ensureCrudToken()
    hosts.value = await $fetch<Host[]>('/api/hosts', { method: 'POST', body: input })
  }

  async function removeHost(discordUserId: string) {
    await ensureCrudToken()
    hosts.value = await $fetch<Host[]>(`/api/hosts/${discordUserId}`, { method: 'DELETE' })
  }

  return { currentEvent, hosts, pending, refresh, createEvent, updateEvent, cancelEvent, addHost, removeHost }
}
