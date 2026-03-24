import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './StepEmergence.module.css'

interface Props {
  steps: [string, string, string]
}

export function StepEmergence({ steps }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    const t2 = setTimeout(() => setVisibleCount(2), 3000)
    const t3 = setTimeout(() => setVisibleCount(3), 6000)
    return () => {
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <ol className={styles.list} aria-label="Session guidance steps">
      {steps.map((text, i) => {
        const stepNum = i + 1
        const isVisible = stepNum <= visibleCount
        const isDimmed = isVisible && stepNum < visibleCount

        return (
          <motion.li
            key={stepNum}
            className={styles.step}
            initial={prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, filter: 'blur(3px)' }
            }
            animate={
              isVisible
                ? prefersReducedMotion
                  ? { opacity: isDimmed ? 0.55 : 1 }
                  : { opacity: isDimmed ? 0.55 : 1, filter: 'blur(0px)' }
                : prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, filter: 'blur(3px)' }
            }
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.38, ease: 'easeOut' }}
          >
            {text}
          </motion.li>
        )
      })}
    </ol>
  )
}
