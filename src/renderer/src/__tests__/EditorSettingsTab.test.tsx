import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorSettingsTab } from '../components/Settings/EditorSettingsTab'
import type { FontSettings } from '../lib/themes'
import * as platform from '../lib/platform'

// Mock dependencies
vi.mock('../lib/platform', () => ({
  isTauri: vi.fn(() => false),
  isBrowser: vi.fn(() => true)
}))

vi.mock('../lib/api', () => ({
  api: {
    getInstalledFonts: vi.fn(),
    isHomebrewAvailable: vi.fn(),
    installFontViaHomebrew: vi.fn()
  }
}))

vi.mock('../lib/dailyNoteTemplates', () => ({
  loadTemplates: vi.fn(() => [
    { id: 'minimal', name: 'Minimal', content: '# {{date}}' },
    { id: 'detailed', name: 'Detailed', content: '# {{date}}\n\n## Tasks\n\n## Notes' }
  ]),
  getSelectedTemplateId: vi.fn(() => 'minimal'),
  setSelectedTemplateId: vi.fn(),
  processTemplate: vi.fn((content) => content.replace('{{date}}', '2024-01-01'))
}))

vi.mock('../lib/preferences', () => ({
  loadPreferences: vi.fn(() => ({
    tabBarStyle: 'elevated',
    borderStyle: 'soft',
    activeTabStyle: 'elevated',
    sidebarTabSize: 'compact',
    sidebarTabOrder: ['properties', 'backlinks', 'tags', 'stats', 'claude', 'terminal'],
    sidebarHiddenTabs: []
  })),
  updatePreferences: vi.fn(),
  TabBarStyle: {},
  BorderStyle: {},
  ActiveTabStyle: {},
  SidebarTabId: {},
  DEFAULT_SIDEBAR_TAB_ORDER: ['properties', 'backlinks', 'tags', 'stats', 'claude', 'terminal']
}))

describe('EditorSettingsTab', () => {
  const mockFontSettings: FontSettings = {
    family: 'inter',
    size: 16,
    lineHeight: 1.6,
    codeFamily: 'jetbrains-mono',
    codeSize: 0.88,
  }

  const mockOnFontSettingsChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders typography section', () => {
    render(
      <EditorSettingsTab
        fontSettings={mockFontSettings}
        onFontSettingsChange={mockOnFontSettingsChange}
      />
    )

    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getAllByText('Font Family').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Font Size')).toBeInTheDocument()
    expect(screen.getByText('Line Height')).toBeInTheDocument()
    expect(screen.getByText('Code Font')).toBeInTheDocument()
  })

  it('renders writing experience section', () => {
    render(
      <EditorSettingsTab
        fontSettings={mockFontSettings}
        onFontSettingsChange={mockOnFontSettingsChange}
      />
    )

    expect(screen.getByText('Writing Experience')).toBeInTheDocument()
    expect(screen.getByText('Readable line length')).toBeInTheDocument()
    expect(screen.getByText('Spellcheck')).toBeInTheDocument()
  })

  it('renders journal template section', () => {
    render(
      <EditorSettingsTab
        fontSettings={mockFontSettings}
        onFontSettingsChange={mockOnFontSettingsChange}
      />
    )

    expect(screen.getByText('Journal Template')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('Detailed')).toBeInTheDocument()
  })

  it('does not render ADHD-Friendly Fonts in browser mode', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)

    render(
      <EditorSettingsTab
        fontSettings={mockFontSettings}
        onFontSettingsChange={mockOnFontSettingsChange}
      />
    )

    expect(screen.queryByText('ADHD-Friendly Fonts')).not.toBeInTheDocument()
  })

  it('renders ADHD-Friendly Fonts in Tauri mode', () => {
    vi.mocked(platform.isTauri).mockReturnValue(true)

    render(
      <EditorSettingsTab
        fontSettings={mockFontSettings}
        onFontSettingsChange={mockOnFontSettingsChange}
      />
    )

    expect(screen.getByText('ADHD-Friendly Fonts')).toBeInTheDocument()
  })
})
