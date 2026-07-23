<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const props = defineProps<{
  selectedCount: number
  teamScores: number[]
  tolerance: number
}>()

const totalScore = computed(() => props.teamScores.reduce((a, b) => a + b, 0))
const target = computed(() => props.teamScores.length ? totalScore.value / props.teamScores.length : 0)
const diff = computed(() => props.teamScores.length ? Math.max(...props.teamScores) - Math.min(...props.teamScores) : 0)

const rating = computed(() => {
  if (!props.teamScores.length || totalScore.value === 0) return { text: 'Not enough data', tone: 'muted' }
  if (diff.value <= 3) return { text: 'Very balanced', tone: 'good' }
  if (diff.value <= props.tolerance) return { text: 'Acceptable', tone: 'warn' }
  return { text: 'Off balance', tone: 'bad' }
})
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <Card class="border-border/60 bg-card/70">
      <CardContent class="p-3">
        <p class="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Selected</p>
        <p class="neon-text font-heading text-xl font-bold text-primary tabular-nums">{{ selectedCount }}</p>
      </CardContent>
    </Card>
    <Card class="border-border/60 bg-card/70">
      <CardContent class="p-3">
        <p class="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Target / team</p>
        <p class="neon-text font-heading text-xl font-bold text-primary tabular-nums">{{ target.toFixed(1) }}</p>
      </CardContent>
    </Card>
    <Card class="border-border/60 bg-card/70">
      <CardContent class="p-3">
        <p class="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Spread</p>
        <p class="neon-text font-heading text-xl font-bold text-primary tabular-nums">{{ diff }}</p>
      </CardContent>
    </Card>
    <Card class="border-border/60 bg-card/70">
      <CardContent class="p-3">
        <p class="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Balance</p>
        <p class="flex items-center gap-1.5 text-sm font-semibold">
          <span
            :class="cn('size-2 shrink-0 rounded-full', {
              'bg-tag-positive-5 shadow-[0_0_6px_var(--tag-positive-5)]': rating.tone === 'good',
              'bg-destructive shadow-[0_0_6px_var(--destructive)]': rating.tone === 'bad',
              'bg-tag-warning-4 shadow-[0_0_6px_var(--tag-warning-4)]': rating.tone === 'warn',
              'bg-muted-foreground': rating.tone === 'muted'
            })"
          />
          <span :class="{
            'text-primary': rating.tone === 'good',
            'text-destructive': rating.tone === 'bad',
            'text-muted-foreground': rating.tone === 'muted' || rating.tone === 'warn'
          }">{{ rating.text }}</span>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
