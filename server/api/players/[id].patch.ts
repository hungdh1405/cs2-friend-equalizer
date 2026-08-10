import { z } from 'zod'
import { ROLES } from '#shared/types'

const bodySchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  score: z.number().min(0).max(120).optional(),
  role: z.string().refine(value => ROLES.some(role => role.value === value), 'Invalid role').optional(),
  tagLevels: z.record(z.string(), z.number().min(1).max(5)).optional(),
  // Empty string clears the link; a real Discord ID is a 15-25 digit snowflake.
  discordUserId: z.union([z.string().regex(/^\d{15,25}$/), z.literal('')]).optional()
})

function roleLabel(value: string): string {
  return ROLES.find(role => role.value === value)?.label ?? value
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, bodySchema.parse)

  const roster = await getRoster()
  const index = roster.findIndex(player => player.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  const old = roster[index]
  const updated = {
    ...old,
    name: body.name ?? old.name,
    score: body.score ?? old.score,
    role: (body.role as typeof old.role) ?? old.role,
    tagLevels: body.tagLevels ?? old.tagLevels,
    discordUserId: body.discordUserId !== undefined ? (body.discordUserId || undefined) : old.discordUserId,
    updatedAt: new Date().toISOString()
  }

  roster[index] = updated
  await setRoster(roster)

  const ip = getClientIp(event)
  const ctx = { playerId: updated.id, playerName: updated.name, ip }

  if (body.name !== undefined) await logNameChanged(ctx, old.name, updated.name)
  if (body.score !== undefined) await logScoreChange(ctx, old.score, updated.score)
  if (body.role !== undefined) await logRoleChanged(ctx, roleLabel(old.role), roleLabel(updated.role))

  if (body.tagLevels !== undefined) {
    const tags = await getTags()
    const labelOf = (tagId: string) => tags.find(tag => tag.id === tagId)?.label ?? tagId

    const oldTagIds = new Set(Object.keys(old.tagLevels))
    const newTagIds = new Set(Object.keys(updated.tagLevels))

    for (const tagId of newTagIds) {
      if (!oldTagIds.has(tagId)) {
        await logTagAdded(ctx, labelOf(tagId))
      } else if (old.tagLevels[tagId] !== updated.tagLevels[tagId]) {
        await logTagLevelChange(ctx, labelOf(tagId), old.tagLevels[tagId], updated.tagLevels[tagId])
      }
    }
    for (const tagId of oldTagIds) {
      if (!newTagIds.has(tagId)) {
        await logTagRemoved(ctx, labelOf(tagId))
      }
    }
  }

  return updated
})
