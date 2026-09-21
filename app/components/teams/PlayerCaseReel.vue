<script setup lang="ts">
import type { Player } from '#shared/types'
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { ShieldIcon } from '@lucide/vue'
import PlayerCard from '@/components/players/PlayerCard.vue'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { createCaseReelPlan } from '@/lib/case-draft'
import { cn } from '@/lib/utils'

export type CaseReelPhase = 'spinning' | 'slowing' | 'finalizing' | 'revealing'

const SPIN_DURATION = 12.4

const props = defineProps<{
  players: Player[]
  winner: Player
  runId: number
  pickNumber: number
  totalPicks: number
  teamName: string
  teamAccent: string
}>()

const emit = defineEmits<{
  phase: [phase: CaseReelPhase]
  tick: [payload: { index: number, speed: number }]
  reveal: []
  complete: []
}>()

const rootEl = useTemplateRef<HTMLElement>('root')
const viewportEl = useTemplateRef<HTMLElement>('viewport')
const trackEl = useTemplateRef<HTMLElement>('track')
const flashEl = useTemplateRef<HTMLElement>('flash')
const glowEl = useTemplateRef<HTMLElement>('glow')
const shineEl = useTemplateRef<HTMLElement>('shine')
const revealPanelEl = useTemplateRef<HTMLElement>('revealPanel')

const plan = shallowRef(createCaseReelPlan(props.players, props.winner.id))
const activeIndex = shallowRef(plan.value.initialIndex)
const phase = shallowRef<CaseReelPhase>('spinning')
const revealed = shallowRef(false)
const timeline = shallowRef<gsap.core.Timeline | null>(null)
let context: gsap.Context | null = null
let resizeObserver: ResizeObserver | null = null
let currentRunId = -1

function setPhase(nextPhase: CaseReelPhase) {
  phase.value = nextPhase
  emit('phase', nextPhase)
}

function cardClass(index: number) {
  const distance = Math.abs(index - activeIndex.value)
  return cn(
    'case-reel-card',
    distance === 0 && 'is-active',
    distance === 1 && 'is-near',
    distance > 2 && 'is-far',
    revealed.value && index === plan.value.winnerIndex && 'is-winner'
  )
}

function killSequence() {
  timeline.value?.kill()
  timeline.value = null
  context?.revert()
  context = null
  resizeObserver?.disconnect()
  resizeObserver = null
}

