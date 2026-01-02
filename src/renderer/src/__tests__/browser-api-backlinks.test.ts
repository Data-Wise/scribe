/**
 * Unit Tests: Browser API - Wiki Link & Tag Indexing
 *
 * Tests for Sprint 30 Phase 1 fix - verifies that wiki links and tags
 * are correctly indexed when notes are created or updated.
 */

// Set up fake IndexedDB before imports
import 'fake-indexeddb/auto'

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Unmock the API for this test file
vi.unmock('../lib/api')

import { browserApi, reindexAllNotes } from '../lib/browser-api'
import { db } from '../lib/browser-db'

describe('Browser API: Wiki Link Indexing (Sprint 30 Fix)', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.notes.clear()
    await db.noteLinks.clear()
    await db.noteTags.clear()
    await db.tags.clear()
  })

  describe('createNote', () => {
    it('should index wiki links when creating note', async () => {
      // Create target note
      const target = await browserApi.createNote({
        title: 'Target Note',
        content: 'This is the target'
      })

      // Create source note with wiki link
      const source = await browserApi.createNote({
        title: 'Source Note',
        content: 'This links to [[Target Note]] in the middle.'
      })

      // Verify backlink was created
      const backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks).toHaveLength(1)
      expect(backlinks[0].id).toBe(source.id)
      expect(backlinks[0].title).toBe('Source Note')
    })

    it('should index multiple wiki links in one note', async () => {
      // Create target notes
      const target1 = await browserApi.createNote({
        title: 'Target 1',
        content: 'First target'
      })

      const target2 = await browserApi.createNote({
        title: 'Target 2',
        content: 'Second target'
      })

      // Create source with multiple links
      const source = await browserApi.createNote({
        title: 'Multi Source',
        content: 'Links to [[Target 1]] and [[Target 2]]'
      })

      // Verify both backlinks
      const backlinks1 = await browserApi.getBacklinks(target1.id)
      const backlinks2 = await browserApi.getBacklinks(target2.id)

      expect(backlinks1).toHaveLength(1)
      expect(backlinks1[0].id).toBe(source.id)

      expect(backlinks2).toHaveLength(1)
      expect(backlinks2[0].id).toBe(source.id)
    })

    it('should handle wiki link to non-existent note gracefully', async () => {
      // Create note with link to non-existent target
      const source = await browserApi.createNote({
        title: 'Source',
        content: '[[Non Existent Note]] link'
      })

      // Should not throw error
      expect(source).toBeDefined()
      expect(source.id).toBeDefined()

      // No backlinks should be created (target doesn't exist)
      const outgoing = await browserApi.getOutgoingLinks(source.id)
      expect(outgoing).toHaveLength(0)
    })

    it('should not index wiki links in empty content', async () => {
      const note = await browserApi.createNote({
        title: 'Empty Note',
        content: ''
      })

      expect(note).toBeDefined()

      // No links should be created
      const outgoing = await browserApi.getOutgoingLinks(note.id)
      expect(outgoing).toHaveLength(0)
    })
  })

  describe('updateNote', () => {
    it('should index wiki links when updating note content', async () => {
      // Create notes
      const target = await browserApi.createNote({
        title: 'Target',
        content: 'Target'
      })

      const source = await browserApi.createNote({
        title: 'Source',
        content: 'No links initially'
      })

      // Verify no backlinks initially
      let backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks).toHaveLength(0)

      // Update to add wiki link
      await browserApi.updateNote(source.id, {
        content: 'Now has [[Target]] link'
      })

      // Verify backlink appears
      backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks).toHaveLength(1)
      expect(backlinks[0].id).toBe(source.id)
    })

    it('should remove wiki links when updating content', async () => {
      // Create target
      const target = await browserApi.createNote({
        title: 'Target',
        content: 'Target'
      })

      // Create source WITH link
      const source = await browserApi.createNote({
        title: 'Source',
        content: 'Has [[Target]] link'
      })

      // Verify backlink exists
      let backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks).toHaveLength(1)

      // Update to remove link
      await browserApi.updateNote(source.id, {
        content: 'No more links'
      })

      // Verify backlink is gone
      backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks).toHaveLength(0)
    })

    it('should replace wiki links when updating content', async () => {
      // Create targets
      const target1 = await browserApi.createNote({
        title: 'Target 1',
        content: 'First'
      })

      const target2 = await browserApi.createNote({
        title: 'Target 2',
        content: 'Second'
      })

      // Create source linking to target1
      const source = await browserApi.createNote({
        title: 'Source',
        content: '[[Target 1]] link'
      })

      // Verify initial state
      let backlinks1 = await browserApi.getBacklinks(target1.id)
      let backlinks2 = await browserApi.getBacklinks(target2.id)
      expect(backlinks1).toHaveLength(1)
      expect(backlinks2).toHaveLength(0)

      // Update to link to target2 instead
      await browserApi.updateNote(source.id, {
        content: '[[Target 2]] link'
      })

      // Verify links switched
      backlinks1 = await browserApi.getBacklinks(target1.id)
      backlinks2 = await browserApi.getBacklinks(target2.id)
      expect(backlinks1).toHaveLength(0)
      expect(backlinks2).toHaveLength(1)
    })

    it('should not reindex if content unchanged', async () => {
      const note = await browserApi.createNote({
        title: 'Note',
        content: 'Content with [[Link]]'
      })

      // Update only title (not content)
      const updated = await browserApi.updateNote(note.id, {
        title: 'New Title'
      })

      expect(updated).toBeDefined()
      expect(updated?.title).toBe('New Title')
      // Should not throw errors even though content wasn't provided
    })
  })

  describe('getBacklinks & getOutgoingLinks', () => {
    it('should return empty array when no backlinks exist', async () => {
      const note = await browserApi.createNote({
        title: 'Lonely Note',
        content: 'Nobody links to me'
      })

      const backlinks = await browserApi.getBacklinks(note.id)
      expect(backlinks).toHaveLength(0)
    })

    it('should return multiple backlinks correctly', async () => {
      const target = await browserApi.createNote({
        title: 'Popular',
        content: 'Many links'
      })

      // Create multiple source notes
      await browserApi.createNote({
        title: 'Source A',
        content: '[[Popular]] link'
      })

      await browserApi.createNote({
        title: 'Source B',
        content: '[[Popular]] link'
      })

      await browserApi.createNote({
        title: 'Source C',
        content: '[[Popular]] link'
      })

      const backlinks = await browserApi.getBacklinks(target.id)
      expect(backlinks).toHaveLength(3)

      const titles = backlinks.map(n => n.title).sort()
      expect(titles).toEqual(['Source A', 'Source B', 'Source C'])
    })

    it('should return outgoing links correctly', async () => {
      // Create targets
      await browserApi.createNote({ title: 'Target A', content: 'A' })
      await browserApi.createNote({ title: 'Target B', content: 'B' })

      // Create source linking to both
      const source = await browserApi.createNote({
        title: 'Source',
        content: 'Links to [[Target A]] and [[Target B]]'
      })

      const outgoing = await browserApi.getOutgoingLinks(source.id)
      expect(outgoing).toHaveLength(2)

      const titles = outgoing.map(n => n.title).sort()
      expect(titles).toEqual(['Target A', 'Target B'])
    })
  })
})

