import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ThemeGallery from '../components/Settings/ThemeGallery'
import { useSettingsStore } from '../store/useSettingsStore'

// Mock the settings store
vi.mock('../store/useSettingsStore', () => ({
  useSettingsStore: vi.fn()
}))

describe('ThemeGallery', () => {
  const mockUpdateSetting = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSettingsStore as any).mockReturnValue({
      settings: { 'themes.current': 'slate' },
      updateSetting: mockUpdateSetting
    })
  })

  describe('Rendering', () => {
    it('should render theme gallery heading', () => {
      render(<ThemeGallery />)

      expect(screen.getByText('Theme Gallery')).toBeInTheDocument()
      expect(screen.getByText('Choose a visual theme for editor and UI')).toBeInTheDocument()
    })

    it('should render Favorites section', () => {
      render(<ThemeGallery />)

      expect(screen.getByText('Favorites')).toBeInTheDocument()
    })

    it('should render Dark themes section', () => {
      render(<ThemeGallery />)

      expect(screen.getByText(/Dark \(\d+ themes\)/)).toBeInTheDocument()
    })

    it('should render Light themes section', () => {
      render(<ThemeGallery />)

      expect(screen.getByText(/Light \(\d+ themes\)/)).toBeInTheDocument()
    })

    it('should render all theme cards', () => {
      render(<ThemeGallery />)

      // Check for known themes
      expect(screen.getByText('Slate')).toBeInTheDocument()
      expect(screen.getByText('Ocean')).toBeInTheDocument()
      expect(screen.getByText('Forest')).toBeInTheDocument()
      expect(screen.getByText('Dracula')).toBeInTheDocument()
      expect(screen.getByText('Nord')).toBeInTheDocument()
      expect(screen.getByText('Linen')).toBeInTheDocument()
      expect(screen.getByText('Paper')).toBeInTheDocument()
      expect(screen.getByText('Cream')).toBeInTheDocument()
    })
  })

  describe('Theme Selection', () => {
    it('should highlight currently selected theme', () => {
      render(<ThemeGallery />)

      const slateButton = screen.getByText('Slate').closest('button')
      expect(slateButton).toHaveClass('border-blue-500')
      expect(slateButton).toHaveClass('ring-2')
    })

    it('should not highlight non-selected themes', () => {
      render(<ThemeGallery />)

      const oceanButton = screen.getByText('Ocean').closest('button')
      expect(oceanButton).not.toHaveClass('border-blue-500')
      expect(oceanButton).toHaveClass('border-neutral-600')
    })

    it('should call updateSetting when theme clicked', () => {
      render(<ThemeGallery />)

      const oceanButton = screen.getByText('Ocean').closest('button')
      fireEvent.click(oceanButton!)

      expect(mockUpdateSetting).toHaveBeenCalledWith('themes.current', 'ocean')
    })

    it('should handle selection of different themes', () => {
      render(<ThemeGallery />)

      const themes = ['Forest', 'Dracula', 'Nord', 'Linen', 'Paper', 'Cream']

      themes.forEach((themeName) => {
        const button = screen.getByText(themeName).closest('button')
        fireEvent.click(button!)
      })

      expect(mockUpdateSetting).toHaveBeenCalledTimes(6)
    })
  })

  describe('Visual Feedback', () => {
    it('should show checkmark on selected theme', () => {
      render(<ThemeGallery />)

      const slateButton = screen.getByText('Slate').closest('button')
      const checkmark = slateButton?.querySelector('svg')

      expect(checkmark).toBeInTheDocument()
    })

    it('should show star icon for favorite themes', () => {
      render(<ThemeGallery />)

      // Slate, Ocean, Forest are favorites
      const favoriteThemes = ['Slate', 'Ocean', 'Forest']

      favoriteThemes.forEach((themeName) => {
        const themeCard = screen.getByText(themeName).closest('button')
        const stars = themeCard?.querySelectorAll('svg')

        // Should have both checkmark (if selected) and star
        expect(stars!.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Theme Previews', () => {
    it('should display theme preview with correct background color', () => {
      render(<ThemeGallery />)

      const slateButton = screen.getByText('Slate').closest('button')
      const preview = slateButton?.querySelector('.h-24')

      expect(preview).toHaveStyle({ backgroundColor: '#1e293b' })
    })

    it('should show mini editor preview lines', () => {
      render(<ThemeGallery />)

      const slateButton = screen.getByText('Slate').closest('button')
      const previewLines = slateButton?.querySelectorAll('.rounded-full')

      // Should have lines for text and accent indicator
      expect(previewLines!.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have button elements for theme selection', () => {
      render(<ThemeGallery />)

      const slateButton = screen.getByText('Slate').closest('button')
      expect(slateButton).toBeInTheDocument()
      expect(slateButton?.tagName).toBe('BUTTON')
    })

    it('should be keyboard navigable', () => {
      render(<ThemeGallery />)

      const firstTheme = screen.getByText('Slate').closest('button')
      firstTheme?.focus()

      expect(document.activeElement).toBe(firstTheme)
    })
  })

  describe('Theme Groups', () => {
    it('should show favorites in their own section', () => {
      render(<ThemeGallery />)

      const favoritesSection = screen.getByText('Favorites').closest('div')
      expect(favoritesSection).toBeInTheDocument()

      // Check that favorites are present
      const favoritesContainer = favoritesSection?.nextElementSibling
      expect(favoritesContainer?.textContent).toContain('Slate')
      expect(favoritesContainer?.textContent).toContain('Ocean')
      expect(favoritesContainer?.textContent).toContain('Forest')
    })

    it('should group dark themes together', () => {
      render(<ThemeGallery />)

      const darkSection = screen.getByText(/Dark \(\d+ themes\)/).closest('div')
      expect(darkSection).toBeInTheDocument()
    })

    it('should group light themes together', () => {
      render(<ThemeGallery />)

      const lightSection = screen.getByText(/Light \(\d+ themes\)/).closest('div')
      expect(lightSection).toBeInTheDocument()
    })
  })

  describe('State Persistence', () => {
    it('should load current theme from store on mount', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'themes.current': 'dracula' },
        updateSetting: mockUpdateSetting
      })

      render(<ThemeGallery />)

      const draculaButton = screen.getByText('Dracula').closest('button')
      expect(draculaButton).toHaveClass('border-blue-500')
    })

    it('should default to slate if no theme selected', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: {},
        updateSetting: mockUpdateSetting
      })

      render(<ThemeGallery />)

      const slateButton = screen.getByText('Slate').closest('button')
      expect(slateButton).toHaveClass('border-blue-500')
    })
  })
})
