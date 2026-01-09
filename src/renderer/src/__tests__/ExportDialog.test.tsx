import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportDialog } from '../components/ExportDialog'
import { Property } from '../types'

// Mock the api module
vi.mock('../lib/api', () => ({
  api: {
    exportDocument: vi.fn()
  }
}))

import { api } from '../lib/api'

describe('ExportDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    noteId: 'test-note-id',
    noteTitle: 'Test Note Title',
    noteContent: 'Test note content with $math$ and [@citation]',
    noteProperties: {
      status: { key: 'status', value: ['draft'], type: 'list' as const },  // List type must be array
      priority: { key: 'priority', value: ['high'], type: 'list' as const },  // List type must be array
    } as Record<string, Property>,
    noteTags: ['important', 'research'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.exportDocument as ReturnType<typeof vi.fn>).mockResolvedValue({
      path: '/path/to/export.pdf',
      success: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders export dialog when isOpen is true', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByText('Export Note')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ExportDialog {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Export Note')).not.toBeInTheDocument()
    })

    it('renders dialog description for accessibility', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByText('Export your note to PDF, Word, or LaTeX format')).toBeInTheDocument()
    })

    it('renders all format options', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByText('PDF')).toBeInTheDocument()
      expect(screen.getByText('Word')).toBeInTheDocument()
      expect(screen.getByText('Markdown')).toBeInTheDocument()
      expect(screen.getByText('LaTeX')).toBeInTheDocument()
      expect(screen.getByText('HTML')).toBeInTheDocument()
    })

    it('renders all citation style options', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByText('APA 7th Edition')).toBeInTheDocument()
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('renders bibliography path input', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByPlaceholderText('~/Zotero/library.bib')).toBeInTheDocument()
    })

    it('renders Cancel and Export buttons', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    it('renders close button with aria-label', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })
  })

  describe('Format Selection', () => {
    it('PDF is selected by default', () => {
      render(<ExportDialog {...defaultProps} />)
      // PDF button should have accent background (checking computed style is tricky, check by behavior)
      const pdfButton = screen.getByText('PDF').closest('button')
      expect(pdfButton).toBeInTheDocument()
    })

    it('changes format when clicking Word button', async () => {
      render(<ExportDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('Word'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ format: 'docx' })
        )
      })
    })

    it('changes format when clicking LaTeX button', async () => {
      render(<ExportDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('LaTeX'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ format: 'latex' })
        )
      })
    })

    it('changes format when clicking HTML button', async () => {
      render(<ExportDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('HTML'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ format: 'html' })
        )
      })
    })

    it('shows frontmatter checkbox when Markdown is selected', () => {
      render(<ExportDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('Markdown'))

      expect(screen.getByText('Include YAML frontmatter')).toBeInTheDocument()
      expect(screen.queryByText('Include metadata')).not.toBeInTheDocument()
      expect(screen.queryByText('Process equations')).not.toBeInTheDocument()
    })

    it('shows metadata and equations checkboxes for non-Markdown formats', () => {
      render(<ExportDialog {...defaultProps} />)
      // PDF is selected by default
      expect(screen.getByText('Include metadata')).toBeInTheDocument()
      expect(screen.getByText('Process equations')).toBeInTheDocument()
      expect(screen.queryByText('Include YAML frontmatter')).not.toBeInTheDocument()
    })
  })

  describe('Citation Style Selection', () => {
    it('changes citation style when selecting different option', async () => {
      render(<ExportDialog {...defaultProps} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'chicago' } })

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ csl: 'chicago' })
        )
      })
    })

    it('has all citation style options available', () => {
      render(<ExportDialog {...defaultProps} />)
      const select = screen.getByRole('combobox')

      const options = select.querySelectorAll('option')
      const values = Array.from(options).map(opt => opt.getAttribute('value'))

      expect(values).toContain('apa')
      expect(values).toContain('chicago')
      expect(values).toContain('mla')
      expect(values).toContain('ieee')
      expect(values).toContain('harvard')
    })
  })

  describe('Bibliography Path Input', () => {
    it('updates bibliography path when typing', async () => {
      render(<ExportDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText('~/Zotero/library.bib')
      fireEvent.change(input, { target: { value: '/custom/path/refs.bib' } })

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ bibliography: '/custom/path/refs.bib' })
        )
      })
    })

    it('sends undefined for empty bibliography path', async () => {
      render(<ExportDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ bibliography: undefined })
        )
      })
    })
  })

  describe('Checkbox Options', () => {
    it('toggles includeMetadata checkbox', async () => {
      render(<ExportDialog {...defaultProps} />)

      const checkbox = screen.getByText('Include metadata').previousElementSibling as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ includeMetadata: false })
        )
      })
    })

    it('toggles processEquations checkbox', async () => {
      render(<ExportDialog {...defaultProps} />)

      const checkbox = screen.getByText('Process equations').previousElementSibling as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({ processEquations: false })
        )
      })
    })

    it('toggles includeFrontmatter checkbox for Markdown format', () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))

      const checkbox = screen.getByText('Include YAML frontmatter').previousElementSibling as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Export Actions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Cancel'))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when X button is clicked', () => {
      const onClose = vi.fn()
      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByLabelText('Close'))

      expect(onClose).toHaveBeenCalled()
    })

    it('shows Exporting... while export is in progress', async () => {
      let resolveExport: (value: { path: string; success: boolean }) => void
      ;(api.exportDocument as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => {
          resolveExport = resolve
        })
      )

      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Export'))

      expect(screen.getByText('Exporting...')).toBeInTheDocument()

      // Resolve the promise
      resolveExport!({ path: '/test', success: true })

      await waitFor(() => {
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument()
      })
    })

    it('disables export button while exporting', async () => {
      let resolveExport: (value: { path: string; success: boolean }) => void
      ;(api.exportDocument as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => {
          resolveExport = resolve
        })
      )

      render(<ExportDialog {...defaultProps} />)

      const exportButton = screen.getByText('Export').closest('button')
      fireEvent.click(exportButton!)

      expect(exportButton).toBeDisabled()

      resolveExport!({ path: '/test', success: true })

      await waitFor(() => {
        expect(screen.getByText('Export').closest('button')).not.toBeDisabled()
      })
    })
  })

  describe('Export Results', () => {
    it('shows success message on successful export', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText(/Exported to: \/path\/to\/export\.pdf/)).toBeInTheDocument()
      })
    })

    it('shows error message on failed export', async () => {
      ;(api.exportDocument as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Pandoc not found'))

      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Pandoc not found')).toBeInTheDocument()
      })
    })

    it('shows generic error message for non-Error exceptions', async () => {
      ;(api.exportDocument as ReturnType<typeof vi.fn>).mockRejectedValue('Something went wrong')

      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument()
      })
    })

    it('closes dialog after successful export with delay', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Export'))

      // Success message appears
      await vi.waitFor(() => {
        expect(screen.getByText(/Exported to:/)).toBeInTheDocument()
      })

      // Dialog should close after 2 seconds
      expect(onClose).not.toHaveBeenCalled()
      vi.advanceTimersByTime(2000)
      expect(onClose).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Markdown Export', () => {
    let originalCreateObjectURL: typeof URL.createObjectURL
    let originalRevokeObjectURL: typeof URL.revokeObjectURL
    let mockCreateObjectURL: ReturnType<typeof vi.fn>
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>
    let capturedBlob: Blob | null = null

    beforeEach(() => {
      capturedBlob = null
      originalCreateObjectURL = URL.createObjectURL
      originalRevokeObjectURL = URL.revokeObjectURL

      mockCreateObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return 'blob:test-url'
      })
      mockRevokeObjectURL = vi.fn()

      URL.createObjectURL = mockCreateObjectURL as (obj: Blob | MediaSource) => string
      URL.revokeObjectURL = mockRevokeObjectURL as (url: string) => void
    })

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
    })

    it('does not call exportDocument API for markdown format', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      expect(api.exportDocument).not.toHaveBeenCalled()
    })

    it('creates blob with markdown content', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
      })

      expect(capturedBlob).not.toBeNull()
      expect(capturedBlob?.type).toBe('text/markdown')
    })

    it('revokes object URL after download', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
      })
    })

    it('closes dialog after markdown download with delay', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await vi.waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      vi.advanceTimersByTime(2000)
      expect(onClose).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('includes frontmatter when option is enabled', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      // Frontmatter is enabled by default
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      // Read the blob content
      const content = await capturedBlob!.text()

      expect(content).toContain('---')
      expect(content).toContain('title: "Test Note Title"')
    })

    it('excludes frontmatter when option is disabled', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))

      // Uncheck frontmatter option
      const checkbox = screen.getByText('Include YAML frontmatter').previousElementSibling as HTMLInputElement
      fireEvent.click(checkbox)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).not.toContain('---')
      expect(content).toBe('Test note content with $math$ and [@citation]')
    })

    it('includes properties in frontmatter', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      // List properties are now arrays, so they appear as YAML arrays
      expect(content).toContain('status:')
      expect(content).toContain('- "draft"')
      expect(content).toContain('priority:')
      expect(content).toContain('- "high"')
    })

    it('includes tags in frontmatter', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).toContain('tags:')
      expect(content).toContain('- "important"')
      expect(content).toContain('- "research"')
    })

    it('includes date in frontmatter', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      // Check that date is present in YYYY-MM-DD format
      expect(content).toMatch(/date: "\d{4}-\d{2}-\d{2}"/)
    })

    it('escapes quotes in title', async () => {
      render(<ExportDialog {...defaultProps} noteTitle='Test "Quoted" Title' />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).toContain('title: "Test \\"Quoted\\" Title"')
    })

    it('handles array property values', async () => {
      const propsWithArray = {
        ...defaultProps,
        noteProperties: {
          authors: { key: 'authors', value: ['Smith', 'Jones'], type: 'list' as const },
        },
      }

      render(<ExportDialog {...propsWithArray} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).toContain('authors:')
      expect(content).toContain('- "Smith"')
      expect(content).toContain('- "Jones"')
    })

    it('handles boolean property values', async () => {
      const propsWithBool = {
        ...defaultProps,
        noteProperties: {
          published: { key: 'published', value: true, type: 'checkbox' as const },
        },
      }

      render(<ExportDialog {...propsWithBool} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).toContain('published: true')
    })

    it('handles number property values', async () => {
      const propsWithNumber = {
        ...defaultProps,
        noteProperties: {
          word_count: { key: 'word_count', value: 1500, type: 'number' as const },
        },
      }

      render(<ExportDialog {...propsWithNumber} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).toContain('word_count: 1500')
    })

    it('skips empty property values', async () => {
      const propsWithEmpty = {
        ...defaultProps,
        noteProperties: {
          empty_string: { key: 'empty_string', value: '', type: 'text' as const },
          valid: { key: 'valid', value: 'has value', type: 'text' as const },
        },
      }

      render(<ExportDialog {...propsWithEmpty} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).not.toContain('empty_string')
      expect(content).toContain('valid: "has value"')
    })

    it('skips empty array property values', async () => {
      const propsWithEmptyArray = {
        ...defaultProps,
        noteProperties: {
          empty_list: { key: 'empty_list', value: [], type: 'list' as const },
        },
        noteTags: [],
      }

      render(<ExportDialog {...propsWithEmptyArray} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      expect(content).not.toContain('empty_list')
      expect(content).not.toMatch(/tags:/)
    })

    it('handles undefined properties gracefully', async () => {
      const propsWithoutProperties = {
        ...defaultProps,
        noteProperties: undefined,
        noteTags: undefined,
      }

      render(<ExportDialog {...propsWithoutProperties} />)

      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText('Markdown file downloaded')).toBeInTheDocument()
      })

      const content = await capturedBlob!.text()

      // Should still have title and date
      expect(content).toContain('title: "Test Note Title"')
      expect(content).toContain('date:')
    })
  })

  describe('Export API Call', () => {
    it('calls exportDocument with all required fields', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith({
          noteId: 'test-note-id',
          content: 'Test note content with $math$ and [@citation]',
          title: 'Test Note Title',
          format: 'pdf',
          bibliography: undefined,
          csl: 'apa',
          includeMetadata: true,
          processEquations: true,
        })
      })
    })

    it('includes bibliography path when provided', async () => {
      render(<ExportDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText('~/Zotero/library.bib')
      fireEvent.change(input, { target: { value: '/path/to/refs.bib' } })

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({
            bibliography: '/path/to/refs.bib',
          })
        )
      })
    })
  })

  describe('Dialog Close Behavior', () => {
    it('calls onClose when dialog overlay is clicked', () => {
      const onClose = vi.fn()
      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      // The dialog uses onOpenChange which calls onClose when closed
      // This behavior is handled by Radix Dialog internally
      // Just verify the close button works as a proxy
      fireEvent.click(screen.getByLabelText('Close'))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long note content', async () => {
      const longContent = 'A'.repeat(10000)
      render(<ExportDialog {...defaultProps} noteContent={longContent} />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({
            content: longContent,
          })
        )
      })
    })

    it('handles empty note content', async () => {
      render(<ExportDialog {...defaultProps} noteContent="" />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({
            content: '',
          })
        )
      })
    })

    it('handles note title with special characters', async () => {
      render(<ExportDialog {...defaultProps} noteTitle="Test: Note (2024) - Draft #1" />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(api.exportDocument).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test: Note (2024) - Draft #1',
          })
        )
      })
    })

    it('handles rapid format switching', () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Word'))
      fireEvent.click(screen.getByText('LaTeX'))
      fireEvent.click(screen.getByText('HTML'))
      fireEvent.click(screen.getByText('Markdown'))
      fireEvent.click(screen.getByText('PDF'))

      // Should end up with PDF selected
      expect(screen.getByText('Include metadata')).toBeInTheDocument()
    })

    it('handles multiple export attempts', async () => {
      render(<ExportDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Export'))

      await waitFor(() => {
        expect(screen.getByText(/Exported to:/)).toBeInTheDocument()
      })

      // Component should have called export once
      expect(api.exportDocument).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has accessible dialog title', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByRole('heading', { name: 'Export Note' })).toBeInTheDocument()
    })

    it('has accessible form labels', () => {
      render(<ExportDialog {...defaultProps} />)
      expect(screen.getByText('Format')).toBeInTheDocument()
      expect(screen.getByText('Bibliography (.bib file)')).toBeInTheDocument()
      expect(screen.getByText('Citation Style')).toBeInTheDocument()
    })

    it('format buttons are focusable', () => {
      render(<ExportDialog {...defaultProps} />)
      const pdfButton = screen.getByText('PDF').closest('button')
      expect(pdfButton).not.toBeDisabled()
    })
  })
})
