import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BodyPicker, type BodyPickerSelection } from './BodyPicker'

// Test helper: a controlled wrapper that propagates state back into BodyPicker.
// Required for tests that assert behavior across re-renders (e.g. drawer-close
// auto-tag relies on the muscle prop reflecting an in-session pick). The bare
// `<BodyPicker selectedMuscles={[]} ... onChange={vi.fn()} />` pattern keeps
// muscles frozen at [] across renders because vi.fn() doesn't update props.
function ControlledBodyPicker({ onChange }: { onChange?: (s: BodyPickerSelection) => void }) {
  const [state, setState] = useState<BodyPickerSelection>({
    regions: [], muscles: [], diffuseUnspecified: false,
  })
  return (
    <BodyPicker
      selectedRegions={state.regions}
      selectedMuscles={state.muscles}
      diffuseUnspecified={state.diffuseUnspecified}
      onChange={(next) => { setState(next); onChange?.(next) }}
    />
  )
}

describe('BodyPicker — basic structure', () => {
  it('renders both anterior and posterior body SVGs', () => {
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={() => {}} />
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(2)
    expect(svgs[0].getAttribute('aria-label')).toMatch(/anterior/i)
    expect(svgs[1].getAttribute('aria-label')).toMatch(/posterior/i)
  })

  it('renders one escape hatch button "I can\'t pinpoint where it is"', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={() => {}} />
    )
    expect(screen.getByRole('button', { name: /can't pinpoint/i })).toBeInTheDocument()
  })

  it('does NOT render the old 3-button fallback row', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={() => {}} />
    )
    expect(screen.queryByRole('button', { name: /^spread \/ multiple$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^whole body$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^not sure$/i })).not.toBeInTheDocument()
  })

  it('shows empty hint when nothing is selected', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={() => {}} />
    )
    expect(screen.getByText(/none yet — tap a region above/i)).toBeInTheDocument()
  })
})

describe('BodyPicker — region tap', () => {
  it('tapping a region with multiple muscles opens the drawer', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={onChange} />
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
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={onChange} />
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
  it('selecting a muscle in the drawer records only the muscle (parent region inferred at submit)', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      regions: [],
      muscles: ['shoulder_front_left'],
    }))
  })
})

describe('BodyPicker — drawer close', () => {
  it('closing drawer with no muscles picked tags the region itself', async () => {
    const onChange = vi.fn()
    const { container } = render(<ControlledBodyPicker onChange={onChange} />)
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      regions: ['shoulder_left'],
      muscles: [],
    }))
  })

  it('closing drawer after picking a muscle keeps the muscle and does not auto-add parent region', async () => {
    const onChange = vi.fn()
    const { container } = render(<ControlledBodyPicker onChange={onChange} />)
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(side\)/i }))
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(last.muscles).toEqual(['shoulder_side_left'])
    expect(last.regions).toEqual([])
  })
})

describe("BodyPicker — diffuse escape hatch", () => {
  it("tapping \"I can't pinpoint\" clears regions/muscles and sets diffuseUnspecified", async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker
        selectedRegions={['shoulder_left']}
        selectedMuscles={['shoulder_front_left']}
        diffuseUnspecified={false}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /can't pinpoint/i }))
    expect(onChange).toHaveBeenCalledWith({
      regions: [],
      muscles: [],
      diffuseUnspecified: true,
    })
  })

  it('escape hatch is mutually exclusive — tapping a region clears it', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker
        selectedRegions={[]}
        selectedMuscles={[]}
        diffuseUnspecified={true}
        onChange={onChange}
      />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    // First emit clears the escape hatch (preserves mutual exclusion even
    // if the user closes the drawer without picking a muscle).
    const firstCall = onChange.mock.calls[0]?.[0]
    expect(firstCall).toEqual({ regions: [], muscles: [], diffuseUnspecified: false })
  })

  it('shows "Diffuse — no specific region" hint when escape hatch is active', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={true} onChange={() => {}} />
    )
    expect(screen.getByText(/diffuse — no specific region/i)).toBeInTheDocument()
  })
})

describe('BodyPicker — pattern badge', () => {
  it('does not render a pattern badge for 0 selections', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={false} onChange={() => {}} />
    )
    expect(screen.queryByTestId('pattern-badge')).not.toBeInTheDocument()
  })

  it('does not render a pattern badge for 1 region (no relationship to infer)', () => {
    render(
      <BodyPicker selectedRegions={['lower_back']} selectedMuscles={[]} diffuseUnspecified={false} onChange={() => {}} />
    )
    expect(screen.queryByTestId('pattern-badge')).not.toBeInTheDocument()
  })

  it('shows "Connected" badge when 2+ regions fit one anatomical chain', () => {
    render(
      <BodyPicker
        selectedRegions={['lower_back', 'glute']}
        selectedMuscles={[]}
        diffuseUnspecified={false}
        onChange={() => {}}
      />
    )
    const badge = screen.getByTestId('pattern-badge')
    expect(badge).toHaveTextContent(/connected/i)
  })

  it('shows "Multifocal" badge for 2 regions across distinct chains', () => {
    render(
      <BodyPicker
        selectedRegions={['neck', 'ankle_foot_right']}
        selectedMuscles={[]}
        diffuseUnspecified={false}
        onChange={() => {}}
      />
    )
    const badge = screen.getByTestId('pattern-badge')
    expect(badge).toHaveTextContent(/multifocal/i)
  })

  it('shows "Widespread" badge for 4+ regions across 3+ chains', () => {
    render(
      <BodyPicker
        selectedRegions={['neck', 'lower_back', 'shoulder_left', 'ankle_foot_right']}
        selectedMuscles={[]}
        diffuseUnspecified={false}
        onChange={() => {}}
      />
    )
    const badge = screen.getByTestId('pattern-badge')
    expect(badge).toHaveTextContent(/widespread/i)
  })

  it('hides pattern badge while diffuseUnspecified is active', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} diffuseUnspecified={true} onChange={() => {}} />
    )
    expect(screen.queryByTestId('pattern-badge')).not.toBeInTheDocument()
  })
})

describe('BodyPicker — chip removal', () => {
  it('removing a region chip also removes child muscles', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker
        selectedRegions={['shoulder_left']}
        selectedMuscles={['shoulder_front_left', 'shoulder_side_left']}
        diffuseUnspecified={false}
        onChange={onChange}
      />
    )
    const chip = screen.getByRole('button', { name: /^left shoulder/i })
    await userEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith({
      regions: [],
      muscles: [],
      diffuseUnspecified: false,
    })
  })

  it('removing a muscle chip leaves parent region alone', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker
        selectedRegions={['shoulder_left']}
        selectedMuscles={['shoulder_front_left']}
        diffuseUnspecified={false}
        onChange={onChange}
      />
    )
    const chip = screen.getByRole('button', { name: /left shoulder \(front\)/i })
    await userEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith({
      regions: ['shoulder_left'],
      muscles: [],
      diffuseUnspecified: false,
    })
  })
})
