import { useState, useRef } from 'react'
import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { BodyPickerSVG } from './BodyPickerSVG'
import { MuscleDrawer } from './MuscleDrawer'
import { MUSCLE_PATHS } from './data/muscles'
import { MUSCLE_TO_REGION, musclesForRegion, REGION_LABEL } from './data/regions'
import styles from './BodyPicker.module.css'

export type FallbackId = 'spread_multiple' | 'whole_body' | 'not_sure'

export interface BodyPickerSelection {
  regions: BodyLocation[]
  muscles: BodyMuscle[]
  fallback: FallbackId | null
}

interface BodyPickerProps {
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  fallback: FallbackId | null
  onChange: (next: BodyPickerSelection) => void
}

const FALLBACK_OPTIONS: { id: FallbackId; label: string }[] = [
  { id: 'spread_multiple', label: 'Spread / multiple' },
  { id: 'whole_body', label: 'Whole body' },
  { id: 'not_sure', label: 'Not sure' },
]

const MUSCLE_LABELS: Record<string, string> = Object.fromEntries(
  MUSCLE_PATHS.map(m => [m.id, m.name])
)

// Threshold: regions with <= SINGLE_REGION_THRESHOLD total muscles (across
// both views) auto-tag without opening the drawer. Regions like ankle/foot
// and knee have one path per view (front + back = 2) and offer no meaningful
// muscle sub-selection, so they should behave as atomic selections.
const SINGLE_REGION_THRESHOLD = 2

export function BodyPicker({
  selectedRegions, selectedMuscles, fallback, onChange,
}: BodyPickerProps) {
  const [drawerRegion, setDrawerRegion] = useState<BodyLocation | null>(null)

  // Track whether any muscle was toggled ON for the current drawer region
  // during this drawer session. Used by handleDrawerClose to decide whether
  // to auto-tag the region when no muscles are in the (controlled) prop.
  const drawerMuscleAdded = useRef(false)

  function emit(next: BodyPickerSelection) {
    onChange(next)
  }

  function handleRegionTap(region: BodyLocation) {
    const muscles = musclesForRegion(region)
    if (muscles.length <= SINGLE_REGION_THRESHOLD) {
      // Single-muscle (or front+back pair) region — auto-tag without drawer
      const wasSelected = selectedRegions.includes(region)
      const next = wasSelected
        ? selectedRegions.filter(r => r !== region)
        : [...selectedRegions, region]
      const nextMuscles = wasSelected
        ? selectedMuscles.filter(m => MUSCLE_TO_REGION[m] !== region)
        : selectedMuscles
      emit({ regions: next, muscles: nextMuscles, fallback: null })
      return
    }
    drawerMuscleAdded.current = false
    setDrawerRegion(region)
  }

  function handleToggleMuscle(muscle: BodyMuscle) {
    const region = MUSCLE_TO_REGION[muscle]
    const isSelected = selectedMuscles.includes(muscle)
    const nextMuscles = isSelected
      ? selectedMuscles.filter(m => m !== muscle)
      : [...selectedMuscles, muscle]
    const nextRegions = !isSelected && !selectedRegions.includes(region)
      ? [...selectedRegions, region]
      : selectedRegions
    // Track that a muscle was added in this drawer session
    if (!isSelected) drawerMuscleAdded.current = true
    emit({ regions: nextRegions, muscles: nextMuscles, fallback: null })
  }

  function handleDrawerClose() {
    if (drawerRegion) {
      // Only auto-tag the region if no muscles were added during this drawer
      // session and the region is not already in the selection.
      // We use a ref (drawerMuscleAdded) rather than checking selectedMuscles
      // prop because this component is typically controlled — the prop may not
      // reflect changes made during the current drawer session.
      const anyForRegionInProp = selectedMuscles.some(m => MUSCLE_TO_REGION[m] === drawerRegion)
      const regionAlreadySelected = selectedRegions.includes(drawerRegion)
      if (!drawerMuscleAdded.current && !anyForRegionInProp && !regionAlreadySelected) {
        emit({ regions: [...selectedRegions, drawerRegion], muscles: selectedMuscles, fallback: null })
      }
    }
    drawerMuscleAdded.current = false
    setDrawerRegion(null)
  }

  function handleFallback(id: FallbackId) {
    if (fallback === id) {
      emit({ regions: selectedRegions, muscles: selectedMuscles, fallback: null })
    } else {
      emit({ regions: [], muscles: [], fallback: id })
    }
  }

  function handleRemoveRegion(region: BodyLocation) {
    emit({
      regions: selectedRegions.filter(r => r !== region),
      muscles: selectedMuscles.filter(m => MUSCLE_TO_REGION[m] !== region),
      fallback,
    })
  }

  function handleRemoveMuscle(muscle: BodyMuscle) {
    emit({
      regions: selectedRegions,
      muscles: selectedMuscles.filter(m => m !== muscle),
      fallback,
    })
  }

  function muscleLabel(muscle: BodyMuscle): string {
    return MUSCLE_LABELS[muscle] ?? muscle
  }

  const totalSelected = selectedRegions.length + selectedMuscles.length + (fallback ? 1 : 0)

  return (
    <div className={styles.picker}>
      <div className={styles.stage}>
        <div className={styles.bodyWrap}>
          <span className={styles.bodyLabel}>Front</span>
          <BodyPickerSVG
            side="front"
            selectedRegions={selectedRegions}
            selectedMuscles={selectedMuscles}
            onRegionTap={handleRegionTap}
            onRegionHover={() => {}}
          />
        </div>
        <div className={styles.bodyWrap}>
          <span className={styles.bodyLabel}>Back</span>
          <BodyPickerSVG
            side="back"
            selectedRegions={selectedRegions}
            selectedMuscles={selectedMuscles}
            onRegionTap={handleRegionTap}
            onRegionHover={() => {}}
          />
        </div>

        <MuscleDrawer
          region={drawerRegion}
          selectedMuscles={selectedMuscles}
          onToggleMuscle={handleToggleMuscle}
          onClose={handleDrawerClose}
        />
      </div>

      <div className={styles.selectedCard}>
        <span className={styles.selectedLabel}>Selected</span>
        <div className={styles.chipRow}>
          {totalSelected === 0 && (
            <span className={styles.empty}>None yet — tap a region above</span>
          )}
          {selectedRegions.map(r => (
            <button
              key={`r:${r}`}
              type="button"
              className={styles.chip}
              onClick={() => handleRemoveRegion(r)}
            >
              {REGION_LABEL[r]}<span className={styles.chipX} aria-hidden="true">✕</span>
            </button>
          ))}
          {selectedMuscles.map(m => (
            <button
              key={`m:${m}`}
              type="button"
              aria-label={`Remove: ${muscleLabel(m)}`}
              className={styles.chip}
              onClick={() => handleRemoveMuscle(m)}
            >
              <span aria-hidden="true">{muscleLabel(m)}</span>
              <span className={styles.chipMeta} aria-hidden="true">· {REGION_LABEL[MUSCLE_TO_REGION[m]]}</span>
              <span className={styles.chipX} aria-hidden="true">✕</span>
            </button>
          ))}
          {fallback && (
            <button
              type="button"
              className={styles.chip}
              onClick={() => emit({ regions: [], muscles: [], fallback: null })}
            >
              {REGION_LABEL[fallback]}<span className={styles.chipX} aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.fallbackRow}>
        {FALLBACK_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.fallback}${fallback === opt.id ? ' ' + styles.fallbackActive : ''}`}
            onClick={() => handleFallback(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
