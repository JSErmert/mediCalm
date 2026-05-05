import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BodyPicker } from './BodyPicker'

describe('BodyPicker — basic structure', () => {
  it('renders both anterior and posterior body SVGs', () => {
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={() => {}} />
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(2)
    expect(svgs[0].getAttribute('aria-label')).toMatch(/anterior/i)
    expect(svgs[1].getAttribute('aria-label')).toMatch(/posterior/i)
  })

  it('renders three fallback buttons: Spread / Whole body / Not sure', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={() => {}} />
    )
    expect(screen.getByRole('button', { name: /spread \/ multiple/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /whole body/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^not sure$/i })).toBeInTheDocument()
  })

  it('shows empty hint when nothing is selected', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={() => {}} />
    )
    expect(screen.getByText(/none yet — tap a region above/i)).toBeInTheDocument()
  })
})

describe('BodyPicker — region tap', () => {
  it('tapping a region with multiple muscles opens the drawer', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).not.toMatch(/open/)
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')!
    await userEvent.click(shoulderGroup)
    expect(drawer.className).toMatch(/open/)
  })

  it('tapping a region with a single muscle auto-tags the region (no drawer)', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    // ankle_foot_left has only one path on each side; counts as single-region select
    const ankleGroup = container.querySelector('g[data-region="ankle_foot_left"]')!
    await userEvent.click(ankleGroup)
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).not.toMatch(/open/)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      regions: ['ankle_foot_left'],
      muscles: [],
    }))
  })
})

describe('BodyPicker — muscle pick', () => {
  it('selecting a muscle in the drawer adds the muscle AND its parent region', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      regions: expect.arrayContaining(['shoulder_left']),
      muscles: ['shoulder_front_left'],
    }))
  })
})

describe('BodyPicker — drawer close', () => {
  it('closing drawer with no muscles picked tags the region itself', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      regions: ['shoulder_left'],
      muscles: [],
    }))
  })

  it('closing drawer after picking a muscle keeps the muscle (region inferred)', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(side\)/i }))
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(last.muscles).toEqual(['shoulder_side_left'])
    expect(last.regions).toEqual(['shoulder_left'])
  })
})

describe('BodyPicker — fallbacks', () => {
  it('tapping a fallback clears regions and muscles', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker selectedRegions={['shoulder_left']} selectedMuscles={['shoulder_front_left']} fallback={null} onChange={onChange} />
    )
    await userEvent.click(screen.getByRole('button', { name: /whole body/i }))
    expect(onChange).toHaveBeenCalledWith({
      regions: [],
      muscles: [],
      fallback: 'whole_body',
    })
  })
})

describe('BodyPicker — chip removal', () => {
  it('removing a region chip also removes child muscles', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker selectedRegions={['shoulder_left']} selectedMuscles={['shoulder_front_left', 'shoulder_side_left']} fallback={null} onChange={onChange} />
    )
    // The chip text contains the human-readable region label
    const chip = screen.getByRole('button', { name: /^left shoulder/i })
    await userEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith({
      regions: [],
      muscles: [],
      fallback: null,
    })
  })

  it('removing a muscle chip leaves parent region alone', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker selectedRegions={['shoulder_left']} selectedMuscles={['shoulder_front_left']} fallback={null} onChange={onChange} />
    )
    const chip = screen.getByRole('button', { name: /left shoulder \(front\)/i })
    await userEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith({
      regions: ['shoulder_left'],
      muscles: [],
      fallback: null,
    })
  })
})
