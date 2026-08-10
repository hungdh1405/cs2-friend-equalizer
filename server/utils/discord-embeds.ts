import type { GameEvent } from '#shared/types'
import { hasEventEnded } from '#shared/utils/event-status'
import { formatVietnamDateTime } from '#shared/utils/week'
import type { DiscordActionRow, DiscordEmbed } from './discord-api'
import { escapeDiscordMarkdown } from './discord-api'

const EVENT_PAGE_URL = 'https://csgo2.doxanh.dev/event'
const EMBED_COLOR = 0xF97316 // matches the app's tier-A/orange neon accent
const CLOSED_EMBED_COLOR = 0x6B7280 // muted gray — used for both canceled and auto-ended

export function buildEventEmbed(event: GameEvent): DiscordEmbed {
  const voterLines = event.voters.length
    ? event.voters.map(voter => `• ${escapeDiscordMarkdown(voter.username)}`).join('\n')
    : '_Chưa có ai tham gia._'

  // Auto-closed (2h past startsAt) is distinct from explicitly canceled, but both are
  // "nothing left to vote on" — canceled takes precedence in wording if somehow both apply.
  const ended = hasEventEnded(event.startsAt)
  const title = event.canceledAt ? '❌ Sự kiện đã bị hủy' : ended ? '🏁 Sự kiện đã kết thúc' : '📅 Sự kiện tuần này'
  const statusLine = event.canceledAt
    ? '_Sự kiện này đã bị hủy — không cần vote nữa._'
    : ended
      ? '_Sự kiện này đã kết thúc — không thể vote thêm nữa._'
      : `👥 **Đã tham gia (${event.voters.length}):**\n${voterLines}`

  return {
    title,
    description: [
      `🕒 **${formatVietnamDateTime(event.startsAt)}**`,
      event.description ? escapeDiscordMarkdown(event.description) : null,
      '',
      statusLine,
      '',
      `🔗 [Xem chi tiết trên website](${EVENT_PAGE_URL})`
    ].filter(line => line !== null).join('\n'),
    color: (event.canceledAt || ended) ? CLOSED_EMBED_COLOR : EMBED_COLOR
  }
}

// Posted over the *old* event's message when a Host replaces it with a brand-new one (see
// events/index.post.ts) — otherwise the old message would sit in the channel with live-
// looking buttons that no longer correspond to any real event, and clicking them would
// silently mutate the *new* event's voter list instead (see interactions.post.ts's message-id
// guard). There's no stored "replaced" state on GameEvent — the old event is fully discarded,
// so this is a one-off embed, not derived from buildEventEmbed.
export function buildReplacedEventEmbed(): DiscordEmbed {
  return {
    title: '🔄 Sự kiện đã được thay thế',
    description: '_Đã có sự kiện mới được tạo cho tuần này — sự kiện này không còn hiệu lực. Xem sự kiện mới nhất trong kênh._',
    color: CLOSED_EMBED_COLOR
  }
}

export function buildEventComponents(): DiscordActionRow[] {
  return [{
    type: 1,
    components: [
      { type: 2, style: 3, label: 'Tôi tham gia', custom_id: 'vote:in', emoji: { name: '✅' } },
      // No `emoji` field here on purpose — any emoji glyph (❌, ✖️, etc.) renders using the
      // client's own colored emoji font, which stays low-contrast against Discord's red
      // "danger" button no matter which symbol is picked. A plain "✕" character *in the
      // label text* instead always renders in the button's normal white label color, same as
      // every other button, guaranteeing contrast regardless of style/theme.
      { type: 2, style: 4, label: '✕ Không tham gia được', custom_id: 'vote:out' }
    ]
  }]
}
