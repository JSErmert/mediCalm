import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * The ambient field's damping contract, asserted at the SURFACE.
 *
 * fieldMode.test.ts already proves the screen -> mode mapping as a pure function. That
 * is not the same claim as "the field is actually quieter during a session": between
 * the mapping and the pixels sit a context read, a data attribute, three CSS custom
 * properties and the elements that have to consume them. Every one of those can be
 * built correctly and wired to nothing.
 *
 * So each case asserts BOTH halves:
 *   - the mode the field is declaring (`data-field`), and
 *   - the opacity a rendered layer actually ends up with,
 * because a variable that no layer reads is indistinguishable from a working one if you
 * only ever look at the variable.
 *
 * The opacity transition is deliberately slow (1200ms), so every opacity assertion
 * polls rather than reads once.
 */

const FIELD = '[data-field]'

/** Opacity of the particulate canvas, after any transition has settled. */
async function expectParticulateOpacity(page: Page, want: number) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const c = document.querySelector('[data-field] canvas')
          return c ? Number(getComputedStyle(c).opacity) : null
        }),
      { timeout: 4000, message: `particulate should settle at ${want}` }
    )
    .toBeCloseTo(want, 2)
}

async function openHome(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('heading', { name: /just breathe/i }).waitFor()
}

/**
 * The shortest real path from a clean home screen into a running session.
 *
 * Deliberately walked through the UI rather than dispatched into the reducer: the thing
 * under test is what a user sees behind the breath, and a state shortcut would skip the
 * safety gate that sits in the middle of that journey — which is itself one of the
 * screens whose field behaviour matters.
 */
async function walkIntoSession(page: Page) {
  // Every step waits on a landmark from the screen it is about to act on. The router
  // crossfades with AnimatePresence mode="wait", so for a beat the outgoing screen is
  // still mounted and the incoming one is not — without a landmark a click can land on
  // the screen you just left and the walk silently desynchronises.
  await page.getByRole('button', { name: /start a new guided session/i }).click()

  await page.getByRole('heading', { name: /why are you using the app today/i }).waitFor()
  await page.getByRole('button', { name: 'Anxious or overwhelmed', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click()

  await page.getByRole('button', { name: 'Moderate', exact: true }).waitFor()
  for (const answer of [
    'Comes on quickly, goes away slowly',
    'Moderate',
    'Sitting',
    'Standard',
  ]) {
    const option = page.getByRole('button', { name: answer, exact: true })
    if (await option.count()) await option.first().click()
  }
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click()

  // The HARI safety gate. Clearing it honestly is the only way through.
  await page.getByRole('button', { name: /no, none of these/i }).click()

  await page.getByRole('button', { name: /begin guided session/i }).click()
  await page.getByRole('button', { name: /i feel unwell/i }).waitFor()
}

test.describe('Ambient field — damping by what is on screen', () => {
  test('idle home runs the field at full', async ({ page }) => {
    await openHome(page)
    await expect(page.locator(FIELD)).toHaveAttribute('data-field', 'full')
    await expectParticulateOpacity(page, 1)
  })

  test('a safety screen suppresses the field entirely', async ({ page }) => {
    await openHome(page)
    await page.getByRole('button', { name: /crisis support/i }).click()
    await expect(page.locator(FIELD)).toHaveAttribute('data-field', 'off')
    await expectParticulateOpacity(page, 0)
  })

  test('a running session damps the field to a trace', async ({ page }) => {
    await openHome(page)
    await walkIntoSession(page)

    await expect(page.locator(FIELD)).toHaveAttribute('data-field', 'calm')
    await expectParticulateOpacity(page, 0.15)

    // The pools dim AND slow. Slowing matters more than dimming here: a faint thing
    // still moving in peripheral vision is exactly what pulls attention off a breath.
    const pools = await page.evaluate(() => {
      const teal = document.querySelector('[data-field] div div') as HTMLElement | null
      const layer = teal?.parentElement as HTMLElement | null
      return {
        layerOpacity: layer ? Number(getComputedStyle(layer).opacity) : null,
        duration: teal ? getComputedStyle(teal).animationDuration : null,
      }
    })
    expect(pools.layerOpacity).toBeCloseTo(0.5, 2)
    // 86s at full, x2.2 while a session runs.
    expect(parseFloat(String(pools.duration))).toBeGreaterThan(150)
  })

  /**
   * The case a screen-keyed mapping cannot see. "I feel unwell" swaps a PHASE inside
   * GuidedSessionScreen; activeScreen never changes. Before the suppression signal
   * existed the field carried on drifting behind "Stop. Exit carefully."
   */
  test('the in-session safety interrupt suppresses the field, though the screen has not changed', async ({
    page,
  }) => {
    await openHome(page)
    await walkIntoSession(page)
    await expect(page.locator(FIELD)).toHaveAttribute('data-field', 'calm')

    await page.getByRole('button', { name: /i feel unwell/i }).click()
    await expect(page.getByText('Stop.', { exact: true })).toBeVisible()

    await expect(page.locator(FIELD)).toHaveAttribute('data-field', 'off')
    await expectParticulateOpacity(page, 0)
  })
})

test.describe('Ambient field — reduced motion', () => {
  test('nothing in the field animates, but the depth is still there', async ({ page }) => {
    // Set on the page rather than through test.use: the fixture-level option did not
    // reach the page here, and the assertion below would then have been reporting the
    // CSS as broken when the emulation was simply absent.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openHome(page)

    const state = await page.evaluate(() => {
      const pool = document.querySelector('[data-field] div div') as HTMLElement | null
      const canvas = document.querySelector('[data-field] canvas') as HTMLCanvasElement | null
      return {
        // The discriminator. If the emulation never reached the page, an assertion
        // about animation would be reporting the wrong fault entirely.
        emulated: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        poolAnimation: pool ? getComputedStyle(pool).animationName : null,
        canvasPresent: !!canvas,
        canvasOpacity: canvas ? Number(getComputedStyle(canvas).opacity) : null,
      }
    })

    expect(state.emulated).toBe(true)
    // The pools hold their colour, they simply stop drifting.
    expect(state.poolAnimation).toBe('none')
    // The grain is still drawn — one settled frame — so the ground keeps its depth.
    expect(state.canvasPresent).toBe(true)
    expect(state.canvasOpacity).toBe(1)
  })
})