describe('Browser API: Tag Indexing (Sprint 30 Fix)', () => {
  beforeEach(async () => {
    await db.notes.clear()
    await db.noteLinks.clear()
    await db.noteTags.clear()
    await db.tags.clear()
  })

  describe('createNote', () => {
    it('should index tags when creating note', async () => {
      const note = await browserApi.createNote({
        title: 'Tagged Note',
        content: 'Has #research and #important tags'
      })

      const tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(2)

      const tagNames = tags.map(t => t.name).sort()
      expect(tagNames).toEqual(['important', 'research'])
    })

    it('should handle duplicate tags in same note', async () => {
      const note = await browserApi.createNote({
        title: 'Note',
        content: '#test appears #test twice #test thrice'
      })

      const tags = await browserApi.getNoteTags(note.id)
      // Should only create one tag entry
      expect(tags).toHaveLength(1)
      expect(tags[0].name).toBe('test')
    })

    it('should handle notes without tags', async () => {
      const note = await browserApi.createNote({
        title: 'No Tags',
        content: 'Just regular content with no hashtags'
      })

      const tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(0)
    })
  })

  describe('updateNote', () => {
    it('should index tags when updating note content', async () => {
      const note = await browserApi.createNote({
        title: 'Note',
        content: 'No tags initially'
      })

      // Verify no tags
      let tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(0)

      // Update to add tags
      await browserApi.updateNote(note.id, {
        content: 'Now has #sprint30 tag'
      })

      // Verify tag appears
      tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(1)
      expect(tags[0].name).toBe('sprint30')
    })

    it('should remove tags when updating content', async () => {
      const note = await browserApi.createNote({
        title: 'Note',
        content: 'Has #oldtag'
      })

      // Verify tag exists
      let tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(1)

      // Update to remove tag
      await browserApi.updateNote(note.id, {
        content: 'No tags anymore'
      })

      // Verify tag is gone
      tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(0)
    })

    it('should replace tags when updating content', async () => {
      const note = await browserApi.createNote({
        title: 'Note',
        content: '#old tag'
      })

      // Update with different tag
      await browserApi.updateNote(note.id, {
        content: '#new tag'
      })

      const tags = await browserApi.getNoteTags(note.id)
      expect(tags).toHaveLength(1)
      expect(tags[0].name).toBe('new')
    })
  })
})

