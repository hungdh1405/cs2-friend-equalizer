<script setup lang="ts">
import { computed } from 'vue'
import type { ChangeLogEntry } from '#shared/types'
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent, componentToString } from '@/components/ui/chart'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

const props = defineProps<{ entries: ChangeLogEntry[], currentScore: number }>()

interface Point {
  date: Date
  score: number
}

const data = computed<Point[]>(() => {
  const scoreEntries = props.entries
    .filter(entry => entry.field === 'score')
    .slice()
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  const points = scoreEntries.map(entry => ({ date: new Date(entry.at), score: Number(entry.to) }))
  points.push({ date: new Date(), score: props.currentScore })
  return points
})

const chartConfig = {
  score: { label: 'Score', color: 'var(--chart-1)' }
} satisfies ChartConfig

const xAccessor = (d: Point) => d.date
const yAccessor = (d: Point) => d.score
</script>

<template>
  <ChartContainer v-if="data.length > 1" :config="chartConfig" class="h-56 w-full">
    <VisXYContainer :data="data">
      <VisArea :x="xAccessor" :y="yAccessor" color="var(--chart-1)" :opacity="0.15" />
      <VisLine :x="xAccessor" :y="yAccessor" color="var(--chart-1)" />
      <VisAxis type="x" :x="xAccessor" />
      <VisAxis type="y" />
      <ChartTooltip />
      <ChartCrosshair :template="componentToString(chartConfig, ChartTooltipContent)" />
    </VisXYContainer>
  </ChartContainer>
  <Empty v-else>
    <EmptyHeader>
      <EmptyTitle>Not enough history yet</EmptyTitle>
      <EmptyDescription>Score changes will show up here as a trend line.</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
