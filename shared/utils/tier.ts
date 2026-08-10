export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D'

// Raw thresholds only — no styling here, so this is usable from server code (Discord
// message tone selection) as well as the client (app/lib/tier.ts wraps this with the
// Tailwind-class-carrying `Tier` object used for rendering).
const TIER_THRESHOLDS: { key: TierKey, min: number }[] = [
  { key: 'S', min: 90 },
  { key: 'A', min: 75 },
  { key: 'B', min: 55 },
  { key: 'C', min: 40 },
  { key: 'D', min: 0 }
]

export function getTierKey(score: number): TierKey {
  return (TIER_THRESHOLDS.find(tier => score >= tier.min) ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]).key
}
