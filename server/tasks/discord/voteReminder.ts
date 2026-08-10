import type { GameEvent, Player } from '#shared/types'
import { hasEventEnded } from '#shared/utils/event-status'

// Fired by 3 separate cron entries (12:00 / 16:00 / 20:00 Asia/Ho_Chi_Minh — see
// nuxt.config.ts + wrangler.toml). Nitro doesn't pass "which cron string triggered this" into
// the task, so the 20:00-only team-regeneration check below is done by reading the current
// UTC hour directly (20:00 local = 13:00 UTC) rather than needing 3 differently-named tasks.
const EVENING_SLOT_UTC_HOUR = 13

export default defineTask({
  meta: {
    name: 'discord:voteReminder',
    description: 'Vote reminder (3x/day), tagging specific unvoted linked players; regenerates the team split at the 20:00 slot only.'
  },
  async run() {
    const current = await getCurrentEvent()
    if (!current || current.canceledAt || !isInCurrentWeek(current.startsAt, 'Asia/Ho_Chi_Minh')) {
      return { result: 'skipped: no active event scheduled this week' }
    }

    // 2h past the scheduled start — nothing left to remind anyone about. Also the one place
    // that follows up on an auto-close by editing the Discord message to drop the vote
    // buttons (once — `closedAt` avoids re-editing the same message every cron run).
    if (hasEventEnded(current.startsAt)) {
      if (!current.closedAt && current.discordMessageId) {
        const closed: GameEvent = { ...current, closedAt: new Date().toISOString() }
        await editDiscordMessage(useRuntimeConfig().discordChannelId, current.discordMessageId, {
          embeds: [buildEventEmbed(closed)],
          components: []
        })
        await setCurrentEvent(closed)
      }
      return { result: 'skipped: event has already ended' }
    }

    const target = useRuntimeConfig().eventTargetVotes
    const roster = await getRoster()
    const votedIds = new Set(current.voters.map(voter => voter.discordUserId))
    const declinedIds = new Set(current.declinedVoters.map(voter => voter.discordUserId))
    // Anyone who explicitly clicked "Không tham gia được" made their answer known — tagging
    // them again in reminders would be exactly the nagging this is meant to avoid.
    const unvotedLinkedPlayers = roster.filter(player =>
      player.discordUserId && !votedIds.has(player.discordUserId) && !declinedIds.has(player.discordUserId)
    )

    await notifyVoteReminder(current.voters.length, target, unvotedLinkedPlayers)

    const isEveningSlot = new Date().getUTCHours() === EVENING_SLOT_UTC_HOUR
    const shouldReconsiderTeams = isEveningSlot
      && current.voters.length >= target
      && current.voters.length !== current.teamsAnnouncedVoterCount

    if (shouldReconsiderTeams) {
      const playerByDiscordId = new Map(roster.filter(player => player.discordUserId).map(player => [player.discordUserId, player]))
      const linkedPlayers: Player[] = []
      const unlinkedUsernames: string[] = []
      for (const voter of current.voters) {
        const player = playerByDiscordId.get(voter.discordUserId)
        if (player) linkedPlayers.push(player)
        else unlinkedUsernames.push(voter.username)
      }

      if (unlinkedUsernames.length === 0) {
        await notifyMatchReady(linkedPlayers)
        await setCurrentEvent({
          ...current,
          teamsAnnouncedVoterCount: current.voters.length,
          matchReadyAnnouncedAt: current.matchReadyAnnouncedAt ?? new Date().toISOString()
        })
      } else {
        const hosts = await getHosts()
        await notifyNeedDiscordLink(hosts, unlinkedUsernames, current.voters.length)
      }
    }

    return { result: 'ok' }
  }
})
