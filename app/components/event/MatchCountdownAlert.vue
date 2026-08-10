<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Volume2Icon, VolumeXIcon, XIcon } from '@lucide/vue'
import { AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { hasEventEnded } from '#shared/utils/event-status'

const SOUND_KEY = 'match-alert-sound-enabled'

const { currentEvent, refresh } = useEvent()

// This banner is site-wide (rendered from the default layout), but `currentEvent` is a
// shared useState only the /event page happens to populate via its own refresh() — on any
// other page nothing has fetched it yet, so this component fetches it itself on mount.
onMounted(refresh)

const startsAt = computed(() => currentEvent.value?.startsAt ?? null)
const { countdown, hasStarted } = useCountdown(startsAt)

// In-memory only, not persisted — dismissing just hides it for the rest of this page
// session. A reload (or fresh visit) always shows the alert again as long as there's still
// an upcoming event, rather than staying dismissed indefinitely.
const dismissedEventId = ref<string | null>(null)

const visible = computed(() => {
  const event = currentEvent.value
  if (!event || event.canceledAt || hasEventEnded(event.startsAt) || hasStarted.value) return false
  return event.id !== dismissedEventId.value
})

function dismiss() {
  if (!currentEvent.value) return
  dismissedEventId.value = currentEvent.value.id
}

// --- "very bloody, neon, death" effects — heartbeat pulse, dying-neon flicker, dripping
// blood along the bottom edge. All skipped under prefers-reduced-motion (see useGSAP).
const rootEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const dripEls = ref<(HTMLElement | null)[]>([])

let heartbeatTl: gsap.core.Timeline | null = null
let flickerCall: gsap.core.Tween | null = null
let dripTls: gsap.core.Timeline[] = []

function killEffects() {
  heartbeatTl?.kill()
  heartbeatTl = null
  flickerCall?.kill()
  flickerCall = null
  dripTls.forEach(tl => tl.kill())
  dripTls = []
}

function startEffects() {
  killEffects()
  const root = rootEl.value
  if (prefersReducedMotion() || !root) return
  const { gsap } = useGSAP()

  const baseShadow = '0 0 22px 2px rgba(200,10,25,0.45), inset 0 0 24px rgba(90,0,10,0.4)'
  const thumpShadow = '0 0 48px 10px rgba(255,20,40,0.85), inset 0 0 40px rgba(140,0,10,0.6)'
  heartbeatTl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 })
  heartbeatTl
    .to(root, { scale: 1.012, boxShadow: thumpShadow, duration: 0.11, ease: 'power2.out' })
    .to(root, { scale: 1, boxShadow: baseShadow, duration: 0.19, ease: 'power2.in' })
    .to(root, { scale: 1.03, boxShadow: thumpShadow, duration: 0.13, ease: 'power2.out' }, '+=0.08')
    .to(root, { scale: 1, boxShadow: baseShadow, duration: 0.24, ease: 'power2.in' })

  const scheduleFlicker = () => {
    flickerCall = gsap.delayedCall(gsap.utils.random(2.5, 6), () => {
      if (!titleEl.value) return
      const burst = gsap.timeline({ onComplete: scheduleFlicker })
      const steps = Math.round(gsap.utils.random(3, 6))
      for (let i = 0; i < steps; i++) {
        burst.to(titleEl.value, {
          opacity: gsap.utils.random(0.25, 0.85),
          x: gsap.utils.random(-1.5, 1.5),
          duration: gsap.utils.random(0.04, 0.12)
        })
      }
      burst.to(titleEl.value, { opacity: 1, x: 0, duration: 0.15 })
    })
  }
  scheduleFlicker()

  dripTls = dripEls.value.filter((el): el is HTMLElement => Boolean(el)).map((el) => {
    gsap.set(el, { transformOrigin: 'top', scaleY: 0, opacity: 0 })
    const tl = gsap.timeline({ repeat: -1, delay: gsap.utils.random(0, 2.5) })
    tl.to(el, { opacity: 1, duration: 0.15 })
      .to(el, { scaleY: 1, duration: gsap.utils.random(0.9, 1.7), ease: 'power1.in' })
      .to(el, { opacity: 0, duration: 0.35 }, '-=0.15')
      .set(el, { scaleY: 0 })
      .to({}, { duration: gsap.utils.random(1.6, 4) })
    return tl
  })
}

watch(visible, async (isVisible) => {
  if (!isVisible) {
    killEffects()
    return
  }
  await nextTick()
  startEffects()
}, { immediate: true })

// --- C4 beep — a synthesized tone (Web Audio, no external sound file) rather than a looping
// asset, so the beep rate can scale smoothly with the actual time remaining: a slow, ominous
// tick from days/hours out, accelerating into a rapid beep in the final seconds, exactly like
// the in-game plant timer. Off by default — unsolicited audio is bad practice, and browsers
// block autoplay-with-sound until a real user gesture happens anyway.
const soundEnabled = ref(import.meta.client && localStorage.getItem(SOUND_KEY) === 'true')
let audioCtx: AudioContext | null = null
let beepTimeoutId: ReturnType<typeof setTimeout> | null = null

