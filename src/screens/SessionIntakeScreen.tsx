/**
 * SessionIntakeScreen — PT Clinical Pass 2 (refined 2026-05-04).
 *
 * 6-field intake. Branch-aware severity copy.
 *   1. Severity (slider, branch-aware copy)
 *   2. Irritability (Maitland pattern)
 *   3. Sensitivity (explicit user input — overrides any derived value)
 *   4. Location (multi-select anatomical regions)
 *   5. Position (where you are right now)
 *   6. Session length ("What session length feels right today?" — Short / Standard / Long)
 *
 * Silent fields (session_intent, symptom_focus) populated via M5.2
 * adaptiveIntakeDefaults. flare_sensitivity is now an explicit user
 * field (irritabilityToFlareSensitivity remains as a fallback for legacy
 * records but is no longer called here).
 *
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 *            PT clinical refinement notes 2026-05-04 (3 deliberate refinements)
 */
import { useEffect, useState } from 'react'
import type {
  HariSessionIntake,
  CurrentContext,
  SessionLengthPreference,
  IrritabilityPattern,
  IntakeBranch,
  HariEmotionalState,
  SessionIntent,
  SymptomFocus,
  FlareSensitivity,
  BodyLocation,
  BodyMuscle,
} from '../types/hari'
import { useAppContext } from '../context/AppContext'
import { getEligibleHariHistory } from '../storage/sessionHistory'
import { getOrComputePatternSummary } from '../engine/hari/patternReader'
import { computeAdaptiveIntakeDefaults } from '../engine/hari/adaptiveIntakeDefaults'
import { interpretStates } from '../engine/hari/stateInterpretation'
import { branchToEmotionalStates } from '../engine/intakeTranslation'
import { BodyPicker, type FallbackId } from '../components/BodyPicker'
import styles from './SessionIntakeScreen.module.css'

// ── Option Definitions ────────────────────────────────────────────────────────

const IRRITABILITY_OPTIONS: { value: IrritabilityPattern; label: string }[] = [
  { value: 'fast_onset_slow_resolution', label: 'Comes on quickly, goes away slowly' },
  { value: 'slow_onset_fast_resolution', label: 'Comes on slowly, goes away quickly' },
  { value: 'symmetric', label: 'Comes on and goes away about the same' },
]

const SENSITIVITY_OPTIONS: { value: FlareSensitivity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'not_sure', label: 'Not sure' },
]

const CONTEXT_OPTIONS: { value: CurrentContext; label: string }[] = [
  { value: 'sitting', label: 'Sitting' },
  { value: 'standing', label: 'Standing' },
  { value: 'driving', label: 'Driving / in vehicle' },
  { value: 'lying_down', label: 'Lying down' },
  { value: 'after_strain', label: 'After strain or overuse' },
]

const LENGTH_OPTIONS: { value: SessionLengthPreference; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'standard', label: 'Standard' },
  { value: 'long', label: 'Long' },
]

