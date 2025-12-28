import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  processTemplate,
  loadTemplates,
  saveTemplates,
  createTemplate,
  deleteTemplate,
  getSelectedTemplateId,
  setSelectedTemplateId,
  DailyNoteTemplate,
  isContentEmpty
} from '../lib/dailyNoteTemplates'

describe('Daily Note Templates Validation', () => {
  
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('processTemplate', () => {
    it('replaces all date variables correctly', () => {
      const fixedDate = new Date('2025-12-25T10:30:00') // Thursday
      const template = '{{date}} | {{date_short}} | {{day}} | {{time}} | {{year}} | {{month}} | {{week}}'
      
      const result = processTemplate(template, fixedDate)
      
      expect(result).toContain('December 25, 2025') // {{date}}
      expect(result).toContain('2025-12-25')        // {{date_short}}
      expect(result).toContain('Thursday')          // {{day}}
      expect(result).toContain('10:30')             // {{time}}
      expect(result).toContain('2025')              // {{year}}
      expect(result).toContain('December')          // {{month}}
      expect(result).toMatch(/\| \d+$/) 
    })

    it('handles custom templates with multiple variables', () => {
      const template = '# Journal for {{day}}\nDate: {{date_short}}'
      const date = new Date('2025-01-01T12:00:00') // Wednesday noon local
      
      const result = processTemplate(template, date)
      expect(result).toBe('# Journal for Wednesday\nDate: 2025-01-01')
    })
  })

  describe('Template CRUD & Persistence', () => {
    it('loads default templates when storage is empty', () => {
      const templates = loadTemplates()
      expect(templates.length).toBeGreaterThan(0)
      expect(templates.find(t => t.id === 'minimal')).toBeTruthy()
    })

    it('creates and saves a new custom template', () => {
      const newTemplate = createTemplate('My Custom', '# Custom Content')
      
      expect(newTemplate.name).toBe('My Custom')
      expect(newTemplate.id).toMatch(/^custom-/) 
      
      const loaded = loadTemplates()
      expect(loaded).toContainEqual(newTemplate)
      expect(localStorage.getItem('scribe:dailyNoteTemplates')).toBeTruthy()
    })

    it('deletes a custom template', () => {
      // Mock Date.now to ensure unique IDs
      vi.useFakeTimers()
      vi.setSystemTime(1000)
      const t1 = createTemplate('Temp 1', 'Content 1')
      vi.setSystemTime(2000)
      const t2 = createTemplate('Temp 2', 'Content 2')
      vi.useRealTimers()
      
      deleteTemplate(t1.id)
      
      const loaded = loadTemplates()
      expect(loaded.find(t => t.id === t1.id)).toBeUndefined()
      expect(loaded.find(t => t.id === t2.id)).toBeTruthy()
    })

    it('persists selected template preference', () => {
      expect(getSelectedTemplateId()).toBe('minimal') // Default
      
      setSelectedTemplateId('journal')
      expect(getSelectedTemplateId()).toBe('journal')
      expect(localStorage.getItem('scribe:selectedDailyTemplate')).toBe('journal')
    })
  })

  describe('Validation Logic', () => {
    it('isContentEmpty identifies empty content correctly', () => {
      expect(isContentEmpty('')).toBe(true)
      expect(isContentEmpty('   ')).toBe(true)
      expect(isContentEmpty('<p></p>')).toBe(true)
      expect(isContentEmpty('Hello')).toBe(false)
      expect(isContentEmpty('  Hello  ')).toBe(false)
    })
  })
})
