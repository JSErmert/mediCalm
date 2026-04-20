/**
 * SessionIntakeScreen — M4.2 MVP HARI 5-field pre-session intake.
 * Authority: M4.2 MVP contract, M4.0–4.5_v1.1_CLARIFICATIONS.md
 *
 * Replaces PainInputScreen as the primary session entry point in M4.
 * Authority: v1.1 §C4 — "M4.2 MVP intake confirmed as full replacement for PainInputScreen"
 *
 * 6 fields (5 required, 1 with default):
 *   1. Session Intent                           (required)
 *   2. Current Context / Posture                (required)
 *   3. Current Symptom Focus or Proactive Status (required)
 *   4. Baseline Intensity                       (slider, default 5 — always set)
 *   5. Current Flare Sensitivity                (required)
 *   6. Today's Session Length Preference        (required)
 *
 * Rules:
 *   - All 5 fields required, all have 'not_sure' or equivalent uncertain options
 *   - Uncertainty allowed — must never block session start
 *   - Compact, calm, low-friction — feels like a readiness check
 *   - Shows Body Context banner if available (M4.1 §17)
 *
 * On submit → HARI safety gate (HariSafetyGateScreen)
 */
import { useEffect, useState } from 'react'
import type {
  HariSessionIntake,
  SessionIntent,
  CurrentContext,
  SymptomFocus,
  FlareSensitivity,
  SessionLengthPreference,
  BodyContextSummary,
} from '../types/hari'
import { useAppContext } from '../context/AppContext'
import { loadBodyContext } from '../storage/bodyContext'
import { buildBodyContextSummary } from '../engine/hari/bodyContextSummary'
import { getEligibleHariHistory } from '../storage/sessionHistory'
import { getOrComputePatternSummary } from '../engine/hari/patternReader'
import { computeAdaptiveIntakeDefaults } from '../engine/hari/adaptiveIntakeDefaults'
import { interpretStates } from '../engine/hari/stateInterpretation'
import type { HariEmotionalState } from '../types/hari'
import styles from './SessionIntakeScreen.module.css'

// ── Option Definitions ────────────────────────────────────────────────────────

const SESSION_INTENT_OPTIONS: { value: SessionIntent; label: string }[] = [
  { value: 'quick_reset', label: 'Quick reset' },
  { value: 'deeper_regulation', label: 'Deeper regulation' },
  { value: 'flare_sensitive_support', label: 'Flare-sensitive support' },
  { value: 'cautious_test', label: 'Cautious test' },
]

const CONTEXT_OPTIONS: { value: CurrentContext; label: string }[] = [
  { value: 'sitting', label: 'Sitting' },
  { value: 'standing', label: 'Standing' },
  { value: 'driving', label: 'Driving / in vehicle' },
  { value: 'lying_down', label: 'Lying down' },
  { value: 'after_strain', label: 'After strain / overuse' },
]

const SYMPTOM_FOCUS_OPTIONS: { value: SymptomFocus; label: string }[] = [
  { value: 'proactive', label: 'Mostly proactive / no major focus' },
  { value: 'neck_upper', label: 'Neck / upper region' },
  { value: 'rib_side_back', label: 'Rib / side / back' },
  { value: 'jaw_facial', label: 'Jaw / facial tension' },
  { value: 'spread_tension', label: 'More spread-out tension' },
  { value: 'mixed', label: 'Mixed / not sure' },
]

const FLARE_SENSITIVITY_OPTIONS: { value: FlareSensitivity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'not_sure', label: 'Not sure' },
]

