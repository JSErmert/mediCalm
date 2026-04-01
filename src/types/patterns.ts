/**
 * M5.1 — Session Pattern Reader types
 * Truth Class D: Derived Pattern Intelligence
 * Authority: M5.1_Session_Pattern_Reader_Contract_UPDATED.md
 *
 * These are isolated M5 type definitions. No M4 types are modified.
 * M4 layers must not import from this file.
 */

import type {
  SymptomFocus,
  FlareSensitivity,
  SessionIntent,
  SessionLengthPreference,
  RoundCountProfile,
} from './hari'

// ── M5.4 Session Insights ─────────────────────────────────────────────────────

/**
 * A single non-diagnostic insight derived from a DetectedPattern.
 * Authority: M5.4 §14
 *
 * Display rules (M5.4 §4, §7, §8):
 *   - 'candidate' state → confidence 'low', must be labeled as low-confidence
 *   - 'suspended' state → is_suspended true, must be clearly indicated as paused
 *   - 'insufficient' → never appears (null patterns are excluded upstream)
 *   - All summaries are non-diagnostic observational text
 *   - Insights are secondary UI elements, never blocking, never required
 */
export interface SessionInsight {
  dimension: PatternDimension
  state: PatternState
  /** Non-diagnostic observational summary from DetectedPattern.plain_summary */
  summary: string
  confidence: 'low' | 'moderate' | 'high'
  /** True when state === 'suspended' — UI must indicate this as paused */
  is_suspended: boolean
}

// ── M5.3 Protocol Hint Reinforcement ─────────────────────────────────────────

/**
 * Advisory output of the M5.3 protocol hint reinforcement layer.
 * Authority: M5.3 §13
 *
 * Consumer rules (M5.3 §7.2, §2):
 *   - hint is advisory only — M4.5 intervention selector still owns final logic
 *   - suppressed_by_safety = true → ignore hinted_protocol_id entirely
 *   - hint may be ignored if current-session state conflicts with it
 *   - pacing_advisory may NOT be 'extended' (M5.3 §8)
 *   - hint_strength 'none' → no adaptation applied
 */
export interface ProtocolHintReinforcement {
  /** Protocol ID suggested for reinforcement — absent when hint_strength is 'none' */
  hinted_protocol_id?: string
  /** Confidence-gated strength: 'none' | 'soft' (active) | 'moderate' (high_confidence) */
  hint_strength: 'none' | 'soft' | 'moderate'
  /** Pacing advisory from pacing_tendency — absent or capped to not exceed safe M4.6 limits */
  pacing_advisory?: RoundCountProfile
  /** Which dimension drove the primary hint */
  source_pattern_dimension?: 'protocol_benefit_tendency' | 'pacing_tendency'
  /** Pattern state of the source dimension at computation time */
  source_pattern_state?: PatternState
  /** True when any safety condition suppresses the hint (M5.3 §7.3) */
  suppressed_by_safety: boolean
  /** Non-diagnostic explanation string for this hint */
  plain_summary?: string
}

// ── M5.2 Adaptive Intake Defaults ─────────────────────────────────────────────

/**
 * Per-field adaptive intake suggestions derived from PatternSummary.
 * Each field is independent — absent means no eligible pattern for that field.
 * Authority: M5.2 §12
 *
 * Consumer rules:
 *   - Present only as pre-filled suggestions — never as locked selections
 *   - Each suggestion must be visibly marked (M5.2 §7.2)
 *   - User overrides must clear the suggestion immediately (M5.2 §7.3)
 *   - pattern_state drives presentation prominence — never overridability
 */
export interface AdaptiveIntakeDefaults {
  session_intent?:            { value: SessionIntent;            pattern_state: PatternState }
  symptom_focus?:             { value: SymptomFocus;             pattern_state: PatternState }
  flare_sensitivity?:         { value: FlareSensitivity;         pattern_state: PatternState }
  session_length_preference?: { value: SessionLengthPreference;  pattern_state: PatternState }
}

// ── Pattern state machine ─────────────────────────────────────────────────────

/**
 * Lifecycle state of a detected pattern on a single dimension.
 * Authority: M5.1 §7
 *
 * Consumer access rules (M5.1 §11.1):
 *   'active' | 'high_confidence' — M5.2 and M5.3 may act on these
 *   'candidate'                  — M5.4 may display; phrasing hints only
 *   'suspended'                  — display only; no adaptive action permitted
 *   'insufficient'               — never returned in a DetectedPattern (null is used)
 */
