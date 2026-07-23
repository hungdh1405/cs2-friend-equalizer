import type { ChangeLogEntry, Player, Tag } from '#shared/types'

const ROSTER_KEY = 'roster:index'
const TAGS_KEY = 'tags'
const CHANGELOG_KEY = 'changelog:index'
const CHANGELOG_LIMIT = 500

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
