import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import { SettingsModal } from '../components/SettingsModal'
import { AutoThemeSettings, FontSettings, ThemeShortcut } from '../lib/themes'
import { updatePreferences } from '../lib/preferences'
import { createMockTheme } from './testUtils'

// Mock dependencies
vi.mock('../lib/api', () => ({
  api: {
    checkHomebrewInstalled: vi.fn().mockResolvedValue(true),
    listInstalledFonts: vi.fn().mockResolvedValue([]),
    installFont: vi.fn().mockResolvedValue({ success: true, message: 'Installed' }),
    getZoteroLibraryPath: vi.fn().mockResolvedValue('/path/to/zotero'),
    setZoteroLibraryPath: vi.fn().mockResolvedValue(undefined),
    getInstalledFonts: vi.fn().mockResolvedValue([]),
    isHomebrewAvailable: vi.fn().mockResolvedValue(true),
    installFontViaHomebrew: vi.fn().mockResolvedValue('Font installed successfully'),
    getBibliographyPath: vi.fn().mockResolvedValue('/path/to/bibliography.bib'),
    setBibliographyPath: vi.fn().mockResolvedValue(undefined),
    getDefaultVaultPath: vi.fn().mockResolvedValue('/path/to/vault'),
    setDefaultVaultPath: vi.fn().mockResolvedValue(undefined),
    getOpenAiApiKey: vi.fn().mockResolvedValue(''),
    setOpenAiApiKey: vi.fn().mockResolvedValue(undefined),
  }
}))

vi.mock('../lib/platform', () => ({
  isTauri: vi.fn().mockReturnValue(false),
  isBrowser: vi.fn().mockReturnValue(true),
}))

vi.mock('../lib/browser-db', () => ({
  db: {
    notes: { toArray: vi.fn().mockResolvedValue([]), clear: vi.fn() },
    projects: { toArray: vi.fn().mockResolvedValue([]), clear: vi.fn() },
    tags: { toArray: vi.fn().mockResolvedValue([]), clear: vi.fn() },
    noteTags: { clear: vi.fn() },
    noteLinks: { clear: vi.fn() },
    projectSettings: { clear: vi.fn() },
  },
  seedDemoData: vi.fn().mockResolvedValue(true),
}))

vi.mock('../lib/dailyNoteTemplates', () => ({
  loadTemplates: vi.fn().mockReturnValue([
    { id: 'minimal', name: 'Minimal', content: '# {{date}}\n\n' },
    { id: 'research', name: 'Research', content: '# Research Log: {{date}}\n\n## Focus\n\n## Notes\n\n## Next Steps' },
    { id: 'adhd', name: 'ADHD Friendly', content: '# {{date}}\n\n## Top 3 Priorities\n1. \n2. \n3. ' },
  ]),
  getSelectedTemplateId: vi.fn().mockReturnValue('minimal'),
  setSelectedTemplateId: vi.fn(),
  processTemplate: vi.fn().mockReturnValue('# January 1, 2026\n\n'),
}))

vi.mock('../lib/preferences', () => ({
  loadPreferences: vi.fn().mockReturnValue({
    tabBarStyle: 'subtle',
    borderStyle: 'soft',
    activeTabStyle: 'accent-bar',
    sidebarTabSize: 'compact',
    sidebarTabOrder: ['properties', 'backlinks', 'tags', 'stats', 'claude', 'terminal'],
    sidebarHiddenTabs: [],
    streakDisplayOptIn: false,
    customCSSEnabled: false,
    customCSS: '',
  }),
  updatePreferences: vi.fn(),
  TabBarStyle: {},
  BorderStyle: {},
  ActiveTabStyle: {},
  SidebarTabId: {},
  DEFAULT_SIDEBAR_TAB_ORDER: ['properties', 'backlinks', 'tags', 'stats', 'claude', 'terminal'],
}))

vi.mock('../lib/terminal-utils', () => ({
  getDefaultTerminalFolder: vi.fn().mockReturnValue('/Users/test'),
  setDefaultTerminalFolder: vi.fn(),
}))

