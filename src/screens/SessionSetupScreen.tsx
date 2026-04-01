/**
 * SessionSetupScreen — M2.5
 *
 * A brief orientation screen shown between pain input and the guided session.
 * Surfaces: protocol name, session goal, recommended support mode, and a Begin button.
 *
 * Design rules:
 * - One purpose: settle the user before the session starts
 * - No back navigation — user is committed to this session at this point
 * - Minimal text, calm layout, single primary action
 * - Expression profile is derived here so it's ready for GuidedSessionScreen
 *
 * Authority: M2.5 UX refinement pass
 *            Guided Session UI Spec (doc 05) § Entry Transition
 */
import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { PROTOCOLS } from '../data/protocols'
import { interpretSession } from '../engine/interpretationLayer'
import { getOrComputePatternSummary } from '../engine/hari/patternReader'
import { computeSessionInsights } from '../engine/hari/sessionInsights'
import { SessionInsightsPanel } from '../components/SessionInsightsPanel'
import styles from './SessionSetupScreen.module.css'

export function SessionSetupScreen() {
  const { state, dispatch } = useAppContext()
  const session = state.activeSession!

  // Look up the full protocol definition to get support_mode
  const protocolDef = PROTOCOLS.find((p) => p.protocol_id === session.protocol_id)
  const supportMode = protocolDef?.support_mode

  // Derive input-specific focus statement and optional breathing hint
  const { focus, breathingHint } = interpretSession(session.pain_input)

  // M5.4 — compute optional insights from pattern history (purely presentational)
  const insights = useMemo(() => {
    const summary = getOrComputePatternSummary()
    return computeSessionInsights(summary)
  }, [])

  function handleBegin() {
    dispatch({ type: 'NAVIGATE', screen: 'guided_session' })
  }

  return (
    <main className={styles.screen} aria-label="Session setup">
      <div className={styles.content}>
        <div className={styles.topLabel} aria-hidden="true">
          Ready to begin
        </div>

        <h1 className={styles.protocolName}>{session.protocol_name}</h1>

        <p className={styles.goal}>{session.goal}</p>

        <div className={styles.focusBlock} aria-label="Session focus">
          <span className={styles.focusLabel}>Focus</span>
          <span className={styles.focusValue}>{focus}</span>
        </div>

        {breathingHint && (
          <div className={styles.approachBlock} aria-label="Breathing approach">
            <span className={styles.approachLabel}>Approach</span>
            <span className={styles.approachValue}>{breathingHint}</span>
          </div>
        )}

        {supportMode && (
          <div className={styles.supportBlock} aria-label="Recommended position">
            <span className={styles.supportLabel}>Position</span>
            <span className={styles.supportValue}>{supportMode}</span>
          </div>
        )}

        <div className={styles.durationBlock} aria-label="Estimated session length">
          <span className={styles.durationLabel}>Length</span>
          <span className={styles.durationValue}>
            {Math.round(session.estimated_length_seconds / 60)} min ·{' '}
            {session.timing_profile.rounds} rounds
          </span>
        </div>

        {/* M5.4 — optional insights panel, secondary element, never blocking */}
        <SessionInsightsPanel insights={insights} />
      </div>

      <footer className={styles.footer}>
        <button
          className={styles.beginButton}
          type="button"
          onClick={handleBegin}
          aria-label="Begin guided session"
        >
          Begin
        </button>
      </footer>
    </main>
  )
}
