// Reads are public — anyone can view the roster, a player's profile, or the change log
// without a PIN. Only mutating requests (create/update/delete/upload/import/reset) need a
// valid CRUD token, obtained via POST /api/auth/login and valid for 15 minutes.
//
// /api/discord/interactions is a POST called directly by Discord's servers, not a browser
// with our session cookie — it's public here but secured inside the route itself via an
// Ed25519 signature check against the stored Discord Public Key, not the CRUD token.
const PUBLIC_PATHS = new Set(['/api/auth/login', '/api/auth/logout', '/api/auth/me', '/api/discord/interactions'])
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]

  if (!path.startsWith('/api/')) return
  if (PUBLIC_PATHS.has(path)) return
  if (SAFE_METHODS.has(event.method)) return

  const session = await getAuthSession(event)
  if (!hasValidCrudToken(session)) {
    throw createError({ statusCode: 401, statusMessage: 'PIN required to make changes' })
  }
})
