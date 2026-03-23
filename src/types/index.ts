/**
 * MediCalm Core Types
 * Authority: Data Schema (doc 15), Execution Spec (doc 04), Safety + Reassurance Spec (doc 06)
 *
 * These types mirror the JSON schemas in the markdown pack exactly.
 * Provenance labels are preserved per Source Truth Doctrine (doc 02).
 */

// ── Provenance ────────────────────────────────────────────────────────────────

export type ProvenanceLabel =
  | 'source_grounded'
  | 'product_inference'
  | 'design_decision'
  | 'validation_needed'

// ── Safety ────────────────────────────────────────────────────────────────────

/** Authority: Safety + Reassurance Spec (doc 06) § Safety Modes */
export type SafetyMode =
  | 'NORMAL_GUIDANCE_MODE'
  | 'INTERRUPTED_CAUTION_MODE'
  | 'SAFETY_STOP_MODE'

/** Authority: Execution Spec (doc 04) § Runtime Modes */
export type RuntimeMode =
  | 'DIRECT_SESSION_MODE'
  | 'GUIDED_FOLLOW_UP_MODE'
  | 'SAFETY_STOP_MODE'

export interface SafetyAssessment {
  mode: RuntimeMode
  safety_tags: string[]
  stop_reason: string | null
}

// ── Pain Input ────────────────────────────────────────────────────────────────

/** Authority: Execution Spec (doc 04) § 1. State Intake Engine */
export interface PainInputState {
  pain_level: number        // 0–10; integer
  location_tags: string[]   // at least one required
  symptom_tags: string[]    // at least one required
  trigger_tag?: string      // optional; single value
  user_note?: string        // optional; never used as sole safety detector in v1
}

/** Authority: Execution Spec (doc 04) § Canonical Severity Bands */
export type SeverityBand = 'low' | 'moderate' | 'high' | 'very_high'

// ── Session ───────────────────────────────────────────────────────────────────

export type SessionResult = 'better' | 'same' | 'worse' | 'interrupted'
export type SessionStatus = 'completed' | 'interrupted' | 'user_stopped'

export interface TimingProfile {
  inhale_seconds: number
  exhale_seconds: number
  rounds: number
}

/**
 * RuntimeSession — full session object produced by the execution engine.
 * In M1 this is a typed stub; the engine populates it in M2.
 * Authority: Execution Spec (doc 04) § 5. Session Orchestration Engine
 */
export interface RuntimeSession {
  session_id: string
  created_at: string                // ISO 8601
  protocol_id: string
  protocol_name: string
  goal: string
  display_mode: 'breath_only' | 'breath_with_body_cue' | 'breath_with_posture_cue' | 'breath_with_micro_movement' | 'position_with_breath'
  timing_profile: TimingProfile
  cue_sequence: string[]
  estimated_length_seconds: number
  status: SessionStatus
  stop_conditions: string[]
  allowed_follow_up: string[]
  provenance_tags: ProvenanceLabel[]
  pain_input: PainInputState
  safety_assessment: SafetyAssessment
}

// ── Feedback ──────────────────────────────────────────────────────────────────

/** Authority: Execution Spec (doc 04) § 7. Feedback Engine */
export interface SessionFeedback {
  session_id: string
  pain_before: number
  pain_after: number
  result: SessionResult
  change_markers: string[]
  note?: string
}

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Authority: Execution Spec (doc 04) § 9. Session Persistence Engine
 *            Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 */
export interface HistoryEntry {
  session_id: string
  timestamp: string              // ISO 8601
  pain_before: number
  pain_after: number
  location_tags: string[]
  symptom_tags: string[]
  trigger_tag?: string
  selected_protocol_id: string
  selected_protocol_name: string
  result: SessionResult
  change_markers: string[]
  session_status: SessionStatus
  session_duration_seconds: number
}

// ── Personalization ───────────────────────────────────────────────────────────

/** Authority: Execution Spec (doc 04) § 10. Personalization Engine */
export interface PersonalizationRecord {
  state_signature: string
  preferred_protocol_id: string
  successful_follow_up_id?: string
  success_count: number
  worse_count: number
  last_used_at: string           // ISO 8601
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  user_id: string
  created_at: string
  last_opened_at: string
  timezone: string
}

/** Authority: Data Schema (doc 15) § AppSettings */
export interface AppSettings {
  audio_enabled: boolean
  reduced_motion_enabled: boolean
  haptics_enabled: boolean
}

// ── Protocol + Mechanism (M2 stubs — types only) ──────────────────────────────

export interface ProtocolDefinition {
  protocol_id: string
  protocol_name: string
  goal: string
  primary_mechanisms: string[]
  display_mode: 'breath_only' | 'breath_with_body_cue' | 'breath_with_posture_cue' | 'breath_with_micro_movement' | 'position_with_breath'
  default_timing_profile: TimingProfile
  cue_sequence: string[]
  microtext_options: string[]
  safe_use_cases: string[]
  caution_flags: string[]
  stop_conditions: string[]
  follow_up_candidates: string[]
  provenance_tags: ProvenanceLabel[]
}

export interface MechanismObject {
  mechanism_id: string
  name: string
  description: string
  related_truth_ids: string[]
  trigger_tags: string[]
  symptom_tags: string[]
  contraindication_tags: string[]
  protocol_priority_tags: string[]
}
