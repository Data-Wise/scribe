/**
 * Scribe API Factory
 *
 * Automatically selects between Tauri (native) and Browser (IndexedDB) APIs
 * based on runtime environment detection.
 */

import { invoke } from '@tauri-apps/api/core'
import { isTauri, logPlatformInfo } from './platform'
import { browserApi } from './browser-api'
import { Note, Tag, TagWithCount, Folder, Project, ProjectType, ProjectSettings } from '../types'

// Log platform on first import
logPlatformInfo()

// ============================================================================
// Type Exports
// ============================================================================

// Citation type from BibTeX
export interface Citation {
  key: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
}

// Export options
export interface ExportOptions {
  noteId: string
  content: string
  title: string
  format: 'pdf' | 'docx' | 'latex' | 'html'
  bibliography?: string
  csl: string
  includeMetadata: boolean
  processEquations: boolean
}

export interface ExportResult {
  path: string
  success: boolean
}

// ============================================================================
// Tauri API (Native)
// ============================================================================

const tauriApi = {
  // Note operations
  createNote: (note: Partial<Note>): Promise<Note> =>
    invoke('create_note', { note }),

  updateNote: (id: string, updates: Partial<Note>): Promise<Note | null> =>
    invoke('update_note', { id, updates }),

  deleteNote: (id: string): Promise<boolean> =>
    invoke('delete_note', { id }),

  getNote: (id: string): Promise<Note | null> =>
    invoke('get_note', { id }),

  listNotes: (folder?: string): Promise<Note[]> =>
    invoke('list_notes', { folder }),

  searchNotes: (query: string): Promise<Note[]> =>
    invoke('search_notes', { query }),

  // Tag CRUD
  createTag: (name: string, color?: string): Promise<Tag> =>
    invoke('create_tag', { name, color }),

  getTag: (id: string): Promise<Tag | null> =>
    invoke('get_tag', { id }),

  getTagByName: (name: string): Promise<Tag | null> =>
    invoke('get_tag_by_name', { name }),

  getAllTags: (): Promise<TagWithCount[]> =>
    invoke('get_all_tags'),

  renameTag: (id: string, newName: string): Promise<boolean> =>
    invoke('rename_tag', { id, newName }),

  deleteTag: (id: string): Promise<boolean> =>
    invoke('delete_tag', { id }),

  // Note-Tag relationships
  addTagToNote: (noteId: string, tagName: string): Promise<void> =>
    invoke('add_tag_to_note', { noteId, tagName }),

  removeTagFromNote: (noteId: string, tagId: string): Promise<void> =>
    invoke('remove_tag_from_note', { noteId, tagId }),

  getNoteTags: (noteId: string): Promise<Tag[]> =>
    invoke('get_note_tags', { noteId }),

  getNotesByTag: (tagId: string): Promise<Note[]> =>
    invoke('get_notes_by_tag', { tagId }),

  filterNotesByTags: (tagIds: string[], matchAll: boolean): Promise<Note[]> =>
    invoke('filter_notes_by_tags', { tagIds, matchAll }),

  updateNoteTags: (noteId: string, content: string): Promise<void> =>
    invoke('update_note_tags', { noteId, content }),

  // Folder operations
  getFolders: (): Promise<Folder[]> =>
    invoke('get_folders'),

  // Link operations
  updateNoteLinks: (noteId: string, content: string): Promise<void> =>
    invoke('update_note_links', { noteId, content }),

  getBacklinks: (noteId: string): Promise<Note[]> =>
    invoke('get_backlinks', { noteId }),

  getOutgoingLinks: (noteId: string): Promise<Note[]> =>
    invoke('get_outgoing_links', { noteId }),

  // AI operations
  runClaude: (prompt: string): Promise<string> =>
    invoke('run_claude', { prompt }),

  runGemini: (prompt: string): Promise<string> =>
    invoke('run_gemini', { prompt }),

  getOrCreateDailyNote: (date: string): Promise<Note> =>
    invoke('get_or_create_daily_note', { date }),

  exportToObsidian: (targetPath: string): Promise<string> =>
    invoke('export_to_obsidian', { targetPath }),

  // Font management
  getInstalledFonts: (): Promise<string[]> =>
    invoke('get_installed_fonts'),

  isFontInstalled: (fontFamily: string): Promise<boolean> =>
    invoke('is_font_installed', { fontFamily }),

  installFontViaHomebrew: (caskName: string): Promise<string> =>
    invoke('install_font_via_homebrew', { caskName }),

  isHomebrewAvailable: (): Promise<boolean> =>
    invoke('is_homebrew_available'),

  // Citation operations (Zotero/BibTeX)
  getCitations: (): Promise<Citation[]> =>
    invoke('get_citations'),

  searchCitations: (query: string): Promise<Citation[]> =>
    invoke('search_citations', { query }),

  getCitationByKey: (key: string): Promise<Citation | null> =>
    invoke('get_citation_by_key', { key }),

  setBibliographyPath: (path: string): Promise<void> =>
    invoke('set_bibliography_path', { path }),

  getBibliographyPath: (): Promise<string | null> =>
    invoke('get_bibliography_path'),

  // Document export (Pandoc)
  exportDocument: (options: ExportOptions): Promise<ExportResult> =>
    invoke('export_document', { options }),

  isPandocAvailable: (): Promise<boolean> =>
    invoke('is_pandoc_available'),

  // Project operations
  listProjects: (): Promise<Project[]> =>
    invoke('list_projects'),

  createProject: (project: {
    name: string
    type: ProjectType
    description?: string
    color?: string
  }): Promise<Project> =>
    invoke('create_project', { project }),

  getProject: (id: string): Promise<Project | null> =>
    invoke('get_project', { id }),

  updateProject: (id: string, updates: Partial<Project>): Promise<Project | null> =>
    invoke('update_project', { id, updates }),

  deleteProject: (id: string): Promise<boolean> =>
    invoke('delete_project', { id }),

  getProjectSettings: (id: string): Promise<ProjectSettings | null> =>
    invoke('get_project_settings', { id }),

  updateProjectSettings: (id: string, settings: Partial<ProjectSettings>): Promise<void> =>
    invoke('update_project_settings', { id, settings }),

  getProjectNotes: (projectId: string): Promise<Note[]> =>
    invoke('get_notes_by_project', { projectId }),

  setNoteProject: (noteId: string, projectId: string | null): Promise<void> =>
    invoke('assign_note_to_project', { noteId, projectId }),

  // Terminal/Shell operations
  spawnShell: (): Promise<{ shell_id: number }> =>
    invoke('spawn_shell'),

  writeToShell: (shellId: number, data: string): Promise<void> =>
    invoke('write_to_shell', { shellId, data }),

  killShell: (shellId: number): Promise<void> =>
    invoke('kill_shell', { shellId }),

  onShellOutput: (_callback: (output: string) => void): (() => void) => {
    // This will be set up via Tauri event listener
    // For now, return a no-op cleanup function
    // TODO: Implement with @tauri-apps/api/event
    console.warn('Shell output listener not yet implemented')
    return () => {}
  }
}

