import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BoxShadowGeneratorTool } from '../box-shadow-generator'

describe('BoxShadowGeneratorTool', () => {
  it('renders without crashing', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByText('Presets')).toBeInTheDocument()
    expect(screen.getByText(/Shadows/)).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByText('CSS Code')).toBeInTheDocument()
  })

  it('displays preset buttons', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByRole('button', { name: 'Subtle' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'XL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument()
  })

  it('displays shadow controls', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByText('Shadow 1')).toBeInTheDocument()
    expect(screen.getByText('Shadow 2')).toBeInTheDocument()
    // Multiple shadows have Horizontal, Vertical, etc. labels
    expect(screen.getAllByText(/Horizontal:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Vertical:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Blur:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Spread:/).length).toBeGreaterThan(0)
  })

  it('has Add Shadow button', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByRole('button', { name: 'Add Shadow' })).toBeInTheDocument()
  })

  it('displays shadow count', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByText('Shadows (2/5)')).toBeInTheDocument()
  })

  it('adds shadow when Add Shadow is clicked', () => {
    render(<BoxShadowGeneratorTool />)

    const addButton = screen.getByRole('button', { name: 'Add Shadow' })
    fireEvent.click(addButton)

    expect(screen.getByText('Shadows (3/5)')).toBeInTheDocument()
    expect(screen.getByText('Shadow 3')).toBeInTheDocument()
  })

  it('limits shadows to 5 maximum', () => {
    render(<BoxShadowGeneratorTool />)

    const addButton = screen.getByRole('button', { name: 'Add Shadow' })
    fireEvent.click(addButton) // 3
    fireEvent.click(addButton) // 4
    fireEvent.click(addButton) // 5

    expect(screen.getByText('Shadows (5/5)')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Shadow' })).not.toBeInTheDocument()
  })

  it('removes shadow when Remove is clicked', () => {
    render(<BoxShadowGeneratorTool />)

    // Should have 2 remove buttons (one for each shadow)
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
    fireEvent.click(removeButtons[0])

    expect(screen.getByText('Shadows (1/5)')).toBeInTheDocument()
  })

  it('does not show Remove button when only one shadow exists', () => {
    render(<BoxShadowGeneratorTool />)

    // Remove one shadow
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
    fireEvent.click(removeButtons[0])

    // Should only have 1 shadow now, remove button should not be visible
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  it('applies subtle preset when clicked', () => {
    render(<BoxShadowGeneratorTool />)

    const subtleButton = screen.getByRole('button', { name: 'Subtle' })
    fireEvent.click(subtleButton)

    // CSS output should contain subtle shadow values
    const readonlyInputs = document.querySelectorAll('input[readonly]')
    const cssInput = readonlyInputs[0] as HTMLInputElement
    expect(cssInput.value).toContain('box-shadow:')
    expect(cssInput.value).toContain('rgba')
  })

  it('applies inset preset when clicked', () => {
    render(<BoxShadowGeneratorTool />)

    const insetButton = screen.getByRole('button', { name: 'Inset' })
    fireEvent.click(insetButton)

    const readonlyInputs = document.querySelectorAll('input[readonly]')
    const cssInput = readonlyInputs[0] as HTMLInputElement
    expect(cssInput.value).toContain('inset')
  })

  it('has inset checkbox for each shadow', () => {
    render(<BoxShadowGeneratorTool />)

    const insetCheckboxes = screen.getAllByRole('checkbox')
    expect(insetCheckboxes.length).toBeGreaterThanOrEqual(2)
  })

  it('toggles inset when checkbox is clicked', () => {
    render(<BoxShadowGeneratorTool />)

    const insetCheckboxes = screen.getAllByRole('checkbox')
    fireEvent.click(insetCheckboxes[0])

    const readonlyInputs = document.querySelectorAll('input[readonly]')
    const cssInput = readonlyInputs[0] as HTMLInputElement
    expect(cssInput.value).toContain('inset')
  })

  it('displays preview background control', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByText('Preview Background')).toBeInTheDocument()
  })

  it('displays Tailwind arbitrary value output', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getByText('Tailwind Arbitrary Value')).toBeInTheDocument()
    const readonlyInputs = document.querySelectorAll('input[readonly]')
    const tailwindInput = readonlyInputs[1] as HTMLInputElement
    expect(tailwindInput.value).toContain('shadow-[')
  })

  it('updates CSS output when slider is changed', () => {
    render(<BoxShadowGeneratorTool />)

    // Get initial CSS value
    const readonlyInputs = document.querySelectorAll('input[readonly]')
    const cssInput = readonlyInputs[0] as HTMLInputElement
    const initialValue = cssInput.value

    // Find blur slider and change it
    const sliders = document.querySelectorAll('input[type="range"]')
    // Find blur slider (should contain the blur value)
    const blurSlider = Array.from(sliders).find(s => {
      const label = s.closest('div')?.querySelector('label')
      return label?.textContent?.includes('Blur')
    }) as HTMLInputElement

    if (blurSlider) {
      fireEvent.change(blurSlider, { target: { value: '50' } })
      const updatedInputs = document.querySelectorAll('input[readonly]')
      const updatedCssInput = updatedInputs[0] as HTMLInputElement
      expect(updatedCssInput.value).not.toBe(initialValue)
    }
  })

  it('allows changing shadow color', () => {
    render(<BoxShadowGeneratorTool />)

    const colorInputs = document.querySelectorAll('input[type="color"]')
    expect(colorInputs.length).toBeGreaterThan(0)
  })

  it('displays color input fields', () => {
    render(<BoxShadowGeneratorTool />)
    expect(screen.getAllByText('Color').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Opacity:/).length).toBeGreaterThan(0)
  })
})
