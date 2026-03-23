import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagSelector } from './TagSelector'

const tags = ['burning', 'tightness', 'pressure'] as const

describe('TagSelector', () => {
  it('renders all tags as buttons', () => {
    render(<TagSelector tags={tags} selected={[]} onToggle={vi.fn()} label="Pain type" />)
    expect(screen.getByRole('button', { name: /burning/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tightness/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pressure/i })).toBeInTheDocument()
  })

  it('unselected chips have aria-pressed=false', () => {
    render(<TagSelector tags={tags} selected={[]} onToggle={vi.fn()} label="Pain type" />)
    tags.forEach((tag) => {
      expect(screen.getByRole('button', { name: new RegExp(tag, 'i') }))
        .toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('selected chips have aria-pressed=true', () => {
    render(<TagSelector tags={tags} selected={['burning']} onToggle={vi.fn()} label="Pain type" />)
    expect(screen.getByRole('button', { name: /burning/i }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /tightness/i }))
      .toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onToggle with the tag when clicked', async () => {
    const onToggle = vi.fn()
    render(<TagSelector tags={tags} selected={[]} onToggle={onToggle} label="Pain type" />)
    await userEvent.click(screen.getByRole('button', { name: /tightness/i }))
    expect(onToggle).toHaveBeenCalledWith('tightness')
  })

  it('renders the group label', () => {
    render(<TagSelector tags={tags} selected={[]} onToggle={vi.fn()} label="What does it feel like?" />)
    expect(screen.getByText('What does it feel like?')).toBeInTheDocument()
  })
})
