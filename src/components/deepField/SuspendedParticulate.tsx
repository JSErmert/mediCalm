/**
 * SuspendedParticulate — the fine layer of the Deep Current field.
 *
 * WHY THIS EXISTS. A dark background with no structure at the 1-2px scale reads as an
 * absence of light. A dark background with a fine, slowly-moving grain reads as a
 * SUBSTANCE you are inside. That difference is most of what people mean by "depth",
 * and no amount of gradient work at the 1000px scale substitutes for it — the eye
 * needs something to resolve.
 *
 * The technique is borrowed from the portfolio's constellation canvas, which gives
 * every point a depth `d` and lets that one number drive size, brightness and speed
 * at once. The idiom is deliberately NOT borrowed. That field is stars: it sparkles,
 * it links neighbours into constellations, it answers the cursor. This one is matter
 * suspended in deep water:
 *
 *   • motes SINK. Vertical drift is downward-biased with a slow lateral sway, the
 *     way silt falls through still water. A random walk reads as dust in air.
 *   • nothing twinkles. Brightness is fixed per mote and set by depth alone. A
 *     pulsing background in an app whose whole job is to slow a nervous system down
 *     is working against the product.
 *   • no links, no constellations. Water has no structure to draw.
 *   • no pointer parallax. Deep water does not respond to you, and this is a
 *     touch-first app where it would mostly be dead code.
 *
 * Depth still does the work: far motes are tiny, dim and nearly still; near ones are
 * larger, brighter and fall visibly faster. The distribution is cubed toward zero so
 * the overwhelming majority sit far back and the field recedes.
 *
 * SAFE BY CONSTRUCTION.
 *  - `prefers-reduced-motion` renders exactly one frame and never starts a loop.
 *    Depth still reads, through size and brightness alone.
 *  - aria-hidden and pointer-events:none, so it never reaches a screen reader and
 *    never intercepts a tap.
 *  - count scales with area and is capped hard, with a much lower cap on small
 *    screens — this runs behind every screen of the app on a phone.
 *  - cancels its frame and drops its listener on unmount.
 */
import { useEffect, useRef } from 'react'
import styles from './SuspendedParticulate.module.css'

/** A single suspended mote. */
type Mote = {
  x: number
  y: number
  /** Lateral sway phase and rate — the horizontal component is a sine, never a walk. */
  phase: number
  sway: number
  /** Sink rate, px per frame. */
  vy: number
  /** Depth 0 (far) to 1 (near). Drives radius, alpha and vy. */
  d: number
  r: number
  a: number
}

/**
 * Motes per pixel of canvas area, and the caps. The small-screen cap is separate
 * because this composites behind the whole app on a phone GPU, and the field's job
 * is atmosphere — past a certain density it stops adding depth and starts costing
 * frames.
 */
const AREA_PER_MOTE = 9000
const MAX_MOTES_SMALL = 46
const MAX_MOTES = 104
const MIN_MOTES = 24
const SMALL_SCREEN = 640

export function SuspendedParticulate() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const g = cv.getContext('2d')
    if (!g) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Cap DPR at 2. A 3x phone would trip the mote count into four times the fill
    // cost for a grain nobody can resolve at that density anyway.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w = 0
    let h = 0
    let raf = 0
    let motes: Mote[] = []
    let lastW = -1

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    function build() {
      const small = w < SMALL_SCREEN
      const cap = small ? MAX_MOTES_SMALL : MAX_MOTES
      const count = Math.max(MIN_MOTES, Math.min(cap, Math.floor((w * h) / AREA_PER_MOTE)))

      motes = Array.from({ length: count }, () => {
        // Cubed toward 0: a few motes are close, the great majority recede. This is
        // what makes the field read as having a back to it.
        const d = Math.pow(Math.random(), 3)
        return {
          x: rand(0, w),
          y: rand(0, h),
          phase: rand(0, Math.PI * 2),
          // Near motes sway a little wider, but all of it is slow.
          sway: 0.0006 + d * 0.0016,
          // Sink rate scales with depth SQUARED, so distant matter is nearly static
          // and only the near motes visibly fall. At these values a near mote crosses
          // the screen in roughly a minute and a half.
          vy: 0.02 + d * d * 0.11,
          d,
          r: 0.4 + d * 1.35,
          a: 0.05 + d * 0.30,
        }
      })
      // Far first, so near motes composite on top.
      motes.sort((m1, m2) => m1.d - m2.d)
    }

    function resize() {
      const rect = cv!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      cv!.width = Math.max(1, Math.floor(w * dpr))
      cv!.height = Math.max(1, Math.floor(h * dpr))
      g!.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Rebuild only when the WIDTH changes. Mobile browsers fire resize with a new
      // height every time the URL bar hides or shows during a scroll; rebuilding there
      // would teleport the entire field on an ordinary swipe.
      if (motes.length && Math.abs(w - lastW) < 1) return
      lastW = w
      build()
    }

    function frame() {
      g!.clearRect(0, 0, w, h)

      for (const m of motes) {
        m.y += m.vy
        m.phase += m.sway
        // Lateral position is a sine offset from the mote's own column, so matter
        // drifts sideways and back rather than wandering off. Amplitude rises with
        // depth, which reads as nearer matter moving through more water.
        const x = m.x + Math.sin(m.phase) * (2 + m.d * 9)

        // Wrap at the bottom and re-enter at the top in a new column, so the field
        // never depletes and never shows a repeating pattern.
        if (m.y > h + 6) {
          m.y = -6
          m.x = rand(0, w)
        }

        // A cool near-white at the core, tinted toward the field's teal. Alpha is
        // fixed per mote for the life of the field — this layer never pulses.
        g!.fillStyle = `rgba(196, 236, 240, ${m.a})`
        g!.beginPath()
        g!.arc(x, m.y, m.r, 0, Math.PI * 2)
        g!.fill()
      }

      if (!reduce) raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    // Under reduced-motion draw a single settled frame and stop. The grain is still
    // there, so the ground still has depth; it simply does not move.
    if (reduce) frame()
    else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={styles.particulate} />
}
