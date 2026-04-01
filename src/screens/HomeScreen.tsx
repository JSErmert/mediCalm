/**
 * HomeScreen — entry point and session history.
 * Authority: M3.5.2 D4-B4 Deep Current — locked background identity system
 *            M3.4.1 mediCalm Homepage UI Contract (Direction 4: Breath Center)
 *            Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 *            Safety + Reassurance Spec (doc 06) § 9. Home / History Safety Behavior
 *
 * Visual system: Deep Current — underwater pressure field · hydrostatic elliptic rings ·
 *                radial guilloché rays · luminous centered orb · ping-based ring system
 *
 * "The home screen should feel like a calm history of care, not a dashboard of performance."
 * No streaks. No badges. No gamification. Worse/interrupted outcomes are labelled accurately.
 */
import { useEffect, useState } from 'react'
import type { HistoryEntry } from '../types'
import { loadHistory, deleteSession, updateSessionFeedback } from '../storage/sessionHistory'
import { hasUnvalidatedSession } from '../storage/bodyContext'
import { useAppContext } from '../context/AppContext'
import { isDevOverride } from '../utils/devFlags'
import { HistoryCard } from '../components/HistoryCard'
import { SessionCaseFile } from '../components/SessionCaseFile'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  const { dispatch } = useAppContext()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [devMode, setDevMode] = useState(isDevOverride())
  const [caseFileEntry, setCaseFileEntry] = useState<HistoryEntry | null>(null)

  function handleToggleDev() {
    if (devMode) {
      localStorage.removeItem('dev_override')
      setDevMode(false)
    } else {
      localStorage.setItem('dev_override', 'true')
      setDevMode(true)
    }
  }

  useEffect(() => {
    const stored = loadHistory()
    setHistory([...stored].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  }, [])

  function handleStart() {
    // M4.1 §18: If previous session is pending validation, show gate first.
    if (hasUnvalidatedSession()) {
      dispatch({ type: 'NAVIGATE', screen: 'session_validation' })
    } else {
      dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
    }
  }

  function handleDelete(sessionId: string) {
    deleteSession(sessionId)
    setHistory((prev) => prev.filter((e) => e.session_id !== sessionId))
  }

  function handleUpdate(
    sessionId: string,
    patch: Pick<Partial<HistoryEntry>, 'pain_after' | 'result' | 'change_markers'>
  ) {
    updateSessionFeedback(sessionId, patch)
    setHistory((prev) =>
      prev.map((e) => e.session_id === sessionId ? { ...e, ...patch } : e)
    )
  }

  return (
    <main className={styles.screen}>

      {/* ── Wordmark ────────────────────────────────────────────────── */}
      <div className={styles.wordmarkBar}>
        <span className={styles.wordmark}>mediCalm</span>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <h1 className={styles.headline}>Just Breathe.</h1>
        <p className={styles.sub}>
          Structured protocols for rib restriction, shallow breathing,
          neck and jaw tension, and protective overactivation —
          calibrated to your current intensity.
        </p>
      </div>

      {/* ── Idle orb ────────────────────────────────────────────────── */}
      <div className={styles.orbZone} aria-hidden="true">
        <div className={styles.orbField}>
          <div className={styles.orbRing} />
          <div className={styles.orbRing} />
          <div className={styles.orbRing} />
          <div className={styles.orbRing} />
          <div className={styles.orbGlow} />
          <div className={styles.orbSphere} />
        </div>
        <span className={styles.orbLabel}>ready</span>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div className={styles.ctaZone}>
        <button
          className={styles.startButton}
          onClick={handleStart}
          type="button"
          aria-label="Start a new guided session"
        >
          Begin session
        </button>
        <p className={styles.ctaSub}>Protocol calibrated to your intensity · approx. 4–6 min</p>
        <button
          type="button"
          className={styles.bodyContextLink}
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'body_context' })}
          aria-label="Manage Body Context"
        >
          Body Context
        </button>
      </div>

      {/* ── Session history ─────────────────────────────────────────── */}
      <section className={styles.history} aria-label="Session history">
        {history.length > 0 && (
          <div className={styles.historyDivider} aria-hidden="true">
            <div className={styles.historyDividerLine} />
            <span className={styles.historyLabel}>Past sessions</span>
            <div className={styles.historyDividerLine} />
          </div>
        )}

        {history.length === 0 ? (
          <p className={styles.emptyState}>
            No sessions yet. Start your first session above.
          </p>
        ) : (
          <ul className={styles.historyList} aria-label="Past sessions">
            {history.map((entry) => (
              <li key={entry.session_id}>
                <HistoryCard
                  entry={entry}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onViewCaseFile={setCaseFileEntry}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {caseFileEntry && (
        <SessionCaseFile
          entry={caseFileEntry}
          onClose={() => setCaseFileEntry(null)}
        />
      )}

      {/* ── Dev banner — R&D override control ───────────────────────── */}
      <div className={styles.devBanner} aria-hidden="true">
        <span className={styles.devBannerLabel}>R&amp;D</span>
        <span className={styles.devBannerText}>
          {devMode ? 'Safety override active — enables route to review screen' : 'Safety override off'}
        </span>
        <button
          className={`${styles.devBannerToggle} ${devMode ? styles.devBannerToggleOn : ''}`}
          type="button"
          onClick={handleToggleDev}
        >
          {devMode ? 'On' : 'Off'}
        </button>
      </div>

    </main>
  )
}
