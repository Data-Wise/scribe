import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock xterm modules - must use factory pattern for class mocks
vi.mock('@xterm/xterm', () => {
  return {
    Terminal: class MockTerminal {
      static instances: MockTerminal[] = []
      open = vi.fn()
      write = vi.fn()
      writeln = vi.fn()
      clear = vi.fn()
      dispose = vi.fn()
      onData = vi.fn(() => ({ dispose: vi.fn() }))
      loadAddon = vi.fn()

      constructor() {
        MockTerminal.instances.push(this)
      }
    }
  }
})

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: class MockFitAddon {
    fit = vi.fn()
  }
}))

vi.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: class MockWebLinksAddon {}
}))

// Mock platform detection
vi.mock('../lib/platform', () => ({
  isBrowser: vi.fn(() => true),
  isTauri: vi.fn(() => false)
}))

// Mock API
vi.mock('../lib/api', () => ({
  api: {
    spawnShell: vi.fn(),
    writeToShell: vi.fn(),
    killShell: vi.fn(),
    onShellOutput: vi.fn(() => () => {})
  }
}))

// Import component after mocks
import { TerminalPanel } from '../components/TerminalPanel'
import { Terminal } from '@xterm/xterm'

describe('TerminalPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear Terminal instances
    ;(Terminal as unknown as { instances: unknown[] }).instances = []
  })

  afterEach(() => {
    cleanup()
  })

  describe('Rendering', () => {
    it('renders the terminal panel container', () => {
      render(<TerminalPanel />)
      expect(screen.getByTestId('terminal-panel')).toBeInTheDocument()
    })

    it('renders the header with Terminal title', () => {
      render(<TerminalPanel />)
      expect(screen.getByText('Terminal')).toBeInTheDocument()
    })

    it('renders the terminal container', () => {
      render(<TerminalPanel />)
      expect(screen.getByTestId('terminal-container')).toBeInTheDocument()
    })

    it('shows Browser badge in browser mode', () => {
      render(<TerminalPanel />)
      expect(screen.getByText('Browser')).toBeInTheDocument()
    })

    it('renders clear button', () => {
      render(<TerminalPanel />)
      expect(screen.getByTestId('clear-terminal-button')).toBeInTheDocument()
    })

    it('renders connection status indicator', () => {
      render(<TerminalPanel />)
      // The connection status dot should be present
      const statusDot = screen.getByTitle(/Connected|Disconnected/)
      expect(statusDot).toBeInTheDocument()
    })
  })

  describe('Terminal Initialization', () => {
    it('creates Terminal instance on mount', () => {
      render(<TerminalPanel />)
      const instances = (Terminal as unknown as { instances: unknown[] }).instances
      expect(instances.length).toBe(1)
    })

    it('opens terminal in the container element', () => {
      render(<TerminalPanel />)
      const instances = (Terminal as unknown as { instances: { open: ReturnType<typeof vi.fn> }[] }).instances
      expect(instances[0].open).toHaveBeenCalled()
    })

    it('loads addons', () => {
      render(<TerminalPanel />)
      const instances = (Terminal as unknown as { instances: { loadAddon: ReturnType<typeof vi.fn> }[] }).instances
      expect(instances[0].loadAddon).toHaveBeenCalledTimes(2)
    })

    it('writes welcome message', () => {
      render(<TerminalPanel />)
      const instances = (Terminal as unknown as { instances: { writeln: ReturnType<typeof vi.fn> }[] }).instances
      expect(instances[0].writeln).toHaveBeenCalled()
    })

    it('sets up input handler', () => {
      render(<TerminalPanel />)
      const instances = (Terminal as unknown as { instances: { onData: ReturnType<typeof vi.fn> }[] }).instances
      expect(instances[0].onData).toHaveBeenCalled()
    })
  })

  describe('Clear Functionality', () => {
    it('calls terminal.clear when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<TerminalPanel />)

      const clearButton = screen.getByTestId('clear-terminal-button')
      await user.click(clearButton)

      const instances = (Terminal as unknown as { instances: { clear: ReturnType<typeof vi.fn> }[] }).instances
      expect(instances[0].clear).toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('disposes terminal on unmount', () => {
      const { unmount } = render(<TerminalPanel />)
      const instances = (Terminal as unknown as { instances: { dispose: ReturnType<typeof vi.fn> }[] }).instances

      unmount()

      expect(instances[0].dispose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button titles', () => {
      render(<TerminalPanel />)
      expect(screen.getByTitle('Clear terminal')).toBeInTheDocument()
    })
  })
})
