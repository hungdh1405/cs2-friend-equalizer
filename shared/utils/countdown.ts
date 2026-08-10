export interface Countdown {
  /** Clamped to 0 — never negative — so callers can treat 0 as "already started" without a
   * separate check. */
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getCountdown(targetIso: string, now: Date = new Date()): Countdown {
  const totalMs = Math.max(0, new Date(targetIso).getTime() - now.getTime())
  const totalSeconds = Math.floor(totalMs / 1000)
  return {
    totalMs,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  }
}
