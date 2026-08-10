import { buildEventEmbed } from '../../utils/discord-embeds'

// Non-GET /api/* route — gated by the existing CRUD-token middleware, same as replacing an
// event. Cancels rather than deletes the record: the weekly Host reminder still needs to see
// "this week had an event" (canceling counts the same as creating for that purpose — see
// shared/types' GameEvent.canceledAt comment), while vote reminders and new votes both stop.
export default defineEventHandler(async (event) => {
  const current = await getCurrentEvent()
  if (!current || current.canceledAt) {
    throw createError({ statusCode: 404, statusMessage: 'No active event to cancel' })
  }

  const canceled = { ...current, canceledAt: new Date().toISOString() }
  await setCurrentEvent(canceled)

  if (canceled.discordMessageId) {
    await editDiscordMessage(useRuntimeConfig().discordChannelId, canceled.discordMessageId, {
      embeds: [buildEventEmbed(canceled)],
      components: [] // remove the vote buttons — nothing left to vote on
    })
  }

  const followUp = (async () => {
    await notifyEventCanceled()
    await logEventCanceled(getClientIp(event))
  })()
  event.waitUntil(followUp)

  return canceled
})
