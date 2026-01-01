import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  inferTerminalCwd,
  getInferredProjectPath,
  getDefaultTerminalFolder,
  setDefaultTerminalFolder,
  getAppSettings,
  updateAppSettings
} from '../lib/terminal-utils'
import { Project } from '../types'

describe('Terminal Utils', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      }
    }
  })()

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('getAppSettings', () => {
    it('returns default settings when localStorage is empty', () => {
      const settings = getAppSettings()
      expect(settings.defaultTerminalFolder).toBe('~')
    })

    it('returns stored settings when present', () => {
      localStorage.setItem('scribe-app-settings', JSON.stringify({
        defaultTerminalFolder: '~/projects'
      }))

      const settings = getAppSettings()
      expect(settings.defaultTerminalFolder).toBe('~/projects')
    })

    it('merges stored settings with defaults', () => {
      // Store partial settings
      localStorage.setItem('scribe-app-settings', JSON.stringify({
        defaultTerminalFolder: '~/custom'
      }))

      const settings = getAppSettings()
      // Should have the stored value
      expect(settings.defaultTerminalFolder).toBe('~/custom')
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('scribe-app-settings', 'invalid-json')

      const settings = getAppSettings()
      // Should return defaults
      expect(settings.defaultTerminalFolder).toBe('~')
    })
  })

  describe('updateAppSettings', () => {
    it('updates settings in localStorage', () => {
      updateAppSettings({ defaultTerminalFolder: '~/workspace' })

      const stored = localStorage.getItem('scribe-app-settings')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.defaultTerminalFolder).toBe('~/workspace')
    })

    it('merges with existing settings', () => {
      localStorage.setItem('scribe-app-settings', JSON.stringify({
        defaultTerminalFolder: '~/old'
      }))

      updateAppSettings({ defaultTerminalFolder: '~/new' })

      const settings = getAppSettings()
      expect(settings.defaultTerminalFolder).toBe('~/new')
    })

    it('returns updated settings', () => {
      const result = updateAppSettings({ defaultTerminalFolder: '~/test' })
      expect(result.defaultTerminalFolder).toBe('~/test')
    })
  })

  describe('getDefaultTerminalFolder', () => {
    it('returns default folder from settings', () => {
      const folder = getDefaultTerminalFolder()
      expect(folder).toBe('~')
    })

    it('returns custom folder when set', () => {
      setDefaultTerminalFolder('~/my-folder')
      const folder = getDefaultTerminalFolder()
      expect(folder).toBe('~/my-folder')
    })
  })

  describe('setDefaultTerminalFolder', () => {
    it('saves folder to localStorage', () => {
      setDefaultTerminalFolder('~/projects')

      const settings = getAppSettings()
      expect(settings.defaultTerminalFolder).toBe('~/projects')
    })

    it('persists across calls', () => {
      setDefaultTerminalFolder('~/workspace')

      const folder1 = getDefaultTerminalFolder()
      const folder2 = getDefaultTerminalFolder()

      expect(folder1).toBe('~/workspace')
      expect(folder2).toBe('~/workspace')
    })
  })

  describe('inferTerminalCwd', () => {
    it('returns default folder when no project', () => {
      const cwd = inferTerminalCwd(null)
      expect(cwd).toBe('~')
    })

    it('returns custom default when set', () => {
      setDefaultTerminalFolder('~/custom')
      const cwd = inferTerminalCwd(null)
      expect(cwd).toBe('~/custom')
    })

    it('returns project workingDirectory when explicitly set', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        type: 'research',
        settings: {
          workingDirectory: '~/explicit/path'
        },
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/explicit/path')
    })

    it('returns default for demo project "Getting Started"', () => {
      const project: Project = {
        id: '1',
        name: 'Getting Started',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~')
    })

    it('returns default for demo project "Research"', () => {
      const project: Project = {
        id: '1',
        name: 'Research',
        type: 'research',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~')
    })

    it('handles demo project names case-insensitively', () => {
      const project: Project = {
        id: '1',
        name: 'GETTING STARTED',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~')
    })

    it('handles demo project names with extra whitespace', () => {
      const project: Project = {
        id: '1',
        name: '  getting started  ',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~')
    })

    it('infers path for research project', () => {
      const project: Project = {
        id: '1',
        name: 'Mediation Analysis',
        type: 'research',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/research/mediation-analysis')
    })

    it('infers path for teaching project', () => {
      const project: Project = {
        id: '1',
        name: 'STAT 440',
        type: 'teaching',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/teaching/stat-440')
    })

    it('infers path for r-package project', () => {
      const project: Project = {
        id: '1',
        name: 'My Package',
        type: 'r-package',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/r-packages/my-package')
    })

    it('infers path for r-dev project', () => {
      const project: Project = {
        id: '1',
        name: 'Dev Tools',
        type: 'r-dev',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/dev-tools/dev-tools')
    })

    it('infers path for generic project', () => {
      const project: Project = {
        id: '1',
        name: 'My Project',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/my-project')
    })

    it('normalizes project name to folder-friendly format', () => {
      const project: Project = {
        id: '1',
        name: 'Project With Spaces & Special!@# Chars',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      // Spaces become hyphens, special chars removed
      expect(cwd).toBe('~/projects/project-with-spaces--special-chars')
    })

    it('handles multiple consecutive spaces', () => {
      const project: Project = {
        id: '1',
        name: 'Project   With   Gaps',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/project-with-gaps')
    })

    it('removes special characters but keeps hyphens', () => {
      const project: Project = {
        id: '1',
        name: 'React-Redux App v2.0',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/react-redux-app-v20')
    })
  })

  describe('getInferredProjectPath', () => {
    it('returns inferred path for research project', () => {
      const project: Project = {
        id: '1',
        name: 'Causal Study',
        type: 'research',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const path = getInferredProjectPath(project)
      expect(path).toBe('~/projects/research/causal-study')
    })

    it('ignores explicit workingDirectory setting', () => {
      const project: Project = {
        id: '1',
        name: 'Test',
        type: 'generic',
        settings: {
          workingDirectory: '~/custom'
        },
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const path = getInferredProjectPath(project)
      // Should return inferred path, not the explicit one
      expect(path).toBe('~/projects/test')
    })

    it('treats demo projects like regular projects', () => {
      const project: Project = {
        id: '1',
        name: 'Getting Started',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const path = getInferredProjectPath(project)
      // Returns inferred path even for demo projects
      expect(path).toBe('~/projects/getting-started')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty project name', () => {
      const project: Project = {
        id: '1',
        name: '',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      // Empty name becomes empty folder name
      expect(cwd).toBe('~/projects/')
    })

    it('handles project name with only special characters', () => {
      const project: Project = {
        id: '1',
        name: '!@#$%^&*()',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      // All special chars removed
      expect(cwd).toBe('~/projects/')
    })

    it('handles numeric project names', () => {
      const project: Project = {
        id: '1',
        name: '123 Project',
        type: 'generic',
        settings: {},
        created_at: Date.now(),
        updated_at: Date.now()
      }

      const cwd = inferTerminalCwd(project)
      expect(cwd).toBe('~/projects/123-project')
    })
  })
})
