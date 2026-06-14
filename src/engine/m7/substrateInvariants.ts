/**
 * M7 substrate invariant checks (resolution-time, engineering-side).
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §5
 *
 * Q7 Concern 1 split: this file owns the engineering-side STRUCTURAL check.
 * The clinical-side check (intake-vs-pathway contraindications) lives separately
 * and is authored at M7.4 PT advisor review.
 */
import type { PTVariant } from '../../types/m7'

export class M7InvariantViolation extends Error {
  constructor(invariant: string, detail: string) {
    super(`[${invariant}] ${detail}`)
    this.name = 'M7InvariantViolation'
  }
}

export function assertVariantInvariants(v: PTVariant): void {
  // I6 — phases.length >= 1
  if (v.phases.length < 1) {
    throw new M7InvariantViolation('I6', `variant ${v.variant_id} has zero phases`)
  }

  // I7 — at least one breath phase
  if (!v.phases.some(p => p.type === 'breath')) {
    throw new M7InvariantViolation('I7', `variant ${v.variant_id} has no breath phase`)
  }

  // I14 — every transition phase has duration_seconds === 5
  // Cast to number for the runtime check: the type literal `5` is correct at authoring time,
  // but adversarial or migrated data may violate it; the cast lets tsc compile the guard.
  for (const phase of v.phases) {
    if (phase.type === 'transition' && (phase.duration_seconds as number) !== 5) {
      throw new M7InvariantViolation(
        'I14',
        `variant ${v.variant_id} has a transition with duration ${phase.duration_seconds as number}, must be 5`,
      )
    }
  }
}
