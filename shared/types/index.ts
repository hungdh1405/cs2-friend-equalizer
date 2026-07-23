export type Role = 'igl' | 'entry' | 'awper' | 'lurker' | 'support' | 'anchor' | 'rifler' | 'rotator' | 'flex'

export const ROLES: { value: Role, label: string, description: string }[] = [
  { value: 'igl', label: 'In-Game Leader (IGL)', description: 'Guides the team with strategies and mid-round adjustments.' },
  { value: 'entry', label: 'Entry Fragger', description: 'Pushes aggressively to break through defenses and secure early kills.' },
  { value: 'awper', label: 'AWPer', description: 'Controls long angles with the sniper rifle, secures crucial kills when it matters most.' },
  { value: 'lurker', label: 'Lurker', description: 'Operates solo to gather information, apply pressure, and flank enemies.' },
  { value: 'support', label: 'Support', description: 'Uses utility to create openings and assist teammates.' },
  { value: 'anchor', label: 'Anchor', description: 'Holds a bombsite alone under pressure — the last line of defense on that site.' },
  { value: 'rifler', label: 'Rifler', description: 'Core all-around rifle duelist; the default when nothing more specific fits.' },
  { value: 'rotator', label: 'Rotator', description: 'Reads round info and rotates between sites to reinforce as needed.' },
  { value: 'flex', label: 'Flex', description: 'No fixed identity — plays whatever the round calls for.' }
]

export type TagKind = 'positive' | 'warning' | 'neutral'

export interface Tag {
  id: string
  label: string
  /** Lucide icon component name, e.g. "Crosshair" */
  icon: string
  kind: TagKind
  createdAt: string
}

export interface Player {
  id: string
  name: string
  /** 0-120, the master ranking number */
  score: number
  role: Role
  /** tagId -> level, 1-5. Drives badge color intensity only, never shown as a number. */
  tagLevels: Record<string, number>
  hasPhoto: boolean
  createdAt: string
  updatedAt: string
}

export type ChangeLogField =
  | 'score'
  | 'tagLevel'
  | 'tagAdded'
  | 'tagRemoved'
  | 'role'
  | 'name'
  | 'photo'
  | 'created'
  | 'deleted'

export interface ChangeLogEntry {
  id: string
  /** ISO timestamp */
  at: string
  ip: string
  playerId: string
  /** Denormalized so the log reads fine even if the player is later deleted. */
  playerName: string
  field: ChangeLogField
  from?: string | number
  to?: string | number
  /** Pre-rendered from the template pool. */
  message: string
}
