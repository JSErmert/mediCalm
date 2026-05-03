/**
 * HariSafetyGateScreen — C4 HARI Pre-Session Safety Gate
 * Authority: M4.0–4.5_v1.1_CLARIFICATIONS.md §C4
 *            M4.5.1 — Intervention → Session Bridge (Critical Fix)
 *
 * Two-step safety eligibility check that runs between M4.2 intake and
 * the M4.3 state estimation engine.
 *
 * Step 1: "Are any of these happening right now?" (Yes / No)
 *   - No → CLEAR → run HARI engine → session_setup
 *   - Yes → Step 2
 *
 * Step 2: "Which best describes what's happening?" (multi-select)
 *   - weakness / coordination / severe → STOP
 *   - numbness / not_sure → HOLD
 *   - CLEAR: classify from selections
 *
 * SAFETY RULE (MANDATORY — M4.5.1):
 *   CLEAR → build session via bridge → session_setup
 *   HOLD  → advisory message, go home only (no session creation)
 *   STOP  → stop message, go home only (no session creation)
 *
 * Session creation only happens on CLEAR.
 */
import { useState } from 'react'
import type { SafetyGateResult } from '../types/hari'
import type { SafetyFlagClass } from '../engine/hari/safetyGate'
import { SAFETY_FLAG_LABELS, STEP_1_SYMPTOMS } from '../engine/hari/index'
import { runSafetyGate, resolveHariSession } from '../engine/hari/index'
import { buildHariSession } from '../engine/hari/sessionBridge'
import { loadBodyContext } from '../storage/bodyContext'
import { useAppContext } from '../context/AppContext'
import styles from './HariSafetyGateScreen.module.css'

type GateStep = 'step1' | 'step2' | 'result'

const FLAG_OPTIONS: SafetyFlagClass[] = [
  'new_worsening_weakness',
  'coordination_change',
  'numbness_extremities_or_saddle',
  'symptoms_severe_or_concerning',
  'not_sure',
]

