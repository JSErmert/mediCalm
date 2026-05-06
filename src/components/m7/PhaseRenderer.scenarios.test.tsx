/**
 * M7.2 canonical scenarios — phase render end-to-end.
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §7
 *            (canonical scenarios 1 + 7 active at M7.2+)
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PhaseRenderer } from './PhaseRenderer'
import { M7_VARIANTS } from '../../data/m7Pathways'
import { BREATH_FAMILIES } from '../../engine/hari/breathFamily'
import type { BreathPhase } from '../../types/m7'

function breathDurationMs(variant: ReturnType<typeof getVariant>): number {
  const breath = variant.phases.find((p): p is BreathPhase => p.type === 'breath')!
  const family = BREATH_FAMILIES[breath.breath_family]
  const cycleSeconds = family.inhaleSeconds + family.exhaleSeconds + (family.holdSeconds ?? 0)
  return cycleSeconds * breath.num_cycles * 1000
}

function getVariant(pathway_id: string) {
  const v = M7_VARIANTS.find(v => v.pathway_id === pathway_id)
  if (!v) throw new Error(`canonical scenarios: no variant for pathway ${pathway_id}`)
  return v
}

describe('M7.2 canonical scenarios — phase render', () => {
  it('Scenario 1 (active M7.2+) — anxious branch normal completion: intro → breath → closing', () => {
    const v = getVariant('anxious_calm_downregulate_reduced_effort_standard')
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

    // Intro 5s
    expect(screen.getByLabelText('Session intro')).toBeInTheDocument()
    expect(onPhaseStart).toHaveBeenCalledWith(0, 'transition', 'intro')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(0)

    // Breath phase
    expect(onPhaseStart).toHaveBeenCalledWith(1, 'breath', undefined)
    act(() => { vi.advanceTimersByTime(breathDurationMs(v)) })
    expect(onPhaseEnd).toHaveBeenCalledWith(1)

    // Closing 5s
    expect(screen.getByLabelText('Session closing')).toBeInTheDocument()
    expect(onPhaseStart).toHaveBeenCalledWith(2, 'transition', 'closing')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(2)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('Scenario 7 (active M7.2+) — tightness branch normal completion', () => {
    const v = getVariant('tightness_decompression_reduced_effort_short')
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

    expect(screen.getByLabelText('Session intro')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { vi.advanceTimersByTime(breathDurationMs(v)) })
    expect(screen.getByLabelText('Session closing')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(5000) })

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
