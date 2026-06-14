/**
 * BetweenTransition — narrated 5s pause between phases.
 *
 * STATUS at v0.2 (post-2026-05-06): UNUSED by live pathway library (variants
 * are single-phase `[breath]`, so no between-phase boundaries exist). Retained
 * for advisor-driven reintroduction at M7.3+ once multi-phase variants
 * (e.g. position_hold + breath sequences) are clinically defensible.
 */
import { useEffect } from 'react'
import styles from './BetweenTransition.module.css'

type Props = {
  copy: string
  subtitle: string | undefined
  onComplete: () => void
}

export function BetweenTransition({ copy, subtitle, onComplete }: Props) {
  useEffect(() => {
    const id = setTimeout(onComplete, 5000)
    return () => clearTimeout(id)
  }, [onComplete])

  return (
    <div className={styles.container} role="region" aria-label="Phase transition">
      <p className={styles.copy}>{copy}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
