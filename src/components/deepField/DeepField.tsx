/**
 * DeepField — the persistent D4-B4 Deep Current background.
 *
 * Rendered once by App and never unmounted, so it survives every screen transition.
 * That persistence is the point: an ambient field that remounted per screen would
 * restart its drift and its motes on every navigation, and the app would read as a
 * sequence of pages rather than as one continuous body of water.
 *
 * Layer order, back to front:
 *   bgBase      — the original pressure gradient          (unchanged)
 *   bgPools     — two hues drifting on independent clocks (added: water column)
 *   particulate — the fine suspended grain                (added: water column)
 *   filterRadial — the original guilloché rays            (unchanged)
 *   filterCross  — the original interference hatch        (unchanged)
 *   bgVignette  — edges sink, the centre holds the orb    (added: water column)
 *
 * The particulate and the pools are damped via `data-field`, set from the active screen
 * and from any raised field suppression (for a safety surface that is a phase inside a
 * screen rather than a screen of its own). The original three layers never read that
 * variable, and the vignette deliberately ignores it — it is the ground being seated,
 * not atmosphere, so it holds on every screen including the safety surfaces. The mapping
 * and its reasoning live in fieldMode.ts; the suppression signal in fieldSuppression.tsx.
 */
import { useAppContext } from '../../context/AppContext'
import { getFieldMode } from './fieldMode'
import { useFieldSuppressed } from './fieldSuppression'
import { SuspendedParticulate } from './SuspendedParticulate'
import styles from '../../App.module.css'

export function DeepField() {
  const { state } = useAppContext()
  // A raised suppression always wins. The screen mapping cannot see a safety surface
  // that is a phase inside a screen rather than a screen of its own, so anything
  // holding the field down overrides it outright.
  const suppressed = useFieldSuppressed()
  const mode = suppressed ? 'off' : getFieldMode(state.activeScreen)

  return (
    <div className={styles.bgField} data-field={mode} aria-hidden="true">
      <div className={styles.bgBase} />
      <div className={styles.bgPools}>
        <div className={`${styles.pool} ${styles.poolTeal}`} />
        <div className={`${styles.pool} ${styles.poolMarine}`} />
        <div className={`${styles.pool} ${styles.poolCyan}`} />
      </div>
      <SuspendedParticulate />
      <div className={styles.bgFilterRadial} />
      <div className={styles.bgFilterCross} />
      <div className={styles.bgVignette} />
    </div>
  )
}
