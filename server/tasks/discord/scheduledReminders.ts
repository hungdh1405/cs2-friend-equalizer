import { getReminderTaskForTime } from '#shared/utils/reminder-schedule'

export default defineTask({
  meta: {
    name: 'discord:scheduledReminders',
    description: 'Dispatches the single Cloudflare Cron Trigger to the correct host or vote reminder job.'
  },
  async run(event) {
    const taskName = getReminderTaskForTime()
    if (!taskName) {
      return { result: 'skipped: unexpected cron execution time' }
    }

    return runTask(taskName, {
      payload: event.payload,
      context: event.context
    })
  }
})
