/**
 * Home screen fold contract.
 *
 * Measured 2026-09-02 across a ladder of viewport heights: "Begin session" ended at
 * a FIXED y=778 whatever the viewport, because nothing in the home column is
 * height-relative. It therefore cleared an 820px viewport by 42px, an 800px one by
 * 22px, and fell BELOW THE FOLD at 768px and shorter — a 1366x768 laptop was 10px
 * short at its full viewport, before any browser chrome, so the primary control was
 * off-screen on a very ordinary machine.
 *
 * The orb zone was spending 439px of that column on decoration. It now yields
 * height in tiers (HomeScreen.module.css), and this suite is what holds it honest.
 *
 * Three things to know before editing this file:
 *
 *  1. WAIT FOR THE WEBFONT. Inter loads from Google Fonts and the fallback stack is
 *     narrower, so before the swap the hero subheading fits on one line and the CTA
 *     sits at 745 — 33px higher than any settled user ever sees. An early pass at
 *     this suite measured that transient layout, read the failure threshold as 720
 *     instead of 768, and tuned every tier 33px too generously. `document.fonts.ready`
 *     is not optional here; it is what makes the numbers real.
 *
 *  2. Heights are chosen at TIER FLOORS, not round numbers. A ladder of media
 *     queries fails at the bottom of a tier, never at the top, so 761 / 701 / 641 /
 *     601 matter more than 800 / 720 / 640.
 *
 *  3. `zoom: 1.5` on <html> scales getBoundingClientRect but NOT window.innerHeight.
 *     Comparing the two is still the correct test — the zoomed render has to fit
 *     inside the unzoomed viewport — but do not "fix" the apparent mismatch.
 *     Headless and headed Chrome agree on these numbers; a browser with its own
 *     page zoom applied does not, and will report a defect that is not there.
 *
 * Run: npx playwright test e2e/home-fold.spec.ts
 */
import { test, expect } from '@playwright/test'

/** Minimum breathing room below the control. Tiers are tuned to hold this at their
 *  floors, where measured clearance is 28 / 27 / 26 / 28 / 28px. */
const MIN_CLEARANCE = 20

/**
 * Loads the home screen and waits for the layout to SETTLE — the heading present
 * and the webfont swapped in. Without the font wait every measurement below is
 * taken against a one-line subheading that no real user sees. See note 1 above.
 */
async function openSettledHome(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('heading', { name: /just breathe/i }).waitFor()
  await page.evaluate(() => document.fonts.ready)
}

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
const HEIGHTS = [900, 864, 821, 820, 800, 768, 761, 760, 720, 701, 700, 641, 640, 601, 600, 500]

test.describe('Home screen — primary CTA is reachable without scrolling', () => {
  for (const height of HEIGHTS) {
    test(`1440x${height}: Begin session sits fully above the fold`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height })
      await openSettledHome(page)

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
    await openSettledHome(page)

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
    await openSettledHome(page)

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