export function HariSafetyGateScreen() {
  const { state, dispatch } = useAppContext()
  const [gateStep, setGateStep] = useState<GateStep>('step1')
  const [selectedFlags, setSelectedFlags] = useState<SafetyFlagClass[]>([])
  const [gateResult, setGateResult] = useState<SafetyGateResult | null>(null)

  const intake = state.hariIntake

  // Guard: should not render without intake
  if (!intake) {
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
    return null
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }

  // Step 1: No — CLEAR path
  function handleStep1No() {
    const result = runSafetyGate([])
    proceedOrBlock(result)
  }

  // Step 1: Yes — go to step 2
  function handleStep1Yes() {
    setGateStep('step2')
  }

  function toggleFlag(flag: SafetyFlagClass) {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    )
  }

  // Step 2: Classify selected flags
  function handleStep2Confirm() {
    if (selectedFlags.length === 0) return
    const result = runSafetyGate(selectedFlags)
    if (result.outcome === 'CLEAR') {
      proceedOrBlock(result)
    } else {
      setGateResult(result)
      setGateStep('result')
    }
  }

  function handleGoHome() {
    dispatch({ type: 'CLEAR_HARI_INTAKE' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function proceedOrBlock(result: SafetyGateResult) {
    if (result.outcome === 'CLEAR') {
      proceedWithHariEngine(result)
    } else {
      setGateResult(result)
      setGateStep('result')
    }
  }

  /**
   * CLEAR path only — builds session via bridge and navigates to session_setup.
   * Authority: M4.5.1 §Step 2–5
   * Session creation MUST NOT happen for HOLD or STOP outcomes.
   */
  function proceedWithHariEngine(clearResult: SafetyGateResult) {
    const safeIntake = intake!
    const bodyContext = loadBodyContext()
    const hariResolution = resolveHariSession(safeIntake, bodyContext)

    const session = buildHariSession(hariResolution, clearResult)

    dispatch({ type: 'SET_PAIN_INPUT', input: session.pain_input })
    dispatch({
      type: 'SET_INTERVENTION_PACKAGE',
      pkg: hariResolution.intervention,
      framing: hariResolution.session_framing,
    })
    dispatch({ type: 'SET_ACTIVE_SESSION', session })
    // M6.6: if a stateInterpretationResult is present, route directly to guided_session
    if (state.stateInterpretationResult) {
      dispatch({ type: 'NAVIGATE', screen: 'guided_session' })
      return
    }
    // Always navigate to session_setup — R&D screen is for M3 safety-stop flow only
    dispatch({ type: 'NAVIGATE', screen: 'session_setup' })
  }

  // ── Step 1 — Initial Check ─────────────────────────────────────────────────

  if (gateStep === 'step1') {
    return (
      <main className={styles.screen}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={handleBack}
            type="button"
            aria-label="Back to session intake"
          >
            ← Back
          </button>
          <h1 className={styles.heading}>Before we begin</h1>
        </header>

        <div className={styles.content}>
          <p className={styles.lead}>
            Are any of these happening right now?
          </p>

          <div className={styles.symptomList} role="list" aria-label="Safety symptoms to check">
            {STEP_1_SYMPTOMS.map((symptom) => (
              <div key={symptom} className={styles.symptomItem} role="listitem">
                <span className={styles.symptomDot} aria-hidden="true" />
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.actionPrimary}
            type="button"
            onClick={handleStep1No}
          >
            No, none of these
          </button>
          <button
            className={styles.actionYes}
            type="button"
            onClick={handleStep1Yes}
          >
            Yes, at least one applies
          </button>
        </div>
      </main>
    )
  }

  // ── Step 2 — Flag Selection ────────────────────────────────────────────────

  if (gateStep === 'step2') {
    return (
      <main className={styles.screen}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => setGateStep('step1')}
            type="button"
            aria-label="Back to previous step"
          >
            ← Back
          </button>
          <h1 className={styles.heading}>Which best describes it?</h1>
        </header>

        <div className={styles.content}>
          <p className={styles.lead}>
            Select all that apply.
          </p>

          <div className={styles.flagGrid} role="group" aria-label="Safety symptom categories">
            {FLAG_OPTIONS.map((flag) => (
              <button
                key={flag}
                type="button"
                className={`${styles.flagChip} ${selectedFlags.includes(flag) ? styles.flagChipSelected : ''}`}
                aria-pressed={selectedFlags.includes(flag)}
                onClick={() => toggleFlag(flag)}
              >
                {SAFETY_FLAG_LABELS[flag]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.confirmButton}
            type="button"
            onClick={handleStep2Confirm}
            disabled={selectedFlags.length === 0}
            aria-disabled={selectedFlags.length === 0}
          >
            Confirm
          </button>
          <button
            className={styles.actionBack}
            type="button"
            onClick={() => setGateStep('step1')}
          >
            Back
          </button>
        </div>
      </main>
    )
  }

  // ── Result — HOLD or STOP ──────────────────────────────────────────────────
  //
  // MANDATORY: No session creation on HOLD or STOP.
  // Only "Go to home" is offered. Authority: M4.5.1 §Safety Rule

  const isStop = gateResult?.outcome === 'STOP'

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => setGateStep('step2')}
          type="button"
          aria-label="Back to symptom selection"
        >
          ← Back
        </button>
        <h1 className={styles.heading}>
          {isStop ? 'Not the right moment' : 'Worth noting'}
        </h1>
      </header>

      <div className={styles.content}>
        <div className={isStop ? styles.stopPanel : styles.holdPanel}>
          <span className={styles.panelTitle}>
            {isStop ? 'Please check in first' : 'Pause before starting'}
          </span>
          <p className={styles.panelMessage}>
            {gateResult?.message ?? ''}
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.homeButton}
          type="button"
          onClick={handleGoHome}
        >
          Go to home
        </button>
      </div>
    </main>
  )
}