// ============================================================================
// API Factory - Select Implementation at Runtime
// ============================================================================

/**
 * The API object - automatically uses Tauri or Browser implementation
 * based on runtime environment.
 *
 * In Tauri: Uses native SQLite backend via invoke()
 * In Browser: Uses IndexedDB via Dexie.js
 */
const rawApi = isTauri() ? tauriApi : browserApi

// ============================================================================
// Error Handling with Toast Notifications
// ============================================================================

import { showGlobalToast } from '../components/Toast'

/**
 * Wraps an API function with error handling that shows toast notifications.
 * Critical operations (note/project CRUD) show toasts on failure.
 * Silent operations (search, list) just log to console.
 */
function withErrorToast<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context: string,
  silent = false
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[API Error] ${context}:`, message)

      if (!silent) {
        showGlobalToast(`${context}: ${message}`, 'error')
      }

      throw error
    }
  }
}

/**
 * API with error toast notifications for critical operations.
 * Silent operations (search, list) don't show toasts.
 */
export const api = {
  // Note operations (critical - show toasts)
  createNote: withErrorToast(rawApi.createNote, 'Failed to create note'),
  updateNote: withErrorToast(rawApi.updateNote, 'Failed to save note'),
  deleteNote: withErrorToast(rawApi.deleteNote, 'Failed to delete note'),
  getNote: withErrorToast(rawApi.getNote, 'Failed to load note', true),
  listNotes: withErrorToast(rawApi.listNotes, 'Failed to list notes', true),
  searchNotes: withErrorToast(rawApi.searchNotes, 'Search failed', true),

  // Tag operations
  createTag: withErrorToast(rawApi.createTag, 'Failed to create tag'),
  getTag: withErrorToast(rawApi.getTag, 'Failed to get tag', true),
  getTagByName: withErrorToast(rawApi.getTagByName, 'Failed to get tag', true),
  getAllTags: withErrorToast(rawApi.getAllTags, 'Failed to load tags', true),
  renameTag: withErrorToast(rawApi.renameTag, 'Failed to rename tag'),
  deleteTag: withErrorToast(rawApi.deleteTag, 'Failed to delete tag'),
  addTagToNote: withErrorToast(rawApi.addTagToNote, 'Failed to add tag'),
  removeTagFromNote: withErrorToast(rawApi.removeTagFromNote, 'Failed to remove tag'),
  getNoteTags: withErrorToast(rawApi.getNoteTags, 'Failed to get tags', true),
  getNotesByTag: withErrorToast(rawApi.getNotesByTag, 'Failed to get notes', true),
  filterNotesByTags: withErrorToast(rawApi.filterNotesByTags, 'Failed to filter', true),
  updateNoteTags: withErrorToast(rawApi.updateNoteTags, 'Failed to update tags', true),

  // Folder operations
  getFolders: withErrorToast(rawApi.getFolders, 'Failed to load folders', true),

  // Link operations
  updateNoteLinks: withErrorToast(rawApi.updateNoteLinks, 'Failed to update links', true),
  getBacklinks: withErrorToast(rawApi.getBacklinks, 'Failed to get backlinks', true),
  getOutgoingLinks: withErrorToast(rawApi.getOutgoingLinks, 'Failed to get links', true),

  // AI operations (can fail silently - user sees empty result)
  runClaude: withErrorToast(rawApi.runClaude, 'Claude request failed'),
  runGemini: withErrorToast(rawApi.runGemini, 'Gemini request failed'),

  // Daily notes
  getOrCreateDailyNote: withErrorToast(rawApi.getOrCreateDailyNote, 'Failed to open daily note'),

  // Export operations
  exportToObsidian: withErrorToast(rawApi.exportToObsidian, 'Obsidian export failed'),

  // Font management (silent - just affects UI options)
  getInstalledFonts: withErrorToast(rawApi.getInstalledFonts, 'Failed to get fonts', true),
  isFontInstalled: withErrorToast(rawApi.isFontInstalled, 'Font check failed', true),
  installFontViaHomebrew: withErrorToast(rawApi.installFontViaHomebrew, 'Font install failed'),
  isHomebrewAvailable: withErrorToast(rawApi.isHomebrewAvailable, 'Homebrew check failed', true),

  // Citation operations (silent - gracefully degrade)
  getCitations: withErrorToast(rawApi.getCitations, 'Failed to load citations', true),
  searchCitations: withErrorToast(rawApi.searchCitations, 'Citation search failed', true),
  getCitationByKey: withErrorToast(rawApi.getCitationByKey, 'Citation lookup failed', true),
  setBibliographyPath: withErrorToast(rawApi.setBibliographyPath, 'Failed to set bibliography'),
  getBibliographyPath: withErrorToast(rawApi.getBibliographyPath, 'Failed to get bibliography', true),

  // Document export
  exportDocument: withErrorToast(rawApi.exportDocument, 'Document export failed'),
  isPandocAvailable: withErrorToast(rawApi.isPandocAvailable, 'Pandoc check failed', true),

  // Project operations (critical - show toasts)
  listProjects: withErrorToast(rawApi.listProjects, 'Failed to load projects', true),
  createProject: withErrorToast(rawApi.createProject, 'Failed to create project'),
  getProject: withErrorToast(rawApi.getProject, 'Failed to load project', true),
  updateProject: withErrorToast(rawApi.updateProject, 'Failed to update project'),
  deleteProject: withErrorToast(rawApi.deleteProject, 'Failed to delete project'),
  getProjectSettings: withErrorToast(rawApi.getProjectSettings, 'Failed to get settings', true),
  updateProjectSettings: withErrorToast(rawApi.updateProjectSettings, 'Failed to save settings'),
  getProjectNotes: withErrorToast(rawApi.getProjectNotes, 'Failed to get project notes', true),
  setNoteProject: withErrorToast(rawApi.setNoteProject, 'Failed to move note'),

  // Terminal operations (v2 - stub for now)
  spawnShell: withErrorToast(rawApi.spawnShell, 'Failed to start terminal'),
  writeToShell: withErrorToast(rawApi.writeToShell, 'Terminal write failed'),
  killShell: withErrorToast(rawApi.killShell, 'Failed to close terminal'),
  onShellOutput: rawApi.onShellOutput
}
