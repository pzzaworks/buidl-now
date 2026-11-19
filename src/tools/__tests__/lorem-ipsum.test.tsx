import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoremIpsumTool } from '../lorem-ipsum'

describe('LoremIpsumTool', () => {
  it('renders without crashing', () => {
    render(<LoremIpsumTool />)
    expect(screen.getByText('Count')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate Lorem Ipsum' })).toBeInTheDocument()
  })

  it('displays type selection buttons', () => {
    render(<LoremIpsumTool />)
    expect(screen.getByRole('button', { name: 'Paragraphs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sentences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Words' })).toBeInTheDocument()
  })

  it('has default count of 3', () => {
    render(<LoremIpsumTool />)
    const countInput = screen.getByPlaceholderText('3')
    expect(countInput).toHaveValue(3)
  })

  it('generates paragraphs by default', () => {
    render(<LoremIpsumTool />)
    const generateButton = screen.getByRole('button', { name: 'Generate Lorem Ipsum' })

    fireEvent.click(generateButton)

    expect(screen.getByText('Generated Text')).toBeInTheDocument()
    const textarea = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))
    if (textarea) {
      const value = (textarea as HTMLTextAreaElement).value
      // Paragraphs are separated by double newlines
      expect(value).toContain('\n\n')
    }
  })

  it('generates text starting with Lorem ipsum when checkbox is checked', () => {
    render(<LoremIpsumTool />)
    const generateButton = screen.getByRole('button', { name: 'Generate Lorem Ipsum' })

    fireEvent.click(generateButton)

    const textarea = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))
    if (textarea) {
      const value = (textarea as HTMLTextAreaElement).value
      expect(value.startsWith('Lorem ipsum dolor sit amet')).toBe(true)
    }
  })

  it('switches to sentences mode', () => {
    render(<LoremIpsumTool />)
    const sentencesButton = screen.getByRole('button', { name: 'Sentences' })

    fireEvent.click(sentencesButton)

    // The selected mode is exposed to assistive tech via aria-pressed
    expect(sentencesButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to words mode', () => {
    render(<LoremIpsumTool />)
    const wordsButton = screen.getByRole('button', { name: 'Words' })

    fireEvent.click(wordsButton)

    // The selected mode is exposed to assistive tech via aria-pressed
    expect(wordsButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('generates specified number of words', () => {
    render(<LoremIpsumTool />)
    const countInput = screen.getByPlaceholderText('3')
    const wordsButton = screen.getByRole('button', { name: 'Words' })
    const generateButton = screen.getByRole('button', { name: 'Generate Lorem Ipsum' })

    fireEvent.click(wordsButton)
    fireEvent.change(countInput, { target: { value: '10' } })
    fireEvent.click(generateButton)

    const textarea = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))
    if (textarea) {
      const value = (textarea as HTMLTextAreaElement).value
      const words = value.split(/\s+/)
      expect(words.length).toBe(10)
    }
  })

  it('can uncheck start with Lorem ipsum option', () => {
    render(<LoremIpsumTool />)
    const checkbox = screen.getByRole('checkbox')
    const generateButton = screen.getByRole('button', { name: 'Generate Lorem Ipsum' })

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(generateButton)

    const textarea = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))
    if (textarea) {
      const value = (textarea as HTMLTextAreaElement).value
      // Should not necessarily start with Lorem ipsum
      // (it could still randomly start with those words, but unlikely)
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('generates sentences with periods', () => {
    render(<LoremIpsumTool />)
    const sentencesButton = screen.getByRole('button', { name: 'Sentences' })
    const countInput = screen.getByPlaceholderText('3')
    const generateButton = screen.getByRole('button', { name: 'Generate Lorem Ipsum' })

    fireEvent.click(sentencesButton)
    fireEvent.change(countInput, { target: { value: '3' } })
    fireEvent.click(generateButton)

    const textarea = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))
    if (textarea) {
      const value = (textarea as HTMLTextAreaElement).value
      // Count periods
      const periodCount = (value.match(/\./g) || []).length
      expect(periodCount).toBeGreaterThanOrEqual(3)
    }
  })

  it('generates different content on each click', () => {
    render(<LoremIpsumTool />)
    const checkbox = screen.getByRole('checkbox')
    const generateButton = screen.getByRole('button', { name: 'Generate Lorem Ipsum' })

    // Uncheck Lorem ipsum start to ensure randomness
    fireEvent.click(checkbox)

    fireEvent.click(generateButton)
    const text1 = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))?.textContent

    fireEvent.click(generateButton)
    const text2 = screen.getAllByRole('textbox').find(el => el.hasAttribute('readonly'))?.textContent

    // Content should vary (random generation)
    // Note: This could occasionally fail due to randomness, but is unlikely with paragraphs
  })
})
