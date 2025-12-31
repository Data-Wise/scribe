import { create } from 'zustand'
import Fuse from 'fuse.js'

// Types
export type SettingType = 'toggle' | 'select' | 'text' | 'number' | 'color' | 'keymap' | 'gallery'
export type SettingsCategory = 'editor' | 'themes' | 'ai' | 'projects' | 'advanced'

export interface SelectOption {
  label: string
  value: string
  description?: string
}

export interface Setting {
  id: string
  type: SettingType
  label: string
  description?: string
  tooltip?: string
  defaultValue: any
  options?: SelectOption[]
  validation?: (value: any) => boolean
  contextualHintLocation?: string
  addedInVersion?: string
}

export interface SettingsSection {
  id: string
  title: string
  description?: string
  collapsed: boolean
  settings: Setting[]
}

export interface SettingsCategoryData {
  id: SettingsCategory
  label: string
  icon: string
  sections: SettingsSection[]
  badge?: 'new' | number
}

export interface QuickAction {
  id: string
  emoji: string
  label: string
  prompt: string
  enabled: boolean
  order: number
  shortcut?: string
  model: 'claude' | 'gemini'
  isCustom: boolean
}

export interface SearchResult {
  settingId: string
  categoryId: SettingsCategory
  sectionId: string
  breadcrumb: string
  score: number
}

interface SettingsState {
  // Settings values
  settings: Record<string, any>

  // UI state
  activeCategory: SettingsCategory
  searchQuery: string
  collapsedSections: Set<string>
  isOpen: boolean

  // Quick Actions
  quickActions: QuickAction[]

  // Actions
  updateSetting: (id: string, value: any) => void
  resetToDefaults: () => void
  searchSettings: (query: string) => SearchResult[]
  exportSettings: () => string
  importSettings: (json: string) => void

  // UI actions
  setActiveCategory: (category: SettingsCategory) => void
  setSearchQuery: (query: string) => void
  toggleSection: (sectionId: string) => void
  openSettings: (category?: SettingsCategory) => void
  closeSettings: () => void

  // Quick Actions
  reorderQuickActions: (fromIndex: number, toIndex: number) => void
  toggleQuickAction: (id: string, enabled: boolean) => void
  updateQuickActionPrompt: (id: string, prompt: string) => void
  assignShortcut: (id: string, shortcut: string) => void
  updateQuickActionModel: (id: string, model: 'claude' | 'gemini') => void
  addCustomQuickAction: (action: Omit<QuickAction, 'id' | 'order'>) => void
  removeQuickAction: (id: string) => void

  // Initialize
  initialize: () => Promise<void>
}

// localStorage keys
const SETTINGS_KEY = 'scribe:settings'
const QUICK_ACTIONS_KEY = 'scribe:quickActions'
const COLLAPSED_SECTIONS_KEY = 'scribe:collapsedSections'

// Default Quick Actions
const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'improve',
    emoji: '✨',
    label: 'Improve',
    prompt: 'Improve clarity and flow, fix grammar, and enhance readability while preserving the author\'s voice.',
    enabled: true,
    order: 0,
    shortcut: '⌘⌥1',
    model: 'claude',
    isCustom: false
  },
  {
    id: 'expand',
    emoji: '📝',
    label: 'Expand',
    prompt: 'Expand on this idea with more detail, examples, and supporting information.',
    enabled: true,
    order: 1,
    shortcut: '⌘⌥2',
    model: 'claude',
    isCustom: false
  },
  {
    id: 'summarize',
    emoji: '📋',
    label: 'Summarize',
    prompt: 'Create a concise summary highlighting key points.',
    enabled: true,
    order: 2,
    shortcut: '⌘⌥3',
    model: 'gemini',
    isCustom: false
  },
  {
    id: 'explain',
    emoji: '💡',
    label: 'Explain',
    prompt: 'Explain this concept in simpler terms, suitable for someone unfamiliar with the topic.',
    enabled: true,
    order: 3,
    shortcut: '⌘⌥4',
    model: 'claude',
    isCustom: false
  },
  {
    id: 'research',
    emoji: '🔍',
    label: 'Research',
    prompt: 'Generate research questions and potential areas for further investigation.',
    enabled: true,
    order: 4,
    shortcut: '⌘⌥5',
    model: 'claude',
    isCustom: false
  }
]

// Helper functions
const getPersistedSettings = (): Record<string, any> => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const persistSettings = (settings: Record<string, any>): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Ignore localStorage errors
  }
}

const getPersistedQuickActions = (): QuickAction[] => {
  try {
    const stored = localStorage.getItem(QUICK_ACTIONS_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_QUICK_ACTIONS
  } catch {
    return DEFAULT_QUICK_ACTIONS
  }
}

const persistQuickActions = (actions: QuickAction[]): void => {
  try {
    localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(actions))
  } catch {
    // Ignore localStorage errors
  }
}

