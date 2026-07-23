export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const roster = await getRoster()
  const index = roster.findIndex(player => player.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  const [removed] = roster.splice(index, 1)
  await setRoster(roster)
  await deletePhoto(removed.id)

  await logPlayerDeleted({ playerId: removed.id, playerName: removed.name, ip: getClientIp(event) })

  return { ok: true }
})
