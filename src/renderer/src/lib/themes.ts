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

// ============================================================
// Theme Import/Export System
// Supports: Scribe JSON, Base16 YAML
// ============================================================

/**
 * Scribe Theme JSON Schema (v1)
 * 
 * {
 *   "$schema": "https://scribe.app/schemas/theme-v1.json",
 *   "version": 1,
 *   "name": "Theme Name",
 *   "author": "Author Name",
 *   "type": "dark" | "light",
 *   "colors": {
 *     "background": { "primary": "#...", "secondary": "#...", "tertiary": "#..." },
 *     "text": { "primary": "#...", "muted": "#..." },
 *     "accent": { "default": "#...", "hover": "#..." }
 *   }
 * }
 */
export interface ScribeThemeJSON {
  $schema?: string
  version: number
  name: string
  author?: string
  type: 'dark' | 'light'
  colors: {
    background: {
      primary: string
      secondary: string
      tertiary: string
    }
    text: {
      primary: string
      muted: string
    }
    accent: {
      default: string
      hover: string
    }
  }
}

/**
 * Base16 Color Scheme
 * https://github.com/chriskempson/base16
 * 
 * 16 colors that map to semantic roles:
 * base00 - Default Background
 * base01 - Lighter Background (status bars, line numbers)
 * base02 - Selection Background
 * base03 - Comments, Invisibles
 * base04 - Dark Foreground (status bars)
 * base05 - Default Foreground
 * base06 - Light Foreground
 * base07 - Light Background
 * base08 - Variables, Tags, Errors
 * base09 - Integers, Constants
 * base0A - Classes, Bold
 * base0B - Strings, Inherited
 * base0C - Support, Regex
 * base0D - Functions, Methods
 * base0E - Keywords
 * base0F - Deprecated, Special
 */
export interface Base16Scheme {
  scheme: string
  author?: string
  base00: string
  base01: string
  base02: string
  base03: string
  base04: string
  base05: string
  base06: string
  base07: string
  base08: string
  base09: string
  base0A: string
  base0B: string
  base0C: string
  base0D: string
  base0E: string
  base0F: string
}

// Export theme to Scribe JSON format
export function exportThemeToJSON(theme: Theme): ScribeThemeJSON {
  return {
    $schema: 'https://scribe.app/schemas/theme-v1.json',
    version: 1,
    name: theme.name,
    author: theme.isCustom ? 'Custom' : 'Scribe',
    type: theme.type,
    colors: {
      background: {
        primary: theme.colors.bgPrimary,
        secondary: theme.colors.bgSecondary,
        tertiary: theme.colors.bgTertiary,
      },
      text: {
        primary: theme.colors.textPrimary,
        muted: theme.colors.textMuted,
      },
      accent: {
        default: theme.colors.accent,
        hover: theme.colors.accentHover,
      },
    },
  }
}

// Import theme from Scribe JSON format
export function importThemeFromJSON(json: ScribeThemeJSON): Theme {
  const id = `imported-${Date.now()}`
  return {
    id,
    name: json.name,
    type: json.type,
    description: json.author ? `By ${json.author}` : 'Imported theme',
    colors: {
      bgPrimary: json.colors.background.primary,
      bgSecondary: json.colors.background.secondary,
      bgTertiary: json.colors.background.tertiary,
      textPrimary: json.colors.text.primary,
      textMuted: json.colors.text.muted,
      accent: json.colors.accent.default,
      accentHover: json.colors.accent.hover,
    },
    isCustom: true,
  }
}

// Parse Base16 YAML (simple parser for the format)
export function parseBase16YAML(yaml: string): Base16Scheme | null {
  try {
    const lines = yaml.split('\n')
    const scheme: Partial<Base16Scheme> = {}
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      
      const match = trimmed.match(/^(\w+):\s*["']?([^"'\s#]+)["']?/)
      if (match) {
        const [, key, value] = match
        if (key === 'scheme') {
          scheme.scheme = value
        } else if (key === 'author') {
          scheme.author = value
        } else if (key.startsWith('base')) {
          const colorValue = value.startsWith('#') ? value : `#${value}`
          ;(scheme as Record<string, string>)[key] = colorValue
        }
      }
    }
    
    // Validate required fields
    if (!scheme.scheme || !scheme.base00 || !scheme.base05) {
      return null
    }
    
    return scheme as Base16Scheme
  } catch {
    return null
  }
}

