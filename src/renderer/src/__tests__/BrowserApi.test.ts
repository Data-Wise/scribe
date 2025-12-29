import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../lib/browser-db'

// Mock the platform module to simulate browser mode
vi.mock('../lib/platform', () => ({
  isTauri: () => false,
  isBrowser: () => true
}))

// Import browser API after mocking platform
import { browserApi } from '../lib/browser-api'

describe('Browser API', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.notes.clear()
    await db.projects.clear()
    await db.tags.clear()
    await db.noteTags.clear()
    await db.noteLinks.clear()
    await db.projectSettings.clear()
    await db.folders.clear()
    // Re-initialize default folders
    await db.initialize()
  })

  describe('Note Operations', () => {
    it('creates a note and returns it', async () => {
      const note = await browserApi.createNote({
        title: 'Test Note',
        content: 'Test content',
        folder: 'inbox'
      })

      expect(note).toBeDefined()
      expect(note.id).toBeDefined()
      expect(note.title).toBe('Test Note')
      expect(note.content).toBe('Test content')
      expect(note.folder).toBe('inbox')
    })

    it('lists all notes', async () => {
      await browserApi.createNote({ title: 'Note 1', content: '', folder: 'inbox' })
      await browserApi.createNote({ title: 'Note 2', content: '', folder: 'inbox' })

      const notes = await browserApi.listNotes()

      expect(notes.length).toBe(2)
    })

    it('gets a specific note by ID', async () => {
      const created = await browserApi.createNote({
        title: 'Find Me',
        content: 'Content',
        folder: 'inbox'
      })

      const found = await browserApi.getNote(created.id)

      expect(found).toBeDefined()
      expect(found?.title).toBe('Find Me')
    })

    it('returns null for non-existent note', async () => {
      const found = await browserApi.getNote('non-existent-id')
      expect(found).toBeNull()
    })

    it('updates a note', async () => {
      const created = await browserApi.createNote({
        title: 'Original',
        content: '',
        folder: 'inbox'
      })

      const updated = await browserApi.updateNote(created.id, {
        title: 'Updated',
        content: 'New content'
      })

      expect(updated!.title).toBe('Updated')
      expect(updated!.content).toBe('New content')
    })

    it('soft deletes a note', async () => {
      const created = await browserApi.createNote({
        title: 'To Delete',
        content: '',
        folder: 'inbox'
      })

      await browserApi.deleteNote(created.id)

      const note = await db.notes.get(created.id)
      expect(note?.deleted_at).toBeDefined()
    })

    it('soft deletes a note (marks deleted_at)', async () => {
      const created = await browserApi.createNote({
        title: 'To Soft Delete',
        content: '',
        folder: 'inbox'
      })

      await browserApi.deleteNote(created.id)

      // Soft delete sets deleted_at, doesn't remove from DB
      const note = await db.notes.get(created.id)
      expect(note?.deleted_at).toBeDefined()
    })
  })

  describe('Project Operations', () => {
    it('creates a project', async () => {
      const project = await browserApi.createProject({
        name: 'Test Project',
        type: 'generic'
      })

      expect(project).toBeDefined()
      expect(project.id).toBeDefined()
      expect(project.name).toBe('Test Project')
    })

    it('lists all projects', async () => {
      await browserApi.createProject({ name: 'Project 1', type: 'generic' })
      await browserApi.createProject({ name: 'Project 2', type: 'research' })

      const projects = await browserApi.listProjects()

      expect(projects.length).toBe(2)
    })

    it('gets a specific project by ID', async () => {
      const created = await browserApi.createProject({
        name: 'Find Me',
        type: 'generic'
      })

      const found = await browserApi.getProject(created.id)

      expect(found).toBeDefined()
      expect(found?.name).toBe('Find Me')
    })

    it('updates a project', async () => {
      const created = await browserApi.createProject({
        name: 'Original',
        type: 'generic'
      })

      const updated = await browserApi.updateProject(created.id, {
        name: 'Updated',
        status: 'archive'
      })

      expect(updated!.name).toBe('Updated')
      expect(updated!.status).toBe('archive')
    })

    it('deletes a project', async () => {
      const created = await browserApi.createProject({
        name: 'To Delete',
        type: 'generic'
      })

      await browserApi.deleteProject(created.id)

      const projects = await browserApi.listProjects()
      expect(projects.length).toBe(0)
    })
  })

  describe('Tag Operations', () => {
    it('creates a tag', async () => {
      // createTag takes name string, not object
      const tag = await browserApi.createTag('test-tag')

      expect(tag).toBeDefined()
      expect(tag.name).toBe('test-tag')
    })

    it('lists all tags', async () => {
      await browserApi.createTag('tag1')
      await browserApi.createTag('tag2')

      // Use getAllTags instead of listTags
      const tags = await browserApi.getAllTags()

      expect(tags.length).toBe(2)
    })

    it('adds tag to note', async () => {
      const note = await browserApi.createNote({ title: 'Note', content: '', folder: 'inbox' })
      await browserApi.createTag('important')

      // addTagToNote takes noteId and tagName (not tagId)
      await browserApi.addTagToNote(note.id, 'important')

      const noteTags = await db.noteTags.where('note_id').equals(note.id).toArray()
      expect(noteTags.length).toBe(1)
    })

    it('removes tag from note', async () => {
      const note = await browserApi.createNote({ title: 'Note', content: '', folder: 'inbox' })
      const createdTag = await browserApi.createTag('important')
      await browserApi.addTagToNote(note.id, 'important')

      await browserApi.removeTagFromNote(note.id, createdTag.id)

      const noteTags = await db.noteTags.where('note_id').equals(note.id).toArray()
      expect(noteTags.length).toBe(0)
    })

    it('gets tags for a note', async () => {
      const note = await browserApi.createNote({ title: 'Note', content: '', folder: 'inbox' })
      await browserApi.createTag('tag1')
      await browserApi.createTag('tag2')
      await browserApi.addTagToNote(note.id, 'tag1')
      await browserApi.addTagToNote(note.id, 'tag2')

      const tags = await browserApi.getNoteTags(note.id)

      expect(tags.length).toBe(2)
    })
  })

  describe('Link Operations', () => {
    it('updates note links from content', async () => {
      const note1 = await browserApi.createNote({
        title: 'Source Note',
        content: 'Links to [[Target Note]]',
        folder: 'inbox'
      })

      const note2 = await browserApi.createNote({
        title: 'Target Note',
        content: '',
        folder: 'inbox'
      })

      await browserApi.updateNoteLinks(note1.id, note1.content)

      const links = await db.noteLinks.where('source_id').equals(note1.id).toArray()
      expect(links.length).toBe(1)
      expect(links[0].target_id).toBe(note2.id)
    })

    it('gets backlinks for a note', async () => {
      const target = await browserApi.createNote({
        title: 'Target Note',
        content: '',
        folder: 'inbox'
      })

      const source = await browserApi.createNote({
        title: 'Source Note',
        content: 'Links to [[Target Note]]',
        folder: 'inbox'
      })

      await browserApi.updateNoteLinks(source.id, source.content)

      const backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks.length).toBe(1)
      expect(backlinks[0].title).toBe('Source Note')
    })

    it('gets outgoing links for a note', async () => {
      await browserApi.createNote({
        title: 'Target Note',
        content: '',
        folder: 'inbox'
      })

      const source = await browserApi.createNote({
        title: 'Source Note',
        content: 'Links to [[Target Note]]',
        folder: 'inbox'
      })

      await browserApi.updateNoteLinks(source.id, source.content)

      const outgoing = await browserApi.getOutgoingLinks(source.id)
      expect(outgoing.length).toBe(1)
      expect(outgoing[0].title).toBe('Target Note')
    })
  })

  describe('Search Operations', () => {
    it('searches notes by title and content', async () => {
      await browserApi.createNote({ title: 'Apple Note', content: 'About fruits', folder: 'inbox' })
      await browserApi.createNote({ title: 'Banana Note', content: 'About apple trees', folder: 'inbox' })
      await browserApi.createNote({ title: 'Cherry Note', content: 'About berries', folder: 'inbox' })

      const results = await browserApi.searchNotes('apple')

      expect(results.length).toBe(2) // Apple Note + Banana Note (contains "apple" in content)
    })
  })

  describe('AI Operations (Stubs)', () => {
    it('runClaude returns native app message', async () => {
      // runClaude only takes prompt, returns string about native Tauri app
      const result = await browserApi.runClaude('test prompt')
      expect(result.toLowerCase()).toContain('tauri')
    })

    it('runGemini returns native app message', async () => {
      // runGemini only takes prompt, returns string about native Tauri app
      const result = await browserApi.runGemini('test prompt')
      expect(result.toLowerCase()).toContain('tauri')
    })
  })

  describe('Obsidian Export (Stub)', () => {
    it('exportToObsidian returns native app message', async () => {
      // Use exportToObsidian instead of syncToObsidian
      const result = await browserApi.exportToObsidian('/fake/path')
      expect(result.toLowerCase()).toContain('tauri')
    })
  })
})