describe('Browser API: Batch Reindexing', () => {
  beforeEach(async () => {
    await db.notes.clear()
    await db.noteLinks.clear()
    await db.noteTags.clear()
    await db.tags.clear()
  })

  it('should reindex all existing notes', async () => {
    // Create notes directly in DB (bypassing indexing)
    await db.notes.add({
      id: 'manual-1',
      title: 'Manual Target',
      content: 'Target',
      folder: 'inbox',
      project_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null,
      properties: undefined,
      search_text: 'manual target target'
    } as any)

    await db.notes.add({
      id: 'manual-2',
      title: 'Manual Source',
      content: '[[Manual Target]] with #manual tag',
      folder: 'inbox',
      project_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null,
      properties: undefined,
      search_text: 'manual source'
    } as any)

    // Run reindexing
    const count = await reindexAllNotes()
    expect(count).toBe(2)

    // Verify backlinks were created
    const backlinks = await browserApi.getBacklinks('manual-1')
    expect(backlinks).toHaveLength(1)
    expect(backlinks[0].id).toBe('manual-2')

    // Verify tags were created
    const tags = await browserApi.getNoteTags('manual-2')
    expect(tags).toHaveLength(1)
    expect(tags[0].name).toBe('manual')
  })

  it('should skip notes with empty content', async () => {
    await db.notes.add({
      id: 'empty',
      title: 'Empty Note',
      content: '',
      folder: 'inbox',
      project_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null,
      properties: undefined,
      search_text: 'empty note'
    } as any)

    const count = await reindexAllNotes()
    expect(count).toBe(0) // Should skip empty content
  })

  it('should skip deleted notes', async () => {
    await db.notes.add({
      id: 'deleted',
      title: 'Deleted',
      content: 'Content',
      folder: 'inbox',
      project_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: Date.now(), // Deleted
      properties: undefined,
      search_text: 'deleted content'
    } as any)

    const count = await reindexAllNotes()
    expect(count).toBe(0) // Should skip deleted notes
  })
})
