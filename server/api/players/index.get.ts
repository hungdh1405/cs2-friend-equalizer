export default defineEventHandler(async () => {
  let roster = await getRoster()

  if (roster.length === 0) {
    const now = new Date().toISOString()
    const tags = await getTags()
    if (tags.length === 0) {
      await setTags(buildDefaultTags(now))
    }
    roster = buildDefaultPlayers(now)
    await setRoster(roster)
  }

  return roster
})
