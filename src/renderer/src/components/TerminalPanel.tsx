import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as TerminalIcon, Trash2, FolderOpen } from 'lucide-react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { isBrowser, isTauri } from '../lib/platform'
import { api } from '../lib/api'
import { useProjectStore } from '../store/useProjectStore'
import { inferTerminalCwd, getDefaultTerminalFolder } from '../lib/terminal-utils'
import '@xterm/xterm/css/xterm.css'

interface TerminalPanelProps {
  /** Called when terminal spawns a shell */
  onShellSpawned?: () => void
}

/**
 * TerminalPanel - Embedded terminal for right sidebar
 *
 * Features:
 * - Full xterm.js terminal emulator
 * - Auto-fits to container size
 * - Clickable URLs with WebLinksAddon
 * - Themed to match Scribe dark mode
 *
 * Browser mode: Shows limited shell with basic commands
 * Tauri mode: Full shell access via PTY
 */
export function TerminalPanel({ onShellSpawned }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentCwd, setCurrentCwd] = useState<string | null>(null)
  const shellIdRef = useRef<number | null>(null)
  const inputBufferRef = useRef<string>('')

  // Get current project from store
  const getCurrentProject = useProjectStore((state) => state.getCurrentProject)

  // Scribe-themed terminal colors
  const theme = {
    background: '#1a1f2e',
    foreground: '#e4e4e7',
    cursor: '#7c9c6b',
    cursorAccent: '#1a1f2e',
    selectionBackground: '#7c9c6b50',
    black: '#1a1f2e',
    red: '#e35b5b',
    green: '#7c9c6b',
    yellow: '#d9a347',
    blue: '#5b8dd9',
    magenta: '#b577c2',
    cyan: '#5bc0de',
    white: '#e4e4e7',
    brightBlack: '#52525b',
    brightRed: '#ff7b7b',
    brightGreen: '#a3c293',
    brightYellow: '#f5c46a',
    brightBlue: '#7baeff',
    brightMagenta: '#d799e5',
    brightCyan: '#7bd8f0',
    brightWhite: '#ffffff'
  }

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      theme,
      fontFamily: '"SF Mono", "Menlo", "Monaco", "Consolas", monospace',
      fontSize: 12,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowTransparency: true,
      convertEol: true
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)
    terminal.open(terminalRef.current)

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Initial fit
    setTimeout(() => {
      try {
        fitAddon.fit()
      } catch {
        // Ignore fit errors on initial render
      }
    }, 0)

    // Start shell connection
    if (isTauri()) {
      startTauriShell(terminal)
    } else {
      startBrowserShell(terminal)
    }

    return () => {
      // Clean up event listeners
      const terminalCleanup = (window as unknown as { __terminalCleanup?: () => void }).__terminalCleanup
      if (terminalCleanup) {
        terminalCleanup()
        delete (window as unknown as { __terminalCleanup?: () => void }).__terminalCleanup
      }

      // Kill shell in Tauri mode
      if (shellIdRef.current !== null && isTauri()) {
        api.killShell?.(shellIdRef.current).catch(() => {})
      }
      terminal.dispose()
    }
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit()
        } catch {
          // Ignore fit errors during resize
        }
      }
    }

    window.addEventListener('resize', handleResize)

    // Also observe container size changes
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [])

  // Resolve working directory - check path, prompt to create if needed
  const resolveWorkingDirectory = async (terminal: Terminal): Promise<string> => {
    const project = getCurrentProject()
    const inferredPath = inferTerminalCwd(project)
    const defaultFolder = getDefaultTerminalFolder()

    // Check if the inferred path exists
    const pathInfo = await api.checkPathExists?.(inferredPath)

    if (pathInfo?.exists && pathInfo?.is_dir) {
      // Path exists, use it
      return inferredPath
    }

    // Path doesn't exist - only prompt if we have a project (not for default folder)
    if (project && inferredPath !== defaultFolder) {
      // Show prompt in terminal and wait for response
      terminal.writeln(`\x1b[33mProject folder not found: ${inferredPath}\x1b[0m`)

      const shouldCreate = await promptCreateDirectory(terminal, inferredPath)

      if (shouldCreate) {
        try {
          await api.createDirectory?.(inferredPath)
          terminal.writeln(`\x1b[32mCreated: ${inferredPath}\x1b[0m`)
          return inferredPath
        } catch (error) {
          terminal.writeln(`\x1b[31mFailed to create directory: ${error}\x1b[0m`)
        }
      }
    }

    // Fall back to default folder
    return defaultFolder
  }

  // Prompt user to create directory (y/n in terminal)
  const promptCreateDirectory = (terminal: Terminal, _path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      terminal.write(`Create folder? (y/n): `)

      const disposable = terminal.onData((data) => {
        const char = data.toLowerCase()
        if (char === 'y' || char === '\r') {
          terminal.writeln('y')
          disposable.dispose()
          resolve(true)
        } else if (char === 'n' || char === '\x1b') {
          terminal.writeln('n')
          disposable.dispose()
          resolve(false)
        }
      })

      // Auto-timeout after 10 seconds - default to no
      setTimeout(() => {
        disposable.dispose()
        terminal.writeln('\x1b[90m(timeout - using default)\x1b[0m')
        resolve(false)
      }, 10000)
    })
  }

  // Start Tauri shell with PTY
  const startTauriShell = async (terminal: Terminal) => {
    try {
      // Write welcome message
      terminal.writeln('\x1b[32m$ Scribe Terminal\x1b[0m')
      terminal.writeln('\x1b[90mConnecting to shell...\x1b[0m')

      // Resolve working directory
      const cwd = await resolveWorkingDirectory(terminal)
      setCurrentCwd(cwd)

      // Spawn shell via Tauri command with working directory
      const result = await api.spawnShell?.(cwd)
      if (result && typeof result === 'object' && 'shell_id' in result) {
        const shellId = result.shell_id as number
        shellIdRef.current = shellId
        setIsConnected(true)
        onShellSpawned?.()

        // Show connection message with directory
        const displayPath = cwd.replace(/^\/Users\/[^/]+/, '~')
        terminal.writeln(`\x1b[32mConnected.\x1b[0m \x1b[90m${displayPath}\x1b[0m\n`)

        // Set up bidirectional communication
        terminal.onData((data) => {
          if (shellIdRef.current !== null) {
            api.writeToShell?.(shellIdRef.current, data)
          }
        })

        // Listen for shell output (filtered by shell_id)
        const unlistenOutput = api.onShellOutput?.((id: number, data: string) => {
          if (id === shellId) {
            terminal.write(data)
          }
        })

        // Listen for shell closed event
        const unlistenClosed = api.onShellClosed?.((id: number) => {
          if (id === shellId) {
            terminal.writeln('\n\x1b[31mShell disconnected.\x1b[0m')
            setIsConnected(false)
            shellIdRef.current = null
          }
        })

        // Update resize to use PTY resize
        const resizeHandler = () => {
          if (fitAddonRef.current && shellIdRef.current !== null) {
            try {
              fitAddonRef.current.fit()
              const { rows, cols } = terminal
              api.resizeShell?.(shellIdRef.current, rows, cols)
            } catch {
              // Ignore resize errors
            }
          }
        }

        // Initial resize
        setTimeout(resizeHandler, 100)

        // Return cleanup (will be called when component unmounts via useEffect return)
        // Store in a ref for cleanup
        const currentCleanup = () => {
          unlistenOutput?.()
          unlistenClosed?.()
        }

        // Register cleanup on the window for when terminal unmounts
        ;(window as unknown as { __terminalCleanup?: () => void }).__terminalCleanup = currentCleanup
      } else {
        throw new Error('Failed to spawn shell')
      }
    } catch {
      // Full PTY shell is a v2 feature - gracefully fall back to browser mode
      terminal.clear()
      startBrowserShell(terminal)
    }
  }

  // Browser mode - limited shell emulation
  const startBrowserShell = (terminal: Terminal) => {
    if (isTauri()) {
      // In Tauri but PTY not implemented yet (v2 feature)
      terminal.writeln('\x1b[33m$ Scribe Terminal (Demo Mode)\x1b[0m')
      terminal.writeln('\x1b[90mFull PTY shell coming in v2\x1b[0m')
    } else {
      // Actually in browser
      terminal.writeln('\x1b[33m$ Scribe Terminal (Browser Mode)\x1b[0m')
      terminal.writeln('\x1b[90mFull shell requires desktop app\x1b[0m')
    }
    terminal.writeln('')
    terminal.writeln('Available commands:')
    terminal.writeln('  \x1b[36mhelp\x1b[0m     - Show this help')
    terminal.writeln('  \x1b[36mecho\x1b[0m     - Echo text')
    terminal.writeln('  \x1b[36mclear\x1b[0m    - Clear terminal')
    terminal.writeln('  \x1b[36mdate\x1b[0m     - Show current date')
    terminal.writeln('  \x1b[36mwhoami\x1b[0m   - Show current user')
    terminal.writeln('')
    terminal.write('\x1b[32m$\x1b[0m ')

    setIsConnected(true)

    // Handle input
    terminal.onData((data) => {
      handleBrowserShellInput(terminal, data)
    })
  }

  // Handle browser shell input
  const handleBrowserShellInput = (terminal: Terminal, data: string) => {
    // Handle special characters
    if (data === '\r') {
      // Enter pressed
      const command = inputBufferRef.current.trim()
      terminal.writeln('')
      if (command) {
        executeBrowserCommand(terminal, command)
      }
      inputBufferRef.current = ''
      terminal.write('\x1b[32m$\x1b[0m ')
    } else if (data === '\x7f') {
      // Backspace
      if (inputBufferRef.current.length > 0) {
        inputBufferRef.current = inputBufferRef.current.slice(0, -1)
        terminal.write('\b \b')
      }
    } else if (data === '\x03') {
      // Ctrl+C
      inputBufferRef.current = ''
      terminal.writeln('^C')
      terminal.write('\x1b[32m$\x1b[0m ')
    } else if (data >= ' ' || data === '\t') {
      // Printable character
      inputBufferRef.current += data
      terminal.write(data)
    }
  }

  // Execute browser shell commands
  const executeBrowserCommand = (terminal: Terminal, command: string) => {
    const [cmd, ...args] = command.split(' ')

    switch (cmd.toLowerCase()) {
      case 'help':
        terminal.writeln('Available commands:')
        terminal.writeln('  help     - Show this help')
        terminal.writeln('  echo     - Echo text')
        terminal.writeln('  clear    - Clear terminal')
        terminal.writeln('  date     - Show current date')
        terminal.writeln('  whoami   - Show current user')
        terminal.writeln('')
        terminal.writeln('\x1b[90mNote: Full shell access requires desktop app.\x1b[0m')
        break

      case 'echo':
        terminal.writeln(args.join(' '))
        break

      case 'clear':
        terminal.clear()
        break

      case 'date':
        terminal.writeln(new Date().toString())
        break

      case 'whoami':
        terminal.writeln('scribe-user (browser mode)')
        break

      case 'pwd':
        terminal.writeln('/scribe/browser')
        break

      case 'ls':
        terminal.writeln('\x1b[90m(virtual directory - use desktop app for real filesystem)\x1b[0m')
        break

      case 'claude':
      case 'gemini':
        terminal.writeln(`\x1b[33m${cmd} requires desktop app for CLI access.\x1b[0m`)
        terminal.writeln('Run: npm run dev')
        break

      case 'quarto':
      case 'git':
      case 'npm':
        terminal.writeln(`\x1b[33m${cmd} requires desktop app for full shell access.\x1b[0m`)
        break

      default:
        terminal.writeln(`\x1b[31mCommand not found: ${cmd}\x1b[0m`)
        terminal.writeln('Type "help" for available commands.')
    }
  }

  const handleClear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear()
    }
  }, [])

  return (
    <div
      className="flex flex-col h-full"
      data-testid="terminal-panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--nexus-bg-tertiary)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <TerminalIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--nexus-accent)' }} />
          <span className="text-xs font-medium shrink-0" style={{ color: 'var(--nexus-text-primary)' }}>
            Terminal
          </span>
          {isBrowser() && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
              style={{ backgroundColor: 'var(--nexus-bg-tertiary)', color: 'var(--nexus-text-muted)' }}
            >
              Browser
            </span>
          )}
          {/* Show current working directory */}
          {currentCwd && isTauri() && (
            <div
              className="flex items-center gap-1 text-[10px] truncate min-w-0"
              style={{ color: 'var(--nexus-text-muted)' }}
              title={currentCwd}
            >
              <FolderOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">{currentCwd.replace(/^\/Users\/[^/]+/, '~')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Connection status */}
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-nexus-bg-tertiary/50 transition-colors"
            title="Clear terminal"
            data-testid="clear-terminal-button"
          >
            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--nexus-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Terminal container */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-hidden"
        data-testid="terminal-container"
        style={{ padding: '4px' }}
      />
    </div>
  )
}

export default TerminalPanel
