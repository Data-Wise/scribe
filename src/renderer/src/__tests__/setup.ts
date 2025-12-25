import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.api for Electron IPC
global.window.api = {
  // Note operations
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  getNote: vi.fn(),
  listNotes: vi.fn(),
  searchNotes: vi.fn(),

  // Tag CRUD
  createTag: vi.fn(),
  getTag: vi.fn(),
  getTagByName: vi.fn(),
  getAllTags: vi.fn(),
  renameTag: vi.fn(),
  deleteTag: vi.fn(),

  // Note-Tag relationships
  addTagToNote: vi.fn(),
  removeTagFromNote: vi.fn(),
  getNoteTags: vi.fn(),
  getNotesByTag: vi.fn(),
  filterNotesByTags: vi.fn(),
  updateNoteTags: vi.fn(),

  // Folder operations
  getFolders: vi.fn(),

  // Link operations
  updateNoteLinks: vi.fn(),
  getBacklinks: vi.fn(),
  getOutgoingLinks: vi.fn()
}