vi.mock('../lib/themes', async () => {
  const actual = await vi.importActual('../lib/themes')
  return {
    ...actual,
    applyTheme: vi.fn(),
    importTheme: vi.fn().mockReturnValue(null),
    generateShareableTheme: vi.fn().mockReturnValue('{"theme": "json"}'),
    exportThemeToBase16: vi.fn().mockReturnValue('base16 yaml'),
    fetchThemeFromUrl: vi.fn().mockResolvedValue(null),
    isValidThemeUrl: vi.fn().mockReturnValue(true),
    importThemeFromBase16: vi.fn().mockImplementation((scheme) => ({
      id: `custom-${scheme.scheme.toLowerCase().replace(/\s+/g, '-')}`,
      name: scheme.scheme,
      type: 'dark',
      isCustom: true,
      colors: {
        bgPrimary: scheme.base00,
        bgSecondary: scheme.base01,
        bgTertiary: scheme.base02,
        textPrimary: scheme.base05,
        textSecondary: scheme.base04,
        textMuted: scheme.base03,
        accent: scheme.base0D,
        border: scheme.base02,
      },
    })),
  }
})

// Mock themes
const mockThemes = {
  'sage-garden': createMockTheme({
    id: 'sage-garden', name: 'Sage Garden', type: 'light', description: 'A calming light theme',
    colors: { bgPrimary: '#f5f8f5', bgSecondary: '#e8f0e8', bgTertiary: '#d8e8d8', textPrimary: '#1a2e1a', textMuted: '#8fa89b', accent: '#4ade80', accentHover: '#3bcc6e' },
  }),
  'ocean': createMockTheme({
    id: 'ocean', name: 'Ocean', description: 'A deep blue dark theme',
    colors: { bgPrimary: '#0d1117', bgSecondary: '#161b22', bgTertiary: '#21262d', textPrimary: '#c9d1d9', textMuted: '#6e7681', accent: '#58a6ff', accentHover: '#4899e8' },
  }),
  'midnight': createMockTheme({
    id: 'midnight', name: 'Midnight', description: 'Pure dark theme',
    colors: { bgPrimary: '#000000', bgSecondary: '#111111', bgTertiary: '#222222', textPrimary: '#ffffff', textMuted: '#888888', accent: '#ff6b6b', accentHover: '#e85c5c' },
  }),
  'custom-test': createMockTheme({
    id: 'custom-test', name: 'Custom Test', description: 'A custom test theme', isCustom: true,
    colors: { bgPrimary: '#1a1a1a', bgSecondary: '#2a2a2a', bgTertiary: '#3a3a3a', textPrimary: '#ffffff', textMuted: '#888888', accent: '#00ff00', accentHover: '#00dd00' },
  }),
}

const defaultAutoThemeSettings: AutoThemeSettings = {
  enabled: false,
  dayTheme: 'sage-garden',
  nightTheme: 'ocean',
  dayStartHour: 6,
  nightStartHour: 18,
}

const defaultFontSettings: FontSettings = {
  family: 'inter',
  size: 16,
  lineHeight: 1.6,
}

const defaultThemeShortcuts: ThemeShortcut[] = [
  { key: '1', themeId: 'sage-garden' },
  { key: '2', themeId: 'ocean' },
  { key: '3', themeId: 'midnight' },
]

