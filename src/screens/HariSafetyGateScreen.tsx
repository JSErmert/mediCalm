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
import {
  SAFETY_FLAG_LABELS,
  STEP_1_NEURO_SYMPTOMS,
  STEP_1_CARDIO_SYMPTOMS,
} from '../engine/hari/index'
import { runSafetyGate, resolveHariSession } from '../engine/hari/index'
import { buildHariSession } from '../engine/hari/sessionBridge'
import { loadBodyContext } from '../storage/bodyContext'
import { buildM7Session } from '../engine/m7/integration'
import type { IntakeSensorState } from '../types/m7'
import { useAppContext } from '../context/AppContext'
import { isDevOverride } from '../utils/devFlags'
import styles from './HariSafetyGateScreen.module.css'

type GateStep = 'step1' | 'step2' | 'result'

const NEURO_FLAG_OPTIONS: SafetyFlagClass[] = [
  'new_worsening_weakness',
  'coordination_change',
  'numbness_extremities_or_saddle',
  'dizziness_balance_loss',
  'double_vision',
  'speech_difficulty',
  'swallowing_difficulty',
  'drop_attacks',
  'symptoms_severe_or_concerning',
]

const CARDIO_FLAG_OPTIONS: SafetyFlagClass[] = [
  'chest_pain_or_pressure',
  'radiating_pain_jaw_arm',
  'interscapular_pain',
  'dyspnea_at_rest',
  'irregular_heartbeat',
]

const FALLBACK_FLAG_OPTIONS: SafetyFlagClass[] = ['not_sure']

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
    proceedOrBlock(runSafetyGate(selectedFlags))
  }

  function handleGoHome() {
    dispatch({ type: 'CLEAR_HARI_INTAKE' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function proceedOrBlock(result: SafetyGateResult) {
    // R&D dev override: when toggled on via HomeScreen R&D banner, all
    // gate outcomes proceed. Solo-developer personal-testing path only.
    // Never enabled in distributed builds.
    if (result.outcome !== 'CLEAR' && isDevOverride()) {
      console.warn('[mediCalm] R&D override bypassing safety gate:', result.trigger)
      proceedWithHariEngine({ outcome: 'CLEAR' })
      return
    }
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

    // M7.1 shadow mode — build M7 session alongside legacy path.
    // breathDowngraded mirrors the HARI engine's flare_sensitivity → elevated logic:
    // flare_sensitivity 'high' → score 2 → elevated → breath downgraded (stateEstimation.ts:149-150).
    const intakeSensorState: IntakeSensorState = {
      branch: safeIntake.branch,
      location: safeIntake.location,
      location_pattern: safeIntake.location_pattern,
      current_context: safeIntake.current_context,
      session_intent: safeIntake.session_intent,
      session_length_preference: safeIntake.session_length_preference,
      flare_sensitivity: safeIntake.flare_sensitivity,
      baseline_intensity: safeIntake.baseline_intensity,
      irritability: safeIntake.irritability,
      derived_signals: { breathDowngraded: safeIntake.flare_sensitivity === 'high' },
    }
    let m7Build: import('../types/m7').M7RuntimeBuild | undefined
    try {
      const m7Result = buildM7Session(intakeSensorState)
      m7Build = {
        variant: m7Result.variant,
        pathway_ref: m7Result.pathway_ref,
        intake_sensor_state: intakeSensorState,
      }
    } catch (err) {
      // Shadow mode: M7 failure must not break the legacy session path.
      console.warn('[mediCalm M7] buildM7Session failed (shadow mode — session continues):', err)
    }

    const sessionWithM7 = m7Build ? { ...session, m7_build: m7Build } : session

    dispatch({ type: 'SET_PAIN_INPUT', input: session.pain_input })
    dispatch({
      type: 'SET_INTERVENTION_PACKAGE',
      pkg: hariResolution.intervention,
      framing: hariResolution.session_framing,
    })
    dispatch({ type: 'SET_ACTIVE_SESSION', session: sessionWithM7 })
    // Always route through session_setup so the user sees the protocol
    // name, focus, position, and length before the session begins.
    // PT pass 2 simplification (2026-05-04) makes this preview MORE
    // valuable, not less — the M6.6 stateInterpretationResult shortcut
    // that previously bypassed it has been removed.
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
          <h1 className={styles.heading}>Before we begin — please review the following</h1>
        </header>

        <div className={styles.content}>
          <p className={styles.lead}>
            Stop and seek medical attention if you are currently experiencing any of the following.
          </p>

          <section
            className={styles.symptomSection}
            aria-labelledby="neuro-section-label"
          >
            <h2 id="neuro-section-label" className={styles.sectionLabel}>
              Neurological symptoms
            </h2>
            <ul className={styles.symptomList}>
              {STEP_1_NEURO_SYMPTOMS.map((symptom) => (
                <li key={symptom} className={styles.symptomItem}>
                  <span className={styles.symptomDot} aria-hidden="true" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.symptomSection}
            aria-labelledby="cardio-section-label"
          >
            <h2 id="cardio-section-label" className={styles.sectionLabel}>
              Cardiovascular symptoms
            </h2>
            <ul className={styles.symptomList}>
              {STEP_1_CARDIO_SYMPTOMS.map((symptom) => (
                <li key={symptom} className={styles.symptomItem}>
                  <span className={styles.symptomDot} aria-hidden="true" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </section>
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
          <p className={styles.lead}>Select all that apply.</p>

          {[
            { label: 'Neurological', options: NEURO_FLAG_OPTIONS },
            { label: 'Cardiovascular', options: CARDIO_FLAG_OPTIONS },
            { label: 'Other', options: FALLBACK_FLAG_OPTIONS },
          ].map((group) => (
            <section
              key={group.label}
              className={styles.symptomSection}
              aria-label={`${group.label} symptoms`}
            >
              <h2 className={styles.sectionLabel}>{group.label}</h2>
              <div className={styles.flagGrid} role="group">
                {group.options.map((flag) => (
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
            </section>
          ))}
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
