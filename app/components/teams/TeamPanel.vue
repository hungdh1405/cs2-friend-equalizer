<script setup lang="ts">
import type { Player } from '#shared/types'
import { LockIcon, LockOpenIcon, ShieldIcon, Undo2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getTier } from '@/lib/tier'
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
  'toggle-lock': [string]
  'unassign': [string]
}>()
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
    <CardContent class="flex flex-col gap-1.5" :data-team-slot="slotIndex">
      <div
        v-for="player in players"
        :id="`player-row-${player.id}`"
        :key="player.id"
        :class="cn('flex items-center gap-2 rounded-md border border-border/60 bg-background/40 p-1.5 text-sm', getTier(player.score).cardBorderClass)"
      >
        <span class="min-w-0 flex-1 truncate">{{ player.name }}</span>
        <span class="text-xs tabular-nums text-muted-foreground">{{ player.score }}</span>
        <Button variant="ghost" size="icon-xs" @click="emit('toggle-lock', player.id)">
          <component :is="lockedIds.includes(player.id) ? LockIcon : LockOpenIcon" />
        </Button>
        <Button variant="ghost" size="icon-xs" @click="emit('unassign', player.id)">
          <Undo2Icon />
        </Button>
      </div>
      <p v-if="!players.length" class="text-xs text-muted-foreground">No players yet.</p>
    </CardContent>
  </Card>
</template>
