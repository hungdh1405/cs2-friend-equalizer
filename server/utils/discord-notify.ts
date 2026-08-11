import type { Host, Player } from '#shared/types'
import { formatVietnamDateTime } from '#shared/utils/week'
import { escapeDiscordMarkdown, postDiscordMessage } from './discord-api'
import * as messages from './discord-messages'
import { formatTeamsForDiscord, generateRandomTeams } from './team-generator'

const EVENT_PAGE_URL = 'https://csgo2.doxanh.dev/event'

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

// Collapses to a single space and trims after substitution — several VOTE_REMINDER_*
// templates place {mentions} mid-sentence assuming it has content; when there's nobody
// taggable it renders as an empty string, which would otherwise leave an awkward double
// space (or a stray leading/trailing one) rather than breaking anything structurally.
function render(template: string, vars: Record<string, string | number>): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
    .replace(/ {2,}/g, ' ')
    .trim()
}

function channelId(): string {
  return useRuntimeConfig().discordChannelId
}

function mentionAll(hosts: Host[]): string {
  return hosts.map(host => `<@${host.discordUserId}>`).join(' ')
}

// `postDiscordMessage` already never throws (a Discord outage/rate-limit logs and resolves
// null) — every function here inherits that safety by construction, so a slow/broken
// Discord API can never break the vote/reminder/task that triggered the notification.

// No per-vote channel messages — explicit team feedback that announcing every Yes/No made
// the channel too messy. The pinned event message already shows the live voter list/count
// via its own in-place edit (UPDATE_MESSAGE), which is "informing without spamming"; the
// only messages that still post to the channel are reminders (below), which always link back
// to /event for anyone who wants the detail a one-line ping can't carry.

export async function notifyHostReminder(hosts: Host[]): Promise<void> {
  if (!hosts.length) return
  const message = render(pick(messages.HOST_REMINDER), { hosts: mentionAll(hosts), link: EVENT_PAGE_URL })
  await postDiscordMessage(channelId(), {
    content: message,
    allowed_mentions: { users: hosts.map(host => host.discordUserId) }
  })
}

/**
 * `votersCount`/`target` decide the tone band. `unvotedLinkedPlayers` are the specific
 * roster players who have a linked Discord account but haven't voted yet — tagged directly
 * so the reminder reaches exactly who still needs to act. Players with no Discord link at
 * all can't be tagged (we don't know their Discord ID) and are silently excluded, not
 * substituted with a "tag everyone" fallback. The ENOUGH band never tags anyone — once the
 * target's met there's no one left to chase.
 */
export async function notifyVoteReminder(votersCount: number, target: number, unvotedLinkedPlayers: Player[]): Promise<void> {
  const remaining = Math.max(0, target - votersCount)
  const enough = remaining <= 0

  if (enough) {
    const message = render(pick(messages.VOTE_REMINDER_ENOUGH), { count: votersCount, link: EVENT_PAGE_URL })
    await postDiscordMessage(channelId(), { content: message, allowed_mentions: { parse: [] } })
    return
  }

  const pool = remaining >= 5 ? messages.VOTE_REMINDER_URGENT : messages.VOTE_REMINDER_CLOSE
  const taggable = unvotedLinkedPlayers.filter(player => player.discordUserId)
  const mentions = taggable.map(player => `<@${player.discordUserId}>`).join(' ')
  const message = render(pick(pool), { remaining, count: votersCount, link: EVENT_PAGE_URL, mentions })

  await postDiscordMessage(channelId(), {
    content: message,
    // No taggable players (nobody linked yet, or all linked players already voted) → tag
    // no one, never fall back to a broad mention.
    allowed_mentions: taggable.length
      ? { users: taggable.map(player => player.discordUserId as string) }
      : { parse: [] }
  })
}

export async function notifyMatchReady(players: Player[]): Promise<void> {
  const option = generateRandomTeams(players)
  if (!option) return
  const message = render(pick(messages.TEAM_READY), { teams: formatTeamsForDiscord(option), count: players.length })
  await postDiscordMessage(channelId(), { content: message, allowed_mentions: { parse: [] } })
}

export async function notifyNeedDiscordLink(hosts: Host[], unlinkedUsernames: string[], votersCount: number): Promise<void> {
  if (!hosts.length) return
  const names = unlinkedUsernames.map(escapeDiscordMarkdown).join(', ')
  const message = render(pick(messages.NEED_DISCORD_LINK), { hosts: mentionAll(hosts), names, count: votersCount })
  await postDiscordMessage(channelId(), {
    content: message,
    allowed_mentions: { users: hosts.map(host => host.discordUserId) }
  })
}

export async function notifyEventCanceled(): Promise<void> {
  const message = render(pick(messages.EVENT_CANCELED), {})
  await postDiscordMessage(channelId(), { content: message, allowed_mentions: { parse: [] } })
}

// Posted right after the embed+buttons message, as its own hype announcement — the embed
// alone (which a busy channel can easily scroll past unnoticed) isn't the same as an actual
// "hey, go vote" ping. Credits/tags *all* current Hosts collectively — the website's
// shared-PIN create flow doesn't know which specific one clicked the button.
export async function notifyEventCreated(startsAt: string, hosts: Host[]): Promise<void> {
  const message = render(pick(messages.EVENT_CREATED), {
    startsAt: formatVietnamDateTime(startsAt),
    link: EVENT_PAGE_URL,
    hosts: hosts.length ? mentionAll(hosts) : ''
  })
  await postDiscordMessage(channelId(), {
    content: message,
    allowed_mentions: hosts.length ? { users: hosts.map(host => host.discordUserId) } : { parse: [] }
  })
}
