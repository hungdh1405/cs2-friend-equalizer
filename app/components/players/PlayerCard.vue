<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '#shared/types'
import { ROLES } from '#shared/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'

const props = defineProps<{ player: Player }>()
const emit = defineEmits<{ view: [Player] }>()

const initials = computed(() => props.player.name.trim().slice(0, 2).toUpperCase() || '?')
const roleLabel = computed(() => ROLES.find(role => role.value === props.player.role)?.label ?? props.player.role)
const tier = computed(() => getTier(props.player.score))
</script>

<template>
  <Card
    size="sm"
    :class="cn(
      'player-card carbon-fiber hover-lift hud-frame-right hud-frame-right-sm h-full cursor-pointer border-border/60 bg-card/80',
      tier.cardBorderClass,
      tier.glowClass
    )"
    :style="{ '--hud-accent': tier.colorVar }"
    @click="emit('view', player)"
  >
    <CardHeader class="flex-row items-start gap-3 space-y-0">
      <Avatar class="size-12 shrink-0 ring-1 ring-border">
        <AvatarImage :src="player.hasPhoto ? `/api/players/${player.id}/photo` : '/default-avatar.png'" alt="" />
        <AvatarFallback>{{ initials }}</AvatarFallback>
      </Avatar>
      <div class="min-w-0 flex-1">
        <CardTitle class="name-underline w-fit truncate font-heading text-base tracking-wide">
          <NuxtLink :to="`/players/${player.id}`" class="player-name-text hover:underline" @click.stop>
            {{ player.name }}
          </NuxtLink>
        </CardTitle>
        <p class="role-capsule mt-1.5 text-xs text-muted-foreground uppercase">
          <span class="inline-block size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: tier.colorVar, boxShadow: `0 0 4px ${tier.colorVar}` }" />
          {{ roleLabel }}
        </p>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1">
        <div
          :class="cn('tier-badge-3d flex size-10 shrink-0 items-center justify-center font-heading text-xl font-black', tier.badgeClass, tier.badgeGlowClass)"
          :title="tier.label"
        >
          {{ tier.key }}
        </div>
        <div class="score-module flex flex-col items-end px-2 py-1">
          <span class="font-mono text-[9px] tracking-widest text-muted-foreground">SCORE</span>
          <div class="font-heading text-lg leading-none font-bold tabular-nums">{{ player.score }}</div>
        </div>
      </div>
    </CardHeader>

    <div class="-mt-2 h-1 w-full overflow-hidden rounded-full bg-muted px-4">
      <div
        :class="cn('h-full rounded-full', tier.badgeClass)"
        :style="{ width: `${Math.min(100, player.score)}%` }"
      />
    </div>

    <div
      class="neon-text flex items-center justify-center px-4 pt-1.5 text-[10px] font-medium tracking-wide uppercase"
      :style="{ color: tier.colorVar }"
    >
      View details
    </div>
  </Card>
</template>
