// The 132 flavor-text templates from DESIGN.md Appendix A. Placeholders are substituted
// by server/utils/changelog.ts. Picked pseudo-randomly per entry so the feed reads like a
// narrative rather than a repetitive diff.

export const SCORE_UP = [
  "{name}'s rating climbs from {old} to {new}. The grind is real.",
  "Someone's been in aim_botz — {name} jumps to {new} (+{delta}).",
  '{name} put in the work: {old} → {new}. Respect.',
  'Scouts are taking notes: {name} is now rated {new}.',
  '{name} quietly improved to {new}. No fanfare needed.',
  'Big week for {name} — score up to {new} (+{delta}).',
  "{name}'s aim isn't an accident anymore. {old} → {new}.",
  'Rating update: {name} now sits at {new}, trending up.',
  '{name} is cooking. New score: {new}.',
  "The numbers don't lie — {name} earned that jump to {new}.",
  "{name} climbed {delta} points. Someone's tryharding.",
  'Officially better than last week: {name} at {new}.',
  "{name}'s consistency is paying off. {old} → {new}.",
  'Watch out for {name} — freshly rated at {new}.',
  '{name} leveled up in real life. Score: {new}.',
  'Small steps, real progress: {name} now at {new}.',
  '{name} earned a promotion. New rating: {new}.',
  'The scoreboard agrees: {name} is on the up, now {new}.',
  "{name}'s form is scary good lately. {old} → {new}.",
  'Rank check: {name} moved up to {new}. Keep it up.'
]

export const SCORE_DOWN = [
  '{name} slipped from {old} to {new}. Rough patch, happens to everyone.',
  "{name}'s rating dips to {new}. Might be time for aim_botz.",
   'Down to {new} for {name} — the queue has been unkind.',
  '{name} dropped {delta} points. Blame the ping, not the aim.',
  '{name} is rated {new} now. Everyone has an off month.',
  'The numbers took a hit: {name} down to {new}.',
  "{name}'s streak ended — new score {new}.",
  '{name} fell to {new}. Time to review some demos.',
  "Not {name}'s week — rating adjusted down to {new}.",
  '{name} dipped from {old} to {new}. Recovery arc incoming.',
  'The queue humbled {name}: now rated {new}.',
  '{name} is at {new}. Everyone slumps sometimes.',
  'Score correction for {name}: {old} → {new}.',
  "{name}'s rating cooled off to {new}.",
  'Tough stretch for {name}, now sitting at {new}.',
  '{name} lost {delta} points. Redemption arc starts now.',
  '{name} down to {new} — could be worse.',
  'The rating committee adjusted {name} down to {new}.',
  "{name}'s form dipped to {new}. Happens to the best.",
  'New number for {name}: {new}. Onwards and upwards from here.'
]

export const TAG_LEVEL_UP = [
  "{name}'s {tag} level jumped from {oldLevel} to {newLevel}.",
  '{tag} is looking sharper for {name}: {oldLevel} → {newLevel}.',
  '{name} leveled up {tag} to {newLevel}/5.',
  'Noticeable improvement in {tag} for {name} — now {newLevel}.',
  "{name}'s {tag} rating climbs to {newLevel}.",
  "Put in the reps: {name}'s {tag} is now {newLevel}/5.",
  '{tag} upgrade for {name}: {oldLevel} → {newLevel}.',
  '{name} is getting genuinely good at {tag} — {newLevel}/5 now.',
  "Progress logged: {name}'s {tag} level is {newLevel}.",
  "{name}'s {tag} game stepped up to {newLevel}/5.",
  'Solid growth in {tag} from {name}: now {newLevel}/5.',
  '{name} bumped their {tag} rating to {newLevel}.'
]

