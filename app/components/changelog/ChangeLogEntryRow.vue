<script setup lang="ts">
import { computed } from 'vue'
import type { ChangeLogEntry } from '#shared/types'
import { cn } from '@/lib/utils'

const props = defineProps<{ entry: ChangeLogEntry }>()
const formattedAt = computed(() => new Date(props.entry.at).toLocaleString())

const FIELD_TONE: Record<string, string> = {
  score: 'text-tag-positive-5',
  tag: 'text-tag-neutral-5',
  role: 'text-primary',
  name: 'text-primary',
  photo: 'text-tag-neutral-5',
  created: 'text-tag-positive-5',
  deleted: 'text-destructive'
}

const tone = computed(() => FIELD_TONE[props.entry.field] ?? 'text-tag-neutral-5')
</script>

<template>
  <div class="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/40 p-3 font-mono text-xs">
    <p class="text-sm leading-relaxed text-foreground">
      <span :class="tone" class="mr-1.5">[{{ entry.field.toUpperCase() }}]</span>
      <span class="text-muted-foreground">&gt;</span>
      {{ entry.message }}
    </p>
    <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
      <span :class="cn('neon-text', tone)">{{ formattedAt }}</span>
      <span>·</span>
      <span>{{ entry.ip }}</span>
    </div>
  </div>
</template>
