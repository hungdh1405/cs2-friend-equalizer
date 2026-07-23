// Flavor text for the "match assembly" announcement ticker on /teams — same pick+render
// pattern as server/utils/changelog-messages.ts, just client-side since it's purely cosmetic
// (never persisted). {name} and {team} are template placeholders.
const ASSIGN_TEMPLATES = [
  '{name} locks in with {team}.',
  '{team} welcomes {name} aboard.',
  '{name} suits up for {team}.',
  '{name} reports for duty — {team}.',
  '{team} drafts {name}.',
  '{name} joins the {team} lineup.',
  'Squad update: {name} to {team}.',
  '{name} is deployed to {team}.',
  '{team} calls up {name}.',
  '{name} takes their spot on {team}.',
  'Roster lock: {name} rolls with {team}.',
  '{team} signs {name}.',
  '{name} clips in with {team}.',
  'Match setup: {name} assigned to {team}.',
  '{team} and {name} — locked and loaded.',
  '{name} answers the call for {team}.',
  '{team} secures {name} for this match.',
  '{name} falls in with {team}.',
  'Tactical assignment: {name} to {team}.',
  '{team} welcomes their newest operator, {name}.',
  '{name} gears up with {team}.',
  '{team} finalizes {name}\'s spot.',
  '{name} is a go for {team}.',
  '{team} and {name}. Let\'s move out.',
  '{name} checks in with {team}.'
]

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '')
}

/** Randomized (not round-robin) — a stray immediate repeat across 25 templates is rare
 * enough not to matter for a ticker that's on screen a few seconds at most. */
export function pickAssignMessage(name: string, team: string): string {
  const template = ASSIGN_TEMPLATES[Math.floor(Math.random() * ASSIGN_TEMPLATES.length)]
  return render(template, { name, team })
}
