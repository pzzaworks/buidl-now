import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SvgViewerTool } from '../svg-viewer'

describe('SvgViewerTool', () => {
  it('renders without crashing', () => {
    render(<SvgViewerTool />)
    expect(screen.getByText('SVG Code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /load sample svg/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('has preview dimension inputs', () => {
    render(<SvgViewerTool />)
    expect(screen.getByText('Preview Width (px)')).toBeInTheDocument()
    expect(screen.getByText('Preview Height (px)')).toBeInTheDocument()
  })

  it('has a textarea for SVG code input', () => {
    render(<SvgViewerTool />)
    const textarea = screen.getByPlaceholderText(/paste your svg markup/i)
    expect(textarea).toBeInTheDocument()
  })

  it('has action buttons', () => {
    render(<SvgViewerTool />)
    expect(screen.getByRole('button', { name: /load sample svg/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('has width and height dimension inputs', () => {
    render(<SvgViewerTool />)
    const inputs = screen.getAllByPlaceholderText('300')
    expect(inputs.length).toBe(2) // Width and Height inputs
  })

  it('dimension inputs have min and max attributes', () => {
    render(<SvgViewerTool />)
    const inputs = screen.getAllByPlaceholderText('300')

    inputs.forEach(input => {
      expect(input).toHaveAttribute('min', '100')
      expect(input).toHaveAttribute('max', '800')
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  // Regression: the SVG was inserted as markup, so its onload and <script> ran inside the site.
  it('previews the SVG as an image, never as live markup', () => {
    const { container } = render(<SvgViewerTool />)
    const textarea = screen.getByPlaceholderText(/paste your svg markup/i)

    fireEvent.change(textarea, {
      target: { value: '<svg onload="alert(1)" viewBox="0 0 10 10"><script>alert(2)</script><rect width="10" height="10"/></svg>' },
    })

    expect(container.querySelector('svg[onload]')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
    const image = container.querySelector('img[src^="data:image/svg+xml"]')
    expect(image).not.toBeNull()
    expect(decodeURIComponent(image?.getAttribute('src') ?? '')).toContain('xmlns="http://www.w3.org/2000/svg"')
  })
})
