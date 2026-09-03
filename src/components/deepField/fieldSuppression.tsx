/**
 * fieldSuppression — the field's off switch for safety surfaces that are NOT screens.
 *
 * WHY THIS EXISTS, and it is worth reading before changing it.
 *
 * fieldMode.ts damps the ambient field by `activeScreen`, which covers the four safety
 * SCREENS. It cannot cover the safety surface inside a running session: when someone
 * presses "I feel unwell" mid-breath, GuidedSessionScreen swaps its own phase to
 * `safety_interrupt` and renders "Stop. Exit carefully." — a role="alert" surface, the
 * most serious thing the app ever says — while `activeScreen` is still 'guided_session'.
 * A screen-keyed mapping is blind to it by construction, so the field kept drifting
 * behind that alert.
 *
 * The lesson generalises: the guard has to be scoped to the PROPERTY it protects
 * ("a safety surface is on screen right now"), never to the route that happened to
 * imply it. So this is an opt-in signal any component can raise, screen or not.
 *
 * A COUNTER, not a boolean. Two suppressors can overlap, and a boolean would let the
 * first one to unmount switch the field back on underneath the second. A counter also
 * makes the cleanup total: a component that unmounts mid-alert releases exactly its own
 * claim, so the field can never be left stuck off by an interrupted teardown.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Suppression = {
  count: number
  acquire: () => void
  release: () => void
}

const FieldSuppressionContext = createContext<Suppression | null>(null)

export function FieldSuppressionProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)

  const value = useMemo<Suppression>(
    () => ({
      count,
      acquire: () => setCount((n) => n + 1),
      release: () => setCount((n) => Math.max(0, n - 1)),
    }),
    [count]
  )

  return (
    <FieldSuppressionContext.Provider value={value}>
      {children}
    </FieldSuppressionContext.Provider>
  )
}

/**
 * True while any component is holding the field down.
 *
 * Returns false when no provider is present rather than throwing. A missing provider
 * must degrade to "the field behaves normally", never to a crashed app: this is
 * atmosphere, and it is not allowed to take a screen down with it.
 */
export function useFieldSuppressed(): boolean {
  return (useContext(FieldSuppressionContext)?.count ?? 0) > 0
}

/**
 * Hold the field off for as long as `active` is true and this component is mounted.
 *
 * Call it unconditionally at the top of a component and pass the condition — it is a
 * hook, so it cannot live behind an `if`.
 */
export function useSuppressField(active: boolean): void {
  const ctx = useContext(FieldSuppressionContext)
  // The context object is rebuilt on every count change, so depending on it directly
  // would release and re-acquire on every unrelated suppressor's change — a flicker
  // caused purely by bookkeeping.
  const ref = useRef(ctx)
  ref.current = ctx

  useEffect(() => {
    if (!active) return
    ref.current?.acquire()
    return () => ref.current?.release()
  }, [active])
}
