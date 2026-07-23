export default defineEventHandler(async () => {
  let tags = await getTags()

  if (tags.length === 0) {
    tags = buildDefaultTags(new Date().toISOString())
    await setTags(tags)
  }

  return tags
})
