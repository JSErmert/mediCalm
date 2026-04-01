/**
 * RoundDots — M2.5.8
 *
 * Three dot states:
 *   completed  — breath done this session pass (fully filled)
 *   active     — breath currently in progress (slightly more prominent than empty)
 *   empty      — breath not yet started (dim)
 *
 * Dots activate at breath START, not end, via the `currentRound` prop.
 * Authority: M2.5 UX refinement pass, M2.5.8 progress fidelity
 */
import { motion, useReducedMotion } from 'framer-motion'
import styles from './RoundDots.module.css'

interface Props {
  totalRounds: number
  completedRounds: number
  /** 1-based index of the breath currently in progress. 0 during entry countdown. */
  currentRound: number
}

export function RoundDots({ totalRounds, completedRounds, currentRound }: Props) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={styles.container} aria-hidden="true" role="presentation">
      {Array.from({ length: totalRounds }, (_, i) => {
        const completed = i < completedRounds
        const active = !completed && i === currentRound - 1

        const targetOpacity = completed ? 1 : active ? 0.7 : 0.22

        return (
          <motion.span
            key={i}
            className={`${styles.dot} ${completed ? styles.filled : active ? styles.active : styles.empty}`}
            animate={prefersReducedMotion ? {} : { opacity: targetOpacity }}
            initial={{ opacity: targetOpacity }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
