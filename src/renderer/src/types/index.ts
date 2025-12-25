export interface Note {
  id: string
  title: string
  content: string
  folder: string
  created_at: number
  updated_at: number
  deleted_at: number | null
}

export interface Folder {
  path: string
  color: string | null
  icon: string | null
  sort_order: number
}

export interface Tag {
  id: string
  name: string
  color: string | null
  created_at: number
}

export interface TagWithCount extends Tag {
  note_count: number
}

// Extend Window interface to include our custom API
declare global {
  interface Window {
    api: {
      // Note operations
      createNote: (note: Partial<Note>) => Promise<Note>
      updateNote: (id: string, updates: Partial<Note>) => Promise<Note | null>
      deleteNote: (id: string) => Promise<boolean>
      getNote: (id: string) => Promise<Note | null>
      listNotes: (folder?: string) => Promise<Note[]>
      searchNotes: (query: string) => Promise<Note[]>

      // Tag CRUD
      createTag: (name: string, color?: string) => Promise<Tag>
      getTag: (id: string) => Promise<Tag | null>
      getTagByName: (name: string) => Promise<Tag | null>
      getAllTags: () => Promise<TagWithCount[]>
      renameTag: (id: string, newName: string) => Promise<boolean>
      deleteTag: (id: string) => Promise<boolean>

      // Note-Tag relationships
      addTagToNote: (noteId: string, tagName: string) => Promise<void>
      removeTagFromNote: (noteId: string, tagId: string) => Promise<void>
      getNoteTags: (noteId: string) => Promise<Tag[]>
      getNotesByTag: (tagId: string) => Promise<Note[]>
      filterNotesByTags: (tagIds: string[], matchAll: boolean) => Promise<Note[]>
      updateNoteTags: (noteId: string, content: string) => Promise<void>

      // Folder operations
      getFolders: () => Promise<Folder[]>

      // Link operations
      updateNoteLinks: (noteId: string, content: string) => Promise<void>
      getBacklinks: (noteId: string) => Promise<Note[]>
      getOutgoingLinks: (noteId: string) => Promise<Note[]>
    }
  }
}

export {}
