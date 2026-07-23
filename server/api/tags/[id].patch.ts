import { z } from 'zod'

const bodySchema = z.object({
  label: z.string().trim().min(1).max(40).optional(),
  icon: z.string().trim().min(1).max(60).optional(),
  kind: z.enum(['positive', 'warning', 'neutral']).optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, bodySchema.parse)

  const tags = await getTags()
  const index = tags.findIndex(tag => tag.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  tags[index] = { ...tags[index], ...body }
  await setTags(tags)

  return tags[index]
})
