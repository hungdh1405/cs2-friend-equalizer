import type { TagKind } from '#shared/types'

// Tailwind's scanner needs literal class-name strings somewhere in the source — building
// the name via template-string interpolation at runtime wouldn't be picked up at build time.
const BG_CLASS: Record<TagKind, Record<number, string>> = {
  positive: {
    1: 'bg-tag-positive-1',
    2: 'bg-tag-positive-2',
    3: 'bg-tag-positive-3',
    4: 'bg-tag-positive-4',
    5: 'bg-tag-positive-5'
  },
  warning: {
    1: 'bg-tag-warning-1',
    2: 'bg-tag-warning-2',
    3: 'bg-tag-warning-3',
    4: 'bg-tag-warning-4',
    5: 'bg-tag-warning-5'
  },
  neutral: {
    1: 'bg-tag-neutral-1',
    2: 'bg-tag-neutral-2',
    3: 'bg-tag-neutral-3',
    4: 'bg-tag-neutral-4',
    5: 'bg-tag-neutral-5'
  }
}

// Same tokens as BG_CLASS but as `text-*` utilities — paired onto the same element as its
// `bg-*` class so `currentColor` (used by glow box-shadows) actually matches the bar's hue
// instead of falling back to the inherited foreground text color.
const TEXT_CLASS: Record<TagKind, Record<number, string>> = {
  positive: {
    1: 'text-tag-positive-1',
    2: 'text-tag-positive-2',
    3: 'text-tag-positive-3',
    4: 'text-tag-positive-4',
    5: 'text-tag-positive-5'
  },
  warning: {
    1: 'text-tag-warning-1',
    2: 'text-tag-warning-2',
    3: 'text-tag-warning-3',
    4: 'text-tag-warning-4',
    5: 'text-tag-warning-5'
  },
  neutral: {
    1: 'text-tag-neutral-1',
    2: 'text-tag-neutral-2',
    3: 'text-tag-neutral-3',
    4: 'text-tag-neutral-4',
    5: 'text-tag-neutral-5'
  }
}

// "Glowing capsule" chip look: a low-opacity tint of the token as background, the same
// token as a neon border, and the same token as text color — text and border share a hue so
// `currentColor`-based effects (the shimmer sweep, hover glow in .tag-chip) automatically
// match without a separate shadow-color map per kind/level.
const CHIP_CLASS: Record<TagKind, Record<number, string>> = {
  positive: {
    1: 'border-tag-positive-1 bg-tag-positive-1/15 text-tag-positive-1',
    2: 'border-tag-positive-2 bg-tag-positive-2/15 text-tag-positive-2',
    3: 'border-tag-positive-3 bg-tag-positive-3/15 text-tag-positive-3',
    4: 'border-tag-positive-4 bg-tag-positive-4/15 text-tag-positive-4',
    5: 'border-tag-positive-5 bg-tag-positive-5/15 text-tag-positive-5'
  },
  warning: {
    1: 'border-tag-warning-1 bg-tag-warning-1/15 text-tag-warning-1',
    2: 'border-tag-warning-2 bg-tag-warning-2/15 text-tag-warning-2',
    3: 'border-tag-warning-3 bg-tag-warning-3/15 text-tag-warning-3',
    4: 'border-tag-warning-4 bg-tag-warning-4/15 text-tag-warning-4',
    5: 'border-tag-warning-5 bg-tag-warning-5/15 text-tag-warning-5'
  },
  neutral: {
    1: 'border-tag-neutral-1 bg-tag-neutral-1/15 text-tag-neutral-1',
    2: 'border-tag-neutral-2 bg-tag-neutral-2/15 text-tag-neutral-2',
    3: 'border-tag-neutral-3 bg-tag-neutral-3/15 text-tag-neutral-3',
    4: 'border-tag-neutral-4 bg-tag-neutral-4/15 text-tag-neutral-4',
    5: 'border-tag-neutral-5 bg-tag-neutral-5/15 text-tag-neutral-5'
  }
}

export function clampLevel(level: number): number {
  return Math.min(5, Math.max(1, Math.round(level)))
}

export function tagBgClass(kind: TagKind, level: number): string {
  return BG_CLASS[kind][clampLevel(level)]
}

export function tagChipClass(kind: TagKind, level: number): string {
  return CHIP_CLASS[kind][clampLevel(level)]
}

export function tagGlowBarClass(kind: TagKind, level: number): string {
  const lvl = clampLevel(level)
  return `${BG_CLASS[kind][lvl]} ${TEXT_CLASS[kind][lvl]} shadow-[0_0_6px_currentColor]`
}

export function tagFgClass(level: number): string {
  return clampLevel(level) <= 2 ? 'text-tag-fg-on-pale' : 'text-tag-fg-on-deep'
}
