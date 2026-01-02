/**
 * E2E Tests: Browser API - Wiki Link & Tag Indexing
 *
 * Direct API tests to verify Sprint 30 Phase 1 fix works correctly.
 * Tests the browser-api functions directly via page.evaluate().
 */

import { test, expect } from '@playwright/test'

test.describe('Browser API: Wiki Link Indexing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to browser mode
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for IndexedDB init + reindexing
  })

  test('API-01: createNote indexes wiki links automatically', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Create target note
      const target = await browserApi.createNote({
        title: 'API Target',
        content: 'Target content'
      })

      // Create source note with wiki link
      const source = await browserApi.createNote({
        title: 'API Source',
        content: 'Links to [[API Target]] here'
      })

      // Get backlinks for target
      const backlinks = await browserApi.getBacklinks(target.id)

      return {
        targetId: target.id,
        sourceId: source.id,
        backlinksCount: backlinks.length,
        backlinkTitles: backlinks.map(n => n.title)
      }
    })

    expect(result.backlinksCount).toBe(1)
    expect(result.backlinkTitles).toContain('API Source')
  })

  test('API-02: updateNote reindexes wiki links when content changes', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Create target note
      const target = await browserApi.createNote({
        title: 'API Target 2',
        content: 'Target content'
      })

      // Create source note WITHOUT link
      const source = await browserApi.createNote({
        title: 'API Source 2',
        content: 'No links yet'
      })

      // Verify no backlinks initially
      let backlinks = await browserApi.getBacklinks(target.id)
      const initialCount = backlinks.length

      // Update source to ADD wiki link
      await browserApi.updateNote(source.id, {
        content: 'Now has [[API Target 2]] link'
      })

      // Verify backlink appears after update
      backlinks = await browserApi.getBacklinks(target.id)

      return {
        initialCount,
        finalCount: backlinks.length,
        backlinkTitles: backlinks.map(n => n.title)
      }
    })

    expect(result.initialCount).toBe(0)
    expect(result.finalCount).toBe(1)
    expect(result.backlinkTitles).toContain('API Source 2')
  })

  test('API-03: updateNote removes wiki links when content changes', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Create target note
      const target = await browserApi.createNote({
        title: 'API Target 3',
        content: 'Target content'
      })

      // Create source note WITH link
      const source = await browserApi.createNote({
        title: 'API Source 3',
        content: 'Has [[API Target 3]] link'
      })

      // Verify backlink exists
      let backlinks = await browserApi.getBacklinks(target.id)
      const initialCount = backlinks.length

      // Update source to REMOVE wiki link
      await browserApi.updateNote(source.id, {
        content: 'No more links'
      })

      // Verify backlink is gone
      backlinks = await browserApi.getBacklinks(target.id)

      return {
        initialCount,
        finalCount: backlinks.length
      }
    })

    expect(result.initialCount).toBe(1)
    expect(result.finalCount).toBe(0)
  })

  test('API-04: Multiple wiki links create multiple backlinks', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Create target note
      const target = await browserApi.createNote({
        title: 'API Target 4',
        content: 'Popular target'
      })

      // Create multiple source notes
      await browserApi.createNote({
        title: 'Source A',
        content: 'Links to [[API Target 4]]'
      })

      await browserApi.createNote({
        title: 'Source B',
        content: 'Also links [[API Target 4]]'
      })

      await browserApi.createNote({
        title: 'Source C',
        content: 'References [[API Target 4]] multiple times [[API Target 4]]'
      })

      // Get all backlinks
      const backlinks = await browserApi.getBacklinks(target.id)

      return {
        count: backlinks.length,
        titles: backlinks.map(n => n.title).sort()
      }
    })

    expect(result.count).toBe(3)
    expect(result.titles).toEqual(['Source A', 'Source B', 'Source C'])
  })
})

test.describe('Browser API: Tag Indexing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('API-05: createNote indexes tags automatically', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Create note with tags
      const note = await browserApi.createNote({
        title: 'Tagged Note',
        content: 'Has #research and #important tags'
      })

      // Get tags for this note
      const tags = await browserApi.getNoteTags(note.id)

      return {
        tagCount: tags.length,
        tagNames: tags.map(t => t.name).sort()
      }
    })

    expect(result.tagCount).toBe(2)
    expect(result.tagNames).toContain('research')
    expect(result.tagNames).toContain('important')
  })

  test('API-06: updateNote reindexes tags when content changes', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Create note without tags
      const note = await browserApi.createNote({
        title: 'Note',
        content: 'No tags initially'
      })

      // Verify no tags initially
      let tags = await browserApi.getNoteTags(note.id)
      const initialCount = tags.length

      // Update to add tags
      await browserApi.updateNote(note.id, {
        content: 'Now has #sprint30 and #testing tags'
      })

      // Verify tags appear
      tags = await browserApi.getNoteTags(note.id)

      return {
        initialCount,
        finalCount: tags.length,
        tagNames: tags.map(t => t.name).sort()
      }
    })

    expect(result.initialCount).toBe(0)
    expect(result.finalCount).toBe(2)
    expect(result.tagNames).toContain('sprint30')
    expect(result.tagNames).toContain('testing')
  })
})

test.describe('Browser API: Batch Reindexing', () => {
  test('API-07: reindexAllNotes processes existing notes on init', async ({ page }) => {
    // First, create notes by directly inserting into DB (bypass indexing)
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.evaluate(async () => {
      const db = (window as any).scribeDb
      if (!db) throw new Error('Database not available')

      // Clear existing data
      await db.notes.clear()
      await db.noteLinks.clear()
      await db.noteTags.clear()

      // Add notes directly (simulating old data without indexing)
      await db.notes.add({
        id: 'manual-target',
        title: 'Manual Target',
        content: 'Target content',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: 'manual target target content'
      })

      await db.notes.add({
        id: 'manual-source',
        title: 'Manual Source',
        content: 'Links to [[Manual Target]] with #manual tag',
        folder: 'inbox',
        project_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        deleted_at: null,
        search_text: 'manual source links to manual target'
      })
    })

    // Reload page to trigger reindexing
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Wait for reindexing

    // Verify indexing happened
    const result = await page.evaluate(async () => {
      const { browserApi } = await import('./src/renderer/src/lib/browser-api')

      // Get notes
      const target = await browserApi.getNote('manual-target')
      if (!target) throw new Error('Target not found')

      // Check backlinks
      const backlinks = await browserApi.getBacklinks(target.id)

      // Check tags
      const source = await browserApi.getNote('manual-source')
      if (!source) throw new Error('Source not found')

      const tags = await browserApi.getNoteTags(source.id)

      return {
        backlinksCount: backlinks.length,
        backlinkTitles: backlinks.map(n => n.title),
        tagsCount: tags.length,
        tagNames: tags.map(t => t.name)
      }
    })

    expect(result.backlinksCount).toBe(1)
    expect(result.backlinkTitles).toContain('Manual Source')
    expect(result.tagsCount).toBe(1)
    expect(result.tagNames).toContain('manual')
  })
})