export const TAG_LEVEL_DOWN = [
  "{name}'s {tag} level slipped to {newLevel}/5.",
  '{tag} rating for {name} adjusted down: {oldLevel} → {newLevel}.',
  '{name} is a bit rusty on {tag} lately — now {newLevel}/5.',
  "Reassessed: {name}'s {tag} dropped to {newLevel}.",
  "{name}'s {tag} needs work again — {newLevel}/5.",
  '{tag} level for {name} cooled off to {newLevel}.',
  '{name} lost a step in {tag}: {oldLevel} → {newLevel}.',
  "Time for practice — {name}'s {tag} is down to {newLevel}/5.",
  "{name}'s {tag} rating dipped to {newLevel}.",
  '{tag} downgrade for {name}: now {newLevel}/5.'
]

export const TAG_ADDED = [
  '{name} picked up the {tag} tag. Skill acknowledged.',
  'New badge unlocked for {name}: {tag}.',
  '{name} is now officially tagged {tag}.',
  'The council has ruled: {name} has {tag}.',
  '{name} earned the {tag} label. About time.',
  'Tagged: {name} now carries {tag}.',
  "{name}'s profile grows — {tag} added.",
  "It's official — {name} has {tag} energy.",
  '{name} added {tag} to the resume.',
  'New skill on file for {name}: {tag}.',
  '{name} showed enough {tag} to earn the tag.',
  'Badge ceremony: {name} receives {tag}.',
  "{name}'s scouting report now includes {tag}.",
  '{tag} added to {name} — noted for future team picks.',
  '{name} leveled up their profile with {tag}.',
  'Fresh tag for {name}: {tag}. Well deserved.'
]

export const TAG_REMOVED = [
  "{tag} removed from {name}'s profile. Reassessed.",
  '{name} no longer carries the {tag} tag.',
  "The {tag} label didn't hold up — removed from {name}.",
  "{name}'s {tag} tag was retired.",
  'Profile update: {tag} taken off {name}.',
  '{name} outgrew the {tag} tag — removed.',
  "{tag} no longer fits {name}'s playstyle. Removed.",
  '{name} lost the {tag} tag.',
  "{name}'s {tag} badge has been revoked.",
  'Reassessment complete — {tag} removed from {name}.',
  "{name} doesn't need the {tag} label anymore.",
  "{tag} archived from {name}'s profile."
]

export const PLAYER_CREATED = [
  '{name} joined the roster. Welcome to the grind.',
  'New face in the squad: {name}.',
  '{name} has entered the server.',
  'The roster grows — say hello to {name}.',
  '{name} added to the roster at {new} points.',
  'Fresh recruit: {name}, starting rating {new}.',
  '{name} is officially part of the crew now.',
  'Roster update: {name} joins in.',
  "{name} pulled up a chair. Let's see what they've got.",
  'New player registered: {name}.',
  "{name} joins the ranks — may their aim be true.",
  'The squad welcomes {name} to the roster.'
]

export const PLAYER_DELETED = [
  '{name} has left the roster.',
  '{name} was removed from the roster.',
  'Roster update: {name} is no longer listed.',
  '{name} exited the server, for now.',
  "{name}'s profile was archived.",
  'The roster says goodbye to {name}.',
  '{name} removed — retired, benched, or just busy IRL.',
  '{name} has been taken off the roster.'
]

export const ROLE_CHANGED = [
  "{name}'s role updated: {old} → {new}.",
  '{name} is now playing {new}.',
  'Role swap for {name}: {new}.',
  '{name} switched things up — new role {new}.',
  'Tactical update: {name} now runs {new}.',
  "{name}'s primary role is now {new}.",
  '{name} moved from {old} to {new}.',
  'Position change logged for {name}: {new}.'
]

export const PHOTO_CHANGED = [
  '{name} updated their profile photo.',
  'New look for {name} — photo updated.',
  '{name} refreshed their profile picture.',
  '{name} has a new look on file.',
  "{name}'s profile picture was changed.",
  '{name} got a glow-up. New photo on file.',
  'Fresh photo uploaded for {name}.',
  "{name}'s avatar has been updated."
]

export const NAME_CHANGED = [
  '{oldName} is now known as {newName}.',
  'Name update: {oldName} → {newName}.',
  '{oldName} rebranded to {newName}.',
  'Roster correction: {oldName} is now {newName}.',
  '{newName} was formerly known as {oldName}.',
  'Identity update: {oldName} → {newName}.'
]