// Convert Base16 scheme to Scribe theme
export function importThemeFromBase16(base16: Base16Scheme): Theme {
  const id = `base16-${Date.now()}`
  
  // Determine if dark or light based on background luminance
  const bgLum = getLuminance(base16.base00)
  const type = bgLum < 0.5 ? 'dark' : 'light'
  
  return {
    id,
    name: base16.scheme,
    type,
    description: base16.author ? `Base16 by ${base16.author}` : 'Base16 scheme',
    colors: {
      bgPrimary: base16.base00,      // Default background
      bgSecondary: base16.base01,    // Lighter background
      bgTertiary: base16.base02,     // Selection background
      textPrimary: base16.base05,    // Default foreground
      textMuted: base16.base04,      // Dark foreground
      accent: base16.base0D,         // Functions/Methods (usually a nice blue)
      accentHover: base16.base0C,    // Support/Regex (complementary)
    },
    isCustom: true,
  }
}

// Export theme to Base16 YAML format
export function exportThemeToBase16(theme: Theme): string {
  // Generate the 16 colors from our 7
  const base00 = theme.colors.bgPrimary
  const base01 = theme.colors.bgSecondary
  const base02 = theme.colors.bgTertiary
  const base03 = theme.colors.textMuted
  const base04 = theme.colors.textMuted
  const base05 = theme.colors.textPrimary
  const base06 = adjustBrightness(theme.colors.textPrimary, 10)
  const base07 = adjustBrightness(theme.colors.textPrimary, 20)
  const base08 = adjustBrightness(theme.colors.accent, -20) // Errors/Variables
  const base09 = adjustBrightness(theme.colors.accent, -10) // Constants
  const base0A = theme.colors.accentHover                    // Classes
  const base0B = adjustBrightness(theme.colors.accent, 10)   // Strings
  const base0C = adjustBrightness(theme.colors.accent, 20)   // Support
  const base0D = theme.colors.accent                         // Functions
  const base0E = adjustBrightness(theme.colors.accent, -15)  // Keywords
  const base0F = adjustBrightness(theme.colors.accent, -25)  // Deprecated
  
  return `scheme: "${theme.name}"
author: "Scribe Export"
base00: "${base00}"
base01: "${base01}"
base02: "${base02}"
base03: "${base03}"
base04: "${base04}"
base05: "${base05}"
base06: "${base06}"
base07: "${base07}"
base08: "${base08}"
base09: "${base09}"
base0A: "${base0A}"
base0B: "${base0B}"
base0C: "${base0C}"
base0D: "${base0D}"
base0E: "${base0E}"
base0F: "${base0F}"
`
}

// Calculate relative luminance of a hex color
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null
}

// Validate and detect theme format
export function detectThemeFormat(content: string): 'scribe-json' | 'base16-yaml' | 'unknown' {
  const trimmed = content.trim()
  
  // Try JSON first
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.colors && parsed.name && parsed.type) {
        return 'scribe-json'
      }
    } catch {
      // Not valid JSON
    }
  }
  
  // Try Base16 YAML
  if (trimmed.includes('base00:') && trimmed.includes('base05:')) {
    return 'base16-yaml'
  }
  
  return 'unknown'
}

// Import theme from any supported format
export function importTheme(content: string): Theme | null {
  const format = detectThemeFormat(content)
  
  switch (format) {
    case 'scribe-json':
      try {
        const json = JSON.parse(content) as ScribeThemeJSON
        return importThemeFromJSON(json)
      } catch {
        return null
      }
    
    case 'base16-yaml':
      const base16 = parseBase16YAML(content)
      if (base16) {
        return importThemeFromBase16(base16)
      }
      return null
    
    default:
      return null
  }
}

// Generate shareable theme string (JSON)
export function generateShareableTheme(theme: Theme): string {
  const json = exportThemeToJSON(theme)
  return JSON.stringify(json, null, 2)
}

