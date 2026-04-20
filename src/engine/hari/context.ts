/**
 * HARI — Context Tracking Layer (M6.7)
 *
 * Lightweight persistence of the most recent HARI session input, result,
 * and outcome. Enables recency-aware adaptations in future sessions.
 *
 * Storage: localStorage (single last-session record).
 * Non-fatal: all read/write failures are silently swallowed.
 *
 * Truth class: Active Session State (session-bound, not Body Context).
 * Authority: M6.7 — Feasibility + HARI Context Layer
 */

import type { StateInterpretationInput, StateInterpretationResult } from '../../types/hari'

// ── Types ──────────────────────────────────────────────────────────────────────

/** Session outcome as recorded by the context layer. */
export type HARISessionOutcome = 'completed' | 'stopped' | 'discarded'

/** A single HARI context snapshot — most recent session only. */
export interface HARIContextEntry {
  /** ISO 8601 timestamp when this entry was recorded. */
  timestamp: string
  /** The interpretation input that drove this session. */
  input: StateInterpretationInput
  /** The interpretation result produced for this session. */
  result: StateInterpretationResult
  /** How the session ended, if recorded. */
  outcome?: HARISessionOutcome
}

/** Current HARI context state returned to callers. */
export interface HARIContext {
  /** Most recent entry, or null if none exists. */
  lastEntry: HARIContextEntry | null
  /** True when the last entry is within the recency window. */
  isRecent: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hari_context_v1'
const RECENCY_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load the current HARI context from storage.
 * Always returns a valid HARIContext — never throws.
 */
export function loadHARIContext(): HARIContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { lastEntry: null, isRecent: false }
    const entry: HARIContextEntry = JSON.parse(raw)
    const ageMs = Date.now() - new Date(entry.timestamp).getTime()
    return { lastEntry: entry, isRecent: ageMs < RECENCY_WINDOW_MS }
  } catch {
    return { lastEntry: null, isRecent: false }
  }
}

/**
 * Save a new HARI context entry, replacing any previous entry.
 * Non-fatal — storage failures are silently ignored.
 */
export function saveHARIContext(
  input: StateInterpretationInput,
  result: StateInterpretationResult,
  outcome?: HARISessionOutcome
): void {
  const entry: HARIContextEntry = {
    timestamp: new Date().toISOString(),
    input,
    result,
    ...(outcome !== undefined && { outcome }),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // Non-fatal — context loss is acceptable
  }
}

/**
 * Update only the outcome on the most recent context entry.
 * No-op if no entry exists or on storage failure.
 */
export function recordHARIOutcome(outcome: HARISessionOutcome): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const entry: HARIContextEntry = JSON.parse(raw)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...entry, outcome }))
  } catch {
    // Non-fatal
  }
}

/**
 * Clear all HARI context. Safe to call at any time.
 */
export function clearHARIContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Non-fatal
  }
}