function beepIntervalMsFor(totalMs: number): number {
  const seconds = totalMs / 1000
  if (seconds > 86400) return 4000 // > 1 day out — slow, occasional tick
  if (seconds > 3600) return 2500 // > 1 hour
  if (seconds > 600) return 1500 // > 10 min
  if (seconds > 60) return 800 // > 1 min
  if (seconds > 10) return 400 // final minute
  return 180 // final 10 seconds — rapid beeping
}

function playBeep() {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.value = 920
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.16, now + 0.008)
  gain.gain.linearRampToValueAtTime(0, now + 0.09)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.1)
}

function scheduleBeep() {
  playBeep()
  beepTimeoutId = setTimeout(scheduleBeep, beepIntervalMsFor(countdown.value.totalMs))
}

function stopBeeping() {
  if (beepTimeoutId !== null) {
    clearTimeout(beepTimeoutId)
    beepTimeoutId = null
  }
}

function resumeAudioContext() {
  audioCtx?.resume().catch(() => {})
}

function startSound() {
  stopBeeping()
  if (!audioCtx) audioCtx = new AudioContext()
  resumeAudioContext()
  // If autoplay is still blocked (e.g. `soundEnabled` was restored from a previous visit on
  // a fresh page load, with no gesture yet this time), the context stays suspended and
  // playBeep() is silently a no-op until the first click/keydown anywhere resumes it.
  document.addEventListener('pointerdown', resumeAudioContext, { once: true })
  document.addEventListener('keydown', resumeAudioContext, { once: true })
  scheduleBeep()
}

function stopSound() {
  stopBeeping()
  document.removeEventListener('pointerdown', resumeAudioContext)
  document.removeEventListener('keydown', resumeAudioContext)
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem(SOUND_KEY, String(soundEnabled.value))
}

watch([visible, soundEnabled], ([isVisible, isSoundEnabled]) => {
  if (isVisible && isSoundEnabled) startSound()
  else stopSound()
}, { immediate: true })

onBeforeUnmount(() => {
  killEffects()
  stopSound()
  audioCtx?.close().catch(() => {})
})
</script>

<template>
  <div v-if="visible" class="border-b border-red-900/50 bg-black px-3 py-2 sm:px-4" lang="vi">
    <div
      ref="rootEl"
      role="alert"
      class="relative mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 overflow-hidden rounded-lg border border-red-600/70 bg-gradient-to-br from-[#1a0000] via-[#2a0006] to-[#0a0000] px-4 py-2.5"
      style="box-shadow: 0 0 22px 2px rgba(200,10,25,0.45), inset 0 0 24px rgba(90,0,10,0.4)"
    >
      <div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-around px-6">
        <span
          v-for="i in 6"
          :key="i"
          :ref="(el) => { dripEls[i - 1] = el as HTMLElement | null }"
          class="h-4 w-[3px] rounded-b-full bg-gradient-to-b from-red-700 to-red-950"
        />
      </div>

      <img
        src="/images/c4-bomb.png"
        alt="C4"
        class="h-10 w-14 shrink-0 object-contain"
        style="filter: drop-shadow(0 0 6px rgba(255,20,40,0.9)) drop-shadow(0 0 16px rgba(255,0,20,0.55))"
      >

      <div class="min-w-0">
        <AlertTitle class="p-0">
          <span ref="titleEl" class="font-heading text-sm font-bold tracking-[0.15em] text-red-500 uppercase sm:text-base" style="text-shadow: 0 0 8px rgba(255,20,40,0.9), 0 0 18px rgba(255,0,20,0.6)">
            Trận chiến sắp bắt đầu
          </span>
        </AlertTitle>
        <AlertDescription class="text-red-200/85">
          Còn <b class="font-mono text-red-300">{{ countdown.days }}</b> ngày
          <b class="font-mono text-red-300">{{ countdown.hours }}</b> giờ
          <b class="font-mono text-red-300">{{ countdown.minutes }}</b> phút
          <b class="font-mono text-red-300">{{ countdown.seconds }}</b> giây —
          <NuxtLink to="/event" class="font-semibold text-red-100">Xem chi tiết</NuxtLink>
        </AlertDescription>
      </div>

      <AlertAction class="static flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" class="text-red-300 hover:bg-red-950/50 hover:text-red-100" :aria-label="soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'" @click="toggleSound">
          <Volume2Icon v-if="soundEnabled" class="size-4" />
          <VolumeXIcon v-else class="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" class="text-red-300 hover:bg-red-950/50 hover:text-red-100" @click="dismiss">
          <XIcon class="size-4" />
        </Button>
      </AlertAction>
    </div>
  </div>
</template>
