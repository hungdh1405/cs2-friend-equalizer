<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { EventVoter } from '#shared/types'
import { LoaderCircleIcon, ShieldIcon, SwordsIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CrudCancelledError } from '@/composables/useCrudGate'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { cn } from '@/lib/utils'

const { currentEvent, saveManualTeams } = useEvent()
const isUnlocked = useIsCrudUnlocked()

function avatarUrl(voter: { discordUserId: string, avatar: string | null }) {
  return voter.avatar ? `https://cdn.discordapp.com/avatars/${voter.discordUserId}/${voter.avatar}.png` : undefined
}

// --- Local drag-and-drop state, seeded from the last-saved lineup ---
type Column = 'unassigned' | 'teamA' | 'teamB'
const unassigned = ref<EventVoter[]>([])
const teamA = ref<EventVoter[]>([])
const teamB = ref<EventVoter[]>([])

function syncFromEvent() {
  const voters = currentEvent.value?.voters ?? []
  const manual = currentEvent.value?.manualTeams
  const aIds = new Set(manual?.teamA ?? [])
  const bIds = new Set(manual?.teamB ?? [])
  teamA.value = voters.filter(voter => aIds.has(voter.discordUserId))
  teamB.value = voters.filter(voter => bIds.has(voter.discordUserId))
  unassigned.value = voters.filter(voter => !aIds.has(voter.discordUserId) && !bIds.has(voter.discordUserId))
}

// Only re-seeds on a genuinely different event or a fresh page load — not on every reactive
// tick — so a Host's in-progress drag arrangement never gets reset out from under them.
watch(() => currentEvent.value?.id, syncFromEvent, { immediate: true })

const hasVoters = computed(() => (currentEvent.value?.voters.length ?? 0) > 0)
const hasSavedLineup = computed(() => {
  const manual = currentEvent.value?.manualTeams
  return Boolean(manual && (manual.teamA.length > 0 || manual.teamB.length > 0))
})

function columnRef(column: Column) {
  return column === 'unassigned' ? unassigned : column === 'teamA' ? teamA : teamB
}

function onDragStart(dragEvent: DragEvent, voter: EventVoter) {
  dragEvent.dataTransfer?.setData('text/plain', voter.discordUserId)
}

function onDrop(dragEvent: DragEvent, target: Column) {
  const id = dragEvent.dataTransfer?.getData('text/plain')
  if (!id) return
  const from = (['unassigned', 'teamA', 'teamB'] as Column[]).find(col => columnRef(col).value.some(v => v.discordUserId === id))
  if (!from) return
  const fromRef = columnRef(from)
  const voter = fromRef.value.find(v => v.discordUserId === id)!
  if (from === target) return
  fromRef.value = fromRef.value.filter(v => v.discordUserId !== id)
  const targetRef = columnRef(target)
  targetRef.value = [...targetRef.value, voter]
  flashDrop(id)
}

// --- Small GSAP "slam into place" flourish on drop — cheap, one-shot, skipped under
// prefers-reduced-motion. Nothing ambient/continuous, matching this app's established
// restraint around motion cost (see DESIGN.md decisions log #59/#60).
async function flashDrop(discordUserId: string) {
  if (prefersReducedMotion()) return
  await nextTick()
  const el = document.querySelector(`[data-voter-chip="${discordUserId}"]`)
  if (!el) return
  const { gsap } = useGSAP()
  gsap.fromTo(el, { scale: 1.18, filter: 'brightness(1.6)' }, { scale: 1, filter: 'brightness(1)', duration: 0.35, ease: 'power2.out' })
}

// --- Save ---
const saving = ref(false)

async function handleSave() {
  if (saving.value) return
  saving.value = true
  try {
    await saveManualTeams(teamA.value.map(voter => voter.discordUserId), teamB.value.map(voter => voter.discordUserId))
    toast.success('Đã lưu đội hình và tuyên chiến trên Discord!')
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) toast.error('Có lỗi khi lưu đội hình.')
  } finally {
    saving.value = false
  }
}

const predictions = computed(() => currentEvent.value?.manualTeams?.predictions)
</script>