const SESSION_LENGTH_OPTIONS: { value: SessionLengthPreference; label: string }[] = [
  { value: 'shorter', label: 'Shorter' },
  { value: 'standard', label: 'Standard' },
  { value: 'longer', label: 'Longer' },
  { value: 'not_sure', label: 'Not sure' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionIntakeScreen() {
  const { state, dispatch } = useAppContext()

  const [sessionIntent, setSessionIntent] = useState<SessionIntent | null>(null)
  const [currentContext, setCurrentContext] = useState<CurrentContext | null>(null)
  const [symptomFocus, setSymptomFocus] = useState<SymptomFocus | null>(null)
  const [baselineIntensity, setBaselineIntensity] = useState(5)
  const [flareSensitivity, setFlareSensitivity] = useState<FlareSensitivity | null>(null)
  const [sessionLength, setSessionLength] = useState<SessionLengthPreference | null>(null)
  const [bodyContextSummary, setBodyContextSummary] = useState<BodyContextSummary | null>(null)
  // M5.2 — tracks which fields still display a suggestion indicator (cleared on first user interaction)
  const [suggestedFields, setSuggestedFields] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    const ctx = loadBodyContext()
    setBodyContextSummary(buildBodyContextSummary(ctx))
  }, [])

  // M5.2 — load adaptive defaults at mount; pre-populate eligible fields (M5.2 §11, §13)
  useEffect(() => {
    const history = getEligibleHariHistory()
    const recentFlare = history[0]?.hari_metadata?.intake?.flare_sensitivity
    const summary = getOrComputePatternSummary()
    const adaptiveDefaults = computeAdaptiveIntakeDefaults(summary, recentFlare ?? undefined)

    const newSuggestedFields = new Set<string>()

    if (adaptiveDefaults.session_intent !== undefined) {
      setSessionIntent(adaptiveDefaults.session_intent.value)
      newSuggestedFields.add('session_intent')
    }
    if (adaptiveDefaults.symptom_focus !== undefined) {
      setSymptomFocus(adaptiveDefaults.symptom_focus.value)
      newSuggestedFields.add('symptom_focus')
    }
    if (adaptiveDefaults.flare_sensitivity !== undefined) {
      setFlareSensitivity(adaptiveDefaults.flare_sensitivity.value)
      newSuggestedFields.add('flare_sensitivity')
    }
    if (adaptiveDefaults.session_length_preference !== undefined) {
      setSessionLength(adaptiveDefaults.session_length_preference.value)
      newSuggestedFields.add('session_length_preference')
    }

    if (newSuggestedFields.size > 0) {
      setSuggestedFields(newSuggestedFields)
    }
  }, [])

  /** M5.2 §7.3 — user interaction clears the suggestion indicator for that field */
  function clearSuggestion(field: string) {
    setSuggestedFields((prev) => {
      if (!prev.has(field)) return prev
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }

  const allSelected =
    sessionIntent !== null &&
    currentContext !== null &&
    symptomFocus !== null &&
    flareSensitivity !== null &&
    sessionLength !== null

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleSubmit() {
    if (!allSelected) return

    const intake: HariSessionIntake = {
      session_intent: sessionIntent,
      current_context: currentContext,
      symptom_focus: symptomFocus,
      baseline_intensity: baselineIntensity,
      flare_sensitivity: flareSensitivity,
      session_length_preference: sessionLength,
    }

    // M6.4: interpret pending state entry into breath/effort/bias parameters
    if (state.pendingStateEntry && state.pendingStateEntry.length > 0) {
      const interpretationResult = interpretStates({
        states: state.pendingStateEntry as HariEmotionalState[],
        intensity: baselineIntensity,
        sensitivity: flareSensitivity,
      })
      dispatch({ type: 'SET_STATE_INTERPRETATION', result: interpretationResult })
    }

    dispatch({ type: 'SET_HARI_INTAKE', intake })
    dispatch({ type: 'NAVIGATE', screen: 'hari_safety_gate' })
  }

  // Derive pre-session framing hint based on selections so far
  const partialFraming =
    flareSensitivity === 'high'
      ? "High sensitivity detected \u2014 we'll start very gently."
      : sessionIntent === 'quick_reset'
      ? "Quick reset selected \u2014 we'll keep this brief and focused."
      : sessionIntent === 'cautious_test'
      ? "Cautious test \u2014 we'll check in early before continuing."
      : null

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
        <h1 className={styles.heading}>How are you today?</h1>
      </header>

      {/* Body Context banner — compact, calm, non-overwhelming (M4.1 §17) */}
      {bodyContextSummary?.has_context && bodyContextSummary.display_banner && (
        <div className={styles.bodyContextBanner} aria-label="Saved Body Context summary">
          <span className={styles.bannerLabel}>Body Context</span>
          <span className={styles.bannerText}>
            {bodyContextSummary.display_banner.replace('Using saved Body Context\n', '')}
          </span>
        </div>
      )}

      <div className={styles.content}>

        {/* 1. Session Intent */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>What is this session for?</span>
          {suggestedFields.has('session_intent') && (
            <span className={styles.suggestionLabel}>Suggested based on your recent sessions</span>
          )}
          <div className={styles.chipGrid} role="group" aria-label="Session intent">
            {SESSION_INTENT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={[
                  styles.chip,
                  sessionIntent === value ? styles.chipSelected : '',
                  sessionIntent === value && suggestedFields.has('session_intent') ? styles.chipSuggested : '',
                ].filter(Boolean).join(' ')}
                aria-pressed={sessionIntent === value}
                onClick={() => { setSessionIntent(value); clearSuggestion('session_intent') }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 2. Current Context / Posture */}
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

        {/* 3. Symptom Focus */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>What best describes today's focus?</span>
          {suggestedFields.has('symptom_focus') && (
            <span className={styles.suggestionLabel}>Suggested based on your recent sessions</span>
          )}
          <div className={styles.chipGrid} role="group" aria-label="Symptom focus">
            {SYMPTOM_FOCUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={[
                  styles.chip,
                  symptomFocus === value ? styles.chipSelected : '',
                  symptomFocus === value && suggestedFields.has('symptom_focus') ? styles.chipSuggested : '',
                ].filter(Boolean).join(' ')}
                aria-pressed={symptomFocus === value}
                onClick={() => { setSymptomFocus(value); clearSuggestion('symptom_focus') }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 4. Baseline Intensity */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>How intense does it feel right now?</span>
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
              aria-label="Baseline intensity"
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

        {/* 5. Flare Sensitivity */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>How sensitive does your body feel right now?</span>
          {suggestedFields.has('flare_sensitivity') && (
            <span className={styles.suggestionLabel}>Suggested based on your recent sessions</span>
          )}
          <div className={styles.chipGrid} role="group" aria-label="Flare sensitivity">
            {FLARE_SENSITIVITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={[
                  styles.chip,
                  flareSensitivity === value ? styles.chipSelected : '',
                  flareSensitivity === value && suggestedFields.has('flare_sensitivity') ? styles.chipSuggested : '',
                ].filter(Boolean).join(' ')}
                aria-pressed={flareSensitivity === value}
                onClick={() => { setFlareSensitivity(value); clearSuggestion('flare_sensitivity') }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 6. Session Length Preference */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>What length feels right today?</span>
          {suggestedFields.has('session_length_preference') && (
            <span className={styles.suggestionLabel}>Suggested based on your recent sessions</span>
          )}
          <div className={styles.chipGrid} role="group" aria-label="Session length preference">
            {SESSION_LENGTH_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={[
                  styles.chip,
                  sessionLength === value ? styles.chipSelected : '',
                  sessionLength === value && suggestedFields.has('session_length_preference') ? styles.chipSuggested : '',
                ].filter(Boolean).join(' ')}
                aria-pressed={sessionLength === value}
                onClick={() => { setSessionLength(value); clearSuggestion('session_length_preference') }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <footer className={styles.footer}>
        {partialFraming && (
          <p className={styles.framingNote}>{partialFraming}</p>
        )}
        <button
          className={styles.actionButton}
          type="button"
          onClick={handleSubmit}
          disabled={!allSelected}
          aria-disabled={!allSelected}
        >
          Continue
        </button>
      </footer>
    </main>
  )
}
