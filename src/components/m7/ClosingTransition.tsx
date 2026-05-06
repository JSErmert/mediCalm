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
