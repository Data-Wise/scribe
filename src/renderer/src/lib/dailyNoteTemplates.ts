/**
 * Daily Note Templates - Customizable templates for daily notes
 *
 * Supports variable substitution:
 * - {{date}} - Full date (December 26, 2025)
 * - {{date_short}} - Short date (2025-12-26)
 * - {{day}} - Day of week (Thursday)
 * - {{time}} - Current time (14:30)
 * - {{year}} - Year (2025)
 * - {{month}} - Month name (December)
 * - {{week}} - Week number (52)
 */

export interface DailyNoteTemplate {
  id: string
  name: string
  content: string
  isDefault?: boolean
}

const STORAGE_KEY = 'scribe:dailyNoteTemplates'
const SELECTED_TEMPLATE_KEY = 'scribe:selectedDailyTemplate'

// Default templates
const DEFAULT_TEMPLATES: DailyNoteTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    content: `# {{date}}

## Notes

`,
    isDefault: true
  },
  {
    id: 'journal',
    name: 'Journal',
    content: `# {{day}}, {{date}}

## Morning Reflection
*How am I feeling today?*


## Today's Focus
- [ ]


## Notes


## Evening Review
*What went well? What could be better?*

`,
  },
  {
    id: 'academic',
    name: 'Academic',
    content: `# {{date}}

## Classes & Meetings


## Reading Notes


## Research Progress


## Tasks
- [ ]


## Questions & Ideas

`,
  },
  {
    id: 'adhd-friendly',
    name: 'ADHD-Friendly',
    content: `# {{day}} {{date_short}}

## ONE Thing Today
*What's the single most important thing?*


## Brain Dump
*Get everything out of your head:*


## Quick Wins (< 10 min)
- [ ]
- [ ]
- [ ]

## Bigger Tasks
- [ ]

## End of Day
*Did you do the ONE thing?*

`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    content: `# {{date}}

## Meetings

### Meeting:
**Time:**
**Attendees:**

**Discussion:**


**Action Items:**
- [ ]


## Notes

`,
  }
]

/**
 * Get the week number for a date
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Replace template variables with actual values
 */
export function processTemplate(template: string, date: Date = new Date()): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']

  const fullDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  const shortDate = date.toISOString().split('T')[0]
  const day = dayNames[date.getDay()]
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const year = date.getFullYear().toString()
  const month = monthNames[date.getMonth()]
  const week = getWeekNumber(date).toString()

  return template
    .replace(/\{\{date\}\}/g, fullDate)
    .replace(/\{\{date_short\}\}/g, shortDate)
    .replace(/\{\{day\}\}/g, day)
    .replace(/\{\{time\}\}/g, time)
    .replace(/\{\{year\}\}/g, year)
    .replace(/\{\{month\}\}/g, month)
    .replace(/\{\{week\}\}/g, week)
}

/**
 * Load all templates (custom + defaults)
 */
export function loadTemplates(): DailyNoteTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const custom = JSON.parse(saved) as DailyNoteTemplate[]
      // Merge with defaults, custom templates override defaults with same id
      const customIds = new Set(custom.map(t => t.id))
      const defaults = DEFAULT_TEMPLATES.filter(t => !customIds.has(t.id))
      return [...custom, ...defaults]
    }
  } catch (e) {
    console.error('[Templates] Failed to load templates:', e)
  }
  return DEFAULT_TEMPLATES
}

/**
 * Save custom templates
 */
export function saveTemplates(templates: DailyNoteTemplate[]): void {
  try {
    // Only save non-default templates or modified defaults
    const toSave = templates.filter(t => {
      const defaultTemplate = DEFAULT_TEMPLATES.find(d => d.id === t.id)
      if (!defaultTemplate) return true // Custom template
      return defaultTemplate.content !== t.content // Modified default
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('[Templates] Failed to save templates:', e)
  }
}

/**
 * Get selected template ID
 */
export function getSelectedTemplateId(): string {
  return localStorage.getItem(SELECTED_TEMPLATE_KEY) || 'minimal'
}

/**
 * Set selected template ID
 */
export function setSelectedTemplateId(id: string): void {
  localStorage.setItem(SELECTED_TEMPLATE_KEY, id)
}

/**
 * Get the selected template
 */
export function getSelectedTemplate(): DailyNoteTemplate {
  const templates = loadTemplates()
  const selectedId = getSelectedTemplateId()
  return templates.find(t => t.id === selectedId) || templates[0]
}

/**
 * Create a new custom template
 */
export function createTemplate(name: string, content: string): DailyNoteTemplate {
  const id = `custom-${Date.now()}`
  const template: DailyNoteTemplate = { id, name, content }

  const templates = loadTemplates()
  templates.unshift(template)
  saveTemplates(templates)

  return template
}

/**
 * Update an existing template
 */
export function updateTemplate(id: string, updates: Partial<DailyNoteTemplate>): void {
  const templates = loadTemplates()
  const index = templates.findIndex(t => t.id === id)
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates }
    saveTemplates(templates)
  }
}

/**
 * Delete a custom template
 */
export function deleteTemplate(id: string): void {
  const templates = loadTemplates()
  const filtered = templates.filter(t => t.id !== id || DEFAULT_TEMPLATES.some(d => d.id === id))
  saveTemplates(filtered)

  // If deleted the selected one, reset to minimal
  if (getSelectedTemplateId() === id) {
    setSelectedTemplateId('minimal')
  }
}

/**
 * Get processed content for a daily note
 */
export function getDailyNoteContent(date: Date = new Date()): string {
  const template = getSelectedTemplate()
  return processTemplate(template.content, date)
}

/**
 * Check if content is empty (only whitespace)
 */
export function isContentEmpty(content: string): boolean {
  return !content || content.trim() === '' || content === '<p></p>'
}
