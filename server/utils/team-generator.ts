import type { Player } from '#shared/types'
import type { BalanceOption } from '#shared/utils/balance'
import { randomBalancedOption } from '#shared/utils/balance'

// Same "acceptable diff" default the website's own team builder uses (app/composables/
// useTeamBuilder.ts) — no UI slider on the Discord side, so just mirror that default.
const DEFAULT_TOLERANCE = 6

/** Thin wrapper around the existing, tested `randomBalancedOption` (shared/utils/balance.ts)
 * — the exact same "random balance" the /teams page itself uses for a 2-team, up-to-10-
 * active-player split (any extra voters beyond 10 become reserves, per
 * `desiredTeamSizes()`). Reused as-is rather than reimplemented, so the Discord team
 * announcement behaves identically to the website's own team builder. */
export function generateRandomTeams(players: Player[]): BalanceOption | null {
  return randomBalancedOption(players, DEFAULT_TOLERANCE)
}

export function formatTeamsForDiscord(option: BalanceOption): string {
  const names = (players: Player[]) => players.map(player => escapeDiscordMarkdown(player.name)).join(', ')
  const reserveLine = option.reserves.length ? `\n🪑 Dự bị: ${names(option.reserves)}` : ''
  return `🔵 Team A (${option.scoreA} điểm): ${names(option.teamA)}\n🔴 Team B (${option.scoreB} điểm): ${names(option.teamB)}${reserveLine}`
}
