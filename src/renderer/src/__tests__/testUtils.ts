/**
 * Test Utilities - Properly typed mock data factories
 *
 * USE THESE instead of inline mocks to prevent type drift.
 * When an interface gains a required field, update the factory once —
 * all tests inherit the fix automatically.
 */

import type { Note, Project, Tag, ProjectType, ProjectStatus } from '../types'
import type { Theme, ThemeColors } from '../lib/themes'
import type { UserPreferences } from '../lib/preferences'
import { DEFAULT_SIDEBAR_TAB_ORDER } from '../lib/preferences'

// Default timestamps
const NOW = Math.floor(Date.now() / 1000)

/**
 * Create a properly typed mock Note
 */
export function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    id: `note-${Math.random().toString(36).slice(2, 9)}`,
    title: 'Test Note',
    content: 'Test content',
    folder: '/',
    project_id: null,
    created_at: NOW,
    updated_at: NOW,
    deleted_at: null,
    ...overrides
  }
}

/**
 * Create a properly typed mock Project
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: `project-${Math.random().toString(36).slice(2, 9)}`,
    name: 'Test Project',
    type: 'generic' as ProjectType,
    status: 'active' as ProjectStatus,
    created_at: NOW,
    updated_at: NOW,
    ...overrides
  }
}

/**
 * Create a properly typed mock Tag
 */
export function createMockTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: `tag-${Math.random().toString(36).slice(2, 9)}`,
    name: 'test-tag',
    color: '#3B82F6',
    created_at: NOW,
    ...overrides
  }
}

/**
 * Create multiple mock notes
 */
export function createMockNotes(count: number, baseOverrides: Partial<Note> = {}): Note[] {
  return Array.from({ length: count }, (_, i) =>
    createMockNote({
      id: `note-${i + 1}`,
      title: `Note ${i + 1}`,
      ...baseOverrides
    })
  )
}

/**
 * Create multiple mock projects
 */
export function createMockProjects(count: number, baseOverrides: Partial<Project> = {}): Project[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProject({
      id: `project-${i + 1}`,
      name: `Project ${i + 1}`,
      ...baseOverrides
    })
  )
}

/**
 * Create a properly typed mock ThemeColors
 */
export function createMockThemeColors(overrides: Partial<ThemeColors> = {}): ThemeColors {
  return {
    bgPrimary: '#0a0c10',
    bgSecondary: '#12161c',
    bgTertiary: '#1a1e28',
    textPrimary: '#e8eaf0',
    textMuted: '#6b7394',
    accent: '#4a9eff',
    accentHover: '#6bb3ff',
    ...overrides
  }
}

/**
 * Create a properly typed mock Theme
 * Nested colors are generated via createMockThemeColors()
 */
export function createMockTheme(overrides: Partial<Theme> & { colors?: Partial<ThemeColors> } = {}): Theme {
  const { colors: colorOverrides, ...themeOverrides } = overrides
  return {
    id: 'test-theme',
    name: 'Test Theme',
    type: 'dark',
    description: 'A test theme',
    colors: createMockThemeColors(colorOverrides),
    ...themeOverrides
  }
}

/**
 * Create a properly typed mock UserPreferences
 * Defaults match DEFAULT_PREFERENCES from preferences.ts
 */
export function createMockPreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    defaultWordGoal: 500,
    focusModeEnabled: false,
    lastSessionDate: null,
    currentStreak: 0,
    totalWordsWritten: 0,
    showWordGoalProgress: true,
    celebrateMilestones: true,
    streakDisplayOptIn: false,
    openLastPage: true,
    editorMode: 'source',
    customCSS: '',
    customCSSEnabled: false,
    readableLineLength: true,
    spellcheck: false,
    hudMode: 'layered',
    hudSide: 'left',
    hudRibbonVisible: true,
    tabBarStyle: 'elevated',
    borderStyle: 'soft',
    activeTabStyle: 'elevated',
    sidebarTabSize: 'compact',
    sidebarTabOrder: [...DEFAULT_SIDEBAR_TAB_ORDER],
    sidebarHiddenTabs: [],
    iconGlowEffect: true,
    iconGlowIntensity: 'subtle',
    pomodoroEnabled: true,
    pomodoroWorkMinutes: 25,
    pomodoroShortBreakMinutes: 5,
    pomodoroLongBreakMinutes: 15,
    pomodoroLongBreakInterval: 4,
    ...overrides
  }
}
