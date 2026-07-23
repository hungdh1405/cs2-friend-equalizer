<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type { Player } from '#shared/types'
import { DownloadIcon, LockOpenIcon, PlusIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { CrudCancelledError } from '@/composables/useCrudGate'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import PlayerCard from '@/components/players/PlayerCard.vue'
import PlayerEditDialog from '@/components/players/PlayerEditDialog.vue'

const { players, pending, deletePlayer } = usePlayers()
const isUnlocked = useIsCrudUnlocked()

const sortedPlayers = computed(() => [...players.value].sort((a, b) => b.score - a.score))

const editDialogOpen = ref(false)
const editingPlayer = ref<Player | null>(null)
const deletingPlayer = ref<Player | null>(null)
const gridEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (prefersReducedMotion()) return
  await nextTick()
  if (!gridEl.value) return
  const { gsap } = useGSAP()
  gsap.context(() => {
    gsap.from('.player-card', { autoAlpha: 0, y: 16, stagger: 0.04, duration: 0.4, ease: 'power2.out' })
  }, gridEl.value)
})

function openCreate() {
  editingPlayer.value = null
  editDialogOpen.value = true
}

function openEdit(player: Player) {
  editingPlayer.value = player
  editDialogOpen.value = true
}

// Not a ref: AlertDialogAction's click both fires this component's @click handler AND closes
// the dialog (which nulls `deletingPlayer` via @update:open) in the same synchronous event —
// by the time performDelete's body ran, `deletingPlayer.value` was already back to null. A
// plain variable outside the open/close reactivity isn't touched by that close handler.
let deleteTarget: Player | null = null

function confirmDelete(player: Player) {
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

    <div v-if="pending && !players.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

    <div v-else ref="gridEl" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <PlayerCard
        v-for="player in sortedPlayers"
        :key="player.id"
        :player="player"
        @edit="openEdit"
        @delete="confirmDelete"
      />
    </div>

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
