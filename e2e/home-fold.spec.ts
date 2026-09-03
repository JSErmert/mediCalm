/**
 * Home screen fold contract.
 *
 * Measured 2026-09-02 across a ladder of viewport heights: "Begin session" ended at
 * a FIXED y=745 whatever the viewport, because nothing in the home column is
 * height-relative. It therefore cleared an 800px viewport by 55px, a 768px one by
 * 23px, and fell BELOW THE FOLD at 720px and shorter — a 1366x768 laptop is under
 * 720px of real viewport once browser chrome is subtracted, so the primary control
 * was off-screen on a very ordinary machine.
 *
 * The orb zone was spending 439px of that column on decoration. It now yields
 * height in tiers (HomeScreen.module.css), and this suite is what holds it honest.
 *
 * Two things to know before editing this file:
 *
 *  1. Heights are chosen at TIER BOUNDARIES, not round numbers. A ladder of media
 *     queries fails at the bottom of a tier, never at the top, so 761 / 701 / 641
 *     matter more than 800 / 720 / 640.
 *
 *  2. `zoom: 1.5` on <html> scales getBoundingClientRect but NOT window.innerHeight.
 *     Comparing the two is still the correct test — the zoomed render has to fit
 *     inside the unzoomed viewport — but do not "fix" the apparent mismatch.
 *     Headless and headed Chrome agree on these numbers; a browser with its own
 *     page zoom applied does not, and will report a defect that is not there.
 *
 * Run: npx playwright test e2e/home-fold.spec.ts
 */
import { test, expect } from '@playwright/test'

/** Minimum breathing room below the control. Tiers are tuned to hold this. */
const MIN_CLEARANCE = 15

async function measureCta(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      /begin session/i.test(b.textContent ?? '')
    )
    if (!btn) return null
    const r = btn.getBoundingClientRect()
    return { bottom: Math.round(r.bottom), viewportHeight: window.innerHeight }
  })
}

/**
 * Desktop and laptop heights, each at the BOTTOM of its media-query tier where a
 * ladder is weakest, plus the common real-world window sizes.
 */
const HEIGHTS = [900, 864, 821, 800, 768, 761, 720, 701, 700, 641, 640, 601, 600]

test.describe('Home screen — primary CTA is reachable without scrolling', () => {
  for (const height of HEIGHTS) {
    test(`1440x${height}: Begin session sits fully above the fold`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height })
      await page.goto('/')
      await page.evaluate(() => localStorage.clear())
      await page.reload()
      await page.getByRole('heading', { name: /just breathe/i }).waitFor()

      const m = await measureCta(page)
      expect(m, 'Begin session button must exist').not.toBeNull()
      expect(
        m!.viewportHeight - m!.bottom,
        `CTA bottom ${m!.bottom}px in a ${m!.viewportHeight}px viewport`
      ).toBeGreaterThanOrEqual(MIN_CLEARANCE)
    })
  }

  test('mobile portrait 390x844 keeps the orb at full presence', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('heading', { name: /just breathe/i }).waitFor()

    const m = await measureCta(page)
    expect(m!.viewportHeight - m!.bottom).toBeGreaterThanOrEqual(MIN_CLEARANCE)

    // The tiers are guarded on min-width 481px, so a phone must never scale the orb.
    const scale = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector('[class*=orbField]')!).getPropertyValue(
          '--orb-scale'
        ) || '1'
    )
    expect(scale.trim() === '' || scale.trim() === '1').toBe(true)
  })

  test('Your Patterns card is never an empty box on a first run', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.getByRole('heading', { name: /just breathe/i }).waitFor()

    const text = await page.evaluate(() => {
      const stateCard = [...document.querySelectorAll('button')].find((b) =>
        /your state/i.test(b.textContent ?? '')
      )
      const row = stateCard?.parentElement
      const patterns = row ? [...row.children].find((c) => c !== stateCard) : null
      return patterns ? (patterns.textContent ?? '').trim() : null
    })
    expect(text, 'the card beside Your State must render readable content').toBeTruthy()
  })
})
