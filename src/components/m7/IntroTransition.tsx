import { useEffect, useRef } from 'react'
import styles from './IntroTransition.module.css'

type Props = {
  copy: string
  subtitle: string | undefined
  onComplete: () => void
}

export function IntroTransition({ copy, subtitle, onComplete }: Props) {
  const countRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let current = 5
    if (countRef.current) countRef.current.textContent = String(current)

    function tick() {
      current -= 1
      if (current <= 0) {
        if (countRef.current) countRef.current.textContent = ''
        onCompleteRef.current()
        return
      }
      if (countRef.current) countRef.current.textContent = String(current)
      id = setTimeout(tick, 1000)
    }

    let id = setTimeout(tick, 1000)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className={styles.container} role="region" aria-label="Session intro">
      <div className={styles.count} aria-live="polite" ref={countRef}>5</div>
      <p className={styles.copy}>{copy}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
