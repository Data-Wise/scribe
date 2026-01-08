import { useState } from 'react'
import {
  Link2,
  Tags,
  Eye,
  Keyboard,
  Search,
  Folder,
  Calendar,
  Focus,
  Command,
  Zap,
  Settings,
  Code,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Terminal,
  ChevronRight,
  X
} from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'core' | 'editing' | 'organization' | 'ai' | 'advanced'
  demo?: {
    type: 'text' | 'interactive' | 'video' | 'keyboard'
    content: string | React.ReactNode
  }
  shortcut?: string
  status: 'available' | 'demo' | 'planned'
}

const features: Feature[] = [
  // Core Features
  {
    id: 'editor-modes',
    title: 'Three Editor Modes',
    description: 'Switch between Source (⌘1), Live Preview (⌘2), and Reading (⌘3) modes. Cycle with ⌘E.',
    icon: <Eye className="w-5 h-5" />,
    category: 'core',
    shortcut: '⌘E to cycle',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Source mode for raw markdown editing. Live Preview hides syntax while typing (like Obsidian). Reading mode for distraction-free reading.'
    }
  },
  {
    id: 'wikilinks',
    title: 'WikiLinks Navigation',
    description: 'Link notes with [[Note Title]] syntax. Single-click to navigate in Live/Reading modes, ⌘+Click in Source mode.',
    icon: <Link2 className="w-5 h-5" />,
    category: 'core',
    shortcut: '[[note]]',
    status: 'available',
    demo: {
      type: 'interactive',
      content: (
        <div className="space-y-2">
          <p className="text-sm text-nexus-text-muted">Try it: [[Welcome]] [[Getting Started]]</p>
          <p className="text-xs text-nexus-text-muted">Click links in Live/Reading mode, or ⌘+Click in Source</p>
        </div>
      )
    }
  },
  {
    id: 'backlinks',
    title: 'Automatic Backlinks',
    description: 'See all notes linking to the current note. Navigate your knowledge graph effortlessly.',
    icon: <ArrowRight className="w-5 h-5 transform rotate-180" />,
    category: 'core',
    shortcut: 'Right sidebar',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Backlinks panel shows incoming links (who links to this note) and outgoing links (what this note links to).'
    }
  },
  {
    id: 'focus-mode',
    title: 'Focus Mode',
    description: 'Distraction-free writing. Hide all UI elements and focus on your words.',
    icon: <Focus className="w-5 h-5" />,
    category: 'core',
    shortcut: '⌘⇧F',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Press ⌘⇧F to enter focus mode. Hide sidebars, tabs, and toolbars. Just you and your words. ESC to exit.'
    }
  },

  // Editing Features
  {
    id: 'math-rendering',
    title: 'LaTeX Math Rendering',
    description: 'Write mathematical equations with KaTeX. Inline $...$ and display $$...$$ math.',
    icon: <Code className="w-5 h-5" />,
    category: 'editing',
    shortcut: '$ or $$',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Inline: $E = mc^2$  Display: $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$'
    }
  },
  {
    id: 'autocomplete',
    title: 'Smart Autocomplete',
    description: 'Autocomplete for notes (@), tags (#), and Quarto syntax (YAML, chunk options, cross-refs).',
    icon: <Zap className="w-5 h-5" />,
    category: 'editing',
    shortcut: '@ or #',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Type @ to reference notes, # for tags. In Quarto documents, get autocomplete for YAML keys, chunk options, and cross-references.'
    }
  },
  {
    id: 'properties',
    title: 'YAML Properties',
    description: 'Add metadata to notes with YAML frontmatter. Track status, type, word goals, and custom properties.',
    icon: <Settings className="w-5 h-5" />,
    category: 'editing',
    shortcut: 'Right sidebar',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Properties panel in right sidebar. Set status, type, word_goal, and custom key-value pairs. Syncs with YAML frontmatter.'
    }
  },

  // Organization Features
  {
    id: 'projects',
    title: 'Project System',
    description: 'Organize notes into projects. 5 types: Research, Writing, Teaching, Personal, Archive.',
    icon: <Folder className="w-5 h-5" />,
    category: 'organization',
    shortcut: '⌘⇧P',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Create projects to organize notes. Each project can have a color, description, and template. Switch projects in left sidebar.'
    }
  },
  {
    id: 'tags',
    title: 'Hierarchical Tags',
    description: 'Tag notes with #topic/subtopic syntax. Filter notes by tags.',
    icon: <Tags className="w-5 h-5" />,
    category: 'organization',
    shortcut: '#tag',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Use hierarchical tags like #research/statistics or #work/urgent. Click tags to filter. Tags panel shows all tags with counts.'
    }
  },
  {
    id: 'daily-notes',
    title: 'Daily Notes',
    description: 'Quick-capture your thoughts with automatic daily notes. Template-based with date navigation.',
    icon: <Calendar className="w-5 h-5" />,
    category: 'organization',
    shortcut: '⌘D',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Press ⌘D to open today\'s daily note. Auto-created with template. Perfect for journaling, meeting notes, or daily logs.'
    }
  },
  {
    id: 'search',
    title: 'Full-Text Search',
    description: 'Search across all notes and projects. Filter by project, tags, and properties.',
    icon: <Search className="w-5 h-5" />,
    category: 'organization',
    shortcut: '⌘F',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Press ⌘F to open search panel. Search note content, titles, and properties. Filter by project or tags.'
    }
  },

  // AI Features
  {
    id: 'claude-chat',
    title: 'Claude Assistant',
    description: 'Chat with Claude about your notes. Context-aware conversations with note inclusion.',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'ai',
    shortcut: 'Right sidebar',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Claude Chat panel in right sidebar. Ask questions about your notes, get writing help, or brainstorm ideas. Include multiple notes with @ syntax.'
    }
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'One-click AI prompts: Improve, Expand, Summarize, Explain, Research. Customizable shortcuts.',
    icon: <Zap className="w-5 h-5" />,
    category: 'ai',
    shortcut: 'Settings',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Configure Quick Actions in Settings. Define custom prompts with keyboard shortcuts. Access from command palette.'
    }
  },

  // Advanced Features
  {
    id: 'terminal',
    title: 'Integrated Terminal',
    description: 'Run shell commands without leaving Scribe. PTY shell with xterm.js.',
    icon: <Terminal className="w-5 h-5" />,
    category: 'advanced',
    shortcut: '⌘⌥T',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Press ⌘⌥T to toggle terminal. Run git commands, scripts, or any shell command. Right sidebar terminal panel.'
    }
  },
  {
    id: 'command-palette',
    title: 'Command Palette',
    description: 'Quick access to all commands. Search and execute actions with keyboard.',
    icon: <Command className="w-5 h-5" />,
    category: 'advanced',
    shortcut: '⌘K',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Press ⌘K to open command palette. Search for commands, notes, or actions. Keyboard-driven workflow.'
    }
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Full keyboard-driven workflow. Every action has a shortcut.',
    icon: <Keyboard className="w-5 h-5" />,
    category: 'advanced',
    shortcut: '⌘?',
    status: 'available',
    demo: {
      type: 'keyboard',
      content: 'Press ⌘? to see all keyboard shortcuts. Navigate, create, search, and organize without touching the mouse.'
    }
  },
  {
    id: 'quarto',
    title: 'Quarto Documents',
    description: 'Full Quarto support: YAML autocomplete, chunk options, cross-references, and rendering.',
    icon: <BookOpen className="w-5 h-5" />,
    category: 'advanced',
    shortcut: '.qmd files',
    status: 'available',
    demo: {
      type: 'text',
      content: 'Write academic papers and reports with Quarto. Autocomplete for YAML, code chunks, and cross-references. Render to PDF, HTML, Word.'
    }
  },
]

