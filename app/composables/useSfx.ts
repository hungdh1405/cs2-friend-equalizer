// Synthesized via Web Audio (no audio files to source/host) — short, quiet HUD-style blips.
// Every call happens inside a click/toggle handler, so the required user-gesture for
// autoplay is already satisfied.
let ctx: AudioContext | null = null
let tension: { stop: () => void } | null = null

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

function stopTension() {
  tension?.stop()
  tension = null
}

function startTension() {
  stopTension()
  const audio = getCtx()
  if (!audio) return

  const low = audio.createOscillator()
  const high = audio.createOscillator()
  const gain = audio.createGain()
  const now = audio.currentTime

  low.type = 'sawtooth'
  high.type = 'sine'
  low.frequency.setValueAtTime(52, now)
  low.frequency.exponentialRampToValueAtTime(78, now + 4.5)
  high.frequency.setValueAtTime(132, now)
  high.frequency.exponentialRampToValueAtTime(220, now + 4.5)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.035, now + 4.5)

  low.connect(gain)
  high.connect(gain)
  gain.connect(audio.destination)
  low.start(now)
  high.start(now)

  let stopped = false
  tension = {
    stop: () => {
      if (stopped) return
      stopped = true
      const stopAt = audio.currentTime + 0.06
      gain.gain.cancelScheduledValues(audio.currentTime)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt)
      low.stop(stopAt + 0.02)
      high.stop(stopAt + 0.02)
    }
  }
}

function impact() {
  const audio = getCtx()
  if (!audio) return

  const now = audio.currentTime
  const osc = audio.createOscillator()
  const oscGain = audio.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(160, now)
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.28)
  oscGain.gain.setValueAtTime(0.1, now)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  osc.connect(oscGain)
  oscGain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + 0.32)

  const noiseLength = Math.floor(audio.sampleRate * 0.18)
  const buffer = audio.createBuffer(1, noiseLength, audio.sampleRate)
  const channel = buffer.getChannelData(0)
  for (let index = 0; index < noiseLength; index++) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / noiseLength)
  }
  const noise = audio.createBufferSource()
  const noiseGain = audio.createGain()
  noise.buffer = buffer
  noiseGain.gain.setValueAtTime(0.075, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
  noise.connect(noiseGain)
  noiseGain.connect(audio.destination)
  noise.start(now)
}

export function useSfx() {
  return {
    /** Open/resume Web Audio synchronously from the button gesture before async balancing. */
    arm: () => { void getCtx()?.resume() },
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
    },
    playCaseTick: (speed = 0.5) => blip(700 + Math.max(0, Math.min(1, speed)) * 620, 0.025, 'square', 0.025),
    startCaseTension: startTension,
    stopCaseTension: stopTension,
    playCaseImpact: impact,
    playCaseCelebration: () => {
      blip(523.25, 0.16, 'triangle', 0.055)
      setTimeout(() => blip(659.25, 0.16, 'triangle', 0.06), 80)
      setTimeout(() => blip(783.99, 0.24, 'triangle', 0.065), 170)
    }
  }
}
