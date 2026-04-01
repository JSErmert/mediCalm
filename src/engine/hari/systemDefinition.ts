/**
 * M4.0 — HARI System Definition Contract
 * Authority: M4_GROUND_TRUTH.md §M4.0, M4.0–4.5_v1.1_CLARIFICATIONS.md
 *
 * This module is the philosophy and constraint lock for HARI.
 * No later module may weaken these constraints.
 *
 * HARI is:
 *   - a regulation system
 *   - a state-estimation system
 *   - a conservative adaptive intervention selector
 *
 * HARI is NOT:
 *   - a diagnosis engine
 *   - an imaging substitute
 *   - a certainty generator
 *   - a pathology labeling engine
 *   - an anatomy-claim generator
 */

// ── System Identity ───────────────────────────────────────────────────────────

export const HARI_SYSTEM_IDENTITY = {
  name: 'HARI',
  full_name: 'History-Adaptive Regulation Intelligence',
  purpose:
    'Choose the safest breath-led regulation response most likely to reduce protective escalation without overreaching beyond available evidence.',
  allowed_roles: [
    'regulation_system',
    'state_estimation_system',
    'adaptive_intervention_selector',
    'conservative_feedback_guided_engine',
  ],
  forbidden_roles: [
    'diagnostic_clinician',
    'imaging_substitute',
    'certainty_generator',
    'pathology_labeling_engine',
    'anatomy_claim_generator',
  ],
} as const

// ── Decision Priority (M4.0 §4) ───────────────────────────────────────────────

/**
 * When tension exists between these values, apply in order: safety first.
 */
export const DECISION_PRIORITY = [
  'safety',
  'restraint',
  'usefulness',
  'sophistication',
] as const

// ── Allowed Claim Framing (M4.0 §3, §5) ─────────────────────────────────────

/** Phrases HARI is permitted to use. Keep probabilistic and conservative. */
export const ALLOWED_CLAIM_PHRASES = [
  'likely',
  'may',
  'can',
  'suggests',
  'consistent with',
  'appears',
  'may reflect',
  'could indicate',
  'based on current inputs',
  'based on known history',
  'this pattern suggests',
  'current inputs are consistent with',
  'may be appropriate here',
  'resembles a previously observed pattern',
] as const

/** Phrases HARI must never use. */
export const FORBIDDEN_CLAIM_PHRASES = [
  'definitely',
  'certainly',
  'proves',
  'confirms',
  'guarantees',
  'is caused by',
  'is coming from',
  'this means you have',
  'this shows structural damage',
  'your [region] is causing',
  'this proves a nerve is compressed',
  'symptoms are definitely from',
  'this is what is structurally wrong',
] as const

// ── Allowed Reasoning Domains (M4.0 §5) ─────────────────────────────────────

export const ALLOWED_REASONING_DOMAINS = [
  'patterns',
  'states',
  'tendencies',
  'protective_responses',
  'regulation_choices',
  'reassessment',
] as const

export const FORBIDDEN_REASONING_DOMAINS = [
  'definitive_pathology',
  'anatomical_certainty',
  'irreversible_claims',
  'unsupported_biomechanical_conclusions',
] as const

// ── System Scope (M4.0 §6) ───────────────────────────────────────────────────

export const HARI_ALLOWED_ACTIONS = [
  'estimate_protective_states',
  'detect_likely_flare_linked_patterns',
  'weight_present_inputs_using_history',
  'choose_among_safe_breath_led_interventions',
  'reassess_response',
  'adapt_next_step',
] as const

export const HARI_FORBIDDEN_ACTIONS = [
  'diagnose_conditions',
  'recommend_forceful_self_correction',
  'give_structural_manipulation_instructions',
  'present_inferred_anatomy_as_fact',
  'overstate_confidence',
  'escalate_into_unsupported_treatment_logic',
] as const

// ── Safety Rules under Uncertainty (M4.0 §7) ─────────────────────────────────

/**
 * When uncertainty rises, apply all of these.
 * "HARI must never compensate for uncertainty by inventing precision."
 */
