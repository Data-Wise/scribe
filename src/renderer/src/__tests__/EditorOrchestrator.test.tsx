import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorOrchestrator } from '../components/EditorOrchestrator'
import type { Note, EditorMode } from '../types'

// Mock the HybridEditor component
vi.mock('../components/HybridEditor', () => ({
  HybridEditor: ({ placeholder, focusMode }: { placeholder: string; focusMode: boolean }) => (
    <div data-testid="hybrid-editor" data-focus-mode={focusMode}>
      {placeholder}
    </div>
  ),
}))

// Mock the EmptyState component
vi.mock('../components/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state">Empty State</div>,
}))

describe('EditorOrchestrator', () => {
  const mockNote: Note = {
    id: 'note-1',
    title: 'Test Note',
    content: 'Test content',
    folder: 'inbox',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    properties: {},
  }

  const mockProps = {
    selectedNote: mockNote,
    notes: [mockNote],
    editorMode: 'source' as EditorMode,
    onEditorModeChange: vi.fn(),
    editingTitle: false,
    onEditingTitleChange: vi.fn(),
    onContentChange: vi.fn(),
    onTitleChange: vi.fn(),
    onLinkClick: vi.fn(),
    onTagClick: vi.fn(),
    onSearchNotes: vi.fn().mockResolvedValue([]),
    onSearchTags: vi.fn().mockResolvedValue([]),
    wordCount: 100,
    sessionStartWords: {},
    streakInfo: { streak: 5, isActiveToday: true },
    sessionStartTime: Date.now(),
    preferences: {
      defaultWordGoal: 500,
      focusModeEnabled: false,
      editorMode: 'source' as EditorMode,
      sidebarTabSize: 'compact' as const,
      sidebarTabOrder: [],
      sidebarHiddenTabs: [],
      customCSSEnabled: false,
      customCSS: '',
    },
    onToggleTerminal: vi.fn(),
    focusMode: false,
    onFocusModeChange: vi.fn(),
    onCreateNote: vi.fn(),
    onOpenDaily: vi.fn(),
    onOpenCommandPalette: vi.fn(),
  }

  it('renders editor in normal mode when note is selected', () => {
    render(<EditorOrchestrator {...mockProps} />)
    
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByTestId('hybrid-editor')).toBeInTheDocument()
    expect(screen.getByTestId('hybrid-editor')).toHaveAttribute('data-focus-mode', 'false')
  })

  it('renders editor in focus mode when focusMode is true', () => {
    render(<EditorOrchestrator {...mockProps} focusMode={true} />)
    
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByTestId('hybrid-editor')).toBeInTheDocument()
    expect(screen.getByTestId('hybrid-editor')).toHaveAttribute('data-focus-mode', 'true')
  })

  it('renders empty state when no note is selected in focus mode', () => {
    render(<EditorOrchestrator {...mockProps} selectedNote={undefined} focusMode={true} />)
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('hybrid-editor')).not.toBeInTheDocument()
  })

  it('returns null when no note is selected in normal mode', () => {
    const { container } = render(<EditorOrchestrator {...mockProps} selectedNote={undefined} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('renders title input when editingTitle is true', () => {
    render(<EditorOrchestrator {...mockProps} editingTitle={true} />)
    
    const input = screen.getByDisplayValue('Test Note')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('renders clickable title when editingTitle is false', () => {
    render(<EditorOrchestrator {...mockProps} editingTitle={false} />)
    
    const title = screen.getByText('Test Note')
    expect(title).toBeInTheDocument()
    expect(title.tagName).toBe('H2')
  })
})
