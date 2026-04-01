/**
 * MediCalm Expression Profile System — M2.5
 *
 * Derives a visual expression profile from a RuntimeSession.
 * This is a UI-layer concern only — it does NOT alter timing, protocol selection,
 * mechanism scoring, or safety logic. The engine output is consumed as-is.
 *
 * 4 profiles (applied in priority order):
 *   nerve    — nerve/burning symptoms; quieter orb, less stimulus
 *   severe   — pain ≥ 7; soft glow, full scale, anchoring feel
 *   moderate — pain 4–6; standard parameters, microtext enabled
 *   gentle   — pain ≤ 3; full expression, open feel
 *
 * Authority: M2.5 UX refinement pass design spec
 */
import type { RuntimeSession } from '../types'

export interface ExpressionProfile {
  profile_id: 'nerve' | 'severe' | 'moderate' | 'gentle'
  /** Orb core minimum scale at exhale/resting */
  orb_scale_min: number
  /** Orb core maximum scale at full inhale */
  orb_scale_max: number
  /** Glow ring minimum scale */
  glow_scale_min: number
  /** Glow ring maximum scale */
  glow_scale_max: number
  /** Glow ring minimum opacity */
  glow_opacity_min: number
  /** Glow ring maximum opacity */
  glow_opacity_max: number
  /** Whether to show microtext cues during the session */
  show_microtext: boolean
}

/**
 * M2.5.6: Breath range refinement.
 * scale_min dropped to 0.10–0.12 — the orb must visually feel "empty" at rest.
 * The full empty→full→release→reset cycle is now clearly perceptible.
 * Glow scale values are absolute Framer Motion multipliers (no CSS baseline).
 * Glow ring always extends beyond the orb rendered size at every phase.
 */
// M2.5.7: scale_min doubled (~2× M2.5.6). Resting state is clearly present
// but visually contracted. Full range remains obvious (5× expansion).
const NERVE_PROFILE: ExpressionProfile = {
  profile_id: 'nerve',
  orb_scale_min: 0.26,
  orb_scale_max: 0.85,
  glow_scale_min: 0.32,
  glow_scale_max: 1.05,
  glow_opacity_min: 0.08,
  glow_opacity_max: 0.20,
  show_microtext: false,
}

const SEVERE_PROFILE: ExpressionProfile = {
  profile_id: 'severe',
  orb_scale_min: 0.25,
  orb_scale_max: 0.95,
  glow_scale_min: 0.28,
  glow_scale_max: 1.22,
  glow_opacity_min: 0.12,
  glow_opacity_max: 0.32,
  show_microtext: false,
}

const MODERATE_PROFILE: ExpressionProfile = {
  profile_id: 'moderate',
  orb_scale_min: 0.25,
  orb_scale_max: 1.00,
  glow_scale_min: 0.28,
  glow_scale_max: 1.30,
  glow_opacity_min: 0.16,
  glow_opacity_max: 0.44,
  show_microtext: true,
}

const GENTLE_PROFILE: ExpressionProfile = {
  profile_id: 'gentle',
  orb_scale_min: 0.25,
  orb_scale_max: 1.00,
  glow_scale_min: 0.28,
  glow_scale_max: 1.38,
  glow_opacity_min: 0.22,
  glow_opacity_max: 0.56,
  show_microtext: true,
}

const NERVE_SYMPTOM_TAGS = new Set([
  'burning', 'tingling', 'numbness', 'nerve_like', 'radiating',
])

/**
 * Derive the expression profile from the resolved session.
 * Priority: nerve > severe > moderate > gentle
 */
export function deriveExpressionProfile(session: RuntimeSession): ExpressionProfile {
  // Nerve protocol always uses nerve profile regardless of pain level
  if (session.protocol_id === 'PROTO_REDUCED_EFFORT') {
    return NERVE_PROFILE
  }

  // Burning/nerve symptom tags also trigger nerve profile
  const hasNerveSymptom = session.pain_input.symptom_tags.some(
    (tag) => NERVE_SYMPTOM_TAGS.has(tag)
  )
  if (hasNerveSymptom) {
    return NERVE_PROFILE
  }

  const pain = session.pain_input.pain_level
  if (pain >= 7) return SEVERE_PROFILE
  if (pain >= 4) return MODERATE_PROFILE
  return GENTLE_PROFILE
}