<template>
  <div
    v-if="hasSavedLineup || (isUnlocked && hasVoters)"
    lang="vi"
    class="relative overflow-hidden rounded-xl border border-red-700/50 bg-gradient-to-br from-[#1a0000] via-[#210004] to-[#0a0000] p-4"
    style="box-shadow: 0 0 24px -4px rgba(200,10,25,0.35), inset 0 0 30px rgba(80,0,10,0.35)"
  >
    <div class="flex items-center gap-2">
      <SwordsIcon class="size-4 text-red-500" />
      <h2 class="font-heading text-sm font-bold tracking-[0.15em] text-red-500 uppercase" style="text-shadow: 0 0 8px rgba(255,20,40,0.7)">
        Đội Hình Chiến Đấu
      </h2>
    </div>
    <!-- "How to use" instructions only make sense for whoever can actually act on them —
         a public/locked visitor can't drag anything, so showing it to them read a bit like
         unfinished UI rather than a deliberate design choice. -->
    <p v-if="isUnlocked" class="mt-1 text-xs text-red-200/70">
      Kéo thả chiến binh vào Đội A / Đội B, sau đó lưu để tuyên chiến trên Discord.
    </p>

    <div v-if="isUnlocked" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div
        class="min-h-24 rounded-lg border border-dashed border-red-800/50 bg-black/30 p-2"
        @dragover.prevent
        @drop="onDrop($event, 'unassigned')"
      >
        <p class="mb-2 text-[11px] font-semibold tracking-wide text-red-300/70 uppercase">Chưa chia đội</p>
        <div class="flex flex-wrap gap-1.5">
          <div
            v-for="voter in unassigned"
            :key="voter.discordUserId"
            :data-voter-chip="voter.discordUserId"
            draggable="true"
            class="flex cursor-grab items-center gap-1.5 rounded-md border border-red-900/60 bg-black/50 px-1.5 py-1 active:cursor-grabbing"
            @dragstart="onDragStart($event, voter)"
          >
            <Avatar class="size-5">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <span class="text-xs text-red-100">{{ voter.username }}</span>
          </div>
          <p v-if="!unassigned.length" class="text-xs text-red-300/40">Trống</p>
        </div>
      </div>

      <div
        class="min-h-24 rounded-lg border border-red-600/60 bg-red-950/20 p-2"
        style="box-shadow: inset 0 0 16px rgba(200,10,25,0.25)"
        @dragover.prevent
        @drop="onDrop($event, 'teamA')"
      >
        <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-red-400 uppercase">
          <ShieldIcon class="size-3" /> Đội A
        </p>
        <div class="flex flex-wrap gap-1.5">
          <div
            v-for="voter in teamA"
            :key="voter.discordUserId"
            :data-voter-chip="voter.discordUserId"
            draggable="true"
            class="flex cursor-grab items-center gap-1.5 rounded-md border border-red-500/60 bg-red-950/50 px-1.5 py-1 active:cursor-grabbing"
            @dragstart="onDragStart($event, voter)"
          >
            <Avatar class="size-5">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <span class="text-xs text-red-50">{{ voter.username }}</span>
          </div>
          <p v-if="!teamA.length" class="text-xs text-red-300/40">Kéo chiến binh vào đây</p>
        </div>
      </div>

      <div
        class="min-h-24 rounded-lg border border-orange-500/60 bg-orange-950/20 p-2"
        style="box-shadow: inset 0 0 16px rgba(249,115,22,0.2)"
        @dragover.prevent
        @drop="onDrop($event, 'teamB')"
      >
        <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-orange-400 uppercase">
          <ShieldIcon class="size-3" /> Đội B
        </p>
        <div class="flex flex-wrap gap-1.5">
          <div
            v-for="voter in teamB"
            :key="voter.discordUserId"
            :data-voter-chip="voter.discordUserId"
            draggable="true"
            class="flex cursor-grab items-center gap-1.5 rounded-md border border-orange-500/60 bg-orange-950/50 px-1.5 py-1 active:cursor-grabbing"
            @dragstart="onDragStart($event, voter)"
          >
            <Avatar class="size-5">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <span class="text-xs text-orange-50">{{ voter.username }}</span>
          </div>
          <p v-if="!teamB.length" class="text-xs text-orange-300/40">Kéo chiến binh vào đây</p>
        </div>
      </div>
    </div>

    <div v-else-if="hasSavedLineup" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-lg border border-red-600/60 bg-red-950/20 p-2">
        <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-red-400 uppercase">
          <ShieldIcon class="size-3" /> Đội A
        </p>
        <div class="flex flex-wrap gap-1.5">
          <div v-for="voter in teamA" :key="voter.discordUserId" class="flex items-center gap-1.5 rounded-md border border-red-500/60 bg-red-950/50 px-1.5 py-1">
            <Avatar class="size-5">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <span class="text-xs text-red-50">{{ voter.username }}</span>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-orange-500/60 bg-orange-950/20 p-2">
        <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-orange-400 uppercase">
          <ShieldIcon class="size-3" /> Đội B
        </p>
        <div class="flex flex-wrap gap-1.5">
          <div v-for="voter in teamB" :key="voter.discordUserId" class="flex items-center gap-1.5 rounded-md border border-orange-500/60 bg-orange-950/50 px-1.5 py-1">
            <Avatar class="size-5">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <span class="text-xs text-orange-50">{{ voter.username }}</span>
          </div>
        </div>
      </div>
    </div>

    <Button v-if="isUnlocked" class="mt-3 bg-red-700 text-white hover:bg-red-600" :disabled="saving" @click="handleSave">
      <LoaderCircleIcon v-if="saving" data-icon="inline-start" class="motion-safe:animate-spin" />
      <SwordsIcon v-else data-icon="inline-start" />
      Lưu Đội Hình &amp; Tuyên Chiến
    </Button>

    <div v-if="predictions && (predictions.teamA.length || predictions.teamB.length)" class="mt-4 border-t border-red-900/40 pt-3">
      <p class="mb-2 text-[11px] font-semibold tracking-wide text-purple-300/80 uppercase">🔮 Dự đoán đội thắng</p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p class="mb-1 text-xs text-red-300/70">Đội A ({{ predictions.teamA.length }})</p>
          <div class="flex flex-wrap gap-1.5">
            <Avatar v-for="voter in predictions.teamA" :key="voter.discordUserId" :title="voter.username" :class="cn('size-6 border', 'border-red-500/60')">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div>
          <p class="mb-1 text-xs text-orange-300/70">Đội B ({{ predictions.teamB.length }})</p>
          <div class="flex flex-wrap gap-1.5">
            <Avatar v-for="voter in predictions.teamB" :key="voter.discordUserId" :title="voter.username" :class="cn('size-6 border', 'border-orange-500/60')">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
