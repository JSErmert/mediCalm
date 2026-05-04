/**
 * HARI — History-Adaptive Regulation Intelligence
 * Type definitions for M4.0–M4.5
 *
 * Authority: M4_GROUND_TRUTH.md, M4.0–4.5_v1.1_CLARIFICATIONS.md
 *
 * Truth class separation (M4.1 §4) — MANDATORY:
 *   A. User-Entered Body Context   (persistent, user-owned)
 *   B. Active Session State        (live, current session only)
 *   C. Session Records             (completed session archive)
 *   D. Derived Pattern Intelligence (system hypotheses, 3+ sessions)
 *
 * No silent mixing across truth classes.
 */

// ── M4.2 MVP — Active Session State Intake ───────────────────────────────────

/**
 * Session Intent — why the user is starting this session.
 * Authority: M4.2 MVP §4
 */
export type SessionIntent =
  | 'quick_reset'
  | 'deeper_regulation'
  | 'flare_sensitive_support'
  | 'cautious_test'

/**
 * Current Context / Posture — physical situation right now.
 * Authority: M4.2 MVP §5
 */
export type CurrentContext =
  | 'sitting'
  | 'standing'
  | 'driving'
  | 'lying_down'
  | 'after_strain'

/**
 * Symptom Focus — what the session is primarily about today.
 * Authority: M4.2 MVP §6
 */
export type SymptomFocus =
  | 'proactive'          // no major symptom focus
  | 'neck_upper'         // neck / upper region discomfort
  | 'rib_side_back'      // rib / side / back discomfort
  | 'jaw_facial'         // jaw / facial tension
  | 'spread_tension'     // more spread-out tension
  | 'mixed'              // mixed / not sure

/**
 * Flare Sensitivity — how sensitive the body feels right now.
 * Authority: M4.2 MVP §7
 */
export type FlareSensitivity = 'low' | 'moderate' | 'high' | 'not_sure'

/**
 * Session Length Preference — what kind of session feels right today.
 * Authority: M4.2 MVP §8
 */
export type SessionLengthPreference = 'short' | 'standard' | 'longer'

/**
 * PT Clinical Pass 2 — branched intent (replaces 7-state multi-select).
 * Authority: PT clinical refinement notes 2026-05-02 §3
 */
export type IntakeBranch =
  | 'tightness_or_pain'
  | 'anxious_or_overwhelmed'

/**
 * PT Clinical Pass 2 — irritability pattern (Maitland classification).
 * Replaces the visible flare_sensitivity question.
 * Authority: PT clinical refinement notes 2026-05-02 §3
 */
export type IrritabilityPattern =
  | 'fast_onset_slow_resolution'  // comes quickly, leaves slowly → high
  | 'slow_onset_fast_resolution'  // comes slowly, leaves quickly → low
  | 'symmetric'                   // about the same → moderate

/**
 * HariSessionIntake — 6-field pre-session state (M4.5.2 adds baseline_intensity).
 * Truth class B: Active Session State.
 * Authority: M4.2 MVP §3, §15; M4.5.2 baseline intensity patch
 */
export interface HariSessionIntake {
  session_intent: SessionIntent
  current_context: CurrentContext
  symptom_focus: SymptomFocus
  /** Pre-session baseline intensity 0–10 (integer). Supports before/after comparison. */
  baseline_intensity: number
  flare_sensitivity: FlareSensitivity
  session_length_preference: SessionLengthPreference
}

// ── M4.1 — Persistent Body Context ───────────────────────────────────────────

/**
 * Body Context item categories.
 * Authority: M4.1 §8
 */
export type BodyContextCategory =
  | 'injury_event_history'
  | 'sensitive_regions'
  | 'trigger_patterns'
  | 'relief_patterns'
  | 'symptom_spread_patterns'
  | 'positional_activity_sensitivities'
  | 'session_structure_preferences'
  | 'user_notes'

/**
 * Source of a Body Context item.
 * Authority: M4.1 §11
 */
