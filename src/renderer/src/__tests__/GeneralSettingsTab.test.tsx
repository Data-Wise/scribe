import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GeneralSettingsTab } from '../components/Settings/GeneralSettingsTab'
import * as platform from '../../lib/platform'

// Mock platform detection
vi.mock('../../lib/platform', () => ({
  isTauri: vi.fn(),
  isBrowser: vi.fn()
}))

// Mock preferences
vi.mock('../../lib/preferences', () => ({
  loadPreferences: vi.fn(() => ({ streakDisplayOptIn: false })),
  updatePreferences: vi.fn()
}))

// Mock terminal utils
vi.mock('../../lib/terminal-utils', () => ({
  getDefaultTerminalFolder: vi.fn(() => '~'),
  setDefaultTerminalFolder: vi.fn()
}))

// Mock browser DB
vi.mock('../../lib/browser-db', () => ({
  db: {
    notes: { clear: vi.fn() },
    projects: { clear: vi.fn() },
    tags: { clear: vi.fn() },
    noteTags: { clear: vi.fn() },
    noteLinks: { clear: vi.fn() },
    projectSettings: { clear: vi.fn() }
  },
  seedDemoData: vi.fn()
}))

// Mock PinnedVaultsSettings
vi.mock('../Settings/PinnedVaultsSettings', () => ({
  PinnedVaultsSettings: () => <div data-testid="pinned-vaults-settings">Pinned Vaults</div>
}))

describe('GeneralSettingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders startup settings section', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)
    vi.mocked(platform.isBrowser).mockReturnValue(false)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.getByText('Startup')).toBeInTheDocument()
    expect(screen.getByText('Open last page on startup')).toBeInTheDocument()
  })

  it('renders ADHD features section', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)
    vi.mocked(platform.isBrowser).mockReturnValue(false)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.getByText('ADHD Features')).toBeInTheDocument()
    expect(screen.getByText('Show writing streak milestones')).toBeInTheDocument()
  })

  it('renders identity section', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)
    vi.mocked(platform.isBrowser).mockReturnValue(false)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.getByText('Identity')).toBeInTheDocument()
    expect(screen.getByText('Research Assistant')).toBeInTheDocument()
    expect(screen.getByText('Causal Inference Specialist')).toBeInTheDocument()
  })

  it('renders pinned vaults settings', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)
    vi.mocked(platform.isBrowser).mockReturnValue(false)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.getByTestId('pinned-vaults-settings')).toBeInTheDocument()
  })

  it('shows terminal settings in Tauri mode', () => {
    vi.mocked(platform.isTauri).mockReturnValue(true)
    vi.mocked(platform.isBrowser).mockReturnValue(false)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.getByText('Terminal')).toBeInTheDocument()
    expect(screen.getByText('Default Terminal Folder')).toBeInTheDocument()
  })

  it('hides terminal settings in browser mode', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)
    vi.mocked(platform.isBrowser).mockReturnValue(true)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.queryByText('Default Terminal Folder')).not.toBeInTheDocument()
  })

  it('shows browser mode settings in browser mode', () => {
    vi.mocked(platform.isTauri).mockReturnValue(false)
    vi.mocked(platform.isBrowser).mockReturnValue(true)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.getByText('Browser Mode')).toBeInTheDocument()
    expect(screen.getByText('IndexedDB Storage')).toBeInTheDocument()
    expect(screen.getByText('Clear All Data')).toBeInTheDocument()
    expect(screen.getByText('Restore Demo Data')).toBeInTheDocument()
  })

  it('hides browser mode settings in Tauri mode', () => {
    vi.mocked(platform.isTauri).mockReturnValue(true)
    vi.mocked(platform.isBrowser).mockReturnValue(false)
    
    render(<GeneralSettingsTab />)
    
    expect(screen.queryByText('IndexedDB Storage')).not.toBeInTheDocument()
  })
})
