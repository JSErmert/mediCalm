/**
 * TagSelector — multi-select tappable chip grid.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 *            Accessibility spec (doc 17) — aria-pressed, ≥44px touch targets, group label
 *
 * Used for: location_tags (multi), symptom_tags (multi), trigger_tag (single via singleSelect).
 */
import styles from './TagSelector.module.css'

interface TagSelectorProps {
  tags: readonly string[]
  selected: string[]
  onToggle: (tag: string) => void
  label: string
}

function formatLabel(tag: string): string {
  return tag.replace(/_/g, '\u00A0') // non-breaking space keeps chip text from wrapping oddly
}

export function TagSelector({ tags, selected, onToggle, label }: TagSelectorProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.grid}>
        {tags.map((tag) => {
          const isSelected = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
            >
              {formatLabel(tag)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
