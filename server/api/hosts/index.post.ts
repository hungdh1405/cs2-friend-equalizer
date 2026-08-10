import { z } from 'zod'

// Non-GET /api/* route — gated by the existing CRUD-token middleware, same as adding a player.
const bodySchema = z.object({
  discordUserId: z.string().regex(/^\d{15,25}$/, 'Discord user IDs are numeric snowflakes'),
  username: z.string().trim().max(60).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  return addHost({ discordUserId: body.discordUserId, username: body.username, addedAt: new Date().toISOString() })
})
