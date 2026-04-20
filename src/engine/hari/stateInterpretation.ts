/**
 * HARI — State Interpretation Engine (M6.4)
 *
 * Maps emotional/physical state selections from the M6 intake flow
 * into structured breathing and session parameters.
 *
 * Pure deterministic function — no side effects, no UI dependencies,
 * no AppContext usage.
 */

import type {
  StateInterpretationInput,
  StateInterpretationResult,
  HariEmotionalState,
  BreathPattern,
  EffortLevel,
  SessionBias,
} from '../../types/hari'

// ── Priority Ordering ─────────────────────────────────────────────────────────

/**
 * State priority hierarchy (highest → lowest).
 * When 3–4 states are active, the highest-priority state drives primary output.
 */
const STATE_PRIORITY: HariEmotionalState[] = [
  'overwhelmed',
  'exhausted',
  'pain',
  'anxious',
  'tight',
  'angry',
  'sad',
]

// ── Per-State Defaults ────────────────────────────────────────────────────────

interface StateDefaults {
  breath: BreathPattern
  effort: EffortLevel
  bias: SessionBias
}

const STATE_DEFAULTS: Record<HariEmotionalState, StateDefaults> = {
  pain: {
    breath: '3/5',
    effort: 'minimal',
    bias: 'protect_decompress',
  },
  exhausted: {
    breath: '2/4',
    effort: 'minimal',
    bias: 'restore_minimize_effort',
  },
  overwhelmed: {
    breath: '2/4',
    effort: 'minimal',
    bias: 'simplify_downshift',
  },
  anxious: {
    breath: '4/7',
    effort: 'reduced',
    bias: 'calm_downregulate',
  },
  sad: {
    breath: '3/5',
    effort: 'reduced',
    bias: 'support_stabilize',
  },
  tight: {
    breath: '3/5',
    effort: 'standard',
    bias: 'release_expand',
  },
  angry: {
    breath: '3/5',
    effort: 'standard',
    bias: 'release_ground',
  },
}

// ── Breath Level Ordering ─────────────────────────────────────────────────────

const BREATH_LEVELS: BreathPattern[] = ['4/7', '3/5', '2/4']

function downgradeBreath(breath: BreathPattern): BreathPattern {
  const idx = BREATH_LEVELS.indexOf(breath)
  // Already at lowest level — stays at '2/4'
  return BREATH_LEVELS[Math.min(idx + 1, BREATH_LEVELS.length - 1)]
}

// ── Priority Sort ─────────────────────────────────────────────────────────────

function sortByPriority(states: HariEmotionalState[]): HariEmotionalState[] {
  return [...states].sort(
    (a, b) => STATE_PRIORITY.indexOf(a) - STATE_PRIORITY.indexOf(b)
  )
}

// ── Main Function ─────────────────────────────────────────────────────────────

/**
 * Interpret a set of active emotional/physical states into session parameters.
 *
 * Routing:
 *   1–2 states  → unified (primary + optional secondary)
 *   3–4 states  → prioritized (primary drives all output)
 *   5+ states   → overload protocol
 *
 * Safety downgrade:
 *   If intensity >= 7 OR sensitivity === 'high', breath is downgraded one level.
 */
export function interpretStates(
  input: StateInterpretationInput
): StateInterpretationResult {
  const { states, intensity, sensitivity } = input

  // ── Overload Protocol ─────────────────────────────────────────────────────

  if (states.length >= 5) {
    const safetyDowngrade =
      intensity >= 7 || sensitivity === 'high'

    return {
      overload: true,
      primary: 'overwhelmed',
      secondary: undefined,
      breath: safetyDowngrade ? downgradeBreath('2/4') : '2/4',
      effort: 'minimal',
      bias: 'simplify_downshift',
    }
  }

  // ── Sort by priority ──────────────────────────────────────────────────────

  const sorted = sortByPriority(states)
  const primary = sorted[0]
  const secondary = sorted.length >= 2 ? sorted[1] : undefined

  const defaults = STATE_DEFAULTS[primary]
  let breath = defaults.breath

  // ── Safety Downgrade ──────────────────────────────────────────────────────

  const needsDowngrade = intensity >= 7 || sensitivity === 'high'
  if (needsDowngrade) {
    breath = downgradeBreath(breath)
  }

  // ── Unified (1–2) vs Prioritized (3–4) ───────────────────────────────────

  return {
    overload: false,
    primary,
    secondary: states.length <= 2 ? secondary : undefined,
    breath,
    effort: defaults.effort,
    bias: defaults.bias,
  }
}
