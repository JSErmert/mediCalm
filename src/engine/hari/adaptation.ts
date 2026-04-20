/**
 * HARI — Controlled Adaptation Layer (M7.1)
 *
 * Thin adaptation layer sitting after the M6.8 pipeline.
 * Reads recent shift feedback and applies one minimal, controlled adjustment
 * to the final BreathPrescription.
 *
 * M7.1 Rules:
 *   1. Change only when signal is clear
 *   2. Change only one major variable at a time (family | duration | pacing)
 *   3. Never override current feasibility
 *   4. Only adapt strongly when prior state is similar to current
 *   5. Prefer stability over novelty
 *
 * Authority: M7.1_Controlled_Adaptation_Layer.md
 */

import type {
  BreathPrescription,
  NeedProfile,
  RegulatoryGoal,
  StateInterpretationResult,
} from '../../types/hari'
import type { ShiftOutcome } from '../../types'
import type { HARIContext } from './context'
import { loadHistory } from '../../storage/sessionHistory'

// ── Goal classes for similarity comparison ────────────────────────────────────

type GoalClass =
  | 'decompressive'
  | 'restorative'
  | 'regulatory'
  | 'expansive'
  | 'grounding'
  | 'activating'

const GOAL_CLASS: Record<RegulatoryGoal, GoalClass> = {
  decompress:   'decompressive',
  restore:      'restorative',
  stabilize:    'regulatory',
  downregulate: 'regulatory',
  expand:       'expansive',
  ground:       'grounding',
  activate:     'activating',
}

// Maps prior primary state to its regulatory goal
const PRIOR_GOAL_MAP: Record<string, RegulatoryGoal> = {
  overwhelmed: 'downregulate',
  pain:        'decompress',
  exhausted:   'restore',
  anxious:     'downregulate',
  tight:       'expand',
  angry:       'ground',
  sad:         'restore',
}

// ── Duration constants ────────────────────────────────────────────────────────

const DURATION_INCREASE_S = 60   // positive: add 1 min if safe
const DURATION_REDUCE_S = 60     // neutral/negative: subtract 1 min
const MIN_DURATION_S = 120       // floor
const MAX_DURATION_S = 480       // ceiling (8 min)

// ── Similarity check ──────────────────────────────────────────────────────────

/**
 * True when the current session is similar enough to the prior session
 * to warrant strong adaptation.
 *
 * Compares:
 *   - goal class (groups related regulatory goals)
 *   - mixed vs single-state condition
 *   - high-safety vs non-high-safety band
 *
 * Authority: M7.1 Similarity Rule
 */
export function isSimilarState(
  current: NeedProfile,
  prior: StateInterpretationResult
): boolean {
  const priorGoal = PRIOR_GOAL_MAP[prior.primary] ?? 'stabilize'
  if (GOAL_CLASS[current.primaryGoal] !== GOAL_CLASS[priorGoal]) return false

  // Mixed vs single-state must match
  if ((current.secondaryGoal !== undefined) !== (prior.secondary !== undefined)) return false

  // Safety band: high vs non-high must match
  if ((current.safetyLevel === 'high') !== (prior.effort === 'minimal')) return false

  return true
}

// ── Shift signal reader ───────────────────────────────────────────────────────

/**
 * Read the most recent shift_outcome from session history.
 * Returns null when no session with a shift_outcome exists.
 */
function readLastShiftOutcome(): ShiftOutcome | null {
  try {
    const history = loadHistory()
      .filter((e) => e.shift_outcome !== undefined)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return history[0]?.shift_outcome ?? null
  } catch {
    return null
  }
}

// ── Adaptation logic ──────────────────────────────────────────────────────────

/**
 * Apply one controlled adaptation to a BreathPrescription based on recent
 * session feedback and state similarity.
 *
 * Modifies at most ONE major variable: family, duration, or pacing.
 * Never overrides feasibility constraints already applied.
 * Returns the original prescription unchanged when conditions are not met.
 *
 * Authority: M7.1 Adaptation Logic + One-Variable Rule
 */
export function applyHARIAdaptation(
  prescription: BreathPrescription,
  context: HARIContext,
  need: NeedProfile
): BreathPrescription {
  // Never adapt overload sessions — system is already at minimum load
  if (need.overload) return prescription

  // Require a recent prior entry for similarity comparison
  if (!context.isRecent || !context.lastEntry) return prescription

  const shift = readLastShiftOutcome()
  if (!shift) return prescription

  const similar = isSimilarState(need, context.lastEntry.result)

  // ── Positive signals: relaxed | open | steady | energized ────────────────
  if (
    shift === 'relaxed' ||
    shift === 'open' ||
    shift === 'steady' ||
    shift === 'energized'
  ) {
    if (!similar) return prescription  // no strong adaptation when not similar

    // Keep family; optional duration increase only when safe headroom exists
    if (
      need.safetyLevel === 'standard' &&
      need.effortCapacity === 'standard' &&
      prescription.durationSeconds < MAX_DURATION_S
    ) {
      const newDuration = Math.min(
        prescription.durationSeconds + DURATION_INCREASE_S,
        MAX_DURATION_S
      )
      return {
        ...prescription,
        durationSeconds: newDuration,
        adaptationApplied: true,
        adaptationNote: `positive signal (${shift}): duration extended by ${DURATION_INCREASE_S}s`,
      }
    }

    return prescription
  }

  // ── Neutral signal: no_change ─────────────────────────────────────────────
  if (shift === 'no_change') {
    // Keep family — try duration reduction first (one variable)
    const newDuration = Math.max(
      prescription.durationSeconds - DURATION_REDUCE_S,
      MIN_DURATION_S
    )
    if (newDuration !== prescription.durationSeconds) {
      return {
        ...prescription,
        durationSeconds: newDuration,
        adaptationApplied: true,
        adaptationNote: `neutral signal: duration reduced by ${DURATION_REDUCE_S}s to vary load`,
      }
    }

    // Duration already at floor — soften pacing (extend exhale 1s) if room exists
    if (prescription.exhaleSeconds < 7) {
      return {
        ...prescription,
        exhaleSeconds: prescription.exhaleSeconds + 1,
        adaptationApplied: true,
        adaptationNote: 'neutral signal: exhale extended 1s to soften pacing',
      }
    }

    return prescription
  }

  // ── Negative signal: tense_tight ─────────────────────────────────────────
  if (shift === 'tense_tight') {
    // First response: shorten duration to reduce load
    const newDuration = Math.max(
      prescription.durationSeconds - DURATION_REDUCE_S,
      MIN_DURATION_S
    )
    if (newDuration !== prescription.durationSeconds) {
      return {
        ...prescription,
        durationSeconds: newDuration,
        adaptationApplied: true,
        adaptationNote: 'negative signal (tense_tight): duration shortened to reduce load',
      }
    }

    // Duration already at floor — consider family bridge to neutral_reset
    // Only switch if current family is not already a simplified one
    const alreadySimple =
      prescription.family === 'neutral_reset' ||
      prescription.family === 'restorative' ||
      prescription.family === 'flare_safe_soft_exhale'

    if (!alreadySimple && similar) {
      return {
        ...prescription,
        family: 'neutral_reset',
        sessionName: 'Steady Ground',
        openingPrompt: "You're supported here. Let's breathe steadily together.",
        instructionTone: 'supportive / steady',
        inhaleSeconds: 4,
        holdSeconds: 0,
        exhaleSeconds: 6,
        adaptationApplied: true,
        adaptationNote: 'negative signal (tense_tight): family bridged to neutral_reset for stability',
      }
    }

    return prescription
  }

  return prescription
}
