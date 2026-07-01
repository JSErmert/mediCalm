/**
 * validateCustomTiming — grounded safety-bounds validator for user-authored breathing patterns.
 * Pure function: no side effects, deterministic, guards all edge cases.
 *
 * Bound provenance:
 *   source_grounded  — derived from evidence in the mediCalm protocol library or cited literature.
 *   design_decision + validation_needed — no clinical evidence yet; conservative engineering choice.
 *
 * 4-7-8 (Weil) reference: Andrew Weil MD — 4s inhale, 7s inhale hold, 8s exhale.
 */

import type { CustomTimingProfile } from '../../types/custom'

// ── Inhale bounds ─────────────────────────────────────────────────────────────
// source_grounded: M6.0 breath engine floor is 2/4 pattern (inhale 2s); max 10 is design_decision + validation_needed
const INHALE_MIN_SECONDS = 2
const INHALE_MAX_SECONDS = 10

// ── Inhale hold bounds ────────────────────────────────────────────────────────
// source_grounded: 4-7-8 (Weil) uses a 7-second inhale hold; 0 = no hold
const HOLD_AFTER_INHALE_MIN_SECONDS = 0
const HOLD_AFTER_INHALE_MAX_SECONDS = 7

// ── Exhale bounds ─────────────────────────────────────────────────────────────
// source_grounded: M6.0 protocol ceiling is 7s exhale; 4-7-8 (Weil) uses 8s; max 12 is design_decision + validation_needed
const EXHALE_MIN_SECONDS = 2
const EXHALE_MAX_SECONDS = 12

// ── Exhale hold bounds ────────────────────────────────────────────────────────
// design_decision + validation_needed: exhale holds (kumbhaka) less studied in this population; conservative ceiling
const HOLD_AFTER_EXHALE_MIN_SECONDS = 0
const HOLD_AFTER_EXHALE_MAX_SECONDS = 4

// ── Cycle count bounds ────────────────────────────────────────────────────────
// design_decision + validation_needed: floor of 1 is self-evident; 30 is conservative upper limit
const CYCLES_MIN = 1
const CYCLES_MAX = 30

const EPSILON = 1e-9

export interface ValidationResult {
  valid: boolean
  clamped: CustomTimingProfile
  violations: string[]
}

function safeNumber(v: unknown, fallback: number): number {
  const n = Number(v)
  if (!isFinite(n) || isNaN(n)) return fallback
  return n
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function isOutOfBounds(value: number, min: number, max: number): boolean {
  return value < min - EPSILON || value > max + EPSILON
}

export function validateCustomTiming(profile: Partial<CustomTimingProfile> | null | undefined): ValidationResult {
  const violations: string[] = []

  const rawInhale = safeNumber(profile?.inhale_seconds, INHALE_MIN_SECONDS)
  const rawHoldIn = safeNumber(profile?.hold_after_inhale_seconds, HOLD_AFTER_INHALE_MIN_SECONDS)
  const rawExhale = safeNumber(profile?.exhale_seconds, EXHALE_MIN_SECONDS)
  const rawHoldEx = safeNumber(profile?.hold_after_exhale_seconds, HOLD_AFTER_EXHALE_MIN_SECONDS)
  const rawCycles = safeNumber(profile?.cycles, CYCLES_MIN)

  const clampedInhale = clamp(rawInhale, INHALE_MIN_SECONDS, INHALE_MAX_SECONDS)
  const clampedHoldIn = clamp(rawHoldIn, HOLD_AFTER_INHALE_MIN_SECONDS, HOLD_AFTER_INHALE_MAX_SECONDS)
  const clampedExhale = clamp(rawExhale, EXHALE_MIN_SECONDS, EXHALE_MAX_SECONDS)
  const clampedHoldEx = clamp(rawHoldEx, HOLD_AFTER_EXHALE_MIN_SECONDS, HOLD_AFTER_EXHALE_MAX_SECONDS)
  const clampedCycles = clamp(Math.round(rawCycles), CYCLES_MIN, CYCLES_MAX)

  if (isOutOfBounds(rawInhale, INHALE_MIN_SECONDS, INHALE_MAX_SECONDS)) {
    violations.push(
      `inhale_seconds (${rawInhale}) must be between ${INHALE_MIN_SECONDS} and ${INHALE_MAX_SECONDS}; clamped to ${clampedInhale}`,
    )
  }

  if (isOutOfBounds(rawHoldIn, HOLD_AFTER_INHALE_MIN_SECONDS, HOLD_AFTER_INHALE_MAX_SECONDS)) {
    violations.push(
      `hold_after_inhale_seconds (${rawHoldIn}) must be between ${HOLD_AFTER_INHALE_MIN_SECONDS} and ${HOLD_AFTER_INHALE_MAX_SECONDS}; clamped to ${clampedHoldIn}`,
    )
  }

  if (isOutOfBounds(rawExhale, EXHALE_MIN_SECONDS, EXHALE_MAX_SECONDS)) {
    violations.push(
      `exhale_seconds (${rawExhale}) must be between ${EXHALE_MIN_SECONDS} and ${EXHALE_MAX_SECONDS}; clamped to ${clampedExhale}`,
    )
  }

  if (isOutOfBounds(rawHoldEx, HOLD_AFTER_EXHALE_MIN_SECONDS, HOLD_AFTER_EXHALE_MAX_SECONDS)) {
    violations.push(
      `hold_after_exhale_seconds (${rawHoldEx}) must be between ${HOLD_AFTER_EXHALE_MIN_SECONDS} and ${HOLD_AFTER_EXHALE_MAX_SECONDS}; clamped to ${clampedHoldEx}`,
    )
  }

  if (isOutOfBounds(rawCycles, CYCLES_MIN, CYCLES_MAX)) {
    violations.push(
      `cycles (${rawCycles}) must be between ${CYCLES_MIN} and ${CYCLES_MAX}; clamped to ${clampedCycles}`,
    )
  }

  return {
    valid: violations.length === 0,
    clamped: {
      inhale_seconds: clampedInhale,
      hold_after_inhale_seconds: clampedHoldIn,
      exhale_seconds: clampedExhale,
      hold_after_exhale_seconds: clampedHoldEx,
      cycles: clampedCycles,
    },
    violations,
  }
}

// Export bounds for use in UI and tests
export {
  INHALE_MIN_SECONDS,
  INHALE_MAX_SECONDS,
  HOLD_AFTER_INHALE_MIN_SECONDS,
  HOLD_AFTER_INHALE_MAX_SECONDS,
  EXHALE_MIN_SECONDS,
  EXHALE_MAX_SECONDS,
  HOLD_AFTER_EXHALE_MIN_SECONDS,
  HOLD_AFTER_EXHALE_MAX_SECONDS,
  CYCLES_MIN,
  CYCLES_MAX,
}
