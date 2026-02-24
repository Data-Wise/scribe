import { useState, useEffect } from 'react'
import { SHORTCUTS } from '../lib/shortcuts'
import { Project, Note } from '../types'
import { DashboardHeader } from './DashboardHeader'
import { ProjectsPanel } from './ProjectsPanel'
import { DashboardFooter } from './DashboardFooter'
import { useDragRegion } from './DragRegion'

interface DashboardShellProps {
  // Data
  projects: Project[]
  notes: Note[]
  currentProjectId: string | null

  // Project actions
  onSelectProject: (projectId: string) => void
  onCreateProject: () => void

  // Note actions
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
  onDailyNote: () => void
  onQuickCapture: () => void

  // UI actions
  onSearch: () => void
  onSettings: () => void
  onFocusMode: () => void

  // State
  isCollapsed: boolean
  onToggleCollapse: () => void

  // Editor content (children)
  children: React.ReactNode
}

export function DashboardShell({
  projects,
  notes,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onSelectNote,
  onCreateNote,
  onDailyNote,
  onQuickCapture,
  onSearch,
  onSettings,
  onFocusMode,
  isCollapsed,
  onToggleCollapse,
  children,
}: DashboardShellProps) {
  const dragRegion = useDragRegion()
  const [projectsPanelWidth, setProjectsPanelWidth] = useState(180)
  const [isResizing, setIsResizing] = useState(false)

  // Calculate stats
  const totalNotes = notes.filter(n => !n.deleted_at).length
  const totalWords = notes
    .filter(n => !n.deleted_at)
    .reduce((sum, n) => sum + countWords(n.content), 0)

  // Get current project
  const currentProject = projects.find(p => p.id === currentProjectId)

  // Get recent notes (last 5)
  const recentNotes = [...notes]
    .filter(n => !n.deleted_at)
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(0, 5)

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = Math.max(140, Math.min(300, e.clientX))
      setProjectsPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Collapsed mode - minimal header only
  if (isCollapsed) {
    return (
      <div className="dashboard-shell collapsed flex flex-col h-full bg-nexus-bg-primary">
        {/* Collapsed Header */}
        <header
          className="dashboard-header-collapsed flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-nexus-bg-secondary"
          {...dragRegion}
        >
          {/* Project indicator */}
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
            title={`Expand Dashboard (${SHORTCUTS.dashboard.label})`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentProject?.color || '#38bdf8' }}
            />
            <span className="text-sm font-medium text-nexus-text-primary">
              {currentProject?.name || 'All Notes'}
            </span>
            <svg className="w-3 h-3 text-nexus-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onDailyNote}
              className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
              title={`Daily Note (${SHORTCUTS.dailyNote.label})`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={onCreateNote}
              className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
              title={`New Note (${SHORTCUTS.newNote.label})`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={onQuickCapture}
              className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
              title={`Quick Capture (${SHORTCUTS.quickCapture.label})`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Expand button */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            title={`Expand Dashboard (${SHORTCUTS.dashboard.label})`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button
            onClick={onFocusMode}
            className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            title={`Focus Mode (${SHORTCUTS.focusMode.label})`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={onSettings}
            className="p-1.5 rounded hover:bg-white/5 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            title={`Settings (${SHORTCUTS.settings.label})`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* Editor content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Collapsed Footer */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-white/5 bg-nexus-bg-secondary text-xs text-nexus-text-muted">
          <span>{totalNotes} pages</span>
          <span>{totalWords.toLocaleString()} words</span>
        </footer>
      </div>
    )
  }

  // Expanded mode - full dashboard shell
  return (
    <div className="dashboard-shell expanded flex flex-col h-full bg-nexus-bg-primary">
      {/* Header */}
      <DashboardHeader
        totalNotes={totalNotes}
        totalWords={totalWords}
        projectCount={projects.length}
        onDailyNote={onDailyNote}
        onCreateNote={onCreateNote}
        onQuickCapture={onQuickCapture}
        onSearch={onSearch}
        onSettings={onSettings}
        onFocusMode={onFocusMode}
        onCollapse={onToggleCollapse}
        dragRegion={dragRegion}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Projects Panel */}
        <ProjectsPanel
          projects={projects}
          notes={notes}
          currentProjectId={currentProjectId}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
          width={projectsPanelWidth}
          onStartResize={() => setIsResizing(true)}
        />

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-nexus-bg-primary">
          {children}
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter
        recentNotes={recentNotes}
        projects={projects}
        onSelectNote={onSelectNote}
      />
    </div>
  )
}

// Helper to count words
function countWords(content: string): number {
  if (!content) return 0
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.split(/\s+/).filter(Boolean).length
}
