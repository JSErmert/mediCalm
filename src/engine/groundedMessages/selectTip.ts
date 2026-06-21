/**
 * Deterministic pre-session tip selection.
 * Authority: docs/superpowers/specs/2026-06-19-grounded-message-layer-design.md §5
 * No randomness, no clock — same arguments → same return.
 */
import type { HistoryEntry } from '../../types'
import type { GroundedMessage } from '../../types/groundedMessage'
import { GROUNDED_MESSAGES } from '../../data/groundedMessages'

/** Only clinically-attested messages may reach a user-facing surface (spec §2, §4C). */
export function liveMessages(bank: GroundedMessage[] = GROUNDED_MESSAGES): GroundedMessage[] {
  return bank.filter((m) => m.review_status === 'pt_advisor_passed')
}

function matchScore(message: GroundedMessage, session: HistoryEntry): number {
  const loc = new Set(session.location_tags ?? [])
  const sym = new Set(session.symptom_tags ?? [])
  const trg = new Set(session.trigger_tag ? [session.trigger_tag] : [])
  let score = 0
  for (const t of message.selectors.location ?? []) if (loc.has(t)) score++
  for (const t of message.selectors.symptom ?? []) if (sym.has(t)) score++
  for (const t of message.selectors.trigger ?? []) if (trg.has(t)) score++
  return score
}

/**
 * Best-matching attested tip for the user's most recent session, or null when
 * there is no prior session or nothing matches. Ties broken by message_id asc.
 */
export function selectPreSessionTip(
  lastSession: HistoryEntry | null,
  bank: GroundedMessage[] = GROUNDED_MESSAGES,
): GroundedMessage | null {
  if (!lastSession) return null
  const ranked = liveMessages(bank)
    .map((m) => ({ m, score: matchScore(m, lastSession) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.m.message_id.localeCompare(b.m.message_id))
  return ranked.length > 0 ? ranked[0].m : null
}
