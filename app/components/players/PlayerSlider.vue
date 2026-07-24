<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Player } from '#shared/types'
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { horizontalLoop, type HorizontalLoopTimeline } from '@/composables/useHorizontalLoop'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import PlayerCard from './PlayerCard.vue'

const props = defineProps<{ players: Player[] }>()
const emit = defineEmits<{ view: [Player] }>()

// Fixed pixel width (not responsive) so the loop's one-time offsetLeft/width measurements
// never go stale on resize/rotation — only how many cards fit in the viewport changes, which
// is a pure CSS/overflow concern the loop math doesn't need to know about.
const ITEM_WIDTH = 224
const SPEED = 0.55
const PIXELS_PER_SECOND = SPEED * 100
const DRAG_CLICK_THRESHOLD = 6

const viewportEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)

let loop: HorizontalLoopTimeline | null = null
let totalWidth = 0
let dragging = false
let dragStartX = 0
let dragStartProgress = 0
let dragDistance = 0
let suppressNextClick = false

function buildLoop() {
  loop?.kill()
  loop = null
  if (!trackEl.value) return
  const items = Array.from(trackEl.value.children) as HTMLElement[]
  // Fewer than 2 cards can't seamlessly loop — render statically, no drag/arrows.
  if (items.length < 2) return
  loop = horizontalLoop(items, { paused: true, speed: SPEED })
  totalWidth = loop.duration() * PIXELS_PER_SECOND
}

onMounted(async () => {
  await nextTick()
  buildLoop()
})

onBeforeUnmount(() => {
  loop?.kill()
  loop = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})

// The roster prop can change under the slider's feet (search filter, sort direction) while
// it's the active view — the loop timeline is built once from a specific set of DOM elements,
// so any change to *which* players are shown means it has to be torn down and rebuilt from the
// freshly re-rendered cards, not just left to go stale.
watch(() => props.players.map(player => player.id).join(','), async () => {
  await nextTick()
  buildLoop()
})

// Deliberately NOT using setPointerCapture: capturing the pointer on `viewportEl` retargets
// the `click` event the browser fires right after pointerup to the CAPTURING element instead
// of whatever card was actually under the finger — so a plain, no-movement tap would never
// reach that card's own `@click` handler at all (its target becomes an ancestor, and click
// dispatch never revisits descendants of its own target). Tracking the drag via window-level
// listeners instead leaves the click event's normal hit-testing/target alone; the capture-
// phase `onClickCapture` below is what suppresses it, only when a real drag happened.
function onPointerDown(event: PointerEvent) {
  if (!loop) return
  dragging = true
  dragDistance = 0
  dragStartX = event.clientX
  dragStartProgress = loop.progress()
  const { gsap } = useGSAP()
  gsap.killTweensOf(loop)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging || !loop || !totalWidth) return
  const deltaX = event.clientX - dragStartX
  dragDistance = Math.max(dragDistance, Math.abs(deltaX))
  const { gsap } = useGSAP()
  loop.progress(gsap.utils.wrap(0, 1, dragStartProgress - deltaX / totalWidth))
}

function settleToNearest() {
  if (!loop) return
  const time = loop.time()
  const duration = loop.duration()
  let closest = 0
  let closestDist = Number.POSITIVE_INFINITY
  loop.times.forEach((t, index) => {
    const d = Math.min(Math.abs(t - time), duration - Math.abs(t - time))
    if (d < closestDist) {
      closestDist = d
      closest = index
    }
  })
  loop.toIndex(closest, { duration: prefersReducedMotion() ? 0 : 0.35, ease: 'power2.out' })
}

function onPointerUp() {
  if (!dragging) return
  dragging = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  settleToNearest()
  if (dragDistance > DRAG_CLICK_THRESHOLD) suppressNextClick = true
}

// A drag ending under the pointer fires a native `click` right after `pointerup` — swallow
// that one click (capture phase, before it reaches the card underneath) so dragging past a
// card never accidentally opens its detail popup. Genuine taps (dragDistance below the
// threshold) never set the flag, so they open the popup exactly as in the grid view.
function onClickCapture(event: MouseEvent) {
  if (suppressNextClick) {
    event.stopPropagation()
    suppressNextClick = false
  }
}

function goPrev() {
  loop?.previous({ duration: prefersReducedMotion() ? 0 : 0.4, ease: 'power2.out' })
}

function goNext() {
  loop?.next({ duration: prefersReducedMotion() ? 0 : 0.4, ease: 'power2.out' })
}
</script>

<template>
  <div class="relative px-2">
    <div
      ref="viewportEl"
      class="slider-viewport touch-pan-y cursor-grab overflow-hidden py-2 active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @click.capture="onClickCapture"
    >
      <div ref="trackEl" class="flex gap-4">
        <div
          v-for="player in players"
          :key="player.id"
          class="shrink-0 select-none"
          :style="{ width: `${ITEM_WIDTH}px` }"
        >
          <PlayerCard :player="player" @view="emit('view', player)" />
        </div>
      </div>
    </div>

    <Button
      v-if="players.length > 1"
      variant="outline"
      size="icon-sm"
      class="btn-neon absolute top-1/2 left-0 -translate-y-1/2 rounded-full"
      aria-label="Previous player"
      @click="goPrev"
    >
      <ChevronLeftIcon />
    </Button>
    <Button
      v-if="players.length > 1"
      variant="outline"
      size="icon-sm"
      class="btn-neon absolute top-1/2 right-0 -translate-y-1/2 rounded-full"
      aria-label="Next player"
      @click="goNext"
    >
      <ChevronRightIcon />
    </Button>
  </div>
</template>
