import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { MUSCLE_PATHS } from './data/muscles'
import { MUSCLE_TO_REGION } from './data/regions'
import styles from './BodyPickerSVG.module.css'

interface BodyPickerSVGProps {
  side: 'front' | 'back'
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  onRegionTap: (region: BodyLocation) => void
  onRegionHover: (region: BodyLocation | null) => void
}

const VIEW_BOX_FRONT = '0 0 35 93'
const VIEW_BOX_BACK = '37 0 35 93'

export function BodyPickerSVG({
  side, selectedRegions, selectedMuscles, onRegionTap, onRegionHover,
}: BodyPickerSVGProps) {
  // Filter to this side, then group by region
  const muscles = MUSCLE_PATHS.filter(m => m.view === side)
  const regions = new Map<BodyLocation, typeof muscles>()
  for (const m of muscles) {
    if (!regions.has(m.region)) regions.set(m.region, [])
    regions.get(m.region)!.push(m)
  }

  const selectedRegionSet = new Set(selectedRegions)
  const muscleParents = new Set(selectedMuscles.map(id => MUSCLE_TO_REGION[id]))

  return (
    <svg
      className={styles.body}
      viewBox={side === 'front' ? VIEW_BOX_FRONT : VIEW_BOX_BACK}
      role="img"
      aria-label={`${side === 'front' ? 'Anterior' : 'Posterior'} body picker`}
    >
      {[...regions.entries()].map(([region, list]) => {
        const isSelected = selectedRegionSet.has(region) || muscleParents.has(region)
        return (
          <g
            key={region}
            data-region={region}
            role="button"
            tabIndex={0}
            aria-label={`Body region: ${region}`}
            className={`${styles.region}${isSelected ? ' ' + styles.selected : ''}`}
            onClick={() => onRegionTap(region)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRegionTap(region)
              }
            }}
            onMouseEnter={() => onRegionHover(region)}
            onMouseLeave={() => onRegionHover(null)}
          >
            {list.map(m => (
              <path key={m.id} d={m.path} data-muscle={m.id} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
