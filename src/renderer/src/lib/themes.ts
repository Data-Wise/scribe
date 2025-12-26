/**
 * ADHD-Friendly Theme System
 * 
 * Features:
 * - 10 built-in themes (5 dark, 5 light)
 * - Auto-theme by time of day
 * - Custom theme creator
 * - localStorage persistence
 */

export interface ThemeColors {
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  textPrimary: string
  textMuted: string
  accent: string
  accentHover: string
}

export interface Theme {
  id: string
  name: string
  type: 'dark' | 'light'
  description: string
  colors: ThemeColors
  isCustom?: boolean
}

// Built-in themes
export const BUILT_IN_THEMES: Record<string, Theme> = {
  // Dark themes
  'oxford-dark': {
    id: 'oxford-dark',
    name: 'Oxford Dark',
    type: 'dark',
    description: 'Cool academic blues',
    colors: {
      bgPrimary: '#0a0c10',
      bgSecondary: '#12161c',
      bgTertiary: '#1a1f26',
      textPrimary: '#e2e8f0',
      textMuted: '#94a3b8',
      accent: '#38bdf8',
      accentHover: '#7dd3fc',
    }
  },
  'forest-night': {
    id: 'forest-night',
    name: 'Forest Night',
    type: 'dark',
    description: 'Calming deep greens',
    colors: {
      bgPrimary: '#0d1210',
      bgSecondary: '#141e1a',
      bgTertiary: '#1c2922',
      textPrimary: '#d4e4dc',
      textMuted: '#8fa89b',
      accent: '#4ade80',
      accentHover: '#86efac',
    }
  },
  'warm-cocoa': {
    id: 'warm-cocoa',
    name: 'Warm Cocoa',
    type: 'dark',
    description: 'Cozy warm browns',
    colors: {
      bgPrimary: '#121010',
      bgSecondary: '#1c1816',
      bgTertiary: '#262220',
      textPrimary: '#e8e0d8',
      textMuted: '#a89890',
      accent: '#d4a574',
      accentHover: '#e4c4a4',
    }
  },
  'midnight-purple': {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    type: 'dark',
    description: 'Dreamy soft purples',
    colors: {
      bgPrimary: '#0e0c12',
      bgSecondary: '#16141c',
      bgTertiary: '#201c28',
      textPrimary: '#e4e0ec',
      textMuted: '#9b94a8',
      accent: '#a78bfa',
      accentHover: '#c4b5fd',
    }
  },
  'deep-ocean': {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    type: 'dark',
    description: 'Stable navy blues',
    colors: {
      bgPrimary: '#0a0e14',
      bgSecondary: '#101820',
      bgTertiary: '#182028',
      textPrimary: '#d8e4ec',
      textMuted: '#8898a8',
      accent: '#60a5fa',
      accentHover: '#93c5fd',
    }
  },
  // Light themes
  'soft-paper': {
    id: 'soft-paper',
    name: 'Soft Paper',
    type: 'light',
    description: 'Warm off-white',
    colors: {
      bgPrimary: '#faf8f5',
      bgSecondary: '#ffffff',
      bgTertiary: '#f5f2ed',
      textPrimary: '#2c2416',
      textMuted: '#6b5d4d',
      accent: '#b45309',
      accentHover: '#d97706',
    }
  },
  'morning-fog': {
    id: 'morning-fog',
    name: 'Morning Fog',
    type: 'light',
    description: 'Minimal cool grays',
    colors: {
      bgPrimary: '#f4f6f8',
      bgSecondary: '#ffffff',
      bgTertiary: '#e8eaed',
      textPrimary: '#1e2328',
      textMuted: '#5c6670',
      accent: '#4b5563',
      accentHover: '#6b7280',
    }
  },
  'sage-garden': {
    id: 'sage-garden',
    name: 'Sage Garden',
    type: 'light',
    description: 'Natural calm greens',
    colors: {
      bgPrimary: '#f5f8f5',
      bgSecondary: '#ffffff',
      bgTertiary: '#e8f0e8',
      textPrimary: '#1a2e1a',
      textMuted: '#4a6a4a',
      accent: '#16a34a',
      accentHover: '#22c55e',
    }
  },
  'lavender-mist': {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    type: 'light',
    description: 'Soothing soft purples',
    colors: {
      bgPrimary: '#f8f6fa',
      bgSecondary: '#ffffff',
      bgTertiary: '#f0ecf4',
      textPrimary: '#1e1a24',
      textMuted: '#635a70',
      accent: '#7c3aed',
      accentHover: '#8b5cf6',
    }
  },
  'sand-dune': {
    id: 'sand-dune',
    name: 'Sand Dune',
    type: 'light',
    description: 'Grounding warm neutrals',
    colors: {
      bgPrimary: '#f9f7f4',
      bgSecondary: '#ffffff',
      bgTertiary: '#f0ebe4',
      textPrimary: '#2a2520',
      textMuted: '#6b6055',
      accent: '#92400e',
      accentHover: '#b45309',
    }
  },
}

