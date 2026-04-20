/**
 * HARI — Continue What Helped (M6.8.3)
 *
 * Reads the last 3–5 sessions, identifies the most recent positive shift signal,
 * maps it to the BreathFamily that produced it, and returns a BreathPrescription
 * plus user-facing subtext.
 *
 * Rules:
 *   - Positive signals only: relaxed | open | steady | energized
 *   - Prefer similar-state sessions (most recent positive)
 *   - Falls back to neutral_reset (stabilization) when no clear signal exists
 *   - Must respect feasibility — passes through buildFeasibilityProfile + prescribeBreath
 *   - Never overrides current feasibility constraints
 *
 * Authority: M6.8.3_Continue_What_Helped_UI_Logic.md
 */

import type {
  BreathPrescription,
  NeedProfile,
  RegulatoryGoal,
} from '../../types/hari'
import type { ShiftOutcome } from '../../types'
import { buildFeasibilityProfile } from './feasibility'
import { selectBreathFamily, prescribeBreath } from './breathFamily'
import { loadHistory } from '../../storage/sessionHistory'

// ── Constants ─────────────────────────────────────────────────────────────────

const POSITIVE_SHIFTS: ShiftOutcome[] = ['relaxed', 'open', 'steady', 'energized']

const SHIFT_GOAL: Record<string, RegulatoryGoal> = {
  relaxed:  'downregulate',
  open:     'decompress',
  steady:   'stabilize',
  energized: 'activate',
}

const SHIFT_SUBTEXT: Record<string, string> = {
  relaxed:  'You felt more relaxed last time',
  open:     'You felt more open last time',
  steady:   'You felt more steady last time',
  energized: 'You felt more energized last time',
}

const FALLBACK_SUBTEXT = 'Based on what helped recently'

// ── Result type ───────────────────────────────────────────────────────────────

export interface ContinueWhatHelpedResult {
  prescription: BreathPrescription
  subtext: string
}

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * Build a BreathPrescription from recent positive shift history.
 *
 * Reads the last 5 sessions with a recorded shift_outcome, finds the most
 * recent positive signal, selects the corresponding BreathFamily via the
 * standard pipeline, and returns a BreathPrescription.
 *
 * Falls back to neutral_reset when no positive signal exists.
 */
export function buildContinueWhatHelpedSession(): ContinueWhatHelpedResult {
  const positiveShift = readBestPositiveShift()

  const goal: RegulatoryGoal = positiveShift
    ? SHIFT_GOAL[positiveShift]
    : 'stabilize'

  const subtext = positiveShift
    ? SHIFT_SUBTEXT[positiveShift]
    : FALLBACK_SUBTEXT

  // Conservative NeedProfile — reduced effort, standard safety, no overload.
  // activationPermitted only when signal was 'energized' to allow gentle_activation.
  const need: NeedProfile = {
    primaryGoal: goal,
    secondaryGoal: undefined,
    effortCapacity: 'reduced',
    safetyLevel: 'standard',
    activationPermitted: positiveShift === 'energized',
    breathDowngraded: false,
    overload: false,
  }

  const feasibility = buildFeasibilityProfile(need)
  const family = selectBreathFamily(need, feasibility)
  const prescription = prescribeBreath(family, need, feasibility)

  return { prescription, subtext }
}

// ── Shift reader ──────────────────────────────────────────────────────────────

function readBestPositiveShift(): ShiftOutcome | null {
  try {
    const recent = loadHistory()
      .filter((e) => e.shift_outcome !== undefined)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    const best = recent.find((e) => POSITIVE_SHIFTS.includes(e.shift_outcome!))
    return best?.shift_outcome ?? null
  } catch {
    return null
  }
}
