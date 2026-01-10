import { SettingsCategoryData, Setting } from '../store/useSettingsStore'

/**
 * Settings Schema
 *
 * Defines all available settings in Scribe, organized by category.
 * Each setting has:
 * - id: Unique identifier
 * - type: UI control type
 * - label: Display name
 * - description: Help text (optional)
 * - defaultValue: Initial value
 * - addedInVersion: Track when setting was added (for "What's New" badge)
 */

// Editor Category
const editorCategory: SettingsCategoryData = {
  id: 'editor',
  label: 'Editor',
  icon: '✏️',
  sections: [
    {
      id: 'font-spacing',
      title: 'Font & Spacing',
      description: 'Customize editor typography',
      collapsed: false,
      settings: [
        {
          id: 'editor.fontFamily',
          type: 'select',
          label: 'Font Family',
          description: 'ADHD-friendly fonts with excellent readability',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter (Recommended)', value: 'Inter' },
            { label: 'Atkinson Hyperlegible', value: 'Atkinson Hyperlegible' },
            { label: 'Comic Neue', value: 'Comic Neue' },
            { label: 'OpenDyslexic', value: 'OpenDyslexic' },
            { label: 'Lexend', value: 'Lexend' },
            { label: 'System Default', value: 'system-ui' }
          ]
        },
        {
          id: 'editor.fontSize',
          type: 'number',
          label: 'Font Size (px)',
          description: 'Larger fonts reduce eye strain',
          defaultValue: 16
        },
        {
          id: 'editor.lineHeight',
          type: 'number',
          label: 'Line Height',
          description: 'Spacing between lines (1.5-2.0 recommended)',
          defaultValue: 1.6
        },
        {
          id: 'editor.enableLigatures',
          type: 'toggle',
          label: 'Enable Ligatures',
          description: 'Combine characters like -> into arrows',
          defaultValue: true
        }
      ]
    },
    {
      id: 'focus-mode',
      title: 'Focus Mode',
      description: 'Minimize distractions while writing',
      collapsed: false,
      settings: [
        {
          id: 'editor.focusMode.dimOtherPanes',
          type: 'toggle',
          label: 'Dim Other Panes',
          description: 'Reduce opacity of sidebars during focus',
          defaultValue: true
        },
        {
          id: 'editor.focusMode.dimAmount',
          type: 'number',
          label: 'Dimming Percentage',
          description: 'How much to dim (0-100%)',
          defaultValue: 40
        },
        {
          id: 'editor.focusMode.hideUI',
          type: 'toggle',
          label: 'Hide UI Elements',
          description: 'Hide toolbars and status bar',
          defaultValue: false
        }
      ]
    },
    {
      id: 'advanced-editor',
      title: 'Advanced Editor Settings',
      description: 'Fine-tune editor behavior',
      collapsed: true,
      settings: [
        {
          id: 'editor.spellCheck',
          type: 'toggle',
          label: 'Spell Check',
          description: 'Enable browser spell checking',
          defaultValue: true
        },
        {
          id: 'editor.autoSaveDelay',
          type: 'number',
          label: 'Auto-save Delay (ms)',
          description: 'Time before auto-saving changes',
          defaultValue: 1000
        }
      ]
    }
  ],
  badge: undefined
}

