/**
 * SupportResourcesScreen — M6.1.1 Escalation Exit + Support Resources
 *
 * Reached via SADSafetyScreen "Yes". Shows pause message + 988 crisis line.
 * Return Home: CLEAR_STATE_ENTRY → navigate to home.
 * Authority: M6.1.1 SAD Safety Screen spec (v2.1)
 */
import { useAppContext } from '../context/AppContext'
import styles from './SupportResourcesScreen.module.css'

export function SupportResourcesScreen() {
  const { dispatch } = useAppContext()

  function handleReturnHome() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen} aria-label="Support resources">
      <div className={styles.content}>
        <h1 className={styles.heading}>Pause here for a moment</h1>
        <p className={styles.body}>
          This tool is designed for short-term regulation. What you're describing may
          benefit from more direct support.
        </p>
        <p className={styles.body}>
          If you can, consider reaching out to someone you trust or a professional resource.
        </p>

        <div className={styles.divider} />

        <p className={styles.resourcesLabel}>Support Resources</p>
        <p className={styles.resourceItem}>
          If you're in the U.S. and need immediate support, you can call or text{' '}
          <strong>988</strong> to reach the Suicide &amp; Crisis Lifeline.
        </p>
        <p className={styles.resourceItem}>
          If you're elsewhere, consider contacting a local crisis or mental health support service.
        </p>
      </div>

      <button type="button" className={styles.returnBtn} onClick={handleReturnHome}>
        Return Home
      </button>
    </main>
  )
}
