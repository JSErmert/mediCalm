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
  BodyLocation,
  SymptomFocus,
  LocationPattern,
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

// ── Wire-through 2026-05-05 ──────────────────────────────────────────────────
//
// Authority: docs/superpowers/specs/2026-05-05-intake-wire-through-design.md
//
// PT pass 2 made `irritability`, `session_length_preference`, and the body
// picker (`location` / `location_muscles` / `location_pattern`) explicit user
// fields, but the engine consumed silent / adaptive defaults instead. The
// helpers below derive engine-facing values from the user's explicit picks.

const FLARE_RANK: Record<FlareSensitivity, number> = {
  low: 0,
  not_sure: 1,   // treated as moderate-equivalent for safety ordering
  moderate: 1,
  high: 2,
}

/**
 * Apply irritability as a one-way safety escalator on flare_sensitivity.
 * Most-irritable patterns can only RAISE the effective flare value
 * (toward 'high'), never lower it — matches the engine's "softness first"
 * philosophy. The user's explicit flare_sensitivity pick is the floor.
 *
 *   fast_onset_slow_resolution + low      → high  (escalation)
 *   fast_onset_slow_resolution + high     → high  (no-op)
 *   symmetric or slow_onset_fast_resolution → unchanged
 */
export function applyIrritabilityEscalation(
  flare: FlareSensitivity,
  irritability: IrritabilityPattern
): FlareSensitivity {
  if (irritability !== 'fast_onset_slow_resolution') return flare
  return FLARE_RANK[flare] >= FLARE_RANK['high'] ? flare : 'high'
}

/**
 * Buckets each BodyLocation region into one of the engine's symptom_focus
 * categories. `symptom_focus` is a 6-bucket coarse classifier; many regions
 * collapse onto 'spread_tension' as a deliberate, documented limitation
 * (lower-body and limb regions don't yet have dedicated buckets).
 */
function regionBucket(region: BodyLocation): SymptomFocus {
  switch (region) {
    case 'jaw_tmj_facial':
      return 'jaw_facial'
    case 'head_temples':
    case 'neck':
    case 'shoulder_left':
    case 'shoulder_right':
    case 'upper_back':
      return 'neck_upper'
    case 'rib_side':
    case 'mid_back':
    case 'chest_sternum':
      return 'rib_side_back'
    default:
      // Lower-body, limb, and pelvic regions all map to spread_tension.
      // This is lossy but accurate-direction; new buckets require an engine
      // refactor and are out of scope for this round.
      return 'spread_tension'
  }
}

/**
 * Derive symptom_focus from the user's body picker selection. Falls back to
 * the adaptive default only when the user has provided no anatomical input
 * (anxious branch with empty location, or escape hatch tapped).
 *
 * Mapping rules (priority order):
 *   1. location_pattern === 'diffuse_unspecified' → fallback (user said diffuse)
 *   2. location_pattern === 'widespread'          → 'spread_tension'
 *   3. location is empty                          → fallback
 *   4. multiple buckets                            → 'mixed'
 *   5. single bucket                               → that bucket
 */
export function deriveSymptomFocusFromLocation(
  location: BodyLocation[],
  locationPattern: LocationPattern | undefined,
  fallback: SymptomFocus
): SymptomFocus {
  if (locationPattern === 'diffuse_unspecified') return fallback
  if (locationPattern === 'widespread') return 'spread_tension'
  if (location.length === 0) return fallback

  const buckets = new Set<SymptomFocus>()
  for (const region of location) buckets.add(regionBucket(region))
  if (buckets.size > 1) return 'mixed'
  return Array.from(buckets)[0]
}
