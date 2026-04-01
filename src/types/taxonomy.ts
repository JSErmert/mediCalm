/**
 * MediCalm Canonical Taxonomy
 * Authority: Input Taxonomy (doc 14), Execution Spec (doc 04), UX/UI Experience Report (doc 12)
 *
 * Controlled-vocabulary values used across the entire system.
 * Synonyms from free text must be normalised to these canonical strings
 * before engine processing (M2).
 * All values are lowercase_snake_case.
 */

import type { SeverityBand } from './index'

// ── Location Tags ──────────────────────────────────────────────────────────────
// Body regions where the user experiences symptoms.
export const LOCATION_TAGS = [
  // ── Head + jaw region ────────────────────────────────────────────────────────
  'head',
  'jaw',
  'ear',             // jaw-cervical co-contraction territory; → MECH_JAW_CERVICAL_CO_CONTRACTION
  // ── Neck region ──────────────────────────────────────────────────────────────
  'front_neck',
  'back_neck',
  'throat',          // anterior cervical; → MECH_CERVICAL_GUARDING
  // ── Shoulder + upper body ────────────────────────────────────────────────────
  'shoulders',
  'chest',
  'upper_back',
  'ribs',
  'mid_back',        // thoracic/costovertebral region; → MECH_RIB_RESTRICTION
  // ── Lower body ───────────────────────────────────────────────────────────────
  'lower_back',
  'hips',
  // ── Extremities — also safety-routing candidates for radiating/nerve patterns ─
  'arm',             // radiating territory; → MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
  'hand',            // distal radiating; also triggers hand_dysfunction safety precheck in M2
] as const

export type LocationTag = (typeof LOCATION_TAGS)[number]

// ── Symptom Tags ───────────────────────────────────────────────────────────────
// How the user experiences their symptoms.
export const SYMPTOM_TAGS = [
  // ── Sensory quality ──────────────────────────────────────────────────────────
  'burning',
  'tingling',
  'numbness',
  'nerve_like',      // neuropathic / electrical quality; strong → MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
  'radiating',       // spreading / traveling sensation; strong → MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
  'sharp',
  'throbbing',
  // ── Musculoskeletal quality ───────────────────────────────────────────────────
  'tightness',
  'pressure',
  'soreness',
  'aching',
  'stiffness',
  // ── Functional / state quality ───────────────────────────────────────────────
  'shallow_breathing',    // breathing restriction; strong → MECH_RIB_RESTRICTION
  'guarding',             // active muscle protection; → MECH_CERVICAL_GUARDING, MECH_GENERAL_OVERPROTECTION_STATE
  'instability',          // sense of positional instability; → MECH_GENERAL_OVERPROTECTION_STATE
  // ── Safety-adjacent — present as symptom tags; M2 engine handles escalation routing ──
  'coordination_change',  // altered motor coordination; may route to SAFETY_STOP_MODE in M2
  'weakness',             // loss of strength; may route to SAFETY_STOP_MODE in M2
] as const

export type SymptomTag = (typeof SYMPTOM_TAGS)[number]

/**
 * UI grouping for symptom chips — M3.1.1.
 * Organises SYMPTOM_TAGS into labelled clusters for scan speed and recognition.
 * Does NOT change canonical values or engine routing.
 *
 * safetyAdjacent: true → chips rendered with extra separation and reduced prominence.
 */
export const SYMPTOM_GROUPS = [
  {
    label: 'Sensation type',
    tags: ['burning', 'tingling', 'numbness', 'nerve_like', 'radiating'] as const,
    safetyAdjacent: false,
  },
  {
    label: 'Pain quality',
    tags: ['sharp', 'throbbing', 'aching', 'pressure', 'soreness', 'stiffness'] as const,
    safetyAdjacent: false,
  },
  {
    label: 'Body response',
    tags: ['tightness', 'guarding', 'shallow_breathing'] as const,
    safetyAdjacent: false,
  },
  {
    label: 'Also present',
    tags: ['instability', 'coordination_change', 'weakness'] as const,
    safetyAdjacent: true,
  },
] as const

// ── Position Tags ──────────────────────────────────────────────────────────────
// Body position at the time of intake — required field in M3.3.2 Step 3.
export const POSITION_TAGS = ['standing', 'sitting', 'lying_down'] as const
export type PositionTag = (typeof POSITION_TAGS)[number]

// ── Trigger Tags ───────────────────────────────────────────────────────────────
// Context or activity associated with onset.
export const TRIGGER_TAGS = [
  'sitting',
  'standing',
  'driving',
  'eating',
  'post_sleep',
  'stress',
  'overhead_movement',
  'screen_use',
  'exercise',
  'unknown',
] as const

export type TriggerTag = (typeof TRIGGER_TAGS)[number]

// ── Immediate Escalation Tags (Safety Precheck) ────────────────────────────────
// Authority: Execution Spec (doc 04) § 2. Safety Precheck Engine
// If any of these are present, route to SAFETY_STOP_MODE. Do not start session.
export const IMMEDIATE_ESCALATION_TAGS = [
  'chest_pain',
  'severe_shortness_of_breath',
  'progressive_weakness',
  'worsening_numbness',
  'severe_neurologic_change',
  'hand_dysfunction',
  'fainting',
  'major_balance_loss',
] as const

export type ImmediateEscalationTag = (typeof IMMEDIATE_ESCALATION_TAGS)[number]

// ── Active Session Stop Triggers ───────────────────────────────────────────────
// Authority: Execution Spec (doc 04) § 6. Active Safety Interrupt Engine
export const SESSION_STOP_TRIGGERS = [
  'dizziness',
  'major_pain_spike',
  'panic_escalation',
  'worsening_nerve_symptoms',
  'severe_shortness_of_breath',
  'new_weakness',
  'loss_of_control',
] as const

export type SessionStopTrigger = (typeof SESSION_STOP_TRIGGERS)[number]

// ── Severity Bands ─────────────────────────────────────────────────────────────
// Authority: Execution Spec (doc 04) § 1. State Intake Engine
export const SEVERITY_BANDS: Record<SeverityBand, [number, number]> = {
  low:       [0, 3],
  moderate:  [4, 6],
  high:      [7, 8],
  very_high: [9, 10],
}

export function getSeverityBand(pain_level: number): SeverityBand {
  if (pain_level <= 3) return 'low'
  if (pain_level <= 6) return 'moderate'
  if (pain_level <= 8) return 'high'
  return 'very_high'
}

// ── Change Markers (Feedback) ──────────────────────────────────────────────────
// Authority: Execution Spec (doc 04) § 7. Feedback Engine
export const CHANGE_MARKERS = [
  'less_tight',
  'less_burning',
  'easier_breathing',
  'more_control',
  'less_jaw_tension',
  'less_pressure',
  'no_change',
] as const

export type ChangeMarker = (typeof CHANGE_MARKERS)[number]
