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
  isPandocAvailable: vi.fn(),

  // Project operations
  listProjects: vi.fn(),
  createProject: vi.fn(),
  getProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  getProjectSettings: vi.fn(),
  updateProjectSettings: vi.fn(),
  getProjectNotes: vi.fn(),
  setNoteProject: vi.fn()
}

// Mock the api library
vi.mock('../lib/api', () => ({
  api: apiMock
}))

// Mock window.api for backward compatibility in existing tests
global.window.api = apiMock

// Mock localStorage for happy-dom (which has incomplete implementation)
class LocalStorageMock {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }

  get length(): number {
    return Object.keys(this.store).length
  }
}

global.localStorage = new LocalStorageMock() as Storage
