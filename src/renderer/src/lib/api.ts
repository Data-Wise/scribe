import { invoke } from '@tauri-apps/api/core';
import { Note, Tag, TagWithCount, Folder } from '../types';

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
};



