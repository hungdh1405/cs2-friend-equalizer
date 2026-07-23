import { z } from 'zod'

// Client resizes/compresses to ~256px before upload (see PlayerPhotoUpload.vue), so this
// cap is generous headroom, not the expected size.
const bodySchema = z.object({
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/).max(700_000)
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const { dataUrl } = await readValidatedBody(event, bodySchema.parse)

  const roster = await getRoster()
  const index = roster.findIndex(player => player.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  await setPhoto(id, dataUrl)
  roster[index] = { ...roster[index], hasPhoto: true, updatedAt: new Date().toISOString() }
  await setRoster(roster)

  await logPhotoChanged({ playerId: id, playerName: roster[index].name, ip: getClientIp(event) })

  return { ok: true }
})
