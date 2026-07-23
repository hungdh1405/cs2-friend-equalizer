<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { LockIcon, LockOpenIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const { expiresAt } = useCrudGateState()
const now = ref(Date.now())
let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  interval = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(interval))

const isUnlocked = computed(() => typeof expiresAt.value === 'number' && expiresAt.value > now.value)
const remainingLabel = computed(() => {
  if (!isUnlocked.value || !expiresAt.value) return null
  const ms = expiresAt.value - now.value
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

async function toggle() {
  if (isUnlocked.value) {
    await lockCrud()
  } else {
    await requireCrudToken()
  }
}
</script>

<template>
  <Button
    variant="outline"
    size="sm"
    :class="cn(
      'gap-1.5 font-mono text-xs tracking-wide',
      isUnlocked ? 'border-primary/50 text-primary shadow-[0_0_10px_-4px_var(--primary)]' : 'text-muted-foreground'
    )"
    :title="isUnlocked ? 'Click to lock now' : 'Click to unlock editing'"
    @click="toggle"
  >
    <component :is="isUnlocked ? LockOpenIcon : LockIcon" data-icon="inline-start" />
    <span v-if="isUnlocked" class="hidden sm:inline">UNLOCKED {{ remainingLabel }}</span>
    <span v-if="isUnlocked" class="sm:hidden">{{ remainingLabel }}</span>
    <span v-else class="hidden sm:inline">LOCKED</span>
  </Button>
</template>
