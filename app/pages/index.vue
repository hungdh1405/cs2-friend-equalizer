<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Player } from '#shared/types'
import {
  ArrowDownWideNarrowIcon, ArrowUpNarrowWideIcon, DownloadIcon, GalleryHorizontalIcon,
  LayoutGridIcon, LockOpenIcon, PlusIcon, SearchIcon
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { CrudCancelledError } from '@/composables/useCrudGate'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import PlayerCard from '@/components/players/PlayerCard.vue'
import PlayerDetailDialog from '@/components/players/PlayerDetailDialog.vue'
import PlayerEditDialog from '@/components/players/PlayerEditDialog.vue'
import PlayerSlider from '@/components/players/PlayerSlider.vue'

const { players, pending, deletePlayer } = usePlayers()
const isUnlocked = useIsCrudUnlocked()

// Used by exportJson() only — always the full, unfiltered roster, so exporting never
// silently drops players just because a search filter happens to be active on screen.
const sortedPlayers = computed(() => [...players.value].sort((a, b) => b.score - a.score))

const searchQuery = ref('')
const sortDirection = ref<'desc' | 'asc'>('desc')

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

const VIEW_MODE_STORAGE_KEY = 'cs2-roster-view'
const viewMode = ref<'grid' | 'slider'>('grid')

onMounted(() => {
  const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  if (stored === 'grid' || stored === 'slider') viewMode.value = stored
})

watch(viewMode, (mode) => {
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
})

const rosterPlayers = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase()
  const filtered = needle ? players.value.filter(player => player.name.toLowerCase().includes(needle)) : players.value
  return [...filtered].sort((a, b) => (sortDirection.value === 'desc' ? b.score - a.score : a.score - b.score))
})

const editDialogOpen = ref(false)
const editingPlayer = ref<Player | null>(null)
const deletingPlayer = ref<Player | null>(null)
const gridEl = ref<HTMLElement | null>(null)

// Full details (all tags, edit/delete) now live in a popup instead of an in-grid "spotlight"
// expansion. The previous spotlight approach (in-place expand, dimmed siblings, GSAP Flip)
// went through several rounds of fixes and was still reported as laggy/flickery on real
// mobile hardware (Samsung S24 Ultra, iPhone 16 Pro) even after every automated check came
// back clean — flagship devices struggling pointed at real, structural cost rather than
// device weakness: expanding a card reflowed the whole 2-column grid (col-span change) and
// toggled a `dimmed` class across every sibling simultaneously. A popup sidesteps all of
// that — the grid never reflows on click, no sibling ever changes state, and the detail
// view (with its full premium effects — see PlayerDetailDialog.vue) only ever has a single
// instance mounted at a time instead of that same effect set running continuously across
// the whole roster. See DESIGN.md decisions log for the full reasoning.
const detailPlayer = ref<Player | null>(null)
const detailOpen = ref(false)

function openDetail(player: Player) {
  detailPlayer.value = player
  detailOpen.value = true
}

// Cards fade/slide in as they scroll into view (batched so a whole row reveals together
// rather than each card independently), and each one's name plays a brief scramble-to-reveal
// (https://demos.gsap.com/demo/text-scrambling/) as it settles in.
onMounted(() => {
  if (prefersReducedMotion() || !gridEl.value) return
  const { gsap, ScrollTrigger } = useGSAP()

  ScrollTrigger.batch('.player-card', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { autoAlpha: 0, y: 20 }, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.06,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: true,
        clearProps: 'transform,opacity,visibility'
      })
      // Failsafe mirroring the pattern that fixed an earlier stuck-opacity bug: force this
      // batch back to plain, fully-visible CSS shortly after its own tween should be done,
      // regardless of whether the tween's own completion/clearProps ever actually fires.
      gsap.delayedCall(batch.length * 0.06 + 0.45 + 0.5, () => gsap.set(batch, { clearProps: 'transform,opacity,visibility' }))

      batch.forEach((card, i) => {
        const nameEl = card.querySelector('.player-name-text')
        const finalText = nameEl?.textContent?.trim()
        if (!nameEl || !finalText) return
        gsap.to(nameEl, {
          duration: 1.4,
          delay: i * 0.06,
          scrambleText: { text: finalText, chars: 'upperAndLowerCase', revealDelay: 0.3, speed: 0.25 }
        })
      })
    }
  })
})

function openCreate() {
  editingPlayer.value = null
  editDialogOpen.value = true
}

