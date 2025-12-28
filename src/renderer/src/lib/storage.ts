/**
 * IStorage Interface - Storage Abstraction Layer
 *
 * This interface enables Scribe to run on multiple platforms:
 * - Tauri (desktop): SQLite via rusqlite
 * - Browser (PWA): IndexedDB
 * - Future: Cloud sync via CouchDB/PouchDB
 *
 * Architecture Decision (2025-12-28):
 * Created to future-proof the codebase. Currently only TauriStorage is implemented,
 * but this interface makes it trivial to add BrowserStorage when needed.
 */

import { Note, Tag, TagWithCount, Folder, Project, ProjectType, ProjectSettings } from '../types'

// Search result with highlighted snippets
export interface SearchResult {
  note: Note
  snippet: string
  score: number
}

// Filter options for listing notes
export interface NoteFilter {
  folder?: string
  projectId?: string
  tags?: string[]
  matchAllTags?: boolean
  excludeDeleted?: boolean
}

// Citation from BibTeX/Zotero
export interface Citation {
  key: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
}

/**
 * Storage interface for all Scribe data operations
 *
 * Implementations:
 * - TauriStorage: Wraps Tauri IPC calls to Rust backend (SQLite)
 * - BrowserStorage: Uses IndexedDB for PWA (future)
 */
export interface IStorage {
  // ─────────────────────────────────────────────────────────────
  // Note Operations
  // ─────────────────────────────────────────────────────────────

  createNote(note: Partial<Note>): Promise<Note>
  getNote(id: string): Promise<Note | null>
  updateNote(id: string, updates: Partial<Note>): Promise<Note | null>
  deleteNote(id: string): Promise<boolean>
  listNotes(filter?: NoteFilter): Promise<Note[]>
  searchNotes(query: string): Promise<SearchResult[]>

  // Daily notes
  getOrCreateDailyNote(date: string): Promise<Note>

  // ─────────────────────────────────────────────────────────────
  // Tag Operations
  // ─────────────────────────────────────────────────────────────

  createTag(name: string, color?: string): Promise<Tag>
  getTag(id: string): Promise<Tag | null>
  getTagByName(name: string): Promise<Tag | null>
  getAllTags(): Promise<TagWithCount[]>
  renameTag(id: string, newName: string): Promise<boolean>
  deleteTag(id: string): Promise<boolean>

  // Note-Tag relationships
  addTagToNote(noteId: string, tagName: string): Promise<void>
  removeTagFromNote(noteId: string, tagId: string): Promise<void>
  getNoteTags(noteId: string): Promise<Tag[]>
  getNotesByTag(tagId: string): Promise<Note[]>
  filterNotesByTags(tagIds: string[], matchAll: boolean): Promise<Note[]>
  updateNoteTags(noteId: string, content: string): Promise<void>

  // ─────────────────────────────────────────────────────────────
  // Folder Operations
  // ─────────────────────────────────────────────────────────────

  getFolders(): Promise<Folder[]>

  // ─────────────────────────────────────────────────────────────
  // Link Operations (Wiki-links, Backlinks)
  // ─────────────────────────────────────────────────────────────

  updateNoteLinks(noteId: string, content: string): Promise<void>
  getBacklinks(noteId: string): Promise<Note[]>
  getOutgoingLinks(noteId: string): Promise<Note[]>

  // ─────────────────────────────────────────────────────────────
  // Project Operations
  // ─────────────────────────────────────────────────────────────

  listProjects(): Promise<Project[]>
  createProject(project: {
    name: string
    type: ProjectType
    description?: string
    color?: string
  }): Promise<Project>
  getProject(id: string): Promise<Project | null>
  updateProject(id: string, updates: Partial<Project>): Promise<Project | null>
  deleteProject(id: string): Promise<boolean>
  getProjectSettings(id: string): Promise<ProjectSettings | null>
  updateProjectSettings(id: string, settings: Partial<ProjectSettings>): Promise<void>
  getProjectNotes(projectId: string): Promise<Note[]>
  setNoteProject(noteId: string, projectId: string | null): Promise<void>

  // ─────────────────────────────────────────────────────────────
  // Citation Operations (Academic)
  // ─────────────────────────────────────────────────────────────

  getCitations(): Promise<Citation[]>
  searchCitations(query: string): Promise<Citation[]>
  getCitationByKey(key: string): Promise<Citation | null>
  setBibliographyPath(path: string): Promise<void>
  getBibliographyPath(): Promise<string | null>
}

/**
 * Storage provider type for dependency injection
 */
export type StorageProvider = 'tauri' | 'browser' | 'memory'

/**
 * Get the appropriate storage implementation based on environment
 *
 * Usage:
 * ```typescript
 * const storage = getStorage()
 * const notes = await storage.listNotes()
 * ```
 */
export function getStorageProvider(): StorageProvider {
  // Check if running in Tauri
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return 'tauri'
  }

  // Check if running in browser
  if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
    return 'browser'
  }

  // Fallback to memory (for testing)
  return 'memory'
}

// ─────────────────────────────────────────────────────────────────────────────
// Future Implementation Notes
// ─────────────────────────────────────────────────────────────────────────────
//
// When implementing BrowserStorage:
//
// 1. Use IndexedDB with object stores:
//    - notes: { id, title, content, folder, created_at, updated_at, deleted_at }
//    - tags: { id, name, color, created_at }
//    - note_tags: { note_id, tag_id }
//    - links: { source_id, target_id, link_text }
//    - projects: { id, name, type, color, ... }
//
// 2. Implement FTS with FlexSearch or Fuse.js
//
// 3. For sync, consider:
//    - PouchDB for CouchDB sync
//    - CRDT for conflict resolution (Yjs, Automerge)
//    - Or simple last-write-wins with timestamps
//
// 4. Handle offline with Service Worker:
//    - Queue writes when offline
//    - Sync when back online
//    - Show offline indicator in UI
// ─────────────────────────────────────────────────────────────────────────────
