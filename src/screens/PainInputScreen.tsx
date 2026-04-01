/**
 * PainInputScreen — M3.3.2 finalized 3-step guided input flow.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 *            Execution Spec (doc 04) § 1. State Intake Engine
 *
 * Step 1 — Pain level + Location       (location ≥1 to continue)
 * Step 2 — Experience                  (symptom ≥1 to continue)
 * Step 3 — Current State + Context     (position + trigger both required)
 *   Section 1: position (standing / sitting / lying down)
 *   Section 2: trigger, also-present signals, note
 *
 * On submit: resolveSession() → SET_ACTIVE_SESSION or SET_SAFETY_STOP.
 */
import { resolveSession } from '../engine'
import { useState } from 'react'
import type { PainInputState } from '../types'
import { LOCATION_TAGS, TRIGGER_TAGS, SYMPTOM_GROUPS, POSITION_TAGS } from '../types/taxonomy'
import { useAppContext } from '../context/AppContext'
import { isDevOverride } from '../utils/devFlags'
import { PainSlider } from '../components/PainSlider'
import styles from './PainInputScreen.module.css'

const TOTAL_STEPS = 3

const STEP_QUESTIONS: Record<number, string> = {
  1: 'Pain level and location',
  2: 'What does it feel like?',
  3: 'Current state and context',
}

function formatTag(tag: string): string {
  return tag.replace(/_/g, '\u00A0')
}

export function PainInputScreen() {
  const { dispatch } = useAppContext()

  const [step, setStep] = useState(1)
  const [painLevel, setPainLevel] = useState(5)
  const [locationTags, setLocationTags] = useState<string[]>([])
  const [symptomTags, setSymptomTags] = useState<string[]>([])
  const [currentPosition, setCurrentPosition] = useState<string | undefined>(undefined)
  const [triggerTag, setTriggerTag] = useState<string | undefined>(undefined)
  const [userNote, setUserNote] = useState('')

  function toggleMulti(
    tag: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter(
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    )
  }

  function handleBack() {
    if (step === 1) {
      dispatch({ type: 'NAVIGATE', screen: 'home' })
    } else {
      setStep(step - 1)
    }
  }

  function handleSubmit() {
    const input: PainInputState = {
      pain_level: painLevel,
      location_tags: locationTags,
      symptom_tags: symptomTags,
      ...(currentPosition !== undefined && {
        current_position: currentPosition as 'standing' | 'sitting' | 'lying_down',
      }),
      ...(triggerTag !== undefined && { trigger_tag: triggerTag }),
      ...(userNote.trim() !== '' && { user_note: userNote.trim() }),
    }

    const resolution = resolveSession(input)
    dispatch({ type: 'SET_PAIN_INPUT', input })

    if (resolution.kind === 'safety_stop') {
      dispatch({ type: 'SET_SAFETY_STOP', assessment: resolution.assessment })
      // Dev mode: route to R&D review screen instead of the production stop screen
      dispatch({ type: 'NAVIGATE', screen: isDevOverride() ? 'rd_review' : 'safety_stop' })
    } else {
      dispatch({ type: 'SET_ACTIVE_SESSION', session: resolution.session })
      dispatch({ type: 'NAVIGATE', screen: 'session_setup' })
    }
  }

  // Step 3 requires both position and trigger to be selected
  const canAdvance =
    step === 1 ? locationTags.length > 0 :
    step === 2 ? symptomTags.length > 0 :
    currentPosition !== undefined && triggerTag !== undefined

  const mainSymptomGroups = SYMPTOM_GROUPS.filter((g) => !g.safetyAdjacent)
  const safetySymptomGroups = SYMPTOM_GROUPS.filter((g) => g.safetyAdjacent)

  return (
    <main className={styles.screen}>
      {/* Thin progress indicator */}
      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label={step === 1 ? 'Back to home' : 'Previous step'}
        >
          ← Back
        </button>
        <h1 className={styles.heading}>{STEP_QUESTIONS[step]}</h1>
      </header>

      <div className={styles.stepContent}>

        {/* ── Step 1: Pain level + Location ─────────────────────────────── */}
        {step === 1 && (
          <>
            <section className={styles.stepSection} aria-label="Pain level">
              <PainSlider value={painLevel} onChange={setPainLevel} />
            </section>

            <section className={styles.stepSection} aria-label="Location">
              <p className={styles.subLabel}>Where do you feel it?</p>
              <div className={styles.chipGrid} role="group" aria-label="Body regions">
                {LOCATION_TAGS.map((tag) => {
                  const isSelected = locationTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => toggleMulti(tag, locationTags, setLocationTags)}
                    >
                      {formatTag(tag)}
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* ── Step 2: Symptoms (grouped, non-safety) ────────────────────── */}
        {step === 2 && (
          <div className={styles.symptomGroups} role="group" aria-label="Symptoms">
            {mainSymptomGroups.map((group) => (
              <div key={group.label} className={styles.symptomGroup}>
                <span className={styles.groupLabel}>{group.label}</span>
                <div className={styles.chipGrid}>
                  {group.tags.map((tag) => {
                    const isSelected = symptomTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => toggleMulti(tag, symptomTags, setSymptomTags)}
                      >
                        {formatTag(tag)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 3: Current State + Context ───────────────────────────── */}
        {step === 3 && (
          <>
            {/* Section 1 — Current State (position) */}
            <section className={styles.step3Section} aria-label="Current position">
              <p className={styles.subLabel}>What position are you currently in?</p>
              <div className={styles.chipGrid} role="group" aria-label="Position">
                {POSITION_TAGS.map((tag) => {
                  const isSelected = currentPosition === tag
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => setCurrentPosition(currentPosition === tag ? undefined : tag)}
                    >
                      {formatTag(tag)}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Section 2 — Context + Signals */}
            <section className={styles.step3Section} aria-label="Context and signals">
              {/* Trigger — required, "unknown" is valid */}
              <div className={styles.contextBlock}>
                <p className={styles.subLabel}>What were you doing?</p>
                <div className={styles.chipGrid} role="group" aria-label="Activity context">
                  {TRIGGER_TAGS.map((tag) => {
                    const isSelected = triggerTag === tag
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => setTriggerTag(triggerTag === tag ? undefined : tag)}
                      >
                        {formatTag(tag)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Safety signals — muted, separated */}
              {safetySymptomGroups.map((group) => (
                <div
                  key={group.label}
                  className={`${styles.symptomGroup} ${styles.symptomGroupSafety}`}
                >
                  <span className={styles.groupLabel}>{group.label}</span>
                  <div className={styles.chipGrid}>
                    {group.tags.map((tag) => {
                      const isSelected = symptomTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={`${styles.chip} ${isSelected ? styles.chipSelected : ''} ${styles.chipSafety}`}
                          aria-pressed={isSelected}
                          onClick={() => toggleMulti(tag, symptomTags, setSymptomTags)}
                        >
                          {formatTag(tag)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Note — optional */}
              <div className={styles.noteSection}>
                <textarea
                  id="user-note"
                  className={styles.noteInput}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Anything else relevant? (optional)"
                  rows={2}
                  maxLength={200}
                  aria-label="Optional note"
                />
              </div>
            </section>
          </>
        )}

      </div>

      <footer className={styles.footer}>
        <button
          className={styles.actionButton}
          type="button"
          onClick={step < TOTAL_STEPS ? () => setStep(step + 1) : handleSubmit}
          disabled={!canAdvance}
          aria-disabled={!canAdvance}
        >
          {step < TOTAL_STEPS ? 'Continue' : 'Begin session'}
        </button>
      </footer>
    </main>
  )
}
