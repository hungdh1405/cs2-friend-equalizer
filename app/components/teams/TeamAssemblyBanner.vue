<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { RadarIcon } from '@lucide/vue'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'

// `message` is driven externally (teams.vue) one player at a time, set right as that
// player's ghost-clone flight lands — so the banner always shows exactly the player
// currently arriving, not an independent ticker running on its own clock.
const props = defineProps<{ phase: 'idle' | 'matchmaking' | 'announcing', message: string }>()

const radarEl = ref<HTMLElement | null>(null)
const scanEl = ref<HTMLElement | null>(null)
const lineEl = ref<HTMLElement | null>(null)

let loopTl: gsap.core.Timeline | null = null

function killLoop() {
  loopTl?.kill()
  loopTl = null
}

watch(() => props.phase, async (phase) => {
  killLoop()

  // v-if/v-else swaps the matchmaking <p> for the announcing <p ref="lineEl"> — that DOM
  // swap is async, so refs for the just-entered phase aren't populated until after a tick.
  await nextTick()

  if (phase === 'matchmaking') {
    if (prefersReducedMotion() || !radarEl.value || !scanEl.value) return
    const { gsap } = useGSAP()
    loopTl = gsap.timeline({ repeat: -1 })
    loopTl.to(radarEl.value, { rotate: 360, duration: 1.6, ease: 'none' }, 0)
    loopTl.fromTo(scanEl.value, { xPercent: -100 }, { xPercent: 100, duration: 1.2, ease: 'power1.inOut' }, 0)
  }
})

watch(() => props.message, () => {
  if (props.phase !== 'announcing' || prefersReducedMotion() || !lineEl.value) return
  const { gsap } = useGSAP()
  gsap.fromTo(lineEl.value, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' })
})

onBeforeUnmount(killLoop)
</script>

<template>
  <div
    v-if="phase !== 'idle'"
    class="hud-frame relative flex items-center gap-3 overflow-hidden rounded-xl border border-primary/40 bg-card/85 px-4 py-3 shadow-[0_0_28px_-8px_var(--primary)]"
    style="--hud-accent: var(--primary)"
  >
    <div class="scanlines" />
    <div v-if="phase === 'matchmaking'" ref="scanEl" class="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

    <span ref="radarEl" class="inline-flex shrink-0">
      <RadarIcon class="size-5 text-primary" />
    </span>

    <div class="min-w-0 flex-1">
      <p v-if="phase === 'matchmaking'" class="neon-text font-heading text-sm font-bold tracking-[0.2em] text-primary uppercase">
        Matchmaking<span class="animate-pulse">...</span>
      </p>
      <p v-else ref="lineEl" class="line-clamp-2 font-mono text-sm text-primary">
        &gt; {{ message }}
      </p>
    </div>
  </div>
</template>