export type BodyContextSource =
  | 'user_entered'
  | 'user_confirmed'         // user confirmed a system-suggested item
  | 'system_suggested_approved' // system suggested, user explicitly approved

/**
 * Status of a Body Context item.
 * Authority: M4.1 §11
 */
export type BodyContextStatus =
  | 'active'
  | 'unsure'
  | 'changed'
  | 'outdated'
  | 'removed'

/**
 * Certainty level the user assigns to a Body Context item.
 * Authority: M4.1 §10
 */
export type BodyContextCertainty =
  | 'confirmed'
  | 'suspected'
  | 'unsure'

/**
 * A single Body Context item — stable, reusable persistent context.
 * Truth class A: User-Entered Body Context.
 * Authority: M4.1 §6–§14
 */
export interface BodyContextItem {
  item_id: string             // e.g. "bci_1234567890_abc"
  category: BodyContextCategory
  /** User-facing raw entry text */
  raw_text: string
  /** HARI-readable structured fields, optional on first entry */
  normalized?: {
    trigger?: string
    affected_regions?: string[]
    response_type?: string
    [key: string]: string | string[] | undefined
  }
  certainty: BodyContextCertainty
  source: BodyContextSource
  status: BodyContextStatus
  created_at: string          // ISO 8601
  updated_at: string          // ISO 8601
}

/**
 * Body Context — the full persistent user-owned history layer.
 * Truth class A: User-Entered Body Context.
 * Authority: M4.1 §3–§26
 */
export interface BodyContext {
  version: 1
  created_at: string          // ISO 8601
  updated_at: string          // ISO 8601
  items: BodyContextItem[]
}

/**
 * Normalized Body Context summary used by the HARI engine.
 * Derived from BodyContext at session start — not stored directly.
 * Authority: M4.1 §13
 */
export interface BodyContextSummary {
  /** Compact display banner text (M4.1 §17) */
  display_banner: string
  has_context: boolean
  sensitive_regions: string[]
  known_triggers: string[]
  known_relievers: string[]
  session_preferences: {
    length?: 'shorter' | 'standard' | 'longer'
    style?: 'quick_reset' | 'deeper_regulation'
  }
  /** Items with active status that may bias HARI reasoning */
  active_items: BodyContextItem[]
}

// ── C4 — HARI Safety Gate ────────────────────────────────────────────────────

/**
 * Safety gate outcome — runs between M4.2 intake and M4.3 estimation.
 * Authority: M4.0–4.5_v1.1_CLARIFICATIONS.md §C4
 */
export type SafetyGateOutcome = 'CLEAR' | 'HOLD' | 'STOP'

export interface SafetyGateResult {
  outcome: SafetyGateOutcome
  /** Which symptom class triggered HOLD or STOP */
  trigger?: string
  /** User-facing message — non-diagnostic, calm, medically restrained */
  message?: string
}

// ── M4.3 — State Estimation Engine ───────────────────────────────────────────

/**
 * Three-band level used across all state estimate outputs.
 * Authority: M4.3 §21 (banding rule)
 */
export type StateBand = 'low' | 'moderate' | 'elevated'

/**
 * Confidence level for the state estimate.
 * Authority: M4.3 §15
 */
export type ConfidenceLevel = 'low' | 'moderate' | 'high'

/**
 * Internal working state estimate — current session only.
 * Truth class B: Active Session State (derived layer).
 * NOT Body Context. NOT persistent. NOT long-term truth.
 * Authority: M4.3 §7
 */
