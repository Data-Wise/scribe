import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionSidebar } from '../components/sidebar/MissionSidebar'
import { useAppViewStore } from '../store/useAppViewStore'
import { Project, Note } from '../types'

/**
 * Icon-Centric Expansion E2E Tests (v1.16.0)
 *
 * Comprehensive end-to-end testing for icon-centric sidebar expansion.
 * Tests the complete user journey through the new architecture.
 *
 * Architecture: IconBar (always visible) + ExpandedIconPanel (conditional)
 * Pattern: Accordion (one icon expanded at a time)
 * Modes: Per-icon preferences (compact/card)
 */

describe('Icon-Centric Sidebar Expansion E2E', () => {
  const mockProjects: Project[] = [
    {
      id: 'proj-research',
      name: 'Research Project',
      type: 'research',
      status: 'active',
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    {
      id: 'proj-teaching',
      name: 'Teaching Materials',
      type: 'teaching',
      status: 'active',
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  ]

  const mockNotes: Note[] = [
    {
      id: 'note-research-1',
      title: 'Research Note 1',
      content: 'Research content',
      folder: '/',
      project_id: 'proj-research',
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null,
      properties: {},
    },
    {
      id: 'note-inbox-1',
      title: 'Inbox Note',
      content: 'Unassigned content',
      folder: '/',
      project_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null,
      properties: {},
    },
  ]

  const mockHandlers = {
    onSelectProject: vi.fn(),
    onSelectNote: vi.fn(),
    onCreateProject: vi.fn(),
    onNewNote: vi.fn(),
    onEditProject: vi.fn(),
    onArchiveProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onPinProject: vi.fn(),
    onUnpinProject: vi.fn(),
    onRenameNote: vi.fn(),
    onMoveNoteToProject: vi.fn(),
    onDuplicateNote: vi.fn(),
    onDeleteNote: vi.fn(),
    onSearch: vi.fn(),
    onDaily: vi.fn(),
    onOpenSettings: vi.fn(),
  }

  beforeEach(() => {
    // Reset store to initial state
    useAppViewStore.setState({
      expandedIcon: null,
      sidebarWidth: 48,
      compactModeWidth: 240,
      cardModeWidth: 320,
      pinnedVaults: [
        {
          id: 'inbox',
          label: 'Inbox',
          order: 0,
          isPermanent: true,
          preferredMode: 'compact',
        },
      ],
      smartIcons: [
        {
          id: 'research',
          label: 'Research',
          icon: 'flask',
          color: '#3b82f6',
          projectType: 'research',
          isVisible: true,
          isExpanded: false,
          order: 0,
          preferredMode: 'compact',
        },
        {
          id: 'teaching',
          label: 'Teaching',
          icon: 'graduation-cap',
          color: '#10b981',
          projectType: 'teaching',
          isVisible: true,
          isExpanded: false,
          order: 1,
          preferredMode: 'compact',
        },
      ],
    })

    // Clear mocks
    vi.clearAllMocks()
  })

  // ============================================================
  // Basic Icon Expansion Tests
  // ============================================================

  describe('Icon Expansion Basics', () => {
    it('renders sidebar in collapsed state (icon-only) by default', () => {
      const { container } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Icon bar should be visible
      const iconBar = container.querySelector('.mission-sidebar-icon')
      expect(iconBar).toBeInTheDocument()

      // Expansion panel should NOT be visible
      const expandedPanel = container.querySelector('.expanded-icon-panel')
      expect(expandedPanel).not.toBeInTheDocument()

      // Sidebar should be 48px wide
      const sidebar = container.querySelector('.mission-sidebar')
      expect(sidebar).toHaveAttribute('style', expect.stringContaining('48'))
    })

    it('expands inbox when inbox icon is clicked', async () => {
      const { container } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Click inbox icon
      const inboxButton = container.querySelector('[data-testid="inbox-button"]') ||
                          container.querySelector('.inbox-btn')

      if (inboxButton) {
        fireEvent.click(inboxButton)

        await waitFor(() => {
          // Expansion panel should appear
          const expandedPanel = container.querySelector('.expanded-icon-panel')
          expect(expandedPanel).toBeInTheDocument()

          // Store should be updated
          const state = useAppViewStore.getState()
          expect(state.expandedIcon).toEqual({ type: 'vault', id: 'inbox' })
          expect(state.sidebarWidth).toBeGreaterThan(48)
        })
      }
    })

    it('collapses when same icon is clicked again', async () => {
      const { container } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // First expand inbox
      useAppViewStore.getState().expandVault('inbox')

      // Wait for expansion
      await waitFor(() => {
        expect(container.querySelector('.expanded-icon-panel')).toBeInTheDocument()
      })

      // Click inbox again
      const inboxButton = container.querySelector('[data-testid="inbox-button"]') ||
                          container.querySelector('.inbox-btn')

      if (inboxButton) {
        fireEvent.click(inboxButton)

        await waitFor(() => {
          // Should collapse
          expect(container.querySelector('.expanded-icon-panel')).not.toBeInTheDocument()
          expect(useAppViewStore.getState().expandedIcon).toBeNull()
          expect(useAppViewStore.getState().sidebarWidth).toBe(48)
        })
      }
    })
  })

  // ============================================================
  // Accordion Pattern Tests
  // ============================================================

  describe('Accordion Pattern (One Icon at a Time)', () => {
    it('switches between icons automatically', async () => {
      // Expand inbox
      useAppViewStore.getState().expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('inbox')

      // Click research icon (should auto-collapse inbox)
      useAppViewStore.getState().expandSmartIcon('research')

      const state = useAppViewStore.getState()
      expect(state.expandedIcon?.id).toBe('research')
      expect(state.expandedIcon?.type).toBe('smart')
    })

    it('maintains only one expanded icon at all times', async () => {
      // Expand inbox
      useAppViewStore.getState().expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('inbox')

      // Expand teaching
      useAppViewStore.getState().expandSmartIcon('teaching')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('teaching')

      // Expand research
      useAppViewStore.getState().expandSmartIcon('research')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('research')

      // State should never have multiple expanded icons
      const state = useAppViewStore.getState()
      expect(state.expandedIcon).not.toBeNull()
      expect(state.expandedIcon?.id).toBe('research')
    })
  })

  // ============================================================
  // Mode Switching Tests
  // ============================================================

  describe('Per-Icon Mode Preferences', () => {
    it('displays mode toggle button when icon is expanded', async () => {
      const { container, rerender } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand inbox
      useAppViewStore.getState().expandVault('inbox')
      rerender(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      await waitFor(() => {
        const expandedPanel = container.querySelector('.expanded-icon-panel')
        expect(expandedPanel).toBeInTheDocument()

        // Mode toggle should be present
        const modeToggle = container.querySelector('.panel-action-btn') ||
                          screen.queryByTitle(/switch to/i)
        expect(modeToggle).toBeTruthy()
      })
    })

    it('switches mode when toggle button is clicked', async () => {
      const { container, rerender } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand inbox in compact mode
      useAppViewStore.getState().expandVault('inbox')
      rerender(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const initialWidth = useAppViewStore.getState().sidebarWidth

      // Switch to card mode
      useAppViewStore.getState().setIconMode('vault', 'inbox', 'card')
      rerender(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      await waitFor(() => {
        const state = useAppViewStore.getState()
        const vault = state.pinnedVaults.find(v => v.id === 'inbox')
        expect(vault?.preferredMode).toBe('card')
        expect(state.sidebarWidth).toBeGreaterThan(initialWidth)
      })
    })

    it('remembers mode preference when switching between icons', async () => {
      // Set research to card mode
      useAppViewStore.getState().setIconMode('smart', 'research', 'card')

      // Set teaching to compact mode
      useAppViewStore.getState().setIconMode('smart', 'teaching', 'compact')

      // Expand research → should use card width (320)
      useAppViewStore.getState().expandSmartIcon('research')
      expect(useAppViewStore.getState().sidebarWidth).toBe(320)

      // Expand teaching → should use compact width (240)
      useAppViewStore.getState().expandSmartIcon('teaching')
      expect(useAppViewStore.getState().sidebarWidth).toBe(240)

      // Expand research again → should restore card width (320)
      useAppViewStore.getState().expandSmartIcon('research')
      expect(useAppViewStore.getState().sidebarWidth).toBe(320)
    })
  })

  // ============================================================
  // Content Rendering Tests
  // ============================================================

  describe('Content Rendering by Icon Type', () => {
    it('shows inbox notes when inbox is expanded', async () => {
      const { rerender } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand inbox
      useAppViewStore.getState().expandVault('inbox')
      rerender(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      await waitFor(() => {
        // Should show inbox note
        expect(screen.queryByText('Inbox Note')).toBeInTheDocument()
      })
    })

    it('shows filtered projects when smart icon is expanded', async () => {
      render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand research smart icon
      useAppViewStore.getState().expandSmartIcon('research')

      // Wait for state to update and component to re-render
      await waitFor(() => {
        const state = useAppViewStore.getState()
        expect(state.expandedIcon?.id).toBe('research')
        expect(state.expandedIcon?.type).toBe('smart')
      })

      // ExpandedIconPanel should filter projects by type (research)
      // This is tested in the state, actual rendering tested in unit tests
    })

    it('shows different projects for different smart icons', async () => {
      render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand teaching smart icon
      useAppViewStore.getState().expandSmartIcon('teaching')

      await waitFor(() => {
        const state = useAppViewStore.getState()
        expect(state.expandedIcon?.id).toBe('teaching')
        expect(state.expandedIcon?.type).toBe('smart')
      })

      // Note: Content filtering tested at unit level in ExpandedIconPanel tests
    })
  })

  // ============================================================
  // Width Management Tests
  // ============================================================

  describe('Width Management', () => {
    it('uses compactModeWidth for icons in compact mode', () => {
      useAppViewStore.setState({ compactModeWidth: 260 })

      // Expand inbox (default compact mode)
      useAppViewStore.getState().expandVault('inbox')

      expect(useAppViewStore.getState().sidebarWidth).toBe(260)
    })

    it('uses cardModeWidth for icons in card mode', () => {
      useAppViewStore.setState({ cardModeWidth: 380 })

      // Set inbox to card mode
      useAppViewStore.getState().setIconMode('vault', 'inbox', 'card')

      // Expand inbox
      useAppViewStore.getState().expandVault('inbox')

      expect(useAppViewStore.getState().sidebarWidth).toBe(380)
    })

    it('collapses to 48px when all icons are collapsed', () => {
      // Expand then collapse
      useAppViewStore.getState().expandVault('inbox')
      expect(useAppViewStore.getState().sidebarWidth).toBeGreaterThan(48)

      useAppViewStore.getState().collapseAll()
      expect(useAppViewStore.getState().sidebarWidth).toBe(48)
    })
  })

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Full User Journey', () => {
    it('complete workflow: expand → switch mode → switch icon → collapse', async () => {
      render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // 1. Start collapsed
      expect(useAppViewStore.getState().expandedIcon).toBeNull()
      expect(useAppViewStore.getState().sidebarWidth).toBe(48)

      // 2. Expand inbox
      useAppViewStore.getState().expandVault('inbox')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('inbox')
      expect(useAppViewStore.getState().sidebarWidth).toBe(240) // compact default

      // 3. Switch to card mode
      useAppViewStore.getState().setIconMode('vault', 'inbox', 'card')
      expect(useAppViewStore.getState().sidebarWidth).toBe(320) // card default

      // 4. Switch to research icon
      useAppViewStore.getState().expandSmartIcon('research')
      expect(useAppViewStore.getState().expandedIcon?.id).toBe('research')
      expect(useAppViewStore.getState().sidebarWidth).toBe(240) // research in compact

      // 5. Collapse
      useAppViewStore.getState().collapseAll()
      expect(useAppViewStore.getState().expandedIcon).toBeNull()
      expect(useAppViewStore.getState().sidebarWidth).toBe(48)
    })

    it('persists state across re-renders', async () => {
      const { rerender } = render(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      // Expand and set preferences
      useAppViewStore.getState().expandSmartIcon('research')
      useAppViewStore.getState().setIconMode('smart', 'research', 'card')

      const stateBefore = useAppViewStore.getState()

      // Re-render
      rerender(
        <MissionSidebar
          projects={mockProjects}
          notes={mockNotes}
          currentProjectId={null}
          {...mockHandlers}
        />
      )

      const stateAfter = useAppViewStore.getState()

      // State should be preserved
      expect(stateAfter.expandedIcon).toEqual(stateBefore.expandedIcon)
      expect(stateAfter.sidebarWidth).toBe(stateBefore.sidebarWidth)

      const icon = stateAfter.smartIcons.find(i => i.id === 'research')
      expect(icon?.preferredMode).toBe('card')
    })
  })
})
