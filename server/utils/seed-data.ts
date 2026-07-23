import type { Player, Role, Tag, TagKind } from '#shared/types'

interface SeedTag {
  id: string
  label: string
  icon: string
  kind: TagKind
}

// Original reference-app skill set, plus an expanded catalog (weapons, utility specifics,
// tactics, game sense, team culture, and fun "title" tags) — see DESIGN.md §3.
const SEED_TAGS: SeedTag[] = [
  // Reference app's original skill set
  { id: 'aim', label: 'Aim', icon: 'Crosshair', kind: 'positive' },
  { id: 'rifle', label: 'Rifle', icon: 'Target', kind: 'positive' },
  { id: 'awp', label: 'AWP', icon: 'Telescope', kind: 'positive' },
  { id: 'aug', label: 'AUG', icon: 'Zap', kind: 'positive' },
  { id: 'smg', label: 'SMG', icon: 'Wind', kind: 'positive' },
  { id: 'utility', label: 'Utility', icon: 'Bomb', kind: 'positive' },
  { id: 'tactics', label: 'Tactics', icon: 'Brain', kind: 'positive' },
  { id: 'setup', label: 'Setup', icon: 'Puzzle', kind: 'positive' },
  { id: 'defense', label: 'Defense', icon: 'Shield', kind: 'positive' },
  { id: 'attack', label: 'Attack', icon: 'Swords', kind: 'positive' },
  { id: 'teamwork', label: 'Teamwork', icon: 'Users', kind: 'positive' },
  { id: 'clutch', label: 'Clutch', icon: 'Flame', kind: 'positive' },
  { id: 'multikill', label: 'Multi-kill', icon: 'Skull', kind: 'positive' },
  { id: 'map', label: 'Map knowledge', icon: 'Map', kind: 'positive' },
  { id: 'entry', label: 'Entry', icon: 'DoorOpen', kind: 'positive' },
  { id: 'sacrifice', label: 'Sacrifice', icon: 'HeartHandshake', kind: 'positive' },
  { id: 'listen', label: 'Listens to calls', icon: 'Ear', kind: 'positive' },
  { id: 'mentalRisk', label: 'Affected by pressure', icon: 'AlertTriangle', kind: 'warning' },
  { id: 'inconsistent', label: 'Inconsistent', icon: 'TrendingDown', kind: 'warning' },
  { id: 'lowUtility', label: 'Weak utility', icon: 'CircleMinus', kind: 'warning' },
  { id: 'lowTeamwork', label: 'Limited teamwork', icon: 'UserMinus', kind: 'warning' },
  { id: 'teamFlash', label: 'Team-flashes', icon: 'EyeOff', kind: 'warning' },
  { id: 'disciplineRisk', label: 'Lacks discipline', icon: 'Footprints', kind: 'warning' },
  { id: 'pc', label: 'Strong PC', icon: 'Monitor', kind: 'neutral' },

  // Weapon & combat
  { id: 'pistol-ace', label: 'Pistol Round Ace', icon: 'CircleDot', kind: 'positive' },
  { id: 'one-tap', label: 'One-Tap Threat', icon: 'Focus', kind: 'positive' },
  { id: 'spray-control', label: 'Spray Control', icon: 'AlignJustify', kind: 'positive' },
  { id: 'wallbang', label: 'Wallbang Sense', icon: 'ScanLine', kind: 'positive' },

  // Utility, more specific than the generic "utility" tag
  { id: 'smoke-lineups', label: 'Smoke Lineups', icon: 'CloudFog', kind: 'positive' },
  { id: 'molotov-control', label: 'Molotov Control', icon: 'FlameKindling', kind: 'positive' },
  { id: 'flash-assist', label: 'Flash Assist', icon: 'Sparkle', kind: 'positive' },
  { id: 'he-damage', label: 'HE Damage', icon: 'Bomb', kind: 'positive' },

  // Tactics & leadership
  { id: 'shot-caller', label: 'Shot Caller', icon: 'Megaphone', kind: 'positive' },
  { id: 'mid-round', label: 'Mid-Round Adjustments', icon: 'Radio', kind: 'positive' },
  { id: 'retake-specialist', label: 'Retake Specialist', icon: 'ShieldCheck', kind: 'positive' },
  { id: 'post-plant', label: 'Post-Plant Positioning', icon: 'MapPinned', kind: 'positive' },
  { id: 'anti-eco', label: 'Anti-Eco Discipline', icon: 'PiggyBank', kind: 'positive' },
  { id: 'lurker-style', label: 'Lurker', icon: 'Footprints', kind: 'neutral' },
  { id: 'space-creator', label: 'Space Creator', icon: 'Expand', kind: 'positive' },
  { id: 'trade-fragger', label: 'Trade Fragger', icon: 'Repeat2', kind: 'positive' },

  // Game sense & mechanics
  { id: 'game-sense', label: 'Game Sense', icon: 'Radar', kind: 'positive' },
  { id: 'sound-reading', label: 'Sound Reading', icon: 'Ear', kind: 'positive' },
  { id: 'crosshair-placement', label: 'Crosshair Placement', icon: 'Aperture', kind: 'positive' },
  { id: 'movement', label: 'Movement / Bhop', icon: 'Wind', kind: 'positive' },
  { id: 'peekers-advantage', label: "Peeker's Advantage", icon: 'ArrowLeftRight', kind: 'positive' },

  // Team culture — positive
  { id: 'hype-teammate', label: 'Hype Teammate', icon: 'Smile', kind: 'positive' },
  { id: 'tilt-proof', label: 'Tilt-Proof', icon: 'Anchor', kind: 'positive' },
  { id: 'warmup-discipline', label: 'Warm-Up Discipline', icon: 'Dumbbell', kind: 'positive' },
  { id: 'reliable-attendance', label: 'Reliable Attendance', icon: 'CalendarCheck', kind: 'positive' },

  // Team culture — warning
  { id: 'rage-prone', label: 'Rage-Prone', icon: 'AlertOctagon', kind: 'warning' },
  { id: 'baiter', label: 'Baiter', icon: 'UserX', kind: 'warning' },
  { id: 'toxic-comms', label: 'Toxic Comms', icon: 'MicOff', kind: 'warning' },
  { id: 'flaky-attendance', label: 'Flaky Attendance', icon: 'CalendarX', kind: 'warning' },
  { id: 'save-round-hero', label: 'Save-Round Hero', icon: 'ShieldAlert', kind: 'warning' },
  { id: 'ghosts-calls', label: 'Ghosts Calls', icon: 'UserMinus', kind: 'warning' },

  // Neutral / setup
  { id: 'unstable-connection', label: 'Unstable Connection', icon: 'WifiOff', kind: 'warning' },
  { id: 'good-mic', label: 'Good Mic Setup', icon: 'Mic', kind: 'neutral' },

  // Fun titles
  { id: 'clutch-king', label: 'Clutch King/Queen', icon: 'Crown', kind: 'positive' },
  { id: 'ace-machine', label: 'Ace Machine', icon: 'Sparkles', kind: 'positive' },
  { id: 'the-wall', label: 'The Wall', icon: 'Shield', kind: 'positive' },
  { id: 'human-aimbot', label: 'Human Aimbot', icon: 'Crosshair', kind: 'positive' },
  { id: 'one-tap-god', label: 'One-Tap God', icon: 'Zap', kind: 'positive' },
  { id: 'nade-king', label: 'Nade King', icon: 'Bomb', kind: 'positive' },
  { id: 'silent-assassin', label: 'Silent Assassin', icon: 'Ghost', kind: 'positive' },
  { id: 'the-cleaner', label: 'The Cleaner', icon: 'CheckCheck', kind: 'positive' },
  { id: 'glue-guy', label: 'Glue Guy', icon: 'Link', kind: 'positive' },
  { id: 'eco-warrior', label: 'Eco Warrior', icon: 'Coins', kind: 'positive' },
  { id: 'boost-buddy', label: 'Boost Buddy', icon: 'ArrowUpCircle', kind: 'positive' },
  { id: 'rage-quitter', label: 'Rage Quitter', icon: 'LogOut', kind: 'warning' }
]

