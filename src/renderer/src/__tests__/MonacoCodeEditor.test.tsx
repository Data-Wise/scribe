import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonacoCodeEditor } from '../components/MonacoCodeEditor'
import { useEditorStore } from '../store/editorStore'
import * as api from '../lib/api'

// Mock Monaco editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, onMount }: any) => {
    // Simulate editor mount
    if (onMount) {
      const mockEditor = {
        focus: vi.fn(),
        updateOptions: vi.fn(),
        addCommand: vi.fn(),
        getPosition: vi.fn(() => ({ lineNumber: 1, column: 1 })),
        setPosition: vi.fn(),
        getScrollTop: vi.fn(() => 0),
        setScrollTop: vi.fn(),
        onDidChangeCursorPosition: vi.fn(() => ({ dispose: vi.fn() })),
        onDidScrollChange: vi.fn(() => ({ dispose: vi.fn() }))
      }
      const mockMonaco = {
        KeyMod: { CtrlCmd: 1 },
        KeyCode: { KeyB: 1, Enter: 2 },
        languages: {
          registerCompletionItemProvider: vi.fn()
        }
      }
      setTimeout(() => onMount(mockEditor, mockMonaco), 0)
    }

    return (
      <div data-testid="monaco-editor">
        <textarea
          data-testid="monaco-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    )
  }
}))

// Mock API
vi.mock('../lib/api', () => ({
  api: {
    isLatexAvailable: vi.fn(),
    compileLatex: vi.fn(),
    isRAvailable: vi.fn(),
    executeRChunk: vi.fn()
  }
}))

