import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CitationAutocomplete, Citation } from '../components/CitationAutocomplete'
import { ExportDialog } from '../components/ExportDialog'

// Mock the api module
vi.mock('../lib/api', () => ({
  api: {
    searchCitations: vi.fn(),
    exportDocument: vi.fn()
  }
}))

import { api } from '../lib/api'

describe('CitationAutocomplete Component', () => {
  const mockCitations: Citation[] = [
    {
      key: 'smith2020',
      title: 'A Great Paper on Statistics',
      authors: ['Smith', 'Jones'],
      year: 2020,
      journal: 'Nature'
    },
    {
      key: 'doe2021',
      title: 'Machine Learning Advances',
      authors: ['Doe'],
      year: 2021
    },
    {
      key: 'brown2019',
      title: 'Introduction to Bayesian Methods',
      authors: ['Brown', 'White', 'Green'],
      year: 2019,
      journal: 'JASA'
    }
  ]

  const defaultProps = {
    query: '',
    position: { top: 100, left: 200 },
    onSelect: vi.fn(),
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.searchCitations as ReturnType<typeof vi.fn>).mockResolvedValue(mockCitations)
  })

  it('renders loading state initially', () => {
    render(<CitationAutocomplete {...defaultProps} />)

    expect(screen.getByText('Loading citations...')).toBeInTheDocument()
  })

  it('displays citations after loading', async () => {
    render(<CitationAutocomplete {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('@smith2020')).toBeInTheDocument()
    })

    expect(screen.getByText('A Great Paper on Statistics')).toBeInTheDocument()
    expect(screen.getByText('@doe2021')).toBeInTheDocument()
    expect(screen.getByText('@brown2019')).toBeInTheDocument()
  })

  it('filters citations based on query', async () => {
    ;(api.searchCitations as ReturnType<typeof vi.fn>).mockResolvedValue([mockCitations[0]])

    render(<CitationAutocomplete {...defaultProps} query="smith" />)

    await waitFor(() => {
      expect(screen.getByText('@smith2020')).toBeInTheDocument()
    })

    expect(screen.queryByText('@doe2021')).not.toBeInTheDocument()
  })

  it('calls onSelect when citation is clicked', async () => {
    const onSelect = vi.fn()
    render(<CitationAutocomplete {...defaultProps} onSelect={onSelect} />)

    await waitFor(() => {
      expect(screen.getByText('@smith2020')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('@smith2020'))

    expect(onSelect).toHaveBeenCalledWith('smith2020')
  })

  it('displays error state when API fails', async () => {
    ;(api.searchCitations as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'))

    render(<CitationAutocomplete {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load citations')).toBeInTheDocument()
    })
  })

  it('shows no results message for empty search', async () => {
    ;(api.searchCitations as ReturnType<typeof vi.fn>).mockResolvedValue([])

    render(<CitationAutocomplete {...defaultProps} query="nonexistent" />)

    await waitFor(() => {
      expect(screen.getByText(/No citations found/)).toBeInTheDocument()
    })
  })

  it('formats authors correctly', async () => {
    render(<CitationAutocomplete {...defaultProps} />)

    await waitFor(() => {
      // Two authors: "Smith & Jones"
      expect(screen.getByText(/Smith & Jones/)).toBeInTheDocument()
      // One author: "Doe"
      expect(screen.getByText(/Doe \(2021\)/)).toBeInTheDocument()
      // Three+ authors: "Brown et al."
      expect(screen.getByText(/Brown et al./)).toBeInTheDocument()
    })
  })

  it('shows journal when available', async () => {
    render(<CitationAutocomplete {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/Nature/)).toBeInTheDocument()
      expect(screen.getByText(/JASA/)).toBeInTheDocument()
    })
  })

  it('handles keyboard navigation', async () => {
    const onSelect = vi.fn()
    render(<CitationAutocomplete {...defaultProps} onSelect={onSelect} />)

    await waitFor(() => {
      expect(screen.getByText('@smith2020')).toBeInTheDocument()
    })

    // Press Enter to select first item
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith('smith2020')
  })

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(<CitationAutocomplete {...defaultProps} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByText('@smith2020')).toBeInTheDocument()
    })

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })
})

