import { FileText } from 'lucide-react'
import { Note } from '../../../types'

/**
 * NoteTreeNode - Leaf node in the v1.17.0 Explorer tree. Renders one note
 * under its parent ProjectTreeNode.
 */

interface NoteTreeNodeProps {
  note: Note
  onSelectNote: (noteId: string) => void
}

export function NoteTreeNode({ note, onSelectNote }: NoteTreeNodeProps) {
  return (
    <button
      className="explorer-note-node"
      onClick={() => onSelectNote(note.id)}
      title={note.title || 'Untitled'}
    >
      <FileText size={13} className="explorer-note-icon" />
      <span className="explorer-note-title">{note.title || 'Untitled'}</span>
    </button>
  )
}
