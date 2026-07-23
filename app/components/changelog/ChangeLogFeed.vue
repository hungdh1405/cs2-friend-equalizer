<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import type { ChangeLogEntry } from '#shared/types'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import ChangeLogEntryRow from './ChangeLogEntryRow.vue'

const props = defineProps<{ playerId?: string }>()

const { fetchLog } = useChangeLog()
const entries = ref<ChangeLogEntry[]>([])
const total = ref(0)
const loading = ref(true)
const limit = 30
const feedEl = ref<HTMLElement | null>(null)

async function load(offset = 0) {
  loading.value = true
  const hadEntries = entries.value.length > 0
  try {
    const result = await fetchLog({ playerId: props.playerId, limit, offset })
    entries.value = offset === 0 ? result.entries : [...entries.value, ...result.entries]
    total.value = result.total
  } finally {
    loading.value = false
  }

  if (offset === 0 && !hadEntries && entries.value.length && !prefersReducedMotion() && feedEl.value) {
    await nextTick()
    const { gsap } = useGSAP()
    gsap.context(() => {
      gsap.from('.changelog-row', { autoAlpha: 0, x: -12, stagger: 0.05, duration: 0.35, ease: 'power2.out' })
    }, feedEl.value)
  }
}

onMounted(() => load())
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-primary/30 bg-black/40 shadow-[0_0_24px_-8px_var(--primary)]">
    <div class="scanlines" />
    <div class="flex items-center gap-2 border-b border-primary/20 bg-black/30 px-3 py-2">
      <span class="size-2.5 rounded-full bg-destructive/80" />
      <span class="size-2.5 rounded-full bg-tag-warning-4/80" />
      <span class="size-2.5 rounded-full bg-tag-positive-5/80" />
      <span class="ml-2 font-mono text-[11px] text-muted-foreground">root@cs2-equalizer:~$ tail -f changelog.log</span>
    </div>
    <div ref="feedEl" class="flex flex-col gap-2 p-3">
      <div v-if="loading && !entries.length" class="flex flex-col gap-2">
        <Skeleton v-for="i in 4" :key="i" class="h-16 w-full" />
      </div>
      <Empty v-else-if="!entries.length">
        <EmptyHeader>
          <EmptyTitle>No changes yet</EmptyTitle>
          <EmptyDescription>Edits to player profiles will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <template v-else>
        <ChangeLogEntryRow v-for="entry in entries" :key="entry.id" :entry="entry" class="changelog-row" />
        <Button
          v-if="entries.length < total"
          variant="outline"
          size="sm"
          class="self-center font-mono text-xs"
          @click="load(entries.length)"
        >
          load_more --offset={{ entries.length }}
        </Button>
      </template>
    </div>
  </div>
</template>
