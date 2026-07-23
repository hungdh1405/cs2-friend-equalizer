import { z } from 'zod'

const MAX_ATTEMPTS = 5
const BLOCK_MS = 24 * 60 * 60 * 1000

const bodySchema = z.object({
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits')
})

export default defineEventHandler(async (event) => {
  const { pin } = await readValidatedBody(event, bodySchema.parse)
  const ip = getClientIp(event)
  const now = Date.now()

  const existing = await getThrottle(ip)
  if (existing?.blockedUntil && existing.blockedUntil > now) {
    const minutesLeft = Math.ceil((existing.blockedUntil - now) / 60000)
    throw createError({
      statusCode: 429,
      statusMessage: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`
    })
  }

  const config = useRuntimeConfig(event)
  // Nuxt's runtime-config env override auto-casts numeric-looking strings (via `destr`),
  // so NUXT_APP_PIN=123456 arrives here as the *number* 123456 — compare as strings.
  const expectedPin = String(config.appPin ?? '')
  if (!expectedPin || pin !== expectedPin) {
    const attempts = (existing?.blockedUntil ? 0 : existing?.attempts ?? 0) + 1

    if (attempts >= MAX_ATTEMPTS) {
      await setThrottle(ip, { attempts, blockedUntil: now + BLOCK_MS })
      throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again in 24 hours.' })
    }

    await setThrottle(ip, { attempts, blockedUntil: null })
    throw createError({ statusCode: 401, statusMessage: 'Incorrect PIN' })
  }

  await clearThrottle(ip)
  const session = await getAuthSession(event)
  const expiresAt = now + CRUD_TOKEN_TTL_MS
  await session.update({ crudTokenExpiresAt: expiresAt })

  return { ok: true, expiresAt }
})
