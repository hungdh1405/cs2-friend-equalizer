import type { EventVoter, Player } from '#shared/types'
import { hasEventEnded } from '#shared/utils/event-status'
import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions'
import { buildEventComponents, buildEventEmbed } from '../../utils/discord-embeds'

interface DiscordInteractionUser {
  id: string
  username: string
  global_name?: string | null
  avatar?: string | null
}

interface DiscordInteractionPayload {
  type: number
  data?: { custom_id?: string }
  member?: { user?: DiscordInteractionUser }
  user?: DiscordInteractionUser
  message?: { id?: string }
}

export default defineEventHandler(async (event) => {
  const signature = getHeader(event, 'x-signature-ed25519')
  const timestamp = getHeader(event, 'x-signature-timestamp')
  const rawBody = await readRawBody(event, 'utf8')

  if (!signature || !timestamp || !rawBody) {
    throw createError({ statusCode: 401, statusMessage: 'Missing signature headers' })
  }

  const publicKey = useRuntimeConfig().discordPublicKey
  const isValid = await verifyKey(rawBody, signature, timestamp, publicKey)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid request signature' })
  }

  const interaction = JSON.parse(rawBody) as DiscordInteractionPayload

  // Discord's one-time handshake when the Interactions Endpoint URL is (re-)registered in
  // the Developer Portal — must respond exactly like this or the URL is rejected.
  if (interaction.type === InteractionType.PING) {
    return { type: InteractionResponseType.PONG }
  }

  if (interaction.type !== InteractionType.MESSAGE_COMPONENT) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported interaction type' })
  }

  const customId = interaction.data?.custom_id
  const discordUser = interaction.member?.user ?? interaction.user

  if ((customId !== 'vote:in' && customId !== 'vote:out') || !discordUser?.id) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed interaction payload' })
  }

  const current = await getCurrentEvent()
  if (!current) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Chưa có sự kiện nào để vote.', flags: 64 } // ephemeral, only the clicker sees it
    }
  }
  // Defensive: the buttons are removed from the message the moment it's canceled (see
  // events/current.delete.ts) or auto-closed (see tasks/discord/voteReminder.ts), so this
  // normally can't be reached, but a click already in flight when either happens could
  // still arrive here.
  if (current.canceledAt || hasEventEnded(current.startsAt)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: current.canceledAt ? 'Sự kiện này đã bị hủy.' : 'Sự kiện này đã kết thúc.', flags: 64 }
    }
  }
  // Defensive: a click on an *old, replaced* event's message (see events/index.post.ts,
  // which strips that message's buttons on replace) — without this check it would otherwise
  // silently mutate the *current* event's voter list despite the click coming from a
  // different, stale message.
  if (current.discordMessageId && interaction.message?.id && interaction.message.id !== current.discordMessageId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Sự kiện này đã được thay thế bằng sự kiện mới. Vui lòng vote ở tin nhắn mới nhất trong kênh.', flags: 64 }
    }
  }

  const wasVoting = current.voters.some(voter => voter.discordUserId === discordUser.id)
  const wasDeclined = current.declinedVoters.some(voter => voter.discordUserId === discordUser.id)
  const wantsIn = customId === 'vote:in'

  // Every click lands you in exactly one of "voting in" / "declined" — clicking the button
  // for the state you're already in is a no-op (idempotent), clicking the other one moves you
  // across, removing you from whichever list you were in. There is no third "back to no
  // response" state once you've clicked either button once.
  let updated = current
  let addedVoter: EventVoter | null = null
  let declinedVoter: EventVoter | null = null

  if (wantsIn && !wasVoting) {
    addedVoter = {
      discordUserId: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar ?? null,
      votedAt: new Date().toISOString()
    }
    updated = {
      ...current,
      voters: [...current.voters, addedVoter],
      declinedVoters: current.declinedVoters.filter(voter => voter.discordUserId !== discordUser.id)
    }
  } else if (!wantsIn && !wasDeclined) {
    declinedVoter = {
      discordUserId: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar ?? null,
      votedAt: new Date().toISOString()
    }
    updated = {
      ...current,
      voters: current.voters.filter(voter => voter.discordUserId !== discordUser.id),
      declinedVoters: [...current.declinedVoters, declinedVoter]
    }
  }

  const target = useRuntimeConfig().eventTargetVotes
  let shouldAnnounceMatchReady = false
  let shouldAnnounceNeedLink = false
  let linkedPlayersForTeams: Player[] = []
  let unlinkedUsernames: string[] = []

  if (updated.voters.length < target) {
    // Dropped back below target (an unvote) — clear the flag so match-ready can genuinely
    // re-fire on a later climb back up to the target.
    if (updated.matchReadyAnnouncedAt) updated = { ...updated, matchReadyAnnouncedAt: undefined }
  } else if (!updated.matchReadyAnnouncedAt) {
    const roster = await getRoster()
    const playerByDiscordId = new Map(roster.filter(player => player.discordUserId).map(player => [player.discordUserId, player]))
    for (const voter of updated.voters) {
      const player = playerByDiscordId.get(voter.discordUserId)
      if (player) linkedPlayersForTeams.push(player)
      else unlinkedUsernames.push(voter.username)
    }
    if (unlinkedUsernames.length === 0) {
      shouldAnnounceMatchReady = true
      updated = { ...updated, matchReadyAnnouncedAt: new Date().toISOString(), teamsAnnouncedVoterCount: updated.voters.length }
    } else {
      shouldAnnounceNeedLink = true
    }
  }

  await setCurrentEvent(updated)

  // What the person who tapped the button sees immediately, in place, on the same message.
  const response = {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: [buildEventEmbed(updated)],
      components: buildEventComponents()
    }
  }

  // Everything below is fire-and-forget — logging + Discord notifications must never add
  // latency to (or risk breaking) the button response above.
  const followUp = (async () => {
    if (addedVoter) {
      await logVoteCast({ discordUserId: addedVoter.discordUserId, discordUsername: addedVoter.username })
      const roster = await getRoster()
      const linkedPlayer = roster.find(player => player.discordUserId === addedVoter!.discordUserId) ?? null
      await notifyVoteCast(addedVoter, linkedPlayer)
    }
    if (declinedVoter) {
      await logVoteDeclined({ discordUserId: declinedVoter.discordUserId, discordUsername: declinedVoter.username })
      await notifyVoteDeclined(declinedVoter)
    }
    if (shouldAnnounceMatchReady) {
      await notifyMatchReady(linkedPlayersForTeams)
    }
    if (shouldAnnounceNeedLink) {
      const hosts = await getHosts()
      await notifyNeedDiscordLink(hosts, unlinkedUsernames, updated.voters.length)
    }
  })()

  event.waitUntil(followUp)

  return response
})
