const DISCORD_API_BASE = 'https://discord.com/api/v10'

export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  color?: number
  fields?: { name: string, value: string, inline?: boolean }[]
  footer?: { text: string }
}

export interface DiscordButton {
  type: 2
  style: 1 | 2 | 3 | 4
  label: string
  custom_id: string
  emoji?: { name: string }
}

export interface DiscordActionRow {
  type: 1
  components: DiscordButton[]
}

export interface DiscordAllowedMentions {
  parse?: ('roles' | 'users' | 'everyone')[]
  users?: string[]
  roles?: string[]
}

export interface DiscordMessagePayload {
  content?: string
  embeds?: DiscordEmbed[]
  components?: DiscordActionRow[]
  allowed_mentions?: DiscordAllowedMentions
}

function botToken(): string {
  const token = useRuntimeConfig().discordBotToken
  if (!token) throw new Error('NUXT_DISCORD_BOT_TOKEN is not configured')
  return token
}

function isDryRun(): boolean {
  return useRuntimeConfig().discordDryRun === true || useRuntimeConfig().discordDryRun === 'true'
}

/** Posts a new message to a channel. Returns the created message's id, or `null` in dry-run
 * mode / on failure — callers must not let a Discord outage break the caller's own action. */
export async function postDiscordMessage(channelId: string, payload: DiscordMessagePayload): Promise<string | null> {
  if (isDryRun()) {
    console.log('[discord:dry-run] postDiscordMessage', channelId, JSON.stringify(payload))
    return null
  }
  try {
    const response = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      console.error('[discord] postDiscordMessage failed', response.status, await response.text())
      return null
    }
    const message = await response.json<{ id: string }>()
    return message.id
  } catch (error) {
    console.error('[discord] postDiscordMessage error', error)
    return null
  }
}

export async function editDiscordMessage(channelId: string, messageId: string, payload: DiscordMessagePayload): Promise<boolean> {
  if (isDryRun()) {
    console.log('[discord:dry-run] editDiscordMessage', channelId, messageId, JSON.stringify(payload))
    return true
  }
  try {
    const response = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${botToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      console.error('[discord] editDiscordMessage failed', response.status, await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('[discord] editDiscordMessage error', error)
    return false
  }
}

// Discord's *new* unique `username` is restricted to lowercase/digits/`_`/`.` (no markdown
// chars possible), but `global_name`/display names have no such restriction — escape before
// interpolating any Discord-supplied free text into a message template so a display name
// like "*Bold*Boi" can't accidentally break the surrounding message's markdown rendering.
// This is purely cosmetic; it has nothing to do with mention safety, which `allowed_mentions`
// handles unconditionally regardless of message content (see discord-notify.ts).
export function escapeDiscordMarkdown(text: string): string {
  return text.replace(/([_*~`|>\\])/g, '\\$1')
}
