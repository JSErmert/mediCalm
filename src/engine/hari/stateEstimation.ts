/**
 * M4.3 — State Estimation Engine
 * Authority: M4.0–4.5_v1.1_CLARIFICATIONS.md §M4.3
 *
 * Converts Body Context + Active Session State into a conservative,
 * explainable, non-diagnostic working estimate of the user's current
 * regulation-relevant condition.
 *
 * Rules:
 *   - Deterministic and rule-based (first version)
 *   - Banded outputs (low / moderate / elevated) — no fake precision
 *   - Active Session State always wins over history
 *   - Conservative bias when ambiguous
 *   - Every output must be explainable in plain language
 *
 * This is NOT a pathology classifier.
 * This is NOT a diagnosis engine.
 * It is a functional state estimator for safe regulation.
 */
import type {
  HariSessionIntake,
  BodyContextSummary,
  StateEstimate,
  StateBand,
  ConfidenceLevel,
} from '../../types/hari'

// ── Internal Scoring Helpers ──────────────────────────────────────────────────

type Score = 0 | 1 | 2  // 0=low, 1=moderate, 2=elevated

function toBand(score: Score): StateBand {
  if (score === 0) return 'low'
  if (score === 1) return 'moderate'
  return 'elevated'
}

function cap(n: number): Score {
  if (n <= 0) return 0
  if (n >= 2) return 2
  return n as Score
}

// ── Compression Sensitivity (M4.3 §8) ────────────────────────────────────────

function estimateCompressionSensitivity(
  intake: HariSessionIntake,
  contextBias: number
): Score {
  let score = 0

  // High flare sensitivity strongly raises compression sensitivity
  if (intake.flare_sensitivity === 'high') score += 2
  else if (intake.flare_sensitivity === 'moderate') score += 1
  else if (intake.flare_sensitivity === 'not_sure') score += 1

  // Driving and sitting contexts raise compression sensitivity
  if (intake.current_context === 'driving') score += 1
  else if (intake.current_context === 'sitting') score += 0

  // After strain — elevated compression-relevant protective state
  if (intake.current_context === 'after_strain') score += 1

  // Rib/side/back focus with any flare — more compression-relevant
  if (
    intake.symptom_focus === 'rib_side_back' &&
    intake.flare_sensitivity !== 'low'
  ) {
    score += 1
  }

  // Body Context bias
  score += contextBias

  return cap(score)
}

// ── Expansion Capacity (M4.3 §9) ─────────────────────────────────────────────

function estimateExpansionCapacity(
  intake: HariSessionIntake,
  compressionSensitivity: Score
): Score {
  // Expansion capacity is inversely related to compression sensitivity
  // and flare sensitivity. Higher sensitivity = lower expansion capacity.
  let invertedScore = 2

  if (compressionSensitivity === 2) invertedScore = 0
  else if (compressionSensitivity === 1) invertedScore = 1

  // Flare-sensitive support intent suggests limited expansion capacity
  if (intake.session_intent === 'flare_sensitive_support') invertedScore = Math.max(0, invertedScore - 1) as Score
  if (intake.session_intent === 'cautious_test') invertedScore = Math.max(0, invertedScore - 1) as Score

  // Rib focus often suggests restricted expansion
  if (intake.symptom_focus === 'rib_side_back') invertedScore = Math.max(0, invertedScore - 1) as Score

  // High flare = low expansion
  if (intake.flare_sensitivity === 'high') invertedScore = 0

  return cap(invertedScore)
}

// ── Guarding Load (M4.3 §10) ─────────────────────────────────────────────────

function estimateGuardingLoad(
  intake: HariSessionIntake,
  bodyContext: BodyContextSummary
): Score {
  let score = 0

  // Flare-sensitive sessions suggest elevated guarding
  if (intake.flare_sensitivity === 'high') score += 2
  else if (intake.flare_sensitivity === 'moderate') score += 1
  else if (intake.flare_sensitivity === 'not_sure') score += 1

  // After strain context — high guarding likelihood
  if (intake.current_context === 'after_strain') score += 1

  // Jaw/facial tension — often associated with guarding
  if (intake.symptom_focus === 'jaw_facial') score += 1

  // Spread tension — may reflect elevated distributed guarding
  if (intake.symptom_focus === 'spread_tension') score += 1

  // Cautious test intent — user expects guarding, guarding likely present
  if (intake.session_intent === 'cautious_test') score += 1

  // Body Context: known trigger patterns in current context raise guarding estimate
  if (
    bodyContext.known_triggers.length > 0 &&
    intake.current_context === 'driving' &&
    bodyContext.known_triggers.some((t) => t.toLowerCase().includes('driv'))
  ) {
    score += 1
  }

  return cap(score)
}

