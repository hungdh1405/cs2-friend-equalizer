import { gsap } from 'gsap'

export interface HorizontalLoopConfig {
  speed?: number
  paused?: boolean
  repeat?: number
  paddingRight?: number
  snap?: number | false
  reversed?: boolean
}

export interface HorizontalLoopTimeline extends gsap.core.Timeline {
  next: (vars?: gsap.TweenVars) => gsap.core.Tween
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween
  current: () => number
  times: number[]
}

// GSAP's official "seamless (infinite) horizontal loop" helper, verbatim from
// https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/ (free to use, no plugin
// license needed — just core GSAP). Deliberately the *paused*, non-Draggable variant: the
// returned timeline only ever animates in response to an explicit `next()`/`previous()`/
// `toIndex()`/`progress()` call, so it costs nothing while idle — no ticker, no continuous
// tween, matching this app's "zero ambient animation" performance stance (see DESIGN.md).
// PlayerSlider.vue drives it with plain Pointer Events for 1:1 drag-follow instead of
// GSAP's Draggable/InertiaPlugin, so no extra plugin registration is needed either.
export function horizontalLoop(items: Element[], config: HorizontalLoopConfig = {}): HorizontalLoopTimeline {
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
  }) as HorizontalLoopTimeline
  const length = items.length
  const startX = (items[0] as HTMLElement).offsetLeft
  const times: number[] = []
  const widths: number[] = []
  const xPercents: number[] = []
  let curIndex = 0
  const pixelsPerSecond = (config.speed || 1) * 100
  const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1)
  let totalWidth: number
  let curX: number, distanceToStart: number, distanceToLoop: number, item: Element, i: number

  gsap.set(items, {
    xPercent: (i: number, el: Element) => {
      const w = (widths[i] = Number.parseFloat(gsap.getProperty(el, 'width', 'px') as string))
      xPercents[i] = snap(
        (Number.parseFloat(gsap.getProperty(el, 'x', 'px') as string) / w) * 100
        + (gsap.getProperty(el, 'xPercent') as number)
      )
      return xPercents[i]
    }
  })
  gsap.set(items, { x: 0 })
  totalWidth = (items[length - 1] as HTMLElement).offsetLeft
    + (xPercents[length - 1] / 100) * widths[length - 1]
    - startX
    + (items[length - 1] as HTMLElement).offsetWidth * (gsap.getProperty(items[length - 1], 'scaleX') as number)
    + (config.paddingRight || 0)

  for (i = 0; i < length; i++) {
    item = items[i]
    curX = (xPercents[i] / 100) * widths[i]
    distanceToStart = (item as HTMLElement).offsetLeft + curX - startX
    distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number)
    tl.to(item, {
      xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
      duration: distanceToLoop / pixelsPerSecond
    }, 0)
      .fromTo(item, {
        xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100)
      }, {
        xPercent: xPercents[i],
        duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
        immediateRender: false
      }, distanceToLoop / pixelsPerSecond)
      .add(`label${i}`, distanceToStart / pixelsPerSecond)
    times[i] = distanceToStart / pixelsPerSecond
  }

  function toIndex(index: number, vars: gsap.TweenVars = {}) {
    if (Math.abs(index - curIndex) > length / 2) index += index > curIndex ? -length : length
    const newIndex = gsap.utils.wrap(0, length, index)
    let time = times[newIndex]
    if ((time > tl.time()) !== (index > curIndex)) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) }
      time += tl.duration() * (index > curIndex ? 1 : -1)
    }
    curIndex = newIndex
    vars.overwrite = true
    return tl.tweenTo(time, vars)
  }

  tl.next = (vars?: gsap.TweenVars) => toIndex(curIndex + 1, vars)
  tl.previous = (vars?: gsap.TweenVars) => toIndex(curIndex - 1, vars)
  tl.current = () => curIndex
  tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars)
  tl.times = times
  tl.progress(1, true).progress(0, true)
  if (config.reversed) {
    tl.vars.onReverseComplete?.()
    tl.reverse()
  }
  return tl
}
