/**
 * BodyContextScreen — M4.7.1 (M4.1.1)
 * Authority: M4.7.1_Body_Context_UI_System_Specification(Final).md
 *
 * User-owned persistent context for HARI calibration.
 * All writes are explicit user actions — system never auto-writes here.
 *
 * Rules (M4.7.1 §2, §12, §13):
 *   - User owns and controls all entries
 *   - No current session state stored here
 *   - Invalidated sessions do NOT mutate Body Context
 *   - System may never silently modify entries
 */
import { useEffect, useState } from 'react'
import type {
  BodyContext,
  BodyContextItem,
  BodyContextCategory,
  BodyContextCertainty,
  BodyContextStatus,
} from '../types/hari'
import {
  loadBodyContext,
  addBodyContextItem,
  editBodyContextItem,
  deleteBodyContextItem,
  resetBodyContext,
} from '../storage/bodyContext'
import { useAppContext } from '../context/AppContext'
import styles from './BodyContextScreen.module.css'

// ── Category config ───────────────────────────────────────────────────────────

// Friendly user-facing labels per Final spec §8
const CATEGORY_LABELS: Record<BodyContextCategory, string> = {
  sensitive_regions:                 'Sensitive Areas',
  trigger_patterns:                  'Triggers',
  relief_patterns:                   'What Helps',
  positional_activity_sensitivities: 'Movement / Position Sensitivities',
  symptom_spread_patterns:           'Patterns You\'ve Noticed',
  injury_event_history:              'History',
  session_structure_preferences:     'Preferences',
  user_notes:                        'Notes',
}

// Display order per Final spec §8
const CATEGORY_ORDER: BodyContextCategory[] = [
  'sensitive_regions',
  'trigger_patterns',
  'relief_patterns',
  'positional_activity_sensitivities',
  'symptom_spread_patterns',
  'injury_event_history',
  'session_structure_preferences',
  'user_notes',
]

const CERTAINTY_OPTIONS: { value: BodyContextCertainty; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'suspected', label: 'Suspected' },
  { value: 'unsure',    label: 'Not sure'  },
]

