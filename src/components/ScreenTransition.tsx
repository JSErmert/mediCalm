/**
 * ScreenTransition — Framer Motion crossfade wrapper for screen changes.
 * Authority: Guided Session UI Spec (doc 05) § 2. Transition System
 *            M2.5.6 Calm Transition Refinement
 *
 * Asymmetric crossfade: exit fades cleanly (280ms), enter materialises
 * gently (420ms). Total ~700ms — deliberate, calm, not sluggish.
 * Pure opacity only. No translate, no scale, no slides.
 */
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScreenTransitionProps {
  children: ReactNode
  screenKey: string
}

// Ease-out for exit: quick, clean lift-away
const EXIT_EASE = [0.4, 0.0, 1.0, 1.0] as const
// Ease-in for enter: gentle, slow materialise
const ENTER_EASE = [0.0, 0.0, 0.4, 1.0] as const

export function ScreenTransition({ children, screenKey }: ScreenTransitionProps) {
  return (
    <motion.div
      key={screenKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.42, ease: ENTER_EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.28, ease: EXIT_EASE } }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {children}
    </motion.div>
  )
}
