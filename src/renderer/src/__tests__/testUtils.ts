/**
 * Test Utilities - Properly typed mock data factories
 */

import type { Note, Project, Tag, ProjectType, ProjectStatus } from '../types'

// Default timestamps
const NOW = Math.floor(Date.now() / 1000)

/**
 * Create a properly typed mock Note
 */
export function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    id: `note-${Math.random().toString(36).slice(2, 9)}`,
    title: 'Test Note',
    content: 'Test content',
    folder: '/',
    project_id: null,
    created_at: NOW,
    updated_at: NOW,
    deleted_at: null,
    ...overrides
  }
}

/**
 * Create a properly typed mock Project
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: `project-${Math.random().toString(36).slice(2, 9)}`,
    name: 'Test Project',
    type: 'generic' as ProjectType,
    status: 'active' as ProjectStatus,
    created_at: NOW,
    updated_at: NOW,
    ...overrides
  }
}

/**
 * Create a properly typed mock Tag
 */
export function createMockTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: `tag-${Math.random().toString(36).slice(2, 9)}`,
    name: 'test-tag',
    color: '#3B82F6',
    created_at: NOW,
    ...overrides
  }
}

/**
 * Create multiple mock notes
 */
export function createMockNotes(count: number, baseOverrides: Partial<Note> = {}): Note[] {
  return Array.from({ length: count }, (_, i) =>
    createMockNote({
      id: `note-${i + 1}`,
      title: `Note ${i + 1}`,
      ...baseOverrides
    })
  )
}

/**
 * Create multiple mock projects
 */
export function createMockProjects(count: number, baseOverrides: Partial<Project> = {}): Project[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProject({
      id: `project-${i + 1}`,
      name: `Project ${i + 1}`,
      ...baseOverrides
    })
  )
}
