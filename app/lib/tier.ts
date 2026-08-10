import { getTierKey } from '#shared/utils/tier'

export type { TierKey } from '#shared/utils/tier'

export interface Tier {
  key: TierKey
  label: string
  min: number
  /** Tailwind utility strings — kept literal (not built via template interpolation) so the
   * build's CSS scanner actually picks them up; see tag-colors.ts for the same pattern. */
  badgeClass: string
  cardBorderClass: string
  /** Full-perimeter ambient glow (ring + soft halo) — makes the whole card read as "lit up"
   * in the tier color, not just the left accent stripe. */
  glowClass: string
  /** Tighter-radius glow sized for small badge elements (the card's card glow's 64px blur
   * would overwhelm a ~40px badge). */
  badgeGlowClass: string
  /** Raw `var(--token)` reference — for consumers that need the color as an inline style
   * (e.g. binding `--hud-accent` for the .hud-frame corner-bracket color). */
  colorVar: string
}

// Tier-list "rainbow" convention (fighting games / MOBAs): S/A/B/C/D, not a school-style
// S/A-/B/C/D grading. Gold→Orange→Yellow→Green→Blue instead of the more common Red-at-S —
// red is already this app's destructive/delete color, so keeping S gold avoids sending a
// "delete-adjacent" signal for the best tier. See DESIGN.md decisions log.
//
// No per-tier icon (Crown/Star/...) any more — the letter badge carries the tier on its own,
// bigger and bolder; a small icon next to a small letter just added visual noise without
// helping legibility (explicit feedback: "the icon beside tier rank seems not nice").
const TIERS: Tier[] = [
  {
    key: 'S',
    label: 'Elite',
    min: 90,
    badgeClass: 'bg-elite text-elite-foreground',
    cardBorderClass: 'border-l-[6px] border-l-elite',
    glowClass: 'shadow-[0_0_0_1px_var(--elite),0_0_36px_-6px_var(--elite),0_0_64px_-16px_var(--elite)]',
    badgeGlowClass: 'shadow-[0_0_0_1px_var(--elite),0_0_14px_-1px_var(--elite)]',
    colorVar: 'var(--elite)'
  },
  {
    key: 'A',
    label: 'Very Strong',
    min: 75,
    badgeClass: 'bg-tier-a text-tag-fg-on-deep',
    cardBorderClass: 'border-l-[6px] border-l-tier-a',
    glowClass: 'shadow-[0_0_0_1px_var(--tier-a),0_0_36px_-6px_var(--tier-a),0_0_64px_-16px_var(--tier-a)]',
    badgeGlowClass: 'shadow-[0_0_0_1px_var(--tier-a),0_0_14px_-1px_var(--tier-a)]',
    colorVar: 'var(--tier-a)'
  },
  {
    key: 'B',
    label: 'Average',
    min: 55,
    badgeClass: 'bg-tier-b text-tag-fg-on-pale',
    cardBorderClass: 'border-l-[6px] border-l-tier-b',
    glowClass: 'shadow-[0_0_0_1px_var(--tier-b),0_0_36px_-6px_var(--tier-b),0_0_64px_-16px_var(--tier-b)]',
    badgeGlowClass: 'shadow-[0_0_0_1px_var(--tier-b),0_0_14px_-1px_var(--tier-b)]',
    colorVar: 'var(--tier-b)'
  },
  {
    key: 'C',
    label: 'Below Average',
    min: 40,
    badgeClass: 'bg-tier-c text-tag-fg-on-deep',
    cardBorderClass: 'border-l-[6px] border-l-tier-c',
    glowClass: 'shadow-[0_0_0_1px_var(--tier-c),0_0_36px_-6px_var(--tier-c),0_0_64px_-16px_var(--tier-c)]',
    badgeGlowClass: 'shadow-[0_0_0_1px_var(--tier-c),0_0_14px_-1px_var(--tier-c)]',
    colorVar: 'var(--tier-c)'
  },
  {
    key: 'D',
    label: 'Beginner',
    min: 0,
    badgeClass: 'bg-tier-d text-tag-fg-on-deep',
    cardBorderClass: 'border-l-[6px] border-l-tier-d',
    glowClass: 'shadow-[0_0_0_1px_var(--tier-d),0_0_36px_-6px_var(--tier-d),0_0_64px_-16px_var(--tier-d)]',
    badgeGlowClass: 'shadow-[0_0_0_1px_var(--tier-d),0_0_14px_-1px_var(--tier-d)]',
    colorVar: 'var(--tier-d)'
  }
]

export function getTier(score: number): Tier {
  const key = getTierKey(score)
  return TIERS.find(tier => tier.key === key) ?? TIERS[TIERS.length - 1]
}

export function allTiers(): Tier[] {
  return TIERS
}
