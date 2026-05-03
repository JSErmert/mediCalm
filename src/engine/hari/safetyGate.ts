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
  // Existing generic flags (retained)
  | 'new_worsening_weakness'
  | 'coordination_change'
  | 'symptoms_severe_or_concerning'
  | 'not_sure'
  // PT-spec neurological red flags (cervical myelopathy / instability screen)
  | 'numbness_extremities_or_saddle'
  | 'dizziness_balance_loss'
  | 'double_vision'
  | 'speech_difficulty'
  | 'swallowing_difficulty'
  | 'drop_attacks'
  // PT-spec cardiovascular red flags (active cardiac event screen)
  | 'chest_pain_or_pressure'
  | 'radiating_pain_jaw_arm'
  | 'interscapular_pain'
  | 'dyspnea_at_rest'
  | 'irregular_heartbeat'

// ── Decision Rules (C4 §decision_rules + PT clinical refinement 2026-05-02) ──

/**
 * Cardiovascular red flags — STOP with 911 escalation message.
 * Authority: PT clinical refinement 2026-05-02
 */
const CARDIO_FLAGS: SafetyFlagClass[] = [
  'chest_pain_or_pressure',
  'radiating_pain_jaw_arm',
  'interscapular_pain',
  'dyspnea_at_rest',
  'irregular_heartbeat',
]

/**
 * Neurological red flags — STOP with provider-contact message.
 * Combines original C4 STOP flags with PT-spec specifics.
 */
const NEURO_STOP_FLAGS: SafetyFlagClass[] = [
  'new_worsening_weakness',
  'coordination_change',
  'symptoms_severe_or_concerning',
  'numbness_extremities_or_saddle',
  'dizziness_balance_loss',
  'double_vision',
  'speech_difficulty',
  'swallowing_difficulty',
  'drop_attacks',
]

/**
 * Flags that result in HOLD — pause, encourage non-urgent awareness.
 * `not_sure` retained from C4 §decision_rules; generic
 * `major_numbness_sensation_change` retired (replaced by specific neuro items).
 */
const HOLD_FLAGS: SafetyFlagClass[] = [
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
  // CARDIO precedence — any cardio flag → 911 message immediately
  const cardioFlag = flags.find((f) => CARDIO_FLAGS.includes(f))
  if (cardioFlag) {
    return {
      outcome: 'STOP',
      trigger: cardioFlag,
      message: 'These symptoms may indicate a serious cardiac event. Call 911 or your local emergency services immediately.',
    }
  }

  // NEURO STOP next
  const neuroFlag = flags.find((f) => NEURO_STOP_FLAGS.includes(f))
  if (neuroFlag) {
    return {
      outcome: 'STOP',
      trigger: neuroFlag,
      message: stopMessage(neuroFlag),
    }
  }

  // HOLD last
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
    case 'not_sure':
      return 'When something feels off but you are not sure what, a cautious approach makes sense. A very soft, brief session may be appropriate — stop immediately if anything feels worse.'
    default:
      return 'Consider checking in with a clinician if you have concerns. You may proceed gently, but stop if symptoms worsen.'
  }
}

// ── Label Helpers for UI ──────────────────────────────────────────────────────

export const SAFETY_FLAG_LABELS: Record<SafetyFlagClass, string> = {
  // Generic flags
  new_worsening_weakness: 'New or worsening weakness',
  coordination_change: 'Coordination trouble',
  symptoms_severe_or_concerning: 'Symptoms feel unusually severe or concerning',
  not_sure: 'Not sure',
  // Neurological red flags
  numbness_extremities_or_saddle: 'Numbness in arms, legs, hands, feet, or groin/saddle area',
  dizziness_balance_loss: 'Dizziness or sudden loss of balance',
  double_vision: 'Double vision',
  speech_difficulty: 'Difficulty speaking or slurred speech',
  swallowing_difficulty: 'Difficulty swallowing',
  drop_attacks: 'Sudden drop attacks (legs give way without warning)',
  // Cardiovascular red flags
  chest_pain_or_pressure: 'Chest pain or pressure',
  radiating_pain_jaw_arm: 'Pain radiating to jaw, neck, or arm',
  interscapular_pain: 'Pain between the shoulder blades',
  dyspnea_at_rest: 'Shortness of breath at rest',
  irregular_heartbeat: 'Irregular or unusually rapid heartbeat',
}

export const STEP_1_SYMPTOMS = [
  'New or worsening weakness',
  'Coordination trouble',
  'Major numbness or sensation change',
  'Symptoms feel unusually severe or concerning',
] as const
