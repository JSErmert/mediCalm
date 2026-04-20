/**
 * StateSelectionScreen — M6.1 State Selection
 *
 * Layout C v1.2: 2-col equal grid + Heavy expand row.
 * Heavy is the umbrella chip for Angry / Overwhelmed / Sad.
 * Multi-select. Continue appears on ≥1 selection.
 * If Sad selected → sad_safety. Otherwise → session_intake.
 * Authority: M6.1 State Selection Screen spec
 */
import { useState } from 'react'
import type { EntryState } from '../types'
import { useAppContext } from '../context/AppContext'
import styles from './StateSelectionScreen.module.css'

const SUB_STATES: EntryState[] = ['angry', 'overwhelmed', 'sad']

export function StateSelectionScreen() {
  const { dispatch } = useAppContext()
  const [selected, setSelected] = useState<Set<EntryState>>(new Set())
  const [heavyExpanded, setHeavyExpanded] = useState(false)

  function toggle(state: EntryState) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(state) ? next.delete(state) : next.add(state)
      return next
    })
  }

  function toggleHeavy() {
    if (heavyExpanded) {
      setSelected(prev => {
        const next = new Set(prev)
        SUB_STATES.forEach(s => next.delete(s))
        return next
      })
    }
    setHeavyExpanded(e => !e)
  }

  function handleContinue() {
    if (selected.size === 0) return
    const entry = Array.from(selected)
    dispatch({ type: 'SET_STATE_ENTRY', entry })
    dispatch({
      type: 'NAVIGATE',
      screen: selected.has('sad') ? 'sad_safety' : 'session_intake',
    })
  }

  const hasSelection = selected.size > 0

  return (
    <main className={styles.screen} aria-label="State selection">
      <p className={styles.wordmark}>mediCalm</p>
      <h1 className={styles.heading}>What are you feeling right now?</h1>
      <p className={styles.sub}>We'll help your system settle.</p>

      <div className={styles.grid}>
        <div className={styles.row}>
          <button type="button" className={`${styles.chip} ${selected.has('pain') ? styles.on : styles.off}`} onClick={() => toggle('pain')}>
            Pain
          </button>
          <button type="button" className={`${styles.chip} ${selected.has('anxious') ? styles.on : styles.off}`} onClick={() => toggle('anxious')}>
            Anxious
          </button>
        </div>

        <div className={styles.row}>
          <button type="button" className={`${styles.chip} ${selected.has('exhausted') ? styles.on : styles.off}`} onClick={() => toggle('exhausted')}>
            Exhausted
          </button>
          <button type="button" className={`${styles.chip} ${selected.has('tight') ? styles.on : styles.off}`} onClick={() => toggle('tight')}>
            Tight
          </button>
        </div>

        <div className={styles.row}>
          {/* Heavy uses .on to indicate expansion, not selection — see toggleHeavy */}
          <button
            type="button"
            className={`${styles.chip} ${styles.heavy} ${heavyExpanded ? styles.on : styles.off}`}
            onClick={toggleHeavy}
            aria-expanded={heavyExpanded}
            aria-label="Heavy"
          >
            Heavy
          </button>
        </div>

        <div
          className={`${styles.subBlock}${heavyExpanded ? ` ${styles.subBlockOpen}` : ''}`}
          aria-hidden={!heavyExpanded}
        >
          <div className={styles.subRow}>
            <button
              type="button"
              className={`${styles.subChip} ${selected.has('angry') ? styles.on : styles.off}`}
              onClick={() => toggle('angry')}
              tabIndex={heavyExpanded ? 0 : -1}
            >
              Angry
            </button>
            <button
              type="button"
              className={`${styles.subChipWide} ${selected.has('overwhelmed') ? styles.on : styles.off}`}
              onClick={() => toggle('overwhelmed')}
              tabIndex={heavyExpanded ? 0 : -1}
            >
              Overwhelmed
            </button>
            <button
              type="button"
              className={`${styles.subChip} ${selected.has('sad') ? styles.on : styles.off}`}
              onClick={() => toggle('sad')}
              tabIndex={heavyExpanded ? 0 : -1}
            >
              Sad
            </button>
          </div>
        </div>
      </div>

      {hasSelection && (
        <button type="button" className={styles.continueBtn} onClick={handleContinue}>
          Continue
        </button>
      )}
    </main>
  )
}
