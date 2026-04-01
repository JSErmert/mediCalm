/**
 * Body Context Storage — M4.1
 * Authority: M4.1 §5 (ownership rule), §24 (editing capabilities)
 *
 * Body Context is user-owned and manually editable.
 * HARI may never silently write to it.
 * All writes require explicit user action.
 *
 * Deletion horizon: current session only.
 * Deep rollback: not supported (M4.1 §19).
 */
import type { BodyContext, BodyContextItem, BodyContextCategory } from '../types/hari'
import { storageGet, storageSet, storageRemove } from './localStorage'

const BODY_CONTEXT_KEY = 'body_context_v1'
const SESSION_VALIDATION_KEY = 'session_validation_pending'

// ── Body Context CRUD ─────────────────────────────────────────────────────────

export function loadBodyContext(): BodyContext | null {
  return storageGet<BodyContext>(BODY_CONTEXT_KEY)
}

export function saveBodyContext(ctx: BodyContext): void {
  storageSet(BODY_CONTEXT_KEY, ctx)
}

export function initBodyContext(): BodyContext {
  const now = new Date().toISOString()
  return {
    version: 1,
    created_at: now,
    updated_at: now,
    items: [],
  }
}

/** Add a single item to Body Context — explicit user action required. */
export function addBodyContextItem(item: Omit<BodyContextItem, 'item_id' | 'created_at' | 'updated_at'>): BodyContextItem {
  const ctx = loadBodyContext() ?? initBodyContext()
  const now = new Date().toISOString()
  const newItem: BodyContextItem = {
    ...item,
    item_id: `bci_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: now,
    updated_at: now,
  }
  const updated: BodyContext = {
    ...ctx,
    updated_at: now,
    items: [...ctx.items, newItem],
  }
  saveBodyContext(updated)
  return newItem
}

/** Edit a single item — explicit user action required. */
export function editBodyContextItem(
  itemId: string,
  patch: Partial<Omit<BodyContextItem, 'item_id' | 'created_at'>>
): void {
  const ctx = loadBodyContext()
  if (!ctx) return
  const now = new Date().toISOString()
  const updated: BodyContext = {
    ...ctx,
    updated_at: now,
    items: ctx.items.map((item) =>
      item.item_id === itemId ? { ...item, ...patch, updated_at: now } : item
    ),
  }
  saveBodyContext(updated)
}

/** Delete a single item — explicit user action required. */
export function deleteBodyContextItem(itemId: string): void {
  const ctx = loadBodyContext()
  if (!ctx) return
  const now = new Date().toISOString()
  const updated: BodyContext = {
    ...ctx,
    updated_at: now,
    items: ctx.items.filter((item) => item.item_id !== itemId),
  }
  saveBodyContext(updated)
}

/** Clear all items in one category — explicit user action required. */
export function clearBodyContextCategory(category: BodyContextCategory): void {
  const ctx = loadBodyContext()
  if (!ctx) return
  const now = new Date().toISOString()
  const updated: BodyContext = {
    ...ctx,
    updated_at: now,
    items: ctx.items.filter((item) => item.category !== category),
  }
  saveBodyContext(updated)
}

/** Reset all Body Context — explicit user action required. Irreversible. */
export function resetBodyContext(): void {
  storageRemove(BODY_CONTEXT_KEY)
}

// ── Session Validation Gate ───────────────────────────────────────────────────
//
// Tracks whether the most recent session has been validated before a new one begins.
// Authority: M4.1 §18 (Previous Session Validation Gate)

/**
 * Record that a session requires validation before the next session starts.
 * Called when a session is saved to history.
 */
export function markSessionPendingValidation(sessionId: string): void {
  storageSet(SESSION_VALIDATION_KEY, { session_id: sessionId, timestamp: new Date().toISOString() })
}

/**
 * Get the session ID currently pending validation, if any.
 * Returns null if no session is pending (gate is clear).
 */
export function getPendingValidationSessionId(): string | null {
  const pending = storageGet<{ session_id: string; timestamp: string }>(SESSION_VALIDATION_KEY)
  return pending?.session_id ?? null
}

/**
 * Clear the validation gate — call when user resolves the pending session
 * (keep or invalidate). This allows a new session to begin.
 */
export function clearValidationGate(): void {
  storageRemove(SESSION_VALIDATION_KEY)
}

/** Returns true if there is an unresolved session requiring validation. */
export function hasUnvalidatedSession(): boolean {
  return getPendingValidationSessionId() !== null
}