export function buildDefaultTags(now: string): Tag[] {
  return SEED_TAGS.map(tag => ({ ...tag, createdAt: now }))
}

interface SeedPlayer {
  id: string
  name: string
  score: number
  role: Role
  /** tagId -> level (1-5). Levels are a deliberate read of references/note.txt, not a flat default. */
  tagLevels: Record<string, number>
}

// Migrated from references/index.html + references/note.txt. Scores are carried over as-is
// (they already track the note's relative comparisons — e.g. "if Quang is a 10, Colia is
// around 8" ⇒ 100/83). Tags are re-picked from the new catalog above rather than copying the
// reference's tag ids 1:1, and a couple of players pick up a fun "title" tag where the note's
// description clearly earns one (see DESIGN.md's migration notes for the per-player reasoning).
const SEED_PLAYERS: SeedPlayer[] = [
  {
    id: 'quang',
    name: 'Quang',
    score: 100,
    role: 'flex',
    // Plays very smart — already covered by tactics + game-sense (5 each), no separate vague
    // "smart" tag needed (see decisions log: that tag was dropped as too generic/judgmental).
    tagLevels: { aim: 5, rifle: 5, awp: 4, map: 5, tactics: 5, 'game-sense': 5, multikill: 5, clutch: 4, 'ace-machine': 5 }
  },
  {
    id: 'trunk',
    name: 'Trunk',
    score: 85,
    role: 'awper',
    // "Very strong aim, can often take 3-4 kills" but "lacks knowledge of grenade lineups and
    // tactical setups". Corrected: that's just "doesn't know them" (no tactics/setup tag), not
    // a `lowUtility` weakness — he's not actually bad at utility, so no warning tag here at all.
    // (Also: "HieuLH" was Trunk all along, not a separate player — the game-sense:3 meant for
    // "HieuLH" belongs here.)
    tagLevels: { aim: 5, rifle: 4, awp: 4, multikill: 4, 'game-sense': 3, 'human-aimbot': 4 }
  },
  {
    id: 'colia',
    name: 'Colia',
    score: 83,
    role: 'awper',
    // "Slightly better than Foyu because of stronger aim." Also quite smart (per correction) —
    // expressed as `game-sense`, not a generic "smart" tag; not at Quang's level, but real.
    tagLevels: { aim: 5, rifle: 4, awp: 4, 'game-sense': 4 }
  },
  {
    id: 'foyu',
    name: 'Foyu',
    score: 81,
    role: 'igl',
    // "Very well-rounded... excellent defensive play... understands setups for both attack and
    // defense." The reference app's own fixup logic specifically called out clutch for Foyu —
    // earns the Clutch King title, not just the base tag.
    tagLevels: { rifle: 4, utility: 4, tactics: 5, setup: 4, defense: 5, teamwork: 4, clutch: 4, 'game-sense': 3, 'clutch-king': 4 }
  },
  {
    id: 'bach-khoi',
    name: 'Bạch Khởi',
    score: 80,
    role: 'awper',
    // "Specializes in AWP, knows setups and grenade lineups, strong in offensive plays."
    tagLevels: { awp: 5, attack: 4, utility: 4, tactics: 4, setup: 4 }
  },
  {
    id: 'kill',
    name: 'KILL',
    score: 74,
    role: 'rifler',
    // "Smart gameplay... knows grenades at an OK level. Slightly weaker aim than Colia."
    // "Smart" -> game-sense, not a generic tag (see decisions log).
    tagLevels: { aim: 2, rifle: 4, aug: 4, utility: 3, tactics: 3, 'game-sense': 4 }
  },
  {
    id: 'ksir',
    name: 'Ksir',
    score: 68,
    role: 'rifler',
    // "Specializes in AUG and T-side weapons. Limited knowledge of setups and tactical plays."
    tagLevels: { rifle: 4, aug: 4, attack: 3, lowUtility: 3, 'game-sense': 3 }
  },
  {
    id: 'danking',
    name: 'DanKing',
    score: 67,
    role: 'rifler',
    // "Decent aim but often affected by pressure."
    tagLevels: { aim: 3, rifle: 3, utility: 3, tactics: 3, mentalRisk: 4 }
  },
  {
    id: 'ladygaga',
    name: 'Ladygaga',
    score: 63,
    role: 'rifler',
    tagLevels: { rifle: 3, aug: 3, sacrifice: 3 }
  },
  {
    id: 'longkhatmau',
    name: 'Longkhatmau',
    score: 66,
    role: 'awper',
    // Good at AWP (bumped up); teamwork is normal, not a weakness — no lowTeamwork tag, per
    // correction. Still doesn't know grenades and rifle is inconsistent.
    tagLevels: { awp: 5, inconsistent: 3, lowUtility: 4 }
  },
  {
    id: 'binh-gold',
    name: 'Bình Gold',
    score: 64,
    role: 'support',
    // "Knows many setups, grenade lineups, tactical angles. Gunplay is inconsistent."
    tagLevels: { utility: 4, tactics: 4, setup: 4, inconsistent: 3 }
  },
  {
    id: 'den',
    name: 'Đen',
    score: 58,
    role: 'rifler',
    // "Aim slightly weaker than Ksir. Not very smart, often flashes teammates by mistake."
    // Corrected: very low utility, and *always* (not just "often") flashes teammates — that
    // specific `teamFlash` tag covers it, no separate `lowTeamwork` on top.
    tagLevels: { rifle: 3, teamFlash: 5, inconsistent: 2, lowUtility: 5 }
  },
  {
    id: 'hungkhatmau',
    name: 'hungkhatmau',
    score: 40,
    role: 'support',
    // "Listens to teammates. Only good with SMGs. Throws grenades for teammates. Sacrifices himself first."
    tagLevels: { smg: 4, sacrifice: 4, listen: 4, 'boost-buddy': 3 }
  },
  {
    id: 'tainm',
    name: 'TaiNM',
    score: 30,
    role: 'entry',
    // "Weakest aim... rushes out and dies for nothing... doesn't listen to team strategies."
    tagLevels: { pc: 3, disciplineRisk: 5, lowTeamwork: 4 }
  }
]

export function buildDefaultPlayers(now: string): Player[] {
  return SEED_PLAYERS.map(seed => ({
    id: seed.id,
    name: seed.name,
    score: seed.score,
    role: seed.role,
    tagLevels: { ...seed.tagLevels },
    hasPhoto: false,
    createdAt: now,
    updatedAt: now
  }))
}