async function playSequence() {
  if (!rootEl.value || !viewportEl.value || !trackEl.value || currentRunId === props.runId) return
  currentRunId = props.runId
  killSequence()

  plan.value = createCaseReelPlan(props.players, props.winner.id)
  activeIndex.value = plan.value.initialIndex
  phase.value = 'spinning'
  revealed.value = false

  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

  const root = rootEl.value
  const viewport = viewportEl.value
  const track = trackEl.value
  if (!root || !viewport || !track) return

  const cards = Array.from(track.querySelectorAll<HTMLElement>('.case-reel-card'))
  if (cards.length !== plan.value.slots.length) return

  // Read layout once, then keep the full spin on compositor-only transforms.
  const cardCenters = cards.map(card => card.offsetLeft + card.offsetWidth / 2)
  const viewportCenter = viewport.clientWidth / 2
  const xFor = (index: number) => viewportCenter - cardCenters[index]
  const nearestIndex = (x: number) => {
    const contentCenter = viewportCenter - x
    let nearest = 0
    let nearestDistance = Number.POSITIVE_INFINITY
    for (let index = 0; index < cardCenters.length; index++) {
      const distance = Math.abs(cardCenters[index] - contentCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = index
      }
    }
    return nearest
  }

  const { gsap } = useGSAP()
  resizeObserver = new ResizeObserver(() => {
    if (!revealed.value) return
    requestAnimationFrame(() => {
      const winnerCard = cards[plan.value.winnerIndex]
      if (!winnerCard || !viewportEl.value || !trackEl.value) return
      const responsiveCenter = winnerCard.offsetLeft + winnerCard.offsetWidth / 2
      gsap.set(trackEl.value, { x: viewportEl.value.clientWidth / 2 - responsiveCenter })
    })
  })
  resizeObserver.observe(viewport)

  context = gsap.context(() => {
    gsap.set(track, { x: xFor(plan.value.initialIndex), force3D: true })
    gsap.set([flashEl.value, glowEl.value, shineEl.value, revealPanelEl.value], { autoAlpha: 0 })

    const finishReducedMotion = () => {
      activeIndex.value = plan.value.winnerIndex
      revealed.value = true
      gsap.set(track, { x: xFor(plan.value.winnerIndex) })
      setPhase('revealing')
      emit('reveal')
      gsap.to(revealPanelEl.value, {
        autoAlpha: 1,
        y: 0,
        duration: 0.2,
        onComplete: () => emit('complete')
      })
    }

    if (prefersReducedMotion()) {
      finishReducedMotion()
      return
    }

    let lastTickIndex = plan.value.initialIndex
    const updateActiveCard = () => {
      const currentX = Number(gsap.getProperty(track, 'x'))
      const nextIndex = nearestIndex(currentX)
      if (nextIndex === lastTickIndex) return
      lastTickIndex = nextIndex
      activeIndex.value = nextIndex
      const speed = phase.value === 'spinning' ? 1 : phase.value === 'slowing' ? 0.55 : 0.2
      emit('tick', { index: nextIndex, speed })
    }

    const revealWinner = () => {
      activeIndex.value = plan.value.winnerIndex
      revealed.value = true
      setPhase('revealing')
      emit('reveal')

      const winnerShell = cards[plan.value.winnerIndex]?.querySelector<HTMLElement>('.case-card-shell')
      const particles = Array.from(root.querySelectorAll<HTMLElement>('.case-particle'))
      const revealTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      revealTimeline
        .to(flashEl.value, { autoAlpha: 0.72, duration: 0.06 }, 0)
        .to(flashEl.value, { autoAlpha: 0, duration: 0.28 }, 0.06)
        .to(glowEl.value, { autoAlpha: 1, scale: 1.05, duration: 0.38 }, 0)
        .fromTo(root, { x: 0 }, {
          keyframes: [{ x: -3 }, { x: 3 }, { x: -1 }, { x: 0 }],
          duration: 0.26
        }, 0)
        .fromTo(winnerShell, { scale: 1 }, {
          scale: 1.055,
          duration: 0.44,
          ease: 'back.out(1.7)'
        }, 0.02)
        .fromTo(shineEl.value, { autoAlpha: 0, xPercent: -120 }, {
          autoAlpha: 0.72,
          xPercent: 120,
          duration: 0.58,
          ease: 'power2.inOut'
        }, 0.06)
        .to(shineEl.value, { autoAlpha: 0, duration: 0.14 }, 0.62)
        .fromTo(particles, { autoAlpha: 0.9, x: 0, y: 0, scale: 0.35 }, {
          autoAlpha: 0,
          x: () => gsap.utils.random(-150, 150, 5),
          y: () => gsap.utils.random(-72, 72, 4),
          scale: () => gsap.utils.random(0.6, 1.2),
          rotation: () => gsap.utils.random(-150, 150),
          stagger: { each: 0.014, from: 'random' },
          duration: 0.62
        }, 0.05)
        .fromTo(revealPanelEl.value, { autoAlpha: 0, y: 10, scale: 0.97 }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.36
        }, 0.16)
        .call(() => emit('complete'), [], 0.78)
    }

    timeline.value = gsap.timeline({ onUpdate: updateActiveCard })
    timeline.value
      .call(() => setPhase('spinning'), [], 0)
      .to(track, {
        x: xFor(plan.value.winnerIndex),
        duration: SPIN_DURATION,
        ease: 'power3.out',
        force3D: true
      }, 0)
      .call(() => setPhase('slowing'), [], 4.4)
      .call(() => setPhase('finalizing'), [], 9.2)
      .call(revealWinner, [], SPIN_DURATION)
  }, root)
}

onMounted(() => { void playSequence() })

watch(() => props.runId, () => {
  currentRunId = -1
  void playSequence()
}, { flush: 'post' })

onBeforeUnmount(killSequence)
</script>

