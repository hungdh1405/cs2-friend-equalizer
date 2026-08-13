import { z } from 'zod'
import type { GameEvent } from '#shared/types'

// Non-GET /api/* route — gated by the existing CRUD-token middleware. A deliberately narrow
// sibling to PATCH /api/events/teams: changing who holds the crown doesn't touch team
// composition, so it skips that endpoint's Discord re-announcement and fresh prediction poll
// entirely — this just flips a label on an already-saved lineup, quietly.
const bodySchema = z.object({
  leaderA: z.string().optional(),
  leaderB: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const current = await getCurrentEvent()
  if (!current?.manualTeams) {
    throw createError({ statusCode: 404, statusMessage: 'No saved team lineup to update' })
  }

  const body = await readValidatedBody(event, bodySchema.parse)
  const { teamA, teamB } = current.manualTeams
  // Same defensive rule as teams.patch.ts: a leader must actually be on the team they're
  // leading, otherwise the pick is silently dropped rather than saved into an inconsistent state.
  const leaderA = body.leaderA && teamA.includes(body.leaderA) ? body.leaderA : undefined
  const leaderB = body.leaderB && teamB.includes(body.leaderB) ? body.leaderB : undefined

  const updated: GameEvent = {
    ...current,
    manualTeams: { ...current.manualTeams, leaderA, leaderB }
  }
  await setCurrentEvent(updated)

  return updated
})