// Themes Category
const themesCategory: SettingsCategoryData = {
  id: 'themes',
  label: 'Themes',
  icon: '🎨',
  sections: [
    {
      id: 'theme-selection',
      title: 'Theme Selection',
      description: 'Choose your visual theme',
      collapsed: false,
      settings: [
        {
          id: 'themes.current',
          type: 'gallery',
          label: 'Current Theme',
          description: 'Visual theme for editor and UI',
          defaultValue: 'slate',
          options: [
            { label: 'Slate', value: 'slate', description: 'Dark theme with blue accents' },
            { label: 'Ocean', value: 'ocean', description: 'Dark theme with teal accents' },
            { label: 'Forest', value: 'forest', description: 'Dark theme with green accents' },
            { label: 'Dracula', value: 'dracula', description: 'Popular dark theme' },
            { label: 'Nord', value: 'nord', description: 'Arctic-inspired theme' },
            { label: 'Linen', value: 'linen', description: 'Light theme with warm tones' },
            { label: 'Paper', value: 'paper', description: 'Clean light theme' },
            { label: 'Cream', value: 'cream', description: 'Light theme with beige tones' }
          ]
        },
        {
          id: 'themes.autoSwitch',
          type: 'toggle',
          label: 'Auto Switch by Time',
          description: 'Light theme 6am-6pm, dark otherwise',
          defaultValue: false
        }
      ]
    },
    {
      id: 'theme-customization',
      title: 'Theme Customization',
      description: 'Create your own theme',
      collapsed: true,
      settings: [
        {
          id: 'themes.custom.primaryColor',
          type: 'color',
          label: 'Primary Color',
          description: 'Main accent color',
          defaultValue: '#3b82f6'
        },
        {
          id: 'themes.custom.backgroundColor',
          type: 'color',
          label: 'Background Color',
          description: 'Editor background',
          defaultValue: '#ffffff'
        }
      ]
    }
  ],
  badge: undefined
}

// AI & Workflow Category
const aiCategory: SettingsCategoryData = {
  id: 'ai',
  label: 'AI & Workflow',
  icon: '🤖',
  sections: [
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'One-click AI prompts',
      collapsed: false,
      settings: [
        {
          id: 'ai.quickActions.enabled',
          type: 'toggle',
          label: 'Enable Quick Actions',
          description: 'Show Quick Actions buttons in editor',
          defaultValue: true,
          contextualHintLocation: 'ClaudePanel',
          addedInVersion: 'v1.7.0'
        },
        {
          id: 'ai.quickActions.showInSidebar',
          type: 'toggle',
          label: 'Show in Sidebar',
          description: 'Display Quick Actions in right sidebar',
          defaultValue: true,
          addedInVersion: 'v1.7.0'
        },
        {
          id: 'ai.quickActions.showInContextMenu',
          type: 'toggle',
          label: 'Show in Context Menu',
          description: 'Right-click to access Quick Actions',
          defaultValue: true,
          addedInVersion: 'v1.7.0'
        }
      ]
    },
    {
      id: 'chat-persistence',
      title: 'Chat History',
      description: 'Conversation persistence settings',
      collapsed: false,
      settings: [
        {
          id: 'ai.chat.saveHistory',
          type: 'toggle',
          label: 'Save Chat History',
          description: 'Persist conversations per note',
          defaultValue: true,
          addedInVersion: 'v1.7.0'
        },
        {
          id: 'ai.chat.autoScroll',
          type: 'toggle',
          label: 'Auto-scroll to Bottom',
          description: 'Scroll to newest message automatically',
          defaultValue: true,
          addedInVersion: 'v1.7.0'
        }
      ]
    },
    {
      id: 'at-references',
      title: '@ References',
      description: 'Note inclusion in prompts',
      collapsed: false,
      settings: [
        {
          id: 'ai.references.enabled',
          type: 'toggle',
          label: 'Enable @ References',
          description: 'Autocomplete notes with @',
          defaultValue: true,
          addedInVersion: 'v1.7.0'
        },
        {
          id: 'ai.references.fuzzySearch',
          type: 'toggle',
          label: 'Fuzzy Search',
          description: 'Match notes with approximate names',
          defaultValue: true,
          addedInVersion: 'v1.7.0'
        }
      ]
    }
  ],
  badge: 3 // 3 new features in v1.7.0
}

