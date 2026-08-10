const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export default defineTask({
  meta: {
    name: 'discord:hostReminder',
    description: 'Reminds Hosts to schedule this week\'s event if none exists yet; prunes vote-log entries older than 30 days.'
  },
  async run() {
    const current = await getCurrentEvent()
    const hasEventThisWeek = current ? isInCurrentWeek(current.startsAt, 'Asia/Ho_Chi_Minh') : false

    if (!hasEventThisWeek) {
      const hosts = await getHosts()
      await notifyHostReminder(hosts)
    }

    // Piggybacks on this daily task rather than spending one of the account's 5 free-plan
    // cron slots on a separate retention job.
    await pruneVoteChangeLog(THIRTY_DAYS_MS)

    return { result: hasEventThisWeek ? 'skipped: event already scheduled this week' : 'reminded' }
  }
})