// Auto-theme settings
export interface AutoThemeSettings {
  enabled: boolean
  dayTheme: string
  nightTheme: string
  dayStartHour: number   // 0-23
  nightStartHour: number // 0-23
}

export const DEFAULT_AUTO_THEME: AutoThemeSettings = {
  enabled: false,
  dayTheme: 'soft-paper',
  nightTheme: 'oxford-dark',
  dayStartHour: 7,    // 7 AM
  nightStartHour: 19, // 7 PM
}

// Get current theme based on time
export function getAutoTheme(settings: AutoThemeSettings): string {
  const hour = new Date().getHours()
  
  if (hour >= settings.dayStartHour && hour < settings.nightStartHour) {
    return settings.dayTheme
  }
  return settings.nightTheme
}

// Custom theme storage
const CUSTOM_THEMES_KEY = 'scribe-custom-themes'
const AUTO_THEME_KEY = 'scribe-auto-theme'
const SELECTED_THEME_KEY = 'scribe-theme'

export function loadCustomThemes(): Record<string, Theme> {
  try {
    const saved = localStorage.getItem(CUSTOM_THEMES_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export function saveCustomThemes(themes: Record<string, Theme>): void {
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes))
}

export function loadAutoThemeSettings(): AutoThemeSettings {
  try {
    const saved = localStorage.getItem(AUTO_THEME_KEY)
    return saved ? { ...DEFAULT_AUTO_THEME, ...JSON.parse(saved) } : DEFAULT_AUTO_THEME
  } catch {
    return DEFAULT_AUTO_THEME
  }
}

export function saveAutoThemeSettings(settings: AutoThemeSettings): void {
  localStorage.setItem(AUTO_THEME_KEY, JSON.stringify(settings))
}

export function loadSelectedTheme(): string {
  return localStorage.getItem(SELECTED_THEME_KEY) || 'oxford-dark'
}

export function saveSelectedTheme(themeId: string): void {
  localStorage.setItem(SELECTED_THEME_KEY, themeId)
}

// Apply theme colors to CSS variables
export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.style.setProperty('--nexus-bg-primary', theme.colors.bgPrimary)
  root.style.setProperty('--nexus-bg-secondary', theme.colors.bgSecondary)
  root.style.setProperty('--nexus-bg-tertiary', theme.colors.bgTertiary)
  root.style.setProperty('--nexus-text-primary', theme.colors.textPrimary)
  root.style.setProperty('--nexus-text-muted', theme.colors.textMuted)
  root.style.setProperty('--nexus-accent', theme.colors.accent)
  root.style.setProperty('--nexus-accent-hover', theme.colors.accentHover)
}

// Get all themes (built-in + custom)
export function getAllThemes(): Record<string, Theme> {
  return { ...BUILT_IN_THEMES, ...loadCustomThemes() }
}

// Create a new custom theme
export function createCustomTheme(
  name: string,
  type: 'dark' | 'light',
  colors: ThemeColors
): Theme {
  const id = `custom-${Date.now()}`
  return {
    id,
    name,
    type,
    description: 'Custom theme',
    colors,
    isCustom: true,
  }
}

// Delete a custom theme
export function deleteCustomTheme(themeId: string): void {
  const customs = loadCustomThemes()
  delete customs[themeId]
  saveCustomThemes(customs)
}

// Validate hex color
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

// Generate a lighter/darker version of a color
export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

// Generate theme colors from a base color
export function generateThemeFromColor(baseColor: string, type: 'dark' | 'light'): ThemeColors {
  if (type === 'dark') {
    return {
      bgPrimary: adjustBrightness(baseColor, -90),
      bgSecondary: adjustBrightness(baseColor, -80),
      bgTertiary: adjustBrightness(baseColor, -70),
      textPrimary: '#e2e8f0',
      textMuted: '#94a3b8',
      accent: baseColor,
      accentHover: adjustBrightness(baseColor, 20),
    }
  } else {
    return {
      bgPrimary: adjustBrightness(baseColor, 85),
      bgSecondary: '#ffffff',
      bgTertiary: adjustBrightness(baseColor, 75),
      textPrimary: '#1e2328',
      textMuted: '#5c6670',
      accent: adjustBrightness(baseColor, -20),
      accentHover: baseColor,
    }
  }
}
