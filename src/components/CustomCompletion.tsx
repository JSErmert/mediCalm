/**
 * CustomCompletion — honest close for a user-composed breathing session.
 * Authority: n4-screens custom experience · MOVEMENT-HONESTY doctrine
 *
 * Carries only what is true: the session name, how many cycles completed, and an
 * optional freeform note. No efficacy language, no pain delta, no result verdict —
 * a custom session makes no clinical claim. Saving routes through
 * customSessionToHistoryEntry + saveCustomHistoryEntry (validation-exempt).
 *
 * n5-crosscut — movement (walking) variant: when `walkingMode` is true the close
 * is ABBREVIATED for hands-free treadmill use. It asks only for the user's own
 * observation (how it felt for you) and an optional self-reported pace; it NEVER
 * implies the movement helped, reduced pain, or produced any outcome. The pace is
 * a personal tag, not an efficacy field.
 */
import { useState } from 'react'
import type { WalkingSpeedTag } from '../types'
import styles from './CustomCompletion.module.css'

/** What the user reports at close. walkingSpeedTag is only offered in movement mode. */
export interface CustomCompletionResult {
  note?: string
  walkingSpeedTag?: WalkingSpeedTag
}

interface Props {
  sessionName: string
  cyclesCompleted: number
  cyclesPlanned: number
  /** True when the session ended early (stop) rather than running every cycle. */
  endedEarly?: boolean
  /** n5-crosscut: render the abbreviated, hands-free movement close. */
  walkingMode?: boolean
  onSave: (result: CustomCompletionResult) => void
  onDismiss: () => void
}

const WALKING_SPEEDS: { value: WalkingSpeedTag; label: string }[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'brisk', label: 'Brisk' },
]

export function CustomCompletion({
  sessionName,
  cyclesCompleted,
  cyclesPlanned,
  endedEarly = false,
  walkingMode = false,
  onSave,
  onDismiss,
}: Props) {
  const [note, setNote] = useState('')
  const [speed, setSpeed] = useState<WalkingSpeedTag | null>(null)

  function handleSave() {
    const trimmed = note.trim()
    onSave({
      ...(trimmed !== '' && { note: trimmed }),
      ...(walkingMode && speed !== null && { walkingSpeedTag: speed }),
    })
  }

  const cycleLine =
    cyclesCompleted === 1
      ? '1 cycle'
      : `${cyclesCompleted} cycle${cyclesCompleted === 1 ? '' : 's'}`

  // ── Movement (walking) variant — abbreviated, one tap to save ───────────────
  if (walkingMode) {
    return (
      <div className={styles.completion}>
        <header className={styles.header}>
          <h2 className={styles.heading}>{endedEarly ? 'Walk ended.' : 'Movement complete.'}</h2>
          <p className={styles.sessionName}>{sessionName}</p>
        </header>

        {/* Personal observation only — never asserts the walk helped (MOVEMENT-HONESTY). */}
        <p className={styles.observationPrompt}>How did it feel for you?</p>

        <section className={styles.section} aria-label="Your walking pace (optional)">
          <span className={styles.noteLabel} id="walking-pace-label">
            Pace (optional)
          </span>
          <div className={styles.speedGroup} role="group" aria-labelledby="walking-pace-label">
            {WALKING_SPEEDS.map(({ value, label }) => {
              const isSelected = speed === value
              return (
                <button
                  key={value}
                  type="button"
                  className={`${styles.speedChip} ${isSelected ? styles.speedChipSelected : ''}`}
                  aria-pressed={isSelected}
                  // Tapping a selected pace clears it — the tag stays optional.
                  onClick={() => setSpeed((prev) => (prev === value ? null : value))}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.noteLabel} htmlFor="movement-completion-note">
            Note (optional)
          </label>
          <textarea
            id="movement-completion-note"
            className={styles.noteInput}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How it felt for you — anything worth remembering."
            rows={2}
            maxLength={200}
            aria-label="Optional note about how the movement felt for you"
          />
        </section>

        <footer className={styles.footer}>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            Save to history
          </button>
          <button type="button" className={styles.dismissButton} onClick={onDismiss}>
            Done without saving
          </button>
        </footer>
      </div>
    )
  }

  // ── Standard custom close (unchanged) ───────────────────────────────────────
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
