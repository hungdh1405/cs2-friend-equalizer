import { z } from 'zod'
import type { GameEvent, ManualTeams } from '#shared/types'
import { hasEventEnded } from '#shared/utils/event-status'
import { buildPredictionComponents, buildPredictionEmbed } from '../../utils/discord-embeds'

// Non-GET /api/* route — gated by the existing CRUD-token middleware. Saves a Host-arranged
// manual Team A/Team B lineup for the current event (distinct from the auto-generated random
// split — see shared/types' ManualTeams doc comment), posts a fresh "which team will win?"
// prediction poll, and announces the lineup to Discord.
const bodySchema = z.object({
  teamA: z.array(z.string()),
  teamB: z.array(z.string())
})

export default defineEventHandler(async (event) => {
  const current = await getCurrentEvent()
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'No active event' })
  }
  if (current.canceledAt || hasEventEnded(current.startsAt)) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot set teams on a canceled or ended event' })
  }

  const body = await readValidatedBody(event, bodySchema.parse)

  // Defensive: only ever assign people who actually voted in, dedupe, and never let the same
  // person land on both teams — the client's drag-and-drop state could be stale.
  const voterIds = new Set(current.voters.map(voter => voter.discordUserId))
  const teamA = [...new Set(body.teamA)].filter(id => voterIds.has(id))
  const teamASet = new Set(teamA)
  const teamB = [...new Set(body.teamB)].filter(id => voterIds.has(id) && !teamASet.has(id))

  const manualTeams: ManualTeams = {
    teamA,
    teamB,
    updatedAt: new Date().toISOString(),
    predictions: { teamA: [], teamB: [] }
  }

  // Re-saving the lineup always starts a fresh poll — a previous prediction message (if any)
  // is left as-is in the channel (its own message-id guard in interactions.post.ts stops it
  // from being clickable against the new data), and a new one is posted for the new matchup.
  const eventForEmbed: GameEvent = { ...current, manualTeams }
  const messageId = await postDiscordMessage(useRuntimeConfig().discordChannelId, {
    embeds: [buildPredictionEmbed(eventForEmbed)],
    components: buildPredictionComponents()
  })
  if (messageId) manualTeams.discordMessageId = messageId

  const updated: GameEvent = { ...current, manualTeams }
  await setCurrentEvent(updated)

  const followUp = (async () => {
    await logTeamsAnnounced(getClientIp(event))
    await notifyManualTeamsAnnounced(teamA, teamB)
  })()
  event.waitUntil(followUp)

  return updated
})
