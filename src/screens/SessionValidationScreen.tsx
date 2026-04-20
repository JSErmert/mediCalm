/**
 * SessionValidationScreen — M4.1 §18 Previous Session Validation Gate
 *
 * Appears when the user tries to start a new session and the most recent
 * session is still marked 'pending' validation.
 *
 * The user must either:
 *   - Keep the session (→ 'validated') — it counts in HARI history
 *   - Mark it as not valid (→ 'invalidated') — it is excluded from HARI history
 *
 * After resolution, the validation gate is cleared and the user proceeds
 * to SessionIntakeScreen.
 *
 * Authority: M4.1 §18, §19, §20, §21
 *   - Deletion horizon: current + 1-back failsafe only
 *   - Reversion: system reverts to prior valid state, does not recalculate
 *   - User-entered Body Context is never touched by validation resolution
 */
import { useEffect, useState } from 'react'
import type { HistoryEntry } from '../types'
import { getPendingValidationEntry, resolveSessionValidation } from '../storage/sessionHistory'
import { clearValidationGate } from '../storage/bodyContext'
import { useAppContext } from '../context/AppContext'
import styles from './SessionValidationScreen.module.css'

function formatDate(timestamp: string): string {
  const d = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Earlier today'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function resultLabel(result: HistoryEntry['result']): string {
  switch (result) {
    case 'better': return 'Felt better'
    case 'same': return 'About the same'
    case 'worse': return 'Felt worse'
    case 'interrupted': return 'Interrupted'
  }
}

function resultDotClass(result: HistoryEntry['result']): string {
  switch (result) {
    case 'better': return styles.resultDotBetter
    case 'worse': return styles.resultDotWorse
    case 'same': return styles.resultDotSame
    case 'interrupted': return styles.resultDotInterrupted
  }
}

export function SessionValidationScreen() {
  const { dispatch } = useAppContext()
  const [entry, setEntry] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    setEntry(getPendingValidationEntry())
  }, [])

  function handleKeep() {
    if (!entry) return
    resolveSessionValidation(entry.session_id, 'validated')
    clearValidationGate()
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  function handleInvalidate() {
    if (!entry) return
    resolveSessionValidation(entry.session_id, 'invalidated')
    clearValidationGate()
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // If no pending session (edge case), skip straight to intake
  if (entry === null) {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
    return null
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label="Back to home"
        >
          ← Back
        </button>
        <h1 className={styles.heading}>Before we start</h1>
      </header>

      <div className={styles.content}>
        <p className={styles.lead}>
          Your last session hasn't been reviewed yet. Does this session look right to you?
        </p>

        <div className={styles.sessionCard} role="region" aria-label="Previous session summary">
          <span className={styles.sessionMeta}>{formatDate(entry.timestamp)}</span>
          <span className={styles.sessionProtocol}>{entry.selected_protocol_name}</span>
          <span className={styles.sessionResult}>
            <span
              className={`${styles.resultDot} ${resultDotClass(entry.result)}`}
              aria-hidden="true"
            />
            {resultLabel(entry.result)}
            {typeof entry.pain_after === 'number' && (
              <> &middot; Pain after: {entry.pain_after}/10</>
            )}
          </span>
        </div>

        <p className={styles.question}>
          If something went wrong or the session was interrupted unexpectedly, you can mark it
          as not valid — it won't be used to personalize future sessions.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.actionPrimary}
          type="button"
          onClick={handleKeep}
        >
          Yes, keep this session
        </button>
        <button
          className={styles.actionSecondary}
          type="button"
          onClick={handleInvalidate}
        >
          Mark as not valid
        </button>
        <p className={styles.horizonNote}>
          This review only affects the most recent session.
        </p>
      </div>
    </main>
  )
}
