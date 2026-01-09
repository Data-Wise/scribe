import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db, generateId, createSearchText, parseNoteRecord, noteToRecord, seedDemoData } from '../lib/browser-db'

describe('Browser Database (IndexedDB)', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.notes.clear()
    await db.projects.clear()
    await db.tags.clear()
    await db.noteTags.clear()
    await db.noteLinks.clear()
    await db.projectSettings.clear()
    await db.folders.clear()
  })

  describe('generateId', () => {
    it('generates a valid UUID', () => {
      const id = generateId()
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('generates unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(100)
    })
  })

  describe('createSearchText', () => {
    it('combines title and content in lowercase', () => {
      const result = createSearchText('My Title', 'My Content')
      expect(result).toBe('my title my content')
    })

    it('handles empty strings', () => {
      expect(createSearchText('', '')).toBe(' ')
      expect(createSearchText('Title', '')).toBe('title ')
      expect(createSearchText('', 'Content')).toBe(' content')
    })

    it('normalizes case', () => {
      const result = createSearchText('UPPERCASE', 'MixedCase')
      expect(result).toBe('uppercase mixedcase')
    })
  })

  describe('parseNoteRecord', () => {
    it('parses a note record correctly', () => {
      const record = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test content',
        folder: 'inbox',
        created_at: 1234567890,
        updated_at: 1234567890,
        search_text: 'test note test content',
        properties: '{"status": "draft"}'
      }

      const result = parseNoteRecord(record as any)

      expect(result.id).toBe('test-id')
      expect(result.title).toBe('Test Note')
      expect(result.content).toBe('Test content')
      expect(result.properties).toEqual({ status: 'draft' })
      expect(result).not.toHaveProperty('search_text')
    })

    it('handles undefined properties', () => {
      const record = {
        id: 'test-id',
        title: 'Test',
        content: '',
        folder: 'inbox',
        created_at: 0,
        updated_at: 0,
        search_text: '',
        properties: undefined
      }

      const result = parseNoteRecord(record as any)
      expect(result.properties).toBeUndefined()
    })
  })

  describe('noteToRecord', () => {
    it('converts note to record format', () => {
      const note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test content',
        properties: { status: 'draft' }
      }

      const result = noteToRecord(note as any)

      expect(result.id).toBe('test-id')
      expect(result.title).toBe('Test Note')
      expect(result.properties).toBe('{"status":"draft"}')
      expect(result.search_text).toBe('test note test content')
    })

    it('handles missing properties', () => {
      const note = {
        title: 'Title Only'
      }

      const result = noteToRecord(note as any)
      expect(result.properties).toBeUndefined()
    })
  })

  describe('seedDemoData', () => {
    it('seeds demo data when database is empty', async () => {
      const seeded = await seedDemoData()

      expect(seeded).toBe(true)

      // Verify project was created
      const projects = await db.projects.toArray()
      expect(projects.length).toBe(1)
      expect(projects[0].name).toBe('Getting Started')

      // Verify notes were created (5 total: Welcome, Features, Daily, Quarto, Callout Types)
      const notes = await db.notes.toArray()
      expect(notes.length).toBe(5)

      // Verify tags were created (4 total: #welcome, #tutorial, #tips, #quarto)
      const tags = await db.tags.toArray()
      expect(tags.length).toBe(4)
      expect(tags.map(t => t.name)).toContain('welcome')
      expect(tags.map(t => t.name)).toContain('tutorial')
      expect(tags.map(t => t.name)).toContain('tips')
      expect(tags.map(t => t.name)).toContain('quarto')
    })

    it('does not re-seed when data exists', async () => {
      // First seed
      await seedDemoData()

      // Second seed attempt
      const seeded = await seedDemoData()
      expect(seeded).toBe(false)

      // Should still have only 1 project
      const projects = await db.projects.toArray()
      expect(projects.length).toBe(1)
    })

    it('creates note-tag relationships', async () => {
      await seedDemoData()

      const noteTags = await db.noteTags.toArray()
      expect(noteTags.length).toBeGreaterThan(0)
    })

    it('creates wiki links', async () => {
      await seedDemoData()

      const noteLinks = await db.noteLinks.toArray()
      expect(noteLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Database Operations', () => {
    it('can add and retrieve notes', async () => {
      const note = {
        id: generateId(),
        title: 'Test Note',
        content: 'Test content',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: 'test note test content',
        properties: '{}'
      }

      await db.notes.add(note)
      const retrieved = await db.notes.get(note.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.title).toBe('Test Note')
    })

    it('can add and retrieve projects', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        type: 'generic' as const,
        status: 'active' as const,
        created_at: Date.now(),
        updated_at: Date.now()
      }

      await db.projects.add(project)
      const retrieved = await db.projects.get(project.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Project')
    })

    it('can add and retrieve tags', async () => {
      const tag = {
        id: generateId(),
        name: 'test-tag',
        color: '#3B82F6',
        created_at: Date.now()
      }

      await db.tags.add(tag)
      const retrieved = await db.tags.get(tag.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('test-tag')
    })

    it('can query notes by folder', async () => {
      const note1 = {
        id: generateId(),
        title: 'Inbox Note',
        content: '',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: '',
        properties: '{}'
      }

      const note2 = {
        id: generateId(),
        title: 'Archive Note',
        content: '',
        folder: 'archive',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: '',
        properties: '{}'
      }

      await db.notes.bulkAdd([note1, note2])

      const inboxNotes = await db.notes.where('folder').equals('inbox').toArray()
      expect(inboxNotes.length).toBe(1)
      expect(inboxNotes[0].title).toBe('Inbox Note')
    })
  })
})
