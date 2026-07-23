<script setup lang="ts">
import type { Player } from '#shared/types'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'

defineProps<{ players: Player[], teamNames: string[] }>()
const emit = defineEmits<{ assign: [string, number] }>()
</script>

<template>
  <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3" data-team-slot="waiting">
    <div
      v-for="player in players"
      :id="`player-row-${player.id}`"
      :key="player.id"
      :class="cn('flex items-center gap-2 rounded-md border border-dashed border-border/70 bg-card/40 p-1.5 text-sm', getTier(player.score).cardBorderClass)"
    >
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
