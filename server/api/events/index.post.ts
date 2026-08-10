import { z } from 'zod'
import type { GameEvent } from '#shared/types'
import { buildEventComponents, buildEventEmbed, buildReplacedEventEmbed } from '../../utils/discord-embeds'

// Non-GET /api/* route — the existing global middleware already requires a valid CRUD
// token here, gated exactly like "Add player" is on the roster page. No auth changes needed.
const bodySchema = z.object({
  // A <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm"), always Vietnam wall-clock
  // time — converted to a UTC instant server-side via vietnamLocalToUtcIso, never relying
  // on any device's ambient timezone.
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'startsAt must be a datetime-local value'),
  description: z.string().trim().max(280).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const startsAt = vietnamLocalToUtcIso(body.startsAt)
  const now = new Date().toISOString()

  // Creating always replaces any current event (single-active-event by design — see
  // GameEvent's comments). If the old one had already posted a message, strip its buttons
  // and mark it stale so it can't still be voted on — otherwise it'd sit in the channel
  // looking clickable while actually mutating the *new* event's data (see
  // interactions.post.ts's message-id guard, which is the second half of this defense).
  const previous = await getCurrentEvent()
  if (previous?.discordMessageId) {
    await editDiscordMessage(useRuntimeConfig().discordChannelId, previous.discordMessageId, {
      embeds: [buildReplacedEventEmbed()],
      components: []
    })
  }

  const newEvent: GameEvent = {
    id: crypto.randomUUID(),
    startsAt,
    description: body.description,
    createdAt: now,
    voters: [],
    declinedVoters: []
  }

  const messageId = await postDiscordMessage(useRuntimeConfig().discordChannelId, {
    embeds: [buildEventEmbed(newEvent)],
    components: buildEventComponents()
  })
  if (messageId) newEvent.discordMessageId = messageId

  await setCurrentEvent(newEvent)
  await logEventCreated(getClientIp(event), startsAt)

  // Fire-and-forget — the separate hype announcement is a nice-to-have, never something
  // worth delaying the response (or failing the request) over.
  event.waitUntil(getHosts().then(hosts => notifyEventCreated(startsAt, hosts)))

  return newEvent
})
