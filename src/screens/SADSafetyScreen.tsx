/**
 * SADSafetyScreen — M6.1.1 SAD Safety Gate
 *
 * Appears when Sad is in state_entry. Brief boundary check only.
 * PT Clinical Pass 2: entry point is HomeScreen, not mid-intake.
 * No, continue → home (preserve state, return to affordance).
 * Yes → CLEAR_STATE_ENTRY → support_resources.
 * Back → home (return to affordance).
 * Authority: M6.1.1 SAD Safety Screen spec (v2.2)
 */
import { useAppContext } from '../context/AppContext'
import styles from './SADSafetyScreen.module.css'

export function SADSafetyScreen() {
  const { dispatch } = useAppContext()

  function handleNo() {
    // PT Pass 2: SAD safety detached from intake flow; "No" returns home
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleYes() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'support_resources' })
  }

  function handleBack() {
    // PT Pass 2: entry point is HomeScreen, not state_selection
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen} aria-label="SAD safety check">
      <button type="button" className={styles.back} onClick={handleBack} aria-label="Back to home">
        ← Back
      </button>

      <div className={styles.content}>
        <h1 className={styles.heading}>Before we continue, a quick check</h1>
        <p className={styles.body}>
          Are you feeling persistently low — in a way that goes beyond today?
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.noCta} onClick={handleNo}>
            No, continue
          </button>
          <button type="button" className={styles.yesCta} onClick={handleYes}>
            Yes
          </button>
        </div>
      </div>
    </main>
  )
}