export type PatternState =
  | 'insufficient'    // < 2 concordant raw observations — null is returned, not this
  | 'candidate'       // ≥ 2 concordant; informs phrasing only
  | 'active'          // ≥ 3 concordant + weighted threshold met
  | 'high_confidence' // ≥ 5 concordant + higher threshold + clean window
  | 'suspended'       // safety or recent contradiction paused an active/high pattern

// ── Observable dimensions ─────────────────────────────────────────────────────

/**
 * The seven approved pattern detection dimensions.
 * Authority: M5.1 §3. Immutable without contract amendment.
 */
export type PatternDimension =
  | 'symptom_focus_tendency'
  | 'flare_sensitivity_tendency'
  | 'session_intent_tendency'
  | 'session_length_tendency'
  | 'protocol_benefit_tendency'
  | 'pacing_tendency'
  | 'outcome_trajectory'

// ── Derived value types ───────────────────────────────────────────────────────

/**
 * Directional session outcome trend — observational only.
 * Not a clinical outcome measure. Never feeds M5.2 or M5.3 directly.
 * Authority: M5.1 §3 Dimension 7, §10.3
 */
export type OutcomeTrajectory =
  | 'improving'
  | 'stable'
  | 'variable'
  | 'adverse'

/**
 * Outcome classification for a protocol in a session.
 * Authority: M5.1 §3 Dimension 5
 */
export type ProtocolOutcomeClass =
  | 'beneficial'
  | 'neutral'
  | 'adverse'

// ── Core pattern shape ────────────────────────────────────────────────────────

/**
 * A detected pattern on one dimension. T is the dominant value type.
 *
 * null in PatternSummary.patterns means 'insufficient' — no usable pattern.
 * Authority: M5.1 §8.4
 */
export interface DetectedPattern<T> {
  /** Which dimension this pattern was detected on */
  dimension: PatternDimension
  /** Current lifecycle state — governs consumer eligibility */
  state: PatternState
  /** Value appearing most concordantly across eligible weighted sessions */
  dominant_value: T
  /** Raw session count whose observed value matches dominant_value */
  raw_concordant_count: number
  /**
   * Weighted concordance score after applying recency decay and contradiction penalties.
   * Formula: sum(concordant effective_weights) − sum(contradicting effective_weights × multiplier)
   * Authority: M5.1 §6.1
   */
  net_weighted_concordance_score: number
  /**
   * True if any contradicting observation exists at positional index 0 or 1.
   * Caps state at 'candidate' (or 'suspended' if pattern would be active+).
   * Authority: M5.1 §6.2
   */
  has_recent_contradiction: boolean
  /**
   * Non-diagnostic, plain-language description of the detected tendency.
   * Max 80 characters. Describes behavior — never medical condition.
   * Authority: M5.1 §9.2
   */
  plain_summary: string
}

// ── PatternSummary ────────────────────────────────────────────────────────────

/**
 * Full derived pattern output for a user's eligible HARI session history.
 *
 * Truth Class D: Derived Pattern Intelligence.
 * Storage key: 'hari_pattern_summary'
 *
 * Guarantees (M5.1 §8):
 *   - Fully reconstructible from getEligibleHariHistory() at any time
 *   - Never stored alongside session history (Class C) or Body Context (Class A)
 *   - null pattern entries are semantically 'insufficient' — no usable signal
 *   - Cache is invalidated whenever eligible history changes (§8.3)
 *   - schema_version mismatch → discard cache, recompute
 */
export interface PatternSummary {
  /** Schema version. Consumers must validate. Mismatch → discard. */
  schema_version: 1
  /** ISO 8601 timestamp of computation */
  computed_at: string
  /** Number of eligible sessions that were used as input */
  source_session_count: number
  /** Session IDs used — for cache staleness validation (§8.3) */
  source_session_ids: string[]
  patterns: {
    /** Intake field: which symptom focus the user tends to select */
    symptom_focus_tendency:     DetectedPattern<SymptomFocus>            | null
    /** Intake field: chronic flare sensitivity tendency — safety-constrained */
    flare_sensitivity_tendency: DetectedPattern<FlareSensitivity>        | null
    /** Intake field: what kind of session the user typically starts */
    session_intent_tendency:    DetectedPattern<SessionIntent>           | null
    /** Intake field: session length preference tendency */
    session_length_tendency:    DetectedPattern<SessionLengthPreference> | null
    /** Protocol with highest net beneficial weighted score; dominant_value = protocol_id */
    protocol_benefit_tendency:  DetectedPattern<string>                  | null
    /** Round count profile preference; capped at 'candidate' until D1 resolved */
    pacing_tendency:            DetectedPattern<RoundCountProfile>       | null
    /** Directional outcome trend — observational only, never feeds M5.2/M5.3 */
    outcome_trajectory:         DetectedPattern<OutcomeTrajectory>       | null
  }
}
