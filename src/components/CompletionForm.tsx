import { useState } from 'react'
import type { SessionFeedback } from '../types'
import { CHANGE_MARKERS } from '../types/taxonomy'
import { PainSlider } from './PainSlider'
import { TagSelector } from './TagSelector'
import styles from './CompletionForm.module.css'

interface Props {
  sessionId: string
  painBefore: number
  onSave: (feedback: SessionFeedback) => void
  /** When true: hide change markers + note. Used for user_stopped path. */
  minimal?: boolean
}

type ResultOption = 'better' | 'same' | 'worse'

const RESULT_OPTIONS: { value: ResultOption; label: string }[] = [
  { value: 'better', label: 'Better' },
  { value: 'same',   label: 'Same'   },
  { value: 'worse',  label: 'Worse'  },
]

export function CompletionForm({ sessionId, painBefore, onSave, minimal = false }: Props) {
  const [painAfter, setPainAfter] = useState(painBefore)
  const [result, setResult] = useState<ResultOption | null>(null)
  const [changeMarkers, setChangeMarkers] = useState<string[]>([])
  const [note, setNote] = useState('')

  function toggleMarker(tag: string) {
    setChangeMarkers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSave() {
    if (!result) return
    onSave({
      session_id: sessionId,
      pain_before: painBefore,
      pain_after: painAfter,
      result,
      change_markers: changeMarkers,
      ...(note.trim() !== '' && { note: note.trim() }),
    })
  }

  return (
    <div className={styles.form}>
      <header className={styles.header}>
        <h2 className={styles.heading}>Session complete.</h2>
        <p className={styles.subtext}>Notice what changed.</p>
      </header>

      <section className={styles.section} aria-label="Pain level after session">
        <PainSlider value={painAfter} onChange={setPainAfter} />
      </section>

      <section className={styles.section} aria-label="How do you feel?">
        <p className={styles.sectionLabel}>How do you feel?</p>
        <div className={styles.resultButtons} role="group" aria-label="Session result">
          {RESULT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.resultButton} ${result === value ? styles.active : ''}`}
              onClick={() => setResult(value)}
              aria-pressed={result === value}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {!minimal && (
        <section className={styles.section}>
          <TagSelector
            tags={CHANGE_MARKERS}
            selected={changeMarkers}
            onToggle={toggleMarker}
            label="What changed? (optional)"
          />
        </section>
      )}

      {!minimal && (
        <section className={styles.section}>
          <label className={styles.noteLabel} htmlFor="completion-note">
            Note (optional)
          </label>
          <textarea
            id="completion-note"
            className={styles.noteInput}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything to note?"
            rows={2}
            maxLength={200}
            aria-label="Optional completion note"
          />
        </section>
      )}

      <footer className={styles.footer}>
        <button
          className={styles.saveButton}
          type="button"
          onClick={handleSave}
          disabled={result === null}
          aria-disabled={result === null}
        >
          Save and finish
        </button>
      </footer>
    </div>
  )
}
