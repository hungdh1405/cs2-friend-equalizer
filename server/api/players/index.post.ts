import { z } from 'zod'
import type { Player } from '#shared/types'
import { ROLES } from '#shared/types'

const bodySchema = z.object({
  name: z.string().trim().min(1).max(40),
  score: z.number().min(0).max(120),
  role: z.string().refine(value => ROLES.some(role => role.value === value), 'Invalid role'),
  tagLevels: z.record(z.string(), z.number().min(1).max(5)).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const now = new Date().toISOString()

  const player: Player = {
    id: crypto.randomUUID(),
    name: body.name,
    score: body.score,
    role: body.role as Player['role'],
    tagLevels: body.tagLevels ?? {},
    hasPhoto: false,
    createdAt: now,
    updatedAt: now
  }

  const roster = await getRoster()
  roster.push(player)
  await setRoster(roster)

  await logPlayerCreated({ playerId: player.id, playerName: player.name, ip: getClientIp(event) }, player.score)

  return player
})
