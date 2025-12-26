import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Define the API mock
const apiMock = {
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
  getOutgoingLinks: vi.fn(),

  // Academic operations
  getCitations: vi.fn(),
  searchCitations: vi.fn(),
  getCitationByKey: vi.fn(),
  setBibliographyPath: vi.fn(),
  getBibliographyPath: vi.fn(),
  exportDocument: vi.fn(),
  isPandocAvailable: vi.fn()
}

// Mock the api library
vi.mock('../lib/api', () => ({
  api: apiMock
}))

// Mock window.api for backward compatibility in existing tests
global.window.api = apiMock
