/**
 * Deterministic recommendation-evidence selection (Grounded Guidance Layer 1).
 * Authority: docs/apex-bundle/grounded-guidance/04-layer1-recommendation-reveal-spec.md
 *
 * Goal-gated, tag-ranked, pure. No randomness, no clock (INV-1). Returns the
 * single best live, goal-bound message, or null (INV-5).
 */
import type { LocationTag, SymptomTag, TriggerTag } from '../../types/taxonomy'
import type { RegulatoryGoal } from '../../types/hari'
import type { GroundedMessage } from '../../types/groundedMessage'
import { GROUNDED_MESSAGES } from '../../data/groundedMessages'
import { liveMessages } from './selectTip'

export type SessionInputTags = {
  symptom?: SymptomTag[]
  location?: LocationTag[]
  trigger?: TriggerTag[]
}

function tagScore(message: GroundedMessage, input: SessionInputTags): number {
  const loc = new Set(input.location ?? [])
  const sym = new Set(input.symptom ?? [])
  const trg = new Set(input.trigger ?? [])
  let score = 0
  for (const t of message.selectors.location ?? []) if (loc.has(t)) score++
  for (const t of message.selectors.symptom ?? []) if (sym.has(t)) score++
  for (const t of message.selectors.trigger ?? []) if (trg.has(t)) score++
  return score
}

export function selectRecommendationEvidence(
  derivedGoal: RegulatoryGoal,
  input: SessionInputTags,
  bank: GroundedMessage[] = GROUNDED_MESSAGES,
): GroundedMessage | null {
  const eligible = liveMessages(bank).filter((m) => m.selectors.goal?.includes(derivedGoal))
  if (eligible.length === 0) return null
  const ranked = eligible
    .map((m) => ({ m, score: tagScore(m, input) }))
    .sort((a, b) => b.score - a.score || a.m.message_id.localeCompare(b.m.message_id))
  return ranked[0].m
}
