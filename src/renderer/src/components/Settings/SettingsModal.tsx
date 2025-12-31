import { useState, useEffect } from 'react'
import { useSettingsStore, SearchResult } from '../../store/useSettingsStore'
import { settingsCategories } from '../../lib/settingsSchema'
import { X, Search, RotateCcw, Download, Save } from 'lucide-react'
import SearchResults from './SearchResults'
import SettingControl from './SettingControl'
import QuickActionsSettings from './QuickActionsSettings'
import ThemeGallery from './ThemeGallery'
import ProjectTemplates from './ProjectTemplates'

/**
 * SettingsModal - Main settings modal with tabbed navigation
 *
 * Architecture:
 * - Header: Search box + Close button
 * - Body: Sidebar (category tabs) + Content (current category settings)
 * - Footer: Reset, Export, Save buttons
 *
 * ADHD-Friendly Features:
 * - Clear visual hierarchy
 * - Progressive disclosure (sections collapsed by default)
 * - Search-first interaction (⌘F within settings)
 * - Badge system highlights new features
 */
export default function SettingsModal() {
  const {
    isOpen,
    activeCategory,
    searchQuery,
    setActiveCategory,
    setSearchQuery,
    closeSettings,
    resetToDefaults,
    exportSettings,
    searchSettings
  } = useSettingsStore()

  const [exportSuccess, setExportSuccess] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // Debounced search - wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = searchSettings(searchQuery)
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 300)

    // Cleanup: cancel timer if user types again
    return () => clearTimeout(timer)
  }, [searchQuery, searchSettings])

  if (!isOpen) return null

  const handleSelectSearchResult = (categoryId: string) => {
    // Clear search and navigate to category
    setSearchQuery('')
    setActiveCategory(categoryId as any) // Cast to any to avoid type issues
    // TODO: Scroll to section after navigation
  }

  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults()
    }
  }

  const handleExport = () => {
    const json = exportSettings()
    navigator.clipboard.writeText(json)
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 2000)
  }

  const currentCategory = settingsCategories.find(cat => cat.id === activeCategory)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-5xl h-[80vh] bg-neutral-900 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
          <div className="flex items-center gap-4 flex-1">
            <h2 id="settings-title" className="text-xl font-semibold text-neutral-100">Settings</h2>

            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search settings... (⌘F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search settings"
                role="searchbox"
              />
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-neutral-800 rounded-md transition-colors"
            aria-label="Close settings dialog"
          >
            <X className="w-5 h-5 text-neutral-400" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Category Tabs */}
          <aside className="w-56 border-r border-neutral-700 bg-neutral-800/50 overflow-y-auto" aria-label="Settings categories">
            <nav className="p-3 space-y-1" role="tablist">
              {settingsCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  aria-controls={`settings-panel-${category.id}`}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors
                    ${activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700'
                    }
                  `}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="flex-1 font-medium">{category.label}</span>

                  {/* Badge for new features */}
                  {category.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
                      {typeof category.badge === 'number' ? category.badge : 'NEW'}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content - Current Category Settings or Search Results */}
          <main className="flex-1 overflow-y-auto" role="tabpanel" id={`settings-panel-${activeCategory}`}>
            {searchQuery.trim() ? (
              <div className="animate-fade-in">
                <SearchResults
                  results={searchResults}
                  onSelectResult={handleSelectSearchResult}
                />
              </div>
            ) : (
              <div key={activeCategory} className="p-6 animate-fade-in">
                {currentCategory ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-neutral-100 flex items-center gap-3">
                        <span className="text-3xl">{currentCategory.icon}</span>
                        {currentCategory.label}
                      </h3>
                    </div>

                    {/* Settings sections will be rendered here */}
                    <div className="space-y-6">
                      {currentCategory.sections.map((section) => (
                        <div key={section.id} className="bg-neutral-800 rounded-lg p-6">
                          {/* Special handling for custom UI sections */}
                          {section.id === 'quick-actions' ? (
                            <QuickActionsSettings />
                          ) : section.id === 'theme-selection' ? (
                            <ThemeGallery />
                          ) : section.id === 'project-templates' ? (
                            <ProjectTemplates />
                          ) : (
                            <>
                              <div className="mb-4">
                                <h4 className="text-lg font-semibold text-neutral-100">{section.title}</h4>
                                {section.description && (
                                  <p className="text-sm text-neutral-400 mt-1">{section.description}</p>
                                )}
                              </div>

                              {/* Settings controls */}
                              <div className="space-y-4">
                                {section.settings.map((setting) => (
                                  <SettingControl key={setting.id} setting={setting} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    No category selected
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-700 bg-neutral-800/50">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-md transition-colors"
              aria-label="Reset all settings to default values"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Reset to Defaults
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-md transition-colors"
              aria-label={exportSuccess ? 'Settings copied to clipboard' : 'Export settings to clipboard'}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {exportSuccess ? 'Copied!' : 'Export Settings'}
            </button>
          </div>

          <button
            onClick={closeSettings}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
            aria-label="Save and close settings"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
