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
  Brain
} from 'lucide-react'


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
  onRunGemini
}: CommandPaletteProps) {

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

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
              <Plus className="mr-3 h-4 w-4 text-green-400" />
              <span>Create New Note</span>
              <kbd className="command-palette-shortcut">⌘N</kbd>
            </Command.Item>
            <Command.Item 
              onSelect={() => { onDailyNote(); setOpen(false); }}
              className="command-palette-item"
            >
              <Calendar className="mr-3 h-4 w-4 text-blue-400" />
              <span>Open Today's Daily Note</span>
              <kbd className="command-palette-shortcut">⌘D</kbd>
            </Command.Item>
            <Command.Item 
              onSelect={() => { onObsidianSync(); setOpen(false); }}
              className="command-palette-item"
            >
              <Share className="mr-3 h-4 w-4 text-purple-400" />
              <span>Sync to Obsidian Vault</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => { onRunClaude(); setOpen(false); }}
              className="command-palette-item"
            >
              <Sparkles className="mr-3 h-4 w-4 text-orange-400" />
              <span>Ask Claude (Refactor Notes)</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => { onRunGemini(); setOpen(false); }}
              className="command-palette-item"
            >
              <Brain className="mr-3 h-4 w-4 text-blue-400" />
              <span>Ask Gemini (Brainstorming)</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => { onToggleFocus(); setOpen(false); }}
              className="command-palette-item"
            >

              <Zap className="mr-3 h-4 w-4 text-yellow-400" />
              <span>Toggle Focus Mode</span>
              <kbd className="command-palette-shortcut">⌘⇧F</kbd>
            </Command.Item>
          </Command.Group>

          {notes.length > 0 && (
            <Command.Group heading="Recent Notes" className="command-palette-group">
              {notes.slice(0, 10).map((note) => (
                <Command.Item 
                  key={note.id} 
                  onSelect={() => { onSelectNote(note.id); setOpen(false); }}
                  className="command-palette-item"
                >
                  <FileText className="mr-3 h-4 w-4 text-slate-400" />
                  <span>{note.title || 'Untitled Note'}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  )
}
