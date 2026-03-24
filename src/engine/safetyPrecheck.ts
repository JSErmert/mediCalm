// src/engine/safetyPrecheck.ts
import type { PainInputState, SafetyAssessment } from '../types'

/**
 * Symptom tags that always trigger SAFETY_STOP_MODE.
 * Authority: Execution Spec (doc 04) § 2. Safety Precheck Engine
 */
const SYMPTOM_STOP_TAGS = ['coordination_change', 'weakness'] as const

/**
 * Hand location + any of these symptoms = hand_dysfunction proxy.
 * Triggers SAFETY_STOP_MODE.
 */
const HAND_NERVE_SYMPTOMS = ['numbness', 'tingling', 'radiating'] as const

export function runSafetyPrecheck(input: PainInputState): SafetyAssessment {
  const hitSymptomStop = input.symptom_tags.filter((t) =>
    (SYMPTOM_STOP_TAGS as readonly string[]).includes(t)
  )
  if (hitSymptomStop.length > 0) {
    return {
      mode: 'SAFETY_STOP_MODE',
      safety_tags: hitSymptomStop,
      stop_reason:
        'Input contains a symptom requiring clinical assessment before guided session.',
    }
  }

  const hasHand = input.location_tags.includes('hand')
  const hasNerveSymptom = input.symptom_tags.some((t) =>
    (HAND_NERVE_SYMPTOMS as readonly string[]).includes(t)
  )
  if (hasHand && hasNerveSymptom) {
    return {
      mode: 'SAFETY_STOP_MODE',
      safety_tags: ['hand_dysfunction_proxy'],
      stop_reason:
        'Hand location with nerve-type symptom — requires clinical review before guided session.',
    }
  }

  return {
    mode: 'DIRECT_SESSION_MODE',
    safety_tags: [],
    stop_reason: null,
  }
}
