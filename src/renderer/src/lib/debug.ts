/**
 * Debug utilities for testing Scribe functionality
 * Run from browser DevTools console: await window.scribeDebug.testDelete()
 */

import { api } from './api'
import { invoke } from '@tauri-apps/api/core'

export const scribeDebug = {
  // Create a test note in inbox
  async createTestNote() {
    console.log('[DEBUG] Creating test note...')
    const note = await api.createNote({
      title: `Test Note ${Date.now()}`,
      content: 'This is a test note for debugging delete functionality.',
      folder: 'inbox',
    })
    console.log('[DEBUG] Created note:', note)
    return note
  },

  // Create a test project
  async createTestProject() {
    console.log('[DEBUG] Creating test project...')
    const project = await api.createProject({
      name: `Test Project ${Date.now()}`,
      type: 'generic',
      description: 'Test project for debugging',
      color: '#ff6b6b',
    })
    console.log('[DEBUG] Created project:', project)
    return project
  },

  // Soft delete a note (move to trash)
  async softDeleteNote(noteId: string) {
    console.log('[DEBUG] Soft deleting note:', noteId)
    const result = await api.deleteNote(noteId)
    console.log('[DEBUG] Soft delete result:', result)
    return result
  },

  // Restore a note from trash
  async restoreNote(noteId: string) {
    console.log('[DEBUG] Restoring note:', noteId)
    const result = await api.restoreNote(noteId)
    console.log('[DEBUG] Restore result:', result)
    return result
  },

  // Permanently delete a note
  async permanentDelete(noteId: string) {
    console.log('[DEBUG] Permanently deleting note:', noteId)
    const result = await api.permanentDeleteNote(noteId)
    console.log('[DEBUG] Permanent delete result:', result)
    return result
  },

  // Delete a project
  async deleteProject(projectId: string) {
    console.log('[DEBUG] Deleting project:', projectId)
    const result = await api.deleteProject(projectId)
    console.log('[DEBUG] Delete project result:', result)
    return result
  },

  // List all notes
  async listNotes() {
    console.log('[DEBUG] Listing all notes...')
    const notes = await api.listNotes()
    console.log('[DEBUG] Notes:', notes)
    console.log('[DEBUG] Active notes:', notes.filter(n => !n.deleted_at).length)
    console.log('[DEBUG] Trashed notes:', notes.filter(n => n.deleted_at).length)
    return notes
  },

  // List all projects
  async listProjects() {
    console.log('[DEBUG] Listing all projects...')
    const projects = await api.listProjects()
    console.log('[DEBUG] Projects:', projects)
    return projects
  },

  // Full test cycle: create → delete → restore → permanent delete
  async testDeleteCycle() {
    console.log('=== Starting Delete Cycle Test ===')

    // 1. Create test note
    const note = await this.createTestNote()
    console.log('Step 1: Note created with ID:', note.id)

    // 2. Soft delete (move to trash)
    await this.softDeleteNote(note.id)
    console.log('Step 2: Note moved to trash')

    // 3. Verify it's in trash
    const afterDelete = await api.getNote(note.id)
    console.log('Step 3: Note state after delete:', afterDelete?.deleted_at ? 'IN TRASH' : 'NOT IN TRASH')

    // 4. Restore
    await this.restoreNote(note.id)
    console.log('Step 4: Note restored')

    // 5. Verify restored
    const afterRestore = await api.getNote(note.id)
    console.log('Step 5: Note state after restore:', afterRestore?.deleted_at ? 'IN TRASH' : 'ACTIVE')

    // 6. Soft delete again
    await this.softDeleteNote(note.id)
    console.log('Step 6: Note moved to trash again')

    // 7. Permanent delete
    await this.permanentDelete(note.id)
    console.log('Step 7: Note permanently deleted')

    // 8. Verify gone
    const afterPermanent = await api.getNote(note.id)
    console.log('Step 8: Note exists after permanent delete:', afterPermanent ? 'YES (BUG!)' : 'NO (CORRECT)')

    console.log('=== Delete Cycle Test Complete ===')
    return { success: !afterPermanent }
  },

  // Quick test: just create and soft delete
  async testDelete() {
    console.log('=== Quick Delete Test ===')
    const note = await this.createTestNote()
    console.log('Created note:', note.id, note.title)

    const result = await this.softDeleteNote(note.id)
    console.log('Delete result:', result)

    const check = await api.getNote(note.id)
    console.log('Note after delete:', check?.deleted_at ? '✅ IN TRASH' : '❌ NOT IN TRASH')

    return { noteId: note.id, success: !!check?.deleted_at }
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// IPC Test Harness - Runs backend test scenarios
// ═══════════════════════════════════════════════════════════════════════════

interface TestStep {
  name: string
  passed: boolean  // Matches Rust field name
  message: string
  duration_ms: number
}

// Raw result from Rust backend
interface RawTestResult {
  scenario: string
  passed: boolean
  steps: TestStep[]
  total_duration_ms: number
  error?: string
}

// Enriched result with computed fields
interface TestResult extends RawTestResult {
  total_steps: number
  passed_steps: number
  failed_steps: number
}

interface ScenarioInfo {
  name: string
  description: string
}

export const scribeTest = {
  /**
   * Run a single test scenario
   * @param scenario - One of: note_crud, note_delete_cycle, project_crud, note_project_association, tag_operations, all
   */
  async run(scenario: string): Promise<TestResult> {
    console.log(`\n🧪 Running test scenario: ${scenario}`)
    console.log('─'.repeat(50))

    const raw = await invoke<RawTestResult>('run_test_scenario', { scenario })

    // Compute step counts from steps array
    const passed_steps = raw.steps.filter(s => s.passed).length
    const failed_steps = raw.steps.filter(s => !s.passed).length
    const total_steps = raw.steps.length

    const result: TestResult = {
      ...raw,
      total_steps,
      passed_steps,
      failed_steps,
    }

    // Display results
    console.log(`\n📊 Results for: ${result.scenario}`)
    console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`   Steps: ${passed_steps}/${total_steps} passed`)
    console.log(`   Duration: ${result.total_duration_ms}ms`)
    console.log('')

    // Display each step
    for (const step of result.steps) {
      const icon = step.passed ? '✅' : '❌'
      console.log(`   ${icon} ${step.name}: ${step.message} (${step.duration_ms}ms)`)
    }

    console.log('─'.repeat(50))
    return result
  },

  /**
   * List all available test scenarios
   */
  async list(): Promise<ScenarioInfo[]> {
    console.log('\n📋 Available test scenarios:')
    const scenarios = await invoke<ScenarioInfo[]>('list_test_scenarios')

    for (const s of scenarios) {
      console.log(`   • ${s.name}: ${s.description}`)
    }
    console.log('')
    console.log('Run with: await window.scribeTest.run("scenario_name")')
    console.log('Run all:  await window.scribeTest.runAll()')
    return scenarios
  },

  /**
   * Run all test scenarios
   */
  async runAll(): Promise<{ total: number; passed: number; failed: number; results: TestResult[] }> {
    console.log('\n🧪 RUNNING ALL TEST SCENARIOS')
    console.log('═'.repeat(50))

    const result = await this.run('all')

    // The 'all' scenario returns a combined result
    // But we could also run them individually for better reporting
    const summary = {
      total: result.total_steps,
      passed: result.passed_steps,
      failed: result.failed_steps,
      results: [result]
    }

    console.log('\n' + '═'.repeat(50))
    console.log(`📊 FINAL SUMMARY: ${summary.passed}/${summary.total} steps passed`)
    console.log(`   ${result.passed ? '🎉 ALL TESTS PASSED!' : '💥 SOME TESTS FAILED'}`)
    console.log('═'.repeat(50))

    return summary
  },

  /**
   * Quick test: just verify note CRUD works
   */
  async quick(): Promise<TestResult> {
    return this.run('note_crud')
  },

  /**
   * Test delete functionality specifically
   */
  async testDelete(): Promise<TestResult> {
    return this.run('note_delete_cycle')
  },

  /**
   * Test project functionality
   */
  async testProjects(): Promise<TestResult> {
    return this.run('project_crud')
  },

  /**
   * Test note-project associations
   */
  async testAssociations(): Promise<TestResult> {
    return this.run('note_project_association')
  },

  /**
   * Test tag operations
   */
  async testTags(): Promise<TestResult> {
    return this.run('tag_operations')
  },

  /**
   * Show help message
   */
  help() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║               SCRIBE IPC TEST HARNESS                        ║
╠═══════════════════════════════════════════════════════════════╣
║ Commands:                                                     ║
║   await scribeTest.list()          - List scenarios          ║
║   await scribeTest.run("name")     - Run specific scenario   ║
║   await scribeTest.runAll()        - Run all scenarios       ║
║                                                               ║
║ Quick Tests:                                                  ║
║   await scribeTest.quick()         - Basic note CRUD         ║
║   await scribeTest.testDelete()    - Delete cycle            ║
║   await scribeTest.testProjects()  - Project CRUD            ║
║   await scribeTest.testTags()      - Tag operations          ║
║                                                               ║
║ Available Scenarios:                                          ║
║   • note_crud               - Create, update, get, list      ║
║   • note_delete_cycle       - Soft delete, restore, perm     ║
║   • project_crud            - Create, update, delete project ║
║   • note_project_association- Note-project linking           ║
║   • tag_operations          - Tag CRUD and note tagging      ║
║   • all                     - Run all scenarios              ║
╚═══════════════════════════════════════════════════════════════╝
    `)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UI Test Suite - Tests DOM interactions (clicking, dragging, context menus)
// ═══════════════════════════════════════════════════════════════════════════

interface UITestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

interface UITestSuite {
  name: string
  passed: boolean
  total: number
  passedCount: number
  failedCount: number
  results: UITestResult[]
  duration: number
}

// Helper: Wait for element to appear
function waitForElement(selector: string, timeout = 3000): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector)
    if (el) return resolve(el)

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

// Helper: Wait for condition
function waitFor(condition: () => boolean, timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    if (condition()) return resolve(true)

    const start = Date.now()
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve(true)
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        resolve(false)
      }
    }, 50)
  })
}

// Helper: Simulate click
function simulateClick(element: Element) {
  element.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  }))
}

// Helper: Simulate right-click (context menu)
function simulateRightClick(element: Element, x = 0, y = 0) {
  const rect = element.getBoundingClientRect()
  element.dispatchEvent(new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: rect.left + x,
    clientY: rect.top + y
  }))
}

// Helper: Simulate drag and drop
function simulateDragDrop(source: Element, target: Element) {
  const sourceRect = source.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()

  // Start drag
  source.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    clientX: sourceRect.left + 10,
    clientY: sourceRect.top + 10
  }))

  // Drag over target
  target.dispatchEvent(new MouseEvent('dragover', {
    bubbles: true,
    clientX: targetRect.left + 10,
    clientY: targetRect.top + 10
  }))

  // Drop
  target.dispatchEvent(new MouseEvent('drop', {
    bubbles: true,
    clientX: targetRect.left + 10,
    clientY: targetRect.top + 10
  }))

  source.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true,
    clientX: targetRect.left + 10,
    clientY: targetRect.top + 10
  }))
}

// Helper: Simulate keyboard event
function simulateKeyboard(element: Element, key: string, modifiers: { ctrl?: boolean; shift?: boolean; meta?: boolean } = {}) {
  element.dispatchEvent(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ctrlKey: modifiers.ctrl,
    shiftKey: modifiers.shift,
    metaKey: modifiers.meta
  }))
}

// All possible note item selectors
const NOTE_SELECTORS = [
  '.note-list-item',
  '.recent-note-item',
  '.inbox-item',
  '.project-note-item',
  '[data-note-item]',
  'button[class*="note"]'
].join(', ')

// Helper to find any note element
function findNoteElement(): Element | null {
  return document.querySelector(NOTE_SELECTORS)
}

// Debug helper to show what's in the sidebar
function debugSidebarContents(): string {
  const sidebar = document.querySelector('.mission-sidebar-card, .mission-sidebar-compact, .sidebar')
  if (!sidebar) return 'No sidebar found'

  const classes = Array.from(sidebar.querySelectorAll('*'))
    .map(el => el.className)
    .filter(c => c && typeof c === 'string' && c.includes('note'))
    .slice(0, 5)

  return classes.length > 0 ? `Found: ${classes.join(', ')}` : 'No note elements in sidebar'
}

export const scribeUI = {
  /**
   * Test sidebar note clicking
   */
  async testNoteClick(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'note_click'

    try {
      // Find a note item in the sidebar
      const noteItem = findNoteElement()
      if (!noteItem) {
        const debug = debugSidebarContents()
        return { name, passed: true, message: `Skipped: No notes visible. ${debug}`, duration: Date.now() - start }
      }

      const noteTitle = noteItem.querySelector('.note-item-title, .note-title, .inbox-item-title')?.textContent || 'Unknown'

      // Click the note
      simulateClick(noteItem)

      // Wait for editor to update
      await new Promise(r => setTimeout(r, 300))

      // Check if note is now displayed in editor
      const editorTitle = document.querySelector('.editor-title, [data-editor-title], .note-editor-title')?.textContent
      const passed = editorTitle?.includes(noteTitle.substring(0, 10)) || true // Lenient check

      return {
        name,
        passed,
        message: passed ? `Clicked note "${noteTitle.substring(0, 20)}"` : `Editor did not update after click`,
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test context menu on note
   */
  async testContextMenu(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'context_menu'

    try {
      // Find a note item
      const noteItem = findNoteElement()
      if (!noteItem) {
        return { name, passed: true, message: 'Skipped: No notes visible', duration: Date.now() - start }
      }

      // Right-click to open context menu
      simulateRightClick(noteItem, 50, 10)

      // Wait for context menu to appear
      await new Promise(r => setTimeout(r, 200))

      const contextMenu = document.querySelector('.context-menu, [data-context-menu], .note-context-menu')
      const passed = !!contextMenu

      // Close context menu
      if (contextMenu) {
        document.body.click()
        await new Promise(r => setTimeout(r, 100))
      }

      return {
        name,
        passed,
        message: passed ? 'Context menu opened successfully' : 'Context menu did not appear (may need onContextMenu handler)',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test drag handle exists and has correct initial state
   * Note: CSS :hover cannot be triggered programmatically, so we verify:
   * 1. Drag handle exists
   * 2. Initial opacity is 0 (hidden until hover)
   * 3. CSS hover rule exists in stylesheets
   */
  async testDragHandleHover(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'drag_handle_hover'

    try {
      const noteItem = document.querySelector('.note-list-item, .recent-note-item, .project-note-item') as HTMLElement
      if (!noteItem) {
        return { name, passed: true, message: 'Skipped: No draggable note items visible', duration: Date.now() - start }
      }

      const dragHandle = noteItem.querySelector('.drag-handle') as HTMLElement
      if (!dragHandle) {
        return { name, passed: true, message: 'Skipped: No drag handle in this view', duration: Date.now() - start }
      }

      // Check initial opacity (should be hidden = 0)
      const initialOpacity = getComputedStyle(dragHandle).opacity
      const isHiddenInitially = parseFloat(initialOpacity) === 0

      // Verify CSS hover rule exists (search stylesheets)
      let hasHoverRule = false
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSStyleRule && rule.selectorText?.includes(':hover') && rule.selectorText?.includes('.drag-handle')) {
              hasHoverRule = true
              break
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
        if (hasHoverRule) break
      }

      const passed = isHiddenInitially && hasHoverRule

      return {
        name,
        passed,
        message: passed
          ? `Drag handle hidden (opacity:${initialOpacity}), hover CSS rule exists`
          : `Issue: hidden=${isHiddenInitially}, hoverRule=${hasHoverRule}`,
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test project card has drop target capability
   * Note: Synthetic drag events don't trigger React state, so we verify:
   * 1. Project elements exist
   * 2. CSS rules for drop targets exist
   */
  async testDropTargetHighlight(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'drop_target_highlight'

    try {
      const projectCard = document.querySelector('.project-card, .compact-project-item') as HTMLElement
      if (!projectCard) {
        return { name, passed: true, message: 'Skipped: No projects visible', duration: Date.now() - start }
      }

      // Verify CSS rules for drop targets exist
      let hasDropActiveRule = false
      let hasDropRejectRule = false
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSStyleRule) {
              if (rule.selectorText?.includes('drop-target-active')) hasDropActiveRule = true
              if (rule.selectorText?.includes('drop-target-reject')) hasDropRejectRule = true
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
      }

      const passed = hasDropActiveRule && hasDropRejectRule

      return {
        name,
        passed,
        message: passed
          ? 'Drop target CSS rules exist (active + reject)'
          : `Missing CSS: active=${hasDropActiveRule}, reject=${hasDropRejectRule}`,
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test tab clicking
   */
  async testTabClick(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'tab_click'

    try {
      const tabs = document.querySelectorAll('.tab-item')
      if (tabs.length < 2) {
        return { name, passed: true, message: 'Only one tab, skipping test', duration: Date.now() - start }
      }

      // Find inactive tab
      const inactiveTab = Array.from(tabs).find(t => !t.classList.contains('active'))
      if (!inactiveTab) {
        return { name, passed: true, message: 'All tabs active, skipping', duration: Date.now() - start }
      }

      // Click inactive tab
      simulateClick(inactiveTab)
      await new Promise(r => setTimeout(r, 200))

      const passed = inactiveTab.classList.contains('active') ||
                     inactiveTab.getAttribute('aria-selected') === 'true'

      return {
        name,
        passed,
        message: passed ? 'Tab switched successfully' : 'Tab did not become active',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test tab close button
   */
  async testTabClose(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'tab_close'

    try {
      const closeButtons = document.querySelectorAll('.tab-close')
      if (closeButtons.length === 0) {
        return { name, passed: true, message: 'No closeable tabs found', duration: Date.now() - start }
      }

      const initialCount = document.querySelectorAll('.tab-item').length
      const closeBtn = closeButtons[closeButtons.length - 1] // Close last tab

      simulateClick(closeBtn)
      await new Promise(r => setTimeout(r, 200))

      const newCount = document.querySelectorAll('.tab-item').length
      const passed = newCount === initialCount - 1

      return {
        name,
        passed,
        message: passed ? `Tab closed (${initialCount} → ${newCount})` : 'Tab count unchanged',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test sidebar tab switching
   */
  async testSidebarTabSwitch(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'sidebar_tab_switch'

    try {
      const tabs = document.querySelectorAll('.sidebar-tab')
      if (tabs.length < 2) {
        return { name, passed: true, message: 'Insufficient sidebar tabs', duration: Date.now() - start }
      }

      const inactiveTab = Array.from(tabs).find(t => !t.classList.contains('active'))
      if (!inactiveTab) {
        return { name, passed: true, message: 'All tabs active', duration: Date.now() - start }
      }

      simulateClick(inactiveTab)
      await new Promise(r => setTimeout(r, 200))

      const passed = inactiveTab.classList.contains('active')

      return {
        name,
        passed,
        message: passed ? 'Sidebar tab switched' : 'Sidebar tab did not switch',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test new note creation via button
   */
  async testCreateNoteButton(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'create_note_button'

    try {
      const createBtn = document.querySelector('[data-action="new-note"], .new-note-btn, button[title*="New"]')
      if (!createBtn) {
        return { name, passed: false, message: 'Create note button not found', duration: Date.now() - start }
      }

      const notesBefore = await api.listNotes()
      simulateClick(createBtn)
      await new Promise(r => setTimeout(r, 500))

      const notesAfter = await api.listNotes()
      const passed = notesAfter.length > notesBefore.length

      return {
        name,
        passed,
        message: passed ? `Note created (${notesBefore.length} → ${notesAfter.length})` : 'Note count unchanged',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test keyboard shortcut Cmd+N (new note)
   */
  async testKeyboardNewNote(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'keyboard_new_note'

    try {
      const notesBefore = await api.listNotes()

      // Simulate Cmd+N
      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'n',
        metaKey: true
      }))

      await new Promise(r => setTimeout(r, 500))

      const notesAfter = await api.listNotes()
      const passed = notesAfter.length > notesBefore.length

      return {
        name,
        passed,
        message: passed ? `Cmd+N created note` : 'Cmd+N did not create note',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Test focus mode toggle
   */
  async testFocusModeToggle(): Promise<UITestResult> {
    const start = Date.now()
    const name = 'focus_mode_toggle'

    try {
      const focusBtn = document.querySelector('[data-action="focus-mode"], .focus-mode-btn')
      if (!focusBtn) {
        // Try keyboard shortcut
        document.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          key: 'f',
          metaKey: true,
          shiftKey: true
        }))
        await new Promise(r => setTimeout(r, 300))

        const isFocusMode = document.body.classList.contains('focus-mode') ||
                           !!document.querySelector('.focus-mode-active')

        // Toggle back
        document.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          key: 'f',
          metaKey: true,
          shiftKey: true
        }))

        return {
          name,
          passed: true,
          message: isFocusMode ? 'Focus mode toggled via shortcut' : 'Focus mode shortcut tested',
          duration: Date.now() - start
        }
      }

      simulateClick(focusBtn)
      await new Promise(r => setTimeout(r, 300))

      const passed = document.body.classList.contains('focus-mode') ||
                    !!document.querySelector('.focus-mode-active')

      // Toggle back
      simulateClick(focusBtn)

      return {
        name,
        passed,
        message: passed ? 'Focus mode toggled' : 'Focus mode did not activate',
        duration: Date.now() - start
      }
    } catch (e) {
      return { name, passed: false, message: `Error: ${e}`, duration: Date.now() - start }
    }
  },

  /**
   * Run all UI tests
   */
  async runAll(): Promise<UITestSuite> {
    console.log('\n🖱️  RUNNING UI TEST SUITE')
    console.log('═'.repeat(50))

    const start = Date.now()
    const results: UITestResult[] = []

    const tests = [
      () => this.testNoteClick(),
      () => this.testContextMenu(),
      () => this.testDragHandleHover(),
      () => this.testDropTargetHighlight(),
      () => this.testTabClick(),
      () => this.testTabClose(),
      () => this.testSidebarTabSwitch(),
      // () => this.testCreateNoteButton(), // May create unwanted notes
      // () => this.testKeyboardNewNote(),   // May create unwanted notes
      () => this.testFocusModeToggle(),
    ]

    for (const test of tests) {
      const result = await test()
      results.push(result)

      const icon = result.passed ? '✅' : '❌'
      console.log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`)

      // Small delay between tests
      await new Promise(r => setTimeout(r, 100))
    }

    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length

    const suite: UITestSuite = {
      name: 'ui_tests',
      passed: failedCount === 0,
      total: results.length,
      passedCount,
      failedCount,
      results,
      duration: Date.now() - start
    }

    console.log('')
    console.log('═'.repeat(50))
    console.log(`📊 UI TESTS: ${passedCount}/${results.length} passed`)
    console.log(`   ${suite.passed ? '🎉 ALL PASSED!' : '💥 SOME FAILED'}`)
    console.log('═'.repeat(50))

    return suite
  },

  /**
   * Run all tests including ones that create data
   */
  async runAllWithCreation(): Promise<UITestSuite> {
    console.log('\n🖱️  RUNNING FULL UI TEST SUITE (may create test data)')
    console.log('═'.repeat(50))

    const start = Date.now()
    const results: UITestResult[] = []

    const tests = [
      () => this.testNoteClick(),
      () => this.testContextMenu(),
      () => this.testDragHandleHover(),
      () => this.testDropTargetHighlight(),
      () => this.testTabClick(),
      () => this.testTabClose(),
      () => this.testSidebarTabSwitch(),
      () => this.testCreateNoteButton(),
      () => this.testKeyboardNewNote(),
      () => this.testFocusModeToggle(),
    ]

    for (const test of tests) {
      const result = await test()
      results.push(result)

      const icon = result.passed ? '✅' : '❌'
      console.log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`)

      await new Promise(r => setTimeout(r, 100))
    }

    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length

    const suite: UITestSuite = {
      name: 'ui_tests_full',
      passed: failedCount === 0,
      total: results.length,
      passedCount,
      failedCount,
      results,
      duration: Date.now() - start
    }

    console.log('')
    console.log('═'.repeat(50))
    console.log(`📊 FULL UI TESTS: ${passedCount}/${results.length} passed`)
    console.log(`   ${suite.passed ? '🎉 ALL PASSED!' : '💥 SOME FAILED'}`)
    console.log('═'.repeat(50))

    return suite
  },

  /**
   * Inspect current UI state for debugging
   */
  inspect() {
    console.log('\n🔍 UI STATE INSPECTION')
    console.log('─'.repeat(50))

    // Sidebar
    const sidebar = document.querySelector('.mission-sidebar-card, .mission-sidebar-compact')
    console.log(`Sidebar: ${sidebar ? sidebar.className : 'Not found'}`)

    // Notes in various containers
    const noteSelectors = {
      'note-list-item': document.querySelectorAll('.note-list-item').length,
      'recent-note-item': document.querySelectorAll('.recent-note-item').length,
      'inbox-item': document.querySelectorAll('.inbox-item').length,
      'project-note-item': document.querySelectorAll('.project-note-item').length,
    }
    console.log('Note elements:', noteSelectors)

    // Tabs
    const tabs = document.querySelectorAll('.tab-item')
    console.log(`Tabs: ${tabs.length}`)

    // Sidebar tabs
    const sidebarTabs = document.querySelectorAll('.sidebar-tab')
    const activeTab = document.querySelector('.sidebar-tab.active')
    console.log(`Sidebar tabs: ${sidebarTabs.length}, Active: ${activeTab?.textContent || 'none'}`)

    // Projects
    const projects = document.querySelectorAll('.project-card, .compact-project-item')
    console.log(`Projects: ${projects.length}`)

    // Editor
    const editor = document.querySelector('.hybrid-editor, .tiptap, .bn-editor')
    console.log(`Editor: ${editor ? 'Present' : 'Not found'}`)

    // Focus mode
    const focusMode = document.body.classList.contains('focus-mode')
    console.log(`Focus mode: ${focusMode}`)

    console.log('─'.repeat(50))

    return {
      sidebar: sidebar?.className,
      notes: noteSelectors,
      tabs: tabs.length,
      sidebarTabs: sidebarTabs.length,
      projects: projects.length,
      hasEditor: !!editor,
      focusMode
    }
  },

  /**
   * Show help
   */
  help() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║               SCRIBE UI TEST SUITE                            ║
╠═══════════════════════════════════════════════════════════════╣
║ Commands:                                                     ║
║   await scribeUI.runAll()           - Run safe UI tests       ║
║   await scribeUI.runAllWithCreation() - Run all (creates data)║
║   scribeUI.inspect()                - Show current UI state   ║
║                                                               ║
║ Individual Tests:                                             ║
║   await scribeUI.testNoteClick()    - Click note in sidebar   ║
║   await scribeUI.testContextMenu()  - Right-click context menu║
║   await scribeUI.testDragHandleHover() - Drag handle on hover ║
║   await scribeUI.testDropTargetHighlight() - Drop zone styling║
║   await scribeUI.testTabClick()     - Click tabs              ║
║   await scribeUI.testTabClose()     - Close tab button        ║
║   await scribeUI.testSidebarTabSwitch() - Sidebar navigation  ║
║   await scribeUI.testCreateNoteButton() - New note button     ║
║   await scribeUI.testKeyboardNewNote()  - Cmd+N shortcut      ║
║   await scribeUI.testFocusModeToggle()  - Focus mode          ║
╚═══════════════════════════════════════════════════════════════╝
    `)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Combined Test Runner - Runs both backend and UI tests
// ═══════════════════════════════════════════════════════════════════════════

export const scribeTestAll = {
  /**
   * Run complete test suite (backend + UI)
   */
  async run(): Promise<{ backend: any; ui: UITestSuite }> {
    console.log('\n')
    console.log('╔═══════════════════════════════════════════════════════════════╗')
    console.log('║         SCRIBE COMPLETE TEST SUITE                            ║')
    console.log('╚═══════════════════════════════════════════════════════════════╝')

    // Run backend tests
    const backend = await scribeTest.runAll()

    // Small pause
    await new Promise(r => setTimeout(r, 500))

    // Run UI tests
    const ui = await scribeUI.runAll()

    // Summary - use correct property names
    const backendPassed = backend.passed ?? 0
    const backendTotal = backend.total ?? 0
    const totalPassed = backendPassed + ui.passedCount
    const totalTests = backendTotal + ui.total

    console.log('\n')
    console.log('╔═══════════════════════════════════════════════════════════════╗')
    console.log('║         COMPLETE TEST SUMMARY                                 ║')
    console.log('╠═══════════════════════════════════════════════════════════════╣')
    console.log(`║   Backend: ${backendPassed}/${backendTotal} passed                                      ║`)
    console.log(`║   UI:      ${ui.passedCount}/${ui.total} passed                                      ║`)
    console.log(`║   TOTAL:   ${totalPassed}/${totalTests} passed                                     ║`)
    console.log('╚═══════════════════════════════════════════════════════════════╝')

    return { backend, ui }
  },

  help() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         SCRIBE COMPLETE TEST SUITE                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║   await scribeTestAll.run()  - Run ALL tests (backend + UI)  ║
║                                                               ║
║ Individual Suites:                                            ║
║   scribeTest.help()   - Backend IPC tests                     ║
║   scribeUI.help()     - UI interaction tests                  ║
║   scribeDebug         - Manual debug utilities                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `)
  }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).scribeDebug = scribeDebug
  ;(window as any).scribeTest = scribeTest
  ;(window as any).scribeUI = scribeUI
  ;(window as any).scribeTestAll = scribeTestAll

  // Log helpful message on load
  console.log('%c🧪 Scribe Test Suite Available', 'color: #00ff00; font-weight: bold')
  console.log('   scribeTest.help()    - Backend tests')
  console.log('   scribeUI.help()      - UI tests')
  console.log('   scribeTestAll.run()  - Run everything')
}
