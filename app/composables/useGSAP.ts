import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Registers GSAP plugins once (client-only). See gsap-frameworks/gsap-plugins skills. */
export function useGSAP() {
  if (!registered && import.meta.client) {
    gsap.registerPlugin(Flip, ScrambleTextPlugin, ScrollTrigger)
    registered = true
  }
  return { gsap, Flip, ScrambleTextPlugin, ScrollTrigger }
}

export function prefersReducedMotion(): boolean {
  if (import.meta.server) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
