<script setup lang="ts">
import type { Player } from '#shared/types'
import { shallowRef } from 'vue'
import { GripVerticalIcon, LockIcon, LockOpenIcon, ShieldIcon, Undo2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getTier } from '@/lib/tier'
import { readDraggedPlayer, writeDraggedPlayer } from '@/lib/team-drag'
import { cn } from '@/lib/utils'

const props = defineProps<{
  name: string
  players: Player[]
  score: number
  lockedIds: string[]
  accent: string
  slotIndex: number
}>()

const emit = defineEmits<{
  'update:name': [string]
  'assign': [string, number]
  'toggle-lock': [string]
  'unassign': [string]
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
  emit('assign', playerId, props.slotIndex)
}
</script>

<template>
  <Card class="team-panel hud-frame gap-3 border-border/60 bg-card/70" :style="{ '--hud-accent': accent }">
    <CardHeader class="flex-row items-center justify-between gap-2 space-y-0 border-b border-border/60 pb-3">
      <div class="flex min-w-0 items-center gap-1.5">
        <ShieldIcon class="size-4 shrink-0" :style="{ color: accent }" />
        <Input
          :model-value="name"
          class="h-8 w-28 font-heading font-semibold tracking-wide uppercase"
          @update:model-value="emit('update:name', String($event))"
        />
      </div>
      <span class="neon-text font-heading text-lg font-bold tabular-nums" :style="{ color: accent }">{{ score }}</span>
    </CardHeader>
    <CardContent
      :class="cn('team-drop-zone flex min-h-20 flex-col gap-1.5', isDragOver && 'is-drag-over')"
      :data-team-slot="slotIndex"
      @dragenter.prevent="isDragOver = true"
      @dragover.prevent="isDragOver = true"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div
        v-for="player in players"
        :id="`player-row-${player.id}`"
        :key="player.id"
        :class="cn('team-player-row flex cursor-grab items-center gap-2 rounded-md border border-border/60 bg-background/40 p-1.5 text-sm active:cursor-grabbing', getTier(player.score).cardBorderClass)"
        draggable="true"
        @dragstart="handleDragStart($event, player.id)"
      >
        <GripVerticalIcon class="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate">{{ player.name }}</span>
        <span class="text-xs tabular-nums text-muted-foreground">{{ player.score }}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          :aria-label="lockedIds.includes(player.id) ? `Allow ${player.name} to move during balance` : `Keep ${player.name} fixed on ${name}`"
          :aria-pressed="lockedIds.includes(player.id)"
          @click="emit('toggle-lock', player.id)"
        >
          <component :is="lockedIds.includes(player.id) ? LockIcon : LockOpenIcon" />
        </Button>
        <Button variant="ghost" size="icon-xs" :aria-label="`Move ${player.name} to waiting`" @click="emit('unassign', player.id)">
          <Undo2Icon />
        </Button>
      </div>
      <p v-if="!players.length" class="text-xs text-muted-foreground">No players yet.</p>
    </CardContent>
  </Card>
</template>

<style scoped>
.team-drop-zone {
  border-radius: var(--radius-lg);
  transition: background-color 160ms ease-out, box-shadow 160ms ease-out;
}

.team-drop-zone.is-drag-over {
  background: color-mix(in oklch, var(--hud-accent) 9%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--hud-accent) 56%, transparent), 0 0 20px color-mix(in oklch, var(--hud-accent) 9%, transparent);
}

.team-player-row {
  transition: border-color 160ms ease-out, background-color 160ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .team-drop-zone,
  .team-player-row {
    transition: none;
  }
}
</style>