const getPersistedCollapsedSections = (): Set<string> => {
  try {
    const stored = localStorage.getItem(COLLAPSED_SECTIONS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

const persistCollapsedSections = (sections: Set<string>): void => {
  try {
    localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(Array.from(sections)))
  } catch {
    // Ignore localStorage errors
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  settings: getPersistedSettings(),
  activeCategory: 'editor',
  searchQuery: '',
  collapsedSections: getPersistedCollapsedSections(),
  isOpen: false,
  quickActions: getPersistedQuickActions(),

  // Settings actions
  updateSetting: (id: string, value: any) => {
    set((state) => {
      const newSettings = { ...state.settings, [id]: value }
      persistSettings(newSettings)
      return { settings: newSettings }
    })
  },

  resetToDefaults: () => {
    set({ settings: {} })
    persistSettings({})
    // Reset Quick Actions
    set({ quickActions: DEFAULT_QUICK_ACTIONS })
    persistQuickActions(DEFAULT_QUICK_ACTIONS)
  },

  searchSettings: (query: string) => {
    if (!query.trim()) return []

    // Import settings schema (this is safe since it's a static import)
    const { settingsCategories } = require('../lib/settingsSchema')

    // Build searchable items with breadcrumbs
    const searchableItems: Array<{
      settingId: string
      categoryId: SettingsCategory
      sectionId: string
      label: string
      description: string
      breadcrumb: string
    }> = []

    settingsCategories.forEach((category: any) => {
      category.sections.forEach((section: any) => {
        section.settings.forEach((setting: any) => {
          searchableItems.push({
            settingId: setting.id,
            categoryId: category.id,
            sectionId: section.id,
            label: setting.label,
            description: setting.description || '',
            breadcrumb: `${category.label} › ${section.title} › ${setting.label}`
          })
        })
      })
    })

    // Fuzzy search with fuse.js
    const fuse = new Fuse(searchableItems, {
      keys: [
        { name: 'label', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'breadcrumb', weight: 0.5 }
      ],
      threshold: 0.4,
      includeScore: true
    })

    const results = fuse.search(query)

    // Convert to SearchResult format
    return results.map((result) => ({
      settingId: result.item.settingId,
      categoryId: result.item.categoryId,
      sectionId: result.item.sectionId,
      breadcrumb: result.item.breadcrumb,
      score: result.score || 0
    }))
  },

  exportSettings: () => {
    const state = get()
    const exportData = {
      settings: state.settings,
      quickActions: state.quickActions,
      version: '1.7.0'
    }
    return JSON.stringify(exportData, null, 2)
  },

  importSettings: (json: string) => {
    try {
      const importData = JSON.parse(json)
      if (importData.settings) {
        set({ settings: importData.settings })
        persistSettings(importData.settings)
      }
      if (importData.quickActions) {
        set({ quickActions: importData.quickActions })
        persistQuickActions(importData.quickActions)
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw new Error('Invalid settings file format')
    }
  },

  // UI actions
  setActiveCategory: (category: SettingsCategory) => {
    set({ activeCategory: category })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  toggleSection: (sectionId: string) => {
    set((state) => {
      const newCollapsed = new Set(state.collapsedSections)
      if (newCollapsed.has(sectionId)) {
        newCollapsed.delete(sectionId)
      } else {
        newCollapsed.add(sectionId)
      }
      persistCollapsedSections(newCollapsed)
      return { collapsedSections: newCollapsed }
    })
  },

  openSettings: (category?: SettingsCategory) => {
    set({
      isOpen: true,
      activeCategory: category || get().activeCategory
    })
  },

  closeSettings: () => {
    set({ isOpen: false })
  },

  // Quick Actions
  reorderQuickActions: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const actions = [...state.quickActions]
      const [removed] = actions.splice(fromIndex, 1)
      actions.splice(toIndex, 0, removed)

      // Update order property
      const reordered = actions.map((action, index) => ({
        ...action,
        order: index
      }))

      persistQuickActions(reordered)
      return { quickActions: reordered }
    })
  },

  toggleQuickAction: (id: string, enabled: boolean) => {
    set((state) => {
      const actions = state.quickActions.map((action) =>
        action.id === id ? { ...action, enabled } : action
      )
      persistQuickActions(actions)
      return { quickActions: actions }
    })
  },

  updateQuickActionPrompt: (id: string, prompt: string) => {
    set((state) => {
      const actions = state.quickActions.map((action) =>
        action.id === id ? { ...action, prompt } : action
      )
      persistQuickActions(actions)
      return { quickActions: actions }
    })
  },

  assignShortcut: (id: string, shortcut: string) => {
    set((state) => {
      // Clear any existing shortcut assignment
      const actions = state.quickActions.map((action) => {
        if (action.shortcut === shortcut && action.id !== id) {
          return { ...action, shortcut: undefined }
        }
        if (action.id === id) {
          return { ...action, shortcut }
        }
        return action
      })
      persistQuickActions(actions)
      return { quickActions: actions }
    })
  },

  updateQuickActionModel: (id: string, model: 'claude' | 'gemini') => {
    set((state) => {
      const actions = state.quickActions.map((action) =>
        action.id === id ? { ...action, model } : action
      )
      persistQuickActions(actions)
      return { quickActions: actions }
    })
  },

  addCustomQuickAction: (action: Omit<QuickAction, 'id' | 'order'>) => {
    set((state) => {
      // Check if we've hit the limit (10 max)
      if (state.quickActions.length >= 10) {
        throw new Error('Maximum 10 Quick Actions allowed')
      }

      const newAction: QuickAction = {
        ...action,
        id: `custom-${Date.now()}`,
        order: state.quickActions.length,
        isCustom: true
      }

      const actions = [...state.quickActions, newAction]
      persistQuickActions(actions)
      return { quickActions: actions }
    })
  },

  removeQuickAction: (id: string) => {
    set((state) => {
      // Can only remove custom actions
      const action = state.quickActions.find(a => a.id === id)
      if (action && !action.isCustom) {
        throw new Error('Cannot remove default Quick Actions')
      }

      const actions = state.quickActions
        .filter(a => a.id !== id)
        .map((a, index) => ({ ...a, order: index }))

      persistQuickActions(actions)
      return { quickActions: actions }
    })
  },

  // Initialize
  initialize: async () => {
    // Load from localStorage
    const settings = getPersistedSettings()
    const quickActions = getPersistedQuickActions()
    const collapsedSections = getPersistedCollapsedSections()

    set({
      settings,
      quickActions,
      collapsedSections
    })
  }
}))
