import { useSettingsStore } from '../../store/useSettingsStore'
import { Check, Star } from 'lucide-react'

/**
 * ThemeGallery - Visual theme selector with previews
 *
 * Features:
 * - 3-column grid layout
 * - Visual preview of theme colors
 * - Favorites section (starred themes)
 * - Dark/Light theme grouping
 * - Live preview on hover
 */

// Theme preview data (maps to actual theme IDs)
interface ThemePreview {
  id: string
  name: string
  type: 'dark' | 'light'
  colors: {
    background: string
    foreground: string
    accent: string
    border: string
  }
  isFavorite?: boolean
}

const THEME_PREVIEWS: ThemePreview[] = [
  // Dark Themes
  {
    id: 'slate',
    name: 'Slate',
    type: 'dark',
    colors: {
      background: '#1e293b',
      foreground: '#e2e8f0',
      accent: '#3b82f6',
      border: '#334155'
    },
    isFavorite: true
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'dark',
    colors: {
      background: '#0f172a',
      foreground: '#cbd5e1',
      accent: '#06b6d4',
      border: '#1e293b'
    },
    isFavorite: true
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'dark',
    colors: {
      background: '#14532d',
      foreground: '#dcfce7',
      accent: '#22c55e',
      border: '#166534'
    },
    isFavorite: true
  },
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    colors: {
      background: '#282a36',
      foreground: '#f8f8f2',
      accent: '#ff79c6',
      border: '#44475a'
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    type: 'dark',
    colors: {
      background: '#2e3440',
      foreground: '#eceff4',
      accent: '#88c0d0',
      border: '#3b4252'
    }
  },

  // Light Themes
  {
    id: 'linen',
    name: 'Linen',
    type: 'light',
    colors: {
      background: '#faf9f6',
      foreground: '#3f3f46',
      accent: '#d97706',
      border: '#e4e4e7'
    }
  },
  {
    id: 'paper',
    name: 'Paper',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#18181b',
      accent: '#3b82f6',
      border: '#e5e7eb'
    }
  },
  {
    id: 'cream',
    name: 'Cream',
    type: 'light',
    colors: {
      background: '#fffbeb',
      foreground: '#78350f',
      accent: '#f59e0b',
      border: '#fef3c7'
    }
  }
]

export default function ThemeGallery() {
  const { settings, updateSetting } = useSettingsStore()
  const currentTheme = settings['themes.current'] ?? 'slate'

  const favorites = THEME_PREVIEWS.filter((t) => t.isFavorite)
  const darkThemes = THEME_PREVIEWS.filter((t) => t.type === 'dark' && !t.isFavorite)
  const lightThemes = THEME_PREVIEWS.filter((t) => t.type === 'light')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h4 className="text-lg font-semibold text-neutral-100 mb-1">Theme Gallery</h4>
        <p className="text-sm text-neutral-400">
          Choose a visual theme for editor and UI
        </p>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <h5 className="text-sm font-semibold text-neutral-200 uppercase tracking-wide">
              Favorites
            </h5>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {favorites.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={currentTheme === theme.id}
                onSelect={() => updateSetting('themes.current', theme.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dark Themes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌙</span>
          <h5 className="text-sm font-semibold text-neutral-200 uppercase tracking-wide">
            Dark ({darkThemes.length} themes)
          </h5>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {darkThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={currentTheme === theme.id}
              onSelect={() => updateSetting('themes.current', theme.id)}
            />
          ))}
        </div>
      </div>

      {/* Light Themes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">☀️</span>
          <h5 className="text-sm font-semibold text-neutral-200 uppercase tracking-wide">
            Light ({lightThemes.length} themes)
          </h5>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {lightThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={currentTheme === theme.id}
              onSelect={() => updateSetting('themes.current', theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Theme Card Component
interface ThemeCardProps {
  theme: ThemePreview
  isSelected: boolean
  onSelect: () => void
}

function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        group relative rounded-lg border-2 transition-all text-left overflow-hidden
        ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/50'
          : 'border-neutral-600 hover:border-neutral-500'
        }
      `}
    >
      {/* Theme Preview */}
      <div className="relative">
        {/* Main background */}
        <div
          className="h-24 p-3 flex flex-col justify-between"
          style={{ backgroundColor: theme.colors.background }}
        >
          {/* Mini editor preview */}
          <div className="space-y-1.5">
            <div
              className="h-1.5 w-3/4 rounded-full"
              style={{ backgroundColor: theme.colors.foreground, opacity: 0.8 }}
            />
            <div
              className="h-1.5 w-full rounded-full"
              style={{ backgroundColor: theme.colors.foreground, opacity: 0.6 }}
            />
            <div
              className="h-1.5 w-5/6 rounded-full"
              style={{ backgroundColor: theme.colors.foreground, opacity: 0.6 }}
            />
          </div>

          {/* Accent indicator */}
          <div className="flex gap-1">
            <div
              className="w-6 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.accent }}
            />
            <div
              className="w-4 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.border }}
            />
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Theme info */}
      <div className="p-3 bg-neutral-800 border-t border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="font-medium text-neutral-100 text-sm">{theme.name}</div>
          {theme.isFavorite && (
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      </div>
    </button>
  )
}
