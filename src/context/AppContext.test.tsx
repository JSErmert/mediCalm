import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from './AppProvider'
import { useAppContext } from './AppContext'

function TestConsumer() {
  const { state, dispatch } = useAppContext()
  return (
    <div>
      <span data-testid="screen">{state.activeScreen}</span>
      <span data-testid="input">
        {state.pendingPainInput ? state.pendingPainInput.pain_level : 'none'}
      </span>
      <span data-testid="state-entry">
        {state.pendingStateEntry ?? 'none'}
      </span>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'pain_input' })}>
        go-input
      </button>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
        go-home
      </button>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'state_selection' })}>
        go-state-selection
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_PAIN_INPUT',
            input: { pain_level: 7, location_tags: ['ribs'], symptom_tags: ['burning'] },
          })
        }
      >
        set-input
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_PAIN_INPUT' })}>
        clear-input
      </button>
      <button
        onClick={() =>
          dispatch({ type: 'SET_STATE_ENTRY', entry: 'anxious_or_overwhelmed' })
        }
      >
        set-state-entry
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_STATE_ENTRY' })}>
        clear-state-entry
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_SESSION' })}>
        clear-session
      </button>
    </div>
  )
}

describe('AppContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts on the home screen', () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    expect(screen.getByTestId('screen').textContent).toBe('home')
  })

  it('navigates to pain_input', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('go-input'))
    expect(screen.getByTestId('screen').textContent).toBe('pain_input')
  })

  it('navigates back to home', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('go-input'))
    await userEvent.click(screen.getByText('go-home'))
    expect(screen.getByTestId('screen').textContent).toBe('home')
  })

  it('stores pain input and clears it', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('set-input'))
    expect(screen.getByTestId('input').textContent).toBe('7')
    await userEvent.click(screen.getByText('clear-input'))
    expect(screen.getByTestId('input').textContent).toBe('none')
  })

  it('pendingStateEntry starts as null', () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    expect(screen.getByTestId('state-entry').textContent).toBe('none')
  })

  it('SET_STATE_ENTRY stores selected branch', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('set-state-entry'))
    expect(screen.getByTestId('state-entry').textContent).toBe('anxious_or_overwhelmed')
  })

  it('CLEAR_STATE_ENTRY resets pendingStateEntry to null', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('set-state-entry'))
    await userEvent.click(screen.getByText('clear-state-entry'))
    expect(screen.getByTestId('state-entry').textContent).toBe('none')
  })

  it('CLEAR_SESSION clears pendingStateEntry', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('set-state-entry'))
    await userEvent.click(screen.getByText('clear-session'))
    expect(screen.getByTestId('state-entry').textContent).toBe('none')
  })

  it('navigates to state_selection', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('go-state-selection'))
    expect(screen.getByTestId('screen').textContent).toBe('state_selection')
  })
})
