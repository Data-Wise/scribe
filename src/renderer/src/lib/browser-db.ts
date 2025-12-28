/**
 * Browser IndexedDB Database
 *
 * Full-featured IndexedDB persistence layer using Dexie.js
 * Provides the same data model as the Tauri SQLite backend.
 */

import Dexie, { type Table } from 'dexie'
import type { Note, Tag, Folder, Project, ProjectSettings } from '../types'

// Extended Note type for IndexedDB (includes searchable text)
interface NoteRecord extends Omit<Note, 'properties'> {
  properties: string // JSON serialized
  search_text: string // Lowercase title + content for FTS
}

// Note-Tag junction table
interface NoteTag {
  note_id: string
  tag_id: string
}

// Note links table
interface NoteLink {
  source_id: string
  target_id: string
}

// Project settings stored separately
interface ProjectSettingsRecord {
  project_id: string
  settings: string // JSON serialized
}

/**
 * Scribe Browser Database
 */
class ScribeBrowserDB extends Dexie {
  notes!: Table<NoteRecord>
  tags!: Table<Tag>
  noteTags!: Table<NoteTag>
  noteLinks!: Table<NoteLink>
  folders!: Table<Folder>
  projects!: Table<Project>
  projectSettings!: Table<ProjectSettingsRecord>

  constructor() {
    super('scribe-browser')

    this.version(1).stores({
      // Notes with compound indexes for queries
      notes: 'id, title, folder, project_id, created_at, updated_at, deleted_at, search_text',
      // Tags
      tags: 'id, name, created_at',
      // Many-to-many: notes <-> tags
      noteTags: '[note_id+tag_id], note_id, tag_id',
      // Note links for backlinks
      noteLinks: '[source_id+target_id], source_id, target_id',
      // Folders
      folders: 'path, sort_order',
      // Projects
      projects: 'id, name, type, status, created_at, updated_at',
      // Project settings (1:1 with projects)
      projectSettings: 'project_id'
    })
  }

  /**
   * Initialize database with default folders
   */
  async initialize(): Promise<void> {
    const folderCount = await this.folders.count()
    if (folderCount === 0) {
      await this.folders.bulkAdd([
        { path: 'inbox', color: '#3B82F6', icon: 'inbox', sort_order: 0 },
        { path: 'notes', color: '#10B981', icon: 'file-text', sort_order: 1 },
        { path: 'archive', color: '#6B7280', icon: 'archive', sort_order: 2 }
      ])
    }
  }
}

// Singleton instance
export const db = new ScribeBrowserDB()

// Initialize on import
db.initialize().catch(console.error)

/**
 * Helper: Generate UUID
 */
export const generateId = (): string => {
  return crypto.randomUUID()
}

/**
 * Helper: Create searchable text from note
 */
export const createSearchText = (title: string, content: string): string => {
  return `${title} ${content}`.toLowerCase()
}

/**
 * Helper: Parse note record to Note type
 */
export const parseNoteRecord = (record: NoteRecord): Note => {
  const { search_text, properties, ...rest } = record
  return {
    ...rest,
    properties: properties ? JSON.parse(properties) : undefined
  }
}

/**
 * Helper: Note to record
 */
export const noteToRecord = (note: Partial<Note>): Partial<NoteRecord> => {
  const { properties, ...rest } = note
  return {
    ...rest,
    properties: properties ? JSON.stringify(properties) : undefined,
    search_text: createSearchText(note.title || '', note.content || '')
  } as Partial<NoteRecord>
}
