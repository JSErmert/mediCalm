/**
 * ClosingTransition — 5s closing narration after the breath phase.
 *
 * STATUS at v0.2 (post-2026-05-06): UNUSED by live pathway library.
 * Pathway variants reverted to single-phase `[breath]` per operator UX call
 * (closing kept the user stuck instead of exiting; pre-M7 completion flow
 * already handles session exit cleanly). Component retained for advisor-
 * driven reintroduction at M7.3+ if clinically defensible.
 */
import { useEffect } from 'react'
import styles from './ClosingTransition.module.css'

type Props = {
  copy: string
  subtitle: string | undefined
  onComplete: () => void
}

export function ClosingTransition({ copy, subtitle, onComplete }: Props) {
  useEffect(() => {
    const id = setTimeout(onComplete, 5000)
    return () => clearTimeout(id)
  }, [onComplete])

  return (
    <div className={styles.container} role="region" aria-label="Session closing">
      <p className={styles.copy}>{copy}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
