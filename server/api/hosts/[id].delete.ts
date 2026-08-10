import { isProtectedHost } from '#shared/utils/hosts'

// Non-GET /api/* route — gated by the existing CRUD-token middleware.
export default defineEventHandler(async (event) => {
  const discordUserId = getRouterParam(event, 'id')!
  if (isProtectedHost(discordUserId)) {
    throw createError({ statusCode: 403, statusMessage: 'This Host cannot be removed' })
  }
  return removeHost(discordUserId)
})
