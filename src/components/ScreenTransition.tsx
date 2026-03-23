/**
 * ScreenTransition — Framer Motion crossfade wrapper for screen changes.
 * Authority: Guided Session UI Spec (doc 05) § 2. Transition System
 *
 * Rules:
 * - crossfades only: 200–400ms, ease
 * - no bounce, no zoom, no slides, no dramatic effects
 * - persistent elements (orb, audio) should live outside this wrapper in M2+
 */
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScreenTransitionProps {
  children: ReactNode
  screenKey: string
}

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
}

export function ScreenTransition({ children, screenKey }: ScreenTransitionProps) {
  return (
    <motion.div
      key={screenKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {children}
    </motion.div>
  )
}