// Popular Base16 schemes for quick import
export const POPULAR_BASE16_SCHEMES: Record<string, Base16Scheme> = {
  'dracula': {
    scheme: 'Dracula',
    author: 'Zeno Rocha',
    base00: '#282936',
    base01: '#3a3c4e',
    base02: '#4d4f68',
    base03: '#626483',
    base04: '#62d6e8',
    base05: '#e9e9f4',
    base06: '#f1f2f8',
    base07: '#f7f7fb',
    base08: '#ea51b2',
    base09: '#b45bcf',
    base0A: '#00f769',
    base0B: '#ebff87',
    base0C: '#a1efe4',
    base0D: '#62d6e8',
    base0E: '#b45bcf',
    base0F: '#00f769',
  },
  'nord': {
    scheme: 'Nord',
    author: 'arcticicestudio',
    base00: '#2e3440',
    base01: '#3b4252',
    base02: '#434c5e',
    base03: '#4c566a',
    base04: '#d8dee9',
    base05: '#e5e9f0',
    base06: '#eceff4',
    base07: '#8fbcbb',
    base08: '#bf616a',
    base09: '#d08770',
    base0A: '#ebcb8b',
    base0B: '#a3be8c',
    base0C: '#88c0d0',
    base0D: '#81a1c1',
    base0E: '#b48ead',
    base0F: '#5e81ac',
  },
  'solarized-dark': {
    scheme: 'Solarized Dark',
    author: 'Ethan Schoonover',
    base00: '#002b36',
    base01: '#073642',
    base02: '#586e75',
    base03: '#657b83',
    base04: '#839496',
    base05: '#93a1a1',
    base06: '#eee8d5',
    base07: '#fdf6e3',
    base08: '#dc322f',
    base09: '#cb4b16',
    base0A: '#b58900',
    base0B: '#859900',
    base0C: '#2aa198',
    base0D: '#268bd2',
    base0E: '#6c71c4',
    base0F: '#d33682',
  },
  'solarized-light': {
    scheme: 'Solarized Light',
    author: 'Ethan Schoonover',
    base00: '#fdf6e3',
    base01: '#eee8d5',
    base02: '#93a1a1',
    base03: '#839496',
    base04: '#657b83',
    base05: '#586e75',
    base06: '#073642',
    base07: '#002b36',
    base08: '#dc322f',
    base09: '#cb4b16',
    base0A: '#b58900',
    base0B: '#859900',
    base0C: '#2aa198',
    base0D: '#268bd2',
    base0E: '#6c71c4',
    base0F: '#d33682',
  },
  'gruvbox-dark': {
    scheme: 'Gruvbox Dark',
    author: 'morhetz',
    base00: '#282828',
    base01: '#3c3836',
    base02: '#504945',
    base03: '#665c54',
    base04: '#bdae93',
    base05: '#d5c4a1',
    base06: '#ebdbb2',
    base07: '#fbf1c7',
    base08: '#fb4934',
    base09: '#fe8019',
    base0A: '#fabd2f',
    base0B: '#b8bb26',
    base0C: '#8ec07c',
    base0D: '#83a598',
    base0E: '#d3869b',
    base0F: '#d65d0e',
  },
  'tokyo-night': {
    scheme: 'Tokyo Night',
    author: 'enkia',
    base00: '#1a1b26',
    base01: '#16161e',
    base02: '#2f3549',
    base03: '#444b6a',
    base04: '#787c99',
    base05: '#a9b1d6',
    base06: '#cbccd1',
    base07: '#d5d6db',
    base08: '#f7768e',
    base09: '#ff9e64',
    base0A: '#e0af68',
    base0B: '#9ece6a',
    base0C: '#73daca',
    base0D: '#7aa2f7',
    base0E: '#bb9af7',
    base0F: '#db4b4b',
  },
  'catppuccin-mocha': {
    scheme: 'Catppuccin Mocha',
    author: 'Catppuccin',
    base00: '#1e1e2e',
    base01: '#181825',
    base02: '#313244',
    base03: '#45475a',
    base04: '#585b70',
    base05: '#cdd6f4',
    base06: '#f5e0dc',
    base07: '#b4befe',
    base08: '#f38ba8',
    base09: '#fab387',
    base0A: '#f9e2af',
    base0B: '#a6e3a1',
    base0C: '#94e2d5',
    base0D: '#89b4fa',
    base0E: '#cba6f7',
    base0F: '#f2cdcd',
  },
  'catppuccin-latte': {
    scheme: 'Catppuccin Latte',
    author: 'Catppuccin',
    base00: '#eff1f5',
    base01: '#e6e9ef',
    base02: '#ccd0da',
    base03: '#bcc0cc',
    base04: '#acb0be',
    base05: '#4c4f69',
    base06: '#dc8a78',
    base07: '#7287fd',
    base08: '#d20f39',
    base09: '#fe640b',
    base0A: '#df8e1d',
    base0B: '#40a02b',
    base0C: '#179299',
    base0D: '#1e66f5',
    base0E: '#8839ef',
    base0F: '#dd7878',
  },
}

// ============================================================
// Theme Download from URL
// Supports: GitHub Gists, Raw URLs, Base16 repos
// ============================================================

/**
 * Convert various URL formats to raw content URLs
 */
export function normalizeThemeUrl(url: string): string {
  const trimmed = url.trim()
  
  // GitHub Gist: convert to raw
  // https://gist.github.com/user/id -> https://gist.githubusercontent.com/user/id/raw
  if (trimmed.includes('gist.github.com') && !trimmed.includes('raw')) {
    const match = trimmed.match(/gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/)
    if (match) {
      return `https://gist.githubusercontent.com/${match[1]}/${match[2]}/raw`
    }
  }
  
  // GitHub blob: convert to raw
  // https://github.com/user/repo/blob/main/file.yaml -> https://raw.githubusercontent.com/user/repo/main/file.yaml
  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/')
  }
  
  // Already raw or other URL - return as is
  return trimmed
}

/**
 * Fetch theme from URL and parse it
 */
