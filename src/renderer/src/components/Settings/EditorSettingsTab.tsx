import { useState } from 'react'
import {
  Type,
  Download,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Search
} from 'lucide-react'
import {
  FONT_FAMILIES,
  RECOMMENDED_FONTS,
  groupRecommendedFonts,
  FontSettings,
  RecommendedFont
} from '../../lib/themes'
import {
  DailyNoteTemplate,
  processTemplate,
  loadTemplates,
  getSelectedTemplateId,
  setSelectedTemplateId
} from '../../lib/dailyNoteTemplates'
import { api } from '../../lib/api'
import { isTauri } from '../../lib/platform'
import { SettingsSection } from './SettingsSection'
import { SettingsToggle } from './SettingsToggle'

interface EditorSettingsTabProps {
  fontSettings: FontSettings
  onFontSettingsChange: (settings: FontSettings) => void
}

/**
 * Editor Settings Tab
 * 
 * Includes:
 * - Typography (font family, size, line height)
 * - ADHD-friendly fonts with Homebrew installation
 * - Daily note templates
 * - UI styles (tab bar, borders, active tab)
 * - Right sidebar settings
 */
export function EditorSettingsTab({ fontSettings, onFontSettingsChange }: EditorSettingsTabProps) {
  // Daily note templates state
  const [templates] = useState<DailyNoteTemplate[]>(() => loadTemplates())
  const [selectedTemplateId, setSelectedTemplate] = useState<string>(() => getSelectedTemplateId())
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)

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

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id)
    setSelectedTemplateId(id)
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0]
  const templatePreview = processTemplate(selectedTemplate?.content || '', new Date())

  const loadInstalledFonts = async () => {
    if (!isTauri()) return
    
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

  const handleUseFont = (font: RecommendedFont) => {
    const root = document.documentElement
    root.style.setProperty('--editor-font-family', font.fontFamily)
    
    setFontInstallResult({
      id: font.id,
      success: true,
      message: `Now using ${font.name}! (Changes will reset on reload unless you select it from Typography above)`
    })
    
    setTimeout(() => {
      setFontInstallResult(null)
    }, 3000)
  }

  // Group recommended fonts by status
  const fontGroups = (() => {
    const groups = groupRecommendedFonts(installedFonts)
    
    const filterFont = (font: RecommendedFont) => {
      if (fontCategoryFilter !== 'all' && font.category !== fontCategoryFilter) {
        return false
      }
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

  // Load fonts when showing recommended fonts section
  if (showRecommendedFonts && installedFonts.length === 0 && !isLoadingFonts && isTauri()) {
    loadInstalledFonts()
  }

  return (
    <div className="space-y-6">
      {/* Typography Section */}
      <SettingsSection title="Typography" icon={<Type className="w-3 h-3" />}>
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
      </SettingsSection>

      {/* Writing Experience */}
      <SettingsSection title="Writing Experience">
        <div className="space-y-4">
          <SettingsToggle
            label="Readable line length"
            description="Limit maximum line width for focus."
            checked={true}
            onChange={() => {}}
          />

          <SettingsToggle
            label="Spellcheck"
            description="Enable browser-native spellchecking."
            checked={false}
            onChange={() => {}}
          />
        </div>
      </SettingsSection>

      {/* Daily Notes Templates */}
      <SettingsSection title="Journal Template" icon={<Calendar className="w-3 h-3" />}>
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
              This template will be used when creating new journal entries (⌘D)
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
      </SettingsSection>

      {/* ADHD-Friendly Fonts - Only show in Tauri mode */}
      {isTauri() && (
        <SettingsSection title="ADHD-Friendly Fonts" icon={<Type className="w-3 h-3" />}>
          <div className="flex items-center justify-between mb-4">
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
        </SettingsSection>
      )}
    </div>
  )
}
