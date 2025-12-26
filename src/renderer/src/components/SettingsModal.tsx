import { useState } from 'react'
import { 
  X, 
  Settings as SettingsIcon, 
  Type, 
  FileCode, 
  Share2, 
  User, 
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'dark' | 'light'
  onThemeChange: (theme: 'dark' | 'light') => void
}

type SettingsTab = 'general' | 'editor' | 'appearance' | 'files' | 'academic'

export function SettingsModal({ isOpen, onClose, theme, onThemeChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  if (!isOpen) return null

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'editor', label: 'Editor', icon: Type },
    { id: 'appearance', label: 'Appearance', icon: Sparkles },
    { id: 'files', label: 'Files & Links', icon: FileCode },
    { id: 'academic', label: 'Research', icon: BookOpen },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-nexus-bg-primary/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      
      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[600px] bg-nexus-bg-secondary border border-white/10 rounded-xl shadow-2xl flex overflow-hidden animate-slide-up">
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
                <section>
                  <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4">Themes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => onThemeChange('dark')}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        theme === 'dark' 
                          ? 'border-nexus-accent bg-nexus-bg-primary' 
                          : 'border-white/10 bg-nexus-bg-tertiary hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-medium text-nexus-text-primary mb-1">Oxford Dark</div>
                      <div className={`text-[10px] uppercase font-bold tracking-widest ${
                        theme === 'dark' ? 'text-nexus-accent' : 'text-nexus-text-muted'
                      }`}>
                        {theme === 'dark' ? 'Active' : 'Select'}
                      </div>
                    </button>
                    <button
                      onClick={() => onThemeChange('light')}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        theme === 'light' 
                          ? 'border-nexus-accent bg-nexus-bg-primary' 
                          : 'border-white/10 bg-nexus-bg-tertiary hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-medium text-nexus-text-primary mb-1">Classic Light</div>
                      <div className={`text-[10px] uppercase font-bold tracking-widest ${
                        theme === 'light' ? 'text-nexus-accent' : 'text-nexus-text-muted'
                      }`}>
                        {theme === 'light' ? 'Active' : 'Select'}
                      </div>
                    </button>
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
              Scribe v0.3.0 • Oxford Dark Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
