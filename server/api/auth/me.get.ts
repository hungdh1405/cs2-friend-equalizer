// A GET, so the auth middleware never blocks it — it just reports whether *this* session
// currently holds a live CRUD token, so the client knows whether to prompt for the PIN
// before the next create/edit/delete.
export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  const expiresAt = session.data.crudTokenExpiresAt

  if (hasValidCrudToken(session)) {
    return { hasToken: true, expiresAt }
  }
  return { hasToken: false }
})
