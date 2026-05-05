import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { musclesForRegion, REGION_LABEL } from './data/regions'
import styles from './MuscleDrawer.module.css'

interface MuscleDrawerProps {
  region: BodyLocation | null
  /** Which body view the region was tapped on; when set, the drawer shows
   *  only muscles whose view matches this side. Regions like `neck` and
   *  `head_temples` span both views, so without this filter the front-side
   *  drawer would surface back-side options (e.g. "Nape" when tapping the
   *  front of the neck). */
  side?: 'front' | 'back'
  selectedMuscles: BodyMuscle[]
  onToggleMuscle: (muscle: BodyMuscle) => void
  onClose: () => void
}

export function MuscleDrawer({ region, side, selectedMuscles, onToggleMuscle, onClose }: MuscleDrawerProps) {
  const isOpen = region !== null
  const allRegionMuscles = region ? musclesForRegion(region) : []
  const muscles = side ? allRegionMuscles.filter(m => m.view === side) : allRegionMuscles
  const selectedSet = new Set(selectedMuscles)

  return (
    <div
      data-testid="muscle-drawer"
      className={`${styles.drawer}${isOpen ? ' ' + styles.open : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-labelledby="muscle-drawer-title"
    >
      <header className={styles.header}>
        <div>
          <div className={styles.label}>Muscle group</div>
          <h2 id="muscle-drawer-title" className={styles.region}>
            {region ? REGION_LABEL[region] : '—'}
          </h2>
          <div className={styles.hint}>Tap one or more, or close to keep just the region.</div>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close drawer"
        >
          <span aria-hidden="true">✕</span>
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
