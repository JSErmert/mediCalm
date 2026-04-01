/**
 * MediCalm Interpretation Layer — M3.2.2
 *
 * Deterministic, rule-based mapping from PainInputState to a SessionInterpretation.
 *
 * Output:
 *   pattern        — internal classification (not shown in primary UI)
 *   modifiers      — derived secondary descriptors
 *   focus          — one user-facing sentence (enriched by pattern + modifiers)
 *   breathingHint  — optional approach note (shown only for nerve / breathing patterns)
 *
 * Language rules: no diagnosis, no condition naming, no medical claims, no speculation.
 * Tone: neutral, clinical, grounded.
 *
 * Authority: Source Truth Doctrine (doc 02) — claims boundaries
 *            Safety + Reassurance Spec (doc 06) — language constraints
 */
import type { PainInputState } from '../types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type PatternId =
  | 'nerve_sensitivity'
  | 'high_sensitivity'
  | 'breathing_restriction'
  | 'jaw_neck_guarding'
  | 'postural_strain'
  | 'tension_overload'
  | 'stable_discomfort'
  | 'diffuse_activation'

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'very_high'
export type SpreadLevel = 'localized' | 'regional' | 'diffuse'

export interface SessionModifiers {
  /** Derived from pain_level */
  severity: SeverityLevel
  /** Derived from location_tags count */
  spread: SpreadLevel
  /** shallow_breathing in symptoms OR chest / ribs in location */
  breathingInvolvement: boolean
  /** Trigger is sitting, driving, or screen_use */
  posturalLoading: boolean
  /** guarding or instability in symptom_tags */
  sensitivityGuarding: boolean
}

