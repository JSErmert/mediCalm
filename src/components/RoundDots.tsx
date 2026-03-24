/**
 * RoundDots — M2.5
 *
 * Peripheral round-progress indicator. A row of small dots that fill as rounds complete.
 * Primary progress signal. Positions below the orb. No labels, no numbers.
 *
 * Design rules:
 * - Must not compete visually with the orb or countdown
 * - Peripheral — readable in the corner of vision, not demanding attention
 * - Reduced motion: still renders; opacity change instead of fill animation
 *
 * Authority: M2.5 UX refinement pass
 */
import { motion, useReducedMotion } from 'framer-motion'
import styles from './RoundDots.module.css'

interface Props {
  totalRounds: number
  completedRounds: number
}

export function RoundDots({ totalRounds, completedRounds }: Props) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={styles.container}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: totalRounds }, (_, i) => {
        const filled = i < completedRounds
        return (
          <motion.span
            key={i}
            className={`${styles.dot} ${filled ? styles.filled : styles.empty}`}
            animate={prefersReducedMotion ? {} : { opacity: filled ? 1 : 0.28 }}
            initial={{ opacity: filled ? 1 : 0.28 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
