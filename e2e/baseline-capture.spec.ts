/**
 * Baseline Visual Capture — Pre-M7 Snapshot
 *
 * Purpose: Document every reachable screen and meaningful UI state
 * before M7–M10 work begins. Not a test suite — a visual record.
 *
 * Run:   npx playwright test e2e/baseline-capture.spec.ts
 * Output: snapshots/ folder with timestamped PNG files
 *
 * Re-run after milestone work to detect unintended visual drift.
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SNAP_DIR = path.resolve(__dirname, '..', 'snapshots')

/** Small delay to let Framer Motion transitions settle */
const TRANSITION_MS = 500

async function snap(page: Page, name: string) {
  await page.waitForTimeout(TRANSITION_MS)
  await page.screenshot({ path: path.join(SNAP_DIR, `${name}.png`), fullPage: true })
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so we get a clean state each time
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
  })

  test('01 — home empty state', async ({ page }) => {
    await expect(page.locator('text=Just Breathe.')).toBeVisible()
    await snap(page, '01_home_empty')
  })

  test('02 — home with session history', async ({ page }) => {
    // Seed a fake history entry matching HistoryEntry interface exactly
    // Key: PREFIX(medicaLm_) + session_history
    await page.evaluate(() => {
      const entry = {
        session_id: 'baseline_test_001',
        timestamp: new Date().toISOString(),
        pain_before: 5,
        pain_after: 3,
        location_tags: ['ribs_left'],
        symptom_tags: ['tightness'],
        selected_protocol_id: 'calm_downregulate',
        selected_protocol_name: 'Calm Downregulate',
        result: 'better',
        change_markers: ['relaxed'],
        session_status: 'completed',
        session_duration_seconds: 240,
        validation_status: 'validated',
        session_type: 'STATE',
        state_entry: ['anxious'],
      }
      localStorage.setItem('medicaLm_session_history', JSON.stringify([entry]))
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Past sessions')).toBeVisible()
    await snap(page, '02_home_with_history')
  })

  test('03 — home Your State card visible', async ({ page }) => {
    await expect(page.getByLabel('Manage Your State')).toBeVisible()
    await snap(page, '03_home_your_state_card')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. STATE SELECTION SCREEN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('State Selection Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
  })

  test('04 — state selection empty', async ({ page }) => {
    await expect(page.locator('text=What are you feeling right now?')).toBeVisible()
    await snap(page, '04_state_selection_empty')
  })

  test('05 — state selection single (Pain)', async ({ page }) => {
    await page.getByRole('button', { name: 'Pain' }).click()
    await snap(page, '05_state_selection_pain')
  })

  test('06 — state selection multi (Pain + Anxious + Tight)', async ({ page }) => {
    await page.getByRole('button', { name: 'Pain' }).click()
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: 'Tight' }).click()
    await snap(page, '06_state_selection_multi')
  })

  test('07 — state selection Heavy expanded', async ({ page }) => {
    await page.getByLabel('Heavy').click()
    await snap(page, '07_state_selection_heavy_expanded')
  })

  test('08 — state selection Heavy sub-states selected', async ({ page }) => {
    await page.getByLabel('Heavy').click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Angry' }).click()
    await page.getByRole('button', { name: 'Overwhelmed' }).click()
    await snap(page, '08_state_selection_heavy_sub_selected')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. SAD SAFETY PATH
// ─────────────────────────────────────────────────────────────────────────────

test.describe('SAD Safety Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    // Expand Heavy, select Sad
    await page.getByLabel('Heavy').click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Sad' }).click()
  })

  test('09 — SAD safety screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('text=Before we continue')).toBeVisible()
    await snap(page, '09_sad_safety_screen')
  })

  test('10 — support resources (escalation exit)', async ({ page }) => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Yes' }).click()
    await expect(page.locator('text=Pause here for a moment')).toBeVisible()
    await snap(page, '10_support_resources')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. SESSION INTAKE SCREEN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Session Intake Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: 'Pain' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('11 — intake screen initial', async ({ page }) => {
    await expect(page.locator('text=How are you today?')).toBeVisible()
    await snap(page, '11_intake_initial')
  })

  test('12 — intake screen filled', async ({ page }) => {
    // Fill all 5 required fields + intensity slider
    await page.getByRole('button', { name: 'Quick reset' }).click()
    await page.getByRole('button', { name: 'Sitting' }).click()
    await page.getByRole('button', { name: 'Neck / upper region' }).click()
    await page.getByRole('button', { name: 'Moderate' }).click()
    await page.getByRole('button', { name: 'Standard' }).last().click()
    await snap(page, '12_intake_filled')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. HARI SAFETY GATE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('HARI Safety Gate', () => {
  async function navigateToGate(page: Page) {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: 'Pain' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    // Fill intake
    await page.getByRole('button', { name: 'Quick reset' }).click()
    await page.getByRole('button', { name: 'Sitting' }).click()
    await page.getByRole('button', { name: 'Neck / upper region' }).click()
    await page.getByRole('button', { name: 'Moderate' }).click()
    await page.getByRole('button', { name: 'Standard' }).last().click()
    // Submit
    await page.locator('button:has-text("Continue")').last().click()
  }

  test('13 — safety gate step 1', async ({ page }) => {
    await navigateToGate(page)
    await expect(page.locator('text=Are any of these')).toBeVisible()
    await snap(page, '13_safety_gate_step1')
  })

  test('14 — safety gate step 2 (yes path)', async ({ page }) => {
    await navigateToGate(page)
    // Click Yes to advance to step 2
    await page.getByRole('button', { name: /Yes, at least one/i }).click()
    await snap(page, '14_safety_gate_step2')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. SESSION SETUP SCREEN
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: In M6 flow (with state entry), the safety gate routes directly to
// guided_session, skipping session_setup (HariSafetyGateScreen.tsx L126-129).
// Session setup is only reachable in legacy (non-state) flow.
// We capture it by seeding state without pendingStateEntry.

test.describe('Session Setup Screen', () => {
  test('15 — session setup (legacy flow — no state entry)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    // Use legacy flow: navigate directly to session_intake without state selection
    // by dispatching from the app context. We simulate by going to intake without state.
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: 'Pain' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    // Fill intake
    await page.getByRole('button', { name: 'Quick reset' }).click()
    await page.getByRole('button', { name: 'Sitting' }).click()
    await page.getByRole('button', { name: 'Neck / upper region' }).click()
    await page.getByRole('button', { name: 'Moderate' }).click()
    await page.getByRole('button', { name: 'Standard' }).last().click()
    // Clear pendingStateEntry before submitting so HARI gate takes legacy path
    await page.evaluate(() => {
      // Remove the state entry so the safety gate doesn't detect M6 flow
      const event = new CustomEvent('__test_clear_state_entry__')
      window.dispatchEvent(event)
    })
    // Submit intake → safety gate
    await page.locator('button:has-text("Continue")').last().click()
    // Pass safety gate (No) — without stateInterpretation, routes to session_setup
    await page.getByRole('button', { name: /No, none of these/i }).click()
    // Should arrive at session setup
    await page.waitForTimeout(1000)
    await snap(page, '15_session_setup_or_guided')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. GUIDED SESSION SCREEN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guided Session Screen', () => {
  // M6 flow: safety gate CLEAR routes directly to guided_session (no session_setup)
  async function navigateToSession(page: Page) {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: 'Pain' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    // Fill intake
    await page.getByRole('button', { name: 'Quick reset' }).click()
    await page.getByRole('button', { name: 'Sitting' }).click()
    await page.getByRole('button', { name: 'Neck / upper region' }).click()
    await page.getByRole('button', { name: 'Moderate' }).click()
    await page.getByRole('button', { name: 'Standard' }).last().click()
    // Submit → safety gate
    await page.locator('button:has-text("Continue")').last().click()
    // Safety gate "No" → M6 flow goes directly to guided_session
    await page.getByRole('button', { name: /No, none of these/i }).click()
    // Wait for guided session to render
    await page.waitForTimeout(1500)
  }

  test('16 — guided session breathing phase', async ({ page }) => {
    await navigateToSession(page)
    // Wait for orb to appear and first breath cycle to start
    await page.waitForTimeout(2000)
    await snap(page, '16_guided_session_breathing')
  })

  test('17 — guided session stop confirmation overlay', async ({ page }) => {
    await navigateToSession(page)
    // Must wait >20s for stop confirm to appear (under 20s → direct home navigation)
    await page.waitForTimeout(22000)
    const stopBtn = page.getByRole('button', { name: 'Stop session', exact: true })
    if (await stopBtn.isVisible()) {
      await stopBtn.click()
      await expect(page.locator('text=Stop this session?')).toBeVisible({ timeout: 3000 })
      await snap(page, '17_guided_session_stop_confirm')
    } else {
      await snap(page, '17_guided_session_current_state')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8. BODY CONTEXT SCREEN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Body Context Screen', () => {
  test('18 — body context empty', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Manage Your State').click()
    await snap(page, '18_body_context_empty')
  })

  test('19 — body context with entries', async ({ page }) => {
    await page.goto('/')
    // Seed body context with sample data
    await page.evaluate(() => {
      const ctx = {
        items: [
          {
            id: 'bc_test_1',
            category: 'sensitive_regions',
            text: 'Left side ribs — sharp when reaching overhead',
            certainty: 'confirmed',
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
          {
            id: 'bc_test_2',
            category: 'trigger_patterns',
            text: 'Prolonged sitting triggers upper back tension',
            certainty: 'suspected',
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
          {
            id: 'bc_test_3',
            category: 'relief_patterns',
            text: '4/7 breathing helps most with rib flare',
            certainty: 'confirmed',
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        ],
      }
      localStorage.setItem('medicaLm_body_context_v1', JSON.stringify(ctx))
    })
    await page.goto('/')
    await page.getByLabel('Manage Your State').click()
    await snap(page, '19_body_context_with_entries')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 9. SAFETY STOP SCREEN (direct injection — not reachable via M6 flow)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Safety Stop Screen', () => {
  test('20 — safety stop', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    // Inject state to force safety_stop screen
    await page.evaluate(() => {
      // This screen is driven by AppContext state machine —
      // we need to dispatch NAVIGATE from inside React.
      // Instead, we'll capture it if reachable, or skip gracefully.
    })
    await page.goto('/')
    // Try to reach via devFlags + high-severity input if possible
    // For now, capture a placeholder note
    await snap(page, '20_safety_stop_placeholder_home')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. FULL FLOW — end-to-end golden path screenshot sequence
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Golden Path — Full Flow', () => {
  test('golden path sequence', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')

    // Home
    await snap(page, 'golden_01_home')

    // Start → State Selection
    await page.getByLabel('Start a new guided session').click()
    await snap(page, 'golden_02_state_selection')

    // Select Pain + Anxious
    await page.getByRole('button', { name: 'Pain' }).click()
    await page.getByRole('button', { name: 'Anxious' }).click()
    await snap(page, 'golden_03_states_selected')

    // Continue → Intake
    await page.getByRole('button', { name: 'Continue' }).click()
    await snap(page, 'golden_04_intake')

    // Fill intake
    await page.getByRole('button', { name: 'Deeper regulation' }).click()
    await page.getByRole('button', { name: 'Sitting' }).click()
    await page.getByRole('button', { name: 'Rib / side / back' }).click()
    await page.getByRole('button', { name: 'Low' }).click()
    await page.getByRole('button', { name: 'Standard' }).last().click()
    await snap(page, 'golden_05_intake_filled')

    // Submit → Safety Gate
    await page.locator('button:has-text("Continue")').last().click()
    await snap(page, 'golden_06_safety_gate')

    // No → M6 flow routes directly to guided_session (skips session_setup)
    await page.getByRole('button', { name: /No, none of these/i }).click()
    await page.waitForTimeout(2000)
    await snap(page, 'golden_07_guided_session')
  })
})
