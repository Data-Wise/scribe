import React from 'react'
import { Command } from 'cmdk'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Title as DialogTitle, Description as DialogDescription } from '@radix-ui/react-dialog'
import {
  FileText,
  Plus,
  Calendar,
  Zap,
  Share,
  Sparkles,
  Brain,
  Clock,
  Folder,
  Download,
  Network
} from 'lucide-react'

// Format relative time (e.g., "2m ago", "1h ago", "Yesterday")
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  created_at: number;
  updated_at: number;
}

interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
  notes: Note[]
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDailyNote: () => void
  onToggleFocus: () => void
  onObsidianSync: () => void
  onRunClaude: () => void
  onRunGemini: () => void
  onExport?: () => void
  onOpenGraph?: () => void
  hasSelectedNote?: boolean
}

export function CommandPalette({
  open,
  setOpen,
  notes,
  onSelectNote,
  onCreateNote,
  onDailyNote,
  onToggleFocus,
  onObsidianSync,
  onRunClaude,
  onRunGemini,
  onExport,
  onOpenGraph,
  hasSelectedNote = false
}: CommandPaletteProps) {

  // Track filtered/visible items for number shortcuts
  const [filteredItems, setFilteredItems] = React.useState<{ id: string; action: () => void }[]>([])

  // Build item list for number shortcuts
  React.useEffect(() => {
    if (open) {
      const items: { id: string; action: () => void }[] = [
        { id: 'create', action: () => { onCreateNote(); setOpen(false) } },
        { id: 'daily', action: () => { onDailyNote(); setOpen(false) } },
        { id: 'sync', action: () => { onObsidianSync(); setOpen(false) } },
        { id: 'claude', action: () => { onRunClaude(); setOpen(false) } },
        { id: 'gemini', action: () => { onRunGemini(); setOpen(false) } },
        { id: 'focus', action: () => { onToggleFocus(); setOpen(false) } },
        ...(onOpenGraph ? [{ id: 'graph', action: () => { onOpenGraph(); setOpen(false) } }] : []),
        ...notes.slice(0, 3).map(note => ({
          id: note.id,
          action: () => { onSelectNote(note.id); setOpen(false) }
        }))
      ]
      setFilteredItems(items)
    }
  }, [open, notes, onCreateNote, onDailyNote, onObsidianSync, onRunClaude, onRunGemini, onToggleFocus, onOpenGraph, onSelectNote, setOpen])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle palette with Cmd+K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
        return
      }

      // Number shortcuts (1-9) when palette is open
      if (open && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9 && filteredItems[num - 1]) {
          e.preventDefault()
          filteredItems[num - 1].action()
        }
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen, filteredItems])

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen} 
      label="Global Command Menu"
      className="command-palette-overlay"
    >
      {/* Accessible title and description for screen readers */}
      <VisuallyHidden asChild>
        <DialogTitle>Command Palette</DialogTitle>
      </VisuallyHidden>
      <VisuallyHidden asChild>
        <DialogDescription>Search and execute quick actions</DialogDescription>
      </VisuallyHidden>
      
      <div className="command-palette-content glass-effect" role="dialog" aria-label="Command palette">
        <div className="command-palette-header">
          <Command.Input placeholder="Search everything..." className="command-palette-input" aria-label="Search commands and notes" />
        </div>
        
        <Command.List className="command-palette-list">
          <Command.Empty className="command-palette-empty">No results found.</Command.Empty>
          
          <Command.Group heading="Main Actions" className="command-palette-group">
            <Command.Item
              onSelect={() => { onCreateNote(); setOpen(false); }}
              className="command-palette-item"
            >
              <kbd className="command-palette-number">1</kbd>
              <Plus className="mr-3 h-4 w-4 text-green-400" />
              <span>Create New Note</span>
              <kbd className="command-palette-shortcut">⌘N</kbd>
            </Command.Item>
            <Command.Item
              onSelect={() => { onDailyNote(); setOpen(false); }}
              className="command-palette-item"
            >
              <kbd className="command-palette-number">2</kbd>
              <Calendar className="mr-3 h-4 w-4 text-blue-400" />
              <span>Open Today's Daily Note</span>
              <kbd className="command-palette-shortcut">⌘D</kbd>
            </Command.Item>
            <Command.Item
              onSelect={() => { onObsidianSync(); setOpen(false); }}
              className="command-palette-item"
            >
              <kbd className="command-palette-number">3</kbd>
              <Share className="mr-3 h-4 w-4 text-purple-400" />
              <span>Sync to Obsidian Vault</span>
            </Command.Item>
            <Command.Item
              onSelect={() => { onRunClaude(); setOpen(false); }}
              className="command-palette-item"
            >
              <kbd className="command-palette-number">4</kbd>
              <Sparkles className="mr-3 h-4 w-4 text-orange-400" />
              <span>Ask Claude (Refactor Notes)</span>
            </Command.Item>
            <Command.Item
              onSelect={() => { onRunGemini(); setOpen(false); }}
              className="command-palette-item"
            >
              <kbd className="command-palette-number">5</kbd>
              <Brain className="mr-3 h-4 w-4 text-blue-400" />
              <span>Ask Gemini (Brainstorming)</span>
            </Command.Item>
            <Command.Item
              onSelect={() => { onToggleFocus(); setOpen(false); }}
              className="command-palette-item"
            >
              <kbd className="command-palette-number">6</kbd>
              <Zap className="mr-3 h-4 w-4 text-yellow-400" />
              <span>Toggle Focus Mode</span>
              <kbd className="command-palette-shortcut">⌘⇧F</kbd>
            </Command.Item>
            {onOpenGraph && (
              <Command.Item
                onSelect={() => { onOpenGraph(); setOpen(false); }}
                className="command-palette-item"
              >
                <kbd className="command-palette-number">7</kbd>
                <Network className="mr-3 h-4 w-4 text-cyan-400" />
                <span>Open Knowledge Graph</span>
                <kbd className="command-palette-shortcut">⌘⇧G</kbd>
              </Command.Item>
            )}
            {hasSelectedNote && onExport && (
              <Command.Item
                onSelect={() => { onExport(); setOpen(false); }}
                className="command-palette-item"
              >
                <kbd className="command-palette-number">8</kbd>
                <Download className="mr-3 h-4 w-4 text-emerald-400" />
                <span>Export Note (PDF/Word/LaTeX)</span>
                <kbd className="command-palette-shortcut">⌘⇧E</kbd>
              </Command.Item>
            )}
          </Command.Group>

          {notes.length > 0 && (
            <Command.Group heading="Recent Notes" className="command-palette-group">
              {notes
                .sort((a, b) => b.updated_at - a.updated_at)
                .slice(0, 10)
                .map((note) => (
                <Command.Item
                  key={note.id}
                  onSelect={() => { onSelectNote(note.id); setOpen(false); }}
                  className="command-palette-item"
                >
                  <FileText className="mr-3 h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="truncate">{note.title || 'Untitled Note'}</span>
                    {note.folder && note.folder !== 'inbox' && (
                      <span className="flex items-center gap-1 text-[10px] text-nexus-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                        <Folder className="w-2.5 h-2.5" />
                        {note.folder}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-nexus-text-muted ml-2 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(note.updated_at)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  )
}
