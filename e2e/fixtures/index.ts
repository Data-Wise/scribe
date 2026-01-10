import { test as base, expect, Page } from '@playwright/test'
import { BasePage } from '../pages/BasePage'
import { SidebarPage } from '../pages/SidebarPage'
import { EditorPage } from '../pages/EditorPage'
import { TabsPage } from '../pages/TabsPage'
import { MissionControlPage } from '../pages/MissionControlPage'
import { RightSidebarPage } from '../pages/RightSidebarPage'
import { ModalsPage } from '../pages/ModalsPage'
import { CodeMirrorHelper } from '../helpers/codemirror-helpers'

/**
 * Custom Playwright fixtures for Scribe E2E tests
 *
 * Provides pre-configured page objects for each test.
 * Usage:
 *   test('my test', async ({ basePage, sidebar, editor }) => {
 *     await basePage.goto()
 *     await sidebar.cycleMode()
 *   })
 *
 * For tests that need pre-populated data:
 *   test('with data', async ({ seededPage, sidebar }) => {
 *     // Page already has notes and projects
 *   })
 */

// Declare custom fixture types
type ScribeFixtures = {
  basePage: BasePage
  sidebar: SidebarPage
  editor: EditorPage
  tabs: TabsPage
  missionControl: MissionControlPage
  rightSidebar: RightSidebarPage
  modals: ModalsPage
  /** CodeMirror 6 editor helper for interacting with the code editor */
  cmEditor: CodeMirrorHelper
  /** Page with pre-seeded test data (notes, projects) */
  seededPage: BasePage
}

/**
 * Clear IndexedDB to ensure test isolation
 */
async function clearIndexedDB(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name)
      }
    }
  })
}

/**
 * Seed test data into IndexedDB
 */
async function seedTestData(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Wait for Dexie to be available
    const waitForDb = () => new Promise<void>((resolve) => {
      const check = () => {
        // @ts-expect-error - accessing global db
        if (window.scribeDb) {
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })

    await waitForDb()

    // @ts-expect-error - accessing global db
    const db = window.scribeDb

    // Add test project
    const testProjectId = 'test-project-1'
    await db.projects.put({
      id: testProjectId,
      name: 'Test Project',
      type: 'research',
      status: 'active',
      color: '#3b82f6',
      description: 'A test project for E2E tests',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Add test notes
    const notes = [
      {
        id: 'test-note-1',
        title: 'Test Note One',
        content: '# Test Note One\n\nThis is a test note with [[Test Note Two]] wiki link.\n\n#test #e2e',
        folder: testProjectId,
        projectId: testProjectId,
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 1800000,
      },
      {
        id: 'test-note-2',
        title: 'Test Note Two',
        content: '# Test Note Two\n\nAnother test note.\n\n#test',
        folder: testProjectId,
        projectId: testProjectId,
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 3600000,
      },
      {
        id: 'test-note-3',
        title: 'Search Target Note',
        content: '# Search Target\n\nThis note contains unique-search-term-xyz for testing search.',
        folder: testProjectId,
        projectId: testProjectId,
        createdAt: Date.now() - 10800000,
        updatedAt: Date.now() - 5400000,
      },
    ]

    for (const note of notes) {
      await db.notes.put(note)
    }

    // Add test tags
    const tags = [
      { id: 'tag-test', name: 'test', color: '#3b82f6', createdAt: Date.now() },
      { id: 'tag-e2e', name: 'e2e', color: '#10b981', createdAt: Date.now() },
    ]

    for (const tag of tags) {
      await db.tags.put(tag)
    }

    // Add note-tag relations
    await db.noteTags.bulkPut([
      { noteId: 'test-note-1', tagId: 'tag-test' },
      { noteId: 'test-note-1', tagId: 'tag-e2e' },
      { noteId: 'test-note-2', tagId: 'tag-test' },
    ])

    // Add links
    await db.links.bulkPut([
      { sourceNoteId: 'test-note-1', targetNoteId: 'test-note-2', targetTitle: 'Test Note Two' },
    ])
  })
}

// Extend the base test with our fixtures
export const test = base.extend<ScribeFixtures>({
  basePage: async ({ page }, use) => {
    // Clear any existing data for test isolation
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await clearIndexedDB(page)
    // Reload to start with fresh state
    await page.reload()
    await page.waitForLoadState('networkidle')

    const basePage = new BasePage(page)
    await use(basePage)

    // Cleanup after test
    await clearIndexedDB(page)
  },

  sidebar: async ({ page }, use) => {
    const sidebar = new SidebarPage(page)
    await use(sidebar)
  },

  editor: async ({ page }, use) => {
    const editor = new EditorPage(page)
    await use(editor)
  },

  tabs: async ({ page }, use) => {
    const tabs = new TabsPage(page)
    await use(tabs)
  },

  missionControl: async ({ page }, use) => {
    const missionControl = new MissionControlPage(page)
    await use(missionControl)
  },

  rightSidebar: async ({ page }, use) => {
    const rightSidebar = new RightSidebarPage(page)
    await use(rightSidebar)
  },

  modals: async ({ page }, use) => {
    const modals = new ModalsPage(page)
    await use(modals)
  },

  cmEditor: async ({ page }, use) => {
    const cmEditor = new CodeMirrorHelper(page)
    await use(cmEditor)
  },

  /**
   * Seeded page fixture - provides a page with pre-populated test data
   * Use this for tests that need notes/projects to exist
   */
  seededPage: async ({ page }, use) => {
    const basePage = new BasePage(page)

    // Clear and seed before navigation
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Give the app time to initialize IndexedDB
    await page.waitForTimeout(500)

    // Seed test data
    await seedTestData(page)

    // Reload to pick up seeded data
    await page.reload()
    await page.waitForLoadState('networkidle')

    await use(basePage)

    // Cleanup after test
    await clearIndexedDB(page)
  },
})

// Re-export expect for convenience
export { expect }

/**
 * Test data helpers
 */
export const testData = {
  /**
   * Generate a unique note title
   */
  uniqueNoteTitle: () => `Test Note ${Date.now()}`,

  /**
   * Generate a unique project name
   */
  uniqueProjectName: () => `Test Project ${Date.now()}`,

  /**
   * Sample markdown content
   */
  sampleContent: `# Test Note

This is a test note with some content.

## Features
- Wiki links: [[Another Note]]
- Tags: #test #e2e
- **Bold** and *italic* text

## Code
\`\`\`javascript
console.log('Hello, Scribe!')
\`\`\`
`,

  /**
   * Project types available in Scribe
   */
  projectTypes: ['research', 'teaching', 'r-package', 'r-dev', 'generic'] as const,
}
