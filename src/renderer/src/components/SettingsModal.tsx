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
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react'
import {
  loadTemplates,
  getSelectedTemplateId,
  setSelectedTemplateId,
  processTemplate,
  DailyNoteTemplate,
} from '../lib/dailyNoteTemplates'
import { 
  Theme, 
  AutoThemeSettings,
  FontSettings,
  ThemeShortcut,
  RecommendedFont,
  createCustomTheme,
  generateThemeFromColor,
  isValidHexColor,
  applyTheme,
  importTheme,
  generateShareableTheme,
  exportThemeToBase16,
  importThemeFromBase16,
  fetchThemeFromUrl,
  isValidThemeUrl,
  POPULAR_BASE16_SCHEMES,
  FONT_FAMILIES,
  RECOMMENDED_FONTS,
  groupRecommendedFonts,
  Base16Scheme
} from '../lib/themes'
import { api } from '../lib/api'

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
  fontSettings: FontSettings
  onFontSettingsChange: (settings: FontSettings) => void
  themeShortcuts: ThemeShortcut[]
  onThemeShortcutsChange: (shortcuts: ThemeShortcut[]) => void
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
  onDeleteCustomTheme,
  fontSettings,
  onFontSettingsChange,
  themeShortcuts,
  onThemeShortcutsChange,
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
  
  // URL import state
  const [importUrl, setImportUrl] = useState('')
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  
  // Font management state
  const [installedFonts, setInstalledFonts] = useState<string[]>([])
  const [isLoadingFonts, setIsLoadingFonts] = useState(false)
  const [installingFont, setInstallingFont] = useState<string | null>(null)
  const [fontInstallResult, setFontInstallResult] = useState<{ id: string; success: boolean; message: string } | null>(null)
  const [hasHomebrew, setHasHomebrew] = useState<boolean | null>(null)
  const [showRecommendedFonts, setShowRecommendedFonts] = useState(false)
  const [fontSearchQuery, setFontSearchQuery] = useState('')
  const [expandedFontPreview, setExpandedFontPreview] = useState<string | null>(null)
  const [fontCategoryFilter, setFontCategoryFilter] = useState<'all' | 'sans' | 'serif' | 'mono'>('all')

  // Zotero/Bibliography state
  const [bibliographyPath, setBibliographyPath] = useState('')
  const [isSavingBib, setIsSavingBib] = useState(false)
  const [bibSaveResult, setBibSaveResult] = useState<{ success: boolean; message: string } | null>(null)

  // Daily note templates state
  const [templates, _setTemplates] = useState<DailyNoteTemplate[]>(() => loadTemplates())
  const [selectedTemplateId, setSelectedTemplate] = useState<string>(() => getSelectedTemplateId())
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)

  // Handle template selection
  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id)
    setSelectedTemplateId(id)
  }

  // Get currently selected template for preview
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0]
  const templatePreview = processTemplate(selectedTemplate?.content || '', new Date())

  // Load installed fonts on mount
  useEffect(() => {
    if (isOpen && activeTab === 'editor') {
      loadInstalledFonts()
    }
  }, [isOpen, activeTab])

  // Load bibliography path when academic tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'academic') {
      loadBibliographyPath()
    }
  }, [isOpen, activeTab])

  const loadBibliographyPath = async () => {
    try {
      const path = await api.getBibliographyPath()
      if (path) setBibliographyPath(path)
    } catch (e) {
      console.error('Failed to load bibliography path:', e)
    }
  }

  const saveBibliographyPath = async () => {
    setIsSavingBib(true)
    setBibSaveResult(null)
    try {
      await api.setBibliographyPath(bibliographyPath)
      setBibSaveResult({ success: true, message: 'Bibliography path saved' })
      setTimeout(() => setBibSaveResult(null), 3000)
    } catch (e) {
      setBibSaveResult({ success: false, message: 'Failed to save path' })
    } finally {
      setIsSavingBib(false)
    }
  }
  
  const loadInstalledFonts = async () => {
    setIsLoadingFonts(true)
    try {
      const [fonts, brewAvailable] = await Promise.all([
        api.getInstalledFonts(),
        api.isHomebrewAvailable()
      ])
      setInstalledFonts(fonts)
      setHasHomebrew(brewAvailable)
    } catch (error) {
      console.error('Failed to load fonts:', error)
    } finally {
      setIsLoadingFonts(false)
    }
  }
  
  const handleInstallFont = async (font: RecommendedFont) => {
    if (!font.cask || installingFont) return
    
    setInstallingFont(font.id)
    setFontInstallResult(null)
    
    try {
      const result = await api.installFontViaHomebrew(font.cask)
      setFontInstallResult({ id: font.id, success: true, message: result })
      // Reload fonts after install
      await loadInstalledFonts()
    } catch (error) {
      setFontInstallResult({ 
        id: font.id, 
        success: false, 
        message: error instanceof Error ? error.message : 'Installation failed' 
      })
    } finally {
      setInstallingFont(null)
    }
  }
  
  // Group recommended fonts by status, with search and category filtering
  const fontGroups = (() => {
    const groups = groupRecommendedFonts(installedFonts)
    
    const filterFont = (font: RecommendedFont) => {
      // Category filter
      if (fontCategoryFilter !== 'all' && font.category !== fontCategoryFilter) {
        return false
      }
      // Search filter
      if (fontSearchQuery.trim()) {
        const query = fontSearchQuery.toLowerCase()
        return font.name.toLowerCase().includes(query) ||
          font.description.toLowerCase().includes(query) ||
          font.adhdBenefit.toLowerCase().includes(query)
      }
      return true
    }
    
    return {
      installed: groups.installed.filter(filterFont),
      available: groups.available.filter(filterFont),
      premium: groups.premium.filter(filterFont),
    }
  })()
  
  // Handle "Use this font" - applies font directly to CSS variables
  const handleUseFont = (font: RecommendedFont) => {
    // Apply directly to CSS custom properties
    const root = document.documentElement
    root.style.setProperty('--editor-font-family', font.fontFamily)
    
    // Show a brief feedback
    setFontInstallResult({
      id: font.id,
      success: true,
      message: `Now using ${font.name}! (Changes will reset on reload unless you select it from Typography above)`
    })
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setFontInstallResult(null)
    }, 3000)
  }
  
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
  
  // Handle import from text
  const handleImport = () => {
    setImportError('')
    const imported = importTheme(importText)
    if (imported) {
      onSaveCustomTheme(imported)
      onThemeChange(imported.id)
      setShowImportModal(false)
      setImportText('')
      setImportUrl('')
    } else {
      setImportError('Invalid theme format. Supports Scribe JSON or Base16 YAML.')
    }
  }
  
  // Handle import from URL
  const handleImportFromUrl = async () => {
    if (!isValidThemeUrl(importUrl)) {
      setImportError('Please enter a valid URL (https://...)')
      return
    }
    
    setImportError('')
    setIsLoadingUrl(true)
    
    try {
      const imported = await fetchThemeFromUrl(importUrl)
      if (imported) {
        onSaveCustomTheme(imported)
        onThemeChange(imported.id)
        setShowImportModal(false)
        setImportText('')
        setImportUrl('')
      } else {
        setImportError('Could not parse theme from URL. Make sure it contains valid Scribe JSON or Base16 YAML.')
      }
    } catch {
      setImportError('Failed to fetch theme from URL. Check the URL and try again.')
    } finally {
      setIsLoadingUrl(false)
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
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Type className="w-3 h-3 inline mr-2" />
                    Typography
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-5">
                    {/* Font Family */}
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Font Family</label>
                      <select
                        value={fontSettings.family}
                        onChange={(e) => onFontSettingsChange({ ...fontSettings, family: e.target.value })}
                        className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary"
                      >
                        <optgroup label="Sans-Serif (Modern)">
                          {Object.entries(FONT_FAMILIES).filter(([, f]) => f.category === 'sans').map(([key, font]) => (
                            <option key={key} value={key}>{font.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Serif (Book/Academic)">
                          {Object.entries(FONT_FAMILIES).filter(([, f]) => f.category === 'serif').map(([key, font]) => (
                            <option key={key} value={key}>{font.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Monospace (Focus/Code)">
                          {Object.entries(FONT_FAMILIES).filter(([, f]) => f.category === 'mono').map(([key, font]) => (
                            <option key={key} value={key}>{font.name}</option>
                          ))}
                        </optgroup>
                      </select>
                      <p className="text-[10px] text-nexus-text-muted mt-1">
                        {FONT_FAMILIES[fontSettings.family]?.description}
                      </p>
                    </div>
                    
                    {/* Font Size */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-nexus-text-muted">Font Size</label>
                        <span className="text-sm font-bold text-nexus-accent">{fontSettings.size}px</span>
                      </div>
                      <input 
                        type="range" 
                        className="w-full accent-nexus-accent" 
                        min="12" 
                        max="24" 
                        value={fontSettings.size}
                        onChange={(e) => onFontSettingsChange({ ...fontSettings, size: parseInt(e.target.value) })}
                      />
                      <div className="flex justify-between text-[10px] text-nexus-text-muted mt-1">
                        <span>12px (compact)</span>
                        <span>24px (large)</span>
                      </div>
                    </div>
                    
                    {/* Line Height */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-nexus-text-muted">Line Height</label>
                        <span className="text-sm font-bold text-nexus-accent">{fontSettings.lineHeight.toFixed(1)}</span>
                      </div>
                      <input 
                        type="range" 
                        className="w-full accent-nexus-accent" 
                        min="1.4" 
                        max="2.2" 
                        step="0.1"
                        value={fontSettings.lineHeight}
                        onChange={(e) => onFontSettingsChange({ ...fontSettings, lineHeight: parseFloat(e.target.value) })}
                      />
                      <div className="flex justify-between text-[10px] text-nexus-text-muted mt-1">
                        <span>1.4 (tight)</span>
                        <span>2.2 (spacious)</span>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="pt-3 border-t border-white/5">
                      <label className="text-xs text-nexus-text-muted mb-2 block">Preview</label>
                      <div 
                        className="p-3 bg-nexus-bg-primary rounded-md border border-white/10"
                        style={{
                          fontFamily: FONT_FAMILIES[fontSettings.family]?.value,
                          fontSize: `${fontSettings.size}px`,
                          lineHeight: fontSettings.lineHeight,
                        }}
                      >
                        <p className="text-nexus-text-primary">The quick brown fox jumps over the lazy dog.</p>
                        <p className="text-nexus-text-muted">0123456789 - ADHD-friendly writing experience.</p>
                      </div>
                    </div>
                  </div>
                </section>
                
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

                {/* Daily Notes Templates */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <Calendar className="w-3 h-3 inline mr-2" />
                    Daily Notes Template
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full bg-nexus-bg-primary border border-white/10 rounded-md p-2 text-sm text-nexus-text-primary"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-nexus-text-muted mt-1">
                        This template will be used when creating new daily notes (⌘D)
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                        className="text-xs text-nexus-accent hover:text-nexus-accent-hover flex items-center gap-1"
                      >
                        {showTemplatePreview ? 'Hide Preview' : 'Show Preview'}
                        {showTemplatePreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {showTemplatePreview && (
                        <div className="mt-3 p-3 bg-nexus-bg-primary rounded-md border border-white/5 max-h-48 overflow-y-auto">
                          <pre className="text-xs text-nexus-text-muted whitespace-pre-wrap font-mono">
                            {templatePreview}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-nexus-text-muted pt-2 border-t border-white/5">
                      <div className="font-medium mb-1">Available variables:</div>
                      <code className="text-nexus-accent">{'{{date}}'}</code> Full date,{' '}
                      <code className="text-nexus-accent">{'{{date_short}}'}</code> YYYY-MM-DD,{' '}
                      <code className="text-nexus-accent">{'{{day}}'}</code> Weekday,{' '}
                      <code className="text-nexus-accent">{'{{time}}'}</code> HH:MM,{' '}
                      <code className="text-nexus-accent">{'{{week}}'}</code> Week #
                    </div>
                  </div>
                </section>

                {/* Recommended ADHD-Friendly Fonts */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold">
                      <Type className="w-3 h-3 inline mr-2" />
                      ADHD-Friendly Fonts
                    </h4>
                    <div className="flex items-center gap-2">
                      {showRecommendedFonts && (
                        <button
                          onClick={loadInstalledFonts}
                          disabled={isLoadingFonts}
                          className="p-1.5 text-nexus-text-muted hover:text-nexus-accent rounded transition-colors disabled:opacity-50"
                          title="Refresh installed fonts"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFonts ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowRecommendedFonts(!showRecommendedFonts)}
                        className="text-xs text-nexus-accent hover:text-nexus-accent-hover flex items-center gap-1"
                      >
                        {showRecommendedFonts ? 'Hide' : 'Show'} ({RECOMMENDED_FONTS.length})
                        {showRecommendedFonts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  
                  {showRecommendedFonts && (
                    <div className="space-y-4">
                      {/* Category Filter Tabs */}
                      <div className="flex gap-1 p-1 bg-nexus-bg-primary rounded-lg">
                        {(['all', 'sans', 'serif', 'mono'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setFontCategoryFilter(cat)}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              fontCategoryFilter === cat
                                ? 'bg-nexus-accent text-white'
                                : 'text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
                            }`}
                          >
                            {cat === 'all' ? 'All' : cat === 'sans' ? 'Sans' : cat === 'serif' ? 'Serif' : 'Mono'}
                          </button>
                        ))}
                      </div>
                      
                      {/* Search/Filter */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-text-muted" />
                        <input
                          type="text"
                          value={fontSearchQuery}
                          onChange={(e) => setFontSearchQuery(e.target.value)}
                          placeholder="Search fonts..."
                          className="w-full pl-9 pr-3 py-2 bg-nexus-bg-primary border border-white/10 rounded-lg text-sm text-nexus-text-primary placeholder:text-nexus-text-muted/50 focus:outline-none focus:border-nexus-accent/50"
                        />
                        {fontSearchQuery && (
                          <button
                            onClick={() => setFontSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-text-muted hover:text-nexus-text-primary"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Homebrew status */}
                      {hasHomebrew === false && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-yellow-200">
                            <strong>Homebrew not found.</strong> Install it from{' '}
                            <a href="https://brew.sh" target="_blank" rel="noopener" className="underline">brew.sh</a>
                            {' '}to enable font installation.
                          </div>
                        </div>
                      )}
                      
                      {/* Loading state */}
                      {isLoadingFonts && (
                        <div className="flex items-center gap-2 text-xs text-nexus-text-muted p-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading installed fonts...
                        </div>
                      )}
                      
                      {/* No results */}
                      {(fontSearchQuery || fontCategoryFilter !== 'all') && fontGroups.installed.length === 0 && fontGroups.available.length === 0 && fontGroups.premium.length === 0 && (
                        <div className="text-center py-8 text-nexus-text-muted">
                          <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            {fontSearchQuery 
                              ? `No fonts match "${fontSearchQuery}"${fontCategoryFilter !== 'all' ? ` in ${fontCategoryFilter}` : ''}`
                              : `No ${fontCategoryFilter} fonts available`
                            }
                          </p>
                          {(fontSearchQuery || fontCategoryFilter !== 'all') && (
                            <button
                              onClick={() => { setFontSearchQuery(''); setFontCategoryFilter('all'); }}
                              className="mt-2 text-xs text-nexus-accent hover:text-nexus-accent-hover"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Installed recommended fonts */}
                      {fontGroups.installed.length > 0 && (
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest text-green-400 font-bold mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Installed ({fontGroups.installed.length})
                          </h5>
                          <div className="space-y-2">
                            {fontGroups.installed.map(font => (
                              <div
                                key={font.id}
                                className="p-3 bg-nexus-bg-tertiary rounded-lg border border-green-500/20"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-nexus-text-primary">{font.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-nexus-text-muted uppercase">
                                        {font.category}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-nexus-text-muted">{font.description}</div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setExpandedFontPreview(expandedFontPreview === font.id ? null : font.id)}
                                      className="p-1.5 text-nexus-text-muted hover:text-nexus-accent rounded transition-colors"
                                      title="Preview font"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleUseFont(font)}
                                      className="px-2 py-1 text-[10px] font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded transition-colors"
                                      title="Use this font in editor"
                                    >
                                      Use
                                    </button>
                                  </div>
                                </div>
                                {/* Font Preview */}
                                {expandedFontPreview === font.id && (
                                  <div 
                                    className="mt-3 p-3 bg-nexus-bg-primary rounded-md border border-white/10"
                                    style={{ fontFamily: font.fontFamily }}
                                  >
                                    <p className="text-lg text-nexus-text-primary leading-relaxed">
                                      The quick brown fox jumps over the lazy dog.
                                    </p>
                                    <p className="text-sm text-nexus-text-muted mt-1">
                                      0123456789 — AaBbCcDdEeFf IlL1 O0o
                                    </p>
                                    <button
                                      onClick={() => handleUseFont(font)}
                                      className="mt-3 w-full py-2 text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-md transition-colors"
                                    >
                                      Use {font.name} in Editor
                                    </button>
                                  </div>
                                )}
                                <div className="mt-2 text-[10px] text-green-300/80 italic">
                                  {font.adhdBenefit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Available for installation */}
                      {fontGroups.available.length > 0 && (
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest text-nexus-text-muted font-bold mb-2 flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            Available via Homebrew ({fontGroups.available.length})
                          </h5>
                          <div className="space-y-2">
                            {fontGroups.available.map(font => (
                              <div
                                key={font.id}
                                className="p-3 bg-nexus-bg-tertiary rounded-lg border border-white/5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-nexus-text-primary">{font.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-nexus-text-muted uppercase">
                                        {font.category}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-nexus-text-muted">{font.description}</div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setExpandedFontPreview(expandedFontPreview === font.id ? null : font.id)}
                                      className="p-1.5 text-nexus-text-muted hover:text-nexus-accent rounded transition-colors"
                                      title="Preview font (with fallback)"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleInstallFont(font)}
                                      disabled={!hasHomebrew || installingFont !== null}
                                      className="px-3 py-1.5 bg-nexus-accent hover:bg-nexus-accent-hover text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                      {installingFont === font.id ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          Installing...
                                        </>
                                      ) : (
                                        <>
                                          <Download className="w-3 h-3" />
                                          Install
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {/* Font Preview (with fallback since not installed) */}
                                {expandedFontPreview === font.id && (
                                  <div 
                                    className="mt-3 p-3 bg-nexus-bg-primary rounded-md border border-white/10"
                                    style={{ fontFamily: font.fontFamily }}
                                  >
                                    <p className="text-xs text-nexus-text-muted mb-1 italic">
                                      Preview (using system fallback - install for actual font)
                                    </p>
                                    <p className="text-lg text-nexus-text-primary leading-relaxed">
                                      The quick brown fox jumps over the lazy dog.
                                    </p>
                                    <p className="text-sm text-nexus-text-muted mt-1">
                                      0123456789 — AaBbCcDdEeFf IlL1 O0o
                                    </p>
                                  </div>
                                )}
                                <div className="mt-2 text-[10px] text-nexus-accent/80 italic">
                                  {font.adhdBenefit}
                                </div>
                                {fontInstallResult?.id === font.id && (
                                  <div className={`mt-2 text-[10px] p-2 rounded ${
                                    fontInstallResult.success 
                                      ? 'bg-green-500/10 text-green-300' 
                                      : 'bg-red-500/10 text-red-300'
                                  }`}>
                                    {fontInstallResult.message}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Premium fonts */}
                      {fontGroups.premium.length > 0 && (
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Premium Fonts ({fontGroups.premium.length})
                          </h5>
                          <div className="space-y-2">
                            {fontGroups.premium.map(font => (
                              <div
                                key={font.id}
                                className="p-3 bg-nexus-bg-tertiary rounded-lg border border-purple-500/20"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-nexus-text-primary">{font.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                                        {font.category}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-nexus-text-muted">{font.description}</div>
                                  </div>
                                  {font.website && (
                                    <a
                                      href={font.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-3 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Get
                                    </a>
                                  )}
                                </div>
                                <div className="mt-2 text-[10px] text-purple-300/80 italic">
                                  {font.adhdBenefit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                
                {/* Theme Keyboard Shortcuts */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    Keyboard Shortcuts
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
                    <p className="text-xs text-nexus-text-muted mb-3">
                      Press <kbd className="px-1.5 py-0.5 bg-nexus-bg-primary rounded text-nexus-accent font-mono">Cmd/Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-nexus-bg-primary rounded text-nexus-accent font-mono">Alt</kbd> + number to switch themes:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {themeShortcuts.map((shortcut, index) => {
                        const selectedTheme = themes[shortcut.themeId]
                        return (
                          <div
                            key={shortcut.key}
                            className="flex items-center gap-2 p-2 bg-nexus-bg-primary rounded-md border border-white/5"
                          >
                            <kbd className="px-2 py-1 bg-nexus-bg-tertiary rounded text-xs font-mono text-nexus-accent min-w-[28px] text-center flex-shrink-0">
                              {shortcut.key}
                            </kbd>
                            <select
                              value={shortcut.themeId}
                              onChange={(e) => {
                                const newShortcuts = [...themeShortcuts]
                                newShortcuts[index] = { ...shortcut, themeId: e.target.value }
                                onThemeShortcutsChange(newShortcuts)
                              }}
                              className="flex-1 bg-nexus-bg-tertiary border border-white/10 rounded px-2 py-1 text-xs text-nexus-text-primary min-w-0"
                            >
                              <optgroup label="Dark Themes">
                                {Object.values(themes).filter(t => t.type === 'dark').map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Light Themes">
                                {Object.values(themes).filter(t => t.type === 'light').map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </optgroup>
                            </select>
                            {selectedTheme && (
                              <div 
                                className="w-4 h-4 rounded border border-white/10 flex-shrink-0"
                                style={{ backgroundColor: selectedTheme.colors.bgPrimary }}
                                title={selectedTheme.name}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
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
                        {/* Mini Theme Preview Card */}
                        <div
                          className="w-full h-16 rounded-md mb-2 p-2 border border-white/5 overflow-hidden"
                          style={{ backgroundColor: t.colors.bgPrimary }}
                        >
                          {/* Mini sidebar */}
                          <div className="flex gap-1.5 h-full">
                            <div
                              className="w-6 rounded-sm"
                              style={{ backgroundColor: t.colors.bgSecondary }}
                            />
                            {/* Mini editor area */}
                            <div className="flex-1 flex flex-col gap-1 p-1">
                              <div
                                className="h-1.5 w-3/4 rounded-full"
                                style={{ backgroundColor: t.colors.textPrimary, opacity: 0.8 }}
                              />
                              <div
                                className="h-1 w-full rounded-full"
                                style={{ backgroundColor: t.colors.textMuted, opacity: 0.5 }}
                              />
                              <div
                                className="h-1 w-2/3 rounded-full"
                                style={{ backgroundColor: t.colors.textMuted, opacity: 0.5 }}
                              />
                              <div
                                className="h-1 w-8 rounded-full mt-auto"
                                style={{ backgroundColor: t.colors.accent }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-nexus-text-primary truncate">{t.name}</div>
                            <div className="text-[10px] text-nexus-text-muted truncate">{t.description}</div>
                          </div>
                          {currentTheme === t.id && (
                            <div className="ml-2 px-1.5 py-0.5 text-[9px] bg-nexus-accent/20 text-nexus-accent rounded uppercase font-bold">
                              Active
                            </div>
                          )}
                        </div>
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
                        {/* Mini Theme Preview Card */}
                        <div
                          className="w-full h-16 rounded-md mb-2 p-2 border border-black/10 overflow-hidden"
                          style={{ backgroundColor: t.colors.bgPrimary }}
                        >
                          {/* Mini sidebar */}
                          <div className="flex gap-1.5 h-full">
                            <div
                              className="w-6 rounded-sm"
                              style={{ backgroundColor: t.colors.bgSecondary }}
                            />
                            {/* Mini editor area */}
                            <div className="flex-1 flex flex-col gap-1 p-1">
                              <div
                                className="h-1.5 w-3/4 rounded-full"
                                style={{ backgroundColor: t.colors.textPrimary, opacity: 0.8 }}
                              />
                              <div
                                className="h-1 w-full rounded-full"
                                style={{ backgroundColor: t.colors.textMuted, opacity: 0.5 }}
                              />
                              <div
                                className="h-1 w-2/3 rounded-full"
                                style={{ backgroundColor: t.colors.textMuted, opacity: 0.5 }}
                              />
                              <div
                                className="h-1 w-8 rounded-full mt-auto"
                                style={{ backgroundColor: t.colors.accent }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-nexus-text-primary truncate">{t.name}</div>
                            <div className="text-[10px] text-nexus-text-muted truncate">{t.description}</div>
                          </div>
                          {currentTheme === t.id && (
                            <div className="ml-2 px-1.5 py-0.5 text-[9px] bg-nexus-accent/20 text-nexus-accent rounded uppercase font-bold">
                              Active
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
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
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Zotero / BibTeX Citations</h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-400/10 rounded text-red-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-nexus-text-primary">Bibliography File</div>
                        <div className="text-xs text-nexus-text-muted">Type @ in editor to insert citations</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-nexus-text-muted block">Path to .bib file</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bibliographyPath}
                          onChange={(e) => setBibliographyPath(e.target.value)}
                          placeholder="~/Zotero/My Library.bib"
                          className="flex-1 bg-nexus-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm text-nexus-text-primary placeholder:text-nexus-text-muted/40 focus:outline-none focus:border-nexus-accent/50"
                        />
                        <button
                          onClick={saveBibliographyPath}
                          disabled={isSavingBib}
                          className="px-4 py-2 bg-nexus-accent hover:bg-nexus-accent-hover rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                        >
                          {isSavingBib ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      <p className="text-[10px] text-nexus-text-muted">
                        Export from Zotero: File → Export Library → BibTeX format
                      </p>
                      {bibSaveResult && (
                        <div className={`flex items-center gap-2 text-xs ${bibSaveResult.success ? 'text-green-400' : 'text-red-400'}`}>
                          {bibSaveResult.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {bibSaveResult.message}
                        </div>
                      )}
                    </div>
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
              setImportUrl('')
              setImportError('')
            }}
          />
          <div className="relative w-full max-w-lg bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-display font-bold text-nexus-text-primary mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Theme
            </h3>
            
            {/* URL Import Section */}
            <div className="mb-4">
              <label className="text-xs text-nexus-text-muted mb-2 block">Import from URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => {
                    setImportUrl(e.target.value)
                    setImportError('')
                  }}
                  placeholder="https://gist.github.com/user/..."
                  className="flex-1 bg-nexus-bg-primary border border-white/10 rounded-lg p-2 text-sm text-nexus-text-primary placeholder:text-nexus-text-muted/40 focus:outline-none focus:border-nexus-accent/50"
                />
                <button
                  onClick={handleImportFromUrl}
                  disabled={!importUrl.trim() || isLoadingUrl}
                  className="px-4 py-2 bg-nexus-accent hover:bg-nexus-accent-hover rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingUrl ? 'Loading...' : 'Fetch'}
                </button>
              </div>
              <p className="text-[10px] text-nexus-text-muted mt-1">
                Supports GitHub Gists, raw URLs, and Base16 repos
              </p>
            </div>
            
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-nexus-text-muted">or paste below</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            
            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError('')
              }}
              placeholder={`Scribe JSON:\n{\n  "name": "My Theme",\n  "type": "dark",\n  "colors": { ... }\n}\n\nOr Base16 YAML:\nscheme: "My Scheme"\nbase00: "#1d1f21"\nbase05: "#c5c8c6"\n...`}
              className="w-full h-40 bg-nexus-bg-primary border border-white/10 rounded-lg p-3 text-sm text-nexus-text-primary font-mono placeholder:text-nexus-text-muted/40 resize-none focus:outline-none focus:border-nexus-accent/50"
            />
            {importError && (
              <p className="text-sm text-red-400 mt-2">{importError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportText('')
                  setImportUrl('')
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