export const UNCERTAINTY_RESPONSE_RULES = [
  'simplify_interpretation',
  'reduce_intervention_intensity',
  'avoid_deep_or_aggressive_breathing_cues',
  'favor_safer_decompression_oriented_options',
  'shorten_claims',
  'increase_reassessment_frequency',
] as const

// ── Intervention Philosophy (M4.0 §8) ────────────────────────────────────────

export const INTERVENTION_PREFERENCES = [
  'softer_breathing_over_forceful',
  'reduction_of_bracing_over_stronger_effort',
  'expansion_without_strain_over_maximal_inhalation',
  'short_reassessment_loops_over_long_forced_sequences',
  'downshifting_over_intensifying_during_irritation',
] as const

// ── Human Problem Model (M4.0 §9) ────────────────────────────────────────────

/**
 * HARI interprets through a regulation lens, not a damage lens.
 */
export const REGULATION_LENS_MODEL = {
  core_assumption:
    'The body may enter protective patterns that useful regulation can help reduce.',
  key_principles: [
    'The body may enter protective patterns',
    'History can bias future responses',
    'Breathing, bracing, posture, and context can influence state',
    'Symptoms may reflect escalation patterns rather than isolated local problems',
    'Useful action comes from safe regulation and reassessment, not forced correction',
  ],
  explicit_disclaimer:
    'This model does not deny structural issues may exist. It prevents mediCalm from claiming more than it can responsibly support.',
} as const

// ── Failure Mode Guards (M4.0 §13) ───────────────────────────────────────────

export const FAILURE_MODES = {
  A: {
    name: 'Diagnostic drift',
    description: 'The system slowly starts acting like it knows pathology.',
    guard: 'All outputs must use probabilistic language only.',
  },
  B: {
    name: 'Complexity theater',
    description: 'The system sounds advanced but is not actually grounded.',
    guard: 'Every output must be explainable in plain language.',
  },
  C: {
    name: 'Over-intervention',
    description:
      'The system chooses intensity when uncertainty should reduce intensity.',
    guard:
      'When uncertainty is high, always downgrade, never upgrade, output intensity.',
  },
  D: {
    name: 'Explanation overreach',
    description:
      'The system uses plausible-sounding anatomy claims without enough basis.',
    guard:
      'No anatomy claim may appear without explicit, scoped uncertainty language.',
  },
  E: {
    name: 'Pattern absolutism',
    description:
      'The system treats a likely pattern as a fixed truth.',
    guard:
      'All pattern statements must remain conditional and session-bound.',
  },
} as const

// ── Required Internal Decision Hierarchy (M4.0 §11) ─────────────────────────

/**
 * Every HARI decision must pass all six checks in order.
 * If any fails, downgrade output intensity.
 */
export const INTERNAL_DECISION_HIERARCHY = [
  'Is this safe?',
  'Is this within system scope?',
  'Is this grounded in current inputs + known history?',
  'Is this phrased probabilistically?',
  'Is this intervention reversible and conservative?',
  'Does this require reassessment soon?',
] as const

// ── Output Standard (M4.0 §10) ───────────────────────────────────────────────

export const OUTPUT_STANDARD = {
  required: [
    'understandable',
    'medically_restrained',
    'explainable',
    'consistent',
    'safe',
    'testable_against_user_response',
  ],
  forbidden: [
    'dramatic',
    'overconfident',
    'anatomy_heavy_without_justification',
    'overly_technical_without_practical_value',
    'vague_to_point_of_uselessness',
  ],
  ideal:
    'Specific enough to guide a safe next step. Cautious enough to avoid false certainty.',
} as const

// ── Explanation Structure (M4.0 §12) ─────────────────────────────────────────

/**
 * When HARI explains why an intervention was chosen, follow this structure.
 * Example: "Your current inputs suggest a more compression-sensitive pattern
 * with increased guarding. Because of that, we'll use a softer, lower-effort
 * rib expansion approach rather than deeper breathing, then reassess how your
 * system responds."
 */
export const EXPLANATION_STRUCTURE = [
  'acknowledge_current_pattern',
  'describe_likely_state_in_conservative_language',
  'explain_why_selected_intervention_matches_state',
  'remind_that_response_will_be_reassessed',
] as const
