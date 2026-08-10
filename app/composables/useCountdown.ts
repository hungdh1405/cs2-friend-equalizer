import type { Ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { getCountdown } from '#shared/utils/countdown'

const EPOCH = new Date(0).toISOString()

/** Ticks every second while mounted. `targetIso` is a ref so the target can change (e.g. an
 * edited event's new date) without recreating the composable. */
export function useCountdown(targetIso: Ref<string | null | undefined>) {
  const countdown = ref(getCountdown(targetIso.value ?? EPOCH))

  function tick() {
    countdown.value = getCountdown(targetIso.value ?? EPOCH)
  }

  useIntervalFn(tick, 1000)

  const hasStarted = computed(() => countdown.value.totalMs <= 0)

  return { countdown, hasStarted }
}
