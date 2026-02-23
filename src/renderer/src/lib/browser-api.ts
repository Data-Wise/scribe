/**
 * Browser API Implementation
 *
 * Full IndexedDB-based implementation of all Scribe API operations.
 * This provides the same interface as the Tauri backend but uses
 * browser IndexedDB for persistence.
 */

import { db, generateId, createSearchText, parseNoteRecord, noteToRecord, seedDemoData } from './browser-db'
import type { Note, Tag, TagWithCount, Folder, Project, ProjectType, ProjectSettings } from '../types'
import type { Citation, ExportOptions, ExportResult } from './api'

/**
 * Browser API - Full Implementation
 */
export const browserApi = {
  // ============================================================================
  // Note Operations
  // ============================================================================

  createNote: async (note: Partial<Note>): Promise<Note> => {
    const now = Date.now()
    const id = generateId()
    const newNote: Note = {
      id,
      title: note.title || 'Untitled',
      content: note.content || '',
      folder: note.folder || 'inbox',
      project_id: note.project_id || null,
      properties: note.properties,
      created_at: now,
      updated_at: now,
      deleted_at: null
    }

    await db.notes.add(noteToRecord(newNote) as any)

    // Index wiki links and tags
    if (newNote.content) {
      await browserApi.updateNoteLinks(id, newNote.content)
      await browserApi.updateNoteTags(id, newNote.content)
    }

    return newNote
  },

  updateNote: async (id: string, updates: Partial<Note>): Promise<Note | null> => {
    const existing = await db.notes.get(id)
    if (!existing) return null

    const updatedRecord = {
      ...existing,
      ...noteToRecord(updates),
      updated_at: Date.now(),
      search_text: createSearchText(
        updates.title ?? existing.title,
        updates.content ?? existing.content
      )
    }

    await db.notes.put(updatedRecord)

    // Reindex wiki links and tags if content changed
    if (updates.content !== undefined) {
      await browserApi.updateNoteLinks(id, updates.content)
      await browserApi.updateNoteTags(id, updates.content)
    }

    return parseNoteRecord(updatedRecord)
  },

  deleteNote: async (id: string): Promise<boolean> => {
    const existing = await db.notes.get(id)
    if (!existing) return false

    // Soft delete
    await db.notes.update(id, { deleted_at: Date.now() })

    // Clean up relationships
    await db.noteTags.where('note_id').equals(id).delete()
    await db.noteLinks.where('source_id').equals(id).delete()
    await db.noteLinks.where('target_id').equals(id).delete()

    return true
  },

  getNote: async (id: string): Promise<Note | null> => {
    const record = await db.notes.get(id)
    if (!record || record.deleted_at) return null
    return parseNoteRecord(record)
  },

  listNotes: async (folder?: string): Promise<Note[]> => {
    if (folder) {
      const records = await db.notes
        .where('folder')
        .equals(folder)
        .filter(n => !n.deleted_at)
        .toArray()
      return records.map(parseNoteRecord)
    }

    const records = await db.notes.filter(n => !n.deleted_at).toArray()
    return records.map(parseNoteRecord)
  },

  searchNotes: async (query: string): Promise<Note[]> => {
    const searchTerm = query.toLowerCase()
    const records = await db.notes
      .filter(n => !n.deleted_at && n.search_text.includes(searchTerm))
      .toArray()
    return records.map(parseNoteRecord)
  },

  // ============================================================================
  // Tag Operations
  // ============================================================================

  createTag: async (name: string, color?: string): Promise<Tag> => {
    const id = generateId()
    const tag: Tag = {
      id,
      name,
      color: color || null,
      created_at: Date.now()
    }
    await db.tags.add(tag)
    return tag
  },

  getTag: async (id: string): Promise<Tag | null> => {
    return await db.tags.get(id) || null
  },

  getTagByName: async (name: string): Promise<Tag | null> => {
    return await db.tags.where('name').equals(name).first() || null
  },

  getAllTags: async (): Promise<TagWithCount[]> => {
    const tags = await db.tags.toArray()
    const tagsWithCount: TagWithCount[] = []

    for (const tag of tags) {
      const count = await db.noteTags.where('tag_id').equals(tag.id).count()
      tagsWithCount.push({ ...tag, note_count: count })
    }

    return tagsWithCount
  },

  renameTag: async (id: string, newName: string): Promise<boolean> => {
    const existing = await db.tags.get(id)
    if (!existing) return false
    await db.tags.update(id, { name: newName })
    return true
  },

  deleteTag: async (id: string): Promise<boolean> => {
    const existing = await db.tags.get(id)
    if (!existing) return false

    await db.noteTags.where('tag_id').equals(id).delete()
    await db.tags.delete(id)
    return true
  },

  // ============================================================================
  // Note-Tag Relationships
  // ============================================================================

  addTagToNote: async (noteId: string, tagName: string): Promise<void> => {
    // Get or create tag
    let tag = await db.tags.where('name').equals(tagName).first()
    if (!tag) {
      tag = {
        id: generateId(),
        name: tagName,
        color: null,
        created_at: Date.now()
      }
      await db.tags.add(tag)
    }

    // Check if relationship exists
    const existing = await db.noteTags
      .where('[note_id+tag_id]')
      .equals([noteId, tag.id])
      .first()

    if (!existing) {
      await db.noteTags.add({ note_id: noteId, tag_id: tag.id })
    }
  },

  removeTagFromNote: async (noteId: string, tagId: string): Promise<void> => {
    await db.noteTags
      .where('[note_id+tag_id]')
      .equals([noteId, tagId])
      .delete()
  },

  getNoteTags: async (noteId: string): Promise<Tag[]> => {
    const noteTags = await db.noteTags.where('note_id').equals(noteId).toArray()
    const tags: Tag[] = []

    for (const nt of noteTags) {
      const tag = await db.tags.get(nt.tag_id)
      if (tag) tags.push(tag)
    }

    return tags
  },

  getNotesByTag: async (tagId: string): Promise<Note[]> => {
    const noteTags = await db.noteTags.where('tag_id').equals(tagId).toArray()
    const notes: Note[] = []

    for (const nt of noteTags) {
      const record = await db.notes.get(nt.note_id)
      if (record && !record.deleted_at) {
        notes.push(parseNoteRecord(record))
      }
    }

    return notes
  },

  filterNotesByTags: async (tagIds: string[], matchAll: boolean): Promise<Note[]> => {
    if (tagIds.length === 0) return []

    const allNoteTags = await db.noteTags.toArray()
    const noteTagMap = new Map<string, Set<string>>()

    for (const nt of allNoteTags) {
      if (!noteTagMap.has(nt.note_id)) {
        noteTagMap.set(nt.note_id, new Set())
      }
      noteTagMap.get(nt.note_id)!.add(nt.tag_id)
    }

    const matchingNoteIds: string[] = []

    for (const [noteId, noteTags] of noteTagMap) {
      if (matchAll) {
        // All tags must match
        if (tagIds.every(tagId => noteTags.has(tagId))) {
          matchingNoteIds.push(noteId)
        }
      } else {
        // Any tag matches
        if (tagIds.some(tagId => noteTags.has(tagId))) {
          matchingNoteIds.push(noteId)
        }
      }
    }

    const notes: Note[] = []
    for (const id of matchingNoteIds) {
      const record = await db.notes.get(id)
      if (record && !record.deleted_at) {
        notes.push(parseNoteRecord(record))
      }
    }

    return notes
  },

  updateNoteTags: async (noteId: string, content: string): Promise<void> => {
    // Extract tags from content (hashtag format)
    const tagMatches = content.match(/#[\w-]+/g) || []
    const tagNames = tagMatches.map(t => t.slice(1)) // Remove #

    // Get current tags
    const currentTags = await browserApi.getNoteTags(noteId)
    const currentTagNames = new Set(currentTags.map(t => t.name))

    // Add new tags
    for (const name of tagNames) {
      if (!currentTagNames.has(name)) {
        await browserApi.addTagToNote(noteId, name)
      }
    }

    // Remove old tags not in content
    const newTagSet = new Set(tagNames)
    for (const tag of currentTags) {
      if (!newTagSet.has(tag.name)) {
        await browserApi.removeTagFromNote(noteId, tag.id)
      }
    }
  },

  // ============================================================================
  // Folder Operations
  // ============================================================================

  getFolders: async (): Promise<Folder[]> => {
    return await db.folders.orderBy('sort_order').toArray()
  },

  // ============================================================================
  // Link Operations
  // ============================================================================

  updateNoteLinks: async (noteId: string, content: string): Promise<void> => {
    // Extract wiki links [[...]]
    const linkMatches = content.match(/\[\[([^\]]+)\]\]/g) || []
    const targetTitles = linkMatches.map(m => m.slice(2, -2))

    // Remove existing outgoing links
    await db.noteLinks.where('source_id').equals(noteId).delete()

    // Find target notes and create links
    for (const title of targetTitles) {
      const targetRecord = await db.notes
        .where('title')
        .equals(title)
        .filter(n => !n.deleted_at)
        .first()

      if (targetRecord) {
        await db.noteLinks.add({
          source_id: noteId,
          target_id: targetRecord.id
        })
      }
    }
  },

  getBacklinks: async (noteId: string): Promise<Note[]> => {
    const links = await db.noteLinks.where('target_id').equals(noteId).toArray()
    const notes: Note[] = []

    for (const link of links) {
      const record = await db.notes.get(link.source_id)
      if (record && !record.deleted_at) {
        notes.push(parseNoteRecord(record))
      }
    }

    return notes
  },

  getOutgoingLinks: async (noteId: string): Promise<Note[]> => {
    const links = await db.noteLinks.where('source_id').equals(noteId).toArray()
    const notes: Note[] = []

    for (const link of links) {
      const record = await db.notes.get(link.target_id)
      if (record && !record.deleted_at) {
        notes.push(parseNoteRecord(record))
      }
    }

    return notes
  },

  // ============================================================================
  // AI Operations (Browser stubs - no CLI access)
  // ============================================================================

  runClaude: async (_prompt: string, _context?: string): Promise<string> => {
    return 'AI features require the native Tauri app. Please run `npm run dev` instead of `npm run dev:vite`.'
  },

  runGemini: async (_prompt: string, _context?: string): Promise<string> => {
    return 'AI features require the native Tauri app. Please run `npm run dev` instead of `npm run dev:vite`.'
  },

  // ============================================================================
  // Chat History (Browser stubs - in-memory only, not persisted)
  // ============================================================================

  getOrCreateChatSession: async (noteId: string): Promise<string> => {
    // Return a simple session ID based on note ID
    return `browser-session-${noteId}`
  },

  saveChatMessage: async (_sessionId: string, _role: string, _content: string, _timestamp: number): Promise<string> => {
    // In browser mode, chat is ephemeral (not persisted to IndexedDB)
    return `msg-${Date.now()}`
  },

  loadChatSession: async (_sessionId: string): Promise<Array<{ id: string; role: string; content: string; timestamp: number }>> => {
    // Browser mode doesn't persist chat history
    return []
  },

  clearChatSession: async (_sessionId: string): Promise<void> => {
    // No-op in browser mode
  },

  deleteChatSession: async (_sessionId: string): Promise<void> => {
    // No-op in browser mode
  },

  // ============================================================================
  // Daily Notes
  // ============================================================================

  getOrCreateDailyNote: async (date: string): Promise<Note> => {
    const title = `Daily - ${date}`

    // Check if exists
    const existing = await db.notes
      .where('title')
      .equals(title)
      .filter(n => !n.deleted_at)
      .first()

    if (existing) {
      return parseNoteRecord(existing)
    }

    // Create new daily note
    return browserApi.createNote({
      title,
      content: `# ${title}\n\n## Tasks\n\n- [ ] \n\n## Notes\n\n`,
      folder: 'notes'
    })
  },

  // ============================================================================
  // Export Operations (Browser stubs)
  // ============================================================================

  exportToObsidian: async (_targetPath: string): Promise<string> => {
    return 'Obsidian export requires the native Tauri app.'
  },

  // ============================================================================
  // Font Operations (Browser stubs)
  // ============================================================================

  getInstalledFonts: async (): Promise<string[]> => {
    // Return common web-safe fonts
    return [
      'Inter', 'System UI', 'Arial', 'Helvetica', 'Georgia',
      'Times New Roman', 'Courier New', 'Verdana'
    ]
  },

  isFontInstalled: async (_fontFamily: string): Promise<boolean> => {
    return true // Assume available in browser
  },

  installFontViaHomebrew: async (_caskName: string): Promise<string> => {
    return 'Font installation requires the native Tauri app.'
  },

  isHomebrewAvailable: async (): Promise<boolean> => {
    return false
  },

  // ============================================================================
  // Citation Operations (Browser stubs)
  // ============================================================================

  getCitations: async (): Promise<Citation[]> => {
    return [] // No Zotero access in browser
  },

  searchCitations: async (_query: string): Promise<Citation[]> => {
    return []
  },

  getCitationByKey: async (_key: string): Promise<Citation | null> => {
    return null
  },

  setBibliographyPath: async (_path: string): Promise<void> => {
    console.warn('Bibliography path setting requires native Tauri app')
  },

  getBibliographyPath: async (): Promise<string | null> => {
    return null
  },

  // ============================================================================
  // Document Export (Browser stubs)
  // ============================================================================

  exportDocument: async (_options: ExportOptions): Promise<ExportResult> => {
    return { path: '', success: false }
  },

  isPandocAvailable: async (): Promise<boolean> => {
    return false
  },

  // ============================================================================
  // Project Operations
  // ============================================================================

  listProjects: async (): Promise<Project[]> => {
    return await db.projects.toArray()
  },

  createProject: async (project: {
    name: string
    type: ProjectType
    description?: string
    color?: string
  }): Promise<Project> => {
    const now = Date.now()
    const id = generateId()
    const newProject: Project = {
      id,
      name: project.name,
      type: project.type,
      description: project.description,
      color: project.color,
      status: 'active',
      progress: 0,
      created_at: now,
      updated_at: now
    }

    await db.projects.add(newProject)
    return newProject
  },

  getProject: async (id: string): Promise<Project | null> => {
    return await db.projects.get(id) || null
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    const existing = await db.projects.get(id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...updates,
      updated_at: Date.now()
    }

    await db.projects.put(updated)
    return updated
  },

  deleteProject: async (id: string): Promise<boolean> => {
    const existing = await db.projects.get(id)
    if (!existing) return false

    // Unassign notes from this project
    const notes = await db.notes.where('project_id').equals(id).toArray()
    for (const note of notes) {
      await db.notes.update(note.id, { project_id: null })
    }

    // Delete settings
    await db.projectSettings.delete(id)

    // Delete project
    await db.projects.delete(id)
    return true
  },

  getProjectSettings: async (id: string): Promise<ProjectSettings | null> => {
    const record = await db.projectSettings.get(id)
    if (!record) return null
    return JSON.parse(record.settings)
  },

  updateProjectSettings: async (id: string, settings: Partial<ProjectSettings>): Promise<void> => {
    const existing = await db.projectSettings.get(id)
    const currentSettings = existing ? JSON.parse(existing.settings) : {}
    const updated = { ...currentSettings, ...settings }

    await db.projectSettings.put({
      project_id: id,
      settings: JSON.stringify(updated)
    })
  },

  getProjectNotes: async (projectId: string): Promise<Note[]> => {
    const records = await db.notes
      .where('project_id')
      .equals(projectId)
      .filter(n => !n.deleted_at)
      .toArray()
    return records.map(parseNoteRecord)
  },

  setNoteProject: async (noteId: string, projectId: string | null): Promise<void> => {
    await db.notes.update(noteId, { project_id: projectId })
  },

  // ============================================================================
  // Terminal/Shell Operations (Browser stubs)
  // ============================================================================

  spawnShell: async (_cwd?: string): Promise<{ shell_id: number }> => {
    // Browser mode uses emulated shell in TerminalPanel
    console.warn('Full shell access requires native Tauri app')
    return { shell_id: -1 }
  },

  writeToShell: async (_shellId: number, _data: string): Promise<void> => {
    // No-op in browser mode
  },

  killShell: async (_shellId: number): Promise<void> => {
    // No-op in browser mode
  },

  checkPathExists: async (path: string): Promise<{ exists: boolean; is_dir: boolean; expanded_path: string }> => {
    // In browser mode, we can't check filesystem paths
    console.warn('Path check not available in browser mode')
    return { exists: false, is_dir: false, expanded_path: path }
  },

  createDirectory: async (path: string): Promise<string> => {
    // No-op in browser mode
    console.warn('Directory creation not available in browser mode')
    return path
  },

  onShellOutput: (_callback: (shellId: number, data: string) => void): (() => void) => {
    // No-op in browser mode - TerminalPanel uses browser shell emulation
    return () => {}
  },

  onShellClosed: (_callback: (shellId: number) => void): (() => void) => {
    // No-op in browser mode
    return () => {}
  },

  resizeShell: async (_shellId: number, _rows: number, _cols: number): Promise<void> => {
    // No-op in browser mode
  },

  listShells: async (): Promise<number[]> => {
    // No shells in browser mode
    return []
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Reindex all notes for wiki links and tags
 * Call this on app initialization to ensure existing notes are indexed
 */
export const reindexAllNotes = async (): Promise<number> => {
  const notes = await db.notes.filter(n => !n.deleted_at).toArray()
  let count = 0

  for (const record of notes) {
    if (record.content) {
      await browserApi.updateNoteLinks(record.id, record.content)
      await browserApi.updateNoteTags(record.id, record.content)
      count++
    }
  }

  console.log(`[Scribe] Reindexed ${count} notes for wiki links and tags`)
  return count
}

// ============================================================================
// Browser API Initialization
// ============================================================================

/**
 * Initialize browser API with demo data if needed
 */
export const initializeBrowserApi = async (): Promise<void> => {
  console.log('[Scribe] Using IndexedDB for persistence')
  await db.initialize()
  await seedDemoData()

  // Reindex existing notes for wiki links and tags
  await reindexAllNotes()
}

// Auto-initialize on import (browser mode only, skip in tests)
if (typeof import.meta.env?.VITEST === 'undefined') {
  initializeBrowserApi().catch(console.error)
}
