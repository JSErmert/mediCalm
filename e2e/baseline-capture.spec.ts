/**
 * Baseline Visual Capture — PT Clinical Pass 2 (refined 2026-05-04)
 *
 * Purpose: Document every reachable screen and meaningful UI state
 * after PT pass 2 (intake simplification + irritability pattern) plus
 * the 2026-05-04 refinement: Sensitivity restored, multi-select Location
 * field added, length question relabelled with Short/Standard/Long.
 *
 * Run:   npm run capture
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
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
  })

  test('01 — home empty state', async ({ page }) => {
    await expect(page.locator('text=Just Breathe.')).toBeVisible()
    await snap(page, '01_home_empty')
  })

  test('02 — home with session history', async ({ page }) => {
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
// 2. STATE SELECTION SCREEN — branched intent (PT Pass 2)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('State Selection Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
  })

  test('04 — state selection empty', async ({ page }) => {
    await expect(page.locator('text=Why are you using the app today?')).toBeVisible()
    await snap(page, '04_state_selection_empty')
  })

  test('05 — state selection tightness branch selected', async ({ page }) => {
    await page.getByRole('button', { name: /tightness or pain/i }).click()
    await snap(page, '05_state_selection_tightness')
  })

  test('06 — state selection anxious branch selected', async ({ page }) => {
    await page.getByRole('button', { name: /anxious or overwhelmed/i }).click()
    await snap(page, '06_state_selection_anxious')
  })

  // Tests 07 and 08 retired in PT Pass 2 (Heavy expandable + sub-states no longer exist).
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. SAD SAFETY PATH — reached via HomeScreen "Need crisis support?" affordance (PT Pass 2)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('SAD Safety Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    // PT Pass 2: enter SAD safety via HomeScreen affordance, not multi-select
    await page.getByRole('button', { name: /need crisis support/i }).click()
  })

  test('09 — SAD safety screen', async ({ page }) => {
    await expect(page.locator('text=Before we continue')).toBeVisible()
    await snap(page, '09_sad_safety_screen')
  })

  test('10 — support resources (escalation exit)', async ({ page }) => {
    await page.getByRole('button', { name: /^yes$/i }).click()
    await expect(page.locator('text=Pause here for a moment')).toBeVisible()
    await snap(page, '10_support_resources')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. SESSION INTAKE SCREEN — 4-field branched intake (PT Pass 2)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Session Intake Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: /tightness or pain/i }).click()
    await page.getByRole('button', { name: /^continue$/i }).click()
  })

  test('11 — intake screen initial', async ({ page }) => {
    // Branch breadcrumb at top + branch-aware severity heading
    await expect(page.locator('text=How severe is your tightness or pain right now?')).toBeVisible()
    await snap(page, '11_intake_initial')
  })

  test('12 — intake screen filled', async ({ page }) => {
    // Fill 5 required fields (severity has default 5):
    //   irritability · sensitivity · body picker (≥1 region) · position · length
    await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
    await page.getByRole('button', { name: /^moderate$/i }).click()       // sensitivity
    await page.locator('g[data-region="ankle_foot_left"]').first().click()     // location (body picker, auto-tag)
    await page.getByRole('button', { name: /^sitting$/i }).click()
    await page.getByRole('button', { name: /^standard$/i }).click()
    await snap(page, '12_intake_filled')
  })

  test('12b — intake with muscle drawer open', async ({ page }) => {
    // Capture the muscle subgroup picker (drawer) state for shoulder_left
    await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
    await page.getByRole('button', { name: /^moderate$/i }).click()
    await page.locator('g[data-region="shoulder_left"]').first().click()
    await expect(page.getByText(/muscle group/i)).toBeVisible({ timeout: 3000 })
    await snap(page, '12b_intake_muscle_drawer')
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
    await page.getByRole('button', { name: /tightness or pain/i }).click()
    await page.getByRole('button', { name: /^continue$/i }).click()
    // Fill 6-field intake (PT pass 2 refined 2026-05-04)
    await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
    await page.getByRole('button', { name: /^moderate$/i }).click()
    await page.locator('g[data-region="ankle_foot_left"]').first().click()
    await page.getByRole('button', { name: /^sitting$/i }).click()
    await page.getByRole('button', { name: /^standard$/i }).click()
    // Submit
    await page.locator('button:has-text("Continue")').last().click()
  }

  test('13 — safety gate step 1', async ({ page }) => {
    await navigateToGate(page)
    await expect(page.locator('text=please review the following')).toBeVisible()
    await snap(page, '13_safety_gate_step1')
  })

  test('14 — safety gate step 2 (yes path)', async ({ page }) => {
    await navigateToGate(page)
    await page.getByRole('button', { name: /Yes, at least one/i }).click()
    await snap(page, '14_safety_gate_step2')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. SESSION SETUP SCREEN — reachable on the normal CLEAR path (M6.6 shortcut
//    removed 2026-05-04; SessionSetupScreen always shown before guided_session)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Session Setup Screen', () => {
  test('15 — session setup (normal path)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: /tightness or pain/i }).click()
    await page.getByRole('button', { name: /^continue$/i }).click()
    // Fill 6-field intake
    await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
    await page.getByRole('button', { name: /^moderate$/i }).click()
    await page.locator('g[data-region="ankle_foot_left"]').first().click()
    await page.getByRole('button', { name: /^sitting$/i }).click()
    await page.getByRole('button', { name: /^standard$/i }).click()
    await page.locator('button:has-text("Continue")').last().click()
    // Pass safety gate (No, none of these) → session_setup preview
    await page.getByRole('button', { name: /No, none of these/i }).click()
    await expect(page.locator('text=Ready to begin')).toBeVisible({ timeout: 3000 })
    await snap(page, '15_session_setup')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. GUIDED SESSION SCREEN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guided Session Screen', () => {
  // CLEAR path: safety gate "No" → session_setup preview → Begin → guided_session
  async function navigateToSession(page: Page) {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByLabel('Start a new guided session').click()
    await page.getByRole('button', { name: /tightness or pain/i }).click()
    await page.getByRole('button', { name: /^continue$/i }).click()
    // Fill 6-field intake (PT pass 2 refined 2026-05-04)
    await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
    await page.getByRole('button', { name: /^moderate$/i }).click()
    await page.locator('g[data-region="ankle_foot_left"]').first().click()
    await page.getByRole('button', { name: /^sitting$/i }).click()
    await page.getByRole('button', { name: /^standard$/i }).click()
    await page.locator('button:has-text("Continue")').last().click()
    // Safety gate "No" → session_setup preview
    await page.getByRole('button', { name: /No, none of these/i }).click()
    await expect(page.locator('text=Ready to begin')).toBeVisible({ timeout: 3000 })
    // Begin → guided_session
    await page.getByRole('button', { name: /begin guided session/i }).click()
    await page.waitForTimeout(1500)
  }

  test('16 — guided session breathing phase', async ({ page }) => {
    await navigateToSession(page)
    await page.waitForTimeout(2000)
    await snap(page, '16_guided_session_breathing')
  })

  test('17 — guided session stop confirmation overlay', async ({ page }) => {
    await navigateToSession(page)
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
// 9. SAFETY STOP SCREEN (placeholder — not reachable via M6 flow)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Safety Stop Screen', () => {
  test('20 — safety stop', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await snap(page, '20_safety_stop_placeholder_home')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. FULL FLOW — end-to-end golden path screenshot sequence (PT Pass 2)
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

    // Select tightness branch
    await page.getByRole('button', { name: /tightness or pain/i }).click()
    await snap(page, 'golden_03_states_selected')

    // Continue → Intake
    await page.getByRole('button', { name: /^continue$/i }).click()
    await snap(page, 'golden_04_intake')

    // Fill 6-field intake (PT pass 2 refined 2026-05-04)
    await page.getByRole('button', { name: /comes on slowly, goes away quickly/i }).click()
    await page.getByRole('button', { name: /^moderate$/i }).click()
    await page.locator('g[data-region="ankle_foot_left"]').first().click()
    await page.getByRole('button', { name: /^sitting$/i }).click()
    await page.getByRole('button', { name: /^standard$/i }).click()
    await snap(page, 'golden_05_intake_filled')

    // Submit → Safety Gate
    await page.locator('button:has-text("Continue")').last().click()
    await snap(page, 'golden_06_safety_gate')

    // No → session_setup preview (M6.6 shortcut removed 2026-05-04)
    await page.getByRole('button', { name: /No, none of these/i }).click()
    await expect(page.locator('text=Ready to begin')).toBeVisible({ timeout: 3000 })
    await snap(page, 'golden_07_session_setup')

    // Begin → guided_session
    await page.getByRole('button', { name: /begin guided session/i }).click()
    await page.waitForTimeout(2000)
    await snap(page, 'golden_08_guided_session')
  })
})
