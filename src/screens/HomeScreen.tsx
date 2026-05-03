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
import type { HistoryEntry, RuntimeSession } from '../types'
import { loadHistory, deleteSession, updateSessionFeedback } from '../storage/sessionHistory'
import { hasUnvalidatedSession } from '../storage/bodyContext'
import { useAppContext } from '../context/AppContext'
import { isDevOverride } from '../utils/devFlags'
import { HistoryCard } from '../components/HistoryCard'
import { SessionCaseFile } from '../components/SessionCaseFile'
import { YourPatternsPanel } from '../components/YourPatternsPanel'
import { buildContinueWhatHelpedSession } from '../engine/hari/continueWhatHelped'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  const { dispatch } = useAppContext()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [devMode, setDevMode] = useState(isDevOverride())
  const [caseFileEntry, setCaseFileEntry] = useState<HistoryEntry | null>(null)
  const [showContinue, setShowContinue] = useState(false)
  const [continueConfirmed, setContinueConfirmed] = useState(false)

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
    const sorted = [...stored].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    setHistory(sorted)
    if (sorted.length > 0) {
      setShowContinue(true)
    }
  }, [])

  function handleStart() {
    // M6.2: All new sessions enter via state selection.
    // Session validation gate is preserved — if unvalidated session exists, gate first.
    if (hasUnvalidatedSession()) {
      dispatch({ type: 'NAVIGATE', screen: 'session_validation' })
    } else {
      dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
    }
  }

  function handleContinueWhatHelped() {
    const { prescription } = buildContinueWhatHelpedSession()

    // Build a minimal synthetic RuntimeSession so GuidedSessionScreen can run
    // and save the session to history via its existing completion flow.
    const roundEstimate = Math.max(1, Math.round(
      prescription.durationSeconds /
      (prescription.inhaleSeconds + prescription.holdSeconds + prescription.exhaleSeconds)
    ))
    const syntheticSession: RuntimeSession = {
      session_id: `cwh_${Date.now()}`,
      created_at: new Date().toISOString(),
      protocol_id: prescription.family,
      protocol_name: prescription.sessionName,
      goal: prescription.openingPrompt,
      display_mode: 'breath_only',
      timing_profile: {
        inhale_seconds: prescription.inhaleSeconds,
        exhale_seconds: prescription.exhaleSeconds,
        rounds: roundEstimate,
      },
      cue_sequence: [],
      estimated_length_seconds: prescription.durationSeconds,
      status: 'completed',
      stop_conditions: [],
      allowed_follow_up: [],
      provenance_tags: [],
      pain_input: { pain_level: 0, location_tags: [], symptom_tags: [] },
      safety_assessment: { mode: 'DIRECT_SESSION_MODE', safety_tags: [], stop_reason: null },
    }

    dispatch({ type: 'SET_ACTIVE_SESSION', session: syntheticSession })
    dispatch({ type: 'SET_BREATH_PRESCRIPTION', prescription })
    setContinueConfirmed(true)
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', screen: 'guided_session' })
    }, 900)
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
          Structured breathing protocol addressing ribcage compression
          (limited rib expansion), deviated breathing mechanics, neck,
          shoulder, and jaw tension, and protective muscle overactivation —
          calibrated specifically to your current intensity level.
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
        <p className={styles.ctaSub}>Calibrated to your current intensity level · approx. 4–6 min</p>

        <div className={styles.contextRow}>
          <button
            type="button"
            className={styles.yourStateCard}
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'body_context' })}
            aria-label="Manage Your State"
          >
            <span className={styles.contextCardLabel}>Your State</span>
            <span className={styles.contextCardSub}>Body notes &amp; context</span>
            <span className={styles.contextCardHint}>Input relevant information about your current state</span>
          </button>
          <div className={styles.yourPatternsCard}>
            <YourPatternsPanel />
          </div>
        </div>

        {showContinue && (
          <div className={styles.continueZone}>
            {continueConfirmed ? (
              <p className={styles.continueConfirm}>We'll start with what's been helping</p>
            ) : (
              <button
                type="button"
                className={styles.continueCard}
                onClick={handleContinueWhatHelped}
                aria-label="Continue what helped in recent sessions"
              >
                <span className={styles.continueCardTitle}>Continue What Helped</span>
                <span className={styles.continueCardSub}>Based on what helped recently</span>
              </button>
            )}
          </div>
        )}
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
