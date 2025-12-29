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

// Initialize on import
db.initialize().catch(console.error)

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
 */
export const seedDemoData = async (): Promise<boolean> => {
  // Check if already seeded (any projects exist)
  const projectCount = await db.projects.count()
  if (projectCount > 0) {
    console.log('[Scribe] Demo data already exists, skipping seed')
    return false
  }

  console.log('[Scribe] Seeding demo data for new user...')

  const now = Math.floor(Date.now() / 1000)

  // Create demo project
  const demoProjectId = generateId()
  await db.projects.add({
    id: demoProjectId,
    name: 'Getting Started',
    type: 'generic',
    status: 'active',
    description: 'Learn how to use Scribe with these example notes',
    color: '#3B82F6',
    created_at: now,
    updated_at: now
  })

  // Create demo tags
  const tagWelcome = { id: generateId(), name: 'welcome', color: '#10B981', created_at: now }
  const tagTutorial = { id: generateId(), name: 'tutorial', color: '#8B5CF6', created_at: now }
  const tagTips = { id: generateId(), name: 'tips', color: '#F59E0B', created_at: now }
  await db.tags.bulkAdd([tagWelcome, tagTutorial, tagTips])

  // Demo notes
  const notes = [
    {
      id: generateId(),
      title: 'Welcome to Scribe',
      content: `# Welcome to Scribe! 👋

Scribe is an **ADHD-friendly distraction-free writer** designed to help you focus.

## Quick Tips

- Press **⌘N** to create a new note
- Press **⌘D** to open today's daily note
- Press **⌘P** to switch projects
- Press **Escape** to close panels

## Browser Mode

You're running Scribe in **browser mode** with IndexedDB storage.
Your notes persist even after refreshing the page!

## Getting Started

1. Create a new note with ⌘N
2. Start writing without distractions
3. Use #tags to organize your notes
4. Link notes with [[wiki links]]

See the [[Features Overview]] note for more details.`,
      folder: 'inbox',
      project_id: demoProjectId,
      created_at: now,
      updated_at: now
    },
    {
      id: generateId(),
      title: 'Features Overview',
      content: `# Features Overview

Scribe includes these core features to help you write:

## ✍️ Writing
- Clean, minimal editor
- Auto-save (never lose work)
- Dark mode for less eye strain
- Word count & reading time

## 🏷️ Organization
- **Tags**: Add #tags anywhere in your notes
- **Folders**: inbox, notes, archive
- **Projects**: Group related notes together

## 🔗 Knowledge
- **Wiki Links**: Connect notes with [[Note Title]]
- **Backlinks**: See what links to the current note
- **Daily Notes**: Quick journal entries

## 📚 Academic Features (Tauri only)
- Citation management with Zotero
- Export to PDF, Word, LaTeX
- Equation support with KaTeX

*Note: Academic features require the desktop app.*`,
      folder: 'notes',
      project_id: demoProjectId,
      created_at: now - 60,
      updated_at: now - 60
    },
    {
      id: generateId(),
      title: 'Daily Note Example',
      content: `# Daily: ${new Date().toISOString().split('T')[0]}

## Focus for Today
- [ ] Review the [[Welcome to Scribe]] tutorial
- [ ] Create your first note
- [ ] Try adding some #tags

## Notes
Use this space for quick thoughts and ideas.

## End of Day Review
What did you accomplish today?`,
      folder: 'daily',
      project_id: null,
      created_at: now - 120,
      updated_at: now - 120
    }
  ]

  // Add notes with search text
  for (const note of notes) {
    await db.notes.add({
      ...note,
      properties: '{}',
      search_text: createSearchText(note.title, note.content),
      deleted_at: null
    })
  }

  // Add note-tag relationships
  await db.noteTags.bulkAdd([
    { note_id: notes[0].id, tag_id: tagWelcome.id },
    { note_id: notes[0].id, tag_id: tagTutorial.id },
    { note_id: notes[1].id, tag_id: tagTutorial.id },
    { note_id: notes[1].id, tag_id: tagTips.id }
  ])

  // Add wiki links (Welcome -> Features Overview)
  await db.noteLinks.add({
    source_id: notes[0].id,
    target_id: notes[1].id
  })

  console.log('[Scribe] Demo data seeded successfully')
  console.log(`  - 1 project: "Getting Started"`)
  console.log(`  - ${notes.length} notes`)
  console.log(`  - 3 tags: #welcome, #tutorial, #tips`)

  return true
}

