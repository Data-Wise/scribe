/**
 * ExportDialog - Export notes to PDF, Word, LaTeX via Pandoc
 *
 * Supports citations and equations processing.
 */

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, FileText, File, Code, FileDown } from 'lucide-react'
import { api } from '../lib/api'
import { Property } from '../types'

export type ExportFormat = 'pdf' | 'docx' | 'latex' | 'html' | 'md'

/**
 * Generate YAML frontmatter from note properties
 */
function generateFrontmatter(
  title: string,
  properties?: Record<string, Property>,
  tags?: string[]
): string {
  const lines: string[] = ['---']

  // Title
  lines.push(`title: "${title.replace(/"/g, '\\"')}"`)

  // Add properties if available
  if (properties) {
    for (const [key, prop] of Object.entries(properties)) {
      if (prop.value === undefined || prop.value === null || prop.value === '') continue

      if (Array.isArray(prop.value)) {
        if (prop.value.length > 0) {
          lines.push(`${key}:`)
          prop.value.forEach(v => lines.push(`  - "${v}"`))
        }
      } else if (typeof prop.value === 'boolean') {
        lines.push(`${key}: ${prop.value}`)
      } else if (typeof prop.value === 'number') {
        lines.push(`${key}: ${prop.value}`)
      } else {
        lines.push(`${key}: "${String(prop.value).replace(/"/g, '\\"')}"`)
      }
    }
  }

  // Add tags if available
  if (tags && tags.length > 0) {
    lines.push('tags:')
    tags.forEach(tag => lines.push(`  - "${tag}"`))
  }

  // Add export date
  lines.push(`date: "${new Date().toISOString().split('T')[0]}"`)

  lines.push('---')
  return lines.join('\n')
}

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  noteId: string
  noteTitle: string
  noteContent: string
  noteProperties?: Record<string, Property>
  noteTags?: string[]
}

export function ExportDialog({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  noteContent,
  noteProperties,
  noteTags,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [bibliographyPath, setBibliographyPath] = useState('')
  const [citationStyle, setCitationStyle] = useState('apa')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeFrontmatter, setIncludeFrontmatter] = useState(true)
  const [processEquations, setProcessEquations] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setSuccess(null)

    try {
      // Handle markdown export with frontmatter directly
      if (format === 'md') {
        let content = noteContent

        // Add frontmatter if enabled
        if (includeFrontmatter) {
          const frontmatter = generateFrontmatter(noteTitle, noteProperties, noteTags)
          content = `${frontmatter}\n\n${content}`
        }

        // For markdown, create a downloadable blob
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${noteTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setSuccess('Markdown file downloaded')
      } else {
        // Standard Pandoc export for other formats
        const result = await api.exportDocument({
          noteId,
          content: noteContent,
          title: noteTitle,
          format,
          bibliography: bibliographyPath || undefined,
          csl: citationStyle,
          includeMetadata,
          processEquations,
        })

        setSuccess(`Exported to: ${result.path}`)
      }

      // Close after short delay
      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Export failed'
      setError(message)
    } finally {
      setExporting(false)
    }
  }

  const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
    { value: 'docx', label: 'Word', icon: <File className="w-4 h-4" /> },
    { value: 'md', label: 'Markdown', icon: <FileDown className="w-4 h-4" /> },
    { value: 'latex', label: 'LaTeX', icon: <Code className="w-4 h-4" /> },
    { value: 'html', label: 'HTML', icon: <Code className="w-4 h-4" /> },
  ]

  const styleOptions = [
    { value: 'apa', label: 'APA 7th Edition' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'mla', label: 'MLA' },
    { value: 'ieee', label: 'IEEE' },
    { value: 'harvard', label: 'Harvard' },
  ]

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg shadow-xl p-6"
          style={{ backgroundColor: 'var(--nexus-bg-secondary)' }}
        >
          <Dialog.Title className="text-lg font-semibold mb-4" style={{ color: 'var(--nexus-text-primary)' }}>
            Export Note
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Export your note to PDF, Word, or LaTeX format
          </Dialog.Description>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded hover:bg-white/10"
            style={{ color: 'var(--nexus-text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nexus-text-muted)' }}>
                Format
              </label>
              <div className="flex gap-2">
                {formatOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: format === opt.value
                        ? 'var(--nexus-accent)'
                        : 'var(--nexus-bg-tertiary)',
                      color: format === opt.value
                        ? 'white'
                        : 'var(--nexus-text-primary)',
                    }}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bibliography Path */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nexus-text-muted)' }}>
                Bibliography (.bib file)
              </label>
              <input
                type="text"
                value={bibliographyPath}
                onChange={(e) => setBibliographyPath(e.target.value)}
                placeholder="~/Zotero/library.bib"
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            {/* Citation Style */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nexus-text-muted)' }}>
                Citation Style
              </label>
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {styleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Options - Show different options based on format */}
            <div className="space-y-2">
              {format === 'md' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFrontmatter}
                    onChange={(e) => setIncludeFrontmatter(e.target.checked)}
                    className="rounded"
                  />
                  <span style={{ color: 'var(--nexus-text-primary)' }}>Include YAML frontmatter</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--nexus-text-muted)' }}>
                    (title, properties, tags)
                  </span>
                </label>
              ) : (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded"
                    />
                    <span style={{ color: 'var(--nexus-text-primary)' }}>Include metadata</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processEquations}
                      onChange={(e) => setProcessEquations(e.target.checked)}
                      className="rounded"
                    />
                    <span style={{ color: 'var(--nexus-text-primary)' }}>Process equations</span>
                  </label>
                </>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 rounded-md text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-md text-sm" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                {success}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: 'var(--nexus-bg-tertiary)',
                  color: 'var(--nexus-text-primary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: 'var(--nexus-accent)',
                  color: 'white',
                  opacity: exporting ? 0.5 : 1,
                }}
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ExportDialog