// Projects Category
const projectsCategory: SettingsCategoryData = {
  id: 'projects',
  label: 'Projects',
  icon: '📁',
  sections: [
    {
      id: 'project-templates',
      title: 'Project Templates',
      description: 'Preconfigured settings for different project types',
      collapsed: false,
      settings: [] // Custom UI handled by ProjectTemplates component
    },
    {
      id: 'project-defaults',
      title: 'Project Defaults',
      description: 'Default settings for new projects',
      collapsed: false,
      settings: [
        {
          id: 'projects.defaultType',
          type: 'select',
          label: 'Default Project Type',
          description: 'Type auto-selected when creating projects',
          defaultValue: 'generic',
          options: [
            { label: 'Research', value: 'research' },
            { label: 'Teaching', value: 'teaching' },
            { label: 'R Package', value: 'r-package' },
            { label: 'R Dev', value: 'r-dev' },
            { label: 'Generic', value: 'generic' }
          ]
        },
        {
          id: 'projects.defaultWorkingDirectory',
          type: 'text',
          label: 'Default Working Directory',
          description: 'Base path for new projects',
          defaultValue: '~/projects'
        }
      ]
    },
    {
      id: 'daily-notes',
      title: 'Daily Notes',
      description: 'Daily note templates and behavior',
      collapsed: false,
      settings: [
        {
          id: 'projects.dailyNotes.template',
          type: 'select',
          label: 'Daily Note Template',
          description: 'Template for ⌘D daily notes',
          defaultValue: 'simple',
          options: [
            { label: 'Simple', value: 'simple' },
            { label: 'Research', value: 'research' },
            { label: 'Teaching', value: 'teaching' },
            { label: 'ADHD Focus', value: 'adhd-focus' },
            { label: 'Custom', value: 'custom' }
          ]
        },
        {
          id: 'projects.dailyNotes.autoOpen',
          type: 'toggle',
          label: 'Auto-open on Launch',
          description: 'Open daily note when Scribe starts',
          defaultValue: false
        }
      ]
    }
  ],
  badge: undefined
}

// Appearance Category
const appearanceCategory: SettingsCategoryData = {
  id: 'appearance',
  label: 'Appearance',
  icon: '🎨',
  sections: [
    {
      id: 'tab-bar',
      title: 'Tab Bar Style',
      description: 'Customize editor tab appearance',
      collapsed: false,
      settings: [
        {
          id: 'appearance.tabBarStyle',
          type: 'select',
          label: 'Tab Bar Style',
          description: 'Visual style of the tab bar',
          defaultValue: 'subtle',
          options: [
            { label: 'Subtle - Minimal background', value: 'subtle' },
            { label: 'Elevated - Modern shadow effect', value: 'elevated' },
            { label: 'Glass - Frosted blur (macOS Sonoma)', value: 'glass' },
            { label: 'Borderless - Same as editor background', value: 'borderless' }
          ],
          addedInVersion: '1.12.0'
        },
        {
          id: 'appearance.activeTabStyle',
          type: 'select',
          label: 'Active Tab Style',
          description: 'How the active tab is highlighted',
          defaultValue: 'accent-bar',
          options: [
            { label: 'Elevated - Shadow + lift effect', value: 'elevated' },
            { label: 'Accent Bar - Gradient accent indicator', value: 'accent-bar' },
            { label: 'Background - Accent-colored fill', value: 'background' },
            { label: 'Bold - Bold text only (minimal)', value: 'bold' },
            { label: 'Full - All effects combined', value: 'full' }
          ],
          addedInVersion: '1.12.0'
        }
      ]
    },
    {
      id: 'sidebar',
      title: 'Sidebar Settings',
      description: 'Customize sidebar appearance and behavior',
      collapsed: false,
      settings: [
        {
          id: 'appearance.sidebarTabSize',
          type: 'select',
          label: 'Sidebar Tab Size',
          description: 'Size of sidebar panel tabs',
          defaultValue: 'compact',
          options: [
            { label: 'Compact - Smaller tabs, minimal padding', value: 'compact' },
            { label: 'Full - Larger tabs with more spacing', value: 'full' }
          ],
          addedInVersion: '1.12.0'
        },
        {
          id: 'appearance.showSidebarIcons',
          type: 'toggle',
          label: 'Show Sidebar Icons',
          description: 'Display icons in sidebar tabs',
          defaultValue: true,
          addedInVersion: '1.12.0'
        },
        {
          id: 'appearance.autoCollapseSidebar',
          type: 'toggle',
          label: 'Auto-collapse when writing',
          description: 'Collapse sidebar when editor is focused, expand on hover',
          defaultValue: false,
          addedInVersion: 'v1.14.0'
        },
        {
          id: 'appearance.sidebarWidth',
          type: 'select',
          label: 'Sidebar Width',
          description: 'Quick width presets for sidebar (respects mode constraints)',
          defaultValue: 'medium',
          options: [
            { label: 'Narrow - 200px (Minimal)', value: 'narrow' },
            { label: 'Medium - 280px (Balanced)', value: 'medium' },
            { label: 'Wide - 360px (Spacious)', value: 'wide' }
          ],
          addedInVersion: 'v1.15.0'
        },
        {
          id: 'appearance.rememberSidebarMode',
          type: 'toggle',
          label: 'Remember Sidebar Mode',
          description: 'Restore last expanded mode (Compact/Card) when expanding from Icon mode',
          defaultValue: true,
          addedInVersion: 'v1.15.0'
        },
        {
          id: 'appearance.enableExpandPreview',
          type: 'toggle',
          label: 'Expansion Preview (Phase 4)',
          description: 'Show preview overlay when hovering over icons (Coming in v1.16.0)',
          defaultValue: true,
          addedInVersion: 'v1.15.0'
        }
      ]
    },
    {
      id: 'terminal',
      title: 'Terminal Appearance',
      description: 'Customize terminal styling',
      collapsed: true,
      settings: [
        {
          id: 'appearance.terminalFontFamily',
          type: 'select',
          label: 'Terminal Font',
          description: 'Monospace font for terminal',
          defaultValue: 'Menlo',
          options: [
            { label: 'Menlo (System)', value: 'Menlo' },
            { label: 'Monaco', value: 'Monaco' },
            { label: 'Courier New', value: 'Courier New' },
            { label: 'SF Mono', value: 'SF Mono' }
          ],
          addedInVersion: '1.12.0'
        },
        {
          id: 'appearance.terminalFontSize',
          type: 'number',
          label: 'Terminal Font Size (px)',
          description: 'Font size for terminal text',
          defaultValue: 13,
          addedInVersion: '1.12.0'
        }
      ]
    }
  ],
  badge: 11 // Updated for v1.15.0: +2 settings (rememberSidebarMode, enableExpandPreview)
}