describe('MonacoCodeEditor', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    useEditorStore.getState().reset()
    mockOnChange.mockClear()
    vi.clearAllMocks()
  })

  describe('Editor Initialization', () => {
    it('should render Monaco editor', () => {
      render(
        <MonacoCodeEditor
          content="# Test"
          onChange={mockOnChange}
          filePath="test.tex"
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('should display file path in header', () => {
      render(
        <MonacoCodeEditor
          content="content"
          onChange={mockOnChange}
          filePath="/path/to/paper.tex"
        />
      )

      expect(screen.getByText(/paper\.tex/)).toBeInTheDocument()
    })

    it('should show correct language in header', () => {
      render(
        <MonacoCodeEditor
          content="content"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      // Check for language "r" in the header (case-insensitive, standalone word)
      const headerText = screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' &&
               element?.className?.includes('capitalize') &&
               content.toLowerCase() === 'r'
      })
      expect(headerText).toBeInTheDocument()
    })

    it('should call onChange when content changes', async () => {
      const user = userEvent.setup()

      render(
        <MonacoCodeEditor
          content="original"
          onChange={mockOnChange}
          filePath="test.tex"
        />
      )

      const textarea = screen.getByTestId('monaco-textarea')
      await user.clear(textarea)
      await user.type(textarea, 'new content')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('LaTeX Features', () => {
    it('should show Compile button for .tex files', () => {
      render(
        <MonacoCodeEditor
          content="\\documentclass{article}"
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      expect(screen.getByText(/Compile/)).toBeInTheDocument()
    })

    it('should NOT show Compile button for non-LaTeX files', () => {
      render(
        <MonacoCodeEditor
          content="x <- 1"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      expect(screen.queryByText(/Compile/)).not.toBeInTheDocument()
    })

    it('should show auto-compile checkbox for LaTeX files', () => {
      render(
        <MonacoCodeEditor
          content="\\documentclass{article}"
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      expect(screen.getByText(/Auto-compile/)).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should call compileLatex when Compile button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.compileLatex).mockResolvedValue({
        success: true,
        pdfPath: '/tmp/output.pdf',
        errors: [],
        warnings: []
      })

      const content = String.raw`\documentclass{article}`

      render(
        <MonacoCodeEditor
          content={content}
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      const compileButton = screen.getByText(/Compile/)
      await user.click(compileButton)

      await waitFor(() => {
        expect(api.api.compileLatex).toHaveBeenCalledWith({
          content,
          filePath: 'paper.tex',
          engine: 'pdflatex'
        })
      })
    })

    it('should show "Compiling..." when compilation is in progress', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.compileLatex).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(
        <MonacoCodeEditor
          content="\\documentclass{article}"
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      const compileButton = screen.getByText(/Compile/)
      await user.click(compileButton)

      expect(screen.getByText(/Compiling\.\.\./)).toBeInTheDocument()
    })

    it('should show Hide/Show Preview button after successful compilation', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.compileLatex).mockResolvedValue({
        success: true,
        pdfPath: '/tmp/output.pdf',
        errors: [],
        warnings: []
      })

      render(
        <MonacoCodeEditor
          content="\\documentclass{article}"
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      const compileButton = screen.getByText(/Compile/)
      await user.click(compileButton)

      await waitFor(() => {
        expect(screen.getByText(/Hide Preview/)).toBeInTheDocument()
      })
    })
  })

  describe('R Features', () => {
    it('should show Run Code button for .R files', () => {
      render(
        <MonacoCodeEditor
          content="x <- 1"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      expect(screen.getByText(/Run Code/)).toBeInTheDocument()
    })

    it('should NOT show Run Code button for non-R files', () => {
      render(
        <MonacoCodeEditor
          content="\\documentclass{article}"
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      expect(screen.queryByText(/Run Code/)).not.toBeInTheDocument()
    })

    it('should call executeRChunk when Run Code button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.executeRChunk).mockResolvedValue({
        success: true,
        stdout: 'Output',
        stderr: '',
        plots: [],
        error: undefined
      })

      const content = `x <- 1\nprint(x)`

      render(
        <MonacoCodeEditor
          content={content}
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      const runButton = screen.getByText(/Run Code/)
      await user.click(runButton)

      await waitFor(() => {
        expect(api.api.executeRChunk).toHaveBeenCalledWith({
          code: content,
          capturePlots: true
        })
      })
    })

    it('should show "Running..." when R execution is in progress', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.executeRChunk).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(
        <MonacoCodeEditor
          content="x <- 1"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      const runButton = screen.getByText(/Run Code/)
      await user.click(runButton)

      expect(screen.getByText(/Running\.\.\./)).toBeInTheDocument()
    })

    it('should show Clear Output button after execution', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.executeRChunk).mockResolvedValue({
        success: true,
        stdout: 'Output',
        stderr: '',
        plots: [],
        error: undefined
      })

      render(
        <MonacoCodeEditor
          content="x <- 1"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      const runButton = screen.getByText(/Run Code/)
      await user.click(runButton)

      await waitFor(() => {
        expect(screen.getByText(/Clear Output/)).toBeInTheDocument()
      })
    })

    it('should display R output after execution', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.executeRChunk).mockResolvedValue({
        success: true,
        stdout: '[1] 42',
        stderr: '',
        plots: [],
        error: undefined
      })

      render(
        <MonacoCodeEditor
          content="x <- 42\nprint(x)"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      const runButton = screen.getByText(/Run Code/)
      await user.click(runButton)

      await waitFor(() => {
        expect(screen.getByText(/\[1\] 42/)).toBeInTheDocument()
      })
    })

    it('should clear output when Clear Output is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.executeRChunk).mockResolvedValue({
        success: true,
        stdout: 'R Output Text',
        stderr: '',
        plots: [],
        error: undefined
      })

      render(
        <MonacoCodeEditor
          content="x <- 1"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      // Execute R code
      const runButton = screen.getByText(/Run Code/)
      await user.click(runButton)

      // Wait for output to appear
      await waitFor(() => {
        expect(screen.getByText(/R Output Text/)).toBeInTheDocument()
      })

      // Clear output
      const clearButton = screen.getByText(/Clear Output/)
      await user.click(clearButton)

      // Output should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/R Output Text/)).not.toBeInTheDocument()
      })
    })
  })

  describe('State Management', () => {
    it('should save Monaco instance to store on mount', async () => {
      render(
        <MonacoCodeEditor
          content="content"
          onChange={mockOnChange}
          filePath="test.tex"
        />
      )

      await waitFor(() => {
        const state = useEditorStore.getState()
        expect(state.monaco.instance).toBeTruthy()
      })
    })

    it('should update content in onChange callback', async () => {
      const user = userEvent.setup()

      render(
        <MonacoCodeEditor
          content="original"
          onChange={mockOnChange}
          filePath="test.tex"
        />
      )

      const textarea = screen.getByTestId('monaco-textarea')
      await user.clear(textarea)
      await user.type(textarea, 'new')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null filePath gracefully', () => {
      render(
        <MonacoCodeEditor
          content="content"
          onChange={mockOnChange}
          filePath={null}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('should handle empty content', () => {
      render(
        <MonacoCodeEditor
          content=""
          onChange={mockOnChange}
          filePath="test.tex"
        />
      )

      const textarea = screen.getByTestId('monaco-textarea')
      expect(textarea).toHaveValue('')
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000)

      render(
        <MonacoCodeEditor
          content={longContent}
          onChange={mockOnChange}
          filePath="test.tex"
        />
      )

      const textarea = screen.getByTestId('monaco-textarea')
      expect(textarea).toHaveValue(longContent)
    })

    it('should handle compilation errors gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.compileLatex).mockResolvedValue({
        success: false,
        pdfPath: null,
        errors: [
          { line: 10, message: 'Undefined control sequence' }
        ],
        warnings: []
      })

      render(
        <MonacoCodeEditor
          content="\\invalid"
          onChange={mockOnChange}
          filePath="paper.tex"
        />
      )

      const compileButton = screen.getByText(/Compile/)
      await user.click(compileButton)

      await waitFor(() => {
        expect(screen.getByText(/Errors:/)).toBeInTheDocument()
        expect(screen.getByText(/Undefined control sequence/)).toBeInTheDocument()
      })
    })

    it('should handle R execution errors gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(api.api.executeRChunk).mockResolvedValue({
        success: false,
        stdout: '',
        stderr: '',
        plots: [],
        error: 'Error in eval: object not found'
      })

      render(
        <MonacoCodeEditor
          content="unknown_var"
          onChange={mockOnChange}
          filePath="script.R"
        />
      )

      const runButton = screen.getByText(/Run Code/)
      await user.click(runButton)

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
        expect(screen.getByText(/object not found/)).toBeInTheDocument()
      })
    })
  })
})
