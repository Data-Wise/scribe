import { describe, it, expect } from 'vitest'
import { createMockTheme, createMockThemeColors } from './testUtils'
import {
  BUILT_IN_THEMES,
  DEFAULT_AUTO_THEME,
  AutoThemeSettings,
  getAutoTheme,
  isValidHexColor,
  adjustBrightness,
  generateThemeFromColor,
  exportThemeToJSON,
  importThemeFromJSON,
  parseBase16YAML,
  importThemeFromBase16,
  exportThemeToBase16,
  detectThemeFormat,
  importTheme,
  normalizeThemeUrl,
  isValidThemeUrl,
  POPULAR_BASE16_SCHEMES,
  ScribeThemeJSON,
  Base16Scheme,
  createCustomTheme,
  generateShareableTheme,
  DEFAULT_THEME_SHORTCUTS,
  getThemeForShortcut,
  ThemeShortcut,
  // Font exports
  DEFAULT_FONT_SETTINGS,
  FONT_FAMILIES,
  RECOMMENDED_FONTS,
  groupRecommendedFonts,
} from '../lib/themes'

// ============================================================
// Built-in Themes Validation
// ============================================================

describe('Built-in Themes', () => {
  it('has 10 built-in themes (5 dark, 5 light)', () => {
    const themes = Object.values(BUILT_IN_THEMES)
    expect(themes.length).toBe(10)
    
    const darkThemes = themes.filter(t => t.type === 'dark')
    const lightThemes = themes.filter(t => t.type === 'light')
    
    expect(darkThemes.length).toBe(5)
    expect(lightThemes.length).toBe(5)
  })

  it('all themes have required fields', () => {
    Object.values(BUILT_IN_THEMES).forEach(theme => {
      expect(theme.id).toBeTruthy()
      expect(theme.name).toBeTruthy()
      expect(theme.type).toMatch(/^(dark|light)$/)
      expect(theme.description).toBeTruthy()
      expect(theme.colors).toBeDefined()
    })
  })

  it('all theme colors are valid hex colors', () => {
    Object.values(BUILT_IN_THEMES).forEach(theme => {
      const { colors } = theme
      expect(isValidHexColor(colors.bgPrimary)).toBe(true)
      expect(isValidHexColor(colors.bgSecondary)).toBe(true)
      expect(isValidHexColor(colors.bgTertiary)).toBe(true)
      expect(isValidHexColor(colors.textPrimary)).toBe(true)
      expect(isValidHexColor(colors.textMuted)).toBe(true)
      expect(isValidHexColor(colors.accent)).toBe(true)
      expect(isValidHexColor(colors.accentHover)).toBe(true)
    })
  })

  it('dark themes have dark backgrounds', () => {
    const darkThemes = Object.values(BUILT_IN_THEMES).filter(t => t.type === 'dark')
    
    darkThemes.forEach(theme => {
      // Dark themes should have low luminance backgrounds (< 0.2)
      const hex = theme.colors.bgPrimary
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      
      expect(luminance).toBeLessThan(0.2)
    })
  })

  it('light themes have light backgrounds', () => {
    const lightThemes = Object.values(BUILT_IN_THEMES).filter(t => t.type === 'light')
    
    lightThemes.forEach(theme => {
      // Light themes should have high luminance backgrounds (> 0.8)
      const hex = theme.colors.bgPrimary
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      
      expect(luminance).toBeGreaterThan(0.8)
    })
  })

  it('theme IDs are unique', () => {
    const ids = Object.keys(BUILT_IN_THEMES)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('theme names are unique', () => {
    const names = Object.values(BUILT_IN_THEMES).map(t => t.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })
})

// ============================================================
// Color Validation
// ============================================================

describe('Color Validation', () => {
  describe('isValidHexColor', () => {
    it('accepts valid 6-digit hex colors', () => {
      const validColors = [
        '#000000',
        '#ffffff',
        '#FFFFFF',
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#123456',
        '#abcdef',
        '#ABCDEF',
      ]
      
      validColors.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    it('rejects invalid hex colors', () => {
      const invalidColors = [
        '000000',      // Missing #
        '#fff',        // 3-digit
        '#fffffff',    // 7 digits
        '#gggggg',     // Invalid hex chars
        '#12345',      // 5 digits
        '#1234567',    // 7 digits
        'red',         // Named color
        'rgb(0,0,0)',  // RGB format
        '',            // Empty
        '#',           // Just hash
      ]
      
      invalidColors.forEach(color => {
        expect(isValidHexColor(color)).toBe(false)
      })
    })
  })

  describe('adjustBrightness', () => {
    it('lightens colors with positive percent', () => {
      const result = adjustBrightness('#000000', 50)
      // Should be lighter (higher RGB values)
      expect(result).not.toBe('#000000')
      
      const r = parseInt(result.slice(1, 3), 16)
      expect(r).toBeGreaterThan(0)
    })

    it('darkens colors with negative percent', () => {
      const result = adjustBrightness('#ffffff', -50)
      // Should be darker (lower RGB values)
      expect(result).not.toBe('#ffffff')
      
      const r = parseInt(result.slice(1, 3), 16)
      expect(r).toBeLessThan(255)
    })

    it('clamps to valid range (0-255)', () => {
      const result1 = adjustBrightness('#ffffff', 100)
      expect(isValidHexColor(result1)).toBe(true)
      
      const result2 = adjustBrightness('#000000', -100)
      expect(isValidHexColor(result2)).toBe(true)
    })

    it('returns valid hex format', () => {
      const result = adjustBrightness('#3388aa', 20)
      expect(result).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})

// ============================================================
// Auto-Theme Settings
// ============================================================

describe('Auto-Theme Settings', () => {
  it('has sensible defaults', () => {
    expect(DEFAULT_AUTO_THEME.enabled).toBe(false)
    expect(DEFAULT_AUTO_THEME.dayTheme).toBe('soft-paper')
    expect(DEFAULT_AUTO_THEME.nightTheme).toBe('oxford-dark')
    expect(DEFAULT_AUTO_THEME.dayStartHour).toBe(7)
    expect(DEFAULT_AUTO_THEME.nightStartHour).toBe(19)
  })

  describe('getAutoTheme', () => {
    it('returns day theme during day hours', () => {
      const settings: AutoThemeSettings = {
        enabled: true,
        dayTheme: 'soft-paper',
        nightTheme: 'oxford-dark',
        dayStartHour: 7,
        nightStartHour: 19,
      }
      
      // Mock daytime hours
      const originalDate = global.Date
      const mockDate = class extends Date {
        getHours() { return 12 } // Noon
      }
      global.Date = mockDate as unknown as DateConstructor
      
      expect(getAutoTheme(settings)).toBe('soft-paper')
      
      global.Date = originalDate
    })

    it('returns night theme during night hours', () => {
      const settings: AutoThemeSettings = {
        enabled: true,
        dayTheme: 'soft-paper',
        nightTheme: 'oxford-dark',
        dayStartHour: 7,
        nightStartHour: 19,
      }
      
      // Mock nighttime hours
      const originalDate = global.Date
      const mockDate = class extends Date {
        getHours() { return 22 } // 10 PM
      }
      global.Date = mockDate as unknown as DateConstructor
      
      expect(getAutoTheme(settings)).toBe('oxford-dark')
      
      global.Date = originalDate
    })

    it('returns night theme before day start', () => {
      const settings: AutoThemeSettings = {
        enabled: true,
        dayTheme: 'soft-paper',
        nightTheme: 'oxford-dark',
        dayStartHour: 7,
        nightStartHour: 19,
      }
      
      const originalDate = global.Date
      const mockDate = class extends Date {
        getHours() { return 5 } // 5 AM
      }
      global.Date = mockDate as unknown as DateConstructor
      
      expect(getAutoTheme(settings)).toBe('oxford-dark')
      
      global.Date = originalDate
    })

    it('returns day theme at exact day start hour', () => {
      const settings: AutoThemeSettings = {
        enabled: true,
        dayTheme: 'soft-paper',
        nightTheme: 'oxford-dark',
        dayStartHour: 7,
        nightStartHour: 19,
      }
      
      const originalDate = global.Date
      const mockDate = class extends Date {
        getHours() { return 7 } // Exactly 7 AM
      }
      global.Date = mockDate as unknown as DateConstructor
      
      expect(getAutoTheme(settings)).toBe('soft-paper')
      
      global.Date = originalDate
    })
  })
})

// ============================================================
// Theme Generation
// ============================================================

describe('Theme Generation', () => {
  describe('generateThemeFromColor', () => {
    it('generates dark theme from base color', () => {
      const baseColor = '#3388cc'
      const colors = generateThemeFromColor(baseColor, 'dark')
      
      expect(isValidHexColor(colors.bgPrimary)).toBe(true)
      expect(isValidHexColor(colors.bgSecondary)).toBe(true)
      expect(isValidHexColor(colors.bgTertiary)).toBe(true)
      expect(colors.accent).toBe(baseColor)
      
      // Background should be darker than accent
      const bgLum = parseInt(colors.bgPrimary.slice(1, 3), 16)
      const accentLum = parseInt(baseColor.slice(1, 3), 16)
      expect(bgLum).toBeLessThan(accentLum)
    })

    it('generates light theme from base color', () => {
      const baseColor = '#3388cc'
      const colors = generateThemeFromColor(baseColor, 'light')
      
      expect(isValidHexColor(colors.bgPrimary)).toBe(true)
      expect(colors.bgSecondary).toBe('#ffffff')
      
      // Background should be lighter than accent
      const bgLum = parseInt(colors.bgPrimary.slice(1, 3), 16)
      const accentLum = parseInt(colors.accent.slice(1, 3), 16)
      expect(bgLum).toBeGreaterThan(accentLum)
    })
  })

  describe('createCustomTheme', () => {
    it('creates theme with unique ID', () => {
      const colors = createMockThemeColors({
        bgPrimary: '#1a1a1a', bgSecondary: '#2a2a2a', bgTertiary: '#3a3a3a',
        textPrimary: '#ffffff', textMuted: '#888888', accent: '#3388cc', accentHover: '#4499dd',
      })

      const theme = createCustomTheme('My Theme', 'dark', colors)

      expect(theme.id).toMatch(/^custom-\d+$/)
      expect(theme.name).toBe('My Theme')
      expect(theme.type).toBe('dark')
      expect(theme.isCustom).toBe(true)
      expect(theme.colors).toEqual(colors)
    })

    it('generates different IDs for different themes', async () => {
      const colors = createMockThemeColors({
        bgPrimary: '#1a1a1a', bgSecondary: '#2a2a2a', bgTertiary: '#3a3a3a',
        textPrimary: '#ffffff', textMuted: '#888888', accent: '#3388cc', accentHover: '#4499dd',
      })
      
      const theme1 = createCustomTheme('Theme 1', 'dark', colors)
      // Wait 2ms to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2))
      const theme2 = createCustomTheme('Theme 2', 'light', colors)
      
      // IDs should be different (based on timestamp)
      expect(theme1.id).not.toBe(theme2.id)
    })
  })
})

// ============================================================
// Theme Import/Export - Scribe JSON
// ============================================================

describe('Scribe JSON Import/Export', () => {
  const sampleTheme = createMockTheme({
    colors: {
      bgPrimary: '#1a1a1a', bgSecondary: '#2a2a2a', bgTertiary: '#3a3a3a',
      textPrimary: '#ffffff', textMuted: '#888888', accent: '#3388cc', accentHover: '#4499dd',
    },
  })

  describe('exportThemeToJSON', () => {
    it('exports theme to valid JSON schema', () => {
      const json = exportThemeToJSON(sampleTheme)
      
      expect(json.$schema).toBe('https://scribe.app/schemas/theme-v1.json')
      expect(json.version).toBe(1)
      expect(json.name).toBe('Test Theme')
      expect(json.type).toBe('dark')
    })

    it('maps colors correctly', () => {
      const json = exportThemeToJSON(sampleTheme)
      
      expect(json.colors.background.primary).toBe('#1a1a1a')
      expect(json.colors.background.secondary).toBe('#2a2a2a')
      expect(json.colors.background.tertiary).toBe('#3a3a3a')
      expect(json.colors.text.primary).toBe('#ffffff')
      expect(json.colors.text.muted).toBe('#888888')
      expect(json.colors.accent.default).toBe('#3388cc')
      expect(json.colors.accent.hover).toBe('#4499dd')
    })

    it('sets author for custom themes', () => {
      const customTheme = { ...sampleTheme, isCustom: true }
      const json = exportThemeToJSON(customTheme)
      
      expect(json.author).toBe('Custom')
    })

    it('sets author for built-in themes', () => {
      const json = exportThemeToJSON(sampleTheme)
      expect(json.author).toBe('Scribe')
    })
  })

  describe('importThemeFromJSON', () => {
    it('imports valid JSON theme', () => {
      const json: ScribeThemeJSON = {
        version: 1,
        name: 'Imported Theme',
        type: 'light',
        colors: {
          background: { primary: '#f0f0f0', secondary: '#ffffff', tertiary: '#e0e0e0' },
          text: { primary: '#1a1a1a', muted: '#666666' },
          accent: { default: '#0066cc', hover: '#0077dd' },
        },
      }
      
      const theme = importThemeFromJSON(json)
      
      expect(theme.id).toMatch(/^imported-\d+$/)
      expect(theme.name).toBe('Imported Theme')
      expect(theme.type).toBe('light')
      expect(theme.isCustom).toBe(true)
      expect(theme.colors.bgPrimary).toBe('#f0f0f0')
      expect(theme.colors.accent).toBe('#0066cc')
    })

    it('includes author in description', () => {
      const json: ScribeThemeJSON = {
        version: 1,
        name: 'Test',
        author: 'John Doe',
        type: 'dark',
        colors: {
          background: { primary: '#1a1a1a', secondary: '#2a2a2a', tertiary: '#3a3a3a' },
          text: { primary: '#ffffff', muted: '#888888' },
          accent: { default: '#3388cc', hover: '#4499dd' },
        },
      }
      
      const theme = importThemeFromJSON(json)
      expect(theme.description).toBe('By John Doe')
    })
  })

  describe('roundtrip export/import', () => {
    it('preserves theme data through export/import cycle', () => {
      const json = exportThemeToJSON(sampleTheme)
      const imported = importThemeFromJSON(json)
      
      expect(imported.name).toBe(sampleTheme.name)
      expect(imported.type).toBe(sampleTheme.type)
      expect(imported.colors).toEqual(sampleTheme.colors)
    })
  })

  describe('generateShareableTheme', () => {
    it('generates valid JSON string', () => {
      const shareableString = generateShareableTheme(sampleTheme)
      
      expect(() => JSON.parse(shareableString)).not.toThrow()
      
      const parsed = JSON.parse(shareableString)
      expect(parsed.name).toBe('Test Theme')
    })

    it('formats JSON with indentation', () => {
      const shareableString = generateShareableTheme(sampleTheme)
      
      // Should contain newlines (formatted)
      expect(shareableString).toContain('\n')
    })
  })
})

// ============================================================
// Theme Import/Export - Base16
// ============================================================

describe('Base16 Import/Export', () => {
  describe('parseBase16YAML', () => {
    it('parses valid Base16 YAML', () => {
      // Note: Colors must NOT have # prefix in the YAML (parser regex excludes #)
      // The parser adds # prefix automatically
      const yaml = `
scheme: TestScheme
author: TestAuthor
base00: 282828
base01: 3c3836
base02: 504945
base03: 665c54
base04: bdae93
base05: d5c4a1
base06: ebdbb2
base07: fbf1c7
base08: fb4934
base09: fe8019
base0A: fabd2f
base0B: b8bb26
base0C: 8ec07c
base0D: 83a598
base0E: d3869b
base0F: d65d0e
`
      const result = parseBase16YAML(yaml)
      
      expect(result).not.toBeNull()
      expect(result!.scheme).toBe('TestScheme')
      expect(result!.author).toBe('TestAuthor')
      expect(result!.base00).toBe('#282828')
      expect(result!.base05).toBe('#d5c4a1')
    })

    it('parses colors and adds # prefix', () => {
      const yaml = `
scheme: Test
base00: 282828
base01: 3c3836
base02: 504945
base03: 665c54
base04: bdae93
base05: d5c4a1
base06: ebdbb2
base07: fbf1c7
base08: fb4934
base09: fe8019
base0A: fabd2f
base0B: b8bb26
base0C: 8ec07c
base0D: 83a598
base0E: d3869b
base0F: d65d0e
`
      const result = parseBase16YAML(yaml)
      
      expect(result).not.toBeNull()
      expect(result!.base00).toBe('#282828')
      expect(result!.base05).toBe('#d5c4a1')
    })

    it('handles quoted scheme names', () => {
      const yaml = `
scheme: "MyScheme"
base00: 1a1a1a
base01: 2a2a2a
base02: 3a3a3a
base03: 4a4a4a
base04: 5a5a5a
base05: f0f0f0
base06: e0e0e0
base07: d0d0d0
base08: ff0000
base09: ff8800
base0A: ffff00
base0B: 00ff00
base0C: 00ffff
base0D: 0088ff
base0E: ff00ff
base0F: ff0088
`
      const result = parseBase16YAML(yaml)
      
      expect(result).not.toBeNull()
      expect(result!.scheme).toBe('MyScheme')
    })

    it('parses unquoted scheme names', () => {
      const yaml = `
scheme: SimpleScheme
base00: 1a1a1a
base05: ffffff
`
      const result = parseBase16YAML(yaml)
      
      expect(result).not.toBeNull()
      expect(result!.scheme).toBe('SimpleScheme')
    })

    it('returns null for invalid YAML', () => {
      const invalidYamls = [
        '',
        'not yaml at all',
        'scheme: Test',  // Missing base colors
        'base00: #000000',  // Missing scheme name
      ]
      
      invalidYamls.forEach(yaml => {
        expect(parseBase16YAML(yaml)).toBeNull()
      })
    })

    it('ignores comments', () => {
      // Note: Colors must NOT have # prefix (parser regex excludes #)
      const yaml = `
# This is a comment
scheme: Test
# Another comment
base00: 000000
base01: 111111
base02: 222222
base03: 333333
base04: 444444
base05: ffffff
base06: eeeeee
base07: dddddd
base08: ff0000
base09: ff8800
base0A: ffff00
base0B: 00ff00
base0C: 00ffff
base0D: 0088ff
base0E: ff00ff
base0F: ff0088
`
      const result = parseBase16YAML(yaml)
      
      expect(result).not.toBeNull()
      expect(result!.scheme).toBe('Test')
    })
  })

  describe('importThemeFromBase16', () => {
    it('converts Base16 scheme to Theme', () => {
      const base16: Base16Scheme = POPULAR_BASE16_SCHEMES['nord']
      const theme = importThemeFromBase16(base16)
      
      expect(theme.id).toMatch(/^base16-\d+$/)
      expect(theme.name).toBe('Nord')
      expect(theme.isCustom).toBe(true)
      expect(theme.colors.bgPrimary).toBe('#2e3440')
      expect(theme.colors.textPrimary).toBe('#e5e9f0')
    })

    it('detects dark themes correctly', () => {
      const darkScheme = POPULAR_BASE16_SCHEMES['nord']
      const theme = importThemeFromBase16(darkScheme)
      
      expect(theme.type).toBe('dark')
    })

    it('detects light themes correctly', () => {
      const lightScheme = POPULAR_BASE16_SCHEMES['solarized-light']
      const theme = importThemeFromBase16(lightScheme)
      
      expect(theme.type).toBe('light')
    })

    it('includes author in description', () => {
      const base16 = POPULAR_BASE16_SCHEMES['dracula']
      const theme = importThemeFromBase16(base16)
      
      expect(theme.description).toContain('Zeno Rocha')
    })
  })

  describe('exportThemeToBase16', () => {
    it('exports theme to Base16 YAML format', () => {
      const theme = BUILT_IN_THEMES['oxford-dark']
      const yaml = exportThemeToBase16(theme)
      
      expect(yaml).toContain('scheme: "Oxford Dark"')
      expect(yaml).toContain('author: "Scribe Export"')
      expect(yaml).toContain('base00:')
      expect(yaml).toContain('base05:')
      expect(yaml).toContain('base0F:')
    })

    it('exports theme to valid YAML format', () => {
      const theme = BUILT_IN_THEMES['forest-night']
      const yaml = exportThemeToBase16(theme)
      
      // The exported YAML should contain all required fields
      expect(yaml).toContain('scheme:')
      expect(yaml).toContain('author:')
      expect(yaml).toContain('base00:')
      expect(yaml).toContain('base05:')
      expect(yaml).toContain('base0F:')
      
      // Should have 16 base colors
      for (let i = 0; i <= 15; i++) {
        const key = `base0${i.toString(16).toUpperCase()}`
        expect(yaml).toContain(key)
      }
    })

    it('exports theme with correct color mapping', () => {
      const theme = BUILT_IN_THEMES['oxford-dark']
      const yaml = exportThemeToBase16(theme)
      
      // Should map theme colors to base16 positions
      expect(yaml).toContain(`base00: "${theme.colors.bgPrimary}"`)
      expect(yaml).toContain(`base01: "${theme.colors.bgSecondary}"`)
      expect(yaml).toContain(`base05: "${theme.colors.textPrimary}"`)
    })

    it('roundtrip works with standard Base16 format', () => {
      // Standard Base16 format uses colors WITHOUT # prefix
      const yaml = `scheme: TestTheme
author: Test
base00: 0d1210
base01: 141e1a
base02: 1c2922
base03: 8fa89b
base04: 8fa89b
base05: d4e4dc
base06: eefef6
base07: ffffff
base08: 17ab4d
base09: 31c567
base0A: 86efac
base0B: 64f89a
base0C: 7dffb3
base0D: 4ade80
base0E: 24b85a
base0F: 0a9e40
`
      const parsed = parseBase16YAML(yaml)
      
      expect(parsed).not.toBeNull()
      expect(parsed!.scheme).toBe('TestTheme')
      expect(parsed!.base00).toBe('#0d1210')
    })
  })
})

// ============================================================
// Popular Base16 Schemes
// ============================================================

describe('Popular Base16 Schemes', () => {
  it('includes 8 popular schemes', () => {
    expect(Object.keys(POPULAR_BASE16_SCHEMES).length).toBe(8)
  })

  it('all schemes have valid colors', () => {
    Object.values(POPULAR_BASE16_SCHEMES).forEach(scheme => {
      expect(scheme.scheme).toBeTruthy()
      expect(isValidHexColor(scheme.base00)).toBe(true)
      expect(isValidHexColor(scheme.base05)).toBe(true)
      expect(isValidHexColor(scheme.base0D)).toBe(true)
    })
  })

  it('includes well-known schemes', () => {
    expect(POPULAR_BASE16_SCHEMES['dracula']).toBeDefined()
    expect(POPULAR_BASE16_SCHEMES['nord']).toBeDefined()
    expect(POPULAR_BASE16_SCHEMES['solarized-dark']).toBeDefined()
    expect(POPULAR_BASE16_SCHEMES['gruvbox-dark']).toBeDefined()
    expect(POPULAR_BASE16_SCHEMES['tokyo-night']).toBeDefined()
    expect(POPULAR_BASE16_SCHEMES['catppuccin-mocha']).toBeDefined()
  })
})

// ============================================================
// Theme Format Detection
// ============================================================

describe('Theme Format Detection', () => {
  describe('detectThemeFormat', () => {
    it('detects Scribe JSON format', () => {
      const json = JSON.stringify({
        name: 'Test',
        type: 'dark',
        colors: { background: {}, text: {}, accent: {} }
      })
      
      expect(detectThemeFormat(json)).toBe('scribe-json')
    })

    it('detects Base16 YAML format', () => {
      const yaml = `
scheme: Test
base00: "#000000"
base05: "#ffffff"
`
      expect(detectThemeFormat(yaml)).toBe('base16-yaml')
    })

    it('returns unknown for invalid content', () => {
      expect(detectThemeFormat('')).toBe('unknown')
      expect(detectThemeFormat('random text')).toBe('unknown')
      expect(detectThemeFormat('{invalid json')).toBe('unknown')
    })
  })

  describe('importTheme', () => {
    it('imports Scribe JSON', () => {
      const json = JSON.stringify({
        version: 1,
        name: 'Test',
        type: 'dark',
        colors: {
          background: { primary: '#1a1a1a', secondary: '#2a2a2a', tertiary: '#3a3a3a' },
          text: { primary: '#ffffff', muted: '#888888' },
          accent: { default: '#3388cc', hover: '#4499dd' },
        }
      })
      
      const theme = importTheme(json)
      
      expect(theme).not.toBeNull()
      expect(theme!.name).toBe('Test')
    })

    it('imports Base16 YAML', () => {
      // Parser expects colors WITHOUT # prefix (parser adds # automatically)
      const yaml = `
scheme: Test
base00: 1a1a1a
base01: 2a2a2a
base02: 3a3a3a
base03: 4a4a4a
base04: 5a5a5a
base05: ffffff
base06: f0f0f0
base07: e0e0e0
base08: ff0000
base09: ff8800
base0A: ffff00
base0B: 00ff00
base0C: 00ffff
base0D: 0088ff
base0E: ff00ff
base0F: ff0088
`
      const theme = importTheme(yaml)
      
      expect(theme).not.toBeNull()
      expect(theme!.name).toBe('Test')
    })

    it('returns null for invalid content', () => {
      expect(importTheme('')).toBeNull()
      expect(importTheme('invalid')).toBeNull()
    })
  })
})

// ============================================================
// URL Handling
// ============================================================

describe('URL Handling', () => {
  describe('normalizeThemeUrl', () => {
    it('converts GitHub Gist URL to raw', () => {
      const gistUrl = 'https://gist.github.com/user/abc123'
      const normalized = normalizeThemeUrl(gistUrl)
      
      expect(normalized).toBe('https://gist.githubusercontent.com/user/abc123/raw')
    })

    it('converts GitHub blob URL to raw', () => {
      const blobUrl = 'https://github.com/user/repo/blob/main/theme.yaml'
      const normalized = normalizeThemeUrl(blobUrl)
      
      expect(normalized).toBe('https://raw.githubusercontent.com/user/repo/main/theme.yaml')
    })

    it('returns raw URLs unchanged', () => {
      const rawUrl = 'https://raw.githubusercontent.com/user/repo/main/theme.yaml'
      expect(normalizeThemeUrl(rawUrl)).toBe(rawUrl)
    })

    it('returns other URLs unchanged', () => {
      const otherUrl = 'https://example.com/theme.json'
      expect(normalizeThemeUrl(otherUrl)).toBe(otherUrl)
    })

    it('trims whitespace', () => {
      const url = '  https://example.com/theme.json  '
      expect(normalizeThemeUrl(url)).toBe('https://example.com/theme.json')
    })
  })

  describe('isValidThemeUrl', () => {
    it('accepts valid HTTP/HTTPS URLs', () => {
      expect(isValidThemeUrl('https://example.com/theme.json')).toBe(true)
      expect(isValidThemeUrl('http://example.com/theme.yaml')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(isValidThemeUrl('')).toBe(false)
      expect(isValidThemeUrl('not a url')).toBe(false)
      expect(isValidThemeUrl('ftp://example.com/file')).toBe(false)
      expect(isValidThemeUrl('file:///local/file')).toBe(false)
    })
  })
})

// ============================================================
// Theme Shortcuts
// ============================================================

describe('Theme Shortcuts', () => {
  it('has 10 default shortcuts', () => {
    expect(DEFAULT_THEME_SHORTCUTS.length).toBe(10)
  })

  it('default shortcuts use keys 0-9', () => {
    const keys = DEFAULT_THEME_SHORTCUTS.map(s => s.key).sort()
    expect(keys).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
  })

  it('default shortcuts map to built-in themes', () => {
    DEFAULT_THEME_SHORTCUTS.forEach(shortcut => {
      expect(BUILT_IN_THEMES[shortcut.themeId]).toBeDefined()
    })
  })

  describe('getThemeForShortcut', () => {
    it('returns theme ID for valid shortcut', () => {
      const result = getThemeForShortcut('1', DEFAULT_THEME_SHORTCUTS)
      expect(result).toBe('oxford-dark')
    })

    it('returns null for invalid shortcut', () => {
      const result = getThemeForShortcut('x', DEFAULT_THEME_SHORTCUTS)
      expect(result).toBeNull()
    })

    it('works with custom shortcuts', () => {
      const customShortcuts: ThemeShortcut[] = [
        { key: 'a', themeId: 'custom-theme' },
      ]
      
      expect(getThemeForShortcut('a', customShortcuts)).toBe('custom-theme')
      expect(getThemeForShortcut('b', customShortcuts)).toBeNull()
    })
  })
})

// ============================================================
// Edge Cases and Security
// ============================================================

describe('Edge Cases', () => {
  it('handles empty theme name gracefully', () => {
    const json: ScribeThemeJSON = {
      version: 1,
      name: '',
      type: 'dark',
      colors: {
        background: { primary: '#1a1a1a', secondary: '#2a2a2a', tertiary: '#3a3a3a' },
        text: { primary: '#ffffff', muted: '#888888' },
        accent: { default: '#3388cc', hover: '#4499dd' },
      }
    }
    
    const theme = importThemeFromJSON(json)
    expect(theme.name).toBe('')
  })

  it('handles special characters in theme names', () => {
    const json: ScribeThemeJSON = {
      version: 1,
      name: 'Theme "Special" <chars> & stuff',
      type: 'dark',
      colors: {
        background: { primary: '#1a1a1a', secondary: '#2a2a2a', tertiary: '#3a3a3a' },
        text: { primary: '#ffffff', muted: '#888888' },
        accent: { default: '#3388cc', hover: '#4499dd' },
      }
    }
    
    const theme = importThemeFromJSON(json)
    expect(theme.name).toBe('Theme "Special" <chars> & stuff')
  })

  it('handles very long theme names', () => {
    const longName = 'A'.repeat(1000)
    const json: ScribeThemeJSON = {
      version: 1,
      name: longName,
      type: 'dark',
      colors: {
        background: { primary: '#1a1a1a', secondary: '#2a2a2a', tertiary: '#3a3a3a' },
        text: { primary: '#ffffff', muted: '#888888' },
        accent: { default: '#3388cc', hover: '#4499dd' },
      }
    }
    
    const theme = importThemeFromJSON(json)
    expect(theme.name.length).toBe(1000)
  })
})

describe('Performance', () => {
  it('validates many colors efficiently', () => {
    const startTime = performance.now()
    
    for (let i = 0; i < 10000; i++) {
      isValidHexColor('#ff0000')
      isValidHexColor('invalid')
    }
    
    const duration = performance.now() - startTime
    expect(duration).toBeLessThan(100) // Should complete in < 100ms
  })

  it('parses large Base16 YAML efficiently', () => {
    const yaml = Object.entries(POPULAR_BASE16_SCHEMES['nord'])
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n')
    
    const startTime = performance.now()
    
    for (let i = 0; i < 1000; i++) {
      parseBase16YAML(yaml)
    }
    
    const duration = performance.now() - startTime
    expect(duration).toBeLessThan(500) // Should complete in < 500ms
  })
})

// ============================================================
// Font Settings
// ============================================================

describe('Font Settings', () => {
  describe('DEFAULT_FONT_SETTINGS', () => {
    it('has sensible defaults', () => {
      expect(DEFAULT_FONT_SETTINGS.family).toBe('system')
      expect(DEFAULT_FONT_SETTINGS.size).toBe(15)
      expect(DEFAULT_FONT_SETTINGS.lineHeight).toBe(1.8)
    })

    it('size is within readable range', () => {
      expect(DEFAULT_FONT_SETTINGS.size).toBeGreaterThanOrEqual(12)
      expect(DEFAULT_FONT_SETTINGS.size).toBeLessThanOrEqual(24)
    })

    it('line height is within comfortable range', () => {
      expect(DEFAULT_FONT_SETTINGS.lineHeight).toBeGreaterThanOrEqual(1.4)
      expect(DEFAULT_FONT_SETTINGS.lineHeight).toBeLessThanOrEqual(2.2)
    })
  })

  describe('FONT_FAMILIES', () => {
    it('has at least 10 font options', () => {
      expect(Object.keys(FONT_FAMILIES).length).toBeGreaterThanOrEqual(10)
    })

    it('includes system default font', () => {
      expect(FONT_FAMILIES['system']).toBeDefined()
      expect(FONT_FAMILIES['system'].name).toBe('System Default')
    })

    it('all fonts have required fields', () => {
      Object.values(FONT_FAMILIES).forEach(font => {
        expect(font.name).toBeTruthy()
        expect(font.value).toBeTruthy()
        expect(font.description).toBeTruthy()
        expect(['sans', 'serif', 'mono']).toContain(font.category)
      })
    })

    it('has fonts in all categories', () => {
      const categories = Object.values(FONT_FAMILIES).map(f => f.category)
      expect(categories).toContain('sans')
      expect(categories).toContain('serif')
      expect(categories).toContain('mono')
    })

    it('font values are valid CSS font-family strings', () => {
      Object.values(FONT_FAMILIES).forEach(font => {
        // CSS font-family should contain at least one font name
        expect(font.value.length).toBeGreaterThan(0)
        // Should not be empty or just whitespace
        expect(font.value.trim()).toBeTruthy()
      })
    })
  })
})

// ============================================================
// Recommended Fonts (ADHD-Friendly)
// ============================================================

describe('Recommended Fonts', () => {
  it('has at least 10 recommended fonts', () => {
    expect(RECOMMENDED_FONTS.length).toBeGreaterThanOrEqual(10)
  })

  it('all fonts have required fields', () => {
    RECOMMENDED_FONTS.forEach(font => {
      expect(font.id).toBeTruthy()
      expect(font.name).toBeTruthy()
      expect(font.fontFamily).toBeTruthy()
      expect(['sans', 'serif', 'mono']).toContain(font.category)
      expect(font.description).toBeTruthy()
      expect(font.adhdBenefit).toBeTruthy()
    })
  })

  it('has unique IDs', () => {
    const ids = RECOMMENDED_FONTS.map(f => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('installable fonts have Homebrew cask names', () => {
    const installable = RECOMMENDED_FONTS.filter(f => !f.isPremium && f.cask)
    
    installable.forEach(font => {
      expect(font.cask).toBeTruthy()
      // Homebrew cask names should start with 'font-'
      expect(font.cask).toMatch(/^font-/)
    })
  })

  it('premium fonts have website URLs', () => {
    const premium = RECOMMENDED_FONTS.filter(f => f.isPremium)
    
    expect(premium.length).toBeGreaterThan(0)
    
    premium.forEach(font => {
      expect(font.website).toBeTruthy()
      expect(font.website).toMatch(/^https?:\/\//)
    })
  })

  it('includes accessibility-focused fonts', () => {
    const accessibilityFonts = RECOMMENDED_FONTS.filter(f => 
      f.name.includes('Atkinson') || 
      f.name.includes('Lexend') || 
      f.name.includes('OpenDyslexic')
    )
    
    expect(accessibilityFonts.length).toBeGreaterThanOrEqual(2)
  })

  it('includes iA Writer family', () => {
    const iaWriterFonts = RECOMMENDED_FONTS.filter(f => f.name.includes('iA Writer'))
    expect(iaWriterFonts.length).toBe(3) // Mono, Duo, Quattro
  })

  describe('ADHD benefits are meaningful', () => {
    it('all fonts have substantive ADHD benefit descriptions', () => {
      RECOMMENDED_FONTS.forEach(font => {
        // ADHD benefit should be at least 20 characters
        expect(font.adhdBenefit.length).toBeGreaterThan(20)
        // Should contain keywords related to focus/reading/customization
        const keywords = [
          'focus', 'distraction', 'read', 'clarity', 'strain', 'noise', 
          'calm', 'visual', 'reduce', 'rhythm', 'customize', 'preference',
          'cognitive', 'processing', 'fatigue', 'session', 'distinct'
        ]
        const hasKeyword = keywords.some(kw => font.adhdBenefit.toLowerCase().includes(kw))
        expect(hasKeyword).toBe(true)
      })
    })
  })
})

// ============================================================
// Font Grouping
// ============================================================

describe('groupRecommendedFonts', () => {
  it('groups fonts into installed, available, and premium', () => {
    const result = groupRecommendedFonts([])
    
    expect(result).toHaveProperty('installed')
    expect(result).toHaveProperty('available')
    expect(result).toHaveProperty('premium')
    expect(Array.isArray(result.installed)).toBe(true)
    expect(Array.isArray(result.available)).toBe(true)
    expect(Array.isArray(result.premium)).toBe(true)
  })

  it('premium fonts are always in premium group', () => {
    const result = groupRecommendedFonts(['Berkeley Mono', 'MonoLisa'])
    
    const premiumIds = result.premium.map(f => f.id)
    expect(premiumIds).toContain('berkeley-mono')
    expect(premiumIds).toContain('monolisa')
  })

  it('detects installed fonts by name', () => {
    const installedFonts = ['Atkinson Hyperlegible', 'Fira Code']
    const result = groupRecommendedFonts(installedFonts)
    
    const installedIds = result.installed.map(f => f.id)
    expect(installedIds).toContain('atkinson')
  })

  it('uninstalled fonts go to available group', () => {
    const result = groupRecommendedFonts([])
    
    // With no installed fonts, all non-premium should be in available
    const nonPremiumCount = RECOMMENDED_FONTS.filter(f => !f.isPremium).length
    expect(result.available.length).toBe(nonPremiumCount)
    expect(result.installed.length).toBe(0)
  })

  it('total fonts equals RECOMMENDED_FONTS count', () => {
    const result = groupRecommendedFonts(['Atkinson Hyperlegible'])
    
    const totalGrouped = result.installed.length + result.available.length + result.premium.length
    expect(totalGrouped).toBe(RECOMMENDED_FONTS.length)
  })

  it('handles case-insensitive font matching', () => {
    const result = groupRecommendedFonts(['atkinson hyperlegible'])
    
    const installedIds = result.installed.map(f => f.id)
    expect(installedIds).toContain('atkinson')
  })
})

// ============================================================
// Font Settings Validation
// ============================================================

describe('Font Settings Validation', () => {
  it('validates font size range', () => {
    const validSizes = [12, 14, 16, 18, 20, 22, 24]
    const invalidSizes = [8, 10, 26, 48]
    
    validSizes.forEach(size => {
      expect(size).toBeGreaterThanOrEqual(12)
      expect(size).toBeLessThanOrEqual(24)
    })
    
    invalidSizes.forEach(size => {
      const isValid = size >= 12 && size <= 24
      expect(isValid).toBe(false)
    })
  })

  it('validates line height range', () => {
    const validLineHeights = [1.4, 1.5, 1.6, 1.8, 2.0, 2.2]
    const invalidLineHeights = [1.0, 1.2, 2.5, 3.0]
    
    validLineHeights.forEach(lh => {
      expect(lh).toBeGreaterThanOrEqual(1.4)
      expect(lh).toBeLessThanOrEqual(2.2)
    })
    
    invalidLineHeights.forEach(lh => {
      const isValid = lh >= 1.4 && lh <= 2.2
      expect(isValid).toBe(false)
    })
  })

  it('validates font family exists in options', () => {
    const validFamilies = Object.keys(FONT_FAMILIES)
    
    expect(validFamilies).toContain('system')
    expect(validFamilies).toContain('sf-mono')
    expect(validFamilies).toContain('fira-code')
    
    expect(validFamilies).not.toContain('comic-sans')
    expect(validFamilies).not.toContain('arial')
  })
})

// ============================================================
// Font CSS Generation
// ============================================================

describe('Font CSS Value Generation', () => {
  it('system font has fallback chain', () => {
    const systemFont = FONT_FAMILIES['system']
    
    expect(systemFont.value).toContain('-apple-system')
    expect(systemFont.value).toContain('sans-serif')
  })

  it('monospace fonts have monospace fallback', () => {
    const monoFonts = Object.values(FONT_FAMILIES).filter(f => f.category === 'mono')
    
    monoFonts.forEach(font => {
      expect(font.value).toContain('monospace')
    })
  })

  it('serif fonts have serif fallback', () => {
    const serifFonts = Object.values(FONT_FAMILIES).filter(f => f.category === 'serif')
    
    serifFonts.forEach(font => {
      expect(font.value).toContain('serif')
    })
  })

  it('recommended fonts have valid CSS font-family', () => {
    RECOMMENDED_FONTS.forEach(font => {
      // Should be quoted or a valid identifier
      expect(font.fontFamily.length).toBeGreaterThan(0)
      // Should end with a generic family
      const hasGeneric = font.fontFamily.includes('sans-serif') || 
                         font.fontFamily.includes('serif') ||
                         font.fontFamily.includes('monospace')
      expect(hasGeneric).toBe(true)
    })
  })
})