export interface StateEstimate {
  /**
   * Likely response to compressive, effortful, or over-braced approaches.
   * Authority: M4.3 §8
   */
  compression_sensitivity: StateBand
  /**
   * Available ease of soft, non-strained expansion.
   * Authority: M4.3 §9
   */
  expansion_capacity: StateBand
  /**
   * Estimated protective muscular or behavioral guarding.
   * Authority: M4.3 §10
   */
  guarding_load: StateBand
  /**
   * Working estimate of current session irritability and escalation risk.
   * Authority: M4.3 §11
   */
  flare_sensitivity_estimate: StateBand
  /**
   * Appropriate intensity, duration, and exploratory depth this session.
   * Authority: M4.3 §12
   */
  session_tolerance: StateBand
  /**
   * How soon the system should check in before continuing.
   * Authority: M4.3 §13
   */
  reassessment_urgency: StateBand
  /**
   * Required gentleness of the next regulation step.
   * Authority: M4.3 §14
   */
  intervention_softness_need: StateBand
  /**
   * How well-supported the current working estimate is.
   * Authority: M4.3 §15
   */
  confidence_level: ConfidenceLevel
  /** Key factors driving the most significant outputs — for explainability */
  key_factors: string[]
}

// ── M4.4 MVP — Link Mapping Engine ───────────────────────────────────────────

/**
 * Supported link categories.
 * Authority: M4.4 §7 — keep compact and understandable
 */
export type HariLinkType =
  | 'regional_tension'
  | 'compression_spread'
  | 'guarding_distribution'
  | 'posture_to_state'
  | 'context_to_state'
  | 'response_pattern'
  | 'preference_tolerance'

/**
 * Functional link strength banding.
 * Authority: M4.4 §15
 */
export type LinkStrength = 'weak' | 'moderate' | 'elevated'

/**
 * A single current-session functional link.
 * Session-bound. NOT long-term truth. NOT Body Context.
 * Authority: M4.4 §21
 */
export interface HariLink {
  link_type: HariLinkType
  /** Elements participating in the link (regions, states, patterns) */
  linked_elements: string[]
  link_strength: LinkStrength
  confidence_support: ConfidenceLevel
  support_factors: string[]
  session_bound: true        // always true — M4.4 §17
}

/**
 * Current-session link map — output of M4.4.
 * Authority: M4.4 §5, §21
 */
export interface LinkMap {
  links: HariLink[]
  /** Whether the current pattern appears more distributed than isolated */
  appears_distributed: boolean
  /** Explanation summary suitable for informing intervention framing */
  framing_note: string
}

// ── M4.5 — Intervention Selector ─────────────────────────────────────────────

/**
 * Intervention class names.
 * Authority: M4.5 §6 — keep compact and understandable
 */
export type InterventionClass =
  | 'soft_decompression'
  | 'gentle_lateral_expansion'
  | 'reduced_effort_regulation'
  | 'short_micro_reset'
  | 'standard_guided_regulation'
  | 'short_reassessment_first'
  | 'downshift_simplify'
  | 'pause_stop_recommendation'

/**
 * Softness level for the selected intervention.
 */
export type SoftnessLevel = 'standard' | 'soft' | 'very_soft'

/**
 * Round count profile — maps to session timing.
 */
export type RoundCountProfile = 'minimal' | 'short' | 'standard' | 'extended'

/**
 * Reassessment timing — when the next check-in should occur.
 */
export type ReassessmentTiming = 'immediate' | 'early' | 'standard' | 'extended'

/**
 * Structured intervention decision package — output of M4.5.
 * Authority: M4.5 §24
 */
export interface InterventionPackage {
  intervention_class: InterventionClass
  /** Clear purpose of this intervention for the current session */
  immediate_objective: string
  softness_level: SoftnessLevel
  round_count_profile: RoundCountProfile
  reassessment_timing: ReassessmentTiming
  /** Active constraints — what to avoid */
  active_constraints: string[]
  /** Plain-language explanation of why this intervention was chosen */
  adaptation_reasoning: string
  /** Whether progressive escalation is permitted after this step */
  escalation_permitted: boolean
  /**
   * Maps to an existing protocol ID for session building.
   * Authority: M4.5 integration with M3 runtime (build order step 8)
   */
  mapped_protocol_id: string
}

// ── M4.6 — Reassessment Loop Types ───────────────────────────────────────────

