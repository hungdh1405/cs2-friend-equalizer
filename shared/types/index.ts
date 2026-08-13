export type Role = 'igl' | 'entry' | 'awper' | 'lurker' | 'support' | 'anchor' | 'rifler' | 'rotator' | 'flex'

export const ROLES: { value: Role, label: string, description: string }[] = [
  { value: 'igl', label: 'In-Game Leader (IGL)', description: 'Guides the team with strategies and mid-round adjustments.' },
  { value: 'entry', label: 'Entry Fragger', description: 'Pushes aggressively to break through defenses and secure early kills.' },
  { value: 'awper', label: 'AWPer', description: 'Controls long angles with the sniper rifle, secures crucial kills when it matters most.' },
  { value: 'lurker', label: 'Lurker', description: 'Operates solo to gather information, apply pressure, and flank enemies.' },
  { value: 'support', label: 'Support', description: 'Uses utility to create openings and assist teammates.' },
  { value: 'anchor', label: 'Anchor', description: 'Holds a bombsite alone under pressure — the last line of defense on that site.' },
  { value: 'rifler', label: 'Rifler', description: 'Core all-around rifle duelist; the default when nothing more specific fits.' },
  { value: 'rotator', label: 'Rotator', description: 'Reads round info and rotates between sites to reinforce as needed.' },
  { value: 'flex', label: 'Flex', description: 'No fixed identity — plays whatever the round calls for.' }
]

export type TagKind = 'positive' | 'warning' | 'neutral'

export interface Tag {
  id: string
  label: string
  /** Lucide icon component name, e.g. "Crosshair" */
  icon: string
  kind: TagKind
  createdAt: string
}

export interface Player {
  id: string
  name: string
  /** 0-120, the master ranking number */
  score: number
  role: Role
  /** tagId -> level, 1-5. Drives badge color intensity only, never shown as a number. */
  tagLevels: Record<string, number>
  hasPhoto: boolean
  /** Links this roster profile to a real Discord account, for vote-message tone (VIP
   * tier callouts) and weekly team-split generation. Set by an admin via the edit form —
   * there is no automated linking (Discord usernames and roster names are unrelated). */
  discordUserId?: string
  /** Vietnamese bank account, for the team QR codes on /event (see shared/utils/vietqr.ts) —
   * set by an admin via the edit form, same as discordUserId. `bankKey` matches a key in
   * vietnam-qr-pay's BanksObject (e.g. "vietcombank"), not a free-typed bank name. */
  bankAccount?: {
    bankKey: string
    accountNumber: string
    /** Shown alongside the QR so whoever's paying can confirm they've got the right person —
     * VietQR itself doesn't require this (banks resolve the name from bin+account number on
     * their end), it's purely a trust/confirmation label in this app's own UI. */
    accountName?: string
  }
  createdAt: string
  updatedAt: string
}

export type ChangeLogField =
  | 'score'
  | 'tagLevel'
  | 'tagAdded'
  | 'tagRemoved'
  | 'role'
  | 'name'
  | 'photo'
  | 'created'
  | 'deleted'
  | 'voteCast'
  | 'voteDeclined'
  | 'eventCreated'
  | 'eventUpdated'
  | 'eventCanceled'
  | 'teamsAnnounced'

export interface ChangeLogEntry {
  id: string
  /** ISO timestamp */
  at: string
  /** Omitted for vote-type entries — a Discord-authenticated action already carries a much
   * stronger identity signal than the anonymous-PIN roster edits IP-logging exists for. */
  ip?: string
  /** Absent for vote-type entries, which aren't tied to a roster Player at all. */
  playerId?: string
  /** Denormalized so the log reads fine even if the player is later deleted. */
  playerName?: string
  /** Set instead of playerId/playerName for vote-type entries. */
  discordUserId?: string
  discordUsername?: string
  field: ChangeLogField
  from?: string | number
  to?: string | number
  /** Pre-rendered from the template pool. */
  message: string
}

