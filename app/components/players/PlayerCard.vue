<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '#shared/types'
import { ROLES } from '#shared/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'
import PlayerTierMark from './PlayerTierMark.vue'

const props = withDefaults(defineProps<{
  player: Player
  interactive?: boolean
  showAction?: boolean
  variant?: 'default' | 'compact'
}>(), {
  interactive: true,
  showAction: true,
  variant: 'default'
})
const emit = defineEmits<{ view: [Player] }>()

const initials = computed(() => props.player.name.trim().slice(0, 2).toUpperCase() || '?')
const roleLabel = computed(() => ROLES.find(role => role.value === props.player.role)?.label ?? props.player.role)
const tier = computed(() => getTier(props.player.score))

const cardClasses = computed(() => cn(
  'player-card carbon-fiber hud-frame-right hud-frame-right-sm border-border/60 bg-card/80',
  props.variant === 'default' && 'h-full',
  props.interactive && 'hover-lift cursor-pointer',
  props.variant === 'compact' && 'player-card-compact',
  tier.value.cardBorderClass,
  tier.value.glowClass
))

function handleView() {
  if (props.interactive) emit('view', props.player)
}
</script>

<template>
  <Card
    size="sm"
    :class="cardClasses"
    :style="{ '--hud-accent': tier.colorVar }"
    @click="handleView"
  >
    <CardHeader :class="cn('player-card-header flex-row items-start gap-3 space-y-0', variant === 'compact' && 'gap-2')">
      <Avatar :class="cn('player-card-avatar size-12 shrink-0 ring-1 ring-border', variant === 'compact' && 'size-9')">
        <AvatarImage :src="player.hasPhoto ? `/api/players/${player.id}/photo` : '/default-avatar.png'" alt="" />
        <AvatarFallback>{{ initials }}</AvatarFallback>
      </Avatar>
      <div class="min-w-0 flex-1">
        <CardTitle :class="cn('name-underline player-card-name w-fit truncate font-heading text-base tracking-wide', variant === 'compact' && 'text-sm')">
          <NuxtLink v-if="interactive" :to="`/players/${player.id}`" class="player-name-text hover:underline" @click.stop>
            {{ player.name }}
          </NuxtLink>
          <span v-else class="player-name-text">{{ player.name }}</span>
        </CardTitle>
        <p :class="cn('player-card-role role-capsule mt-1.5 text-xs text-muted-foreground uppercase', variant === 'compact' && 'mt-1 text-[10px]')">
          <span class="inline-block size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: tier.colorVar, boxShadow: `0 0 4px ${tier.colorVar}` }" />
          {{ roleLabel }}
        </p>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1">
        <PlayerTierMark
          :score="player.score"
          :size="variant === 'compact' ? 'compact' : 'default'"
          class="player-card-tier"
        />
        <div :class="cn('player-card-score score-module flex flex-col items-end px-2 py-1', variant === 'compact' && 'px-1.5 py-0.5')">
          <span class="font-mono text-[9px] tracking-widest text-muted-foreground">SCORE</span>
          <div :class="cn('font-heading text-lg leading-none font-bold tabular-nums', variant === 'compact' && 'text-sm')">{{ player.score }}</div>
        </div>
      </div>
    </CardHeader>

    <div v-if="variant === 'default'" class="-mt-2 h-1 w-full overflow-hidden rounded-full bg-muted px-4">
      <div
        :class="cn('h-full rounded-full', tier.badgeClass)"
        :style="{ width: `${Math.min(100, player.score)}%` }"
      />
    </div>

    <div
      v-if="showAction && variant === 'default'"
      class="neon-text flex items-center justify-center px-4 pt-1.5 text-[10px] font-medium tracking-wide uppercase"
      :style="{ color: tier.colorVar }"
    >
      View details
    </div>
  </Card>
</template>

<style scoped>
.player-card-compact :deep(.player-card-header) {
  display: flex;
  align-items: center;
  padding: 0.65rem 0.7rem;
}

.player-card-compact {
  height: auto;
  min-height: 0;
}

@media (max-width: 639px) {
  .player-card-compact :deep(.player-card-header) {
    align-items: center;
    padding: 0.55rem 0.5rem;
  }

  .player-card-compact .player-card-avatar {
    width: 2rem;
    height: 2rem;
  }

  .player-card-compact .player-card-role,
  .player-card-compact .player-card-score {
    display: none;
  }

  .player-card-compact .player-card-tier {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 0.8rem;
  }

  .player-card-compact .player-card-name {
    max-width: 100%;
    font-size: 0.72rem;
  }
}
</style>