// ── Flare Sensitivity Estimate (M4.3 §11) ────────────────────────────────────

function estimateFlareSensitivity(
  intake: HariSessionIntake
): Score {
  // Direct user report is primary — current session wins
  // baseline_intensity is a supporting signal only when user is uncertain (not_sure)
  // Authority: M4.5.2 — no-single-input-absolutism rule applies
  switch (intake.flare_sensitivity) {
    case 'high': return 2
    case 'moderate': return 1
    case 'not_sure':
      // Disambiguate uncertain report with baseline intensity
      if (intake.baseline_intensity >= 7) return 2  // elevated
      return 1  // conservative default
    case 'low': return 0
  }
}

// ── Session Tolerance (M4.3 §12) ─────────────────────────────────────────────

function estimateSessionTolerance(
  intake: HariSessionIntake,
  flareSensitivity: Score
): Score {
  // Tolerance is inversely related to flare sensitivity
  let invertedFlare = 2 - flareSensitivity

  // Session length preference modifies tolerance estimate
  if (intake.session_length_preference === 'shorter') invertedFlare = Math.max(0, invertedFlare - 1)
  else if (intake.session_length_preference === 'longer') invertedFlare = Math.min(2, invertedFlare + 1)

  // Quick reset intent = lower tolerance expectation (short is fine)
  if (intake.session_intent === 'quick_reset') {
    invertedFlare = Math.min(invertedFlare, 1)
  }

  // Flare-sensitive support = lower tolerance expected
  if (intake.session_intent === 'flare_sensitive_support') {
    invertedFlare = Math.min(invertedFlare, 1)
  }

  // High baseline intensity as supporting signal — cap tolerance if body is working hard
  // Authority: M4.5.2 supporting signal (not dominant input)
  if (intake.baseline_intensity >= 7) {
    invertedFlare = Math.min(invertedFlare, 1)
  }

  return cap(invertedFlare)
}

// ── Reassessment Urgency (M4.3 §13) ─────────────────────────────────────────

function estimateReassessmentUrgency(
  flareSensitivity: Score,
  guardingLoad: Score,
  sessionTolerance: Score
): Score {
  let score = 0

  if (flareSensitivity === 2) score += 2
  else if (flareSensitivity === 1) score += 1

  if (guardingLoad === 2) score += 1

  if (sessionTolerance === 0) score += 1

  return cap(score)
}

// ── Intervention Softness Need (M4.3 §14) ────────────────────────────────────

function estimateInterventionSoftness(
  compressionSensitivity: Score,
  flareSensitivity: Score,
  guardingLoad: Score
): Score {
  // Softness need is the maximum of the three driving factors
  const max = Math.max(
    compressionSensitivity,
    flareSensitivity,
    guardingLoad
  )
  return cap(max)
}

// ── Confidence Level (M4.3 §15) ──────────────────────────────────────────────

function estimateConfidence(
  intake: HariSessionIntake,
  bodyContext: BodyContextSummary
): ConfidenceLevel {
  let score = 0

  // Clear symptom focus gives more grounding
  if (intake.symptom_focus !== 'mixed') score += 1

  // Known flare sensitivity is clearer than not_sure
  if (intake.flare_sensitivity !== 'not_sure') score += 1

  // Definite session intent helps
  if (intake.session_intent !== 'cautious_test') score += 1

  // Body Context presence improves confidence
  if (bodyContext.has_context) score += 1

  // Cap at 3 total factors
  if (score >= 3) return 'high'
  if (score === 2) return 'moderate'
  return 'low'
}

// ── Key Factor Extraction ─────────────────────────────────────────────────────

