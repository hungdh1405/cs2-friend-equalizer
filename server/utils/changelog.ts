import type { ChangeLogEntry, ChangeLogField } from '#shared/types'
import { formatVietnamDateTime } from '#shared/utils/week'
import * as templates from './changelog-messages'

export interface ChangeContext {
  playerId: string
  playerName: string
  ip: string
}

export interface VoteContext {
  discordUserId: string
  discordUsername: string
}

interface WriteEntryContext {
  ip?: string
  playerId?: string
  playerName?: string
  discordUserId?: string
  discordUsername?: string
}

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

function render(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

async function writeEntry(
  ctx: WriteEntryContext,
  field: ChangeLogField,
  from: string | number | undefined,
  to: string | number | undefined,
  message: string
): Promise<void> {
  const entry: ChangeLogEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    ip: ctx.ip,
    playerId: ctx.playerId,
    playerName: ctx.playerName,
    discordUserId: ctx.discordUserId,
    discordUsername: ctx.discordUsername,
    field,
    from,
    to,
    message
  }
  await appendChangeLog(entry)
}

export async function logScoreChange(ctx: ChangeContext, oldScore: number, newScore: number) {
  if (oldScore === newScore) return
  const up = newScore > oldScore
  const pool = up ? templates.SCORE_UP : templates.SCORE_DOWN
  const message = render(pick(pool), {
    name: ctx.playerName,
    old: oldScore,
    new: newScore,
    delta: Math.abs(newScore - oldScore)
  })
  await writeEntry(ctx, 'score', oldScore, newScore, message)
}

export async function logTagLevelChange(ctx: ChangeContext, tagLabel: string, oldLevel: number, newLevel: number) {
  if (oldLevel === newLevel) return
  const up = newLevel > oldLevel
  const pool = up ? templates.TAG_LEVEL_UP : templates.TAG_LEVEL_DOWN
  const message = render(pick(pool), { name: ctx.playerName, tag: tagLabel, oldLevel, newLevel })
  await writeEntry(ctx, 'tagLevel', oldLevel, newLevel, message)
}

export async function logTagAdded(ctx: ChangeContext, tagLabel: string) {
  const message = render(pick(templates.TAG_ADDED), { name: ctx.playerName, tag: tagLabel })
  await writeEntry(ctx, 'tagAdded', undefined, tagLabel, message)
}

export async function logTagRemoved(ctx: ChangeContext, tagLabel: string) {
  const message = render(pick(templates.TAG_REMOVED), { name: ctx.playerName, tag: tagLabel })
  await writeEntry(ctx, 'tagRemoved', tagLabel, undefined, message)
}

export async function logPlayerCreated(ctx: ChangeContext, score: number) {
  const message = render(pick(templates.PLAYER_CREATED), { name: ctx.playerName, new: score })
  await writeEntry(ctx, 'created', undefined, score, message)
}

export async function logPlayerDeleted(ctx: ChangeContext) {
  const message = render(pick(templates.PLAYER_DELETED), { name: ctx.playerName })
  await writeEntry(ctx, 'deleted', undefined, undefined, message)
}

export async function logRoleChanged(ctx: ChangeContext, oldRoleLabel: string, newRoleLabel: string) {
  if (oldRoleLabel === newRoleLabel) return
  const message = render(pick(templates.ROLE_CHANGED), { name: ctx.playerName, old: oldRoleLabel, new: newRoleLabel })
  await writeEntry(ctx, 'role', oldRoleLabel, newRoleLabel, message)
}

export async function logPhotoChanged(ctx: ChangeContext) {
  const message = render(pick(templates.PHOTO_CHANGED), { name: ctx.playerName })
  await writeEntry(ctx, 'photo', undefined, undefined, message)
}

export async function logNameChanged(ctx: ChangeContext, oldName: string, newName: string) {
  if (oldName === newName) return
  const message = render(pick(templates.NAME_CHANGED), { oldName, newName })
  await writeEntry({ ...ctx, playerName: newName }, 'name', oldName, newName, message)
}

export async function logVoteCast(ctx: VoteContext) {
  const message = render(pick(templates.VOTE_CAST_LOG), { name: ctx.discordUsername })
  await writeEntry(ctx, 'voteCast', undefined, undefined, message)
}

export async function logVoteDeclined(ctx: VoteContext) {
  const message = render(pick(templates.VOTE_DECLINED_LOG), { name: ctx.discordUsername })
  await writeEntry(ctx, 'voteDeclined', undefined, undefined, message)
}

// Unlike vote-cast/removed (a Discord-authenticated user action, deliberately not IP-logged
// — see shared/types' ChangeLogEntry comment), creating an event is an admin action through
// the same PIN-gated flow as player CRUD, so it's IP-stamped the same way those are.
// `to` keeps the raw ISO instant (a structured, machine-readable field — matches how
// score/tag-level changes store raw numbers there) but the human-readable `message` uses the
// same Vietnam-time "DD/MM/YYYY HH:mm" format as every other datetime shown anywhere else in
// the app (Discord embeds/messages, the /event page) — this log was the one place still
// leaking a raw UTC ISO string into prose.
export async function logEventCreated(ip: string, startsAt: string) {
  const message = render(pick(templates.EVENT_CREATED_LOG), { startsAt: formatVietnamDateTime(startsAt) })
  await writeEntry({ ip }, 'eventCreated', undefined, startsAt, message)
}

export async function logEventUpdated(ip: string, startsAt: string) {
  const message = render(pick(templates.EVENT_UPDATED_LOG), { startsAt: formatVietnamDateTime(startsAt) })
  await writeEntry({ ip }, 'eventUpdated', undefined, startsAt, message)
}

export async function logEventCanceled(ip: string) {
  const message = render(pick(templates.EVENT_CANCELED_LOG), {})
  await writeEntry({ ip }, 'eventCanceled', undefined, undefined, message)
}

export async function logTeamsAnnounced(ip: string) {
  const message = render(pick(templates.TEAMS_ANNOUNCED_LOG), {})
  await writeEntry({ ip }, 'teamsAnnounced', undefined, undefined, message)
}
