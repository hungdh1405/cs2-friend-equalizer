import { describe, expect, it } from 'vitest'
import { getReminderTaskForTime } from './reminder-schedule'

describe('getReminderTaskForTime', () => {
  it('routes the 03:00 UTC run to the host reminder', () => {
    expect(getReminderTaskForTime(new Date('2026-09-02T03:00:00Z'))).toBe('discord:hostReminder')
  })

  it.each([5, 9, 13])('routes the %i:00 UTC run to the vote reminder', (utcHour) => {
    expect(getReminderTaskForTime(new Date(`2026-09-02T${String(utcHour).padStart(2, '0')}:00:00Z`)))
      .toBe('discord:voteReminder')
  })

  it('does not dispatch an unexpected run', () => {
    expect(getReminderTaskForTime(new Date('2026-09-02T04:00:00Z'))).toBeNull()
  })
})
