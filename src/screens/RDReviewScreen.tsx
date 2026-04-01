/**
 * RDReviewScreen — M3.3.3
 *
 * Developer/R&D only. Never rendered in production.
 * Shown when a session is safety-blocked AND localStorage.dev_override === 'true'.
 *
 * Displays the full system state for the blocked session:
 *   - Safety notice + original flags
 *   - Complete intake summary
 *   - Interpretation layer output
 *   - Resolved session plan (protocol, timing, position)
 *
 * Actions:
 *   Return home    — clears session, exits normally
 *   Continue for R&D — builds dev session (with original safety flags preserved),
 *                      routes to session_setup (NOT directly to guided_session)
 */
import { useAppContext } from '../context/AppContext'
import { interpretSession } from '../engine/interpretationLayer'
import { buildDevSession } from '../engine/devOverride'
import { PROTOCOLS } from '../data/protocols'
import styles from './RDReviewScreen.module.css'

function formatTag(tag: string): string {
  return tag.replace(/_/g, '\u00a0')
}

export function RDReviewScreen() {
  const { state, dispatch } = useAppContext()
  const input = state.pendingPainInput
  const safety = state.safetyAssessment

  function handleReturnHome() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleContinue() {
    if (!input || !safety) return
    const session = buildDevSession(input, safety)
    dispatch({ type: 'SET_ACTIVE_SESSION', session })
    dispatch({ type: 'NAVIGATE', screen: 'session_setup' })
  }

  // Guard: both must be present (safety_stop flow always sets both before routing here)
  if (!input || !safety) {
    return (
      <main className={styles.screen}>
        <p className={styles.errorNote}>No session data available.</p>
        <button className={styles.returnButton} onClick={handleReturnHome} type="button">
          Return home
        </button>
      </main>
    )
  }

  const interpretation = interpretSession(input)
  const { pattern, modifiers, focus, breathingHint } = interpretation

  // Build the dev session only for display purposes (protocol + timing)
  const devSession = buildDevSession(input, safety)
  const protocolDef = PROTOCOLS.find((p) => p.protocol_id === devSession.protocol_id)

  // Separate also-present symptoms (safety-adjacent) from main symptoms
  const SAFETY_ADJACENT = new Set(['instability', 'coordination_change', 'weakness'])
  const mainSymptoms = input.symptom_tags.filter((t) => !SAFETY_ADJACENT.has(t))
  const alsoPresent = input.symptom_tags.filter((t) => SAFETY_ADJACENT.has(t))

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleReturnHome} type="button">
          ← Return home
        </button>
        <div>
          <h1 className={styles.title}>R&amp;D Review</h1>
          <p className={styles.devBadge}>Developer mode — not visible in production</p>
        </div>
      </header>

      <div className={styles.sections}>

        {/* ── Safety notice ──────────────────────────────────────────────── */}
        <section className={styles.section} aria-label="Safety notice">
          <h2 className={styles.sectionHeading}>Safety notice</h2>
          <p className={styles.safetyWarning}>This session would normally be blocked.</p>
          {safety.stop_reason && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Stop reason</span>
              <span className={styles.rowValue}>{safety.stop_reason}</span>
            </div>
          )}
          {safety.safety_tags.length > 0 && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Flags</span>
              <span className={styles.rowValue}>
                {safety.safety_tags.map(formatTag).join(' · ')}
              </span>
            </div>
          )}
        </section>

        {/* ── Intake summary ─────────────────────────────────────────────── */}
        <section className={styles.section} aria-label="Intake summary">
          <h2 className={styles.sectionHeading}>Intake</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Pain level</span>
            <span className={styles.rowValue}>{input.pain_level}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Locations</span>
            <span className={styles.rowValue}>
              {input.location_tags.map(formatTag).join(' · ') || '—'}
            </span>
          </div>
          {mainSymptoms.length > 0 && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Symptoms</span>
              <span className={styles.rowValue}>
                {mainSymptoms.map(formatTag).join(' · ')}
              </span>
            </div>
          )}
          {input.current_position && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Position</span>
              <span className={styles.rowValue}>{formatTag(input.current_position)}</span>
            </div>
          )}
          {input.trigger_tag && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Context</span>
              <span className={styles.rowValue}>{formatTag(input.trigger_tag)}</span>
            </div>
          )}
          {alsoPresent.length > 0 && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Also present</span>
              <span className={`${styles.rowValue} ${styles.safetyValue}`}>
                {alsoPresent.map(formatTag).join(' · ')}
              </span>
            </div>
          )}
          {input.user_note && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Note</span>
              <span className={styles.rowValue}>"{input.user_note}"</span>
            </div>
          )}
        </section>

        {/* ── Interpretation ─────────────────────────────────────────────── */}
        <section className={styles.section} aria-label="Interpretation">
          <h2 className={styles.sectionHeading}>Interpretation</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Pattern</span>
            <span className={styles.rowValue}>{formatTag(pattern)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Severity</span>
            <span className={styles.rowValue}>
              {modifiers.severity} · {modifiers.spread}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Focus</span>
            <span className={styles.rowValue}>{focus}</span>
          </div>
          {breathingHint && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Approach</span>
              <span className={styles.rowValue}>{breathingHint}</span>
            </div>
          )}
        </section>

        {/* ── Session plan ───────────────────────────────────────────────── */}
        <section className={styles.section} aria-label="Session plan">
          <h2 className={styles.sectionHeading}>Session plan</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Protocol</span>
            <span className={styles.rowValue}>{devSession.protocol_name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Goal</span>
            <span className={styles.rowValue}>{devSession.goal}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Timing</span>
            <span className={styles.rowValue}>
              {devSession.timing_profile.inhale_seconds}s inhale ·{' '}
              {devSession.timing_profile.exhale_seconds}s exhale ·{' '}
              {devSession.timing_profile.rounds} rounds
            </span>
          </div>
          {protocolDef?.support_mode && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Position</span>
              <span className={styles.rowValue}>{protocolDef.support_mode}</span>
            </div>
          )}
        </section>

      </div>

      <footer className={styles.footer}>
        <button className={styles.returnButton} onClick={handleReturnHome} type="button">
          Return home
        </button>
        <button className={styles.continueButton} onClick={handleContinue} type="button">
          Continue for R&amp;D →
        </button>
      </footer>
    </main>
  )
}
