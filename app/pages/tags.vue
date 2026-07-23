<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Tag, TagKind } from '#shared/types'
import { LockOpenIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CrudCancelledError } from '@/composables/useCrudGate'
import TagBadge from '@/components/players/TagBadge.vue'
import TagCreateInline from '@/components/players/TagCreateInline.vue'
import TagIconPicker from '@/components/players/TagIconPicker.vue'

const { players } = usePlayers()
const { tags, updateTag, deleteTag, createTag } = useTags()
const isUnlocked = useIsCrudUnlocked()

const KIND_ORDER: TagKind[] = ['positive', 'warning', 'neutral']
const KIND_LABEL: Record<TagKind, string> = { positive: 'Positive', warning: 'Warning', neutral: 'Neutral' }

const query = ref('')

// Local editable copy per tag — kept separate from the source-of-truth `tags` list so a
// half-typed label doesn't overwrite every other place `tags` is read from (e.g. this same
// page's own TagBadge previews) until it's actually saved.
const drafts = reactive<Record<string, { label: string, icon: string, kind: TagKind }>>({})

watch(tags, (list) => {
  for (const tag of list) {
    if (!drafts[tag.id]) drafts[tag.id] = { label: tag.label, icon: tag.icon, kind: tag.kind }
  }
  for (const id of Object.keys(drafts)) {
    if (!list.some(tag => tag.id === id)) delete drafts[id]
  }
}, { immediate: true })

function usageCount(tagId: string) {
  return players.value.filter(player => tagId in player.tagLevels).length
}

const filteredTags = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return needle ? tags.value.filter(tag => tag.label.toLowerCase().includes(needle)) : tags.value
})

const groups = computed(() =>
  KIND_ORDER
    .map(kind => ({ kind, label: KIND_LABEL[kind], tags: filteredTags.value.filter(tag => tag.kind === kind) }))
    .filter(group => group.tags.length > 0)
)

async function saveLabel(tag: Tag) {
  const draft = drafts[tag.id]
  const trimmed = draft.label.trim()
  if (!trimmed) {
    draft.label = tag.label
    return
  }
  if (trimmed === tag.label) return

  try {
    await updateTag(tag.id, { label: trimmed })
    toast.success(`Renamed to "${trimmed}".`)
  } catch (error) {
    draft.label = tag.label
    if (!(error instanceof CrudCancelledError)) toast.error('Could not rename tag.')
  }
}

async function saveIcon(tag: Tag, icon: string) {
  const previous = drafts[tag.id].icon
  drafts[tag.id].icon = icon
  try {
    await updateTag(tag.id, { icon })
  } catch (error) {
    drafts[tag.id].icon = previous
    if (!(error instanceof CrudCancelledError)) toast.error('Could not change icon.')
  }
}

async function saveKind(tag: Tag, kind: TagKind) {
  const previous = drafts[tag.id].kind
  drafts[tag.id].kind = kind
  try {
    await updateTag(tag.id, { kind })
  } catch (error) {
    drafts[tag.id].kind = previous
    if (!(error instanceof CrudCancelledError)) toast.error('Could not change category.')
  }
}

const deletingTag = ref<Tag | null>(null)

// Not a ref: AlertDialogAction's click both fires this component's @click handler AND closes
// the dialog (which nulls `deletingTag` via @update:open) in the same synchronous event — by
// the time confirmDelete's body ran, `deletingTag.value` was already back to null. A plain
// variable outside the open/close reactivity isn't touched by that close handler.
let deleteTarget: Tag | null = null

function requestDelete(tag: Tag) {
  deleteTarget = tag
  deletingTag.value = tag
}

async function confirmDelete() {
  if (!deleteTarget) return
  const tag = deleteTarget
  try {
    await deleteTag(tag.id)
    toast.success(`Deleted "${tag.label}".`)
    deletingTag.value = null
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) toast.error('Could not delete tag.')
  }
}

async function onTagCreated(input: { label: string, icon: string, kind: TagKind }) {
  try {
    const tag = await createTag(input)
    toast.success(`Created tag "${tag.label}".`)
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) throw error
  }
}

async function unlockEditing() {
  try {
    await ensureCrudToken()
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) throw error
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="font-heading text-xl font-semibold tracking-wide">Tags</h1>

    <Card>
      <CardHeader class="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle class="text-sm">Tag catalog</CardTitle>
          <p class="mt-1 text-xs text-muted-foreground">
            Shared across every player — renaming or re-iconing a tag here updates it everywhere
            instantly. Deleting a tag removes it from every player who currently has it.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Input v-model="query" placeholder="Search tags…" class="w-40 sm:w-56" />
          <Button v-if="!isUnlocked" variant="outline" size="sm" @click="unlockEditing">
            <LockOpenIcon data-icon="inline-start" />
            Unlock to edit
          </Button>
        </div>
      </CardHeader>
      <CardContent class="flex flex-col gap-5">
        <Empty v-if="!filteredTags.length">
          <EmptyHeader>
            <EmptyTitle>No tags found</EmptyTitle>
            <EmptyDescription>Try a different search, or add a new tag below.</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <div v-for="group in groups" :key="group.kind" class="flex flex-col gap-2">
          <h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {{ group.label }} <span class="text-muted-foreground/70">({{ group.tags.length }})</span>
          </h2>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="tag in group.tags"
              :key="tag.id"
              class="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div class="flex items-center gap-2">
                <TagIconPicker
                  v-if="isUnlocked && drafts[tag.id]"
                  :model-value="drafts[tag.id].icon"
                  @update:model-value="(icon) => saveIcon(tag, icon)"
                />
                <DynamicIcon v-else :name="tag.icon" class="size-4 shrink-0" />

                <Input
                  v-if="isUnlocked && drafts[tag.id]"
                  v-model="drafts[tag.id].label"
                  maxlength="40"
                  class="h-8 min-w-0 flex-1"
                  @blur="saveLabel(tag)"
                  @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
                />
                <span v-else class="min-w-0 flex-1 truncate text-sm font-medium">{{ tag.label }}</span>

                <Button
                  v-if="isUnlocked"
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  @click="requestDelete(tag)"
                >
                  <Trash2Icon class="text-destructive" />
                </Button>
              </div>

              <div class="flex items-center justify-between gap-2">
                <Select
                  v-if="isUnlocked && drafts[tag.id]"
                  :model-value="drafts[tag.id].kind"
                  @update:model-value="(kind) => saveKind(tag, kind as TagKind)"
                >
                  <SelectTrigger class="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span v-else class="text-xs text-muted-foreground capitalize">{{ tag.kind }}</span>

                <span class="text-xs text-muted-foreground">
                  {{ usageCount(tag.id) }} player{{ usageCount(tag.id) === 1 ? '' : 's' }}
                </span>
              </div>

              <TagBadge :label="tag.label" :icon="tag.icon" :kind="tag.kind" class="w-fit" />
            </div>
          </div>
        </div>

        <TagCreateInline v-if="isUnlocked" @created="onTagCreated" />
      </CardContent>
    </Card>

    <AlertDialog :open="Boolean(deletingTag)" @update:open="(value) => { if (!value) deletingTag = null }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{{ deletingTag?.label }}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the tag from {{ deletingTag ? usageCount(deletingTag.id) : 0 }} player(s) who
            currently have it. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
