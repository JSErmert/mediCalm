/**
 * PainInputScreen — collects all required state for session resolution.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 *            Execution Spec (doc 04) § 1. State Intake Engine
 *
 * Required: pain_level (0–10), ≥1 location_tag, ≥1 symptom_tag
 * Optional: trigger_tag (single select), user_note (free text, ≤200 chars)
 *
 * On submit: validates → dispatches SET_PAIN_INPUT → navigates to session_placeholder.
 * M2 replaces the session_placeholder route with a real session engine call.
 *
 * UI rules:
 * - screen must feel open, quiet, and immediately understandable
 * - avoid dense forms; no scrolling-heavy layouts in v1
 * - keep input completion responsive — no loading delay
 */
import { resolveSession } from '../engine'
import { useState } from 'react'
import type { PainInputState } from '../types'
import { LOCATION_TAGS, SYMPTOM_TAGS, TRIGGER_TAGS } from '../types/taxonomy'
import { useAppContext } from '../context/AppContext'
import { PainSlider } from '../components/PainSlider'
import { TagSelector } from '../components/TagSelector'
import styles from './PainInputScreen.module.css'

export function PainInputScreen() {
  const { dispatch } = useAppContext()

  const [painLevel, setPainLevel] = useState(5)
  const [locationTags, setLocationTags] = useState<string[]>([])
  const [symptomTags, setSymptomTags] = useState<string[]>([])
  const [triggerTag, setTriggerTag] = useState<string | undefined>(undefined)
  const [userNote, setUserNote] = useState('')

  const canSubmit = locationTags.length > 0 && symptomTags.length > 0

  function toggleMulti(
    tag: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter(
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    )
  }

  function handleTriggerToggle(tag: string) {
    setTriggerTag((prev) => (prev === tag ? undefined : tag))
  }

  function handleSubmit() {
    if (!canSubmit) return

    const input: PainInputState = {
      pain_level: painLevel,
      location_tags: locationTags,
      symptom_tags: symptomTags,
      ...(triggerTag !== undefined && { trigger_tag: triggerTag }),
      ...(userNote.trim() !== '' && { user_note: userNote.trim() }),
    }

    const resolution = resolveSession(input)

    dispatch({ type: 'SET_PAIN_INPUT', input })

    if (resolution.kind === 'safety_stop') {
      dispatch({ type: 'SET_SAFETY_STOP', assessment: resolution.assessment })
      dispatch({ type: 'NAVIGATE', screen: 'safety_stop' })
    } else {
      dispatch({ type: 'SET_ACTIVE_SESSION', session: resolution.session })
      dispatch({ type: 'NAVIGATE', screen: 'guided_session' })
    }
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

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
        <h1 className={styles.heading}>What level is your pain right now?</h1>
      </header>

      <section className={styles.section} aria-label="Pain level">
        <PainSlider value={painLevel} onChange={setPainLevel} />
      </section>

      <section className={styles.section}>
        <TagSelector
          tags={LOCATION_TAGS}
          selected={locationTags}
          onToggle={(tag) => toggleMulti(tag, locationTags, setLocationTags)}
          label="Where do you feel it?"
        />
      </section>

      <section className={styles.section}>
        <TagSelector
          tags={SYMPTOM_TAGS}
          selected={symptomTags}
          onToggle={(tag) => toggleMulti(tag, symptomTags, setSymptomTags)}
          label="What does it feel like?"
        />
      </section>

      <section className={styles.section}>
        <TagSelector
          tags={TRIGGER_TAGS}
          selected={triggerTag !== undefined ? [triggerTag] : []}
          onToggle={handleTriggerToggle}
          label="Context (optional)"
        />
      </section>

      <section className={styles.section}>
        <label className={styles.noteLabel} htmlFor="user-note">
          Note (optional)
        </label>
        <textarea
          id="user-note"
          className={styles.noteInput}
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Anything else to note?"
          rows={2}
          maxLength={200}
          aria-label="Optional note"
        />
      </section>

      <footer className={styles.footer}>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          type="button"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          aria-label="Begin session"
        >
          Begin session
        </button>
        {!canSubmit && (
          <p className={styles.validation} role="status" aria-live="polite">
            Select at least one region and one symptom to continue.
          </p>
        )}
      </footer>
    </main>
  )
}