// Defaults for silent fields (PT pass 2)
const DEFAULT_SESSION_INTENT: SessionIntent = 'quick_reset'
const DEFAULT_SYMPTOM_FOCUS: SymptomFocus = 'spread_tension'

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionIntakeScreen() {
  const { state, dispatch } = useAppContext()
  const branch = state.pendingStateEntry as IntakeBranch | null

  const [irritability, setIrritability] = useState<IrritabilityPattern | null>(null)
  const [sensitivity, setSensitivity] = useState<FlareSensitivity | null>(null)
  const [locationRegions, setLocationRegions] = useState<BodyLocation[]>([])
  const [locationMuscles, setLocationMuscles] = useState<BodyMuscle[]>([])
  const [locationFallback, setLocationFallback] = useState<FallbackId | null>(null)
  const [currentContext, setCurrentContext] = useState<CurrentContext | null>(null)
  const [baselineIntensity, setBaselineIntensity] = useState(5)
  const [sessionLength, setSessionLength] = useState<SessionLengthPreference | null>(null)

  // Silent / derived fields (M5.2 adaptive defaults if available; fallback otherwise)
  const [silentIntent, setSilentIntent] = useState<SessionIntent>(DEFAULT_SESSION_INTENT)
  const [silentFocus, setSilentFocus] = useState<SymptomFocus>(DEFAULT_SYMPTOM_FOCUS)

  // Guard: should not render without branch (return to state selection)
  useEffect(() => {
    if (!branch) {
      dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
    }
  }, [branch, dispatch])

  // M5.2 — load adaptive defaults for silent fields only
  useEffect(() => {
    const history = getEligibleHariHistory()
    const recentFlare = history[0]?.hari_metadata?.intake?.flare_sensitivity
    const summary = getOrComputePatternSummary()
    const adaptiveDefaults = computeAdaptiveIntakeDefaults(summary, recentFlare ?? undefined)
    if (adaptiveDefaults.session_intent !== undefined) {
      setSilentIntent(adaptiveDefaults.session_intent.value)
    }
    if (adaptiveDefaults.symptom_focus !== undefined) {
      setSilentFocus(adaptiveDefaults.symptom_focus.value)
    }
  }, [])

  const hasLocation =
    locationRegions.length > 0 || locationMuscles.length > 0 || locationFallback !== null

  const allRequiredSet =
    irritability !== null &&
    sensitivity !== null &&
    hasLocation &&
    currentContext !== null &&
    sessionLength !== null

  const severityHeading =
    branch === 'anxious_or_overwhelmed'
      ? 'How intense is it right now?'
      : 'How severe is your tightness or pain right now?'

  const branchLabel =
    branch === 'anxious_or_overwhelmed' ? 'Anxious or overwhelmed' : 'Tightness or pain'

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  function handleSubmit() {
    if (!allRequiredSet || !branch) return

    const intake: HariSessionIntake = {
      branch,
      irritability,
      baseline_intensity: baselineIntensity,
      flare_sensitivity: sensitivity,
      location: locationFallback ? [locationFallback] : locationRegions,
      location_muscles: locationMuscles.length > 0 ? locationMuscles : undefined,
      current_context: currentContext,
      session_length_preference: sessionLength,
      // Silent / derived
      session_intent: silentIntent,
      symptom_focus: silentFocus,
    }

    // M6.4: interpret derived emotional states using the user's explicit sensitivity.
    const states: HariEmotionalState[] = branchToEmotionalStates(branch)
    const interpretationResult = interpretStates({
      states,
      intensity: baselineIntensity,
      sensitivity,
    })
    dispatch({ type: 'SET_STATE_INTERPRETATION', result: interpretationResult })

    dispatch({ type: 'SET_HARI_INTAKE', intake })
    dispatch({ type: 'NAVIGATE', screen: 'hari_safety_gate' })
  }

  if (!branch) return null

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label={`Edit branch: ${branchLabel}`}
        >
          ← {branchLabel}
        </button>
      </header>

      <div className={styles.content}>

        {/* 1. Severity (branch-aware) */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>{severityHeading}</span>
          <div className={styles.intensitySlider}>
            <div className={styles.intensityDisplay} aria-hidden="true">
              <span className={styles.intensityValue}>{baselineIntensity}</span>
              <span className={styles.intensityOutOf}>/10</span>
            </div>
            <input
              type="range"
              className={styles.intensityRange}
              min={0}
              max={10}
              step={1}
              value={baselineIntensity}
              style={{ '--slider-fill': `${baselineIntensity * 10}%` } as React.CSSProperties}
              aria-label="Severity"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={baselineIntensity}
              onChange={(e) => setBaselineIntensity(Number(e.target.value))}
            />
            <div className={styles.intensityLabels} aria-hidden="true">
              <span>None</span>
              <span>Intense</span>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 2. Irritability */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>How would you describe it?</span>
          <div className={styles.chipGrid} role="group" aria-label="Irritability pattern">
            {IRRITABILITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${irritability === value ? styles.chipSelected : ''}`}
                aria-pressed={irritability === value}
                onClick={() => setIrritability(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 3. Sensitivity (restored 2026-05-04) */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>How sensitive does your body feel right now?</span>
          <div className={styles.chipGrid} role="group" aria-label="Flare sensitivity">
            {SENSITIVITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${sensitivity === value ? styles.chipSelected : ''}`}
                aria-pressed={sensitivity === value}
                onClick={() => setSensitivity(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 4. Location — visual body picker (replaces chip grid 2026-05-04) */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>Where in your body is it focused?</span>
          <BodyPicker
            selectedRegions={locationRegions}
            selectedMuscles={locationMuscles}
            fallback={locationFallback}
            onChange={(next) => {
              setLocationRegions(next.regions)
              setLocationMuscles(next.muscles)
              setLocationFallback(next.fallback)
            }}
          />
        </div>

        <hr className={styles.divider} />

        {/* 5. Position */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>Where are you right now?</span>
          <div className={styles.chipGrid} role="group" aria-label="Current context">
            {CONTEXT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${currentContext === value ? styles.chipSelected : ''}`}
                aria-pressed={currentContext === value}
                onClick={() => setCurrentContext(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 6. Length (relabelled 2026-05-04) */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>What session length feels right today?</span>
          <div className={styles.chipGrid} role="group" aria-label="Session length preference">
            {LENGTH_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${sessionLength === value ? styles.chipSelected : ''}`}
                aria-pressed={sessionLength === value}
                onClick={() => setSessionLength(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <footer className={styles.footer}>
        <button
          className={styles.actionButton}
          type="button"
          onClick={handleSubmit}
          disabled={!allRequiredSet}
          aria-disabled={!allRequiredSet}
        >
          Continue
        </button>
      </footer>
    </main>
  )
}
