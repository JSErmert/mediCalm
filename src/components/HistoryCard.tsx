/**
 * HistoryCard — single session history entry with edit + delete controls.
 * Authority: Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 *            Safety + Reassurance Spec (doc 06) § 9. Home / History Safety Behavior
 *            M2.5 UX refinement pass — history controls
 *
 * Safety rule: worse/interrupted results must NOT use celebratory styling.
 * History is a record of care, not a performance dashboard.
 *
 * Edit controls: pain_after, result, change_markers only.
 * Original intake data (pain_before, location/symptom tags, protocol) is immutable.
 */
import { useState } from 'react'
import type { HistoryEntry, SessionResult } from '../types'
import { CHANGE_MARKERS } from '../types/taxonomy'
import { PainSlider } from './PainSlider'
import styles from './HistoryCard.module.css'

interface HistoryCardProps {
  entry: HistoryEntry
  onDelete?: (sessionId: string) => void
  onUpdate?: (
    sessionId: string,
    patch: Pick<Partial<HistoryEntry>, 'pain_after' | 'result' | 'change_markers'>
  ) => void
}

const RESULT_LABELS: Record<HistoryEntry['result'], string> = {
  better:      'Helped',
  same:        'No clear change',
  worse:       'Worse',
  interrupted: 'Interrupted',
}

type CardMode = 'view' | 'menu' | 'confirm_delete' | 'edit'

const RESULT_OPTIONS: { value: SessionResult; label: string }[] = [
  { value: 'better', label: 'Better' },
  { value: 'same',   label: 'Same'   },
  { value: 'worse',  label: 'Worse'  },
]

export function HistoryCard({ entry, onDelete, onUpdate }: HistoryCardProps) {
  const [mode, setMode] = useState<CardMode>('view')

  // Edit form state — initialised from entry when edit mode opens
  const [editPainAfter, setEditPainAfter] = useState(entry.pain_after)
  const [editResult, setEditResult] = useState<SessionResult>(entry.result)
  const [editMarkers, setEditMarkers] = useState<string[]>(entry.change_markers)

  const date = new Date(entry.timestamp)
  const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })

  function openEdit() {
    // Reset to current entry values
    setEditPainAfter(entry.pain_after)
    setEditResult(entry.result)
    setEditMarkers(entry.change_markers)
    setMode('edit')
  }

  function toggleEditMarker(tag: string) {
    setEditMarkers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSaveEdit() {
    onUpdate?.(entry.session_id, {
      pain_after: editPainAfter,
      result: editResult,
      change_markers: editMarkers,
    })
    setMode('view')
  }

  function handleConfirmDelete() {
    onDelete?.(entry.session_id)
  }

  const hasControls = onDelete || onUpdate

  return (
    <article
      className={`${styles.card} ${mode === 'edit' ? styles.editing : ''}`}
      aria-label={`Session from ${dateLabel} at ${timeLabel}`}
    >
      {/* ── View mode ─────────────────────────────────── */}
      {(mode === 'view' || mode === 'menu' || mode === 'confirm_delete') && (
        <>
          <header className={styles.header}>
            <span className={styles.time}>{dateLabel} · {timeLabel}</span>
            <div className={styles.headerRight}>
              <span className={`${styles.result} ${styles[entry.result]}`}>
                {RESULT_LABELS[entry.result]}
              </span>
              {hasControls && (
                <button
                  className={styles.menuButton}
                  type="button"
                  onClick={() => setMode(mode === 'menu' ? 'view' : 'menu')}
                  aria-label="Session options"
                  aria-expanded={mode === 'menu'}
                >
                  ···
                </button>
              )}
            </div>
          </header>

          {mode === 'menu' && (
            <div className={styles.inlineMenu} role="group" aria-label="Session actions">
              {onUpdate && (
                <button className={styles.menuAction} type="button" onClick={openEdit}>
                  Edit feedback
                </button>
              )}
              {onDelete && (
                <button
                  className={`${styles.menuAction} ${styles.menuActionDelete}`}
                  type="button"
                  onClick={() => setMode('confirm_delete')}
                >
                  Delete
                </button>
              )}
              <button
                className={`${styles.menuAction} ${styles.menuActionCancel}`}
                type="button"
                onClick={() => setMode('view')}
              >
                Cancel
              </button>
            </div>
          )}

          {mode === 'confirm_delete' && (
            <div className={styles.inlineConfirm} role="group" aria-label="Confirm delete">
              <p className={styles.confirmText}>Remove this session?</p>
              <div className={styles.confirmActions}>
                <button
                  className={`${styles.menuAction} ${styles.menuActionDelete}`}
                  type="button"
                  onClick={handleConfirmDelete}
                >
                  Remove
                </button>
                <button
                  className={`${styles.menuAction} ${styles.menuActionCancel}`}
                  type="button"
                  onClick={() => setMode('view')}
                >
                  Keep
                </button>
              </div>
            </div>
          )}

          {mode === 'view' && (
            <>
              <div className={styles.body}>
                <span
                  className={styles.pain}
                  aria-label={`Pain ${entry.pain_before} before, ${entry.pain_after} after`}
                >
                  {entry.pain_before} → {entry.pain_after}
                </span>
                <span className={styles.protocol}>{entry.selected_protocol_name}</span>
              </div>

              <footer className={styles.tags}>
                {[...entry.location_tags.slice(0, 2), ...entry.symptom_tags.slice(0, 2)].map((t) => (
                  <span key={t} className={styles.tag}>
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </footer>
            </>
          )}
        </>
      )}

      {/* ── Edit mode ─────────────────────────────────── */}
      {mode === 'edit' && (
        <div className={styles.editForm}>
          <p className={styles.editHeading}>Edit feedback</p>
          <p className={styles.editSubtext}>{dateLabel} · {entry.selected_protocol_name}</p>

          <div className={styles.editSection}>
            <PainSlider value={editPainAfter} onChange={setEditPainAfter} />
          </div>

          <div className={styles.editSection}>
            <p className={styles.editLabel}>How did it go?</p>
            <div className={styles.editResultButtons} role="group">
              {RESULT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.editResultBtn} ${editResult === value ? styles.editResultActive : ''}`}
                  onClick={() => setEditResult(value)}
                  aria-pressed={editResult === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {entry.session_status !== 'user_stopped' && (
            <div className={styles.editSection}>
              <p className={styles.editLabel}>What changed? (optional)</p>
              <div className={styles.editMarkers}>
                {CHANGE_MARKERS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.editMarkerTag} ${editMarkers.includes(tag) ? styles.editMarkerActive : ''}`}
                    onClick={() => toggleEditMarker(tag)}
                    aria-pressed={editMarkers.includes(tag)}
                  >
                    {tag.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.editActions}>
            <button
              className={styles.editSave}
              type="button"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className={styles.editCancel}
              type="button"
              onClick={() => setMode('view')}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
