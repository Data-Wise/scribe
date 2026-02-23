import { HybridEditor } from './HybridEditor'
import { EmptyState } from './EmptyState'
import { updatePreferences, EditorMode, UserPreferences } from '../lib/preferences'
import type { Note, Tag } from '../types'

interface EditorOrchestratorProps {
  // Note data
  selectedNote: Note | undefined
  notes: Note[]
  
  // Editor state
  editorMode: EditorMode
  onEditorModeChange: (mode: EditorMode) => void
  editingTitle: boolean
  onEditingTitleChange: (editing: boolean) => void
  
  // Handlers
  onContentChange: (content: string) => void
  onTitleChange: (title: string) => void
  onLinkClick: (title: string) => void
  onTagClick: (tagName: string) => void
  onSearchNotes: (query: string) => Promise<Note[]>
  onSearchTags: (query: string) => Promise<Tag[]>
  
  // Session tracking
  wordCount: number
  sessionStartWords: Record<string, number>
  streakInfo: { streak: number; isActiveToday: boolean }
  sessionStartTime: number | null
  preferences: UserPreferences
  
  // Terminal toggle
  onToggleTerminal: () => void
  
  // Focus mode
  focusMode: boolean
  onFocusModeChange: (enabled: boolean) => void
  
  // Empty state handlers
  onCreateNote: () => void
  onOpenDaily: () => void
  onOpenCommandPalette: () => void
  
  // Ref for auto-collapse
  editorContainerRef?: React.RefObject<HTMLDivElement>

  // Pomodoro
  pomodoroEnabled?: boolean
  onPomodoroComplete?: () => void
  onBreakComplete?: () => void
}

/**
 * EditorOrchestrator
 * 
 * Manages all editor rendering logic for both focus mode and normal mode.
 * Handles:
 * - HybridEditor rendering with appropriate props
 * - Title editing (inline input)
 * - Empty state when no note is selected
 * - Focus mode vs normal mode layouts
 * - Editor mode changes (source/live-preview/reading)
 * 
 * This component is responsible for the editor area only - it does not
 * handle sidebars, modals, or other UI chrome.
 */
export function EditorOrchestrator({
  selectedNote,
  notes: _notes,
  editorMode,
  onEditorModeChange,
  editingTitle,
  onEditingTitleChange,
  onContentChange,
  onTitleChange,
  onLinkClick,
  onTagClick,
  onSearchNotes,
  onSearchTags,
  wordCount,
  sessionStartWords,
  streakInfo,
  sessionStartTime,
  preferences,
  onToggleTerminal,
  focusMode,
  onFocusModeChange: _onFocusModeChange,
  onCreateNote,
  onOpenDaily,
  onOpenCommandPalette,
  editorContainerRef,
  pomodoroEnabled,
  onPomodoroComplete,
  onBreakComplete,
}: EditorOrchestratorProps) {
  // Unused but kept for future extension
  void _notes
  void _onFocusModeChange
  
  // Focus mode: Full-screen editor with minimal chrome
  if (focusMode) {
    return (
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {selectedNote ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-6">
              <h2 className="text-3xl font-bold">{selectedNote.title}</h2>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <HybridEditor
                key={selectedNote.id}
                content={selectedNote.content}
                onChange={onContentChange}
                onWikiLinkClick={onLinkClick}
                onTagClick={onTagClick}
                onSearchNotes={onSearchNotes}
                onSearchTags={onSearchTags}
                placeholder="Start writing..."
                editorMode={editorMode}
                onEditorModeChange={(mode) => {
                  onEditorModeChange(mode)
                  updatePreferences({ editorMode: mode })
                }}
                focusMode={true}
                wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : preferences.defaultWordGoal}
                sessionStartWords={sessionStartWords[selectedNote.id] || wordCount}
                streak={streakInfo.streak}
                sessionStartTime={sessionStartTime || undefined}
                onToggleTerminal={onToggleTerminal}
                pomodoroEnabled={pomodoroEnabled}
                onPomodoroComplete={onPomodoroComplete}
                onBreakComplete={onBreakComplete}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            onCreateNote={onCreateNote}
            onOpenDaily={onOpenDaily}
            onOpenCommandPalette={onOpenCommandPalette}
          />
        )}
      </div>
    )
  }
  
  // Normal mode: Editor with title editing
  if (selectedNote) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-6 py-4 border-b border-white/5">
          {editingTitle ? (
            <input
              autoFocus
              className="text-2xl font-bold bg-transparent outline-none w-full border-b border-nexus-accent"
              defaultValue={selectedNote.title}
              onBlur={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onTitleChange(e.currentTarget.value)}
            />
          ) : (
            <h2 onClick={() => onEditingTitleChange(true)} className="text-2xl font-bold cursor-pointer">{selectedNote.title}</h2>
          )}
        </div>
        <div ref={editorContainerRef} className="flex-1 overflow-hidden relative">
          <HybridEditor
            key={selectedNote.id}
            content={selectedNote.content}
            onChange={onContentChange}
            onWikiLinkClick={onLinkClick}
            onTagClick={onTagClick}
            onSearchNotes={onSearchNotes}
            onSearchTags={onSearchTags}
            placeholder="Start writing... (Cmd+E to preview)"
            editorMode={editorMode}
            onEditorModeChange={(mode) => {
              onEditorModeChange(mode)
              updatePreferences({ editorMode: mode })
            }}
            focusMode={false}
            wordGoal={selectedNote.properties?.word_goal ? Number(selectedNote.properties.word_goal.value) : preferences.defaultWordGoal}
            sessionStartWords={sessionStartWords[selectedNote.id] || wordCount}
            streak={streakInfo.streak}
            sessionStartTime={sessionStartTime || undefined}
            onToggleTerminal={onToggleTerminal}
            pomodoroEnabled={pomodoroEnabled}
            onPomodoroComplete={onPomodoroComplete}
            onBreakComplete={onBreakComplete}
          />
        </div>
      </div>
    )
  }

  // No note selected: return null (parent will render MissionControl)
  return null
}
