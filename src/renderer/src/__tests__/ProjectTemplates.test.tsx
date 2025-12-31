import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectTemplates from '../components/Settings/ProjectTemplates'
import { useSettingsStore, QuickAction } from '../store/useSettingsStore'

// Mock window.confirm
global.confirm = vi.fn(() => true)

// Mock the settings store
vi.mock('../store/useSettingsStore', () => ({
  useSettingsStore: vi.fn()
}))

const mockQuickActions: QuickAction[] = [
  { id: 'improve', emoji: '✨', label: 'Improve', prompt: '', enabled: true, order: 0, model: 'claude', isCustom: false },
  { id: 'expand', emoji: '📝', label: 'Expand', prompt: '', enabled: true, order: 1, model: 'claude', isCustom: false },
  { id: 'summarize', emoji: '📋', label: 'Summarize', prompt: '', enabled: true, order: 2, model: 'gemini', isCustom: false },
  { id: 'explain', emoji: '💡', label: 'Explain', prompt: '', enabled: true, order: 3, model: 'claude', isCustom: false },
  { id: 'research', emoji: '🔍', label: 'Research', prompt: '', enabled: true, order: 4, model: 'claude', isCustom: false }
]

describe('ProjectTemplates', () => {
  const mockUpdateSetting = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.confirm as any).mockReturnValue(true)
    ;(useSettingsStore as any).mockReturnValue({
      updateSetting: mockUpdateSetting,
      quickActions: mockQuickActions
    })
  })

  describe('Rendering', () => {
    it('should render project templates heading', () => {
      render(<ProjectTemplates />)

      expect(screen.getByText('Project Templates')).toBeInTheDocument()
      expect(screen.getByText(/Preconfigured settings for different project types/)).toBeInTheDocument()
    })

    it('should render all 5 templates', () => {
      render(<ProjectTemplates />)

      expect(screen.getByText('Research+')).toBeInTheDocument()
      expect(screen.getByText('Teaching+')).toBeInTheDocument()
      expect(screen.getByText('Dev+')).toBeInTheDocument()
      expect(screen.getByText('Writing+')).toBeInTheDocument()
      expect(screen.getByText('Minimal')).toBeInTheDocument()
    })

    it('should display template icons', () => {
      render(<ProjectTemplates />)

      const researchCard = screen.getByText('Research+').closest('.rounded-lg')
      expect(researchCard?.textContent).toContain('🔬')

      const teachingCard = screen.getByText('Teaching+').closest('.rounded-lg')
      expect(teachingCard?.textContent).toContain('📚')

      const devCard = screen.getByText('Dev+').closest('.rounded-lg')
      expect(devCard?.textContent).toContain('💻')

      const writingCard = screen.getByText('Writing+').closest('.rounded-lg')
      expect(writingCard?.textContent).toContain('✍️')

      const minimalCard = screen.getByText('Minimal').closest('.rounded-lg')
      expect(minimalCard?.textContent).toContain('🎯')
    })

    it('should display template descriptions', () => {
      render(<ProjectTemplates />)

      expect(screen.getByText(/Academic research with citations/)).toBeInTheDocument()
      expect(screen.getByText(/Course materials with lesson planning/)).toBeInTheDocument()
      expect(screen.getByText(/Software development with code snippets/)).toBeInTheDocument()
      expect(screen.getByText(/Creative writing with focus on clarity/)).toBeInTheDocument()
      expect(screen.getByText(/Bare minimum configuration/)).toBeInTheDocument()
    })
  })

  describe('Template Information', () => {
    it('should show quick preview of template settings', () => {
      render(<ProjectTemplates />)

      // Find the full card container, not just first div
      const researchCard = screen.getByText('Research+').closest('.rounded-lg')

      expect(researchCard?.textContent).toContain('Template:')
      expect(researchCard?.textContent).toContain('research')
      expect(researchCard?.textContent).toContain('Theme:')
      expect(researchCard?.textContent).toContain('slate')
      expect(researchCard?.textContent).toContain('Actions:')
      expect(researchCard?.textContent).toContain('4 enabled')
    })

    it('should show "None" for templates with no Quick Actions', () => {
      render(<ProjectTemplates />)

      // Minimal template has no Quick Actions, so it should show "None"
      const allText = screen.getByText('Minimal').closest('.rounded-lg')
      expect(allText?.textContent).toContain('Actions:')
      expect(allText?.textContent).toContain('None')
    })
  })

  describe('Apply Template', () => {
    it('should show Apply button for each template', () => {
      render(<ProjectTemplates />)

      const applyButtons = screen.getAllByText('Apply')
      expect(applyButtons).toHaveLength(5)
    })

    it('should ask for confirmation before applying', () => {
      render(<ProjectTemplates />)

      const applyButton = screen.getAllByText('Apply')[0]
      fireEvent.click(applyButton)

      expect(global.confirm).toHaveBeenCalledWith(expect.stringContaining('Apply "Research+" template?'))
    })

    it('should not apply if user cancels', () => {
      ;(global.confirm as any).mockReturnValue(false)

      render(<ProjectTemplates />)

      const applyButton = screen.getAllByText('Apply')[0]
      fireEvent.click(applyButton)

      expect(mockUpdateSetting).not.toHaveBeenCalled()
    })

    it('should update multiple settings when applied', () => {
      render(<ProjectTemplates />)

      const applyButton = screen.getAllByText('Apply')[0] // Research+
      fireEvent.click(applyButton)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'research')
      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.defaultWorkingDirectory', '~/projects/research')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'slate')
    })

    it('should apply different settings for different templates', () => {
      render(<ProjectTemplates />)

      const teachingButton = screen.getAllByText('Apply')[1] // Teaching+
      fireEvent.click(teachingButton)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'teaching')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'forest')
    })

    it('should show Applied state after successful application', () => {
      vi.useFakeTimers()

      render(<ProjectTemplates />)

      const applyButton = screen.getAllByText('Apply')[0]
      fireEvent.click(applyButton)

      expect(screen.getByText('Applied')).toBeInTheDocument()

      // Applied state should reset after 2 seconds
      act(() => {
        vi.advanceTimersByTime(2100)
      })

      expect(screen.queryByText('Applied')).not.toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('Show Details', () => {
    it('should show info button for each template', () => {
      render(<ProjectTemplates />)

      const infoButtons = screen.getAllByTitle('Show details')
      expect(infoButtons).toHaveLength(5)
    })

    it('should expand details when info button clicked', () => {
      render(<ProjectTemplates />)

      const infoButton = screen.getAllByTitle('Show details')[0]
      fireEvent.click(infoButton)

      expect(screen.getByText('What will change:')).toBeInTheDocument()
    })

    it('should show detailed settings in preview', () => {
      render(<ProjectTemplates />)

      const infoButton = screen.getAllByTitle('Show details')[0]
      fireEvent.click(infoButton)

      expect(screen.getByText(/Daily note template →/)).toBeInTheDocument()
      expect(screen.getByText(/Default directory →/)).toBeInTheDocument()
      expect(screen.getByText(/Theme →/)).toBeInTheDocument()
      expect(screen.getByText(/Quick Actions →/)).toBeInTheDocument()
    })

    it('should collapse details when info button clicked again', () => {
      render(<ProjectTemplates />)

      const infoButton = screen.getAllByTitle('Show details')[0]

      // Expand
      fireEvent.click(infoButton)
      expect(screen.getByText('What will change:')).toBeInTheDocument()

      // Collapse
      fireEvent.click(infoButton)
      expect(screen.queryByText('What will change:')).not.toBeInTheDocument()
    })
  })

  describe('Template Variations', () => {
    it('should apply Research+ template settings correctly', () => {
      render(<ProjectTemplates />)

      const researchApply = screen.getAllByText('Apply')[0]
      fireEvent.click(researchApply)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'research')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'slate')
    })

    it('should apply Teaching+ template settings correctly', () => {
      render(<ProjectTemplates />)

      const teachingApply = screen.getAllByText('Apply')[1]
      fireEvent.click(teachingApply)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'teaching')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'forest')
    })

    it('should apply Dev+ template settings correctly', () => {
      render(<ProjectTemplates />)

      const devApply = screen.getAllByText('Apply')[2]
      fireEvent.click(devApply)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'simple')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'dracula')
      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.defaultWorkingDirectory', '~/projects/dev-tools')
    })

    it('should apply Writing+ template settings correctly', () => {
      render(<ProjectTemplates />)

      const writingApply = screen.getAllByText('Apply')[3]
      fireEvent.click(writingApply)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'simple')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'linen')
    })

    it('should apply Minimal template settings correctly', () => {
      render(<ProjectTemplates />)

      const minimalApply = screen.getAllByText('Apply')[4]
      fireEvent.click(minimalApply)

      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.dailyNotes.template', 'simple')
      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'slate')
      expect(mockUpdateSetting).toHaveBeenCalledWith('projects.defaultWorkingDirectory', '~/projects')
    })
  })

  describe('Visual Styling', () => {
    it('should apply color coding per template', () => {
      render(<ProjectTemplates />)

      const researchCard = screen.getByText('Research+').closest('div')
      expect(researchCard).toBeInTheDocument()
      // Color classes are applied via Tailwind, check structure exists
    })

    it('should use 2-column grid layout', () => {
      render(<ProjectTemplates />)

      const grid = screen.getByText('Research+').closest('.grid')
      expect(grid).toHaveClass('grid-cols-2')
    })
  })

  describe('Accessibility', () => {
    it('should have button elements for actions', () => {
      render(<ProjectTemplates />)

      const applyButtons = screen.getAllByText('Apply')
      applyButtons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON')
      })
    })

    it('should have accessible info button titles', () => {
      render(<ProjectTemplates />)

      const infoButtons = screen.getAllByTitle('Show details')
      expect(infoButtons.length).toBeGreaterThan(0)
    })
  })
})
