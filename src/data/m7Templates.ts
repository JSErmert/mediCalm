/**
 * M7 Transition Template Registry.
 *
 * Stores versioned templates referenced by `TransitionPhase.template_id` +
 * `TransitionPhase.template_version` from variant artifacts. Templates are
 * Class 2 (immutable post-publish; new versions added, old retained).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.2
 *            (TransitionPhase data shape) + Q5 Refinement 1 (template_version
 *            pinned in artifact for historical reproducibility).
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
