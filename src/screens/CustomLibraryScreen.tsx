/**
 * CustomLibraryScreen — first-class home for saved custom breathing sessions.
 * Authority: n4-screens custom experience (THE felt centerpiece)
 *
 * Run, rename, duplicate, delete. Delete always shows a session summary before
 * confirming. Past the soft limit the library warns but NEVER blocks. Running a
 * session queues it for the player, which re-validates its timing before playback.
 */
import { useState } from 'react'
import type { CustomSession, CustomTimingProfile } from '../types'
import { useAppContext } from '../context/AppContext'
import { buildCustomPhaseTimeline } from '../engine/custom/buildCustomPhaseTimeline'
import {
  loadCustomSessions,
  deleteCustomSession,
  renameCustomSession,
  duplicateCustomSession,
  SOFT_SESSION_WARN_LIMIT,
} from '../storage/customSessions'
import { GROUNDED_MESSAGES } from '../data/groundedMessages'
import styles from './CustomLibraryScreen.module.css'

// n5-crosscut movement mode: the walk affordance is the actionable form of the
// EXISTING, PT-attested gentle-movement recommendation. We surface that message's
// own text verbatim (no new clinical claim) as the honest framing for walking.
const GENTLE_MOVEMENT_LINE =
  GROUNDED_MESSAGES.find((m) => m.message_id === 'gentle_exercise_eases_sensitization')?.text ?? null

const PHASE_LABELS: Record<string, string> = {
  inhale: 'Inhale',
  hold_in: 'Hold in',
  exhale: 'Exhale',
  hold_out: 'Hold out',
}

function patternSummary(profile: CustomTimingProfile): string {
  const phases = buildCustomPhaseTimeline(profile)
    .map((p) => `${PHASE_LABELS[p.kind]} ${p.seconds}s`)
    .join(' · ')
  return `${phases}  ·  ${profile.cycles} cycle${profile.cycles === 1 ? '' : 's'}`
}

export function CustomLibraryScreen() {
  const { dispatch } = useAppContext()
  const [sessions, setSessions] = useState<CustomSession[]>(() => loadCustomSessions())
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<CustomSession | null>(null)

  function refresh() {
    setSessions(loadCustomSessions())
  }

  function handleRun(session: CustomSession) {
    dispatch({ type: 'SET_PENDING_CUSTOM', session })
    dispatch({ type: 'NAVIGATE', screen: 'custom_player' })
  }

  // n5-crosscut: run this composed session paired with walking. Same isolated
  // custom engine, glanceable playback, honest abbreviated close, CUSTOM entry.
  function handleWalk(session: CustomSession) {
    dispatch({ type: 'SET_PENDING_CUSTOM', session, walking: true })
    dispatch({ type: 'NAVIGATE', screen: 'custom_player' })
  }

  function startRename(session: CustomSession) {
    setRenamingId(session.id)
    setRenameValue(session.name)
  }

  function commitRename(id: string) {
    const trimmed = renameValue.trim()
    if (trimmed !== '') {
      renameCustomSession(id, trimmed)
      refresh()
    }
    setRenamingId(null)
  }

  function handleDuplicate(id: string) {
    duplicateCustomSession(id)
    refresh()
  }

  function confirmDelete() {
    if (!deleting) return
    deleteCustomSession(deleting.id)
    setDeleting(null)
    refresh()
  }

  const overSoftLimit = sessions.length > SOFT_SESSION_WARN_LIMIT

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
          aria-label="Back to home"
        >
          ← Home
        </button>
        <p className={styles.wordmark}>your sessions</p>
      </header>

      <h1 className={styles.title}>Your breathing</h1>
      <p className={styles.subtitle}>Sessions you have composed.</p>

      {/* n5-crosscut movement mode: honest framing for the Walk affordance.
          This is the attested gentle-movement recommendation made actionable —
          it adds no new claim, and never implies a given session reduced pain. */}
      {GENTLE_MOVEMENT_LINE && (
        <p className={styles.movementNote} role="note">
          Any session can be walked. {GENTLE_MOVEMENT_LINE} Tap <strong>Walk</strong> to pair one
          with gentle movement.
        </p>
      )}

      {overSoftLimit && (
        <p className={styles.softWarn} role="status">
          You have quite a few sessions saved. Consider tidying ones you no longer use.
        </p>
      )}

      <button
        type="button"
        className={styles.newButton}
        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'custom_builder' })}
      >
        + Compose a new session
      </button>

      {sessions.length === 0 ? (
        <p className={styles.empty}>
          No sessions yet. Compose one to build your own calm.
        </p>
      ) : (
        <ul className={styles.list} aria-label="Saved custom sessions">
          {sessions.map((session) => (
            <li key={session.id} className={styles.card}>
              {renamingId === session.id ? (
                <div className={styles.renameRow}>
                  <label className={styles.renameLabel} htmlFor={`rename-${session.id}`}>
                    Rename session
                  </label>
                  <input
                    id={`rename-${session.id}`}
                    type="text"
                    className={styles.renameInput}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    maxLength={60}
                    autoFocus
                  />
                  <div className={styles.renameActions}>
                    <button
                      type="button"
                      className={styles.smallPrimary}
                      onClick={() => commitRename(session.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className={styles.smallGhost}
                      onClick={() => setRenamingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.cardBody}>
                    <span className={styles.cardName}>{session.name}</span>
                    <span className={styles.cardPattern}>{patternSummary(session.profile)}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.runButton}
                      onClick={() => handleRun(session)}
                      aria-label={`Run ${session.name}`}
                    >
                      Run
                    </button>
                    <button
                      type="button"
                      className={styles.walkButton}
                      onClick={() => handleWalk(session)}
                      aria-label={`Walk with ${session.name}`}
                    >
                      Walk
                    </button>
                    <button
                      type="button"
                      className={styles.ghostAction}
                      onClick={() => startRename(session)}
                      aria-label={`Rename ${session.name}`}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className={styles.ghostAction}
                      onClick={() => handleDuplicate(session.id)}
                      aria-label={`Duplicate ${session.name}`}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className={styles.ghostAction}
                      onClick={() => setDeleting(session)}
                      aria-label={`Delete ${session.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ── Pre-delete summary confirmation ─────────────────────────────── */}
      {deleting && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm delete session">
          <div className={styles.dialog}>
            <h2 className={styles.dialogHeading}>Delete this session?</h2>
            <p className={styles.dialogName}>{deleting.name}</p>
            <p className={styles.dialogSummary}>{patternSummary(deleting.profile)}</p>
            <p className={styles.dialogNote}>This can’t be undone.</p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.dangerButton} onClick={confirmDelete}>
                Delete
              </button>
              <button
                type="button"
                className={styles.smallGhost}
                onClick={() => setDeleting(null)}
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
