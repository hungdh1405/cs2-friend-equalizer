import { z } from 'zod'
import type { GameEvent } from '#shared/types'
import { hasEventEnded } from '#shared/utils/event-status'
import { vietnamLocalToUtcIso } from '#shared/utils/week'
import { buildEventComponents, buildEventEmbed } from '../../utils/discord-embeds'

const bodySchema = z.object({
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'startsAt must be a datetime-local value').optional(),
  description: z.string().trim().max(280).optional()
})

// Distinct from replacing (POST /api/events discards votes and posts a brand-new Discord
// message) — this edits the current event's date/time and/or description in place, keeping
// the same id/voters/discordMessageId, and edits the existing Discord message instead of
// posting a new one. Only makes sense for an event still open for voting.
export default defineEventHandler(async (event) => {
  const current = await getCurrentEvent()
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'No active event to edit' })
  }
  if (current.canceledAt || hasEventEnded(current.startsAt)) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot edit a canceled or ended event' })
  }

  const body = await readValidatedBody(event, bodySchema.parse)

  const updated: GameEvent = {
    ...current,
    startsAt: body.startsAt ? vietnamLocalToUtcIso(body.startsAt) : current.startsAt,
    description: body.description !== undefined ? (body.description || undefined) : current.description
  }

  if (updated.discordMessageId) {
    await editDiscordMessage(useRuntimeConfig().discordChannelId, updated.discordMessageId, {
      embeds: [buildEventEmbed(updated)],
      components: buildEventComponents()
    })
  }

  await setCurrentEvent(updated)
  await logEventUpdated(getClientIp(event), updated.startsAt)

  return updated
})
