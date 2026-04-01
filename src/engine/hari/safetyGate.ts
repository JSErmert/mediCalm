/**
 * C4 — HARI Safety Gate
 * Authority: M4.0–4.5_v1.1_CLARIFICATIONS.md §C4
 *
 * Runs AFTER M4.2 MVP intake, BEFORE M4.3 state estimation.
 * Purpose: preserve safe stop path despite reduced intake detail vs M3.
 *
 * This gate is:
 *   - NOT part of state estimation
 *   - NOT part of link mapping
 *   - NOT part of intervention selection
 *   - A pre-engine eligibility gate
 *
 * Outcomes:
 *   CLEAR → proceed to M4.3
 *   HOLD  → pause, prompt non-urgent clinical awareness
 *   STOP  → do not proceed to session
 */
import type { SafetyGateResult } from '../../types/hari'

// ── Safety Flag Types ─────────────────────────────────────────────────────────

export type SafetyFlagClass =
  | 'new_worsening_weakness'
  | 'coordination_change'
  | 'major_numbness_sensation_change'
  | 'symptoms_severe_or_concerning'
  | 'not_sure'

// ── Decision Rules (C4 §decision_rules) ──────────────────────────────────────

/**
 * Flags that result in STOP — do not proceed to session.
 * Authority: C4 §decision_rules
 */
const STOP_FLAGS: SafetyFlagClass[] = [
  'new_worsening_weakness',
  'coordination_change',
  'symptoms_severe_or_concerning',
]

/**
 * Flags that result in HOLD — pause, encourage non-urgent awareness.
 * Authority: C4 §decision_rules
 */
const HOLD_FLAGS: SafetyFlagClass[] = [
  'major_numbness_sensation_change',
  'not_sure',
]

// ── Gate Functions ────────────────────────────────────────────────────────────

/**
 * Step 1: Initial safety check — is any red-flag symptom happening right now?
 * Returns true if user reports any concerning symptom.
 * Authority: C4 §Step 1
 */
export function safetyStep1HasConcern(): boolean {
  // This is a UI-driven gate — the screen asks the user.
  // This function documents the logical question being asked:
  // "Before we begin, are any of these happening right now?"
  // The screen captures the user's YES/NO and calls step 2 if YES.
  // This module provides the classification logic.
  return false // always call via classifyFlags below with user input
}

/**
 * Step 2: Given the user-selected flag(s), classify outcome.
 * Authority: C4 §Step 2, §decision_rules
 */
export function classifySafetyFlags(
  flags: SafetyFlagClass[]
): SafetyGateResult {
  // STOP takes priority over HOLD
  const stopFlag = flags.find((f) => STOP_FLAGS.includes(f))
  if (stopFlag) {
    return {
      outcome: 'STOP',
      trigger: stopFlag,
      message: stopMessage(stopFlag),
    }
  }

  const holdFlag = flags.find((f) => HOLD_FLAGS.includes(f))
  if (holdFlag) {
    return {
      outcome: 'HOLD',
      trigger: holdFlag,
      message: holdMessage(holdFlag),
    }
  }

  return { outcome: 'CLEAR' }
}

/**
 * Direct CLEAR path — user reported no concerns in Step 1.
 */
export function safetyGateClear(): SafetyGateResult {
  return { outcome: 'CLEAR' }
}

// ── User-Facing Messages (non-diagnostic, calm, medically restrained) ─────────

function stopMessage(flag: SafetyFlagClass): string {
  switch (flag) {
    case 'new_worsening_weakness':
      return 'New or worsening weakness should be assessed by a clinician before starting a guided breathing session. Please seek professional advice first.'
    case 'coordination_change':
      return 'Coordination changes can be important to assess. Please check in with a clinician before starting a session today.'
    case 'symptoms_severe_or_concerning':
      return 'When symptoms feel unusually severe or concerning, a guided session is not the right first step. Please consider speaking with a clinician.'
    default:
      return 'These symptoms suggest it would be safer to check in with a clinician before starting a session today.'
  }
}

function holdMessage(flag: SafetyFlagClass): string {
  switch (flag) {
    case 'major_numbness_sensation_change':
      return 'Strong or new sensation changes are worth keeping an eye on. A gentle session is possible if symptoms are stable, but consider checking in with a clinician if they worsen.'
    case 'not_sure':
      return 'When something feels off but you are not sure what, a cautious approach makes sense. A very soft, brief session may be appropriate — stop immediately if anything feels worse.'
    default:
      return 'Consider checking in with a clinician if you have concerns. You may proceed gently, but stop if symptoms worsen.'
  }
}

// ── Label Helpers for UI ──────────────────────────────────────────────────────

export const SAFETY_FLAG_LABELS: Record<SafetyFlagClass, string> = {
  new_worsening_weakness: 'New or worsening weakness',
  coordination_change: 'Coordination trouble',
  major_numbness_sensation_change: 'Major numbness or sensation change',
  symptoms_severe_or_concerning: 'Symptoms feel unusually severe or concerning',
  not_sure: 'Not sure',
}

export const STEP_1_SYMPTOMS = [
  'New or worsening weakness',
  'Coordination trouble',
  'Major numbness or sensation change',
  'Symptoms feel unusually severe or concerning',
] as const
