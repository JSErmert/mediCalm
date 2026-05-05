import { useState } from 'react'
import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { BodyPickerSVG } from './BodyPickerSVG'
import { MuscleDrawer } from './MuscleDrawer'
import { MUSCLE_PATHS } from './data/muscles'
import { MUSCLE_TO_REGION, musclesForRegion, REGION_LABEL } from './data/regions'
import { inferLocationPattern } from '../../engine/hari/locationPatterns'
import styles from './BodyPicker.module.css'

export interface BodyPickerSelection {
  regions: BodyLocation[]
  muscles: BodyMuscle[]
  /** True when the user has tapped the "I can't pinpoint it" escape hatch.
   *  Mutually exclusive with regions/muscles — picking either clears this. */
  diffuseUnspecified: boolean
}

interface BodyPickerProps {
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  diffuseUnspecified: boolean
  onChange: (next: BodyPickerSelection) => void
}

const MUSCLE_LABELS: Record<string, string> = Object.fromEntries(
  MUSCLE_PATHS.map(m => [m.id, m.name])
)

// Threshold: regions with <= SINGLE_REGION_THRESHOLD total muscles (across
// both views) auto-tag without opening the drawer. Regions like ankle/foot
// and knee have one path per view (front + back = 2) and offer no meaningful
// muscle sub-selection, so they should behave as atomic selections.
const SINGLE_REGION_THRESHOLD = 2

const PATTERN_LABEL: Record<'single' | 'connected' | 'multifocal' | 'widespread', string> = {
  single: 'Single region',
  connected: 'Connected',
  multifocal: 'Multifocal',
  widespread: 'Widespread',
}

export function BodyPicker({
  selectedRegions, selectedMuscles, diffuseUnspecified, onChange,
}: BodyPickerProps) {
  const [drawerRegion, setDrawerRegion] = useState<BodyLocation | null>(null)
  const [drawerSide, setDrawerSide] = useState<'front' | 'back' | null>(null)

  function emit(next: BodyPickerSelection) {
    onChange(next)
  }

  function handleRegionTap(region: BodyLocation, side: 'front' | 'back') {
    if (diffuseUnspecified) {
      // Clear active escape hatch before any region/muscle selection — they
      // are mutually exclusive. Must run BEFORE the drawer opens so closing
      // the drawer without a muscle pick still leaves diffuseUnspecified off.
      emit({ regions: selectedRegions, muscles: selectedMuscles, diffuseUnspecified: false })
    }
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
      emit({ regions: next, muscles: nextMuscles, diffuseUnspecified: false })
      return
    }
    setDrawerRegion(region)
    setDrawerSide(side)
  }

  function handleToggleMuscle(muscle: BodyMuscle) {
    // Picking a muscle records ONLY the muscle. The parent region is not
    // added to selectedRegions so the chip area stays uncluttered. The SVG
    // still highlights the parent region via muscleParents in BodyPickerSVG,
    // and SessionIntakeScreen rolls muscles up to their parent regions at
    // submit time so the HARI engine still sees a populated location[].
    const isSelected = selectedMuscles.includes(muscle)
    const nextMuscles = isSelected
      ? selectedMuscles.filter(m => m !== muscle)
      : [...selectedMuscles, muscle]
    emit({ regions: selectedRegions, muscles: nextMuscles, diffuseUnspecified: false })
  }

  function handleDrawerClose() {
    if (drawerRegion) {
      const anyForRegion = selectedMuscles.some(m => MUSCLE_TO_REGION[m] === drawerRegion)
      if (!anyForRegion && !selectedRegions.includes(drawerRegion)) {
        emit({
          regions: [...selectedRegions, drawerRegion],
          muscles: selectedMuscles,
          diffuseUnspecified: false,
        })
      }
    }
    setDrawerRegion(null)
    setDrawerSide(null)
  }

  function handleEscapeHatch() {
    if (diffuseUnspecified) {
      emit({ regions: selectedRegions, muscles: selectedMuscles, diffuseUnspecified: false })
    } else {
      emit({ regions: [], muscles: [], diffuseUnspecified: true })
    }
  }

  function handleRemoveRegion(region: BodyLocation) {
    emit({
      regions: selectedRegions.filter(r => r !== region),
      muscles: selectedMuscles.filter(m => MUSCLE_TO_REGION[m] !== region),
      diffuseUnspecified,
    })
  }

  function handleRemoveMuscle(muscle: BodyMuscle) {
    emit({
      regions: selectedRegions,
      muscles: selectedMuscles.filter(m => m !== muscle),
      diffuseUnspecified,
    })
  }

  function muscleLabel(muscle: BodyMuscle): string {
    return MUSCLE_LABELS[muscle] ?? muscle
  }

  // Pattern inference — display only; the parent screen recomputes at submit.
  // Roll muscles up to their parent regions so the inference matches what the
  // engine eventually sees.
  const muscleParentRegions = selectedMuscles.map(m => MUSCLE_TO_REGION[m])
  const inferenceRegions = Array.from(new Set([...selectedRegions, ...muscleParentRegions]))
  const inferred = inferLocationPattern(inferenceRegions)
  const showPatternBadge = inferenceRegions.length >= 2 && !diffuseUnspecified
  const totalSelected = selectedRegions.length + selectedMuscles.length

  return (
    <div className={styles.picker}>
      <div className={styles.stage}>
        <div className={styles.bodyWrap}>
          <span className={styles.bodyLabel}>Front</span>
          <BodyPickerSVG
            side="front"
            selectedRegions={selectedRegions}
            selectedMuscles={selectedMuscles}
            onRegionTap={(r) => handleRegionTap(r, 'front')}
            onRegionHover={() => {}}
          />
        </div>
        <div className={styles.bodyWrap}>
          <span className={styles.bodyLabel}>Back</span>
          <BodyPickerSVG
            side="back"
            selectedRegions={selectedRegions}
            selectedMuscles={selectedMuscles}
            onRegionTap={(r) => handleRegionTap(r, 'back')}
            onRegionHover={() => {}}
          />
        </div>
      </div>

      <MuscleDrawer
        region={drawerRegion}
        side={drawerSide ?? undefined}
        selectedMuscles={selectedMuscles}
        onToggleMuscle={handleToggleMuscle}
        onClose={handleDrawerClose}
      />

      {showPatternBadge && (
        <div
          className={styles.patternBadge}
          data-testid="pattern-badge"
          aria-live="polite"
        >
          <span className={styles.patternLabel}>Pattern</span>
          <span className={styles.patternValue}>
            {PATTERN_LABEL[inferred as 'single' | 'connected' | 'multifocal' | 'widespread']}
          </span>
        </div>
      )}

      <div className={styles.selectedCard}>
        <span className={styles.selectedLabel}>Selected</span>
        <div className={styles.chipRow}>
          {totalSelected === 0 && !diffuseUnspecified && (
            <span className={styles.empty}>None yet — tap a region above</span>
          )}
          {diffuseUnspecified && (
            <span className={styles.empty}>Diffuse — no specific region</span>
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
        </div>
      </div>

      <button
        type="button"
        className={`${styles.escapeHatch}${diffuseUnspecified ? ' ' + styles.escapeHatchActive : ''}`}
        onClick={handleEscapeHatch}
        aria-pressed={diffuseUnspecified}
      >
        I can't pinpoint where it is
      </button>
    </div>
  )
}
