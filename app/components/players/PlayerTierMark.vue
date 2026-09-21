<script setup lang="ts">
import { computed } from 'vue'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  score: number
  size?: 'default' | 'compact'
}>(), {
  size: 'default'
})

const tier = computed(() => getTier(props.score))
const markClasses = computed(() => cn(
  'player-tier-mark tier-badge-3d flex size-10 shrink-0 items-center justify-center font-heading text-xl font-black',
  props.size === 'compact' && 'size-8 text-base',
  tier.value.badgeClass,
  tier.value.badgeGlowClass
))
</script>

<template>
  <span
    :class="markClasses"
    :title="`Tier ${tier.key}`"
    :aria-label="`Tier ${tier.key}`"
  >
    {{ tier.key }}
  </span>
</template>