export interface EventVoter {
  discordUserId: string
  username: string
  /** Discord avatar hash — build a CDN URL client-side, e.g.
   * `https://cdn.discordapp.com/avatars/{discordUserId}/{avatar}.png` */
  avatar: string | null
  votedAt: string
}

export interface GameEvent {
  id: string
  /** ISO UTC instant. Always rendered explicitly in Asia/Ho_Chi_Minh, never the viewer's
   * local browser timezone, so everyone sees the same time regardless of device clock. */
  startsAt: string
  description?: string
  createdAt: string
  /** The Discord message with the vote buttons, so later interactions/edits can find it. */
  discordMessageId?: string
  voters: EventVoter[]
  /** People who explicitly clicked "Không tham gia được" — distinct from simply not having
   * voted yet. Kept so the vote-reminder task can stop pinging them (see
   * server/tasks/discord/voteReminder.ts) and so the website can show who declined. Clicking
   * the opposite button moves someone between this list and `voters`; there is no third
   * "withdrew to no response" state — once you've clicked either button you're in one list
   * or the other until the event ends. */
  declinedVoters: EventVoter[]
  /** Set once voters.length first reaches the vote target; cleared if it drops back below,
   * so the match-ready announcement can genuinely re-fire on a later climb back up. */
  matchReadyAnnouncedAt?: string
  /** Voter count at the last team-split announcement, so the 20:00 task only regenerates
   * when the roster of voters has actually changed since then. */
  teamsAnnouncedVoterCount?: number
  /** Set when a Host cancels this event. The record is kept (not deleted/replaced) so the
   * weekly Host reminder still knows "this week was handled" and stays silent — canceling
   * counts the same as creating for that purpose. Vote reminders and new votes both stop,
   * though: there's nothing left to vote on once this is set. */
  canceledAt?: string
  /** Set once the scheduled voteReminder task notices the event auto-closed (2h past
   * `startsAt` — see shared/utils/event-status.ts) and has removed the Discord vote buttons.
   * Purely an optimization to avoid re-editing that message every cron run; "is this event
   * actually over" is always computed live from `startsAt`, never read from this field. */
  closedAt?: string
  /** A Host-arranged, manually-saved 2-team lineup — see the ManualTeams doc comment. */
  manualTeams?: ManualTeams
}

export interface Host {
  discordUserId: string
  username?: string
  addedAt: string
}

/** A Host-arranged 2-team lineup, distinct from the auto-generated random split
 * (`teamsAnnouncedVoterCount`/the ≥target-votes team-ready announcement) — this is a manual,
 * final decision made by dragging voters into Team A/Team B on the website, saved explicitly
 * and announced to Discord in a much more intense "this is the real matchup" tone (see
 * discord-messages.ts's MANUAL_TEAMS_ANNOUNCED). Only ever holds discordUserIds that are
 * currently in `GameEvent.voters` — anyone removed from voters after being placed on a team
 * is silently dropped the next time teams are saved, never left dangling. */
export interface ManualTeams {
  teamA: string[]
  teamB: string[]
  updatedAt: string
  /** discordUserId of each team's designated leader — must be a member of that same team.
   * Drives which team member's bank QR shows by default on /event (falls back to the first
   * team member with a linked bank account if the leader has none, or wasn't set at all). */
  leaderA?: string
  leaderB?: string
  /** The "which team will win?" prediction-poll message, so interactions can find/update it
   * in place. Posted once per saved lineup — re-saving the lineup posts a fresh poll (old
   * predictions are discarded along with it, since they were about the previous matchup). */
  discordMessageId?: string
  /** Who predicted which team wins — anyone in the server, not just the assigned players.
   * Same toggle rules as voters/declinedVoters: one click moves you into exactly one side,
   * clicking the same side again is a no-op. Deliberately never posts a per-vote channel
   * message (explicit request) — only the poll's own embed updates live. */
  predictions?: {
    teamA: EventVoter[]
    teamB: EventVoter[]
  }
}
