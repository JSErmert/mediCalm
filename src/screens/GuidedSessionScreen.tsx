import { useRef, useState } from 'react'
import type { SessionFeedback, HistoryEntry } from '../types'
import { useAppContext } from '../context/AppContext'
import { BreathingOrb } from '../components/BreathingOrb'
import { StepEmergence } from '../components/StepEmergence'
import { CompletionForm } from '../components/CompletionForm'
import { RoundDots } from '../components/RoundDots'
import { saveSession } from '../storage/sessionHistory'
import { deriveExpressionProfile } from '../engine/expressionProfile'
import styles from './GuidedSessionScreen.module.css'

/**
 * Authority: M2_SESSION_EXPERIENCE_SPEC.md
 *            M2.5 UX refinement pass
 *            Execution Spec (doc 04) § 5. Session Orchestration Engine
 *            Safety + Reassurance Spec (doc 06) § 2. Active Session Safety Interrupts
 */
type SessionPhase = 'breathing' | 'safety_interrupt' | 'completion' | 'stopped_completion'

export function GuidedSessionScreen() {
  const { state, dispatch } = useAppContext()
  const session = state.activeSession!

  const expressionProfile = deriveExpressionProfile(session)

  const [phase, setPhase] = useState<SessionPhase>('breathing')
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [orbRunning, setOrbRunning] = useState(true)

  // completedRounds tracks how many rounds have fully finished (for RoundDots)
  const [completedRounds, setCompletedRounds] = useState(0)

  const startTimeRef = useRef(Date.now())
  const elapsedAtStopRef = useRef(0)

  function getElapsedSeconds() {
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }

  function handleRoundComplete(roundNumber: number) {
    setCompletedRounds(roundNumber)
  }

  function handleAllRoundsComplete() {
    setPhase('completion')
  }

  function handleStopButtonPress() {
    const elapsed = getElapsedSeconds()
    if (elapsed < 20) {
      dispatch({ type: 'CLEAR_SESSION' })
      dispatch({ type: 'NAVIGATE', screen: 'home' })
    } else {
      elapsedAtStopRef.current = elapsed
      setShowStopConfirm(true)
    }
  }

  function handleConfirmStop() {
    setShowStopConfirm(false)
    setPhase('stopped_completion')
  }

  function handleCancelStop() {
    setShowStopConfirm(false)
  }

  function handleSafetyInterrupt() {
    setOrbRunning(false)
    setShowStopConfirm(false)
    setPhase('safety_interrupt')
  }

  function handleSafetyReturnHome() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleSave(feedback: SessionFeedback) {
    const elapsed = getElapsedSeconds()
    const entry: HistoryEntry = {
      session_id: session.session_id,
      timestamp: session.created_at,
      pain_before: feedback.pain_before,
      pain_after: feedback.pain_after,
      location_tags: session.pain_input.location_tags,
      symptom_tags: session.pain_input.symptom_tags,
      trigger_tag: session.pain_input.trigger_tag,
      selected_protocol_id: session.protocol_id,
      selected_protocol_name: session.protocol_name,
      result: feedback.result,
      change_markers: feedback.change_markers,
      session_status: 'completed',
      session_duration_seconds: elapsed,
    }
    saveSession(entry)
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleStoppedSave(feedback: SessionFeedback) {
    const elapsed = elapsedAtStopRef.current || getElapsedSeconds()
    const entry: HistoryEntry = {
      session_id: session.session_id,
      timestamp: session.created_at,
      pain_before: feedback.pain_before,
      pain_after: feedback.pain_after,
      location_tags: session.pain_input.location_tags,
      symptom_tags: session.pain_input.symptom_tags,
      trigger_tag: session.pain_input.trigger_tag,
      selected_protocol_id: session.protocol_id,
      selected_protocol_name: session.protocol_name,
      result: feedback.result,
      change_markers: [],
      session_status: 'user_stopped',
      session_duration_seconds: elapsed,
    }
    saveSession(entry)
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  const totalRounds = session.timing_profile.rounds
  // currentRound shown to user is completedRounds + 1 (which round they're on now)
  const currentDisplayRound = Math.min(completedRounds + 1, totalRounds)

  const cueText = session.cue_sequence[
    (currentDisplayRound - 1) % session.cue_sequence.length
  ]

  const emergenceSteps: [string, string, string] = [
    session.cue_sequence[0] ?? '',
    session.cue_sequence[1] ?? '',
    session.cue_sequence[2] ?? '',
  ]

  return (
    <main className={styles.screen}>
      {phase === 'breathing' && (
        <div className={styles.breathingPhase}>
          <header className={styles.topZone} aria-label="Protocol context">
            <p className={styles.protocolName}>{session.protocol_name}</p>
            <p className={styles.goalText}>{session.goal}</p>
            {/* Subtle numeric fallback — tertiary, not dominant */}
            <p className={styles.roundCounter} aria-label={`Round ${currentDisplayRound} of ${totalRounds}`}>
              {currentDisplayRound} / {totalRounds}
            </p>
          </header>

          <div className={styles.orbArea}>
            {orbRunning && (
              <BreathingOrb
                timingProfile={session.timing_profile}
                expressionProfile={expressionProfile}
                onRoundComplete={handleRoundComplete}
                onAllRoundsComplete={handleAllRoundsComplete}
                cueText={cueText}
              />
            )}
          </div>

          {/* Dot strip: primary round progress indicator, positioned below orb */}
          <div className={styles.dotsArea}>
            <RoundDots
              totalRounds={totalRounds}
              completedRounds={completedRounds}
            />
          </div>

          <div className={styles.emergenceArea}>
            <StepEmergence steps={emergenceSteps} />
          </div>

          <footer className={styles.sessionFooter}>
            <button
              className={styles.safetyButton}
              type="button"
              onClick={handleSafetyInterrupt}
              aria-label="I feel unwell — stop session"
            >
              I feel unwell
            </button>
            <button
              className={styles.stopButton}
              type="button"
              onClick={handleStopButtonPress}
              aria-label="Stop session"
            >
              Stop
            </button>
          </footer>
        </div>
      )}

      {phase === 'safety_interrupt' && (
        <div className={styles.safetyInterruptPhase} role="alert" aria-live="assertive">
          <p className={styles.safetyHeading}>Stop.</p>
          <p className={styles.safetyBody}>Exit carefully.</p>
          <p className={styles.safetySubtext}>
            If symptoms are severe or new, seek appropriate care before continuing.
          </p>
          <button
            className={styles.returnHomeButton}
            type="button"
            onClick={handleSafetyReturnHome}
          >
            Return home
          </button>
        </div>
      )}

      {phase === 'completion' && (
        <div className={styles.completionPhase}>
          <CompletionForm
            sessionId={session.session_id}
            painBefore={session.pain_input.pain_level}
            protocolId={session.protocol_id}
            onSave={handleSave}
          />
        </div>
      )}

      {phase === 'stopped_completion' && (
        <div className={styles.completionPhase}>
          <CompletionForm
            sessionId={session.session_id}
            painBefore={session.pain_input.pain_level}
            protocolId={session.protocol_id}
            onSave={handleStoppedSave}
            minimal
          />
        </div>
      )}

      {showStopConfirm && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Stop session confirmation">
          <div className={styles.confirmDialog}>
            <p className={styles.confirmText}>Stop this session?</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmStop}
                type="button"
                onClick={handleConfirmStop}
              >
                Stop
              </button>
              <button
                className={styles.confirmContinue}
                type="button"
                onClick={handleCancelStop}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
