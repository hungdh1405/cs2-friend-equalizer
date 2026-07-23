import type { Tag, TagKind } from '#shared/types'

export interface TagInput {
  label: string
  icon: string
  kind: TagKind
}

export function useTags() {
  const tags = useState<Tag[]>('tags', () => [])

  async function refresh() {
    const requestFetch = import.meta.server ? useRequestFetch() : $fetch
    tags.value = await requestFetch<Tag[]>('/api/tags')
  }

  async function createTag(input: TagInput) {
    await ensureCrudToken()
    const tag = await $fetch<Tag>('/api/tags', { method: 'POST', body: input })
    tags.value = [...tags.value, tag]
    return tag
  }

  async function updateTag(id: string, patch: Partial<TagInput>) {
    await ensureCrudToken()
    const updated = await $fetch<Tag>(`/api/tags/${id}`, { method: 'PATCH', body: patch })
    tags.value = tags.value.map(tag => tag.id === id ? updated : tag)
    return updated
  }

  async function deleteTag(id: string) {
    await ensureCrudToken()
    await $fetch(`/api/tags/${id}`, { method: 'DELETE' })
    tags.value = tags.value.filter(tag => tag.id !== id)
  }

  function tagById(id: string): Tag | undefined {
    return tags.value.find(tag => tag.id === id)
  }

  function labelOf(id: string): string {
    return tagById(id)?.label ?? id
  }

  return { tags, refresh, createTag, updateTag, deleteTag, tagById, labelOf }
}
