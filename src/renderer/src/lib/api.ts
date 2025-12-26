import { invoke } from '@tauri-apps/api/core';
import { Note, Tag, TagWithCount, Folder } from '../types';

// Citation type from BibTeX
export interface Citation {
  key: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
}

// Export options
export interface ExportOptions {
  noteId: string;
  content: string;
  title: string;
  format: 'pdf' | 'docx' | 'latex' | 'html';
  bibliography?: string;
  csl: string;
  includeMetadata: boolean;
  processEquations: boolean;
}

export interface ExportResult {
  path: string;
  success: boolean;
}

export const api = {
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
};