describe('ExportDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    noteId: 'test-note-id',
    noteTitle: 'Test Note Title',
    noteContent: 'Test note content with $math$ and [@citation]'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.exportDocument as ReturnType<typeof vi.fn>).mockResolvedValue({
      path: '/path/to/export.pdf',
      success: true
    })
  })

  it('renders export dialog', () => {
    render(<ExportDialog {...defaultProps} />)

    expect(screen.getByText('Export Note')).toBeInTheDocument()
  })

  it('shows format options', () => {
    render(<ExportDialog {...defaultProps} />)

    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Word')).toBeInTheDocument()
    expect(screen.getByText('LaTeX')).toBeInTheDocument()
    expect(screen.getByText('HTML')).toBeInTheDocument()
  })

  it('shows citation style options', () => {
    render(<ExportDialog {...defaultProps} />)

    expect(screen.getByText('APA 7th Edition')).toBeInTheDocument()
  })

  it('has bibliography path input', () => {
    render(<ExportDialog {...defaultProps} />)

    expect(screen.getByPlaceholderText(/\.bib/)).toBeInTheDocument()
  })

  it('has metadata and equations checkboxes', () => {
    render(<ExportDialog {...defaultProps} />)

    expect(screen.getByText('Include metadata')).toBeInTheDocument()
    expect(screen.getByText('Process equations')).toBeInTheDocument()
  })

  it('calls export API with correct options', async () => {
    render(<ExportDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Export'))

    await waitFor(() => {
      expect(api.exportDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          noteId: 'test-note-id',
          title: 'Test Note Title',
          format: 'pdf',
          csl: 'apa'
        })
      )
    })
  })

  it('shows success message on successful export', async () => {
    render(<ExportDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Export'))

    await waitFor(() => {
      expect(screen.getByText(/Exported to:/)).toBeInTheDocument()
    })
  })

  it('shows error message on failed export', async () => {
    ;(api.exportDocument as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Export failed'))

    render(<ExportDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Export'))

    await waitFor(() => {
      expect(screen.getByText(/Export failed/)).toBeInTheDocument()
    })
  })

  it('disables export button while exporting', async () => {
    // Make the API call take time
    ;(api.exportDocument as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ path: '/test', success: true }), 100))
    )

    render(<ExportDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Export'))

    expect(screen.getByText('Exporting...')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
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

  it('changes format when format button is clicked', async () => {
    render(<ExportDialog {...defaultProps} />)

    // Click Word format button
    fireEvent.click(screen.getByText('Word'))

    // Click Export and verify the format is 'docx'
    fireEvent.click(screen.getByText('Export'))

    await waitFor(() => {
      expect(api.exportDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'docx'
        })
      )
    })
  })
})

describe('Citation Data Types', () => {
  it('validates Citation interface', () => {
    const citation: Citation = {
      key: 'test2020',
      title: 'Test Title',
      authors: ['Author1', 'Author2'],
      year: 2020,
      journal: 'Test Journal',
      doi: '10.1234/test'
    }

    expect(citation.key).toBeTruthy()
    expect(citation.title).toBeTruthy()
    expect(Array.isArray(citation.authors)).toBe(true)
    expect(typeof citation.year).toBe('number')
    expect(citation.journal).toBe('Test Journal')
    expect(citation.doi).toBe('10.1234/test')
  })

  it('handles Citation without optional fields', () => {
    const citation: Citation = {
      key: 'test2020',
      title: 'Test Title',
      authors: ['Author'],
      year: 2020
    }

    expect(citation.journal).toBeUndefined()
    expect(citation.doi).toBeUndefined()
  })
})
