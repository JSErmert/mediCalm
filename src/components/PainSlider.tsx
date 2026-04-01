/**
 * PainSlider — 0–10 pain level input.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 *            Accessibility spec (doc 17) — min 44px touch target, labelled
 */
import styles from './PainSlider.module.css'

interface PainSliderProps {
  value: number
  onChange: (value: number) => void
}

export function PainSlider({ value, onChange }: PainSliderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.valueDisplay} aria-hidden="true">
        <span className={styles.value}>{value}</span>
        <span className={styles.outOf}>/10</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={10}
        step={1}
        value={value}
        style={{ '--slider-fill': `${value * 10}%` } as React.CSSProperties}
        aria-label="Pain level"
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.labels} aria-hidden="true">
        <span>No pain</span>
        <span>Worst</span>
      </div>
    </div>
  )
}
