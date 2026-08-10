<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Player, Role, TagKind } from '#shared/types'
import { ROLES } from '#shared/types'
import { LoaderCircleIcon, PlusIcon, XIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CrudCancelledError } from '@/composables/useCrudGate'
import { cn } from '@/lib/utils'
import { tagBgClass } from '@/lib/tag-colors'
import PlayerPhotoUpload from './PlayerPhotoUpload.vue'
import TagCreateInline from './TagCreateInline.vue'

const props = defineProps<{ open: boolean, player?: Player | null }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const { createPlayer, updatePlayer, uploadPhoto } = usePlayers()
const { tags, createTag } = useTags()

const name = ref('')
const score = ref(50)
const role = ref<Role>('rifler')
const tagLevels = ref<Record<string, number>>({})
const discordUserId = ref('')
const photoDataUrl = ref<string | undefined>()
const saving = ref(false)

function resetForm() {
  name.value = props.player?.name ?? ''
  score.value = props.player?.score ?? 50
  role.value = props.player?.role ?? 'rifler'
  tagLevels.value = { ...(props.player?.tagLevels ?? {}) }
  discordUserId.value = props.player?.discordUserId ?? ''
  photoDataUrl.value = undefined
}

watch(() => props.open, (isOpen) => {
  if (isOpen) resetForm()
})

const isEdit = computed(() => Boolean(props.player))
const roleDescription = computed(() => ROLES.find(r => r.value === role.value)?.description ?? '')
const selectedTagIds = computed(() => Object.keys(tagLevels.value))
const availableTags = computed(() => tags.value.filter(tag => !(tag.id in tagLevels.value)))

function tagMeta(tagId: string) {
  return tags.value.find(tag => tag.id === tagId)
}

function addTag(tagId: string) {
  tagLevels.value = { ...tagLevels.value, [tagId]: 3 }
}

function removeTag(tagId: string) {
  const rest = { ...tagLevels.value }
  delete rest[tagId]
  tagLevels.value = rest
}

function setLevel(tagId: string, level: number) {
  tagLevels.value = { ...tagLevels.value, [tagId]: level }
}

async function onTagCreated(input: { label: string, icon: string, kind: TagKind }) {
  try {
    const tag = await createTag(input)
    addTag(tag.id)
    toast.success(`Created tag "${tag.label}".`)
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) throw error
  }
}

async function submit() {
  if (!name.value.trim() || saving.value) return
  saving.value = true

  try {
    let playerId: string
    if (isEdit.value && props.player) {
      const updated = await updatePlayer(props.player.id, {
        name: name.value.trim(),
        score: score.value,
        role: role.value,
        tagLevels: tagLevels.value,
        discordUserId: discordUserId.value.trim()
      })
      playerId = updated.id
      toast.success(`Updated ${updated.name}.`)
    } else {
      const created = await createPlayer({
        name: name.value.trim(),
        score: score.value,
        role: role.value,
        tagLevels: tagLevels.value,
        discordUserId: discordUserId.value.trim()
      })
      playerId = created.id
      toast.success(`${created.name} joined the roster.`)
    }

    if (photoDataUrl.value) {
      await uploadPhoto(playerId, photoDataUrl.value)
    }

    emit('update:open', false)
  } catch (error: any) {
    if (!(error instanceof CrudCancelledError)) {
      toast.error(error?.data?.statusMessage ?? 'Something went wrong.')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? `Edit ${player?.name}` : 'Add player' }}</DialogTitle>
        <DialogDescription>
          Name, score, role, and tags. Save is the only confirmation needed.
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <PlayerPhotoUpload v-model="photoDataUrl" :fallback="(name || '?').slice(0, 2).toUpperCase()" />

        <FieldGroup>
          <Field>
            <FieldLabel for="player-name">Name</FieldLabel>
            <Input id="player-name" v-model="name" maxlength="40" required />
          </Field>

          <Field>
            <FieldLabel for="player-score">Score</FieldLabel>
            <Input id="player-score" v-model.number="score" type="number" min="0" max="120" required />
          </Field>

          <Field>
            <FieldLabel for="player-role">Role</FieldLabel>
            <Select v-model="role">
              <SelectTrigger id="player-role" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="option in ROLES" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>{{ roleDescription }}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel for="player-discord-id">Discord ID</FieldLabel>
            <Input id="player-discord-id" v-model="discordUserId" placeholder="Optional — enables VIP vote messages and team-split" maxlength="25" />
            <FieldDescription>
              Links this player to their Discord account, so the bot's vote messages and weekly team splits know who they are. Right-click their name in Discord → Copy User ID (enable Developer Mode first).
            </FieldDescription>
          </Field>
        </FieldGroup>

        <FieldSet>
          <FieldLegend variant="label">Tags</FieldLegend>
          <FieldDescription>Color shows level (1–5) within the tag's category — click a swatch to set it.</FieldDescription>

          <div class="flex flex-col gap-2">
            <div
              v-for="tagId in selectedTagIds"
              :key="tagId"
              class="flex items-center gap-2 rounded-lg border border-border p-2"
            >
              <DynamicIcon :name="tagMeta(tagId)?.icon ?? 'Tag'" class="size-4 shrink-0" />
              <span class="min-w-0 flex-1 truncate text-sm">{{ tagMeta(tagId)?.label ?? tagId }}</span>
              <div class="flex shrink-0 gap-1">
                <button
                  v-for="lvl in 5"
                  :key="lvl"
                  type="button"
                  :aria-label="`Set level ${lvl}`"
                  :class="cn(
                    'size-5 rounded-full border border-border transition-transform',
                    tagBgClass(tagMeta(tagId)?.kind ?? 'neutral', lvl),
                    tagLevels[tagId] === lvl ? 'ring-2 ring-ring ring-offset-1 ring-offset-background scale-110' : ''
                  )"
                  @click="setLevel(tagId, lvl)"
                />
              </div>
              <Button type="button" variant="ghost" size="icon-sm" @click="removeTag(tagId)">
                <XIcon />
              </Button>
            </div>
          </div>

          <Popover>
            <PopoverTrigger as-child>
              <Button type="button" variant="outline" size="sm" class="w-fit">
                <PlusIcon data-icon="inline-start" />
                Add existing tag
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-72 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search tags…" />
                <CommandList>
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="tag in availableTags"
                      :key="tag.id"
                      :value="tag.label"
                      @select="addTag(tag.id)"
                    >
                      <DynamicIcon :name="tag.icon" />
                      {{ tag.label }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <TagCreateInline @created="onTagCreated" />
        </FieldSet>

        <div
          v-if="saving"
          class="hud-frame flex items-center gap-3 rounded-xl border border-primary/40 bg-card/85 px-4 py-2.5"
          style="--hud-accent: var(--primary)"
        >
          <LoaderCircleIcon class="size-4 shrink-0 text-primary motion-safe:animate-spin" />
          <p class="neon-text font-heading text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Saving<span class="animate-pulse">...</span>
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="!name.trim() || saving">
            Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
