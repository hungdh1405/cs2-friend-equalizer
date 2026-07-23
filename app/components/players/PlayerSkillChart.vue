<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '#shared/types'
import { tagGlowBarClass } from '@/lib/tag-colors'
import { cn } from '@/lib/utils'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

const props = defineProps<{ player: Player }>()
const { tagById } = useTags()

const rows = computed(() => Object.entries(props.player.tagLevels)
  .map(([tagId, level]) => ({ tagId, level, tag: tagById(tagId) }))
  .filter((row): row is { tagId: string, level: number, tag: NonNullable<ReturnType<typeof tagById>> } => Boolean(row.tag))
  .sort((a, b) => b.level - a.level))
</script>

<template>
  <div v-if="rows.length" class="flex flex-col gap-2.5">
    <div v-for="row in rows" :key="row.tagId" class="flex items-center gap-2">
      <DynamicIcon :name="row.tag.icon" class="size-4 shrink-0 text-muted-foreground" />
      <span class="w-36 shrink-0 truncate font-mono text-xs">{{ row.tag.label }}</span>
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          :class="cn('h-full rounded-full', tagGlowBarClass(row.tag.kind, row.level))"
          :style="{ width: `${row.level * 20}%` }"
        />
      </div>
      <span class="w-3 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{{ row.level }}</span>
    </div>
  </div>
  <Empty v-else>
    <EmptyHeader>
      <EmptyTitle>No tags yet</EmptyTitle>
      <EmptyDescription>Add tags from the edit dialog to build a skill profile.</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
