/**
 * Scribe API Factory
 *
 * Automatically selects between Tauri (native) and Browser (IndexedDB) APIs
 * based on runtime environment detection.
 */

import { invoke as tauriInvoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { isTauri, logPlatformInfo } from './platform'
import { browserApi } from './browser-api'
import { Note, Tag, TagWithCount, Folder, Project, ProjectType, ProjectSettings } from '../types'

// Log platform on first import
logPlatformInfo()

// ============================================================================
// Enhanced Tauri Invoke with Error Logging
// ============================================================================

/**
 * Wrapped invoke that logs all Tauri command calls and errors.
 * Provides detailed error context for debugging.
 */
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const startTime = performance.now()

  try {
    console.debug(`[Tauri] → ${cmd}`, args ? JSON.stringify(args).slice(0, 200) : '(no args)')
    const result = await tauriInvoke<T>(cmd, args)
    const duration = (performance.now() - startTime).toFixed(1)
    console.debug(`[Tauri] ✓ ${cmd} (${duration}ms)`)
    return result
  } catch (error) {
    const duration = (performance.now() - startTime).toFixed(1)
    const errorMsg = error instanceof Error ? error.message : String(error)

    // Log detailed error information
    console.error(`[Tauri] ✗ ${cmd} FAILED (${duration}ms)`)
    console.error(`[Tauri]   Command: ${cmd}`)
    console.error(`[Tauri]   Args: ${JSON.stringify(args, null, 2)}`)
    console.error(`[Tauri]   Error: ${errorMsg}`)

    // Re-throw with enhanced message
    throw new Error(`Tauri command '${cmd}' failed: ${errorMsg}`)
  }
}

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

// LaTeX compilation types
export interface LatexError {
  line?: number
  message: string
  file?: string
}

export interface LatexCompileOptions {
  content: string
  filePath: string
  engine: 'pdflatex' | 'xelatex'
}

export interface LatexCompileResult {
  success: boolean
  pdfPath?: string
  errors: LatexError[]
  warnings: string[]
  logPath: string
}

// ============================================================================
// Tauri API (Native)
// ============================================================================

/**
 * Prepare note data for Tauri by serializing properties to JSON string.
 * Rust expects properties as Option<String>, not as an object.
 */
function prepareNoteForTauri(note: Partial<Note>): Record<string, unknown> {
  const prepared: Record<string, unknown> = { ...note }

  // Serialize properties object to JSON string for Rust
  if (note.properties && typeof note.properties === 'object') {
    prepared.properties = JSON.stringify(note.properties)
  }

  return prepared
}

/**
 * Parse note data from Tauri by deserializing properties from JSON string.
 * Rust returns properties as Option<String>, but frontend expects an object.
 */
function parseNoteFromTauri(note: Note | null): Note | null {
  if (!note) return null

  // Deserialize properties string to object
  if (note.properties && typeof note.properties === 'string') {
    try {
      note.properties = JSON.parse(note.properties)
    } catch {
      // If parsing fails, set to empty object
      note.properties = {}
    }
  }

  return note
}

/**
 * Parse array of notes from Tauri.
 */
function parseNotesFromTauri(notes: Note[]): Note[] {
  return notes.map(note => parseNoteFromTauri(note) as Note)
}

