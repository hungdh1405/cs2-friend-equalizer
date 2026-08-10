import type { ChangeLogEntry, GameEvent, Host, Player, Tag } from '#shared/types'

const ROSTER_KEY = 'roster:index'
const TAGS_KEY = 'tags'
const CHANGELOG_KEY = 'changelog:index'
const CHANGELOG_LIMIT = 500
const EVENT_KEY = 'event:current'
const HOSTS_KEY = 'hosts:index'
const VOTE_LOG_FIELDS = new Set<ChangeLogEntry['field']>(['voteCast', 'voteDeclined', 'eventCreated'])

function kv() {
  return useStorage('kv')
}

export async function getRoster(): Promise<Player[]> {
  return (await kv().getItem<Player[]>(ROSTER_KEY)) ?? []
}

export async function setRoster(players: Player[]): Promise<void> {
  await kv().setItem(ROSTER_KEY, players)
}

export async function getTags(): Promise<Tag[]> {
  return (await kv().getItem<Tag[]>(TAGS_KEY)) ?? []
}

export async function setTags(tags: Tag[]): Promise<void> {
  await kv().setItem(TAGS_KEY, tags)
}

export async function getPhoto(playerId: string): Promise<string | null> {
  return kv().getItem<string>(`player-photo:${playerId}`)
}

export async function setPhoto(playerId: string, dataUrl: string): Promise<void> {
  await kv().setItem(`player-photo:${playerId}`, dataUrl)
}

export async function deletePhoto(playerId: string): Promise<void> {
  await kv().removeItem(`player-photo:${playerId}`)
}

export async function getChangeLog(): Promise<ChangeLogEntry[]> {
  return (await kv().getItem<ChangeLogEntry[]>(CHANGELOG_KEY)) ?? []
}

export async function appendChangeLog(entry: ChangeLogEntry): Promise<void> {
  const log = await getChangeLog()
  log.unshift(entry)
  if (log.length > CHANGELOG_LIMIT) log.length = CHANGELOG_LIMIT
  await kv().setItem(CHANGELOG_KEY, log)
}

export async function clearChangeLog(): Promise<void> {
  await kv().removeItem(CHANGELOG_KEY)
}

/** The existing `appendChangeLog` only caps by count (500) — vote-type entries additionally
 * need to be pruned by *age* (~1 month retention), while every other entry type is left
 * alone. Called from the daily host-reminder scheduled task, not on every write. */
export async function pruneVoteChangeLog(olderThanMs: number): Promise<void> {
  const log = await getChangeLog()
  const cutoff = Date.now() - olderThanMs
  const pruned = log.filter(entry => !VOTE_LOG_FIELDS.has(entry.field) || new Date(entry.at).getTime() >= cutoff)
  if (pruned.length !== log.length) await kv().setItem(CHANGELOG_KEY, pruned)
}

export async function getCurrentEvent(): Promise<GameEvent | null> {
  const event = await kv().getItem<GameEvent>(EVENT_KEY)
  // Defensive default for events created before `declinedVoters` existed — never persisted
  // back here, just normalized at the read boundary (same convention as `getRoster`'s `?? []`).
  return event ? { ...event, declinedVoters: event.declinedVoters ?? [] } : event
}

export async function setCurrentEvent(event: GameEvent): Promise<void> {
  await kv().setItem(EVENT_KEY, event)
}

export async function getHosts(): Promise<Host[]> {
  return (await kv().getItem<Host[]>(HOSTS_KEY)) ?? []
}

export async function setHosts(hosts: Host[]): Promise<void> {
  await kv().setItem(HOSTS_KEY, hosts)
}

export async function addHost(host: Host): Promise<Host[]> {
  const hosts = await getHosts()
  if (hosts.some(existing => existing.discordUserId === host.discordUserId)) return hosts
  const updated = [...hosts, host]
  await setHosts(updated)
  return updated
}

export async function removeHost(discordUserId: string): Promise<Host[]> {
  const hosts = await getHosts()
  const updated = hosts.filter(host => host.discordUserId !== discordUserId)
  await setHosts(updated)
  return updated
}

export interface ThrottleRecord {
  attempts: number
  blockedUntil: number | null
}

const THROTTLE_TTL_SECONDS = 60 * 60 * 24

export async function getThrottle(ip: string): Promise<ThrottleRecord | null> {
  return kv().getItem<ThrottleRecord>(`throttle:${ip}`)
}

export async function setThrottle(ip: string, record: ThrottleRecord): Promise<void> {
  await kv().setItem(`throttle:${ip}`, record, { ttl: THROTTLE_TTL_SECONDS })
}

export async function clearThrottle(ip: string): Promise<void> {
  await kv().removeItem(`throttle:${ip}`)
}