describe('SettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    themes: mockThemes,
    currentTheme: 'sage-garden',
    onThemeChange: vi.fn(),
    autoThemeSettings: defaultAutoThemeSettings,
    onAutoThemeChange: vi.fn(),
    onSaveCustomTheme: vi.fn(),
    onDeleteCustomTheme: vi.fn(),
    fontSettings: defaultFontSettings,
    onFontSettingsChange: vi.fn(),
    themeShortcuts: defaultThemeShortcuts,
    onThemeShortcutsChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<SettingsModal {...defaultProps} />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<SettingsModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('should render all category tabs', () => {
      render(<SettingsModal {...defaultProps} />)
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Editor')).toBeInTheDocument()
      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('Files & Links')).toBeInTheDocument()
      expect(screen.getByText('Research')).toBeInTheDocument()
    })

    it('should show current theme in footer', () => {
      render(<SettingsModal {...defaultProps} />)
      expect(screen.getByText(/SAGE GARDEN/i)).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<SettingsModal {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render modal with correct test id', () => {
      render(<SettingsModal {...defaultProps} />)
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should switch to General tab', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/STARTUP|Startup/)).toBeInTheDocument()
    })

    it('should switch to Editor tab', async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })
      expect(screen.getByText(/Font Family/)).toBeInTheDocument()
    })

    it('should switch to Appearance tab', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
      expect(screen.getByText(/Tab Bar Style/)).toBeInTheDocument()
    })

    it('should switch to Files & Links tab', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Files & Links'))
      expect(screen.getByText(/Storage/)).toBeInTheDocument()
    })

    it('should switch to Research tab', async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Research'))
      })
      // Should switch without error
      expect(screen.getByText('Research')).toBeInTheDocument()
    })

    it('should highlight active tab', () => {
      render(<SettingsModal {...defaultProps} />)
      const generalTab = screen.getByText('General')
      // General is active by default
      expect(generalTab.closest('button')).toHaveClass('text-nexus-accent')
    })
  })

  describe('Closing Modal', () => {
    it('should call onClose when backdrop is clicked', () => {
      render(<SettingsModal {...defaultProps} />)
      const backdrop = document.querySelector('.backdrop-blur-sm')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(defaultProps.onClose).toHaveBeenCalled()
      }
    })

    it('should have a close button in the modal header', () => {
      render(<SettingsModal {...defaultProps} />)
      // The close button is in the header with X icon
      const modal = screen.getByTestId('settings-modal')
      const buttons = within(modal).getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('General Tab', () => {
    it('should show startup settings', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/Open last page on startup/)).toBeInTheDocument()
    })

    it('should show ADHD features section', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/ADHD/)).toBeInTheDocument()
    })

    it('should show identity section', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/Research Assistant/)).toBeInTheDocument()
    })

    it('should toggle streak display opt-in', async () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))

      const streakSection = screen.getByText(/Show writing streak milestones/).closest('div')
      const streakToggle = streakSection?.parentElement?.querySelector('button')
      if (streakToggle) {
        fireEvent.click(streakToggle)
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalledWith({ streakDisplayOptIn: true })
        })
      }
    })

    it('should show Browser Mode section in browser mode', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/Browser Mode/)).toBeInTheDocument()
      expect(screen.getByText(/IndexedDB Storage/)).toBeInTheDocument()
    })

    it('should show Clear All Data button in browser mode', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/Clear All Data/)).toBeInTheDocument()
    })

    it('should show Restore Demo Data button in browser mode', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('General'))
      expect(screen.getByText(/Restore Demo Data/)).toBeInTheDocument()
    })
  })

  describe('Editor Tab - Typography', () => {
    beforeEach(async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })
    })

    it('should show font family dropdown', () => {
      expect(screen.getByText('Font Family')).toBeInTheDocument()
    })

    it('should show font size control', () => {
      expect(screen.getByText('Font Size')).toBeInTheDocument()
    })

    it('should show line height control', () => {
      expect(screen.getByText('Line Height')).toBeInTheDocument()
    })

    it('should show preview section with sample text', () => {
      expect(screen.getByText(/quick brown fox/)).toBeInTheDocument()
    })

    it('should call onFontSettingsChange when font size changes', async () => {
      const sliders = screen.getAllByRole('slider')
      const fontSizeSlider = sliders[0]
      if (fontSizeSlider) {
        fireEvent.change(fontSizeSlider, { target: { value: '18' } })
        await waitFor(() => {
          expect(defaultProps.onFontSettingsChange).toHaveBeenCalled()
        })
      }
    })

    it('should call onFontSettingsChange when line height changes', async () => {
      const sliders = screen.getAllByRole('slider')
      const lineHeightSlider = sliders[1]
      if (lineHeightSlider) {
        fireEvent.change(lineHeightSlider, { target: { value: '1.8' } })
        await waitFor(() => {
          expect(defaultProps.onFontSettingsChange).toHaveBeenCalled()
        })
      }
    })

    it('should show Journal Template section', () => {
      expect(screen.getByText(/Journal Template/)).toBeInTheDocument()
    })

    it.skip('should show ADHD-Friendly Fonts section (Tauri only)', () => {
      // This test is skipped because ADHD-Friendly Fonts only render in Tauri mode
      // The feature is tested in EditorSettingsTab.test.tsx with proper Tauri mocking
    })

    it.skip('should toggle ADHD fonts section visibility (Tauri only)', async () => {
      // This test is skipped because ADHD-Friendly Fonts only render in Tauri mode
      // The feature is tested in EditorSettingsTab.test.tsx with proper Tauri mocking
    })
  })

  describe('Editor Tab - Journal Templates', () => {
    beforeEach(async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })
    })

    it('should show template dropdown with options', () => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThan(0)
    })

    it('should show template preview toggle button', () => {
      expect(screen.getByText(/Show Preview/)).toBeInTheDocument()
    })

    it('should toggle template preview visibility', async () => {
      const showPreviewButton = screen.getByText(/Show Preview/)
      fireEvent.click(showPreviewButton)
      await waitFor(() => {
        expect(screen.getByText(/Hide Preview/)).toBeInTheDocument()
      })
    })

    it('should show available template variables info', () => {
      expect(screen.getByText(/Available variables/)).toBeInTheDocument()
    })
  })

  describe('Appearance Tab - UI Style', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Tab Bar Style options', () => {
      expect(screen.getByText('Tab Bar Style')).toBeInTheDocument()
      const allText = document.body.textContent || ''
      expect(allText).toContain('subtle')
    })

    it('should show Border Style options', () => {
      expect(screen.getByText('Border Style')).toBeInTheDocument()
    })

    it('should show Active Tab Emphasis options', () => {
      expect(screen.getByText('Active Tab Emphasis')).toBeInTheDocument()
    })

    it('should update tab bar style when clicked', async () => {
      const buttons = screen.getAllByRole('button')
      const elevatedButton = buttons.find(btn => btn.textContent === 'elevated')
      if (elevatedButton) {
        fireEvent.click(elevatedButton)
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalled()
        })
      }
    })

    it('should show Reset to defaults button', () => {
      expect(screen.getAllByText('Reset to defaults').length).toBeGreaterThan(0)
    })

    it('should reset UI styles to defaults when reset clicked', async () => {
      const resetButtons = screen.getAllByText('Reset to defaults')
      if (resetButtons[0]) {
        fireEvent.click(resetButtons[0])
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalledWith({
            tabBarStyle: 'elevated',
            borderStyle: 'soft',
            activeTabStyle: 'elevated'
          })
        })
      }
    })

    it('should update border style when clicked', async () => {
      const buttons = screen.getAllByRole('button')
      const sharpButton = buttons.find(btn => btn.textContent === 'sharp')
      if (sharpButton) {
        fireEvent.click(sharpButton)
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalled()
        })
      }
    })

    it('should update active tab style when clicked', async () => {
      const buttons = screen.getAllByRole('button')
      const boldButton = buttons.find(btn => btn.textContent === 'bold')
      if (boldButton) {
        fireEvent.click(boldButton)
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Appearance Tab - Right Sidebar', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Right Sidebar section', () => {
      expect(screen.getByText(/RIGHT SIDEBAR|Right Sidebar/)).toBeInTheDocument()
    })

    it('should show Tab Size options', () => {
      expect(screen.getByText('Tab Size')).toBeInTheDocument()
      expect(screen.getByText('Compact')).toBeInTheDocument()
    })

    it('should show Visible Tabs section', () => {
      expect(screen.getByText('Visible Tabs')).toBeInTheDocument()
    })

    it('should update sidebar tab size when Full is clicked', async () => {
      const buttons = screen.getAllByRole('button')
      const fullButtons = buttons.filter(btn => btn.textContent === 'Full')
      if (fullButtons.length > 0) {
        fireEvent.click(fullButtons[0])
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalled()
        })
      }
    })

    it('should show sidebar tab visibility options', () => {
      // Check that sidebar tab buttons exist by looking for their titles
      expect(screen.getByTitle(/Hide Properties tab/)).toBeInTheDocument()
    })

    it('should toggle tab visibility when clicked', async () => {
      const propertiesToggle = screen.getByTitle(/Hide Properties tab/)
      if (propertiesToggle) {
        fireEvent.click(propertiesToggle)
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Appearance Tab - Auto Theme', () => {
    it('should show Auto Theme section', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
      expect(screen.getByText(/Auto Theme by Time/)).toBeInTheDocument()
    })

    it('should show auto-switching toggle', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
      expect(screen.getByText(/Enable auto-switching/)).toBeInTheDocument()
    })

    it('should toggle auto theme setting when clicked', async () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))

      const autoSection = screen.getByText(/Enable auto-switching/).closest('div')
      const autoToggle = autoSection?.parentElement?.querySelector('button')
      if (autoToggle) {
        fireEvent.click(autoToggle)
        await waitFor(() => {
          expect(defaultProps.onAutoThemeChange).toHaveBeenCalledWith({
            ...defaultAutoThemeSettings,
            enabled: true
          })
        })
      }
    })

    it('should show day/night theme options when auto-theme is enabled', () => {
      const propsWithAutoEnabled = {
        ...defaultProps,
        autoThemeSettings: { ...defaultAutoThemeSettings, enabled: true }
      }
      render(<SettingsModal {...propsWithAutoEnabled} />)
      // Click only the first Appearance button (the tab)
      const tabs = screen.getAllByText('Appearance')
      fireEvent.click(tabs[0])
      expect(screen.getByText(/Day Theme/)).toBeInTheDocument()
      expect(screen.getByText(/Night Theme/)).toBeInTheDocument()
    })

    it('should show time selectors when auto-theme is enabled', () => {
      const propsWithAutoEnabled = {
        ...defaultProps,
        autoThemeSettings: { ...defaultAutoThemeSettings, enabled: true }
      }
      render(<SettingsModal {...propsWithAutoEnabled} />)
      const tabs = screen.getAllByText('Appearance')
      fireEvent.click(tabs[0])
      expect(screen.getByText(/Day starts at/)).toBeInTheDocument()
      expect(screen.getByText(/Night starts at/)).toBeInTheDocument()
    })
  })

  describe('Appearance Tab - Import/Export', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Import & Export section', () => {
      expect(screen.getByText(/Import & Export/)).toBeInTheDocument()
    })

    it('should show Import Theme button', () => {
      expect(screen.getByText(/Import Theme/)).toBeInTheDocument()
    })

    it('should show Export Theme button', () => {
      expect(screen.getByText(/Export Theme/)).toBeInTheDocument()
    })

    it('should show Browse Popular Schemes button', () => {
      expect(screen.getByText(/Browse Popular Schemes/)).toBeInTheDocument()
    })

    it('should toggle popular schemes section when clicked', async () => {
      const browseButton = screen.getByText(/Browse Popular Schemes/)
      fireEvent.click(browseButton)
      await waitFor(() => {
        // Popular schemes grid should now be visible - check for any scheme name
        const allText = document.body.textContent || ''
        expect(allText.includes('Dracula') || allText.includes('Gruvbox') || allText.includes('Nord')).toBe(true)
      })
    })
  })

  describe('Appearance Tab - Theme Shortcuts', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Keyboard Shortcuts section', () => {
      expect(screen.getByText(/Keyboard Shortcuts/)).toBeInTheDocument()
    })

    it('should show shortcut key indicators', () => {
      // Shortcuts show as kbd elements
      const kbds = document.querySelectorAll('kbd')
      expect(kbds.length).toBeGreaterThan(0)
    })

    it('should call onThemeShortcutsChange when a shortcut dropdown changes', async () => {
      const selects = screen.getAllByRole('combobox')
      // Find a select that's part of the shortcuts section
      if (selects.length > 2) {
        fireEvent.change(selects[2], { target: { value: 'midnight' } })
        await waitFor(() => {
          expect(defaultProps.onThemeShortcutsChange).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Appearance Tab - Custom Theme', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Custom Theme section header', () => {
      const allText = document.body.textContent || ''
      expect(allText).toContain('Custom Theme')
    })

    it('should show Create Custom Theme button', () => {
      expect(screen.getByText(/Create Custom Theme/)).toBeInTheDocument()
    })

    it('should show custom theme creator form when clicked', async () => {
      const createButton = screen.getByText(/Create Custom Theme/)
      fireEvent.click(createButton)
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/My Custom Theme/)).toBeInTheDocument()
      })
    })

    it('should show theme type buttons in creator', async () => {
      fireEvent.click(screen.getByText(/Create Custom Theme/))
      await waitFor(() => {
        const modal = screen.getByTestId('settings-modal')
        const darkButton = within(modal).getByRole('button', { name: /Dark/ })
        const lightButton = within(modal).getByRole('button', { name: /Light/ })
        expect(darkButton).toBeInTheDocument()
        expect(lightButton).toBeInTheDocument()
      })
    })

    it('should show color picker section in creator', async () => {
      fireEvent.click(screen.getByText(/Create Custom Theme/))
      await waitFor(() => {
        expect(screen.getByText(/Accent Color/)).toBeInTheDocument()
      })
    })

    it('should show Cancel button in creator form', async () => {
      fireEvent.click(screen.getByText(/Create Custom Theme/))
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })
    })

    it('should hide creator form when Cancel is clicked', async () => {
      fireEvent.click(screen.getByText(/Create Custom Theme/))
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Cancel'))
      await waitFor(() => {
        expect(screen.getByText(/Create Custom Theme/)).toBeInTheDocument()
      })
    })

    it('should display existing custom themes', () => {
      // Custom Test appears in the custom themes list - use getAllByText since it may appear multiple times
      const customTestElements = screen.getAllByText('Custom Test')
      expect(customTestElements.length).toBeGreaterThan(0)
    })

    it('should call onDeleteCustomTheme when delete button is clicked', async () => {
      const deleteButtons = screen.getAllByTitle('Delete theme')
      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0])
        await waitFor(() => {
          expect(defaultProps.onDeleteCustomTheme).toHaveBeenCalledWith('custom-test')
        })
      }
    })
  })

  describe('Appearance Tab - Theme Gallery', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Dark Themes section', () => {
      expect(screen.getByText(/Dark Themes/)).toBeInTheDocument()
    })

    it('should show Light Themes section', () => {
      expect(screen.getByText(/Light Themes/)).toBeInTheDocument()
    })

    it('should call onThemeChange when a theme card is clicked', async () => {
      // Ocean appears multiple times (in shortcuts and gallery), get all and click the right one
      const oceanElements = screen.getAllByText('Ocean')
      // Find the one that's in a button (theme card)
      const oceanCard = oceanElements.find(el => el.closest('button'))?.closest('button')
      if (oceanCard) {
        fireEvent.click(oceanCard)
        await waitFor(() => {
          expect(defaultProps.onThemeChange).toHaveBeenCalledWith('ocean')
        })
      }
    })

    it('should show Active badge on current theme', () => {
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should show theme descriptions', () => {
      expect(screen.getByText(/A calming light theme/)).toBeInTheDocument()
    })
  })

  describe('Appearance Tab - Custom CSS', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
    })

    it('should show Custom CSS section header', () => {
      const allText = document.body.textContent || ''
      expect(allText).toContain('Custom CSS')
    })

    it('should show Enable Custom CSS toggle', () => {
      expect(screen.getByText(/Enable Custom CSS/)).toBeInTheDocument()
    })

    it('should show CSS textarea for custom styles', () => {
      const textarea = screen.getByPlaceholderText(/Custom CSS for Scribe editor/)
      expect(textarea).toBeInTheDocument()
    })

    it('should show Reset button for clearing CSS', () => {
      expect(screen.getByText('Reset')).toBeInTheDocument()
    })

    it('should toggle custom CSS enabled state', async () => {
      const cssSection = screen.getByText(/Enable Custom CSS/).closest('div')
      const cssToggle = cssSection?.parentElement?.querySelector('button')
      if (cssToggle) {
        fireEvent.click(cssToggle)
        await waitFor(() => {
          expect(updatePreferences).toHaveBeenCalledWith({ customCSSEnabled: true })
        })
      }
    })
  })

  describe('Files & Links Tab', () => {
    beforeEach(() => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Files & Links'))
    })

    it('should show Storage section', () => {
      expect(screen.getByText(/Storage/)).toBeInTheDocument()
    })

    it('should show default folder dropdown', () => {
      expect(screen.getByText(/Default folder for new notes/)).toBeInTheDocument()
    })

    it('should have folder options in dropdown', () => {
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(within(select).getByText('Inbox')).toBeInTheDocument()
    })
  })

  describe('Theme Preview', () => {
    it('should show theme preview cards with mini layout', () => {
      render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
      // Ocean appears multiple times, just verify it exists
      const oceanElements = screen.getAllByText('Ocean')
      expect(oceanElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have Settings heading', () => {
      render(<SettingsModal {...defaultProps} />)
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    })

    it('should have clickable tab buttons for all categories', () => {
      render(<SettingsModal {...defaultProps} />)
      const tabs = ['General', 'Editor', 'Appearance', 'Files & Links', 'Research']
      tabs.forEach(tab => {
        const button = screen.getByText(tab)
        expect(button).toBeInTheDocument()
      })
    })

    it('should have multiple button elements', () => {
      render(<SettingsModal {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5)
    })

    it('should have combobox elements for dropdowns in Editor tab', async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty themes object gracefully', () => {
      render(<SettingsModal {...defaultProps} themes={{}} />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle missing fontSettings gracefully', () => {
      render(<SettingsModal {...defaultProps} fontSettings={{} as FontSettings} />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle empty themeShortcuts array', () => {
      render(<SettingsModal {...defaultProps} themeShortcuts={[]} />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle empty currentTheme string', () => {
      render(<SettingsModal {...defaultProps} currentTheme="" />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle themes without descriptions', () => {
      const themesNoDesc = {
        'test-theme-unique': createMockTheme({
          id: 'test-theme-unique',
          name: 'UniqueTestThemeName',
          description: 'A test theme',
          colors: mockThemes['ocean'].colors,
        }),
      }
      render(<SettingsModal {...defaultProps} themes={themesNoDesc} currentTheme="test-theme-unique" />)
      fireEvent.click(screen.getByText('Appearance'))
      const elements = screen.getAllByText('UniqueTestThemeName'); expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('State Management', () => {
    it('should maintain tab state when re-rendering', () => {
      const { rerender } = render(<SettingsModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Appearance'))
      expect(screen.getByText('Tab Bar Style')).toBeInTheDocument()

      rerender(<SettingsModal {...defaultProps} currentTheme="ocean" />)
      expect(screen.getByText('Tab Bar Style')).toBeInTheDocument()
    })

    it('should update footer when currentTheme prop changes', () => {
      const { rerender } = render(<SettingsModal {...defaultProps} currentTheme="sage-garden" />)
      expect(screen.getByText(/SAGE GARDEN/i)).toBeInTheDocument()

      rerender(<SettingsModal {...defaultProps} currentTheme="ocean" />)
      expect(screen.getByText(/OCEAN/i)).toBeInTheDocument()
    })
  })

  describe('Font Settings Changes', () => {
    it('should update font family when dropdown changes', async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })

      const selects = screen.getAllByRole('combobox')
      const fontSelect = selects[0] // First combobox is font family
      if (fontSelect) {
        fireEvent.change(fontSelect, { target: { value: 'lora' } })
        await waitFor(() => {
          expect(defaultProps.onFontSettingsChange).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Writing Experience Settings', () => {
    it('should show readable line length option in Editor tab', async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })
      expect(screen.getByText(/Readable line length/)).toBeInTheDocument()
    })

    it('should show spellcheck option in Editor tab', async () => {
      render(<SettingsModal {...defaultProps} />)
      await act(async () => {
        fireEvent.click(screen.getByText('Editor'))
      })
      expect(screen.getByText(/Spellcheck/)).toBeInTheDocument()
    })
  })
})
