import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorRouter } from '../components/EditorRouter'
import { useEditorStore } from '../store/editorStore'

// Mock the editor components
vi.mock('../components/MilkdownEditor', () => ({
  MilkdownEditor: ({ filePath }: { filePath: string | null }) => (
    <div data-testid="milkdown-editor">Milkdown Editor: {filePath}</div>
  )
}))

vi.mock('../components/MonacoCodeEditor', () => ({
  MonacoCodeEditor: ({ filePath }: { filePath: string | null }) => (
    <div data-testid="monaco-editor">Monaco Editor: {filePath}</div>
  )
}))

describe('EditorRouter', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    // Reset store before each test
    useEditorStore.getState().reset()
    mockOnChange.mockClear()
  })

  describe('Markdown routing (.md, .qmd)', () => {
    it('should route .md files to Milkdown', () => {
      render(
        <EditorRouter
          filePath="note.md"
          content="# Hello"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()
      expect(screen.getByText(/Milkdown Editor: note\.md/)).toBeInTheDocument()
    })

    it('should route .qmd files to Milkdown', () => {
      render(
        <EditorRouter
          filePath="analysis.qmd"
          content="# Analysis"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()
      expect(screen.getByText(/Milkdown Editor: analysis\.qmd/)).toBeInTheDocument()
    })

    it('should handle markdown files with complex paths', () => {
      render(
        <EditorRouter
          filePath="/path/to/my/note.md"
          content="# Note"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()
    })
  })

  describe('Code file routing (.tex, .R, .py)', () => {
    it('should route .tex files to Monaco', () => {
      render(
        <EditorRouter
          filePath="paper.tex"
          content="\\documentclass{article}"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByText(/Monaco Editor: paper\.tex/)).toBeInTheDocument()
    })

    it('should route .R files to Monaco', () => {
      render(
        <EditorRouter
          filePath="script.R"
          content="x <- 1"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByText(/Monaco Editor: script\.R/)).toBeInTheDocument()
    })

    it('should route .py files to Monaco', () => {
      render(
        <EditorRouter
          filePath="main.py"
          content="print('hello')"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByText(/Monaco Editor: main\.py/)).toBeInTheDocument()
    })
  })

  describe('Fallback routing', () => {
    it('should use plain text editor for unknown extensions', () => {
      render(
        <EditorRouter
          filePath="data.csv"
          content="a,b,c"
          onChange={mockOnChange}
        />
      )

      // PlainTextEditor should render
      const textarea = screen.getByPlaceholderText('Start typing...')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveValue('a,b,c')
    })

    it('should use plain text editor for null filePath', () => {
      render(
        <EditorRouter
          filePath={null}
          content="Some content"
          onChange={mockOnChange}
        />
      )

      const textarea = screen.getByPlaceholderText('Start typing...')
      expect(textarea).toBeInTheDocument()
    })

    it('should use plain text editor for files without extension', () => {
      render(
        <EditorRouter
          filePath="README"
          content="# README"
          onChange={mockOnChange}
        />
      )

      const textarea = screen.getByPlaceholderText('Start typing...')
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle mixed case extensions', () => {
      render(
        <EditorRouter
          filePath="NOTE.MD"
          content="# Note"
          onChange={mockOnChange}
        />
      )

      // Should still route to Milkdown (case-insensitive)
      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()
    })

    it('should handle files with multiple dots', () => {
      render(
        <EditorRouter
          filePath="my.report.final.tex"
          content="\\begin{document}"
          onChange={mockOnChange}
        />
      )

      // Should route based on final extension (.tex)
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('should handle empty content', () => {
      render(
        <EditorRouter
          filePath="note.md"
          content=""
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000)

      render(
        <EditorRouter
          filePath="note.md"
          content={longContent}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()
    })
  })

  describe('State synchronization', () => {
    it('should update editorStore when file changes', () => {
      const { rerender } = render(
        <EditorRouter
          filePath="note1.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Change to different file
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Should still render Milkdown with new file
      expect(screen.getByText(/Milkdown Editor: note2\.md/)).toBeInTheDocument()
    })

    it('should switch editors when file type changes', () => {
      const { rerender } = render(
        <EditorRouter
          filePath="note.md"
          content="# Markdown"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('milkdown-editor')).toBeInTheDocument()

      // Change to LaTeX file
      rerender(
        <EditorRouter
          filePath="paper.tex"
          content="\\documentclass{article}"
          onChange={mockOnChange}
        />
      )

      // Should now render Monaco
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('milkdown-editor')).not.toBeInTheDocument()
    })
  })

  describe('Unsaved changes dialog', () => {
    it('should NOT show dialog when switching files without unsaved changes', () => {
      const { rerender } = render(
        <EditorRouter
          filePath="note1.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Switch to different file without making changes
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Dialog should not appear
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      expect(screen.getByText(/Milkdown Editor: note2\.md/)).toBeInTheDocument()
    })

    it('should show dialog when switching files with unsaved changes', async () => {
      const { rerender } = render(
        <EditorRouter
          filePath="note1.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Mark file as dirty
      useEditorStore.getState().setDirty(true)

      // Try to switch to different file
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        expect(screen.getByText(/Do you want to save changes to/)).toBeInTheDocument()
      })
    })

    it('should switch files when "Don\'t Save" is clicked', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <EditorRouter
          filePath="note1.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Mark file as dirty
      useEditorStore.getState().setDirty(true)

      // Try to switch to different file
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
      })

      // Click "Don't Save"
      const discardButton = screen.getByText("Don't Save")
      await user.click(discardButton)

      // Should switch to new file
      await waitFor(() => {
        expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      })

      // File should be marked as clean
      expect(useEditorStore.getState().currentFile.isDirty).toBe(false)
    })

    it('should switch files when "Save" is clicked', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <EditorRouter
          filePath="note1.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Mark file as dirty
      useEditorStore.getState().setDirty(true)

      // Try to switch to different file
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
      })

      // Click "Save"
      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      // Should switch to new file
      await waitFor(() => {
        expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      })

      // File should be marked as clean
      expect(useEditorStore.getState().currentFile.isDirty).toBe(false)
    })

    it('should stay on current file when "Cancel" is clicked', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <EditorRouter
          filePath="note1.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Mark file as dirty
      useEditorStore.getState().setDirty(true)

      // Try to switch to different file
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
      })

      // Click "Cancel"
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      })

      // Should still show original file (note1.md)
      // Store state should still be dirty
      expect(useEditorStore.getState().currentFile.isDirty).toBe(true)
    })

    it('should display correct filename in dialog', async () => {
      const { rerender } = render(
        <EditorRouter
          filePath="/path/to/my-note.md"
          content="Content 1"
          onChange={mockOnChange}
        />
      )

      // Mark file as dirty
      useEditorStore.getState().setDirty(true)

      // Try to switch to different file
      rerender(
        <EditorRouter
          filePath="note2.md"
          content="Content 2"
          onChange={mockOnChange}
        />
      )

      // Dialog should show just the filename, not full path
      await waitFor(() => {
        expect(screen.getByText(/my-note\.md/)).toBeInTheDocument()
      })
    })
  })
})
