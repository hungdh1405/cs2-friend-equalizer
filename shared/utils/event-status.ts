const EVENT_CLOSE_BUFFER_MS = 5 * 60 * 60 * 1000 // 5 hours after the scheduled start

/**
 * Once this much time has passed since the event's scheduled start, it's considered over —
 * no more votes, no more reminders. A fixed 5-hour buffer covers a typical match's duration
 * without needing an explicit "end time" the Host would have to set separately. Always
 * computed live from `startsAt` (never a stored flag) so the answer is correct even if the
 * periodic check that follows up on it (removing the Discord buttons, etc.) hasn't run yet.
 */
export function hasEventEnded(startsAtIso: string, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(startsAtIso).getTime() + EVENT_CLOSE_BUFFER_MS
}
