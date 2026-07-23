import { z } from 'zod'
import type { Tag } from '#shared/types'

const bodySchema = z.object({
  label: z.string().trim().min(1).max(40),
  icon: z.string().trim().min(1).max(60),
  kind: z.enum(['positive', 'warning', 'neutral'])
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  const tag: Tag = {
    id: crypto.randomUUID(),
    label: body.label,
    icon: body.icon,
    kind: body.kind,
    createdAt: new Date().toISOString()
  }

  const tags = await getTags()
  tags.push(tag)
  await setTags(tags)

  return tag
})
