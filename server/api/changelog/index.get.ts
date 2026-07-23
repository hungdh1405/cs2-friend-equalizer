export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const playerId = typeof query.playerId === 'string' ? query.playerId : undefined
  const limit = Math.min(Number(query.limit) || 50, 200)
  const offset = Math.max(Number(query.offset) || 0, 0)

  let entries = await getChangeLog()
  if (playerId) {
    entries = entries.filter(entry => entry.playerId === playerId)
  }

  return {
    entries: entries.slice(offset, offset + limit),
    total: entries.length
  }
})
