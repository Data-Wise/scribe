import { useState, useEffect } from 'react'
import { 
  X, 
  Settings as SettingsIcon, 
  Type, 
  FileCode, 
  Share2, 
  User, 
  Sparkles,
  Search,
  BookOpen,
  Sun,
  Moon,
  Clock,
  Plus,
  Trash2,
  Palette,
  Download,
  Upload,
  Copy,
  Check,
  Eye
} from 'lucide-react'
import { 
  Theme, 
  AutoThemeSettings,
  createCustomTheme,
  generateThemeFromColor,
  isValidHexColor,
  applyTheme,
  importTheme,
  generateShareableTheme,
  exportThemeToBase16,
  importThemeFromBase16,
  POPULAR_BASE16_SCHEMES,
  Base16Scheme
} from '../lib/themes'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  themes: Record<string, Theme>
  currentTheme: string
  onThemeChange: (themeId: string) => void
  autoThemeSettings: AutoThemeSettings
  onAutoThemeChange: (settings: AutoThemeSettings) => void
  onSaveCustomTheme: (theme: Theme) => void
  onDeleteCustomTheme: (themeId: string) => void
}

type SettingsTab = 'general' | 'editor' | 'appearance' | 'files' | 'academic'

export function SettingsModal({ 
  isOpen, 
  onClose, 
  themes,
  currentTheme,
  onThemeChange,
  autoThemeSettings,
  onAutoThemeChange,
  onSaveCustomTheme,
  onDeleteCustomTheme
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [showCustomCreator, setShowCustomCreator] = useState(false)
  const [customThemeName, setCustomThemeName] = useState('')
  const [customThemeType, setCustomThemeType] = useState<'dark' | 'light'>('dark')
  const [customBaseColor, setCustomBaseColor] = useState('#38bdf8')
  
  // Preview state
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  const [originalTheme, setOriginalTheme] = useState<string>(currentTheme)
  
  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [exportText, setExportText] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPopularSchemes, setShowPopularSchemes] = useState(false)
  
  // Apply preview theme
  useEffect(() => {
    if (previewTheme && themes[previewTheme]) {
      applyTheme(themes[previewTheme])
    }
  }, [previewTheme, themes])
  
  // Reset preview on close or when canceling
  const handleCancelPreview = () => {
    if (originalTheme && themes[originalTheme]) {
      applyTheme(themes[originalTheme])
    }
    setPreviewTheme(null)
  }
  
  // Apply previewed theme
  const handleApplyPreview = () => {
    if (previewTheme) {
      onThemeChange(previewTheme)
      setOriginalTheme(previewTheme)
      setPreviewTheme(null)
    }
  }
  
  // Handle import
  const handleImport = () => {
    setImportError('')
    const imported = importTheme(importText)
    if (imported) {
      onSaveCustomTheme(imported)
      onThemeChange(imported.id)
      setShowImportModal(false)
      setImportText('')
    } else {
      setImportError('Invalid theme format. Supports Scribe JSON or Base16 YAML.')
    }
  }
  
  // Handle import from popular schemes
  const handleImportPopular = (scheme: Base16Scheme) => {
    const imported = importThemeFromBase16(scheme)
    onSaveCustomTheme(imported)
    onThemeChange(imported.id)
    setShowPopularSchemes(false)
  }
  
  // Handle export
  const handleExport = (format: 'json' | 'base16') => {
    const theme = themes[currentTheme]
    if (!theme) return
    
    if (format === 'json') {
      setExportText(generateShareableTheme(theme))
    } else {
      setExportText(exportThemeToBase16(theme))
    }
    setShowExportModal(true)
  }
  
  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'editor', label: 'Editor', icon: Type },
    { id: 'appearance', label: 'Appearance', icon: Sparkles },
    { id: 'files', label: 'Files & Links', icon: FileCode },
    { id: 'academic', label: 'Research', icon: BookOpen },
  ]

  const darkThemes = Object.values(themes).filter(t => t.type === 'dark')
  const lightThemes = Object.values(themes).filter(t => t.type === 'light')
  const customThemes = Object.values(themes).filter(t => t.isCustom)

  const handleCreateCustomTheme = () => {
    if (!customThemeName.trim() || !isValidHexColor(customBaseColor)) return
    
    const colors = generateThemeFromColor(customBaseColor, customThemeType)
    const newTheme = createCustomTheme(customThemeName.trim(), customThemeType, colors)
    onSaveCustomTheme(newTheme)
    
    // Reset form
    setCustomThemeName('')
    setCustomBaseColor('#38bdf8')
    setShowCustomCreator(false)
    
    // Switch to new theme
    onThemeChange(newTheme.id)
  }

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h = hour % 12 || 12
    return `${h}:00 ${ampm}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-nexus-bg-primary/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[650px] bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl flex overflow-hidden animate-slide-up">
        {/* Sidebar */}
        <div className="w-64 bg-nexus-bg-primary border-right border-white/5 p-4 flex flex-col gap-2">
          <div className="px-2 mb-4">
            <h2 className="text-lg font-display font-bold text-nexus-text-primary">Settings</h2>
          </div>
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-nexus-accent/10 text-nexus-accent' 
                  : 'text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-nexus-bg-secondary">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-display font-medium text-nexus-text-primary capitalize">
              {activeTab.replace('-', ' ')}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Startup</h4>
                  <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-nexus-text-primary">Open last note on startup</div>
                      <div className="text-xs text-nexus-text-muted">Return to exactly where you left off.</div>
                    </div>
                    <div className="w-10 h-5 bg-nexus-accent rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </section>
                
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Identity</h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-nexus-purple/20 flex items-center justify-center border border-nexus-purple/30">
                      <User className="w-6 h-6 text-nexus-purple" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-nexus-text-primary">Research Assistant</div>
                      <div className="text-xs text-nexus-text-muted">Causal Inference Specialist</div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Writing Experience</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">Readable line length</div>
                        <div className="text-xs text-nexus-text-muted">Limit maximum line width for focus.</div>
                      </div>
                      <div className="w-10 h-5 bg-nexus-accent rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">Spellcheck</div>
                        <div className="text-xs text-nexus-text-muted">Enable browser-native spellchecking.</div>
                      </div>
                      <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-nexus-text-muted rounded-full" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* Auto Theme */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Clock className="w-3 h-3 inline mr-2" />
                    Auto Theme by Time
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">Enable auto-switching</div>
                        <div className="text-xs text-nexus-text-muted">Automatically switch themes based on time of day</div>
                      </div>
                      <button
                        onClick={() => onAutoThemeChange({ ...autoThemeSettings, enabled: !autoThemeSettings.enabled })}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                          autoThemeSettings.enabled ? 'bg-nexus-accent' : 'bg-white/10'
                        }`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                          autoThemeSettings.enabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    
                    {autoThemeSettings.enabled && (
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-nexus-text-muted flex items-center gap-2 mb-2">
                              <Sun className="w-3 h-3" /> Day Theme
                            </label>
                            <select
                              value={autoThemeSettings.dayTheme}
                              onChange={(e) => onAutoThemeChange({ ...autoThemeSettings, dayTheme: e.target.value })}
                              className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary"
                            >
                              {lightThemes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-nexus-text-muted flex items-center gap-2 mb-2">
                              <Moon className="w-3 h-3" /> Night Theme
                            </label>
                            <select
                              value={autoThemeSettings.nightTheme}
                              onChange={(e) => onAutoThemeChange({ ...autoThemeSettings, nightTheme: e.target.value })}
                              className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary"
                            >
                              {darkThemes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-nexus-text-muted mb-2 block">Day starts at</label>
                            <select
                              value={autoThemeSettings.dayStartHour}
                              onChange={(e) => onAutoThemeChange({ ...autoThemeSettings, dayStartHour: parseInt(e.target.value) })}
                              className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary"
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 5).map(h => (
                                <option key={h} value={h}>{formatHour(h)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-nexus-text-muted mb-2 block">Night starts at</label>
                            <select
                              value={autoThemeSettings.nightStartHour}
                              onChange={(e) => onAutoThemeChange({ ...autoThemeSettings, nightStartHour: parseInt(e.target.value) })}
                              className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary"
                            >
                              {Array.from({ length: 8 }, (_, i) => i + 17).map(h => (
                                <option key={h} value={h}>{formatHour(h)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Import/Export */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Share2 className="w-3 h-3 inline mr-2" />
                    Import & Export
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex-1 p-3 bg-nexus-bg-tertiary rounded-lg border border-white/10 hover:border-nexus-accent/50 transition-colors flex items-center justify-center gap-2 text-nexus-text-muted hover:text-nexus-accent"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Import Theme</span>
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="flex-1 p-3 bg-nexus-bg-tertiary rounded-lg border border-white/10 hover:border-nexus-accent/50 transition-colors flex items-center justify-center gap-2 text-nexus-text-muted hover:text-nexus-accent"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Export Theme</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowPopularSchemes(!showPopularSchemes)}
                    className="w-full mt-3 p-3 bg-nexus-bg-tertiary rounded-lg border border-white/10 hover:border-nexus-accent/50 transition-colors flex items-center justify-center gap-2 text-nexus-text-muted hover:text-nexus-accent"
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-sm font-medium">Browse Popular Schemes (Base16)</span>
                  </button>
                  
                  {showPopularSchemes && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {Object.entries(POPULAR_BASE16_SCHEMES).map(([key, scheme]) => (
                        <button
                          key={key}
                          onClick={() => handleImportPopular(scheme)}
                          className="p-2 bg-nexus-bg-primary rounded-lg border border-white/10 hover:border-nexus-accent/30 transition-all text-left flex items-center gap-2"
                        >
                          <div 
                            className="w-5 h-5 rounded border border-white/10" 
                            style={{ backgroundColor: scheme.base00 }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: scheme.base0D }}
                          />
                          <span className="text-xs text-nexus-text-primary truncate">{scheme.scheme}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* Custom Theme Creator */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Palette className="w-3 h-3 inline mr-2" />
                    Custom Theme
                  </h4>
                  
                  {!showCustomCreator ? (
                    <button
                      onClick={() => setShowCustomCreator(true)}
                      className="w-full p-4 bg-nexus-bg-tertiary rounded-lg border border-dashed border-white/20 hover:border-nexus-accent/50 transition-colors flex items-center justify-center gap-2 text-nexus-text-muted hover:text-nexus-accent"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Create Custom Theme</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
                      <div>
                        <label className="text-xs text-nexus-text-muted mb-2 block">Theme Name</label>
                        <input
                          type="text"
                          value={customThemeName}
                          onChange={(e) => setCustomThemeName(e.target.value)}
                          placeholder="My Custom Theme"
                          className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary placeholder:text-nexus-text-muted/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-nexus-text-muted mb-2 block">Type</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCustomThemeType('dark')}
                              className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${
                                customThemeType === 'dark' 
                                  ? 'bg-nexus-accent text-white' 
                                  : 'bg-nexus-bg-primary text-nexus-text-muted hover:text-nexus-text-primary'
                              }`}
                            >
                              <Moon className="w-4 h-4 inline mr-1" /> Dark
                            </button>
                            <button
                              onClick={() => setCustomThemeType('light')}
                              className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${
                                customThemeType === 'light' 
                                  ? 'bg-nexus-accent text-white' 
                                  : 'bg-nexus-bg-primary text-nexus-text-muted hover:text-nexus-text-primary'
                              }`}
                            >
                              <Sun className="w-4 h-4 inline mr-1" /> Light
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-nexus-text-muted mb-2 block">Accent Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={customBaseColor}
                              onChange={(e) => setCustomBaseColor(e.target.value)}
                              className="w-10 h-10 rounded-md cursor-pointer border-0"
                            />
                            <input
                              type="text"
                              value={customBaseColor}
                              onChange={(e) => setCustomBaseColor(e.target.value)}
                              className="flex-1 bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setShowCustomCreator(false)}
                          className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium text-nexus-text-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateCustomTheme}
                          disabled={!customThemeName.trim() || !isValidHexColor(customBaseColor)}
                          className="flex-1 p-2 bg-nexus-accent hover:bg-nexus-accent-hover rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Create Theme
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Custom themes list */}
                  {customThemes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {customThemes.map(t => (
                        <div
                          key={t.id}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                            currentTheme === t.id 
                              ? 'border-nexus-accent bg-nexus-bg-primary' 
                              : 'border-white/10 bg-nexus-bg-tertiary hover:border-white/20'
                          }`}
                        >
                          <button
                            onClick={() => onThemeChange(t.id)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <div 
                              className="w-6 h-6 rounded-md border border-white/10"
                              style={{ backgroundColor: t.colors.bgPrimary }}
                            />
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: t.colors.accent }}
                            />
                            <span className="text-sm font-medium text-nexus-text-primary">{t.name}</span>
                          </button>
                          <button
                            onClick={() => onDeleteCustomTheme(t.id)}
                            className="p-1 text-nexus-text-muted hover:text-nexus-error transition-colors"
                            title="Delete theme"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Dark Themes */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Moon className="w-3 h-3 inline mr-2" />
                    Dark Themes
                    <span className="ml-2 text-[10px] normal-case tracking-normal font-normal opacity-60">
                      — reduced eye strain • hover to preview
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {darkThemes.filter(t => !t.isCustom).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id)
                          setOriginalTheme(t.id)
                          setPreviewTheme(null)
                        }}
                        onMouseEnter={() => setPreviewTheme(t.id)}
                        onMouseLeave={() => {
                          setPreviewTheme(null)
                          if (themes[originalTheme]) applyTheme(themes[originalTheme])
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          currentTheme === t.id 
                            ? 'border-nexus-accent bg-nexus-bg-primary shadow-lg shadow-nexus-accent/10' 
                            : 'border-white/10 bg-nexus-bg-tertiary hover:border-white/20 hover:bg-nexus-bg-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-md border border-white/10 flex-shrink-0"
                            style={{ backgroundColor: t.colors.bgPrimary }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-nexus-text-primary truncate">{t.name}</div>
                            <div className="text-[10px] text-nexus-text-muted truncate">{t.description}</div>
                          </div>
                        </div>
                        {currentTheme === t.id && (
                          <div className="mt-2 text-[10px] text-nexus-accent uppercase font-bold tracking-widest">
                            Active
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Light Themes */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Sun className="w-3 h-3 inline mr-2" />
                    Light Themes
                    <span className="ml-2 text-[10px] normal-case tracking-normal font-normal opacity-60">
                      — natural daylight • hover to preview
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {lightThemes.filter(t => !t.isCustom).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id)
                          setOriginalTheme(t.id)
                          setPreviewTheme(null)
                        }}
                        onMouseEnter={() => setPreviewTheme(t.id)}
                        onMouseLeave={() => {
                          setPreviewTheme(null)
                          if (themes[originalTheme]) applyTheme(themes[originalTheme])
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          currentTheme === t.id 
                            ? 'border-nexus-accent bg-nexus-bg-primary shadow-lg shadow-nexus-accent/10' 
                            : 'border-white/10 bg-nexus-bg-tertiary hover:border-white/20 hover:bg-nexus-bg-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-md border border-black/10 flex-shrink-0"
                            style={{ backgroundColor: t.colors.bgPrimary }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-nexus-text-primary truncate">{t.name}</div>
                            <div className="text-[10px] text-nexus-text-muted truncate">{t.description}</div>
                          </div>
                        </div>
                        {currentTheme === t.id && (
                          <div className="mt-2 text-[10px] text-nexus-accent uppercase font-bold tracking-widest">
                            Active
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
                
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Typography</h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-nexus-text-primary">Font size (Editor)</span>
                      <span className="text-sm font-bold text-nexus-accent">18px</span>
                    </div>
                    <input type="range" className="w-full accent-nexus-accent" min="12" max="24" defaultValue="18" />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Storage</h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                    <div className="text-sm font-medium text-nexus-text-primary mb-2">Default folder for new notes</div>
                    <select className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary">
                      <option>Inbox</option>
                      <option>Journal</option>
                      <option>Research Log</option>
                    </select>
                  </div>
                </section>
                
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Link Format</h4>
                  <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-nexus-text-primary">Use [[WikiLinks]]</div>
                      <div className="text-xs text-nexus-text-muted">Standard for peer-to-peer note linking.</div>
                    </div>
                    <div className="w-10 h-5 bg-nexus-accent rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Integrations</h4>
                  <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-400/10 rounded text-red-400">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">Zotero Bridge</div>
                        <div className="text-xs text-nexus-text-muted">Auto-import citations from Zotero.</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-md transition-colors">
                      Configure
                    </button>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Export Standards</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 flex flex-col items-center gap-2 cursor-pointer hover:border-nexus-accent/50 transition-colors">
                      <FileCode className="w-6 h-6 text-nexus-accent" />
                      <span className="text-sm font-medium">LaTeX</span>
                    </div>
                    <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 flex flex-col items-center gap-2 cursor-pointer hover:border-nexus-accent/50 transition-colors">
                      <Search className="w-6 h-6 text-nexus-purple" />
                      <span className="text-sm font-medium">PDF (Modern)</span>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-nexus-bg-primary/50 text-center">
            <p className="text-[10px] text-nexus-text-muted uppercase tracking-widest font-bold">
              Scribe v0.3.0 • {themes[currentTheme]?.name || 'Custom'} Theme
            </p>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowImportModal(false)
              setImportText('')
              setImportError('')
            }}
          />
          <div className="relative w-full max-w-lg bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-display font-bold text-nexus-text-primary mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Theme
            </h3>
            <p className="text-sm text-nexus-text-muted mb-4">
              Paste a Scribe JSON theme or Base16 YAML scheme below.
            </p>
            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError('')
              }}
              placeholder={`Scribe JSON:\n{\n  "name": "My Theme",\n  "type": "dark",\n  "colors": { ... }\n}\n\nOr Base16 YAML:\nscheme: "My Scheme"\nbase00: "#1d1f21"\nbase05: "#c5c8c6"\n...`}
              className="w-full h-48 bg-nexus-bg-primary border border-white/10 rounded-lg p-3 text-sm text-nexus-text-primary font-mono placeholder:text-nexus-text-muted/40 resize-none focus:outline-none focus:border-nexus-accent/50"
            />
            {importError && (
              <p className="text-sm text-red-400 mt-2">{importError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportText('')
                  setImportError('')
                }}
                className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-nexus-text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex-1 p-2 bg-nexus-accent hover:bg-nexus-accent-hover rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowExportModal(false)
              setExportText('')
            }}
          />
          <div className="relative w-full max-w-lg bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-display font-bold text-nexus-text-primary mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Theme
            </h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleExport('json')}
                className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                  exportText.startsWith('{') 
                    ? 'bg-nexus-accent text-white' 
                    : 'bg-white/5 text-nexus-text-muted hover:bg-white/10'
                }`}
              >
                Scribe JSON
              </button>
              <button
                onClick={() => handleExport('base16')}
                className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                  exportText.startsWith('scheme:') 
                    ? 'bg-nexus-accent text-white' 
                    : 'bg-white/5 text-nexus-text-muted hover:bg-white/10'
                }`}
              >
                Base16 YAML
              </button>
            </div>
            <div className="relative">
              <textarea
                value={exportText}
                readOnly
                className="w-full h-64 bg-nexus-bg-primary border border-white/10 rounded-lg p-3 text-sm text-nexus-text-primary font-mono resize-none focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-nexus-bg-tertiary hover:bg-white/10 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-nexus-text-muted" />
                )}
              </button>
            </div>
            <p className="text-xs text-nexus-text-muted mt-2">
              Share this with others or save it for backup.
            </p>
            <button
              onClick={() => {
                setShowExportModal(false)
                setExportText('')
              }}
              className="w-full mt-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-nexus-text-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Theme Preview Bar */}
      {previewTheme && previewTheme !== currentTheme && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
          <Eye className="w-5 h-5 text-nexus-accent" />
          <span className="text-sm text-nexus-text-primary">
            Previewing: <strong>{themes[previewTheme]?.name}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancelPreview}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-md text-sm text-nexus-text-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyPreview}
              className="px-3 py-1 bg-nexus-accent hover:bg-nexus-accent-hover rounded-md text-sm text-white transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
