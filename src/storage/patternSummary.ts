/**
 * M5.1 — PatternSummary storage
 * Truth Class D: Derived Pattern Intelligence
 * Authority: M5.1 §8
 *
 * Isolated storage for the computed PatternSummary cache.
 * Must never be written to Body Context, session history, or active session state.
 *
 * Cache invalidation callers (M5.1 §8.3):
 *   - resolveSessionValidation() — after a session's validation status changes
 *   - deleteSession()            — after a session is removed from history
 *   - saveSession()              — after a new session is saved (pending, not yet eligible,
 *                                  but invalidate so next read recomputes when validated)
 */

import type { PatternSummary } from '../types/patterns'
import { storageGet, storageSet, storageRemove } from './localStorage'

const KEY = 'hari_pattern_summary'
const CURRENT_SCHEMA_VERSION = 1

/**
 * Load the cached PatternSummary.
 * Returns null if no cache exists, schema version mismatches, or data is malformed.
 * Callers must treat null as stale — call computePatternSummary() and cache the result.
 * Authority: M5.1 §11
 */
export function loadCachedPatternSummary(): PatternSummary | null {
  const cached = storageGet<PatternSummary>(KEY)
  if (!cached) return null
  if (cached.schema_version !== CURRENT_SCHEMA_VERSION) return null
  if (!cached.source_session_ids || !Array.isArray(cached.source_session_ids)) return null
  return cached
}

/**
 * Persist a computed PatternSummary to the isolated cache key.
 * Must only be called with a freshly computed summary.
 * Authority: M5.1 §11
 */
export function savePatternSummary(summary: PatternSummary): void {
  storageSet(KEY, summary)
}

/**
 * Discard the cached PatternSummary.
 * Must be called whenever eligible history changes (see callers above).
 * Clearing this cache causes no data loss — the summary is fully reconstructible.
 * Authority: M5.1 §8.2, §8.3
 */
export function invalidatePatternSummaryCache(): void {
  storageRemove(KEY)
}
