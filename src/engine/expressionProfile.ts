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

const NERVE_PROFILE: ExpressionProfile = {
  profile_id: 'nerve',
  orb_scale_min: 0.75,
  orb_scale_max: 0.95,
  glow_scale_min: 0.40,
  glow_scale_max: 0.50,
  glow_opacity_min: 0.20,
  glow_opacity_max: 0.35,
  show_microtext: false,
}

const SEVERE_PROFILE: ExpressionProfile = {
  profile_id: 'severe',
  orb_scale_min: 0.72,
  orb_scale_max: 1.0,
  glow_scale_min: 0.45,
  glow_scale_max: 0.62,
  glow_opacity_min: 0.18,
  glow_opacity_max: 0.32,
  show_microtext: false,
}

const MODERATE_PROFILE: ExpressionProfile = {
  profile_id: 'moderate',
  orb_scale_min: 0.72,
  orb_scale_max: 1.0,
  glow_scale_min: 0.55,
  glow_scale_max: 0.85,
  glow_opacity_min: 0.35,
  glow_opacity_max: 0.55,
  show_microtext: true,
}

const GENTLE_PROFILE: ExpressionProfile = {
  profile_id: 'gentle',
  orb_scale_min: 0.72,
  orb_scale_max: 1.0,
  glow_scale_min: 0.55,
  glow_scale_max: 0.85,
  glow_opacity_min: 0.40,
  glow_opacity_max: 0.62,
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
  if (session.protocol_id === 'PROTO_BURNING_NERVE_CALM_RESET') {
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
