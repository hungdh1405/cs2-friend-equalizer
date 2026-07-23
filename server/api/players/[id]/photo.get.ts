export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const dataUrl = await getPhoto(id!)

  if (!dataUrl) {
    throw createError({ statusCode: 404, statusMessage: 'No photo' })
  }

  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl)
  if (!match) {
    throw createError({ statusCode: 500, statusMessage: 'Corrupt photo data' })
  }

  const [, mimeType, base64] = match
  setResponseHeader(event, 'Content-Type', mimeType)
  setResponseHeader(event, 'Cache-Control', 'private, max-age=60')
  return Buffer.from(base64, 'base64')
})
