/**
 * CustomCompletion — honest close for a user-composed breathing session.
 * Authority: n4-screens custom experience · MOVEMENT-HONESTY doctrine
 *
 * Carries only what is true: the session name, how many cycles completed, and an
 * optional freeform note. No efficacy language, no pain delta, no result verdict —
 * a custom session makes no clinical claim. Saving routes through
 * customSessionToHistoryEntry + saveCustomHistoryEntry (validation-exempt).
 */
import { useState } from 'react'
import styles from './CustomCompletion.module.css'

interface Props {
  sessionName: string
  cyclesCompleted: number
  cyclesPlanned: number
  /** True when the session ended early (stop) rather than running every cycle. */
  endedEarly?: boolean
  onSave: (note: string | undefined) => void
  onDismiss: () => void
}

export function CustomCompletion({
  sessionName,
  cyclesCompleted,
  cyclesPlanned,
  endedEarly = false,
  onSave,
  onDismiss,
}: Props) {
  const [note, setNote] = useState('')

  function handleSave() {
    const trimmed = note.trim()
    onSave(trimmed === '' ? undefined : trimmed)
  }

  const cycleLine =
    cyclesCompleted === 1
      ? '1 cycle'
      : `${cyclesCompleted} cycle${cyclesCompleted === 1 ? '' : 's'}`

  return (
    <div className={styles.completion}>
      <header className={styles.header}>
        <h2 className={styles.heading}>{endedEarly ? 'Session ended.' : 'Session complete.'}</h2>
        <p className={styles.sessionName}>{sessionName}</p>
      </header>

      <p className={styles.summary} aria-label={`You completed ${cycleLine} of ${cyclesPlanned}`}>
        <span className={styles.count}>{cyclesCompleted}</span>
        <span className={styles.countSep}>/</span>
        <span className={styles.planned}>{cyclesPlanned}</span>
        <span className={styles.countLabel}>cycles</span>
      </p>

      <section className={styles.section}>
        <label className={styles.noteLabel} htmlFor="custom-completion-note">
          Note (optional)
        </label>
        <textarea
          id="custom-completion-note"
          className={styles.noteInput}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything to remember about this session?"
          rows={2}
          maxLength={200}
          aria-label="Optional note about this session"
        />
      </section>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
        >
          Save to history
        </button>
        <button
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
        >
          Done without saving
        </button>
      </footer>
    </div>
  )
}
