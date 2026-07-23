import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

let registered = false

/** Registers GSAP plugins once (client-only). See gsap-frameworks/gsap-plugins skills. */
export function useGSAP() {
  if (!registered && import.meta.client) {
    gsap.registerPlugin(Flip)
    registered = true
  }
  return { gsap, Flip }
}

export function prefersReducedMotion(): boolean {
  if (import.meta.server) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
