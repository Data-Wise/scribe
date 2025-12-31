import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorRouter } from '../components/EditorRouter'

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
})