function openEdit(player: Player) {
  detailOpen.value = false
  editingPlayer.value = player
  editDialogOpen.value = true
}

// Not a ref: AlertDialogAction's click both fires this component's @click handler AND closes
// the dialog (which nulls `deletingPlayer` via @update:open) in the same synchronous event —
// by the time performDelete's body ran, `deletingPlayer.value` was already back to null. A
// plain variable outside the open/close reactivity isn't touched by that close handler.
let deleteTarget: Player | null = null

function confirmDelete(player: Player) {
  detailOpen.value = false
  deleteTarget = player
  deletingPlayer.value = player
}

async function performDelete() {
  if (!deleteTarget) return
  const name = deleteTarget.name
  const id = deleteTarget.id
  try {
    await deletePlayer(id)
    deletingPlayer.value = null
    if (detailPlayer.value?.id === id) detailPlayer.value = null
    toast.success(`${name} removed from the roster.`)
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) throw error
  }
}

function exportJson() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    players: sortedPlayers.value
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cs2-roster-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Exported roster.')
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
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="font-heading text-xl font-semibold tracking-wide">Roster</h1>
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" @click="exportJson">
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
        <template v-if="isUnlocked">
          <Button size="sm" @click="openCreate">
            <PlusIcon data-icon="inline-start" />
            Add player
          </Button>
        </template>
        <Button v-else variant="outline" size="sm" @click="unlockEditing">
          <LockOpenIcon data-icon="inline-start" />
          Unlock to edit
        </Button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <InputGroup class="search-glow h-9 w-full max-w-xs rounded-lg">
        <InputGroupInput v-model="searchQuery" placeholder="Search players…" />
        <InputGroupAddon>
          <SearchIcon class="size-4 shrink-0 opacity-60" />
        </InputGroupAddon>
      </InputGroup>

      <Button
        variant="outline"
        size="sm"
        class="sort-toggle-btn btn-neon shrink-0"
        :aria-label="sortDirection === 'desc' ? 'Sorted score high to low — click for low to high' : 'Sorted score low to high — click for high to low'"
        @click="toggleSortDirection"
      >
        <ArrowDownWideNarrowIcon v-if="sortDirection === 'desc'" data-icon="inline-start" />
        <ArrowUpNarrowWideIcon v-else data-icon="inline-start" />
        Score
      </Button>

      <div class="ml-auto flex items-center gap-0.5 rounded-lg border border-border p-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          :class="viewMode === 'grid' ? 'sort-toggle-btn btn-neon' : ''"
          aria-label="Grid view"
          :aria-pressed="viewMode === 'grid'"
          @click="viewMode = 'grid'"
        >
          <LayoutGridIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="viewMode === 'slider' ? 'sort-toggle-btn btn-neon' : ''"
          aria-label="Slider view"
          :aria-pressed="viewMode === 'slider'"
          @click="viewMode = 'slider'"
        >
          <GalleryHorizontalIcon />
        </Button>
      </div>
    </div>

    <div v-if="pending && !players.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <Skeleton v-for="i in 6" :key="i" class="h-40 w-full" />
    </div>

    <Empty v-else-if="!players.length">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PlusIcon />
        </EmptyMedia>
        <EmptyTitle>No players yet</EmptyTitle>
        <EmptyDescription>Add your first player to start building the roster.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent v-if="isUnlocked">
        <Button size="sm" @click="openCreate">Add player</Button>
      </EmptyContent>
    </Empty>

    <Empty v-else-if="!rosterPlayers.length">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No matches</EmptyTitle>
        <EmptyDescription>No player names match "{{ searchQuery }}".</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <div v-else-if="viewMode === 'grid'" ref="gridEl" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <PlayerCard
        v-for="player in rosterPlayers"
        :key="player.id"
        :player="player"
        @view="openDetail"
      />
    </div>

    <PlayerSlider v-else :players="rosterPlayers" @view="openDetail" />

    <PlayerDetailDialog
      v-model:open="detailOpen"
      :player="detailPlayer"
      @edit="openEdit"
      @delete="confirmDelete"
    />

    <PlayerEditDialog v-model:open="editDialogOpen" :player="editingPlayer" />

    <AlertDialog :open="Boolean(deletingPlayer)" @update:open="(value) => { if (!value) deletingPlayer = null }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {{ deletingPlayer?.name }}?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes their profile, tags, and photo. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="performDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
