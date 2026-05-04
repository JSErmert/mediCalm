import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { musclesForRegion, REGION_LABEL } from './data/regions'
import styles from './MuscleDrawer.module.css'

interface MuscleDrawerProps {
  region: BodyLocation | null
  selectedMuscles: BodyMuscle[]
  onToggleMuscle: (muscle: BodyMuscle) => void
  onClose: () => void
}

export function MuscleDrawer({ region, selectedMuscles, onToggleMuscle, onClose }: MuscleDrawerProps) {
  const isOpen = region !== null
  const muscles = region ? musclesForRegion(region) : []
  const selectedSet = new Set(selectedMuscles)

  return (
    <div
      data-testid="muscle-drawer"
      className={`${styles.drawer}${isOpen ? ' ' + styles.open : ''}`}
      aria-hidden={!isOpen}
    >
      <header className={styles.header}>
        <div>
          <div className={styles.label}>Muscle group</div>
          <div className={styles.region}>{region ? REGION_LABEL[region] : '—'}</div>
          <div className={styles.hint}>Tap one or more, or close to keep just the region.</div>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close drawer"
        >
          ✕
        </button>
      </header>

      <div className={styles.grid}>
        {muscles.map(m => (
          <button
            key={m.id}
            type="button"
            className={`${styles.muscleChip}${selectedSet.has(m.id) ? ' ' + styles.selected : ''}`}
            onClick={() => onToggleMuscle(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
