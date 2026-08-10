function getUtcOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date)
  const offsetPart = parts.find(part => part.type === 'timeZoneName')?.value ?? 'GMT+00:00'
  const match = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 0
  const sign = match[1] === '-' ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3]))
}

const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

function getLocalDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).formatToParts(date)
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    daysSinceMonday: WEEKDAY_INDEX[get('weekday')] ?? 0
  }
}

// Asia/Ho_Chi_Minh is a fixed UTC+7 with no DST — a `<input type="datetime-local">` value
// has no timezone of its own, and parsing it with a bare `new Date(...)` would silently use
// whatever timezone the *browser's/server's own OS* happens to be set to, not Vietnam's.
// Treating the value as literal Vietnam wall-clock time and shifting by a fixed 7 hours is
// robust and permanent for this timezone specifically (see DESIGN.md).
const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000

/** `localDateTime` like "2026-08-15T19:00" (a datetime-local input value, always interpreted
 * as Asia/Ho_Chi_Minh wall-clock time) -> the correct UTC ISO instant. */
export function vietnamLocalToUtcIso(localDateTime: string): string {
  const asIfUtcMs = Date.parse(`${localDateTime}:00.000Z`)
  if (Number.isNaN(asIfUtcMs)) throw new Error(`Invalid local datetime: ${localDateTime}`)
  return new Date(asIfUtcMs - VIETNAM_UTC_OFFSET_MS).toISOString()
}

/**
 * Every event datetime shown anywhere (website, Discord embeds/messages) uses this exact
 * "DD/MM/YYYY HH:mm" (24h) Vietnam-time format — one shared formatter so it can never drift
 * between the two surfaces. Built from explicit Intl parts rather than a locale string (e.g.
 * `toLocaleString('vi-VN', ...)`), since locale-driven part *ordering* isn't something to
 * rely on for a fixed, specific format. Works from any runtime (browser or server), and
 * doesn't depend on the caller's own timezone.
 */
export function formatVietnamDateTime(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`
}

/** The inverse of `vietnamLocalToUtcIso` — a UTC ISO instant -> the `<input
 * type="datetime-local">` value that represents the same instant in Vietnam wall-clock time.
 * Used to pre-fill the edit-event form with the current event's existing date/time. */
export function utcIsoToVietnamLocalInput(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  // Midnight renders as "24" in this locale/format combo instead of "00" — normalize it.
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}

/**
 * Whether `isoString` falls within the current Mon-Sun calendar week *in `timeZone`* — not
 * the server's own timezone (Cloudflare Workers run in UTC) and not "within the next 7
 * days." Used to decide whether the King has already scheduled this week's event.
 * `now` is injectable for testing; defaults to the real current time.
 */
export function isInCurrentWeek(isoString: string, timeZone: string, now: Date = new Date()): boolean {
  const target = new Date(isoString)
  if (Number.isNaN(target.getTime())) return false

  const { year, month, day, daysSinceMonday } = getLocalDateParts(now, timeZone)
  const offsetMinutes = getUtcOffsetMinutes(now, timeZone)

  const todayLocalMidnightUtcMs = Date.UTC(year, month - 1, day) - offsetMinutes * 60_000
  const weekStartUtcMs = todayLocalMidnightUtcMs - daysSinceMonday * 86_400_000
  const weekEndUtcMs = weekStartUtcMs + 7 * 86_400_000

  const targetMs = target.getTime()
  return targetMs >= weekStartUtcMs && targetMs < weekEndUtcMs
}
