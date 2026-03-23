/**
 * SessionPlaceholder — M1 stub screen shown after pain input submission.
 *
 * This screen only exists to confirm the pain input was captured correctly
 * and that the state machine works end-to-end.
 *
 * It is fully replaced in M2 when the session engine and guided session UI are built.
 *
 * DO NOT add business logic here. Display only.
 */
import { useAppContext } from '../context/AppContext'
import styles from './SessionPlaceholder.module.css'

export function SessionPlaceholder() {
  const { state, dispatch } = useAppContext()
  const input = state.pendingPainInput

  function handleBack() {
    dispatch({ type: 'CLEAR_PAIN_INPUT' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <p className={styles.badge}>Milestone 1 complete</p>
        <p className={styles.message}>
          Session engine arrives in Milestone 2.
        </p>

        {input && (
          <div className={styles.summary} aria-label="Captured pain input">
            <Row label="Pain level" value={`${input.pain_level} / 10`} />
            <Row
              label="Regions"
              value={input.location_tags.map((t) => t.replace(/_/g, ' ')).join(', ')}
            />
            <Row
              label="Symptoms"
              value={input.symptom_tags.map((t) => t.replace(/_/g, ' ')).join(', ')}
            />
            {input.trigger_tag && (
              <Row label="Context" value={input.trigger_tag.replace(/_/g, ' ')} />
            )}
          </div>
        )}

        <button className={styles.backButton} onClick={handleBack} type="button">
          Back to home
        </button>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  )
}
