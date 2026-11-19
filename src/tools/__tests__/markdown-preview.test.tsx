import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MarkdownPreviewTool } from '../markdown-preview'

describe('MarkdownPreviewTool', () => {
  it('renders without crashing', () => {
    render(<MarkdownPreviewTool />)
    expect(screen.getByText('Markdown Input')).toBeInTheDocument()
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    render(<MarkdownPreviewTool />)
    expect(screen.getByPlaceholderText(/# Hello World/)).toBeInTheDocument()
  })

  it('shows placeholder message when no input', () => {
    render(<MarkdownPreviewTool />)
    expect(screen.getByText(/Start typing markdown to see the preview/)).toBeInTheDocument()
  })

  it('renders markdown heading', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '# Hello World' } })

    await waitFor(() => {
      const preview = screen.getByText('Hello World')
      expect(preview.tagName).toBe('H1')
    })
  })

  it('renders bold text', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: 'This is **bold** text' } })

    await waitFor(() => {
      expect(screen.getByText('bold')).toBeInTheDocument()
    })
  })

  it('renders italic text', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: 'This is *italic* text' } })

    await waitFor(() => {
      expect(screen.getByText('italic')).toBeInTheDocument()
    })
  })

  it('renders unordered list', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '- Item 1\n- Item 2\n- Item 3' } })

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  it('renders ordered list', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '1. First\n2. Second\n3. Third' } })

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })
  })

  it('renders links', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '[Visit Example](https://example.com)' } })

    await waitFor(() => {
      const link = screen.getByText('Visit Example')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })
  })

  it('renders inline code', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: 'Use `const` for constants' } })

    await waitFor(() => {
      const code = screen.getByText('const')
      expect(code.tagName).toBe('CODE')
    })
  })

  it('renders code blocks', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '```javascript\nconst x = 1;\n```' } })

    await waitFor(() => {
      expect(screen.getByText('const x = 1;')).toBeInTheDocument()
    })
  })

  it('renders blockquotes', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '> This is a quote' } })

    await waitFor(() => {
      const quote = screen.getByText('This is a quote')
      expect(quote.closest('blockquote')).toBeInTheDocument()
    })
  })

  it('renders horizontal rule', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: 'Before\n\n---\n\nAfter' } })

    await waitFor(() => {
      expect(screen.getByText('Before')).toBeInTheDocument()
      expect(screen.getByText('After')).toBeInTheDocument()
    })
  })

  it('shows generated HTML output', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '# Test' } })

    await waitFor(() => {
      expect(screen.getByText('Generated HTML')).toBeInTheDocument()
    })

    const textareas = screen.getAllByRole('textbox')
    const outputTextarea = textareas.find(t => t.hasAttribute('readonly')) as HTMLTextAreaElement
    expect(outputTextarea?.value).toContain('<h1>')
    expect(outputTextarea?.value).toContain('Test')
    expect(outputTextarea?.value).toContain('</h1>')
  })

  it('updates preview in real-time', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '# First' } })

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument()
    })

    fireEvent.change(textarea, { target: { value: '# Second' } })

    await waitFor(() => {
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.queryByText('First')).not.toBeInTheDocument()
    })
  })

  it('handles multiple heading levels', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '# H1\n## H2\n### H3' } })

    await waitFor(() => {
      expect(screen.getByText('H1').tagName).toBe('H1')
      expect(screen.getByText('H2').tagName).toBe('H2')
      expect(screen.getByText('H3').tagName).toBe('H3')
    })
  })

  it('handles empty input gracefully', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '# Test' } })

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    fireEvent.change(textarea, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText(/Start typing markdown to see the preview/)).toBeInTheDocument()
    })
  })

  it('renders tables', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |' } })

    await waitFor(() => {
      expect(screen.getByText('Header 1')).toBeInTheDocument()
      expect(screen.getByText('Cell 1')).toBeInTheDocument()
    })
  })

  it('handles strikethrough text', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: '~~strikethrough~~' } })

    await waitFor(() => {
      expect(screen.getByText('strikethrough')).toBeInTheDocument()
    })
  })

  it('autolinks URLs', async () => {
    render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, { target: { value: 'Visit https://example.com for more' } })

    await waitFor(() => {
      const link = screen.getByText('https://example.com')
      expect(link.tagName).toBe('A')
    })
  })

  // Regression: HTML in the markdown went into the page unsanitized, so a pasted README
  // could run script inside the site.
  it('strips script and event handlers from HTML in the markdown', async () => {
    const { container } = render(<MarkdownPreviewTool />)
    const textarea = screen.getByPlaceholderText(/# Hello World/)

    fireEvent.change(textarea, {
      target: { value: '<img src="x" onerror="alert(1)"><script>alert(2)</script>\n\n**kept**' },
    })

    await waitFor(() => {
      expect(screen.getByText('kept').tagName).toBe('STRONG')
    })
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
  })
})
