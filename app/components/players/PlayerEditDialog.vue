<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Player, Role, TagKind } from '#shared/types'
import { ROLES } from '#shared/types'
import { ChevronsUpDownIcon, LoaderCircleIcon, PlusIcon, XIcon } from '@lucide/vue'
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
import { VIETQR_BANKS } from '#shared/utils/vietqr'
import PlayerPhotoUpload from './PlayerPhotoUpload.vue'
import TagCreateInline from './TagCreateInline.vue'

const NO_BANK = '__none__'

const props = defineProps<{ open: boolean, player?: Player | null }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const { createPlayer, updatePlayer, uploadPhoto } = usePlayers()
const { tags, createTag } = useTags()

const name = ref('')
const score = ref(50)
const role = ref<Role>('rifler')
const tagLevels = ref<Record<string, number>>({})
const discordUserId = ref('')
const bankKey = ref(NO_BANK)
const bankAccountNumber = ref('')
const bankAccountName = ref('')
const bankPopoverOpen = ref(false)
const photoDataUrl = ref<string | undefined>()
const saving = ref(false)

function resetForm() {
  name.value = props.player?.name ?? ''
  score.value = props.player?.score ?? 50
  role.value = props.player?.role ?? 'rifler'
  tagLevels.value = { ...(props.player?.tagLevels ?? {}) }
  discordUserId.value = props.player?.discordUserId ?? ''
  bankKey.value = props.player?.bankAccount?.bankKey ?? NO_BANK
  bankAccountNumber.value = props.player?.bankAccount?.accountNumber ?? ''
  // Defaults to the player's own name — almost always correct for a bank account holder,
  // and still freely editable for the rare case it needs a different format (e.g. all-caps).
  bankAccountName.value = props.player?.bankAccount?.accountName ?? props.player?.name ?? ''
  photoDataUrl.value = undefined
}

watch(() => props.open, (isOpen) => {
  if (isOpen) resetForm()
})

const isEdit = computed(() => Boolean(props.player))
// null clears the bank link on save (matches the API's null-clears/omit-keeps convention) —
// a bank picked with no account number typed yet doesn't count as "set" either.
const bankAccountPayload = computed(() => {
  if (bankKey.value === NO_BANK || !bankAccountNumber.value.trim()) return null
  return {
    bankKey: bankKey.value,
    accountNumber: bankAccountNumber.value.trim(),
    accountName: bankAccountName.value.trim() || name.value.trim() || undefined
  }
})
const selectedBankLabel = computed(() => {
  if (bankKey.value === NO_BANK) return 'No bank linked'
  const bank = VIETQR_BANKS.find(b => b.key === bankKey.value)
  return bank ? `${bank.shortName} — ${bank.name}` : 'No bank linked'
})
function selectBank(key: string) {
  bankKey.value = key
  bankPopoverOpen.value = false
}
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
        discordUserId: discordUserId.value.trim(),
        bankAccount: bankAccountPayload.value
      })
      playerId = updated.id
      toast.success(`Updated ${updated.name}.`)
    } else {
      const created = await createPlayer({
        name: name.value.trim(),
        score: score.value,
        role: role.value,
        tagLevels: tagLevels.value,
        discordUserId: discordUserId.value.trim(),
        bankAccount: bankAccountPayload.value
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
          <FieldLegend variant="label">Bank account</FieldLegend>
          <FieldDescription>Optional — powers the team payout QR codes on /event.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel for="player-bank">Bank</FieldLabel>
              <Popover v-model:open="bankPopoverOpen">
                <PopoverTrigger as-child>
                  <Button id="player-bank" type="button" variant="outline" role="combobox" :aria-expanded="bankPopoverOpen" class="w-full justify-between font-normal">
                    <span class="truncate">{{ selectedBankLabel }}</span>
                    <ChevronsUpDownIcon class="shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[--radix-popover-trigger-width] min-w-72 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search bank…" />
                    <CommandList>
                      <CommandEmpty>No bank found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="No bank linked" @select="selectBank(NO_BANK)">No bank linked</CommandItem>
                        <CommandItem v-for="bank in VIETQR_BANKS" :key="bank.key" :value="`${bank.shortName} ${bank.name}`" @select="selectBank(bank.key)">
                          {{ bank.shortName }} — {{ bank.name }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
            <template v-if="bankKey !== NO_BANK">
              <Field>
                <FieldLabel for="player-bank-number">Account number</FieldLabel>
                <Input id="player-bank-number" v-model="bankAccountNumber" maxlength="30" placeholder="e.g. 0123456789" />
              </Field>
              <Field>
                <FieldLabel for="player-bank-name">Account holder name (optional)</FieldLabel>
                <Input id="player-bank-name" v-model="bankAccountName" maxlength="60" placeholder="e.g. NGUYEN VAN A" />
                <FieldDescription>Shown next to the QR so whoever's paying can confirm it's the right person.</FieldDescription>
              </Field>
            </template>
          </FieldGroup>
        </FieldSet>

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
