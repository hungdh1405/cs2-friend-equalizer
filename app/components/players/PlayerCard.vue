<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '#shared/types'
import { ROLES } from '#shared/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'
import TagBadge from './TagBadge.vue'

const props = defineProps<{ player: Player }>()
const emit = defineEmits<{ edit: [Player], delete: [Player] }>()

const { tagById } = useTags()
const isUnlocked = useIsCrudUnlocked()

const initials = computed(() => props.player.name.trim().slice(0, 2).toUpperCase() || '?')
const roleLabel = computed(() => ROLES.find(role => role.value === props.player.role)?.label ?? props.player.role)
const tagIds = computed(() => Object.keys(props.player.tagLevels))
const tier = computed(() => getTier(props.player.score))

function tagPropsFor(tagId: string) {
  const tag = tagById(tagId)
  return {
    label: tag?.label ?? tagId,
    icon: tag?.icon ?? 'Tag',
    kind: tag?.kind ?? 'neutral' as const,
    level: props.player.tagLevels[tagId] ?? 3
  }
}
</script>

<template>
  <Card
    :class="cn('player-card hud-frame-right carbon-fiber hover-lift gap-3 border-border/60 bg-card/80 py-4', tier.cardBorderClass, tier.glowClass)"
    :style="{ '--hud-accent': tier.colorVar }"
  >
    <div class="scanlines-diagonal" />
    <div class="holo-sheen" />
    <div class="holo-grid pointer-events-none absolute inset-0 opacity-60" />
    <div class="spark-particles">
      <span /><span /><span />
    </div>

    <CardHeader class="flex-row items-start gap-3 space-y-0">
      <div class="avatar-halo shrink-0">
        <Avatar class="avatar-aura avatar-tilt size-12 ring-1 ring-border">
          <AvatarImage :src="player.hasPhoto ? `/api/players/${player.id}/photo` : '/default-avatar.png'" alt="" />
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
      </div>
      <div class="min-w-0 flex-1">
        <CardTitle class="name-underline w-fit truncate font-heading text-base tracking-wide">
          <NuxtLink :to="`/players/${player.id}`" class="hover:underline">
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
          :class="cn('tier-pulse tier-badge-3d flex size-10 shrink-0 items-center justify-center font-heading text-xl font-black', tier.badgeClass, tier.badgeGlowClass)"
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

    <CardContent>
      <div class="tag-panel carbon-fiber flex flex-wrap gap-1 bg-background/30 p-2">
        <TagBadge v-for="tagId in tagIds" :key="tagId" v-bind="tagPropsFor(tagId)" />
      </div>
    </CardContent>

    <CardFooter v-if="isUnlocked" class="justify-end gap-2">
      <Button variant="outline" size="sm" class="btn-neon" @click="emit('edit', player)">
        Edit
      </Button>
      <Button variant="ghost" size="sm" class="btn-neon text-destructive" @click="emit('delete', player)">
        Delete
      </Button>
    </CardFooter>
  </Card>
</template>
