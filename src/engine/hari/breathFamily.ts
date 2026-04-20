/**
 * HARI — Breath Family Selection + Prescription (M6.8 / M6.8.1)
 *
 * Selects a BreathFamily from NeedProfile + FeasibilityProfile,
 * then produces a BreathPrescription with concrete session timing.
 *
 * Selection rules (priority order):
 *   1. Mixed/uncertain (secondary goal)  → neutral_reset always
 *   2. Activation permitted              → gentle_activation
 *   3. Decompress goal                   → flare_safe_soft_exhale (if breathDowngraded)
 *                                           decompression_expand  (otherwise)
 *   4. Primary goal                      → mapped family
 *
 * Timing invariants:
 *   - Non-activation families:  exhale > inhale
 *   - gentle_activation:        exhale may be <= inhale (inhale-dominant by design)
 *   - inhale >= minInhaleSeconds (all families)
 *   - hold = 0 when !holdsPermitted
 *   - duration capped at maxDurationSeconds
 *
 * Authority: M6.8.1 — Need + Breath Family Alignment
 */

import type {
  NeedProfile,
  FeasibilityProfile,
  BreathFamily,
  BreathFamilyName,
  BreathPrescription,
  EffortLevel,
} from '../../types/hari'

// ── Duration by Effort ────────────────────────────────────────────────────────

const DURATION_BY_EFFORT: Record<EffortLevel, number> = {
  minimal:  240,  // 4 min
  reduced:  360,  // 6 min
  standard: 480,  // 8 min
}

// ── Breath Family Definitions ─────────────────────────────────────────────────

const BREATH_FAMILIES: Record<BreathFamilyName, BreathFamily> = {
  // Pain + high sensitivity — low effort, soft pacing, no demand
  flare_safe_soft_exhale: {
    name: 'flare_safe_soft_exhale',
    inhaleSeconds: 3,
    holdSeconds: 0,
    exhaleSeconds: 6,
    sessionName: 'Gentle Breath',
    instructionTone: 'protective / gentle',
    openingPrompt: "Let's keep this light. No effort needed — just let your body settle.",
  },
  // Pain, standard sensitivity — fuller expansion, 4/6
  decompression_expand: {
    name: 'decompression_expand',
    inhaleSeconds: 4,
    holdSeconds: 0,
    exhaleSeconds: 6,
    sessionName: 'Open Breath',
    instructionTone: 'decompressive / spacious',
    openingPrompt: "Let's give your body a little more room. Soft and unhurried.",
  },
  // Exhausted, sad without activation — gentle recovery support
  restorative: {
    name: 'restorative',
    inhaleSeconds: 3,
    holdSeconds: 0,
    exhaleSeconds: 6,
    sessionName: 'Rest and Restore',
    instructionTone: 'restorative / minimal',
    openingPrompt: "Nothing to do here. We'll breathe softly and let your system rest.",
  },
  // Mixed/uncertain — steady moderate neutral
  neutral_reset: {
    name: 'neutral_reset',
    inhaleSeconds: 4,
    holdSeconds: 0,
    exhaleSeconds: 6,
    sessionName: 'Steady Ground',
    instructionTone: 'supportive / steady',
    openingPrompt: "You're supported here. Let's breathe steadily together.",
  },
  // Anxious, overwhelmed — strong exhale bias, parasympathetic
  calm_downregulate: {
    name: 'calm_downregulate',
    inhaleSeconds: 4,
    holdSeconds: 0,
    exhaleSeconds: 7,
    sessionName: 'Calm Reset',
    instructionTone: 'calming / direct',
    openingPrompt: "Follow the breath. Each cycle helps your nervous system settle.",
  },
  // Tight — spacious lateral expansion
  lateral_expansion: {
    name: 'lateral_expansion',
    inhaleSeconds: 3,
    holdSeconds: 0,
    exhaleSeconds: 5,
    sessionName: 'Open and Release',
    instructionTone: 'expansion-focused / spacious',
    openingPrompt: "Give your body a little more space. Easy, slow expansion.",
  },
  // Angry — grounded anchored rhythm
  grounding: {
    name: 'grounding',
    inhaleSeconds: 3,
    holdSeconds: 0,
    exhaleSeconds: 5,
    sessionName: 'Ground and Release',
    instructionTone: 'grounding / release-oriented',
    openingPrompt: "Feel the ground beneath you. Let's breathe through it.",
  },
  // Sad/exhausted when feasible — mild inhale-dominant lift (4/3)
  gentle_activation: {
    name: 'gentle_activation',
    inhaleSeconds: 4,
    holdSeconds: 0,
    exhaleSeconds: 3,
    sessionName: 'Gentle Lift',
    instructionTone: 'supportive / energising',
    openingPrompt: "A little space to breathe. Steady and supported.",
  },
}

// ── Family Selection ──────────────────────────────────────────────────────────

/**
 * Select a breath family from the need and feasibility profiles.
 */
export function selectBreathFamily(
  need: NeedProfile,
  _feasibility: FeasibilityProfile
): BreathFamily {
  // Mixed/uncertain → neutral_reset always, regardless of primary goal
  if (need.secondaryGoal !== undefined) {
    return BREATH_FAMILIES.neutral_reset
  }

  // Activation permitted (sad/exhausted, all gating conditions passed)
  if (need.activationPermitted) {
    return BREATH_FAMILIES.gentle_activation
  }

  switch (need.primaryGoal) {
    case 'decompress':
      // Pain with high sensitivity (breath downgraded) → softer, lower effort
      return need.breathDowngraded
        ? BREATH_FAMILIES.flare_safe_soft_exhale
        : BREATH_FAMILIES.decompression_expand

    case 'restore':      return BREATH_FAMILIES.restorative
    case 'stabilize':    return BREATH_FAMILIES.neutral_reset
    case 'downregulate': return BREATH_FAMILIES.calm_downregulate
    case 'expand':       return BREATH_FAMILIES.lateral_expansion
    case 'ground':       return BREATH_FAMILIES.grounding
    case 'activate':     return BREATH_FAMILIES.gentle_activation
  }
}

// ── Prescription Builder ──────────────────────────────────────────────────────

/**
 * Convert a selected BreathFamily into a final BreathPrescription.
 *
 * Applies feasibility constraints and timing invariants:
 * - Non-activation: exhale > inhale enforced
 * - gentle_activation: inhale-dominant ratio preserved (exhale may be <= inhale)
 */
export function prescribeBreath(
  family: BreathFamily,
  need: NeedProfile,
  feasibility: FeasibilityProfile
): BreathPrescription {
  const inhale = Math.max(family.inhaleSeconds, feasibility.minInhaleSeconds)
  const hold = feasibility.holdsPermitted ? family.holdSeconds : 0

  const isActivation = family.name === 'gentle_activation'
  const exhale = isActivation
    ? family.exhaleSeconds                        // inhale-dominant: no ratio constraint
    : Math.max(family.exhaleSeconds, inhale + 1) // all others: exhale > inhale

  const baseDuration = DURATION_BY_EFFORT[need.effortCapacity]
  const duration = Math.min(baseDuration, feasibility.maxDurationSeconds)

  return {
    family: family.name,
    inhaleSeconds: inhale,
    holdSeconds: hold,
    exhaleSeconds: exhale,
    durationSeconds: duration,
    sessionName: family.sessionName,
    instructionTone: family.instructionTone,
    openingPrompt: family.openingPrompt,
    overloadSafe: need.overload,
    feasibilityApplied: feasibility.feasibilityApplied,
    feasibilityNote: feasibility.feasibilityNote,
  }
}
