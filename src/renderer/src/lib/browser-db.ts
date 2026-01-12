/**
 * Browser IndexedDB Database
 *
 * Full-featured IndexedDB persistence layer using Dexie.js
 * Provides the same data model as the Tauri SQLite backend.
 */

import Dexie, { type Table } from 'dexie'
import type { Note, Tag, Folder, Project } from '../types'

// Extended Note type for IndexedDB (includes searchable text)
interface NoteRecord extends Omit<Note, 'properties'> {
  properties: string // JSON serialized
  search_text: string // Lowercase title + content for FTS
}

// Note-Tag junction table
interface NoteTag {
  note_id: string
  tag_id: string
}

// Note links table
interface NoteLink {
  source_id: string
  target_id: string
}

// Project settings stored separately
interface ProjectSettingsRecord {
  project_id: string
  settings: string // JSON serialized
}

/**
 * Scribe Browser Database
 */
class ScribeBrowserDB extends Dexie {
  notes!: Table<NoteRecord>
  tags!: Table<Tag>
  noteTags!: Table<NoteTag>
  noteLinks!: Table<NoteLink>
  folders!: Table<Folder>
  projects!: Table<Project>
  projectSettings!: Table<ProjectSettingsRecord>

  constructor() {
    super('scribe-browser')

    this.version(1).stores({
      // Notes with compound indexes for queries
      notes: 'id, title, folder, project_id, created_at, updated_at, deleted_at, search_text',
      // Tags
      tags: 'id, name, created_at',
      // Many-to-many: notes <-> tags
      noteTags: '[note_id+tag_id], note_id, tag_id',
      // Note links for backlinks
      noteLinks: '[source_id+target_id], source_id, target_id',
      // Folders
      folders: 'path, sort_order',
      // Projects
      projects: 'id, name, type, status, created_at, updated_at',
      // Project settings (1:1 with projects)
      projectSettings: 'project_id'
    })
  }

  /**
   * Initialize database with default folders
   */
  async initialize(): Promise<void> {
    const folderCount = await this.folders.count()
    if (folderCount === 0) {
      await this.folders.bulkAdd([
        { path: 'inbox', color: '#3B82F6', icon: 'inbox', sort_order: 0 },
        { path: 'notes', color: '#10B981', icon: 'file-text', sort_order: 1 },
        { path: 'archive', color: '#6B7280', icon: 'archive', sort_order: 2 }
      ])
    }
  }
}

// Singleton instance
export const db = new ScribeBrowserDB()

// Expose to window for E2E tests
if (typeof window !== 'undefined') {
  ;(window as  any).scribeDb = db
}

/**
 * Helper: Generate UUID
 */
export const generateId = (): string => {
  return crypto.randomUUID()
}

/**
 * Helper: Create searchable text from note
 */
export const createSearchText = (title: string, content: string): string => {
  return `${title} ${content}`.toLowerCase()
}

/**
 * Helper: Parse note record to Note type
 */
export const parseNoteRecord = (record: NoteRecord): Note => {
  const { search_text, properties, ...rest } = record
  return {
    ...rest,
    properties: properties ? JSON.parse(properties) : undefined
  }
}

/**
 * Helper: Note to record
 */
export const noteToRecord = (note: Partial<Note>): Partial<NoteRecord> => {
  const { properties, ...rest } = note
  return {
    ...rest,
    properties: properties ? JSON.stringify(properties) : undefined,
    search_text: createSearchText(note.title || '', note.content || '')
  } as Partial<NoteRecord>
}

/**
 * Seed demo data for new browser users
 *
 * Creates example projects and notes to help users understand
 * how Scribe works. Only runs if database is empty.
 *
 * Uses shared seed data from seed-data.ts to stay in sync with
 * Tauri's database.rs migration 007.
 */
import { DEMO_PROJECTS, DEMO_TAGS, DEMO_NOTES, DEMO_WIKI_LINKS, SEED_DATA_SUMMARY } from './seed-data'

