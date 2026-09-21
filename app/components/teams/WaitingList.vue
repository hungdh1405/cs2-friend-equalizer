<script setup lang="ts">
import type { Player } from '#shared/types'
import { shallowRef } from 'vue'
import { GripVerticalIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getTier } from '@/lib/tier'
import { readDraggedPlayer, writeDraggedPlayer } from '@/lib/team-drag'
import { cn } from '@/lib/utils'

const props = defineProps<{ players: Player[], teamNames: string[] }>()
const emit = defineEmits<{
  assign: [string, number]
  unassign: [string]
}>()

const isDragOver = shallowRef(false)

function handleDragStart(event: DragEvent, playerId: string) {
  writeDraggedPlayer(event, playerId)
}

function handleDragLeave(event: DragEvent) {
  const currentTarget = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && currentTarget.contains(event.relatedTarget)) return
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const playerId = readDraggedPlayer(event)
  if (!playerId || props.players.some(player => player.id === playerId)) return
  emit('unassign', playerId)
}
</script>

<template>
  <div
    :class="cn('waiting-drop-zone grid min-h-20 grid-cols-1 gap-1.5 rounded-lg sm:grid-cols-2 lg:grid-cols-3', isDragOver && 'is-drag-over')"
    data-team-slot="waiting"
    @dragenter.prevent="isDragOver = true"
    @dragover.prevent="isDragOver = true"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div
      v-for="player in players"
      :id="`player-row-${player.id}`"
      :key="player.id"
      :class="cn('waiting-player-row flex cursor-grab items-center gap-2 rounded-md border border-dashed border-border/70 bg-card/40 p-1.5 text-sm active:cursor-grabbing', getTier(player.score).cardBorderClass)"
      draggable="true"
      @dragstart="handleDragStart($event, player.id)"
    >
      <GripVerticalIcon class="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate">{{ player.name }}</span>
      <span class="text-xs tabular-nums text-muted-foreground">{{ player.score }}</span>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="xs">Assign</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              v-for="(name, index) in teamNames"
              :key="index"
              @click="emit('assign', player.id, index)"
            >
              {{ name }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <p v-if="!players.length" class="col-span-full text-xs text-muted-foreground">Nobody waiting.</p>
  </div>
</template>

<style scoped>
.waiting-drop-zone {
  transition: background-color 160ms ease-out, box-shadow 160ms ease-out;
}

.waiting-drop-zone.is-drag-over {
  background: color-mix(in oklch, var(--primary) 7%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--primary) 46%, transparent), 0 0 20px color-mix(in oklch, var(--primary) 8%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .waiting-drop-zone {
    transition: none;
  }
}
</style>