export interface SessionInterpretation {
  pattern: PatternId
  modifiers: SessionModifiers
  /** One-sentence focus shown on session setup screen */
  focus: string
  /**
   * Optional breathing approach note.
   * Shown only for nerve_sensitivity and breathing_restriction —
   * patterns where breathing approach is meaningfully different from the default.
   */
  breathingHint?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NERVE_SYMPTOMS = new Set([
  'burning', 'tingling', 'numbness', 'nerve_like', 'radiating',
])

const POSTURAL_TRIGGERS = new Set([
  'sitting', 'driving', 'screen_use',
])

const SPINAL_LOCATIONS = new Set([
  'lower_back', 'upper_back', 'back_neck', 'shoulders', 'mid_back',
])

const BREATHING_LOCATIONS = new Set(['chest', 'ribs'])

// ── Modifier derivation ───────────────────────────────────────────────────────

function deriveSeverity(pain_level: number): SeverityLevel {
  if (pain_level <= 3) return 'low'
  if (pain_level <= 6) return 'moderate'
  if (pain_level <= 8) return 'high'
  return 'very_high'
}

function deriveSpread(location_tags: readonly string[]): SpreadLevel {
  if (location_tags.length >= 5) return 'diffuse'
  if (location_tags.length >= 3) return 'regional'
  return 'localized'
}

function deriveModifiers(input: PainInputState): SessionModifiers {
  return {
    severity: deriveSeverity(input.pain_level),
    spread: deriveSpread(input.location_tags),
    breathingInvolvement:
      input.symptom_tags.includes('shallow_breathing') ||
      input.location_tags.some((l) => BREATHING_LOCATIONS.has(l)),
    posturalLoading:
      input.trigger_tag !== undefined && POSTURAL_TRIGGERS.has(input.trigger_tag),
    sensitivityGuarding:
      input.symptom_tags.includes('guarding') || input.symptom_tags.includes('instability'),
  }
}

// ── Focus statement derivation ────────────────────────────────────────────────

function focusForNerveSensitivity(modifiers: SessionModifiers): string {
  if (modifiers.severity === 'high' || modifiers.severity === 'very_high') {
    return 'Ease heightened nerve sensitivity and lower the protective response.'
  }
  return 'Ease nerve sensitivity and reduce the protective response.'
}

function focusForHighSensitivity(modifiers: SessionModifiers): string {
  if (modifiers.severity === 'very_high') {
    return 'Reduce overactivation and ease the system under high pain load.'
  }
  return 'Reduce overall activation and support the system under elevated pain.'
}

function focusForPosturalStrain(modifiers: SessionModifiers): string {
  if (modifiers.breathingInvolvement) {
    return 'Unload postural compression and restore breathing depth.'
  }
  return 'Unload postural compression and support spinal decompression.'
}

function focusForTensionOverload(modifiers: SessionModifiers): string {
  if (modifiers.spread === 'diffuse' || modifiers.spread === 'regional') {
    return 'Release widespread tension and calm the overactivated response.'
  }
  return 'Release accumulated tension and calm the protective response.'
}

function focusForJawNeckGuarding(modifiers: SessionModifiers): string {
  if (modifiers.sensitivityGuarding) {
    return 'Release jaw and neck holding through regulated breath.'
  }
  return 'Release jaw and neck tension through regulated breath.'
}

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * Derive a session interpretation from the resolved pain input.
 * Rules are checked in priority order — first match returns.
 */
export function interpretSession(input: PainInputState): SessionInterpretation {
  const { pain_level, location_tags, symptom_tags, trigger_tag } = input
  const modifiers = deriveModifiers(input)

  // 1. Nerve / sensitivity symptoms — always highest priority
  if (symptom_tags.some((t) => NERVE_SYMPTOMS.has(t))) {
    return {
      pattern: 'nerve_sensitivity',
      modifiers,
      focus: focusForNerveSensitivity(modifiers),
      breathingHint: 'Prioritise softness of breath over depth or volume.',
    }
  }

  // 2. High sensitivity — widespread high-pain without specific nerve involvement
  if (pain_level >= 7 && (location_tags.length >= 3 || symptom_tags.length >= 5)) {
    return {
      pattern: 'high_sensitivity',
      modifiers,
      focus: focusForHighSensitivity(modifiers),
    }
  }

  // 3. Breathing restriction — shallow breathing with rib or chest involvement
  if (
    symptom_tags.includes('shallow_breathing') &&
    location_tags.some((l) => BREATHING_LOCATIONS.has(l))
  ) {
    return {
      pattern: 'breathing_restriction',
      modifiers,
      focus: 'Restore breathing depth and release restriction in the rib area.',
      breathingHint: 'Allow the ribcage to expand laterally on each inhale.',
    }
  }

  // 4. Jaw / neck guarding — jaw location is a strong indicator
  if (location_tags.includes('jaw')) {
    return {
      pattern: 'jaw_neck_guarding',
      modifiers,
      focus: focusForJawNeckGuarding(modifiers),
    }
  }

  // 5. Postural strain — activity-linked spinal or shoulder pattern
  if (
    trigger_tag !== undefined &&
    POSTURAL_TRIGGERS.has(trigger_tag) &&
    location_tags.some((l) => SPINAL_LOCATIONS.has(l))
  ) {
    return {
      pattern: 'postural_strain',
      modifiers,
      focus: focusForPosturalStrain(modifiers),
    }
  }

  // 6. Tension overload — tightness / guarding / pressure at moderate or higher pain
  if (
    symptom_tags.some((t) => t === 'tightness' || t === 'guarding' || t === 'pressure') &&
    pain_level >= 4
  ) {
    return {
      pattern: 'tension_overload',
      modifiers,
      focus: focusForTensionOverload(modifiers),
    }
  }

  // 7. Stable discomfort — low pain, stiffness / soreness / aching dominant
  if (
    pain_level <= 3 &&
    symptom_tags.some((t) => t === 'stiffness' || t === 'soreness' || t === 'aching')
  ) {
    return {
      pattern: 'stable_discomfort',
      modifiers,
      focus: 'Regulate and stabilize through controlled, even breathing.',
    }
  }

  // 8. Default — diffuse or mixed presentation
  return {
    pattern: 'diffuse_activation',
    modifiers,
    focus: 'Calm the system and reduce tension through steady breath.',
  }
}
