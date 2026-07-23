export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const tags = await getTags()
  const index = tags.findIndex(tag => tag.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  tags.splice(index, 1)
  await setTags(tags)

  // Cascade: strip the deleted tag from every player that had it, so no dangling tagId remains.
  const roster = await getRoster()
  let changed = false
  for (const player of roster) {
    if (id in player.tagLevels) {
      delete player.tagLevels[id]
      changed = true
    }
  }
  if (changed) await setRoster(roster)

  return { ok: true }
})
