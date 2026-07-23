import type { H3Event } from 'h3'

// Reads are public. Only CRUD (non-GET) requests need a token, minted by POST /api/auth/login
// and valid for CRUD_TOKEN_TTL_MS from then — not tied to the session cookie's own lifetime.
export const CRUD_TOKEN_TTL_MS = 15 * 60 * 1000

export interface AuthSessionData {
  crudTokenExpiresAt?: number
}

const FALLBACK_DEV_PASSWORD = 'insecure-dev-only-session-password-please-set-NUXT_SESSION_PASSWORD'

export function getSessionConfig(event: H3Event) {
  const config = useRuntimeConfig(event)
  return {
    password: config.sessionPassword || FALLBACK_DEV_PASSWORD,
    name: 'cs2fe-session',
    // The cookie itself can live long — it's just a container. The actual CRUD permission
    // inside it (crudTokenExpiresAt) is what expires after 15 minutes, checked separately.
    maxAge: 60 * 60 * 24 * 30
  }
}

export function getAuthSession(event: H3Event) {
  return useSession<AuthSessionData>(event, getSessionConfig(event))
}

export function hasValidCrudToken(session: Awaited<ReturnType<typeof getAuthSession>>): boolean {
  const expiresAt = session.data.crudTokenExpiresAt
  return typeof expiresAt === 'number' && expiresAt > Date.now()
}

/** Cloudflare's `CF-Connecting-IP` is authoritative in production; falls back to X-Forwarded-For locally. */
export function getClientIp(event: H3Event): string {
  const cfIp = getHeader(event, 'cf-connecting-ip')
  if (cfIp) return cfIp
  return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
}