/**
 * User's reported response after a completed round.
 * Authority: M4.6 §10
 */
export type ReassessmentResponse = 'better' | 'same' | 'worse' | 'mixed' | 'unclear'

/**
 * Continuation action chosen after reassessment.
 * Authority: M4.6 §15
 */
export type ContinuationAction =
  | 'continue_same'
  | 'continue_softer'
  | 'switch_class'
  | 'shorten_next'
  | 'pause'
  | 'stop'

/**
 * Structured round plan — defines one round of intervention before reassessment.
 * Authority: M4.6 §21
 */
export interface RoundPlan {
  round_number: number
  /** Number of breath cycles in this round (10 / 20 / 30). */
  breath_count: number
  intervention_class: InterventionClass
  softness_level: SoftnessLevel
  reassessment_required: boolean
  continuation_constraint: string
}

/**
 * User-selected action after reassessment — explicit user control over continuation.
 * Authority: M4.6.1 §8
 */
export type UserSelectedAction = 'continue' | 'finish' | 'exit'

/**
 * Structured reassessment result — records response, system recommendation, and user action.
 * Authority: M4.6 §22, M4.6.1 §8
 *
 * M4.6 computes recommended_action.
 * M4.6.1 requires user_selected_action to be recorded separately.
 * The two must not be conflated.
 */
export interface ContinuationDecision {
  round_number: number
  response_label: ReassessmentResponse
  response_confidence: ConfidenceLevel
  /** System recommendation — informs UI copy but does not auto-trigger action (M4.6.1 §2) */
  recommended_action: ContinuationAction
  notes?: string
  /** Explicitly recorded user choice — set when user selects an action (M4.6.1 §8) */
  user_selected_action?: UserSelectedAction
}

// ── HARI Resolution ───────────────────────────────────────────────────────────

/**
 * Full HARI session resolution — the output of the HARI pipeline.
 * Used to build the RuntimeSession and drive the guided session experience.
 */
export type HariSessionResolution =
  | {
      kind: 'hari_session'
      intake: HariSessionIntake
      state_estimate: StateEstimate
      link_map: LinkMap
      intervention: InterventionPackage
      /** Pre-session framing text shown before the session starts */
      session_framing: string
    }
  | {
      kind: 'safety_gate_hold'
      gate_result: SafetyGateResult
    }
  | {
      kind: 'safety_gate_stop'
      gate_result: SafetyGateResult
    }

// ── HARI Session Metadata (attached to RuntimeSession for tracking) ───────────

/**
 * HARI decision data attached to a RuntimeSession.
 * For tracking and explainability only — does not change M3 runtime behavior.
 * Authority: M4.5.1 §Step 3
 */
export interface HariSessionMetadata {
  intake: HariSessionIntake
  safety_gate_result: SafetyGateResult
  state_estimate: StateEstimate
  link_map: LinkMap
  intervention: InterventionPackage
  session_framing: string
  /** M4.6: first-round plan computed at session build time */
  round_plan: RoundPlan
  /** M4.6: maximum number of rounds allowed this session */
  max_rounds: number
}

// ── M4.7 — Session Intelligence Persistence ───────────────────────────────────

/**
 * Per-round record stored in session history.
 * Captures both what the system recommended and what the user chose.
 * Authority: M4.7 §10
 */
export interface PersistedReassessmentResult {
  round_number: number
  response: ReassessmentResponse
  recommended_action: ContinuationAction
  user_selected_action: UserSelectedAction
}

/**
 * Full HARI intelligence block persisted with each HistoryEntry.
 * Authority: M4.7 §3
 *
 * Rules:
 *   - Only present on HARI sessions (never on legacy sessions)
 *   - Must NOT be written to Body Context (M4.7 §11)
 *   - Excluded sessions must not influence future logic (M4.7 §7)
 */
