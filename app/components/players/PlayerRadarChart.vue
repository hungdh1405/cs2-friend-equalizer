<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '#shared/types'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

const props = defineProps<{ player: Player }>()
const { tagById } = useTags()

const SIZE = 240
const CENTER = SIZE / 2
const MAX_RADIUS = SIZE / 2 - 34
const RINGS = [0.25, 0.5, 0.75, 1]

const axes = computed(() => Object.entries(props.player.tagLevels)
  .map(([tagId, level]) => ({ tagId, level, tag: tagById(tagId) }))
  .filter((row): row is { tagId: string, level: number, tag: NonNullable<ReturnType<typeof tagById>> } => Boolean(row.tag))
  .sort((a, b) => a.tagId.localeCompare(b.tagId)))

function pointFor(index: number, total: number, fraction: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return {
    x: CENTER + Math.cos(angle) * MAX_RADIUS * fraction,
    y: CENTER + Math.sin(angle) * MAX_RADIUS * fraction
  }
}

const polygonPoints = computed(() => axes.value
  .map((axis, i) => pointFor(i, axes.value.length, axis.level / 5))
  .map(p => `${p.x},${p.y}`)
  .join(' '))

function labelPoint(index: number, total: number) {
  const p = pointFor(index, total, 1.22)
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const cos = Math.cos(angle)
  const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle'
  return { ...p, anchor }
}
</script>

<template>
  <div v-if="axes.length >= 3" class="flex justify-center">
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="h-64 w-64 overflow-visible">
      <circle
        v-for="ring in RINGS"
        :key="ring"
        :cx="CENTER"
        :cy="CENTER"
        :r="MAX_RADIUS * ring"
        fill="none"
        stroke="var(--border)"
        stroke-width="1"
      />
      <line
        v-for="(axis, i) in axes"
        :key="`axis-${axis.tagId}`"
        :x1="CENTER"
        :y1="CENTER"
        :x2="pointFor(i, axes.length, 1).x"
        :y2="pointFor(i, axes.length, 1).y"
        stroke="var(--border)"
        stroke-width="1"
      />
      <polygon
        :points="polygonPoints"
        fill="var(--primary)"
        fill-opacity="0.18"
        stroke="var(--primary)"
        stroke-width="2"
        style="filter: drop-shadow(0 0 6px var(--primary))"
      />
      <circle
        v-for="(axis, i) in axes"
        :key="`dot-${axis.tagId}`"
        :cx="pointFor(i, axes.length, axis.level / 5).x"
        :cy="pointFor(i, axes.length, axis.level / 5).y"
        r="3"
        fill="var(--primary)"
        style="filter: drop-shadow(0 0 4px var(--primary))"
      />
      <text
        v-for="(axis, i) in axes"
        :key="`label-${axis.tagId}`"
        :x="labelPoint(i, axes.length).x"
        :y="labelPoint(i, axes.length).y"
        :text-anchor="labelPoint(i, axes.length).anchor"
        dominant-baseline="middle"
        class="fill-muted-foreground font-mono"
        font-size="9"
      >
        {{ axis.tag.label.length > 12 ? `${axis.tag.label.slice(0, 11)}…` : axis.tag.label }}
      </text>
    </svg>
  </div>
  <Empty v-else>
    <EmptyHeader>
      <EmptyTitle>Not enough attributes yet</EmptyTitle>
      <EmptyDescription>The radar needs at least 3 tags to plot — add more from the edit dialog.</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