function deriveKeyFactors(
  intake: HariSessionIntake,
  bodyContext: BodyContextSummary,
  compressionSensitivity: Score,
  guardingLoad: Score,
  flareSensitivity: Score
): string[] {
  const factors: string[] = []

  if (intake.flare_sensitivity === 'high') factors.push('high flare sensitivity reported')
  else if (intake.flare_sensitivity === 'moderate') factors.push('moderate flare sensitivity')
  else if (intake.flare_sensitivity === 'not_sure') factors.push('uncertain flare sensitivity')

  if (intake.current_context === 'driving') factors.push('driving context')
  else if (intake.current_context === 'after_strain') factors.push('post-strain context')
  else if (intake.current_context === 'sitting') factors.push('sitting context')

  if (intake.symptom_focus === 'jaw_facial') factors.push('jaw/facial tension focus')
  if (intake.symptom_focus === 'rib_side_back') factors.push('rib/side/back focus')
  if (intake.symptom_focus === 'spread_tension') factors.push('spread tension pattern')

  if (compressionSensitivity === 2) factors.push('elevated compression sensitivity')
  if (guardingLoad === 2) factors.push('elevated guarding load')
  if (flareSensitivity === 2) factors.push('high flare sensitivity estimate')

  if (bodyContext.has_context && bodyContext.known_triggers.length > 0) {
    factors.push(`known triggers in Body Context (${bodyContext.known_triggers.slice(0, 2).join(', ')})`)
  }

  // Baseline intensity as a key factor when notably high
  if (intake.baseline_intensity >= 7) {
    factors.push(`baseline intensity ${intake.baseline_intensity}/10`)
  }

  return factors.slice(0, 5) // cap for explainability
}

// ── Body Context Bias ─────────────────────────────────────────────────────────

/**
 * Derive a conservative bias score from Body Context.
 * Body Context may increase caution slightly if relevant context matches.
 * Authority: M4.3 §16 (Input Weighting Rule)
 * Current session always wins over Body Context.
 */
function deriveContextBias(
  intake: HariSessionIntake,
  bodyContext: BodyContextSummary
): number {
  if (!bodyContext.has_context) return 0

  let bias = 0

  // If Body Context shows sensitive regions matching current focus
  const focus = intake.symptom_focus
  if (
    focus === 'neck_upper' &&
    bodyContext.sensitive_regions.includes('neck')
  ) {
    bias += 1
  }
  if (
    focus === 'jaw_facial' &&
    bodyContext.sensitive_regions.includes('jaw')
  ) {
    bias += 1
  }
  if (
    focus === 'rib_side_back' &&
    bodyContext.sensitive_regions.includes('ribs')
  ) {
    bias += 1
  }

  // Conservative cap: Body Context adds at most 1 to any estimate
  return Math.min(bias, 1)
}

// ── Main Estimation Function ──────────────────────────────────────────────────

/**
 * Estimate the current session state from intake and Body Context.
 * Authority: M4.3 §29 (Final Instruction to Claude Code)
 *
 * Conservative bias rule: when ambiguous, choose lower intensity,
 * shorter assumption horizon, simpler explanations.
 * Authority: M4.3 §18
 */
export function estimateState(
  intake: HariSessionIntake,
  bodyContext: BodyContextSummary
): StateEstimate {
  const contextBias = deriveContextBias(intake, bodyContext)

  const compressionSensitivity = estimateCompressionSensitivity(intake, contextBias)
  const expansionCapacity = estimateExpansionCapacity(intake, compressionSensitivity)
  const guardingLoad = estimateGuardingLoad(intake, bodyContext)
  const flareSensitivityEstimate = estimateFlareSensitivity(intake)
  const sessionTolerance = estimateSessionTolerance(intake, flareSensitivityEstimate)
  const reassessmentUrgency = estimateReassessmentUrgency(
    flareSensitivityEstimate,
    guardingLoad,
    sessionTolerance
  )
  const interventionSoftnessNeed = estimateInterventionSoftness(
    compressionSensitivity,
    flareSensitivityEstimate,
    guardingLoad
  )
  const confidenceLevel = estimateConfidence(intake, bodyContext)

  const keyFactors = deriveKeyFactors(
    intake,
    bodyContext,
    compressionSensitivity,
    guardingLoad,
    flareSensitivityEstimate
  )

  return {
    compression_sensitivity: toBand(compressionSensitivity),
    expansion_capacity: toBand(expansionCapacity),
    guarding_load: toBand(guardingLoad),
    flare_sensitivity_estimate: toBand(flareSensitivityEstimate),
    session_tolerance: toBand(sessionTolerance),
    reassessment_urgency: toBand(reassessmentUrgency),
    intervention_softness_need: toBand(interventionSoftnessNeed),
    confidence_level: confidenceLevel,
    key_factors: keyFactors,
  }
}