export async function fetchThemeFromUrl(url: string): Promise<Theme | null> {
  try {
    const normalizedUrl = normalizeThemeUrl(url)
    
    const response = await fetch(normalizedUrl, {
      headers: {
        'Accept': 'text/plain, application/json, */*'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const content = await response.text()
    return importTheme(content)
  } catch (error) {
    console.error('Failed to fetch theme from URL:', error)
    return null
  }
}

/**
 * Validate URL format
 */
export function isValidThemeUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim())
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// ============================================================
// Editor Font Settings
// ============================================================

export interface FontSettings {
  family: string
  size: number
  lineHeight: number
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  family: 'system',
  size: 18,
  lineHeight: 1.8,
}

// Font family options - ADHD-friendly fonts that are easy to read
export const FONT_FAMILIES: Record<string, { name: string; value: string; description: string }> = {
  'system': {
    name: 'System Default',
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    description: 'Your system\'s default font'
  },
  'inter': {
    name: 'Inter',
    value: '"Inter", -apple-system, sans-serif',
    description: 'Modern, highly readable'
  },
  'source-sans': {
    name: 'Source Sans 3',
    value: '"Source Sans 3", -apple-system, sans-serif',
    description: 'Adobe\'s open-source font'
  },
  'atkinson': {
    name: 'Atkinson Hyperlegible',
    value: '"Atkinson Hyperlegible", -apple-system, sans-serif',
    description: 'Designed for low vision readers'
  },
  'lexend': {
    name: 'Lexend',
    value: '"Lexend", -apple-system, sans-serif',
    description: 'Optimized for reading proficiency'
  },
  'opendyslexic': {
    name: 'OpenDyslexic',
    value: '"OpenDyslexic", -apple-system, sans-serif',
    description: 'Designed for dyslexic readers'
  },
  'ia-writer': {
    name: 'iA Writer Duo',
    value: '"iA Writer Duo", "SF Mono", monospace',
    description: 'Monospace, distraction-free'
  },
  'jetbrains': {
    name: 'JetBrains Mono',
    value: '"JetBrains Mono", "SF Mono", monospace',
    description: 'Developer-focused monospace'
  },
}

const FONT_SETTINGS_KEY = 'scribe-font-settings'

export function loadFontSettings(): FontSettings {
  try {
    const saved = localStorage.getItem(FONT_SETTINGS_KEY)
    return saved ? { ...DEFAULT_FONT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_FONT_SETTINGS
  } catch {
    return DEFAULT_FONT_SETTINGS
  }
}

export function saveFontSettings(settings: FontSettings): void {
  localStorage.setItem(FONT_SETTINGS_KEY, JSON.stringify(settings))
}

export function applyFontSettings(settings: FontSettings): void {
  const root = document.documentElement
  const fontFamily = FONT_FAMILIES[settings.family]?.value || FONT_FAMILIES['system'].value
  
  root.style.setProperty('--editor-font-family', fontFamily)
  root.style.setProperty('--editor-font-size', `${settings.size}px`)
  root.style.setProperty('--editor-line-height', `${settings.lineHeight}`)
}

// ============================================================
// Theme Keyboard Shortcuts
// ============================================================

export interface ThemeShortcut {
  key: string // e.g., '1', '2', 'd', 'l'
  themeId: string
}

const THEME_SHORTCUTS_KEY = 'scribe-theme-shortcuts'

// Default shortcuts: 1-5 for dark themes, 6-0 for light themes
export const DEFAULT_THEME_SHORTCUTS: ThemeShortcut[] = [
  { key: '1', themeId: 'oxford-dark' },
  { key: '2', themeId: 'forest-night' },
  { key: '3', themeId: 'warm-cocoa' },
  { key: '4', themeId: 'midnight-purple' },
  { key: '5', themeId: 'deep-ocean' },
  { key: '6', themeId: 'soft-paper' },
  { key: '7', themeId: 'morning-fog' },
  { key: '8', themeId: 'sage-garden' },
  { key: '9', themeId: 'lavender-mist' },
  { key: '0', themeId: 'sand-dune' },
]

export function loadThemeShortcuts(): ThemeShortcut[] {
  try {
    const saved = localStorage.getItem(THEME_SHORTCUTS_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_THEME_SHORTCUTS
  } catch {
    return DEFAULT_THEME_SHORTCUTS
  }
}

export function saveThemeShortcuts(shortcuts: ThemeShortcut[]): void {
  localStorage.setItem(THEME_SHORTCUTS_KEY, JSON.stringify(shortcuts))
}

/**
 * Get theme ID for a keyboard shortcut
 * Shortcut format: Cmd/Ctrl + Alt + [key]
 */
export function getThemeForShortcut(key: string, shortcuts: ThemeShortcut[]): string | null {
  const shortcut = shortcuts.find(s => s.key === key)
  return shortcut?.themeId || null
}