const tauriApi = {
  // Note operations
  createNote: async (note: Partial<Note>): Promise<Note> => {
    const result = await invoke<Note>('create_note', { note: prepareNoteForTauri(note) })
    return parseNoteFromTauri(result) as Note
  },

  updateNote: async (id: string, updates: Partial<Note>): Promise<Note | null> => {
    const result = await invoke<Note | null>('update_note', { id, updates: prepareNoteForTauri(updates) })
    return parseNoteFromTauri(result)
  },

  deleteNote: (id: string): Promise<boolean> =>
    invoke('delete_note', { id }),

  getNote: async (id: string): Promise<Note | null> => {
    const result = await invoke<Note | null>('get_note', { id })
    return parseNoteFromTauri(result)
  },

  listNotes: async (folder?: string): Promise<Note[]> => {
    const result = await invoke<Note[]>('list_notes', { folder })
    return parseNotesFromTauri(result)
  },

  searchNotes: async (query: string): Promise<Note[]> => {
    const result = await invoke<Note[]>('search_notes', { query })
    return parseNotesFromTauri(result)
  },

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

  getNotesByTag: async (tagId: string): Promise<Note[]> => {
    const result = await invoke<Note[]>('get_notes_by_tag', { tagId })
    return parseNotesFromTauri(result)
  },

  filterNotesByTags: async (tagIds: string[], matchAll: boolean): Promise<Note[]> => {
    const result = await invoke<Note[]>('filter_notes_by_tags', { tagIds, matchAll })
    return parseNotesFromTauri(result)
  },

  updateNoteTags: (noteId: string, content: string): Promise<void> =>
    invoke('update_note_tags', { noteId, content }),

  // Folder operations
  getFolders: (): Promise<Folder[]> =>
    invoke('get_folders'),

  // Link operations
  updateNoteLinks: (noteId: string, content: string): Promise<void> =>
    invoke('update_note_links', { noteId, content }),

  getBacklinks: async (noteId: string): Promise<Note[]> => {
    const result = await invoke<Note[]>('get_backlinks', { noteId })
    return parseNotesFromTauri(result)
  },

  getOutgoingLinks: async (noteId: string): Promise<Note[]> => {
    const result = await invoke<Note[]>('get_outgoing_links', { noteId })
    return parseNotesFromTauri(result)
  },

  // AI operations
  runClaude: (prompt: string): Promise<string> =>
    invoke('run_claude', { prompt }),

  runGemini: (prompt: string): Promise<string> =>
    invoke('run_gemini', { prompt }),

  getOrCreateDailyNote: async (date: string): Promise<Note> => {
    const result = await invoke<Note>('get_or_create_daily_note', { date })
    return parseNoteFromTauri(result) as Note
  },

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

  // LaTeX compilation
  isLatexAvailable: (engine: 'pdflatex' | 'xelatex'): Promise<boolean> =>
    invoke('is_latex_available', { engine }),

  compileLatex: (options: LatexCompileOptions): Promise<LatexCompileResult> =>
    invoke('compile_latex', { options }),

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

  getProjectNotes: async (projectId: string): Promise<Note[]> => {
    const result = await invoke<Note[]>('get_notes_by_project', { projectId })
    return parseNotesFromTauri(result)
  },

  setNoteProject: (noteId: string, projectId: string | null): Promise<void> =>
    invoke('assign_note_to_project', { noteId, projectId }),

  // Terminal/Shell operations
  spawnShell: (): Promise<{ shell_id: number }> =>
    invoke('spawn_shell'),

  writeToShell: (shellId: number, data: string): Promise<void> =>
    invoke('write_to_shell', { shellId, data }),

  killShell: (shellId: number): Promise<void> =>
    invoke('kill_shell', { shellId }),

  onShellOutput: (callback: (shellId: number, data: string) => void): (() => void) => {
    // Set up Tauri event listener for shell output
    let unlisten: UnlistenFn | null = null

    listen<{ shell_id: number; data: string }>('shell-output', (event) => {
      callback(event.payload.shell_id, event.payload.data)
    }).then((fn) => {
      unlisten = fn
    }).catch((err) => {
      console.error('Failed to set up shell output listener:', err)
    })

    // Return cleanup function
    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  },

  onShellClosed: (callback: (shellId: number) => void): (() => void) => {
    // Listen for shell closed events
    let unlisten: UnlistenFn | null = null

    listen<{ shell_id: number }>('shell-closed', (event) => {
      callback(event.payload.shell_id)
    }).then((fn) => {
      unlisten = fn
    }).catch((err) => {
      console.error('Failed to set up shell closed listener:', err)
    })

    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  },

  resizeShell: (shellId: number, rows: number, cols: number): Promise<void> =>
    invoke('resize_shell', { shellId, rows, cols }),

  listShells: (): Promise<number[]> =>
    invoke('list_shells')
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
// Toast Notifications for API Operations
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
 * Wraps an API function with both error and success toast notifications.
 * Use for user-initiated actions where feedback improves UX.
 */
function withToast<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  errorMessage: string,
  successMessage?: string
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      const result = await fn(...args)
      if (successMessage) {
        showGlobalToast(successMessage, 'success')
      }
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[API Error] ${errorMessage}:`, message)
      showGlobalToast(`${errorMessage}: ${message}`, 'error')
      throw error
    }
  }
}

/**
 * API with toast notifications for operations.
 * - User-initiated CRUD: success + error toasts
 * - Background operations: error only or silent
 */
export const api = {
  // Note operations - success feedback for user actions
  createNote: withToast(rawApi.createNote, 'Failed to create note', 'Note created'),
  updateNote: withErrorToast(rawApi.updateNote, 'Failed to save note'), // No success - too frequent
  deleteNote: withToast(rawApi.deleteNote, 'Failed to delete note', 'Note deleted'),
  getNote: withErrorToast(rawApi.getNote, 'Failed to load note', true),
  listNotes: withErrorToast(rawApi.listNotes, 'Failed to list notes', true),
  searchNotes: withErrorToast(rawApi.searchNotes, 'Search failed', true),

  // Tag operations - success feedback for user actions
  createTag: withToast(rawApi.createTag, 'Failed to create tag', 'Tag created'),
  getTag: withErrorToast(rawApi.getTag, 'Failed to get tag', true),
  getTagByName: withErrorToast(rawApi.getTagByName, 'Failed to get tag', true),
  getAllTags: withErrorToast(rawApi.getAllTags, 'Failed to load tags', true),
  renameTag: withToast(rawApi.renameTag, 'Failed to rename tag', 'Tag renamed'),
  deleteTag: withToast(rawApi.deleteTag, 'Failed to delete tag', 'Tag deleted'),
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

  // Document export - success feedback
  exportDocument: withToast(rawApi.exportDocument, 'Document export failed', 'Document exported'),
  isPandocAvailable: withErrorToast(rawApi.isPandocAvailable, 'Pandoc check failed', true),

  // LaTeX compilation - success feedback
  isLatexAvailable: withErrorToast(rawApi.isLatexAvailable, 'LaTeX check failed', true),
  compileLatex: withToast(rawApi.compileLatex, 'LaTeX compilation failed', 'LaTeX compiled successfully'),

  // Project operations - success feedback for user actions
  listProjects: withErrorToast(rawApi.listProjects, 'Failed to load projects', true),
  createProject: withToast(rawApi.createProject, 'Failed to create project', 'Project created'),
  getProject: withErrorToast(rawApi.getProject, 'Failed to load project', true),
  updateProject: withToast(rawApi.updateProject, 'Failed to update project', 'Project saved'),
  deleteProject: withToast(rawApi.deleteProject, 'Failed to delete project', 'Project deleted'),
  getProjectSettings: withErrorToast(rawApi.getProjectSettings, 'Failed to get settings', true),
  updateProjectSettings: withToast(rawApi.updateProjectSettings, 'Failed to save settings', 'Settings saved'),
  getProjectNotes: withErrorToast(rawApi.getProjectNotes, 'Failed to get project notes', true),
  setNoteProject: withToast(rawApi.setNoteProject, 'Failed to move note', 'Note moved'),

  // Terminal operations (v2 - component handles fallback gracefully)
  spawnShell: rawApi.spawnShell,  // No toast - TerminalPanel falls back to browser mode
  writeToShell: withErrorToast(rawApi.writeToShell, 'Terminal write failed'),
  killShell: withErrorToast(rawApi.killShell, 'Failed to close terminal'),
  onShellOutput: rawApi.onShellOutput,
  onShellClosed: rawApi.onShellClosed,
  resizeShell: withErrorToast(rawApi.resizeShell, 'Terminal resize failed', true),
  listShells: withErrorToast(rawApi.listShells, 'Failed to list shells', true)
}

// ============================================================================
// Startup Diagnostics
// ============================================================================

/**
 * Run comprehensive API diagnostics on startup.
 * Tests all critical endpoints and logs any failures.
 */
export async function runApiDiagnostics(): Promise<void> {
  if (!isTauri()) {
    console.log('[Diagnostics] Running in Browser mode - skipping Tauri checks')
    return
  }

  console.group('[Scribe Diagnostics] Testing Tauri API endpoints...')
  const results: { endpoint: string; status: 'ok' | 'error'; error?: string }[] = []

  // Test critical read operations
  const tests = [
    { name: 'listNotes', fn: () => rawApi.listNotes() },
    { name: 'listProjects', fn: () => rawApi.listProjects() },
    { name: 'getAllTags', fn: () => rawApi.getAllTags() },
    { name: 'getFolders', fn: () => rawApi.getFolders() },
  ]

  for (const test of tests) {
    try {
      await test.fn()
      results.push({ endpoint: test.name, status: 'ok' })
      console.log(`  ✓ ${test.name}`)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      results.push({ endpoint: test.name, status: 'error', error: errorMsg })
      console.error(`  ✗ ${test.name}: ${errorMsg}`)
    }
  }

  const failed = results.filter(r => r.status === 'error')
  if (failed.length > 0) {
    console.error(`[Diagnostics] ${failed.length} endpoint(s) failed!`)
    console.table(failed)
  } else {
    console.log('[Diagnostics] All endpoints healthy ✓')
  }

  console.groupEnd()
}
