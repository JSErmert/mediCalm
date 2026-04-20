/**
 * SADSafetyScreen — M6.1.1 SAD Safety Gate
 *
 * Appears when Sad is in state_entry. Brief boundary check only.
 * No, continue → session_intake (preserve state).
 * Yes → CLEAR_STATE_ENTRY → support_resources.
 * Back → state_selection (preserve selections).
 * Authority: M6.1.1 SAD Safety Screen spec (v2.1)
 */
import { useAppContext } from '../context/AppContext'
import styles from './SADSafetyScreen.module.css'

export function SADSafetyScreen() {
  const { dispatch } = useAppContext()

  function handleNo() {
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }

  function handleYes() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'support_resources' })
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  return (
    <main className={styles.screen} aria-label="SAD safety check">
      <button type="button" className={styles.back} onClick={handleBack} aria-label="Back to state selection">
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
