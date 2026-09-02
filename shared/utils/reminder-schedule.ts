export type ReminderTaskName = 'discord:hostReminder' | 'discord:voteReminder'

const HOST_REMINDER_UTC_HOUR = 3
const VOTE_REMINDER_UTC_HOURS = new Set([5, 9, 13])

/** Selects the existing reminder job for a run of the consolidated Cloudflare cron trigger. */
export function getReminderTaskForTime(time: Date = new Date()): ReminderTaskName | null {
  const utcHour = time.getUTCHours()

  if (utcHour === HOST_REMINDER_UTC_HOUR) return 'discord:hostReminder'
  if (VOTE_REMINDER_UTC_HOURS.has(utcHour)) return 'discord:voteReminder'

  // Defensive only: Cloudflare should invoke this task exclusively at the four configured hours.
  return null
}
