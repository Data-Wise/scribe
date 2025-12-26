/**
 * ExportDialog - Export notes to PDF, Word, LaTeX via Pandoc
 *
 * Supports citations and equations processing.
 */

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, FileText, File, Code } from 'lucide-react'
import { api } from '../lib/api'

export type ExportFormat = 'pdf' | 'docx' | 'latex' | 'html'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  noteId: string
  noteTitle: string
  noteContent: string
}

export function ExportDialog({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  noteContent,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [bibliographyPath, setBibliographyPath] = useState('')
  const [citationStyle, setCitationStyle] = useState('apa')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [processEquations, setProcessEquations] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setSuccess(null)

    try {
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

            {/* Options */}
            <div className="space-y-2">
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