<template>
  <section
    ref="root"
    :class="cn('case-reel', `phase-${phase}`, revealed && 'is-revealed')"
    :style="{ '--target-team': teamAccent }"
    :aria-label="`Selecting a player for ${teamName}`"
  >
    <div class="case-reel-heading">
      <div class="case-team-target">
        <span class="case-team-shield" aria-hidden="true"><ShieldIcon /></span>
        <div class="case-team-copy">
          <span>Selecting for</span>
          <strong>{{ teamName }}</strong>
        </div>
      </div>
      <span class="case-pick-position font-mono tabular-nums">Pick {{ pickNumber }} of {{ totalPicks }}</span>
    </div>

    <div ref="viewport" class="case-reel-viewport">
      <div class="case-speed-lines" aria-hidden="true" />
      <div class="case-marker case-marker-top" aria-hidden="true" />
      <div class="case-marker case-marker-bottom" aria-hidden="true" />
      <div class="case-center-line" aria-hidden="true" />

      <div ref="track" class="case-reel-track" aria-hidden="true">
        <article
          v-for="(slot, index) in plan.slots"
          :key="slot.key"
          :class="cardClass(index)"
        >
          <PlayerCard
            :player="slot.player"
            :interactive="false"
            :show-action="false"
            class="case-card-shell"
          />
        </article>
      </div>

      <div ref="glow" class="case-winner-glow" aria-hidden="true" />
      <div ref="flash" class="case-gold-flash" aria-hidden="true" />
      <div ref="shine" class="case-shine" aria-hidden="true" />
      <span v-for="index in 16" :key="index" class="case-particle" aria-hidden="true" />

      <div ref="revealPanel" class="case-reveal-panel" aria-live="assertive">
        <span>Selected player</span>
        <strong>{{ winner.name }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-reel {
  --case-gold: var(--elite);
  --case-orange: var(--tier-a);
  --case-ink: oklch(0.105 0.018 255);
  --target-team: var(--primary);
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--target-team) 42%, var(--border));
  border-radius: calc(var(--radius-xl) + 0.25rem);
  background:
    radial-gradient(circle at 50% 44%, color-mix(in oklch, var(--target-team) 8%, transparent), transparent 38%),
    linear-gradient(180deg, color-mix(in oklch, var(--card) 90%, black), var(--case-ink));
  box-shadow: inset 0 1px oklch(1 0 0 / 5%), inset 0 -28px 60px oklch(0 0 0 / 24%), 0 16px 44px oklch(0 0 0 / 28%);
}

.case-reel-heading {
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid color-mix(in oklch, var(--target-team) 34%, var(--border));
  padding: 0.65rem 0.85rem;
  background:
    linear-gradient(90deg, color-mix(in oklch, var(--target-team) 13%, transparent), transparent 56%),
    color-mix(in oklch, var(--background) 58%, transparent);
}

.case-team-target {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
}

.case-team-shield {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in oklch, var(--target-team) 62%, var(--border));
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--target-team) 13%, transparent);
  color: var(--target-team);
  box-shadow: 0 0 18px color-mix(in oklch, var(--target-team) 15%, transparent);
}

.case-team-shield :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.case-team-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.08rem;
}

.case-team-copy > span {
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
}

.case-team-copy > strong {
  overflow: hidden;
  color: var(--target-team);
  font-family: var(--font-heading);
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.25;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 0 14px color-mix(in oklch, var(--target-team) 35%, transparent);
}

.case-pick-position {
  flex: 0 0 auto;
  color: var(--muted-foreground);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
}

.case-reel-viewport {
  position: relative;
  min-height: 15.5rem;
  overflow: hidden;
  perspective: 900px;
  transform: translateZ(0);
}

.case-reel-viewport::before,
.case-reel-viewport::after {
  position: absolute;
  z-index: 4;
  inset-block: 0;
  width: 19%;
  content: '';
  pointer-events: none;
}

.case-reel-viewport::before {
  left: 0;
  background: linear-gradient(90deg, var(--case-ink) 8%, color-mix(in oklch, var(--case-ink) 82%, transparent) 38%, transparent);
}

.case-reel-viewport::after {
  right: 0;
  background: linear-gradient(-90deg, var(--case-ink) 8%, color-mix(in oklch, var(--case-ink) 82%, transparent) 38%, transparent);
}

.case-reel-track {
  display: flex;
  width: max-content;
  gap: clamp(0.7rem, 1.5vw, 1.05rem);
  padding-block: 2.7rem 4.1rem;
  will-change: transform;
}

.case-reel-card {
  width: clamp(12.5rem, 20vw, 13.5rem);
  flex: 0 0 auto;
  opacity: 0.4;
  filter: brightness(0.64) saturate(0.72);
  transform: scale(0.92);
  transform-origin: center;
  transition: opacity 180ms ease-out, filter 180ms ease-out, transform 180ms ease-out;
  will-change: transform, opacity;
}

.case-reel-card.is-near {
  opacity: 0.7;
  filter: brightness(0.84) saturate(0.86);
  transform: scale(0.96);
}

.case-reel-card.is-active {
  opacity: 0.96;
  filter: brightness(1) saturate(1);
  transform: scale(0.99);
}

.case-reel-card.is-far {
  opacity: 0.22;
}

.case-reel-card :deep(.case-card-shell) {
  height: 15.25rem;
  border-radius: var(--radius-xl);
  box-shadow: inset 0 1px oklch(1 0 0 / 5%), 0 10px 24px oklch(0 0 0 / 30%);
}

.case-center-line {
  position: absolute;
  z-index: 6;
  top: 1.65rem;
  bottom: 2.7rem;
  left: 50%;
  width: 1px;
  background: linear-gradient(transparent, color-mix(in oklch, var(--case-gold) 70%, white) 22%, var(--target-team) 50%, color-mix(in oklch, var(--case-gold) 70%, white) 78%, transparent);
  box-shadow: 0 0 12px color-mix(in oklch, var(--target-team) 75%, transparent);
  transform: translateX(-50%);
  pointer-events: none;
}

