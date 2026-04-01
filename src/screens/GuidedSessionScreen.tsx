import { useRef, useState } from 'react'
import type { SessionFeedback, HistoryEntry } from '../types'
import type { ReassessmentResponse, ContinuationAction, PersistedReassessmentResult, PersistedHariMetadata } from '../types/hari'
import { useAppContext } from '../context/AppContext'
import { BreathingOrb } from '../components/BreathingOrb'
import { CompletionForm } from '../components/CompletionForm'
import { RoundDots } from '../components/RoundDots'
import { saveSession } from '../storage/sessionHistory'
import { deriveExpressionProfile } from '../engine/expressionProfile'
import { decideContinuation } from '../engine/hari/reassessmentLoop'
import styles from './GuidedSessionScreen.module.css'

/**
 * Authority: M2_SESSION_EXPERIENCE_SPEC.md
 *            M2.5 UX refinement pass
 *            Execution Spec (doc 04) § 5. Session Orchestration Engine
 *            Safety + Reassurance Spec (doc 06) § 2. Active Session Safety Interrupts
 *            M4.6 — Reassessment Loop Contract
 */
type SessionPhase = 'breathing' | 'reassessment' | 'safety_interrupt' | 'completion' | 'stopped_completion'

const REASSESSMENT_OPTIONS: { value: ReassessmentResponse; label: string }[] = [
  { value: 'better', label: 'Better' },
  { value: 'same', label: 'About the same' },
  { value: 'worse', label: 'Worse' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'unclear', label: 'Not sure' },
]