const STATUS_OPTIONS: { value: BodyContextStatus; label: string }[] = [
  { value: 'active',   label: 'Active'         },
  { value: 'changed',  label: 'Has changed'    },
  { value: 'outdated', label: 'No longer true' },
  { value: 'removed',  label: 'Removed'        },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the collapsed 1–2 entry summary line per Final spec §9. */
function buildCollapsedSummary(items: BodyContextItem[]): string {
  if (items.length === 0) return ''
  const shown = items.slice(0, 2).map((i) => i.raw_text)
  const remainder = items.length - shown.length
  const base = shown.join(', ')
  return remainder > 0 ? `${base} (+${remainder})` : base
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BodyContextScreen() {
  const { dispatch } = useAppContext()
  const [ctx, setCtx] = useState<BodyContext | null>(null)

  // Collapsible state — all collapsed by default per Final spec §9
  const [expandedCategories, setExpandedCategories] = useState<Set<BodyContextCategory>>(new Set())

  // Add form state
  const [addingCategory, setAddingCategory] = useState<BodyContextCategory | null>(null)
  const [newText, setNewText] = useState('')
  const [newCertainty, setNewCertainty] = useState<BodyContextCertainty>('suspected')

  // Edit form state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editCertainty, setEditCertainty] = useState<BodyContextCertainty>('suspected')
  const [editStatus, setEditStatus] = useState<BodyContextStatus>('active')

  // Reset confirm
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  function reload() {
    setCtx(loadBodyContext())
  }

  useEffect(() => { reload() }, [])

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // ── Collapse / expand ─────────────────────────────────────────────────────

  function toggleCategory(category: BodyContextCategory) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
        if (addingCategory === category) {
          setAddingCategory(null)
          setNewText('')
        }
      } else {
        next.add(category)
      }
      return next
    })
  }

  // ── Add ──────────────────────────────────────────────────────────────────────

  function startAdding(category: BodyContextCategory) {
    setExpandedCategories((prev) => new Set([...prev, category]))
    setAddingCategory(category)
    setNewText('')
    setNewCertainty('suspected')
    setEditingItemId(null)
  }

  function cancelAdding() {
    setAddingCategory(null)
    setNewText('')
  }

  function handleAddItem(category: BodyContextCategory) {
    if (!newText.trim()) return
    addBodyContextItem({
      category,
      raw_text: newText.trim(),
      certainty: newCertainty,
      source: 'user_entered',
      status: 'active',
    })
    reload()
    setAddingCategory(null)
    setNewText('')
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────

  function startEditing(item: BodyContextItem) {
    setEditingItemId(item.item_id)
    setEditText(item.raw_text)
    setEditCertainty(item.certainty)
    setEditStatus(item.status)
    setAddingCategory(null)
  }

  function cancelEditing() {
    setEditingItemId(null)
  }

  function handleSaveEdit() {
    if (!editingItemId || !editText.trim()) return
    editBodyContextItem(editingItemId, {
      raw_text: editText.trim(),
      certainty: editCertainty,
      status: editStatus,
    })
    reload()
    setEditingItemId(null)
  }

  function handleDeleteItem(itemId: string) {
    deleteBodyContextItem(itemId)
    reload()
    if (editingItemId === itemId) setEditingItemId(null)
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  function handleResetAll() {
    resetBodyContext()
    reload()
    setShowResetConfirm(false)
  }

  const items = ctx?.items ?? []
  const totalCount = items.length

  return (
    <main className={styles.screen}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label="Back to home"
        >
          ← Back
        </button>
        <h1 className={styles.heading}>Your State</h1>
        <p className={styles.subheading}>
          Add anything that tends to affect how your body feels over time.
        </p>
      </header>

      <div className={styles.content}>

        {/* ── Intro text ──────────────────────────────────────────────────── */}
        <p className={styles.introText}>
          This helps mediCalm better understand your patterns over time.
          You can update this anytime.
        </p>

        {/* ── Category list ───────────────────────────────────────────────── */}
        {CATEGORY_ORDER.map((category) => {
          const categoryItems = items.filter((i) => i.category === category)
          const isExpanded = expandedCategories.has(category)
          const isAdding = addingCategory === category
          const summary = buildCollapsedSummary(categoryItems)

          return (
            <div key={category} className={styles.categoryCard}>

              {/* Category header — tappable to expand/collapse */}
              <button
                className={styles.categoryHeader}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`cat-${category}`}
                onClick={() => toggleCategory(category)}
              >
                <span className={styles.categoryLabel}>{CATEGORY_LABELS[category]}</span>
                <span className={styles.categoryMeta} aria-hidden="true">
                  {categoryItems.length > 0 && (
                    <span className={styles.categoryCount}>{categoryItems.length}</span>
                  )}
                  <span className={styles.chevron}>{isExpanded ? '−' : '+'}</span>
                </span>
              </button>

              {/* Collapsed summary — 1–2 entries + overflow count */}
              {!isExpanded && summary && (
                <p className={styles.collapsedSummary}>{summary}</p>
              )}

              {/* Expanded content */}
              {isExpanded && (
                <div id={`cat-${category}`} className={styles.categoryContent}>

                  {/* Entry list */}
                  {categoryItems.length > 0 && (
                    <ul
                      className={styles.itemList}
                      aria-label={`${CATEGORY_LABELS[category]} entries`}
                    >
                      {categoryItems.map((item) => (
                        <li key={item.item_id} className={styles.itemRow}>
                          {editingItemId === item.item_id ? (

                            /* ── Edit form ── */
                            <div className={styles.editForm}>
                              <textarea
                                className={styles.formTextarea}
                                value={editText}
                                rows={2}
                                aria-label="Edit entry text"
                                onChange={(e) => setEditText(e.target.value)}
                              />
                              <div className={styles.chipRow} role="group" aria-label="Certainty">
                                {CERTAINTY_OPTIONS.map(({ value, label }) => (
                                  <button
                                    key={value}
                                    type="button"
                                    className={`${styles.chip} ${editCertainty === value ? styles.chipSelected : ''}`}
                                    aria-pressed={editCertainty === value}
                                    onClick={() => setEditCertainty(value)}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className={styles.chipRow} role="group" aria-label="Status">
                                {STATUS_OPTIONS.map(({ value, label }) => (
                                  <button
                                    key={value}
                                    type="button"
                                    className={`${styles.chip} ${editStatus === value ? styles.chipSelected : ''}`}
                                    aria-pressed={editStatus === value}
                                    onClick={() => setEditStatus(value)}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className={styles.formActions}>
                                <button
                                  type="button"
                                  className={styles.saveBtn}
                                  onClick={handleSaveEdit}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className={styles.cancelBtn}
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>

                          ) : (

                            /* ── Item display ── */
                            <div
                              className={`${styles.item} ${(item.status === 'removed' || item.status === 'outdated') ? styles.itemDimmed : ''}`}
                            >
                              <div className={styles.itemMain}>
                                <span className={styles.itemText}>{item.raw_text}</span>
                                <span className={`${styles.certaintyBadge} ${styles[`certainty_${item.certainty}`]}`}>
                                  {item.certainty === 'confirmed' ? 'Confirmed'
                                    : item.certainty === 'suspected' ? 'Suspected'
                                    : 'Not sure'}
                                </span>
                              </div>
                              <div className={styles.itemActions}>
                                <button
                                  type="button"
                                  className={styles.editItemBtn}
                                  onClick={() => startEditing(item)}
                                  aria-label={`Edit: ${item.raw_text}`}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className={styles.deleteItemBtn}
                                  onClick={() => handleDeleteItem(item.item_id)}
                                  aria-label={`Delete: ${item.raw_text}`}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add entry */}
                  {isAdding ? (
                    <div className={styles.addForm}>
                      <textarea
                        className={styles.formTextarea}
                        value={newText}
                        rows={2}
                        placeholder="Describe in your own words…"
                        aria-label={`Add ${CATEGORY_LABELS[category]} entry`}
                        autoFocus
                        onChange={(e) => setNewText(e.target.value)}
                      />
                      <div className={styles.chipRow} role="group" aria-label="How certain are you?">
                        {CERTAINTY_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            className={`${styles.chip} ${newCertainty === value ? styles.chipSelected : ''}`}
                            aria-pressed={newCertainty === value}
                            onClick={() => setNewCertainty(value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={styles.saveBtn}
                          onClick={() => handleAddItem(category)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={cancelAdding}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => startAdding(category)}
                      aria-label={`Add ${CATEGORY_LABELS[category]} entry`}
                    >
                      + Add
                    </button>
                  )}

                </div>
              )}
            </div>
          )
        })}

        {/* ── Footer actions ───────────────────────────────────────────────── */}
        {totalCount > 0 && (
          <div className={styles.resetZone}>
            {showResetConfirm ? (
              <div className={styles.resetConfirm} role="group" aria-label="Confirm reset">
                <p className={styles.resetConfirmText}>
                  Remove all Your State entries? This cannot be undone.
                </p>
                <div className={styles.resetConfirmActions}>
                  <button
                    type="button"
                    className={styles.resetConfirmYes}
                    onClick={handleResetAll}
                  >
                    Remove all
                  </button>
                  <button
                    type="button"
                    className={styles.resetConfirmNo}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Keep
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => setShowResetConfirm(true)}
              >
                Reset all Your State
              </button>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