export const seedDemoData = async (): Promise<boolean> => {
  // Check if already seeded (any projects exist)
  const projectCount = await db.projects.count()
  if (projectCount > 0) {
    console.log('[Scribe] Demo data already exists, skipping seed')
    return false
  }

  console.log('[Scribe] Seeding demo data for new user...')

  const now = Math.floor(Date.now() / 1000)

  // Create demo projects from shared data
  const projectIdMap: Record<string, string> = {}
  for (const project of DEMO_PROJECTS) {
    const id = generateId()
    projectIdMap[project.name] = id
    await db.projects.add({
      id,
      name: project.name,
      type: project.type,
      status: project.status,
      description: project.description,
      color: project.color,
      icon: project.icon,
      created_at: now,
      updated_at: now
    })
  }

  const gettingStartedId = projectIdMap['Getting Started']
  const researchNotesId = projectIdMap['Research Notes']

  // Create demo tags from shared data
  const tagMap: Record<string, string> = {}
  const tagsToAdd = DEMO_TAGS.map(tag => {
    const id = generateId()
    tagMap[tag.name] = id
    return { id, name: tag.name, color: tag.color, created_at: now }
  })
  await db.tags.bulkAdd(tagsToAdd)

  // Create notes from shared data
  const noteMap: Record<string, string> = {}
  const notesToAdd = [
    { key: 'welcome', offset: 0, projectId: gettingStartedId },
    { key: 'phase3Guide', offset: 60, projectId: gettingStartedId },
    { key: 'iconModeTutorial', offset: 120, projectId: gettingStartedId },
    { key: 'settingsPinnedProjects', offset: 180, projectId: gettingStartedId },
    { key: 'keyboardShortcuts', offset: 240, projectId: gettingStartedId },
    { key: 'modeConsolidation', offset: 30, projectId: gettingStartedId }, // v1.15.0 testing guide
    { key: 'researchExample', offset: 300, projectId: researchNotesId }
  ]

  for (const { key, offset, projectId } of notesToAdd) {
    const noteData = DEMO_NOTES[key as keyof typeof DEMO_NOTES]
    const id = generateId()
    noteMap[noteData.title] = id

    await db.notes.add({
      id,
      title: noteData.title,
      content: noteData.content,
      folder: noteData.folder,
      project_id: projectId,
      created_at: now - offset,
      updated_at: now - offset,
      properties: '{}',
      search_text: createSearchText(noteData.title, noteData.content),
      deleted_at: null
    })

    // Add note-tag relationships
    for (const tagName of noteData.tags) {
      if (tagMap[tagName]) {
        await db.noteTags.add({
          note_id: id,
          tag_id: tagMap[tagName]
        })
      }
    }
  }

  // Add wiki links between notes from shared data
  for (const link of DEMO_WIKI_LINKS) {
    const sourceId = noteMap[link.from]
    const targetId = noteMap[link.to]
    if (sourceId && targetId) {
      await db.noteLinks.add({ source_id: sourceId, target_id: targetId })
    }
  }

  // Auto-pin demo projects for new users (ADHD-friendly onboarding)
  const pinnedVaults = [
    {
      id: 'inbox',
      type: 'vault' as const,
      order: 0,
      preferredMode: 'compact' as const
    },
    {
      id: gettingStartedId,
      type: 'vault' as const,
      order: 1,
      preferredMode: 'compact' as const
    },
    {
      id: researchNotesId,
      type: 'vault' as const,
      order: 2,
      preferredMode: 'compact' as const
    }
  ]

  // Save to localStorage (useAppViewStore key)
  localStorage.setItem('scribe:pinnedVaults', JSON.stringify(pinnedVaults))

  console.log('[Scribe] Demo data seeded successfully')
  console.log(`  - ${SEED_DATA_SUMMARY.description}`)
  console.log(`  - Auto-pinned ${pinnedVaults.length} vaults (Inbox + demo projects)`)

  return true
}

// Auto-run seed on module import (after db is initialized)
;(async () => {
  await db.initialize()
  await seedDemoData()
})().catch(console.error)
