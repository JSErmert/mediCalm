/**
 * CustomBuilderScreen — the calm, paced composer for a user-authored breathing session.
 * Authority: n4-screens custom experience (THE felt centerpiece)
 *
 * This composes; it does not configure. Gentle presets are offered FIRST as
 * suggestions, then the "build your own" path walks ONE value at a time through
 * a token-styled duration stepper — never a grid of number inputs, never native
 * OS chrome. Every value entering the player passes validateCustomTiming first,
 * and only the clamped result is saved / played.
 */
import { useState } from 'react'
import type { CustomSession, CustomTimingProfile } from '../types'
import { useAppContext } from '../context/AppContext'
import { validateCustomTiming } from '../engine/custom/validateCustomTiming'
import { buildCustomPhaseTimeline } from '../engine/custom/buildCustomPhaseTimeline'
import {
  INHALE_MIN_SECONDS,
  INHALE_MAX_SECONDS,
  HOLD_AFTER_INHALE_MIN_SECONDS,
  HOLD_AFTER_INHALE_MAX_SECONDS,
  EXHALE_MIN_SECONDS,
  EXHALE_MAX_SECONDS,
  HOLD_AFTER_EXHALE_MIN_SECONDS,
  HOLD_AFTER_EXHALE_MAX_SECONDS,
  CYCLES_MIN,
  CYCLES_MAX,
} from '../engine/custom/validateCustomTiming'
import { saveCustomSession } from '../storage/customSessions'
import styles from './CustomBuilderScreen.module.css'

// ── Gentle presets — offered first as suggestions, never as the only path ────
interface Preset {
  id: string
  name: string
  sub: string
  profile: CustomTimingProfile
}

const PRESETS: Preset[] = [
  {
    id: 'box',
    name: 'Box breathing',
    sub: 'An even four-count square',
    profile: { inhale_seconds: 4, hold_after_inhale_seconds: 4, exhale_seconds: 4, hold_after_exhale_seconds: 4, cycles: 6 },
  },
  {
    id: '478',
    name: '4-7-8',
    sub: 'A held breath, a long exhale',
    profile: { inhale_seconds: 4, hold_after_inhale_seconds: 7, exhale_seconds: 8, hold_after_exhale_seconds: 0, cycles: 4 },
  },
  {
    id: 'extended',
    name: 'Extended exhale',
    sub: 'Exhale twice the inhale',
    profile: { inhale_seconds: 4, hold_after_inhale_seconds: 0, exhale_seconds: 8, hold_after_exhale_seconds: 0, cycles: 6 },
  },
  {
    id: 'sigh',
    name: 'Physiological sigh',
    sub: 'A short breath in, a long breath out',
    profile: { inhale_seconds: 2, hold_after_inhale_seconds: 0, exhale_seconds: 8, hold_after_exhale_seconds: 0, cycles: 5 },
  },
]

// ── One-value-at-a-time step definitions ─────────────────────────────────────
type ProfileKey = keyof CustomTimingProfile

interface StepDef {
  key: ProfileKey
  label: string
  hint: string
  min: number
  max: number
  unit: 'seconds' | 'cycles'
}

const STEPS: StepDef[] = [
  { key: 'inhale_seconds', label: 'Inhale', hint: 'Breathe in slowly through your nose.', min: INHALE_MIN_SECONDS, max: INHALE_MAX_SECONDS, unit: 'seconds' },
  { key: 'hold_after_inhale_seconds', label: 'Hold in', hint: 'Rest with the breath held. Zero for no hold.', min: HOLD_AFTER_INHALE_MIN_SECONDS, max: HOLD_AFTER_INHALE_MAX_SECONDS, unit: 'seconds' },
  { key: 'exhale_seconds', label: 'Exhale', hint: 'Let the breath out gently and fully.', min: EXHALE_MIN_SECONDS, max: EXHALE_MAX_SECONDS, unit: 'seconds' },
  { key: 'hold_after_exhale_seconds', label: 'Hold out', hint: 'Pause with lungs empty. Zero for no hold.', min: HOLD_AFTER_EXHALE_MIN_SECONDS, max: HOLD_AFTER_EXHALE_MAX_SECONDS, unit: 'seconds' },
  { key: 'cycles', label: 'Cycles', hint: 'How many full breaths to repeat.', min: CYCLES_MIN, max: CYCLES_MAX, unit: 'cycles' },
]

const DEFAULT_PROFILE: CustomTimingProfile = {
  inhale_seconds: 4,
  hold_after_inhale_seconds: 0,
  exhale_seconds: 6,
  hold_after_exhale_seconds: 0,
  cycles: 6,
}

const PHASE_LABELS: Record<string, string> = {
  inhale: 'Inhale',
  hold_in: 'Hold in',
  exhale: 'Exhale',
  hold_out: 'Hold out',
}

type Stage = 'presets' | 'compose' | 'review'

function defaultName(profile: CustomTimingProfile): string {
  return `Custom ${profile.inhale_seconds}-${profile.hold_after_inhale_seconds}-${profile.exhale_seconds}-${profile.hold_after_exhale_seconds}`
}

