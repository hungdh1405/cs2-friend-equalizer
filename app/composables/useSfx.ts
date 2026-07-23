// Synthesized via Web Audio (no audio files to source/host) — short, quiet HUD-style blips.
// Every call happens inside a click/toggle handler, so the required user-gesture for
// autoplay is already satisfied.
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (import.meta.server) return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(freq: number, duration = 0.09, type: OscillatorType = 'sine', peak = 0.06) {
  const audio = getCtx()
  if (!audio) return

  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, audio.currentTime)
  gain.gain.setValueAtTime(0, audio.currentTime)
  gain.gain.linearRampToValueAtTime(peak, audio.currentTime + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration + 0.02)
}

export function useSfx() {
  return {
    /** Toggling a player in/out of the selection list. */
    playSelect: () => blip(880, 0.05, 'sine', 0.045),
    /** Assigning a player to a team (manual drag/assign, or one row of a bulk balance). */
    playAssign: () => blip(660, 0.09, 'triangle', 0.06),
    /** Unassigning back to the waiting list. */
    playUnassign: () => blip(320, 0.09, 'triangle', 0.05),
    /** Optimize/random-balance finishing successfully. */
    playSuccess: () => {
      blip(523.25, 0.1, 'triangle', 0.06)
      setTimeout(() => blip(659.25, 0.14, 'triangle', 0.06), 90)
    }
  }
}