export interface PersistedHariMetadata {
  intake: HariSessionIntake
  /** Outcome of the pre-session safety gate */
  safety_result: SafetyGateOutcome
  state_estimate: StateEstimate
  link_map: LinkMap
  intervention: InterventionPackage
  /** Initial round plan computed at session build time */
  round_plan: RoundPlan
  /** Maximum rounds allowed this session */
  max_rounds: number
  /** Per-round reassessment results — empty if session ended before first reassessment */
  reassessment_history: PersistedReassessmentResult[]
  /** Pre-session baseline intensity (0–10) */
  baseline_intensity: number
  /** Post-session intensity reported by user via CompletionForm — absent if not provided */
  post_session_intensity?: number
}

// ── Session Validation ────────────────────────────────────────────────────────

/**
 * Validation status for a session history entry.
 * Authority: M4.1 §18 (Previous Session Validation Gate)
 */
export type SessionValidationStatus = 'pending' | 'validated' | 'invalidated'

// ── M6.4 — HARI State Interpretation Engine ───────────────────────────────────

/**
 * Emotional/physical states the user can report in the M6 intake flow.
 * Authority: M6.4 State Interpretation Engine spec
 */
export type HariEmotionalState =
  | 'overwhelmed'
  | 'exhausted'
  | 'pain'
  | 'anxious'
  | 'tight'
  | 'angry'
  | 'sad'

/**
 * Breath ratio pattern — inhale/exhale counts.
 * Authority: M6.4 per-state mapping
 */
export type BreathPattern = '2/4' | '3/5' | '4/7'

/**
 * Effort level required for the session.
 * Authority: M6.4 per-state mapping
 */
export type EffortLevel = 'minimal' | 'reduced' | 'standard'

/**
 * Session bias — primary regulatory goal for this session.
 * Authority: M6.4 per-state mapping
 */
export type SessionBias =
  | 'protect_decompress'
  | 'restore_minimize_effort'
  | 'simplify_downshift'
  | 'calm_downregulate'
  | 'support_stabilize'
  | 'release_expand'
  | 'release_ground'

/**
 * Input to the state interpretation engine.
 * Authority: M6.4
 */
export interface StateInterpretationInput {
  /** Active emotional/physical states reported by the user (1–7). */
  states: HariEmotionalState[]
  /** Current intensity 0–10 (integer). Used for safety downgrade threshold. */
  intensity: number
  /** Flare sensitivity — maps to FlareSensitivity where 'high' triggers downgrade. */
  sensitivity: 'low' | 'moderate' | 'high' | 'not_sure'
}

/**
 * Output of the state interpretation engine.
 * Authority: M6.4
 */
export interface StateInterpretationResult {
  /** True when 5+ states active — triggers overload protocol. */
  overload: boolean
  /** Highest-priority state driving breath, effort, and bias. */
  primary: HariEmotionalState
  /**
   * Second state in priority order.
   * Present only in unified mode (1–2 states). Absent in prioritized (3–4) and overload (5+).
   */
  secondary?: HariEmotionalState
  /** Breath ratio pattern for this session (may be safety-downgraded). */
  breath: BreathPattern
  /** Effort level for this session. */
  effort: EffortLevel
  /** Primary regulatory bias for this session. */
  bias: SessionBias
}

// ── M6.5 — Session Configuration Layer ───────────────────────────────────────

/**
 * Deterministic session execution blueprint produced by M6.5.
 * Consumed by the guided session layer — not stored in Body Context.
 * Authority: M6.5 Session Configuration Layer spec
 */
export interface SessionConfig {
  /** Human-readable session name derived from bias. */
  sessionName: string
  /** Breath ratio pattern preserved from M6.4. */
  breathPattern: BreathPattern
  /** Inhale duration in seconds. */
  inhaleSeconds: number
  /** Hold duration in seconds (0 for all current patterns). */
  holdSeconds: number
  /** Exhale duration in seconds. */
  exhaleSeconds: number
  /** Effort level preserved from M6.4. */
  effortLevel: EffortLevel
  /** Instruction tone label for the guided session layer. */
  instructionTone: string
  /** Short opening prompt shown at session start. */
  openingPrompt: string
  /** Total session duration in seconds. */
  durationSeconds: number
  /** Session bias preserved from M6.4. */
  bias: SessionBias
  /** True when the overload protocol is active — guides rendering layer. */
  overloadSafe: boolean
}

