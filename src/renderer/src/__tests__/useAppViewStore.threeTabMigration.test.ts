import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * v1.16.0 -> v1.17.0 Migration Tests
 *
 * migrateToThreeTabSidebar() is a module-load side effect, not an exported
 * function (same as the existing migrateToIconCentric) - it can't be
 * imported and called directly. Following the vi.resetModules() + dynamic
 * import pattern already established in Platform.test.ts: set up
 * localStorage first, then freshly import the store module so its
 * top-level migration call actually re-runs against that state.
 *
 * See docs/specs/SPEC-three-tab-sidebar-2026-01-10.md Section 13.3 - this
 * covers the same scenarios via the real (non-exported) migration path
 * rather than spec's example of calling migrateToThreeTabSidebar()
 * directly, which the actual code does not expose.
 */

describe('v1.16.0 -> v1.17.0 Migration', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('migrates preferredMode to activeTab for vaults', async () => {
    localStorage.setItem('scribe:pinnedVaults', JSON.stringify([
      { id: 'inbox', label: 'Inbox', order: 0, isPermanent: true, preferredMode: 'card' }
    ]))

    await import('../store/useAppViewStore')

    const vaults = JSON.parse(localStorage.getItem('scribe:pinnedVaults') || '[]')
    expect(vaults[0].activeTab).toBe('card')
    expect(vaults[0].preferredMode).toBeUndefined()
  })

  it('migrates preferredMode to activeTab for smart icons', async () => {
    localStorage.setItem('scribe:smartIcons', JSON.stringify([
      { id: 'research', label: 'Research', order: 0, isVisible: true, isExpanded: false, preferredMode: 'card' }
    ]))

    await import('../store/useAppViewStore')

    const icons = JSON.parse(localStorage.getItem('scribe:smartIcons') || '[]')
    expect(icons[0].activeTab).toBe('card')
    expect(icons[0].preferredMode).toBeUndefined()
  })

  it('defaults activeTab to compact when preferredMode was absent', async () => {
    localStorage.setItem('scribe:pinnedVaults', JSON.stringify([
      { id: 'inbox', label: 'Inbox', order: 0, isPermanent: true }
    ]))

    await import('../store/useAppViewStore')

    const vaults = JSON.parse(localStorage.getItem('scribe:pinnedVaults') || '[]')
    expect(vaults[0].activeTab).toBe('compact')
  })

  it('adds explorerModeWidth with the default from SIDEBAR_WIDTHS', async () => {
    const { SIDEBAR_WIDTHS } = await import('../store/useAppViewStore')
    expect(localStorage.getItem('scribe:explorerModeWidth')).toBe(String(SIDEBAR_WIDTHS.explorer.default))
  })

  it('bumps cardModeWidth from 320 to 360 when it was still at the old default', async () => {
    localStorage.setItem('scribe:cardModeWidth', '320')

    await import('../store/useAppViewStore')

    expect(localStorage.getItem('scribe:cardModeWidth')).toBe('360')
  })

  it('leaves a non-default cardModeWidth untouched', async () => {
    localStorage.setItem('scribe:cardModeWidth', '450')

    await import('../store/useAppViewStore')

    expect(localStorage.getItem('scribe:cardModeWidth')).toBe('450')
  })

  it('initializes explorerTreeState to an empty node set', async () => {
    await import('../store/useAppViewStore')

    const stored = JSON.parse(localStorage.getItem('scribe:explorerTreeState') || '{}')
    expect(stored.expandedNodes).toEqual([])
  })

  it('does not re-run (or throw) when explorerModeWidth is already present', async () => {
    localStorage.setItem('scribe:explorerModeWidth', '320')
    localStorage.setItem('scribe:cardModeWidth', '320') // would bump to 360 if migration re-ran

    await import('../store/useAppViewStore')

    // cardModeWidth untouched -> confirms the migration body did not execute again
    expect(localStorage.getItem('scribe:cardModeWidth')).toBe('320')
  })

  it('does not throw when localStorage has malformed JSON for pinnedVaults', async () => {
    localStorage.setItem('scribe:pinnedVaults', '{not valid json')

    await expect(import('../store/useAppViewStore')).resolves.toBeDefined()
    // Migration's try/catch should have swallowed the parse error; explorerModeWidth
    // still gets set since that step runs before the pinnedVaults migration step
    expect(localStorage.getItem('scribe:explorerModeWidth')).toBe('320')
  })
})
