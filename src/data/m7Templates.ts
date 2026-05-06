/**
 * M7 Transition Template Registry.
 *
 * Stores versioned templates referenced by `TransitionPhase.template_id` +
 * `TransitionPhase.template_version` from variant artifacts. Templates are
 * Class 2 (immutable post-publish; new versions added, old retained).
 *
 * STATUS at v0.2 (post-2026-05-06): UNREFERENCED by the live pathway library.
 * Pathway library v0.2 reverted variants to single-phase `[breath]` per operator
 * UX call (intro/closing transitions deleted). Templates are retained here as
 * dead but valid registry entries — preserved for advisor-driven reintroduction
 * at M7.3+ if clinically defensible.
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.2
 *            (TransitionPhase data shape) + Q5 Refinement 1 (template_version
 *            pinned in artifact for historical reproducibility).
 *            §8 M7.2 deliverables + §9 out of scope (transitions deletion).
 */
import type { SemVer, TemplateId } from '../types/m7'

export type TransitionTemplate = {
  template_id: TemplateId
  template_version: SemVer
  subtype: 'intro' | 'between' | 'closing'
  /**
   * Default copy rendered for this template. Variants may override per-instance
   * via TransitionPhase.subtitle if pathway-specific framing is needed.
   */
  copy: string
}

export const M7_TEMPLATES: TransitionTemplate[] = [
  {
    template_id: 'standard_5_count',
    template_version: '1.0.0',
    subtype: 'intro',
    copy: "Take a moment. We'll begin in a few breaths.",
  },
  {
    template_id: 'standard_between',
    template_version: '1.0.0',
    subtype: 'between',
    copy: 'Easing into the next phase.',
  },
  {
    template_id: 'standard_completion',
    template_version: '1.0.0',
    subtype: 'closing',
    copy: 'Session complete. Take what you need from this.',
  },
]

const REGISTRY: Map<string, TransitionTemplate> = new Map(
  M7_TEMPLATES.map(t => [`${t.template_id}@${t.template_version}`, t]),
)

export function getTemplate(template_id: TemplateId, template_version: SemVer): TransitionTemplate {
  const key = `${template_id}@${template_version}`
  const t = REGISTRY.get(key)
  if (!t) throw new Error(`M7 template registry: unknown template ${key}`)
  return t
}
