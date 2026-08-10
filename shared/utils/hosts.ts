// Ladygaga is the group's permanent organizer — always a Host, regardless of who else is
// added or removed. Enforced both server-side (removeHost rejects this ID outright) and in
// the UI (the remove button is hidden for this entry), rather than relying on either alone.
export const PROTECTED_HOST_DISCORD_ID = '692250498027225148'

export function isProtectedHost(discordUserId: string): boolean {
  return discordUserId === PROTECTED_HOST_DISCORD_ID
}
