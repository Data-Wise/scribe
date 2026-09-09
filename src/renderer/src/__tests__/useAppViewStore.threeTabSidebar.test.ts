import { describe, it, expect, beforeEach } from 'vitest'
import { useAppViewStore, SIDEBAR_WIDTHS } from '../store/useAppViewStore'

/**
 * useAppViewStore Three-Tab Sidebar Unit Tests (v1.17.0)
 *
 * Covers the actions added in Phase 3 that aren't already exercised by
 * useAppViewStore.iconExpansion.test.ts (which covers switchIconTab's
 * compact/card cases from the v1.16.0 suite it evolved from):
 * - switchIconTab: explorer tab + persistence
 * - toggleExplorerNode / expandExplorerNode / collapseExplorerNode /
 *   collapseAllExplorerNodes
 *
 * See docs/specs/SPEC-three-tab-sidebar-2026-01-10.md Section 13.1.
 */

describe('useAppViewStore - Three-Tab Sidebar (v1.17.0)', () => {
  beforeEach(() => {
    localStorage.clear()

    useAppViewStore.setState({
      expandedIcon: null,
      sidebarWidth: SIDEBAR_WIDTHS.icon,
      compactModeWidth: SIDEBAR_WIDTHS.compact.default,
      cardModeWidth: SIDEBAR_WIDTHS.card.default,
      explorerModeWidth: SIDEBAR_WIDTHS.explorer.default,
      explorerTreeState: { expandedNodes: new Set() },
      pinnedVaults: [
        { id: 'inbox', label: 'Inbox', order: 0, isPermanent: true, activeTab: 'compact' }
      ],
      smartIcons: [
        {
          id: 'research',
          label: 'Research',
          icon: 'book',
          color: '#8B5CF6',
          projectType: 'research',
          isVisible: true,
          isExpanded: false,
          order: 0,
          activeTab: 'compact'
        }
      ]
    })
  })

  describe('switchIconTab', () => {
    it('switches a vault to explorer and updates sidebarWidth to explorerModeWidth', () => {
      const { switchIconTab, expandVault } = useAppViewStore.getState()
      expandVault('inbox')

      switchIconTab('vault', 'inbox', 'explorer')

      const state = useAppViewStore.getState()
      expect(state.pinnedVaults.find(v => v.id === 'inbox')?.activeTab).toBe('explorer')
      expect(state.sidebarWidth).toBe(state.explorerModeWidth)
    })

    it('switches a smart icon to explorer and persists it', () => {
      const { switchIconTab } = useAppViewStore.getState()

      switchIconTab('smart', 'research', 'explorer')

      const stored = JSON.parse(localStorage.getItem('scribe:smartIcons') || '[]')
      const icon = stored.find((i: { id: string }) => i.id === 'research')
      expect(icon?.activeTab).toBe('explorer')
    })

    it('does not change width when switching a tab that is not currently expanded', () => {
      const { switchIconTab } = useAppViewStore.getState()
      const before = useAppViewStore.getState().sidebarWidth

      // Nothing is expanded (expandedIcon is null from beforeEach)
      switchIconTab('smart', 'research', 'explorer')

      expect(useAppViewStore.getState().sidebarWidth).toBe(before)
    })
  })

  describe('explorer tree actions', () => {
    it('toggleExplorerNode adds a collapsed project to expandedNodes', () => {
      const { toggleExplorerNode } = useAppViewStore.getState()
      toggleExplorerNode('proj-123')

      expect(useAppViewStore.getState().explorerTreeState.expandedNodes.has('proj-123')).toBe(true)
    })

    it('toggleExplorerNode removes an expanded project from expandedNodes', () => {
      const { expandExplorerNode, toggleExplorerNode } = useAppViewStore.getState()
      expandExplorerNode('proj-123')
      toggleExplorerNode('proj-123')

      expect(useAppViewStore.getState().explorerTreeState.expandedNodes.has('proj-123')).toBe(false)
    })

    it('expandExplorerNode is idempotent', () => {
      const { expandExplorerNode } = useAppViewStore.getState()
      expandExplorerNode('proj-123')
      expandExplorerNode('proj-123')

      expect(useAppViewStore.getState().explorerTreeState.expandedNodes.size).toBe(1)
    })

    it('collapseExplorerNode is a no-op when the node is already collapsed', () => {
      const { collapseExplorerNode } = useAppViewStore.getState()
      collapseExplorerNode('proj-not-expanded')

      expect(useAppViewStore.getState().explorerTreeState.expandedNodes.size).toBe(0)
    })

    it('collapseAllExplorerNodes clears every expanded node', () => {
      const { expandExplorerNode, collapseAllExplorerNodes } = useAppViewStore.getState()
      expandExplorerNode('proj-1')
      expandExplorerNode('proj-2')
      expandExplorerNode('proj-3')

      collapseAllExplorerNodes()

      expect(useAppViewStore.getState().explorerTreeState.expandedNodes.size).toBe(0)
    })

    it('persists explorerTreeState to localStorage as an array', () => {
      const { toggleExplorerNode } = useAppViewStore.getState()
      toggleExplorerNode('proj-123')

      const stored = JSON.parse(localStorage.getItem('scribe:explorerTreeState') || '{}')
      expect(stored.expandedNodes).toEqual(['proj-123'])
    })
  })
})
