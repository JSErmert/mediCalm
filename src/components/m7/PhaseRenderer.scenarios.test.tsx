/**
 * M7.2 canonical scenarios — phase render end-to-end.
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §7
 *            (canonical scenarios 1 + 7 active at M7.2+)
 *
 * v0.2 post-2026-05-06: pathway variants are single-phase `[breath]` after the
 * operator UX call deleted intro + closing transitions. These scenarios assert
 * the breath-only flow: PhaseRenderer enters phase 0 (breath), the breath
 * stub fires onComplete, PhaseRenderer fires onSessionComplete.
 *
 * BreathPhaseRenderer is mocked here so the scenario tests cover the
 * single-phase state-machine sequence deterministically. BreathPhaseRenderer's
 * own tests cover BreathingOrb integration + clinical-context wrapper parity.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { M7_VARIANTS } from '../../data/m7Pathways'

vi.mock('./BreathPhaseRenderer', () => ({
  BreathPhaseRenderer: ({ onComplete }: { onComplete: () => void }) => {
    setTimeout(onComplete, 1000)
    return <div role="region" aria-label="Breath phase (test stub)" />
  },
}))

import { PhaseRenderer } from './PhaseRenderer'

function getVariant(pathway_id: string) {
  const v = M7_VARIANTS.find(v => v.pathway_id === pathway_id)
  if (!v) throw new Error(`canonical scenarios: no variant for pathway ${pathway_id}`)
  return v
}

describe('M7.2 canonical scenarios — single-phase breath render (v0.2 post-2026-05-06)', () => {
  it('Scenario 1 — anxious branch normal completion: single breath phase → onSessionComplete', () => {
    const v = getVariant('anxious_calm_downregulate_reduced_effort_standard')
    expect(v.phases.length).toBe(1)
    expect(v.phases[0].type).toBe('breath')

    vi.useFakeTimers()
    const onComplete = vi.fn()
    const onPhaseStart = vi.fn()
    const onPhaseEnd = vi.fn()
    render(
      <PhaseRenderer
        variant={v}
        onPhaseStart={onPhaseStart}
        onPhaseEnd={onPhaseEnd}
        onSessionComplete={onComplete}
      />
    )

    // Single breath phase — phase index 0, type 'breath', no subtype
    expect(onPhaseStart).toHaveBeenCalledWith(0, 'breath', undefined)
    expect(onPhaseStart).toHaveBeenCalledTimes(1)

    // Mocked stub fires onComplete after 1s
    act(() => { vi.advanceTimersByTime(1000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(0)
    expect(onPhaseEnd).toHaveBeenCalledTimes(1)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('Scenario 7 — tightness branch normal completion: single breath phase → onSessionComplete', () => {
    const v = getVariant('tightness_decompression_reduced_effort_short')
    expect(v.phases.length).toBe(1)
    expect(v.phases[0].type).toBe('breath')

    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(
      <PhaseRenderer
        variant={v}
        onPhaseStart={() => {}}
        onPhaseEnd={() => {}}
        onSessionComplete={onComplete}
      />
    )

    act(() => { vi.advanceTimersByTime(1000) })
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
