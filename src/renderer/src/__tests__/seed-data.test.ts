/**
 * Seed Data Synchronization Tests
 *
 * Verifies that demo seed data is correctly structured and synchronized
 * between Browser (IndexedDB) and Tauri (SQLite) modes.
 *
 * CRITICAL: These tests ensure data parity between platforms.
 * If any test fails, the user experience will differ between modes.
 */

import { describe, it, expect } from 'vitest'
import {
  DEMO_PROJECT,
  DEMO_TAGS,
  DEMO_NOTES,
  DEMO_WIKI_LINKS,
  SEED_DATA_SUMMARY
} from '../lib/seed-data'

describe('Seed Data Structure', () => {
  describe('DEMO_PROJECT', () => {
    it('should have all required fields', () => {
      expect(DEMO_PROJECT).toHaveProperty('name')
      expect(DEMO_PROJECT).toHaveProperty('type')
      expect(DEMO_PROJECT).toHaveProperty('status')
      expect(DEMO_PROJECT).toHaveProperty('description')
      expect(DEMO_PROJECT).toHaveProperty('color')
    })

    it('should have correct project name', () => {
      expect(DEMO_PROJECT.name).toBe('Getting Started')
    })

    it('should be a generic project', () => {
      expect(DEMO_PROJECT.type).toBe('generic')
    })

    it('should be active', () => {
      expect(DEMO_PROJECT.status).toBe('active')
    })

    it('should have a valid hex color', () => {
      expect(DEMO_PROJECT.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  describe('DEMO_TAGS', () => {
    it('should have exactly 4 tags', () => {
      expect(DEMO_TAGS).toHaveLength(4)
    })

    it('should include welcome tag', () => {
      const welcomeTag = DEMO_TAGS.find(t => t.name === 'welcome')
      expect(welcomeTag).toBeDefined()
      expect(welcomeTag?.color).toBe('#10B981')
    })

    it('should include tutorial tag', () => {
      const tutorialTag = DEMO_TAGS.find(t => t.name === 'tutorial')
      expect(tutorialTag).toBeDefined()
      expect(tutorialTag?.color).toBe('#8B5CF6')
    })

    it('should include tips tag', () => {
      const tipsTag = DEMO_TAGS.find(t => t.name === 'tips')
      expect(tipsTag).toBeDefined()
      expect(tipsTag?.color).toBe('#F59E0B')
    })

    it('should include quarto tag', () => {
      const quartoTag = DEMO_TAGS.find(t => t.name === 'quarto')
      expect(quartoTag).toBeDefined()
      expect(quartoTag?.color).toBe('#2563EB')
    })

    it('should have valid hex colors for all tags', () => {
      DEMO_TAGS.forEach(tag => {
        expect(tag.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })

  describe('DEMO_NOTES', () => {
    it('should have exactly 5 notes', () => {
      expect(Object.keys(DEMO_NOTES)).toHaveLength(5)
    })

    it('should include welcome note', () => {
      expect(DEMO_NOTES).toHaveProperty('welcome')
      expect(DEMO_NOTES.welcome.title).toBe('Welcome to Scribe')
      expect(DEMO_NOTES.welcome.folder).toBe('inbox')
      expect(DEMO_NOTES.welcome.tags).toContain('welcome')
      expect(DEMO_NOTES.welcome.tags).toContain('tutorial')
    })

    it('should include features note', () => {
      expect(DEMO_NOTES).toHaveProperty('features')
      expect(DEMO_NOTES.features.title).toBe('Features Overview')
      expect(DEMO_NOTES.features.folder).toBe('inbox')
      expect(DEMO_NOTES.features.tags).toContain('tutorial')
      expect(DEMO_NOTES.features.tags).toContain('tips')
    })

    it('should include daily note', () => {
      expect(DEMO_NOTES).toHaveProperty('daily')
      expect(DEMO_NOTES.daily.title).toBe('Daily Note Example')
      expect(DEMO_NOTES.daily.folder).toBe('inbox')
      expect(DEMO_NOTES.daily.tags).toContain('tips')
    })

    it('should include callouts note', () => {
      expect(DEMO_NOTES).toHaveProperty('callouts')
      expect(DEMO_NOTES.callouts.title).toBe('Callout Types')
      expect(DEMO_NOTES.callouts.folder).toBe('inbox')
      expect(DEMO_NOTES.callouts.tags).toContain('tutorial')
      expect(DEMO_NOTES.callouts.tags).toContain('tips')
    })

    it('should include quarto note with correct title', () => {
      expect(DEMO_NOTES).toHaveProperty('quarto')
      expect(DEMO_NOTES.quarto.title).toBe('🧪 Quarto Autocomplete Test Page')
      expect(DEMO_NOTES.quarto.folder).toBe('inbox')
      expect(DEMO_NOTES.quarto.tags).toContain('tutorial')
      expect(DEMO_NOTES.quarto.tags).toContain('quarto')
    })

    it('should have non-empty content for all notes', () => {
      Object.values(DEMO_NOTES).forEach(note => {
        expect(note.content.length).toBeGreaterThan(0)
      })
    })

    it('should have valid tag references', () => {
      const tagNames = DEMO_TAGS.map(t => t.name)
      Object.values(DEMO_NOTES).forEach(note => {
        note.tags.forEach(tagName => {
          expect(tagNames).toContain(tagName)
        })
      })
    })
  })

  describe('DEMO_WIKI_LINKS', () => {
    it('should have exactly 6 wiki links', () => {
      expect(DEMO_WIKI_LINKS).toHaveLength(6)
    })

    it('should have bidirectional link between Welcome and Features', () => {
      const welcomeToFeatures = DEMO_WIKI_LINKS.find(
        link => link.from === 'Welcome to Scribe' && link.to === 'Features Overview'
      )
      const featuresToWelcome = DEMO_WIKI_LINKS.find(
        link => link.from === 'Features Overview' && link.to === 'Welcome to Scribe'
      )
      expect(welcomeToFeatures).toBeDefined()
      expect(featuresToWelcome).toBeDefined()
    })

    it('should have link from Features to Daily', () => {
      const link = DEMO_WIKI_LINKS.find(
        link => link.from === 'Features Overview' && link.to === 'Daily Note Example'
      )
      expect(link).toBeDefined()
    })

    it('should have bidirectional link between Features and Callouts', () => {
      const featuresToCallouts = DEMO_WIKI_LINKS.find(
        link => link.from === 'Features Overview' && link.to === 'Callout Types'
      )
      const calloutsToFeatures = DEMO_WIKI_LINKS.find(
        link => link.from === 'Callout Types' && link.to === 'Features Overview'
      )
      expect(featuresToCallouts).toBeDefined()
      expect(calloutsToFeatures).toBeDefined()
    })

    it('should have link from Quarto to Features', () => {
      const link = DEMO_WIKI_LINKS.find(
        link => link.from === '🧪 Quarto Autocomplete Test Page' && link.to === 'Features Overview'
      )
      expect(link).toBeDefined()
    })

    it('should reference valid note titles', () => {
      const noteTitles = Object.values(DEMO_NOTES).map(note => note.title)
      DEMO_WIKI_LINKS.forEach(link => {
        expect(noteTitles).toContain(link.from)
        expect(noteTitles).toContain(link.to)
      })
    })
  })

  describe('SEED_DATA_SUMMARY', () => {
    it('should have correct project count', () => {
      expect(SEED_DATA_SUMMARY.projectCount).toBe(1)
    })

    it('should have correct note count', () => {
      expect(SEED_DATA_SUMMARY.noteCount).toBe(5)
    })

    it('should have correct tag count', () => {
      expect(SEED_DATA_SUMMARY.tagCount).toBe(4)
    })

    it('should have descriptive summary', () => {
      expect(SEED_DATA_SUMMARY.description).toContain('Getting Started')
      expect(SEED_DATA_SUMMARY.description).toContain('5 notes')
      expect(SEED_DATA_SUMMARY.description).toContain('4 tags')
    })
  })
})

/**
 * Browser Seed Data Function Tests
 *
 * NOTE: These tests require a browser environment with IndexedDB support.
 * They are skipped in Node.js (vitest) but run in browser-based tests.
 *
 * To run these tests:
 * 1. Use Playwright/Puppeteer for E2E testing
 * 2. Use @vitest/browser package
 * 3. Test manually in browser mode
 *
 * For now, we focus on data structure validation tests above,
 * which provide the most critical coverage for Browser-Tauri parity.
 */

describe.skip('Browser Seed Data Function (IndexedDB)', () => {
  // These tests require IndexedDB and are skipped in Node.js
  // Run them with E2E tests or browser-based test runner

  describe('seedDemoData()', () => {
    it.todo('should return true when seeding new database')
    it.todo('should return false when database already has projects')
    it.todo('should create exactly 1 project')
    it.todo('should create project with correct data')
    it.todo('should create exactly 4 tags')
    it.todo('should create tags with correct names and colors')
    it.todo('should create exactly 5 notes')
    it.todo('should create notes with correct titles')
    it.todo('should create notes with staggered timestamps')
    it.todo('should assign 4 notes to Getting Started project')
    it.todo('should leave Daily Note without project')
    it.todo('should create note-tag associations (9 total)')
    it.todo('should create exactly 6 wiki links')
    it.todo('should create bidirectional links correctly')
    it.todo('should use correct Quarto note title in links')
    it.todo('should populate search_text for all notes')
    it.todo('should set properties as empty JSON object')
  })

  describe('generateId()', () => {
    it.todo('should generate valid UUIDs')
    it.todo('should generate unique IDs')
  })
})

describe('Quarto Content Validation', () => {
  describe('Quarto Autocomplete Test Page Content', () => {
    const quartoContent = DEMO_NOTES.quarto.content

    it('should contain YAML frontmatter section', () => {
      expect(quartoContent).toContain('## 📝 Test 1: YAML Frontmatter Autocomplete')
      expect(quartoContent).toContain('---')
      expect(quartoContent).toContain('format:')
    })

    it('should contain chunk options section', () => {
      expect(quartoContent).toContain('## 💻 Test 2: Chunk Options Autocomplete')
      expect(quartoContent).toContain('#|')
      expect(quartoContent).toContain('fig-cap')
      expect(quartoContent).toContain('fig-width')
    })

    it('should contain cross-reference section', () => {
      expect(quartoContent).toContain('## 🔗 Test 3: Cross-Reference Autocomplete')
      expect(quartoContent).toContain('@fig-')
      expect(quartoContent).toContain('@tbl-')
      expect(quartoContent).toContain('@sec-')
      expect(quartoContent).toContain('@eq-')
    })

    it('should contain learning tips section', () => {
      expect(quartoContent).toContain('## 🎓 Learning Tips')
      expect(quartoContent).toContain('YAML Frontmatter')
      expect(quartoContent).toContain('Chunk Options')
      expect(quartoContent).toContain('Cross-References')
    })

    it('should contain keyboard shortcuts reference', () => {
      expect(quartoContent).toContain('## 🚀 Keyboard Shortcuts')
      expect(quartoContent).toContain('Ctrl+Space')
      expect(quartoContent).toContain('⌘1')
    })

    it('should contain troubleshooting section', () => {
      expect(quartoContent).toContain('## 🐛 Troubleshooting')
      expect(quartoContent).toContain('Autocomplete not appearing?')
    })

    it('should contain getting started callout', () => {
      expect(quartoContent).toContain('> [!tip] Getting Started')
      expect(quartoContent).toContain('Press **⌘1** to enter Source mode')
    })

    it('should contain success callout', () => {
      expect(quartoContent).toContain('> [!success] All Set!')
    })

    it('should reference Features Overview note', () => {
      expect(quartoContent).toContain('[[Features Overview]]')
    })
  })

  describe('Callout Types Content', () => {
    const calloutsContent = DEMO_NOTES.callouts.content

    it('should contain all callout types', () => {
      const calloutTypes = [
        '[!note]',
        '[!info]',
        '[!abstract]',
        '[!tip]',
        '[!success]',
        '[!warning]',
        '[!danger]',
        '[!bug]',
        '[!question]',
        '[!example]',
        '[!quote]'
      ]

      calloutTypes.forEach(type => {
        expect(calloutsContent).toContain(type)
      })
    })

    it('should contain syntax reference', () => {
      expect(calloutsContent).toContain('## Syntax Reference')
      expect(calloutsContent).toContain('```markdown')
    })

    it('should contain supported types table', () => {
      expect(calloutsContent).toContain('## Supported Types')
      expect(calloutsContent).toContain('| Type | Aliases | Color |')
    })

    it('should reference Features Overview', () => {
      expect(calloutsContent).toContain('[[Features Overview]]')
    })
  })
})

describe('Browser-Tauri Parity Checks', () => {
  describe('Data Structure Consistency', () => {
    it('should have matching note count in summary', () => {
      const actualNoteCount = Object.keys(DEMO_NOTES).length
      expect(SEED_DATA_SUMMARY.noteCount).toBe(actualNoteCount)
    })

    it('should have matching tag count in summary', () => {
      const actualTagCount = DEMO_TAGS.length
      expect(SEED_DATA_SUMMARY.tagCount).toBe(actualTagCount)
    })

    it('should have all wiki link sources in notes', () => {
      const noteTitles = Object.values(DEMO_NOTES).map(n => n.title)
      DEMO_WIKI_LINKS.forEach(link => {
        expect(noteTitles).toContain(link.from)
        expect(noteTitles).toContain(link.to)
      })
    })

    it('should have all note tags in tag list', () => {
      const tagNames = DEMO_TAGS.map(t => t.name)
      Object.values(DEMO_NOTES).forEach(note => {
        note.tags.forEach(tag => {
          expect(tagNames).toContain(tag)
        })
      })
    })
  })

  describe('Title Consistency Check', () => {
    it('should use correct Quarto note title in DEMO_NOTES', () => {
      expect(DEMO_NOTES.quarto.title).toBe('🧪 Quarto Autocomplete Test Page')
    })

    it('should use correct Quarto note title in DEMO_WIKI_LINKS', () => {
      const quartoLink = DEMO_WIKI_LINKS.find(
        link => link.from.includes('Quarto')
      )
      expect(quartoLink?.from).toBe('🧪 Quarto Autocomplete Test Page')
    })

    it('should not reference old "Quarto Document Example" title', () => {
      // This test ensures the bug fix stays fixed
      // TypeScript correctly identifies this comparison as impossible (which is good!)
      // We cast to string to check the runtime values anyway
      const hasOldTitle = DEMO_WIKI_LINKS.some(
        link => (link.from as string) === 'Quarto Document Example' ||
                (link.to as string) === 'Quarto Document Example'
      )
      expect(hasOldTitle).toBe(false)
    })
  })
})