// ── M6.8 — Input → Breathwork Architecture ───────────────────────────────────

/**
 * Regulatory goal derived from input states.
 * Abstracts emotional/physical state from specific breath ratios.
 * Authority: M6.8
 */
export type RegulatoryGoal =
  | 'decompress'    // overwhelmed, pain — soften, no effort, safe
  | 'restore'       // exhausted, sad — minimal demand, support recovery
  | 'stabilize'     // mixed/uncertain — steady, predictable
  | 'downregulate'  // anxious — extended exhale, parasympathetic
  | 'expand'        // tight — lateral breath, spacious
  | 'ground'        // angry — rhythmic, anchored
  | 'activate'      // sad/exhausted when feasible — mild energy support

/**
 * Regulatory need profile — intermediate layer between input and breath selection.
 * Decouples state interpretation from direct ratio assignment.
 * Authority: M6.8
 */
export interface NeedProfile {
  primaryGoal: RegulatoryGoal
  secondaryGoal?: RegulatoryGoal
  effortCapacity: EffortLevel
  /** Safety constraint level — drives feasibility decisions. */
  safetyLevel: 'high' | 'moderate' | 'standard'
  /** True when sad/exhausted primary and conditions allow mild activation. */
  activationPermitted: boolean
  /** True when breath was safety-downgraded (intensity >= 7 or sensitivity high). */
  breathDowngraded: boolean
  overload: boolean
}

/**
 * Feasibility constraints derived from NeedProfile.
 * Applied before breath family selection to enforce safe session bounds.
 * Authority: M6.8
 */
export interface FeasibilityProfile {
  maxDurationSeconds: number
  holdsPermitted: boolean
  minInhaleSeconds: number
  feasibilityApplied: boolean
  feasibilityNote?: string
}

/**
 * Named breath family — a regulatory category of breathing approaches.
 * Separates goal from specific timing to prevent direct state → ratio mapping.
 * Authority: M6.8
 */
export type BreathFamilyName =
  | 'flare_safe_soft_exhale'  // pain + high sensitivity — low effort (3/6)
  | 'decompression_expand'    // pain, standard sensitivity — expansion (4/6)
  | 'restorative'             // exhausted, sad — gentle support (3/6)
  | 'neutral_reset'           // mixed/uncertain — moderate steady (4/6)
  | 'calm_downregulate'       // anxious, overwhelmed — strong exhale bias (4/7)
  | 'lateral_expansion'       // tight — spacious, expansive (3/5)
  | 'grounding'               // angry — anchored rhythm (3/5)
  | 'gentle_activation'       // sad/exhausted when feasible — inhale-dominant (4/3)

/**
 * Concrete breath family instance — timing and session framing.
 * Authority: M6.8
 */
export interface BreathFamily {
  name: BreathFamilyName
  inhaleSeconds: number
  holdSeconds: number
  exhaleSeconds: number
  sessionName: string
  instructionTone: string
  openingPrompt: string
}

/**
 * Final breath prescription — concrete session execution parameters.
 * Output of the M6.8 pipeline. Runtime input replacing FeasibleSessionProfile.
 * Authority: M6.8
 */
export interface BreathPrescription {
  family: BreathFamilyName
  inhaleSeconds: number
  holdSeconds: number
  exhaleSeconds: number
  durationSeconds: number
  sessionName: string
  instructionTone: string
  openingPrompt: string
  overloadSafe: boolean
  feasibilityApplied: boolean
  feasibilityNote?: string
  /** M7.1: True when the adaptation layer modified this prescription. */
  adaptationApplied?: boolean
  /** M7.1: Plain-language note describing what was adapted and why. */
  adaptationNote?: string
}
