/**
 * Custom breathing + movement types — serial foundation layer.
 * All system protocols remain unaffected; these types are additive only.
 */

/** Walking pace for movement-integrated custom sessions. */
export type WalkingSpeedTag = 'slow' | 'moderate' | 'brisk'

/**
 * Full timing specification for a user-authored breathing pattern.
 * Hold fields default to 0 (absent/no hold) when not set.
 */
export interface CustomTimingProfile {
  inhale_seconds: number
  hold_after_inhale_seconds: number
  exhale_seconds: number
  hold_after_exhale_seconds: number
  cycles: number
}

/**
 * A user-saved custom session definition.
 * id, name, created_at, updated_at are strings per Data Schema (doc 15) conventions.
 */
export interface CustomSession {
  id: string
  name: string
  profile: CustomTimingProfile
  created_at: string   // ISO 8601
  updated_at: string   // ISO 8601
}