export function CustomBuilderScreen() {
  const { dispatch } = useAppContext()
  const [stage, setStage] = useState<Stage>('presets')
  const [stepIndex, setStepIndex] = useState(0)
  const [profile, setProfile] = useState<CustomTimingProfile>(DEFAULT_PROFILE)
  const [name, setName] = useState('')

  const step = STEPS[stepIndex]
  const stepValue = profile[step.key]

  // The clamped profile is the single source of truth for the summary + save.
  const clampedProfile = validateCustomTiming(profile).clamped
  const timeline = buildCustomPhaseTimeline(clampedProfile)

  function adjust(delta: number) {
    setProfile((prev) => {
      const next = Math.min(step.max, Math.max(step.min, prev[step.key] + delta))
      return { ...prev, [step.key]: next }
    })
  }

  function pickPreset(preset: Preset) {
    setProfile(preset.profile)
    setName(preset.name)
    setStage('review')
  }

  function startCompose() {
    setStepIndex(0)
    setStage('compose')
  }

  function nextStep() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      setStage('review')
    }
  }

  function prevStep() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1)
    } else {
      setStage('presets')
    }
  }

  function buildSession(): CustomSession {
    const clamped = validateCustomTiming(profile).clamped
    const now = new Date().toISOString()
    const finalName = name.trim() === '' ? defaultName(clamped) : name.trim()
    const session: CustomSession = {
      id: crypto.randomUUID(),
      name: finalName,
      profile: clamped,
      created_at: now,
      updated_at: now,
    }
    saveCustomSession(session)
    return session
  }

  function handleBegin() {
    const session = buildSession()
    dispatch({ type: 'SET_PENDING_CUSTOM', session })
    dispatch({ type: 'NAVIGATE', screen: 'custom_player' })
  }

  function handleSaveToLibrary() {
    buildSession()
    dispatch({ type: 'NAVIGATE', screen: 'custom_library' })
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'custom_library' })}
          aria-label="Back to your sessions"
        >
          ← Your sessions
        </button>
        <p className={styles.wordmark}>compose</p>
      </header>

      {/* ── Stage: presets ──────────────────────────────────────────────── */}
      {stage === 'presets' && (
        <section className={styles.stage} aria-label="Choose a starting point">
          <h1 className={styles.title}>Compose a breathing session</h1>
          <p className={styles.subtitle}>Start from a gentle suggestion, or build your own.</p>

          <ul className={styles.presetList}>
            {PRESETS.map((preset) => (
              <li key={preset.id}>
                <button
                  type="button"
                  className={styles.presetCard}
                  onClick={() => pickPreset(preset)}
                  aria-label={`Use ${preset.name} — ${preset.sub}`}
                >
                  <span className={styles.presetName}>{preset.name}</span>
                  <span className={styles.presetSub}>{preset.sub}</span>
                  <span className={styles.presetPattern}>{formatPatternShort(preset.profile)}</span>
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className={styles.composeOwnButton} onClick={startCompose}>
            Build your own
          </button>
        </section>
      )}

      {/* ── Stage: compose — one value at a time ────────────────────────── */}
      {stage === 'compose' && (
        <section className={styles.stage} aria-label={`Set ${step.label}`}>
          <p className={styles.stepProgress}>
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <h1 className={styles.stepLabel}>{step.label}</h1>
          <p className={styles.stepHint}>{step.hint}</p>

          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => adjust(-1)}
              disabled={stepValue <= step.min}
              aria-label={`Decrease ${step.label}`}
            >
              −
            </button>
            <div className={styles.stepperValue}>
              <span className={styles.stepperNumber} aria-live="polite">{stepValue}</span>
              <span className={styles.stepperUnit}>{step.unit}</span>
            </div>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => adjust(1)}
              disabled={stepValue >= step.max}
              aria-label={`Increase ${step.label}`}
            >
              +
            </button>
          </div>
          {/* Hidden input keeps the composed value in the DOM as a real form value. */}
          <input type="hidden" name={step.key} value={stepValue} readOnly />

          <div className={styles.stepNav}>
            <button type="button" className={styles.secondaryButton} onClick={prevStep}>
              {stepIndex === 0 ? 'Back' : 'Previous'}
            </button>
            <button type="button" className={styles.primaryButton} onClick={nextStep}>
              {stepIndex === STEPS.length - 1 ? 'Review' : 'Next'}
            </button>
          </div>
        </section>
      )}

      {/* ── Stage: review ───────────────────────────────────────────────── */}
      {stage === 'review' && (
        <section className={styles.stage} aria-label="Review your session">
          <h1 className={styles.title}>Your session</h1>

          <ul className={styles.patternList} aria-label="Composed pattern">
            {timeline.map((phase, i) => (
              <li key={`${phase.kind}-${i}`} className={styles.patternRow}>
                <span className={styles.patternLabel}>{PHASE_LABELS[phase.kind]}</span>
                <span className={styles.patternValue}>{phase.seconds}s</span>
              </li>
            ))}
            <li className={`${styles.patternRow} ${styles.patternCycles}`}>
              <span className={styles.patternLabel}>Cycles</span>
              <span className={styles.patternValue}>{clampedProfile.cycles}</span>
            </li>
          </ul>

          <div className={styles.nameField}>
            <label className={styles.nameLabel} htmlFor="custom-session-name">
              Name this session
            </label>
            <input
              id="custom-session-name"
              type="text"
              className={styles.nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName(clampedProfile)}
              maxLength={60}
            />
          </div>

          <div className={styles.reviewActions}>
            <button type="button" className={styles.primaryButton} onClick={handleBegin}>
              Begin session
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleSaveToLibrary}>
              Save to library
            </button>
            <button
              type="button"
              className={styles.tertiaryButton}
              onClick={startCompose}
            >
              Adjust the timing
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

/** Compact "4 · 4 · 4 · 4" preset preview (holds shown; cycles appended). */
function formatPatternShort(p: CustomTimingProfile): string {
  return `${p.inhale_seconds} · ${p.hold_after_inhale_seconds} · ${p.exhale_seconds} · ${p.hold_after_exhale_seconds}  ·  ×${p.cycles}`
}
