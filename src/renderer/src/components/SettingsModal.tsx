import { useState, useEffect } from 'react'
import './EditorTabs/EditorTabs.css' // For preview styles
import {
  X,
  Settings as SettingsIcon,
  Type,
  FileCode,
  Share2,
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
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Home,
  FileText,
  Square
} from 'lucide-react'
import {
  loadTemplates,
  getSelectedTemplateId,
  setSelectedTemplateId,
  processTemplate,
  DailyNoteTemplate,
} from '../lib/dailyNoteTemplates'
import {
  loadPreferences,
  updatePreferences,
  TabBarStyle,
  BorderStyle,
  ActiveTabStyle,
  SidebarTabId,
  DEFAULT_SIDEBAR_TAB_ORDER
} from '../lib/preferences'
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
  groupRecommendedFonts,
  Base16Scheme
} from '../lib/themes'
import { api } from '../lib/api'
import { getDefaultTerminalFolder } from '../lib/terminal-utils'
import { GeneralSettingsTab } from './Settings/GeneralSettingsTab'
import { EditorSettingsTab } from './Settings/EditorSettingsTab'

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

type SettingsTab = 'general' | 'editor' | 'appearance' | 'files' | 'academic' | 'icon-bar'

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

  // UI Style preferences state (for reactivity)
  const [uiStyles, setUiStyles] = useState(() => {
    const prefs = loadPreferences()
    return {
      tabBarStyle: prefs.tabBarStyle,
      borderStyle: prefs.borderStyle,
      activeTabStyle: prefs.activeTabStyle
    }
  })

  // Update UI style and save to preferences
  const updateUiStyle = (key: keyof typeof uiStyles, value: TabBarStyle | BorderStyle | ActiveTabStyle) => {
    setUiStyles(prev => ({ ...prev, [key]: value }))
    updatePreferences({ [key]: value })
  }

  // Right Sidebar preferences state (v1.8)
  const [sidebarSettings, setSidebarSettings] = useState(() => {
    const prefs = loadPreferences()
    return {
      tabSize: prefs.sidebarTabSize,
      tabOrder: prefs.sidebarTabOrder,
      hiddenTabs: prefs.sidebarHiddenTabs
    }
  })

  // Icon Bar preferences state (v1.16)
  const [iconBarSettings, setIconBarSettings] = useState(() => {
    const prefs = loadPreferences()
    return {
      iconGlowEffect: prefs.iconGlowEffect ?? true,
      iconGlowIntensity: prefs.iconGlowIntensity ?? 'subtle'
    }
  })

  // Update icon bar setting and save to preferences
  const updateIconBarSetting = <K extends keyof typeof iconBarSettings>(
    key: K,
    value: typeof iconBarSettings[K]
  ) => {
    setIconBarSettings(prev => ({ ...prev, [key]: value }))
    updatePreferences({ [key]: value })
  }

  // Update sidebar setting and save to preferences
  const updateSidebarSetting = <K extends keyof typeof sidebarSettings>(
    key: K,
    value: typeof sidebarSettings[K]
  ) => {
    setSidebarSettings(prev => ({ ...prev, [key]: value }))
    const prefKey = key === 'tabSize' ? 'sidebarTabSize' :
                    key === 'tabOrder' ? 'sidebarTabOrder' : 'sidebarHiddenTabs'
    updatePreferences({ [prefKey]: value })
  }

  // Terminal settings state
  const [terminalFolder, setTerminalFolder] = useState(() => getDefaultTerminalFolder())

  // Toggle tab visibility
  const toggleTabVisibility = (tabId: SidebarTabId) => {
    const isHidden = sidebarSettings.hiddenTabs.includes(tabId)
    const visibleCount = DEFAULT_SIDEBAR_TAB_ORDER.length - sidebarSettings.hiddenTabs.length

    // Prevent hiding last visible tab
    if (!isHidden && visibleCount <= 1) return

    const newHidden = isHidden
      ? sidebarSettings.hiddenTabs.filter(t => t !== tabId)
      : [...sidebarSettings.hiddenTabs, tabId]
    updateSidebarSetting('hiddenTabs', newHidden)
  }

  // Tab display names for UI
  const tabLabels: Record<SidebarTabId, string> = {
    properties: 'Properties',
    backlinks: 'Backlinks',
    tags: 'Tags',
    stats: 'Stats',
    claude: 'Claude',
    terminal: 'Terminal'
  }

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
    { id: 'icon-bar', label: 'Icon Bar', icon: Square },
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
      <div className="relative w-full max-w-4xl h-[650px] bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl flex overflow-hidden animate-slide-up" data-testid="settings-modal">
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
              <GeneralSettingsTab />
            )}

            {activeTab === 'editor' && (
              <EditorSettingsTab
                fontSettings={fontSettings}
                onFontSettingsChange={onFontSettingsChange}
              />
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* UI Style */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <SlidersHorizontal className="w-3 h-3 inline mr-2" />
                    UI Style
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-5">
                    {/* Tab Bar Style */}
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Tab Bar Style</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['subtle', 'elevated', 'glass', 'borderless'] as TabBarStyle[]).map((style) => (
                          <button
                            key={style}
                            onClick={() => updateUiStyle('tabBarStyle', style)}
                            className={`px-3 py-2 rounded-md text-xs font-medium transition-all capitalize ${
                              uiStyles.tabBarStyle === style
                                ? 'bg-nexus-accent text-white'
                                : 'bg-nexus-bg-primary text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-nexus-text-muted mt-1.5">
                        {uiStyles.tabBarStyle === 'subtle' && 'Minimal style with slight background difference'}
                        {uiStyles.tabBarStyle === 'elevated' && 'Modern shadow effect for clear visual hierarchy'}
                        {uiStyles.tabBarStyle === 'glass' && 'Frosted blur effect (macOS Sonoma style)'}
                        {uiStyles.tabBarStyle === 'borderless' && 'Same as editor background with subtle line'}
                      </p>
                    </div>

                    {/* Border Style */}
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Border Style</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['sharp', 'soft', 'glow', 'none'] as BorderStyle[]).map((style) => (
                          <button
                            key={style}
                            onClick={() => updateUiStyle('borderStyle', style)}
                            className={`px-3 py-2 rounded-md text-xs font-medium transition-all capitalize ${
                              uiStyles.borderStyle === style
                                ? 'bg-nexus-accent text-white'
                                : 'bg-nexus-bg-primary text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-nexus-text-muted mt-1.5">
                        {uiStyles.borderStyle === 'sharp' && 'Traditional solid border line'}
                        {uiStyles.borderStyle === 'soft' && 'Subtle, ADHD-friendly faded border'}
                        {uiStyles.borderStyle === 'glow' && 'Accent-colored soft glow effect'}
                        {uiStyles.borderStyle === 'none' && 'No visible border'}
                      </p>
                    </div>

                    {/* Active Tab Style */}
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Active Tab Emphasis</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(['elevated', 'accent-bar', 'background', 'bold', 'full'] as ActiveTabStyle[]).map((style) => (
                          <button
                            key={style}
                            onClick={() => updateUiStyle('activeTabStyle', style)}
                            className={`px-2 py-2 rounded-md text-xs font-medium transition-all capitalize ${
                              uiStyles.activeTabStyle === style
                                ? 'bg-nexus-accent text-white'
                                : 'bg-nexus-bg-primary text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
                            }`}
                          >
                            {style === 'accent-bar' ? 'Bar' : style}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-nexus-text-muted mt-1.5">
                        {uiStyles.activeTabStyle === 'elevated' && 'Shadow + lift effect (Arc/Notion style)'}
                        {uiStyles.activeTabStyle === 'accent-bar' && 'Gradient accent bar indicator'}
                        {uiStyles.activeTabStyle === 'background' && 'Accent-colored background fill'}
                        {uiStyles.activeTabStyle === 'bold' && 'Bold text only (minimal)'}
                        {uiStyles.activeTabStyle === 'full' && 'All effects combined (maximum emphasis)'}
                      </p>
                    </div>

                    {/* Live Preview - Uses actual EditorTabs CSS classes via data attributes */}
                    <div className="pt-3 border-t border-white/5">
                      <label className="text-xs text-nexus-text-muted mb-2 block">Preview</label>
                      <div
                        className="rounded-lg overflow-hidden border border-white/10"
                        style={{ background: 'var(--nexus-bg-primary)' }}
                      >
                        {/* Mini tab bar preview - uses real EditorTabs CSS classes */}
                        <div
                          className="editor-tabs"
                          data-tab-bar-style={uiStyles.tabBarStyle}
                          data-border-style={uiStyles.borderStyle}
                          data-active-tab-style={uiStyles.activeTabStyle}
                          style={{
                            height: 'auto',
                            padding: '6px 8px',
                            borderRadius: 0
                          }}
                        >
                          {/* Mission Control tab (pinned) */}
                          <button
                            className="editor-tab pinned"
                            style={{ fontSize: '10px', height: '26px', padding: '4px 10px', minWidth: 'auto' }}
                          >
                            <span className="tab-icon"><Home size={12} /></span>
                            <span className="tab-title">Mission</span>
                          </button>

                          {/* Active tab - shows current active style */}
                          <button
                            className="editor-tab active"
                            style={{ fontSize: '10px', height: '26px', padding: '4px 10px', minWidth: 'auto' }}
                          >
                            <div className="tab-accent-bar" style={{ background: 'linear-gradient(to right, var(--nexus-accent), rgba(59,130,246,0.5))' }} />
                            <span className="tab-icon"><FileText size={12} /></span>
                            <span className="tab-title">Active Note</span>
                          </button>

                          {/* Inactive tab */}
                          <button
                            className="editor-tab"
                            style={{ fontSize: '10px', height: '26px', padding: '4px 10px', minWidth: 'auto' }}
                          >
                            <span className="tab-icon"><FileText size={12} /></span>
                            <span className="tab-title">Note 2</span>
                          </button>
                        </div>

                        {/* Mini editor area */}
                        <div className="p-3 text-[10px] text-nexus-text-muted">
                          Editor content area...
                        </div>
                      </div>
                    </div>

                    {/* Reset to defaults */}
                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => {
                          setUiStyles({
                            tabBarStyle: 'elevated',
                            borderStyle: 'soft',
                            activeTabStyle: 'elevated'
                          })
                          updatePreferences({
                            tabBarStyle: 'elevated',
                            borderStyle: 'soft',
                            activeTabStyle: 'elevated'
                          })
                        }}
                        className="text-xs text-nexus-text-muted hover:text-nexus-accent transition-colors"
                      >
                        Reset to defaults
                      </button>
                    </div>
                  </div>
                </section>

                {/* Right Sidebar Settings (v1.8) */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <SlidersHorizontal className="w-3 h-3 inline mr-2" />
                    Right Sidebar
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">

                    {/* Tab Size */}
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Tab Size</label>
                      <div className="flex gap-2">
                        {(['compact', 'full'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updateSidebarSetting('tabSize', size)}
                            className={`flex-1 py-2 px-3 rounded text-xs transition-all ${
                              sidebarSettings.tabSize === size
                                ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30'
                                : 'bg-white/5 text-nexus-text-muted border border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {size === 'compact' ? 'Compact' : 'Full'}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-nexus-text-muted mt-1.5">
                        {sidebarSettings.tabSize === 'compact' && 'Smaller tabs (12px font, minimal padding)'}
                        {sidebarSettings.tabSize === 'full' && 'Larger tabs with more spacing (13px font)'}
                      </p>
                    </div>

                    {/* Visible Tabs */}
                    <div>
                      <label className="text-xs text-nexus-text-muted mb-2 block">Visible Tabs</label>
                      <div className="grid grid-cols-3 gap-2">
                        {DEFAULT_SIDEBAR_TAB_ORDER.map((tabId) => {
                          const isHidden = sidebarSettings.hiddenTabs.includes(tabId)
                          const visibleCount = DEFAULT_SIDEBAR_TAB_ORDER.length - sidebarSettings.hiddenTabs.length
                          const isLastVisible = !isHidden && visibleCount <= 1
                          return (
                            <button
                              key={tabId}
                              onClick={() => toggleTabVisibility(tabId)}
                              disabled={isLastVisible}
                              className={`py-1.5 px-2 rounded text-xs transition-all flex items-center gap-1.5 justify-center ${
                                !isHidden
                                  ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30'
                                  : 'bg-white/5 text-nexus-text-muted border border-white/5 hover:bg-white/10'
                              } ${isLastVisible ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isLastVisible ? 'At least one tab must remain visible' : `${isHidden ? 'Show' : 'Hide'} ${tabLabels[tabId]} tab`}
                            >
                              {!isHidden && <Check size={10} />}
                              {tabLabels[tabId]}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-nexus-text-muted mt-1.5">
                        Click to toggle tab visibility. At least one tab must remain visible.
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="pt-3 border-t border-white/5">
                      <label className="text-xs text-nexus-text-muted mb-2 block">Preview</label>
                      <div
                        className="sidebar-tabs rounded-lg overflow-hidden border border-white/10 p-2 flex gap-1"
                        data-sidebar-tab-size={sidebarSettings.tabSize}
                        style={{ background: 'var(--nexus-bg-primary)' }}
                      >
                        {sidebarSettings.tabOrder
                          .filter(tabId => !sidebarSettings.hiddenTabs.includes(tabId))
                          .map((tabId, idx) => (
                            <button
                              key={tabId}
                              className={`sidebar-tab ${idx === 0 ? 'active' : ''}`}
                              style={{
                                background: idx === 0 ? 'var(--nexus-accent)' : 'var(--nexus-bg-tertiary)',
                                color: idx === 0 ? 'white' : 'var(--nexus-text-muted)',
                                borderRadius: '4px',
                                border: 'none'
                              }}
                            >
                              {tabLabels[tabId]}
                            </button>
                          ))
                        }
                      </div>
                    </div>

                    {/* Reset to defaults */}
                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => {
                          setSidebarSettings({
                            tabSize: 'compact',
                            tabOrder: [...DEFAULT_SIDEBAR_TAB_ORDER],
                            hiddenTabs: []
                          })
                          updatePreferences({
                            sidebarTabSize: 'compact',
                            sidebarTabOrder: [...DEFAULT_SIDEBAR_TAB_ORDER],
                            sidebarHiddenTabs: []
                          })
                        }}
                        className="text-xs text-nexus-text-muted hover:text-nexus-accent transition-colors"
                      >
                        Reset to defaults
                      </button>
                    </div>
                  </div>
                </section>

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

                {/* Custom CSS */}
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    <FileCode className="w-3 h-3 inline mr-2" />
                    Custom CSS
                    <span className="ml-2 text-[10px] normal-case tracking-normal font-normal opacity-60">
                      — advanced styling for power users
                    </span>
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">Enable Custom CSS</div>
                        <div className="text-xs text-nexus-text-muted">Apply your own styles to the editor</div>
                      </div>
                      <button
                        onClick={() => {
                          const prefs = loadPreferences()
                          updatePreferences({ customCSSEnabled: !prefs.customCSSEnabled })
                        }}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                          loadPreferences().customCSSEnabled ? 'bg-nexus-accent' : 'bg-white/10'
                        }`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                          loadPreferences().customCSSEnabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    <div>
                      <textarea
                        value={loadPreferences().customCSS}
                        onChange={(e) => updatePreferences({ customCSS: e.target.value })}
                        placeholder={`/* Custom CSS for Scribe editor */
.editor-content {
  /* Your styles here */
}

/* Example: Larger headings */
.prose h1 { font-size: 2.5rem; }
.prose h2 { font-size: 2rem; }`}
                        className="w-full h-40 bg-nexus-bg-primary border border-white/10 rounded-md p-3 text-sm font-mono text-nexus-text-primary placeholder:text-nexus-text-muted/30 focus:outline-none focus:border-nexus-accent resize-y"
                        spellCheck={false}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-nexus-text-muted">
                          Changes apply immediately when enabled
                        </span>
                        <button
                          onClick={() => updatePreferences({ customCSS: '' })}
                          className="text-xs text-nexus-text-muted hover:text-nexus-error transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            )}

            {activeTab === 'icon-bar' && (
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">
                    Glow Effects
                  </h4>
                  <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-5">
                    {/* Enable Icon Glow */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">Enable Icon Glow</div>
                        <div className="text-xs text-nexus-text-muted mt-1">Show glow effect on active project icons</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={iconBarSettings.iconGlowEffect}
                        onChange={(e) => {
                          updateIconBarSetting('iconGlowEffect', e.target.checked)
                        }}
                        className="w-4 h-4"
                      />
                    </div>

                    {/* Glow Intensity */}
                    <div>
                      <label className="text-sm font-medium text-nexus-text-primary mb-2 block">Glow Intensity</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'subtle', label: 'Subtle', desc: 'Minimal glow (Recommended)' },
                          { value: 'medium', label: 'Medium', desc: 'Balanced visibility' },
                          { value: 'prominent', label: 'Prominent', desc: 'Strong glow' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateIconBarSetting('iconGlowIntensity', option.value as 'subtle' | 'medium' | 'prominent')}
                            className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                              iconBarSettings.iconGlowIntensity === option.value
                                ? 'bg-nexus-accent text-white'
                                : 'bg-nexus-bg-primary text-nexus-text-muted hover:text-nexus-text-primary hover:bg-white/5'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-nexus-text-muted mt-1.5">
                        Control the intensity of the glow effect on active project icons
                      </p>
                    </div>
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
                      <div className="text-xs text-nexus-text-muted">Standard for peer-to-peer page linking.</div>
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
