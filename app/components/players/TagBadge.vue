<script setup lang="ts">
import { computed } from 'vue'
import type { TagKind } from '#shared/types'
import { tagChipClass } from '@/lib/tag-colors'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  label: string
  icon: string
  kind: TagKind
  level?: number
  class?: string
}>(), { level: 3 })

const chipClass = computed(() => tagChipClass(props.kind, props.level))
</script>

<template>
  <span :class="cn('tag-chip inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', chipClass, props.class)">
    <DynamicIcon :name="icon" class="size-3" />
    {{ label }}
  </span>
</template>