const categories = [
  { id: 'core', label: 'Core Features', color: 'text-blue-400' },
  { id: 'editing', label: 'Editing', color: 'text-green-400' },
  { id: 'organization', label: 'Organization', color: 'text-purple-400' },
  { id: 'ai', label: 'AI Features', color: 'text-pink-400' },
  { id: 'advanced', label: 'Advanced', color: 'text-orange-400' },
]

interface FeaturesShowcaseProps {
  onClose?: () => void
}

export function FeaturesShowcase({ onClose }: FeaturesShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const filteredFeatures = selectedCategory === 'all'
    ? features
    : features.filter(f => f.category === selectedCategory)

  return (
    <div className="h-full flex flex-col bg-nexus-bg-primary text-nexus-text-primary overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scribe Features</h1>
          <p className="text-nexus-text-muted">
            Explore all the features that make Scribe an ADHD-friendly, distraction-free writing companion
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Close features showcase"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="border-b border-white/5 p-4 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-nexus-accent text-white'
              : 'bg-white/5 text-nexus-text-muted hover:bg-white/10'
          }`}
        >
          All Features ({features.length})
        </button>
        {categories.map(cat => {
          const count = features.filter(f => f.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-nexus-accent text-white'
                  : 'bg-white/5 text-nexus-text-muted hover:bg-white/10'
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Features list */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filteredFeatures.map(feature => {
              const category = categories.find(c => c.id === feature.category)
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className="text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all group border border-white/5 hover:border-nexus-accent/50"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-nexus-accent/20 text-nexus-accent group-hover:bg-nexus-accent group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{feature.title}</h3>
                        {feature.status === 'available' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {category && (
                        <span className={`text-xs ${category.color}`}>{category.label}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-nexus-text-muted mb-3">{feature.description}</p>
                  {feature.shortcut && (
                    <div className="flex items-center justify-between">
                      <kbd className="text-xs px-2 py-1 rounded bg-white/10 text-nexus-text-muted">
                        {feature.shortcut}
                      </kbd>
                      <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:text-nexus-accent transition-colors" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Getting started section */}
          <div className="max-w-7xl mx-auto mt-8 p-6 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-nexus-accent" />
              Getting Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Essential Shortcuts</h3>
                <ul className="space-y-1 text-nexus-text-muted">
                  <li><kbd className="text-xs px-1.5 py-0.5 rounded bg-white/10">⌘N</kbd> New note</li>
                  <li><kbd className="text-xs px-1.5 py-0.5 rounded bg-white/10">⌘D</kbd> Daily note</li>
                  <li><kbd className="text-xs px-1.5 py-0.5 rounded bg-white/10">⌘K</kbd> Command palette</li>
                  <li><kbd className="text-xs px-1.5 py-0.5 rounded bg-white/10">⌘F</kbd> Search</li>
                  <li><kbd className="text-xs px-1.5 py-0.5 rounded bg-white/10">⌘E</kbd> Cycle editor modes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Tips</h3>
                <ul className="space-y-1 text-nexus-text-muted">
                  <li>• Link notes with <code className="text-xs px-1 py-0.5 rounded bg-white/10">[[title]]</code></li>
                  <li>• Tag with <code className="text-xs px-1 py-0.5 rounded bg-white/10">#tag/subtag</code></li>
                  <li>• Reference notes with <code className="text-xs px-1 py-0.5 rounded bg-white/10">@note</code></li>
                  <li>• Math with <code className="text-xs px-1 py-0.5 rounded bg-white/10">$equation$</code></li>
                  <li>• Focus mode: <kbd className="text-xs px-1.5 py-0.5 rounded bg-white/10">⌘⇧F</kbd></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feature detail panel */}
        {selectedFeature && (
          <div className="w-96 border-l border-white/5 bg-nexus-bg-secondary overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-lg bg-nexus-accent/20 text-nexus-accent">
                  {selectedFeature.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedFeature.title}</h2>
                  {selectedFeature.shortcut && (
                    <kbd className="text-xs px-2 py-1 rounded bg-white/10 text-nexus-text-muted">
                      {selectedFeature.shortcut}
                    </kbd>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-nexus-text-muted mb-6">{selectedFeature.description}</p>

            {selectedFeature.demo && (
              <div className="bg-nexus-bg-primary rounded-lg p-4 border border-white/5">
                <h3 className="text-sm font-semibold mb-3 text-nexus-text-muted uppercase tracking-wide">
                  {selectedFeature.demo.type === 'interactive' ? 'Try it' : 'Details'}
                </h3>
                <div className="text-sm">
                  {typeof selectedFeature.demo.content === 'string' ? (
                    <p className="text-nexus-text-muted leading-relaxed">{selectedFeature.demo.content}</p>
                  ) : (
                    selectedFeature.demo.content
                  )}
                </div>
              </div>
            )}

            {selectedFeature.status === 'available' && (
              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Available Now</span>
                </div>
                <p className="text-sm text-nexus-text-muted mt-2">
                  This feature is ready to use. Check the shortcuts and try it out!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 p-4 flex items-center justify-between text-sm text-nexus-text-muted">
        <div>
          <span className="font-semibold text-nexus-text-primary">Scribe v1.14.0</span>
          {' · '}
          ADHD-friendly distraction-free writing
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Data-Wise/scribe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-nexus-accent transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://data-wise.github.io/scribe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-nexus-accent transition-colors"
          >
            Documentation
          </a>
          <button
            onClick={() => {
              // Open keyboard shortcuts
              window.dispatchEvent(new KeyboardEvent('keydown', {
                key: '?',
                metaKey: true,
                bubbles: true
              }))
            }}
            className="hover:text-nexus-accent transition-colors"
          >
            Keyboard Shortcuts
          </button>
        </div>
      </div>
    </div>
  )
}