export function GuidedSessionScreen() {
  const { state, dispatch } = useAppContext()
  const session = state.activeSession!

  const expressionProfile = deriveExpressionProfile(session)

  // M4.6 — HARI round tracking
  const maxHariRounds = session.hari_metadata?.max_rounds ?? 1
  const [hariRoundNumber, setHariRoundNumber] = useState(1)
  // nextRoundBreathCount: can be shortened by continuation decision
  const [nextRoundBreathCount, setNextRoundBreathCount] = useState(
    session.hari_metadata?.round_plan.breath_count ?? session.timing_profile.rounds
  )
  // M4.6.1 — selected response (null until user picks one)
  const [selectedResponse, setSelectedResponse] = useState<ReassessmentResponse | null>(null)
  // M4.7 — accumulated reassessment history across all rounds this session
  const [reassessmentHistory, setReassessmentHistory] = useState<PersistedReassessmentResult[]>([])

  const [phase, setPhase] = useState<SessionPhase>('breathing')
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [orbRunning, setOrbRunning] = useState(true)

  // completedRounds tracks how many rounds have fully finished (for RoundDots)
  const [completedRounds, setCompletedRounds] = useState(0)
  // orbKey increments to force-remount BreathingOrb on "Continue session"
  const [orbKey, setOrbKey] = useState(0)

  // M4.6: current round timing profile — overrides rounds with M4.6 breath count
  const currentTimingProfile = {
    ...session.timing_profile,
    rounds: nextRoundBreathCount,
  }

  const startTimeRef = useRef(Date.now())
  const elapsedAtStopRef = useRef(0)

  function getElapsedSeconds() {
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }

  function handleRoundComplete(roundNumber: number) {
    setCompletedRounds(roundNumber)
  }

  function handleAllRoundsComplete() {
    // M4.6: if HARI session and more rounds allowed, go to reassessment
    if (session.hari_metadata && hariRoundNumber < maxHariRounds) {
      setOrbRunning(false)
      setPhase('reassessment')
    } else {
      setPhase('completion')
    }
  }

  // M4.6.1 — Step 2: store response only, do NOT auto-advance (§2, §4)
  function handleSelectResponse(response: ReassessmentResponse) {
    setSelectedResponse(response)
  }

  // M4.6.1 — Step 3a: user explicitly chooses Continue
  function handleContinueRound() {
    if (!selectedResponse) return

    // Compute recommended action — used for round adaptation, not enforced
    const decision = decideContinuation(
      selectedResponse,
      hariRoundNumber,
      maxHariRounds,
      session.hari_metadata!.intervention
    )

    // M4.7: record this round's reassessment result before advancing
    setReassessmentHistory((h) => [
      ...h,
      {
        round_number: hariRoundNumber,
        response: selectedResponse,
        recommended_action: decision.recommended_action,
        user_selected_action: 'continue',
      },
    ])

    // Derive the safe effective action for continuation:
    // If user overrides a stop recommendation (e.g. worse but chose Continue),
    // protect by softening rather than escalating (M4.6.1 §10, M4.6 §13 spirit).
    const effectiveAction: ContinuationAction =
      selectedResponse === 'worse'
        ? 'continue_softer'
        : decision.recommended_action === 'stop' || decision.recommended_action === 'pause'
        ? 'continue_softer'
        : decision.recommended_action

    const nextCount =
      effectiveAction === 'shorten_next'
        ? Math.max(10, Math.floor(nextRoundBreathCount / 2))
        : nextRoundBreathCount

    setNextRoundBreathCount(nextCount)
    setHariRoundNumber((r) => r + 1)
    setSelectedResponse(null)
    setCompletedRounds(0)
    setOrbKey((k) => k + 1)
    setOrbRunning(true)
    setPhase('breathing')
  }

  // M4.6.1 — Step 3b: user explicitly chooses Finish & Save
  function handleFinishAndSave() {
    // M4.7: record this round's reassessment result (user chose to finish)
    if (selectedResponse && session.hari_metadata && currentDecision) {
      setReassessmentHistory((h) => [
        ...h,
        {
          round_number: hariRoundNumber,
          response: selectedResponse,
          recommended_action: currentDecision.recommended_action,
          user_selected_action: 'finish',
        },
      ])
    }
    setSelectedResponse(null)
    setPhase('completion')
  }

  // M4.6.1 — Step 3c: user explicitly chooses Exit & Discard (always available, §5)
  function handleExitAndDiscard() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // M4.7.2 §5 Rule 3 — Discard from post-session screen (no save, return home)
  function handleDiscardSession() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
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

    // M4.7: build persisted HARI metadata block for HARI sessions
    const persistedHari: PersistedHariMetadata | undefined = session.hari_metadata
      ? {
          intake: session.hari_metadata.intake,
          safety_result: session.hari_metadata.safety_gate_result.outcome,
          state_estimate: session.hari_metadata.state_estimate,
          link_map: session.hari_metadata.link_map,
          intervention: session.hari_metadata.intervention,
          round_plan: session.hari_metadata.round_plan,
          max_rounds: session.hari_metadata.max_rounds,
          reassessment_history: reassessmentHistory,
          baseline_intensity: session.hari_metadata.intake.baseline_intensity,
          post_session_intensity: feedback.pain_after,
        }
      : undefined

    const entry: HistoryEntry = {
      session_id: session.session_id,
      timestamp: session.created_at,
      pain_before: feedback.pain_before,
      pain_after: feedback.pain_after,
      location_tags: session.pain_input.location_tags,
      symptom_tags: session.pain_input.symptom_tags,
      current_position: session.pain_input.current_position,
      trigger_tag: session.pain_input.trigger_tag,
      selected_protocol_id: session.protocol_id,
      selected_protocol_name: session.protocol_name,
      result: feedback.result,
      change_markers: feedback.change_markers,
      session_status: 'completed',
      session_duration_seconds: elapsed,
      rounds_completed: completedRounds,
      ...(session.safety_override_used && { safety_override_used: true }),
      session_type: session.hari_metadata ? 'HARI' : 'LEGACY',
      ...(persistedHari && { hari_metadata: persistedHari }),
      ...(session.hari_metadata && { validation_status: 'pending' }),
    }
    saveSession(entry)
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleStoppedSave(feedback: SessionFeedback) {
    const elapsed = elapsedAtStopRef.current || getElapsedSeconds()

    // M4.7: persist partial HARI metadata for stopped sessions (no post_session_intensity)
    const persistedHari: PersistedHariMetadata | undefined = session.hari_metadata
      ? {
          intake: session.hari_metadata.intake,
          safety_result: session.hari_metadata.safety_gate_result.outcome,
          state_estimate: session.hari_metadata.state_estimate,
          link_map: session.hari_metadata.link_map,
          intervention: session.hari_metadata.intervention,
          round_plan: session.hari_metadata.round_plan,
          max_rounds: session.hari_metadata.max_rounds,
          reassessment_history: reassessmentHistory,
          baseline_intensity: session.hari_metadata.intake.baseline_intensity,
        }
      : undefined

    const entry: HistoryEntry = {
      session_id: session.session_id,
      timestamp: session.created_at,
      pain_before: feedback.pain_before,
      pain_after: feedback.pain_after,
      location_tags: session.pain_input.location_tags,
      symptom_tags: session.pain_input.symptom_tags,
      current_position: session.pain_input.current_position,
      trigger_tag: session.pain_input.trigger_tag,
      selected_protocol_id: session.protocol_id,
      selected_protocol_name: session.protocol_name,
      result: feedback.result,
      change_markers: [],
      session_status: 'user_stopped',
      session_duration_seconds: elapsed,
      rounds_completed: completedRounds,
      ...(session.safety_override_used && { safety_override_used: true }),
      session_type: session.hari_metadata ? 'HARI' : 'LEGACY',
      ...(persistedHari && { hari_metadata: persistedHari }),
      ...(session.hari_metadata && { validation_status: 'pending' }),
    }
    saveSession(entry)
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // M4.6.1 — compute recommendation copy and Continue availability from selected response
  const currentDecision = selectedResponse && session.hari_metadata
    ? decideContinuation(
        selectedResponse,
        hariRoundNumber,
        maxHariRounds,
        session.hari_metadata.intervention
      )
    : null

  const recommendationText: string | null = currentDecision
    ? currentDecision.recommended_action === 'continue_same'
      ? 'Ready for another round when you are.'
      : currentDecision.recommended_action === 'continue_softer'
      ? "We'll keep the next round lighter."
      : currentDecision.recommended_action === 'shorten_next'
      ? "We'll keep the next round shorter."
      : currentDecision.recommended_action === 'stop' && selectedResponse === 'worse'
      ? 'It may help to stop here.'
      : currentDecision.recommended_action === 'stop'
      ? 'This was your final round.'
      : null
    : null

  // Continue is unavailable only when the session ceiling is reached (hard limit, §16)
  const continueAvailable = hariRoundNumber < maxHariRounds

  const totalRounds = currentTimingProfile.rounds
  // currentRound shown to user is completedRounds + 1 (which round they're on now)
  const currentDisplayRound = Math.min(completedRounds + 1, totalRounds)

  return (
    <main className={styles.screen}>

      {phase === 'breathing' && (
        <div className={styles.breathingPhase}>
          {/* Zone 1 — static context, never changes */}
          <header className={styles.topZone} aria-label="Protocol context">
            <p className={styles.protocolName}>{session.protocol_name}</p>
            <p className={styles.goalText}>{session.goal}</p>
          </header>

          {/* Zone 2 — all dynamic guidance: progress + orb + instructions */}
          <div className={styles.guidanceZone}>
            <div
              className={styles.progressRow}
              aria-label={`Round ${currentDisplayRound} of ${totalRounds}`}
            >
              <RoundDots
                totalRounds={totalRounds}
                completedRounds={completedRounds}
                currentRound={currentDisplayRound}
              />
              <span className={styles.roundCounter}>
                {currentDisplayRound} / {totalRounds}
              </span>
            </div>

            <div className={styles.orbArea}>
              {orbRunning && (
                <BreathingOrb
                  key={orbKey}
                  timingProfile={currentTimingProfile}
                  expressionProfile={expressionProfile}
                  protocolId={session.protocol_id}
                  onRoundComplete={handleRoundComplete}
                  onAllRoundsComplete={handleAllRoundsComplete}
                />
              )}
            </div>
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

      {phase === 'reassessment' && (
        <div className={styles.reassessmentPhase}>
          <div className={styles.reassessmentContent}>
            {maxHariRounds > 1 && (
              <p className={styles.reassessmentRoundLabel}>
                Round {hariRoundNumber} of {maxHariRounds} complete
              </p>
            )}

            {/* Step 1 — response selection (always shown) */}
            <p className={styles.reassessmentHeading}>How does your body feel?</p>
            <div className={styles.responseGrid} role="group" aria-label="How your body feels">
              {REASSESSMENT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.responseButton} ${selectedResponse === value ? styles.responseButtonSelected : ''}`}
                  aria-pressed={selectedResponse === value}
                  onClick={() => handleSelectResponse(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step 2 — action choices (only after response selected, M4.6.1 §3) */}
            {selectedResponse && (
              <div className={styles.actionSection}>
                {recommendationText && (
                  <p className={styles.recommendationText}>{recommendationText}</p>
                )}
                <div className={styles.actionButtons}>
                  {continueAvailable && (
                    <button
                      type="button"
                      className={styles.actionContinue}
                      onClick={handleContinueRound}
                    >
                      Continue session
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.actionFinish}
                    onClick={handleFinishAndSave}
                  >
                    Finish session
                  </button>
                </div>
              </div>
            )}

            {/* M4.6.1 §5 — always available, never gated on response selection (D3) */}
            <button
              type="button"
              className={styles.actionExit}
              onClick={handleExitAndDiscard}
            >
              Exit &amp; discard
            </button>
          </div>

          <footer className={styles.reassessmentFooter}>
            <button
              className={styles.safetyButton}
              type="button"
              onClick={handleSafetyInterrupt}
              aria-label="I feel unwell — stop session"
            >
              I feel unwell
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
            onDiscard={handleDiscardSession}
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
            onDiscard={handleDiscardSession}
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
