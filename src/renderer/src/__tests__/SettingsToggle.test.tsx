import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsToggle } from '../components/Settings/SettingsToggle'

describe('SettingsToggle', () => {
  it('renders label and description', () => {
    render(
      <SettingsToggle
        label="My Label"
        description="My Description"
        checked={false}
        onChange={() => {}}
      />
    )

    expect(screen.getByText('My Label')).toBeInTheDocument()
    expect(screen.getByText('My Description')).toBeInTheDocument()
  })

  it('shows checked state with accent color', () => {
    render(
      <SettingsToggle
        label="Toggle"
        description="Desc"
        checked={true}
        onChange={() => {}}
        testId="my-toggle"
      />
    )

    const button = screen.getByTestId('my-toggle')
    expect(button.className).toContain('bg-nexus-accent')
    expect(button.className).not.toContain('bg-white/10')
  })

  it('shows unchecked state with white/10 color', () => {
    render(
      <SettingsToggle
        label="Toggle"
        description="Desc"
        checked={false}
        onChange={() => {}}
        testId="my-toggle"
      />
    )

    const button = screen.getByTestId('my-toggle')
    expect(button.className).toContain('bg-white/10')
    expect(button.className).not.toContain('bg-nexus-accent')
  })

  it('calls onChange on click', () => {
    const handleChange = vi.fn()

    render(
      <SettingsToggle
        label="Toggle"
        description="Desc"
        checked={false}
        onChange={handleChange}
        testId="my-toggle"
      />
    )

    fireEvent.click(screen.getByTestId('my-toggle'))
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('uses testId prop when provided', () => {
    render(
      <SettingsToggle
        label="Toggle"
        description="Desc"
        checked={false}
        onChange={() => {}}
        testId="custom-test-id"
      />
    )

    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(
      <SettingsToggle
        label="My Toggle"
        description="Desc"
        checked={true}
        onChange={() => {}}
        testId="a11y-toggle"
      />
    )

    const button = screen.getByTestId('a11y-toggle')
    expect(button).toHaveAttribute('role', 'switch')
    expect(button).toHaveAttribute('aria-checked', 'true')
    expect(button).toHaveAttribute('aria-label', 'My Toggle')
  })

  it('sets aria-checked to false when unchecked', () => {
    render(
      <SettingsToggle
        label="Off Toggle"
        description="Desc"
        checked={false}
        onChange={() => {}}
        testId="unchecked-toggle"
      />
    )

    const button = screen.getByTestId('unchecked-toggle')
    expect(button).toHaveAttribute('aria-checked', 'false')
  })
})
