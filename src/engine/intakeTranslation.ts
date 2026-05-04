/**
 * intakeTranslation — PT Clinical Pass 2.
 *
 * Maps PT-aligned user input (IntakeBranch, IrritabilityPattern) to the
 * existing HARI engine input types (HariEmotionalState[], FlareSensitivity).
 * Keeps M6.4/M6.5/M6.8 engine investment intact behind the simpler front door.
 *
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import type {
  HariEmotionalState,
  FlareSensitivity,
  IntakeBranch,
  IrritabilityPattern,
} from '../types/hari'

/**
 * Maps PT-aligned intent branch to M6.4 emotional state input.
 * Single-state output per branch — PT used "or" between terms (synonyms,
 * not a checklist). M6.4 unified mode handles single state cleanly.
 */
export function branchToEmotionalStates(
  branch: IntakeBranch
): HariEmotionalState[] {
  return branch === 'tightness_or_pain' ? ['pain'] : ['anxious']
}

/**
 * Maps PT irritability pattern to existing FlareSensitivity field.
 * Authority: Maitland irritability classification.
 *   fast_onset_slow_resolution → high (most irritable)
 *   slow_onset_fast_resolution → low (least irritable)
 *   symmetric                  → moderate
 */
export function irritabilityToFlareSensitivity(
  pattern: IrritabilityPattern
): FlareSensitivity {
  switch (pattern) {
    case 'fast_onset_slow_resolution':
      return 'high'
    case 'slow_onset_fast_resolution':
      return 'low'
    case 'symmetric':
      return 'moderate'
  }
}