// Advanced Category
const advancedCategory: SettingsCategoryData = {
  id: 'advanced',
  label: 'Advanced',
  icon: '⚙️',
  sections: [
    {
      id: 'performance',
      title: 'Performance',
      description: 'Optimize app performance',
      collapsed: true,
      settings: [
        {
          id: 'advanced.performance.enableAnimations',
          type: 'toggle',
          label: 'Enable Animations',
          description: 'UI animations (disable for reduced motion)',
          defaultValue: true
        },
        {
          id: 'advanced.performance.lazyLoadNotes',
          type: 'toggle',
          label: 'Lazy Load Notes',
          description: 'Load note content on demand',
          defaultValue: true
        }
      ]
    },
    {
      id: 'data',
      title: 'Data & Storage',
      description: 'Manage app data',
      collapsed: true,
      settings: [
        {
          id: 'advanced.data.clearCache',
          type: 'toggle',
          label: 'Clear Cache on Exit',
          description: 'Remove cached data when closing app',
          defaultValue: false
        }
      ]
    }
  ],
  badge: undefined
}

// Export all categories
export const settingsCategories: SettingsCategoryData[] = [
  editorCategory,
  themesCategory,
  appearanceCategory,
  aiCategory,
  projectsCategory,
  advancedCategory
]

// Helper to get all settings as flat array
export const getAllSettings = (): Setting[] => {
  return settingsCategories.flatMap(category =>
    category.sections.flatMap(section => section.settings)
  )
}

// Helper to get setting by ID
export const getSettingById = (id: string): Setting | undefined => {
  return getAllSettings().find(setting => setting.id === id)
}

// Helper to get category by ID
export const getCategoryById = (id: string): SettingsCategoryData | undefined => {
  return settingsCategories.find(category => category.id === id)
}

// Helper to count new settings (for badge)
export const countNewSettings = (version: string): number => {
  return getAllSettings().filter(setting => setting.addedInVersion === version).length
}

// Helper to get all new settings
export const getNewSettings = (version: string): Setting[] => {
  return getAllSettings().filter(setting => setting.addedInVersion === version)
}