.case-marker {
  position: absolute;
  z-index: 7;
  left: 50%;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  filter: drop-shadow(0 0 6px var(--target-team));
  pointer-events: none;
}

.case-marker-top {
  top: 1.1rem;
  border-top: 0.7rem solid var(--target-team);
  border-right: 0.48rem solid transparent;
  border-left: 0.48rem solid transparent;
}

.case-marker-bottom {
  bottom: 2.2rem;
  border-right: 0.48rem solid transparent;
  border-bottom: 0.7rem solid var(--target-team);
  border-left: 0.48rem solid transparent;
}

.case-speed-lines {
  position: absolute;
  inset: 28% 0 32%;
  opacity: 0;
  background: repeating-linear-gradient(90deg, transparent 0 5%, oklch(1 0 0 / 7%) 5.2%, transparent 5.6% 10%);
  pointer-events: none;
  transition: opacity 260ms ease-out;
}

.phase-spinning .case-speed-lines {
  opacity: 0.62;
}

.phase-spinning .case-reel-track {
  filter: blur(0.8px);
}

.case-gold-flash,
.case-winner-glow,
.case-shine {
  position: absolute;
  z-index: 5;
  pointer-events: none;
}

.case-gold-flash {
  inset: 0;
  background: color-mix(in oklch, var(--case-gold) 70%, white);
}

.case-winner-glow {
  top: 16%;
  bottom: 24%;
  left: 50%;
  width: min(38vw, 20rem);
  background: radial-gradient(ellipse, color-mix(in oklch, var(--case-gold) 26%, transparent), transparent 70%);
  filter: blur(16px);
  transform: translateX(-50%);
}

.case-shine {
  top: 18%;
  bottom: 28%;
  left: 50%;
  width: 3rem;
  background: linear-gradient(90deg, transparent, oklch(1 0 0 / 64%), transparent);
  filter: blur(2px);
  transform: skewX(-14deg);
}

.case-particle {
  position: absolute;
  z-index: 8;
  top: 47%;
  left: 50%;
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 999px;
  opacity: 0;
  background: var(--case-gold);
  box-shadow: 0 0 7px var(--case-orange);
  pointer-events: none;
}

.case-reveal-panel {
  position: absolute;
  z-index: 9;
  bottom: 0.55rem;
  left: 50%;
  display: flex;
  max-width: calc(100% - 1rem);
  align-items: center;
  gap: 0.55rem;
  border: 1px solid color-mix(in oklch, var(--case-gold) 42%, var(--border));
  border-radius: 999px;
  padding: 0.38rem 0.55rem 0.38rem 0.75rem;
  background: color-mix(in oklch, var(--background) 88%, transparent);
  box-shadow: 0 8px 26px oklch(0 0 0 / 35%), 0 0 18px color-mix(in oklch, var(--case-gold) 12%, transparent);
  transform: translateX(-50%);
  white-space: nowrap;
}

.case-reveal-panel > span {
  color: var(--muted-foreground);
  font-size: 0.68rem;
}

.case-reveal-panel > strong {
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  font-family: var(--font-heading);
  font-size: 0.84rem;
  text-overflow: ellipsis;
}

.is-revealed .case-reel-card:not(.is-winner) {
  opacity: 0.1;
  filter: brightness(0.35) saturate(0.35);
}

.is-revealed .case-reel-card.is-winner {
  opacity: 1;
  filter: brightness(1.12) saturate(1.05);
  transform: scale(1.02);
}

.is-revealed .case-reel-card.is-winner :deep(.case-card-shell) {
  border-color: color-mix(in oklch, var(--hud-accent) 68%, white);
  box-shadow: 0 0 0 1px color-mix(in oklch, var(--hud-accent) 45%, transparent), 0 0 28px color-mix(in oklch, var(--hud-accent) 28%, transparent);
}

@media (max-width: 639px) {
  .case-reel-heading {
    min-height: 3.65rem;
    gap: 0.6rem;
    padding-inline: 0.7rem;
  }

  .case-team-shield {
    width: 2rem;
    height: 2rem;
  }

  .case-pick-position {
    font-size: 0.59rem;
  }

  .case-reel-viewport {
    min-height: 14.5rem;
  }

  .case-reel-track {
    padding-block: 2.55rem 4rem;
  }

  .case-reel-card {
    width: min(60vw, 13rem);
  }

  .case-reel-card :deep(.case-card-shell) {
    height: 14.5rem;
  }

  .case-reveal-panel > span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .case-reel-card,
  .case-speed-lines {
    transition: none;
  }

  .case-reel-track {
    filter: none !important;
  }
}
</style>
