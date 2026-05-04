/**
 * StateSelectionScreen — PT Clinical Pass 2.
 *
 * Branched intent question (replaces M6.1 multi-state chip grid).
 * "Why are you using the app today?" → IntakeBranch single-select.
 *
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import { useState } from 'react'
import type { IntakeBranch } from '../types/hari'
import { useAppContext } from '../context/AppContext'
import styles from './StateSelectionScreen.module.css'

const BRANCH_OPTIONS: { value: IntakeBranch; label: string }[] = [
  { value: 'tightness_or_pain', label: 'Tightness or pain' },
  { value: 'anxious_or_overwhelmed', label: 'Anxious or overwhelmed' },
]

export function StateSelectionScreen() {
  const { dispatch } = useAppContext()
  const [selected, setSelected] = useState<IntakeBranch | null>(null)

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleContinue() {
    if (!selected) return
    dispatch({ type: 'SET_STATE_ENTRY', entry: selected })
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }

  return (
    <main className={styles.screen} aria-label="State selection">
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="Back to home"
        >
          ← Back
        </button>
      </header>

      <p className={styles.wordmark}>mediCalm</p>
      <h1 className={styles.heading}>Why are you using the app today?</h1>

      <div className={styles.branchGrid} role="group" aria-label="Intake branch">
        {BRANCH_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`${styles.branchButton} ${selected === value ? styles.branchSelected : ''}`}
            aria-pressed={selected === value}
            onClick={() => setSelected(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {selected && (
        <button
          type="button"
          className={styles.continueBtn}
          onClick={handleContinue}
        >
          Continue
        </button>
      )}
    </main>
  )
}
