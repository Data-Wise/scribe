import { useState, useMemo } from 'react'
import {
  // General
  Folder, FolderOpen, File, FileText, Files,
  // Education & Research
  GraduationCap, BookOpen, Library, Microscope, Beaker, FlaskConical,
  // Development
  Code2, Terminal, Package, Boxes, Braces, GitBranch, Database,
  // Writing & Content
  PenTool, Edit3, FileEdit, BookMarked, Newspaper, Scroll,
  // Business & Work
  Briefcase, Target, TrendingUp, BarChart3, PieChart, Calendar,
  // Creative
  Palette, Brush, Sparkles, Lightbulb, Wand2, Star,
  // Organization
  Archive, Bookmark, Tags, Layers, Grid3x3, ListChecks,
  // Science & Data
  Atom, Binary, Calculator, Activity, LineChart, Workflow,
  // Communication
  MessageSquare, Mail, Users, UserCircle2, Globe2,
  // Media
  Image, Film, Music, Headphones, Camera, Video,
  // Other
  Heart, Coffee, Rocket, Zap, Trophy, Flag,
  Home, Settings, Search, X
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface IconOption {
  name: string
  Icon: LucideIcon
  category: string
}

const ICON_OPTIONS: IconOption[] = [
  // General (8)
  { name: 'Folder', Icon: Folder, category: 'General' },
  { name: 'FolderOpen', Icon: FolderOpen, category: 'General' },
  { name: 'File', Icon: File, category: 'General' },
  { name: 'FileText', Icon: FileText, category: 'General' },
  { name: 'Files', Icon: Files, category: 'General' },
  { name: 'Home', Icon: Home, category: 'General' },
  { name: 'Settings', Icon: Settings, category: 'General' },
  { name: 'Search', Icon: Search, category: 'General' },

  // Education & Research (6)
  { name: 'GraduationCap', Icon: GraduationCap, category: 'Education' },
  { name: 'BookOpen', Icon: BookOpen, category: 'Education' },
  { name: 'Library', Icon: Library, category: 'Education' },
  { name: 'Microscope', Icon: Microscope, category: 'Education' },
  { name: 'Beaker', Icon: Beaker, category: 'Education' },
  { name: 'FlaskConical', Icon: FlaskConical, category: 'Education' },

  // Development (7)
  { name: 'Code2', Icon: Code2, category: 'Development' },
  { name: 'Terminal', Icon: Terminal, category: 'Development' },
  { name: 'Package', Icon: Package, category: 'Development' },
  { name: 'Boxes', Icon: Boxes, category: 'Development' },
  { name: 'Braces', Icon: Braces, category: 'Development' },
  { name: 'GitBranch', Icon: GitBranch, category: 'Development' },
  { name: 'Database', Icon: Database, category: 'Development' },

  // Writing & Content (6)
  { name: 'PenTool', Icon: PenTool, category: 'Writing' },
  { name: 'Edit3', Icon: Edit3, category: 'Writing' },
  { name: 'FileEdit', Icon: FileEdit, category: 'Writing' },
  { name: 'BookMarked', Icon: BookMarked, category: 'Writing' },
  { name: 'Newspaper', Icon: Newspaper, category: 'Writing' },
  { name: 'Scroll', Icon: Scroll, category: 'Writing' },

  // Business & Work (6)
  { name: 'Briefcase', Icon: Briefcase, category: 'Business' },
  { name: 'Target', Icon: Target, category: 'Business' },
  { name: 'TrendingUp', Icon: TrendingUp, category: 'Business' },
  { name: 'BarChart3', Icon: BarChart3, category: 'Business' },
  { name: 'PieChart', Icon: PieChart, category: 'Business' },
  { name: 'Calendar', Icon: Calendar, category: 'Business' },

  // Creative (6)
  { name: 'Palette', Icon: Palette, category: 'Creative' },
  { name: 'Brush', Icon: Brush, category: 'Creative' },
  { name: 'Sparkles', Icon: Sparkles, category: 'Creative' },
  { name: 'Lightbulb', Icon: Lightbulb, category: 'Creative' },
  { name: 'Wand2', Icon: Wand2, category: 'Creative' },
  { name: 'Star', Icon: Star, category: 'Creative' },

  // Organization (6)
  { name: 'Archive', Icon: Archive, category: 'Organization' },
  { name: 'Bookmark', Icon: Bookmark, category: 'Organization' },
  { name: 'Tags', Icon: Tags, category: 'Organization' },
  { name: 'Layers', Icon: Layers, category: 'Organization' },
  { name: 'Grid3x3', Icon: Grid3x3, category: 'Organization' },
  { name: 'ListChecks', Icon: ListChecks, category: 'Organization' },

  // Science & Data (6)
  { name: 'Atom', Icon: Atom, category: 'Science' },
  { name: 'Binary', Icon: Binary, category: 'Science' },
  { name: 'Calculator', Icon: Calculator, category: 'Science' },
  { name: 'Activity', Icon: Activity, category: 'Science' },
  { name: 'LineChart', Icon: LineChart, category: 'Science' },
  { name: 'Workflow', Icon: Workflow, category: 'Science' },

  // Communication (5)
  { name: 'MessageSquare', Icon: MessageSquare, category: 'Communication' },
  { name: 'Mail', Icon: Mail, category: 'Communication' },
  { name: 'Users', Icon: Users, category: 'Communication' },
  { name: 'UserCircle2', Icon: UserCircle2, category: 'Communication' },
  { name: 'Globe2', Icon: Globe2, category: 'Communication' },

  // Media (6)
  { name: 'Image', Icon: Image, category: 'Media' },
  { name: 'Film', Icon: Film, category: 'Media' },
  { name: 'Music', Icon: Music, category: 'Media' },
  { name: 'Headphones', Icon: Headphones, category: 'Media' },
  { name: 'Camera', Icon: Camera, category: 'Media' },
  { name: 'Video', Icon: Video, category: 'Media' },

  // Other (6)
  { name: 'Heart', Icon: Heart, category: 'Other' },
  { name: 'Coffee', Icon: Coffee, category: 'Other' },
  { name: 'Rocket', Icon: Rocket, category: 'Other' },
  { name: 'Zap', Icon: Zap, category: 'Other' },
  { name: 'Trophy', Icon: Trophy, category: 'Other' },
  { name: 'Flag', Icon: Flag, category: 'Other' },
]

const CATEGORIES = [
  'All',
  'General',
  'Education',
  'Development',
  'Writing',
  'Business',
  'Creative',
  'Organization',
  'Science',
  'Communication',
  'Media',
  'Other',
]

interface IconPickerProps {
  selectedIcon?: string
  onSelectIcon: (iconName: string) => void
  onClose: () => void
}

export function IconPicker({ selectedIcon, onSelectIcon, onClose }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIcons = useMemo(() => {
    let icons = ICON_OPTIONS

    // Filter by category
    if (activeCategory !== 'All') {
      icons = icons.filter(icon => icon.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      icons = icons.filter(icon =>
        icon.name.toLowerCase().includes(query) ||
        icon.category.toLowerCase().includes(query)
      )
    }

    return icons
  }, [activeCategory, searchQuery])

  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="icon-picker-header">
          <h3 className="icon-picker-title">Choose an Icon</h3>
          <button
            onClick={onClose}
            className="icon-picker-close"
            aria-label="Close icon picker"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="icon-picker-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>

        {/* Category Tabs */}
        <div className="icon-picker-categories">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Icon Grid */}
        <div className="icon-picker-grid">
          {filteredIcons.length === 0 ? (
            <div className="no-icons-message">
              No icons found for "{searchQuery}"
            </div>
          ) : (
            filteredIcons.map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => {
                  onSelectIcon(name)
                  onClose()
                }}
                className={`icon-option ${selectedIcon === name ? 'selected' : ''}`}
                title={name}
                aria-label={`Select ${name} icon`}
              >
                <Icon size={20} />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="icon-picker-footer">
          <span className="icon-count">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''}
          </span>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to get icon component by name
export function getIconByName(iconName: string | undefined): LucideIcon {
  const option = ICON_OPTIONS.find(opt => opt.name === iconName)
  return option ? option.Icon : Folder // Default to Folder
}

// Helper function to get all available icon names
export function getAvailableIcons(): string[] {
  return ICON_OPTIONS.map(opt => opt.name)
}
