import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, FileText, Clock } from 'lucide-react'
import { Note } from '../types'
import { api } from '../lib/api'

export interface BacklinksPanelProps {
  noteId: string | null
  noteTitle?: string
  onSelectNote: (noteId: string) => void
  refreshKey?: number  // Increment this to force refresh
}

interface LinkWithContext extends Note {
  context?: string  // Text snippet where the link appears
}

/**
 * Extract context around a wiki-link or mention in content
 */
function extractContext(content: string, targetTitle: string, _maxLength = 80): string | undefined {
  if (!content || !targetTitle) return undefined

  // Look for wiki-link first
  const wikiLinkPattern = new RegExp(`\\[\\[${escapeRegex(targetTitle)}\\]\\]`, 'i')
  let match = content.match(wikiLinkPattern)

  // If no wiki-link, look for plain mention
  if (!match) {
    const mentionPattern = new RegExp(`\\b${escapeRegex(targetTitle)}\\b`, 'i')
    match = content.match(mentionPattern)
  }

  if (!match || match.index === undefined) return undefined

  const start = Math.max(0, match.index - 30)
  const end = Math.min(content.length, match.index + match[0].length + 30)

  let snippet = content.slice(start, end)

  // Clean up the snippet
  snippet = snippet.replace(/\n+/g, ' ').replace(/\s+/g, ' ')

  // Add ellipsis
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet = snippet + '...'

  return snippet.trim()
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function BacklinksPanel({ noteId, noteTitle, onSelectNote, refreshKey = 0 }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<LinkWithContext[]>([])
  const [outgoingLinks, setOutgoingLinks] = useState<LinkWithContext[]>([])
  const [loading, setLoading] = useState(false)
  const [backlinksExpanded, setBacklinksExpanded] = useState(true)
  const [outgoingExpanded, setOutgoingExpanded] = useState(true)

  useEffect(() => {
    if (!noteId) {
      setBacklinks([])
      setOutgoingLinks([])
      return
    }

    loadLinks()
  }, [noteId, refreshKey])  // Also refresh when refreshKey changes

  const loadLinks = async () => {
    if (!noteId) return

    console.log('[BacklinksPanel] Loading links for noteId:', noteId)
    setLoading(true)
    try {
      const [backlinksData, outgoingData] = await Promise.all([
        api.getBacklinks(noteId),
        api.getOutgoingLinks(noteId)
      ])

      console.log('[BacklinksPanel] Loaded:', { backlinks: backlinksData, outgoing: outgoingData })

      // Add context to backlinks (show where they mention this note)
      const backlinksWithContext: LinkWithContext[] = backlinksData.map(note => ({
        ...note,
        context: noteTitle ? extractContext(note.content, noteTitle) : undefined
      }))

      setBacklinks(backlinksWithContext)
      setOutgoingLinks(outgoingData)
    } catch (error) {
      console.error('[BacklinksPanel] Failed to load links:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!noteId) {
    return (
      <div className="h-full bg-nexus-bg-primary p-4">
        <div className="text-center text-nexus-text-muted mt-8">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <p className="text-sm">Select a note to see links</p>
        </div>
      </div>
    )
  }

  const totalLinks = backlinks.length + outgoingLinks.length

  return (
    <div className="h-full bg-nexus-bg-primary flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-nexus-text-muted uppercase tracking-wide">
          Links
        </h2>
        <p className="text-xs text-nexus-text-muted mt-1 opacity-70">
          {totalLinks} {totalLinks === 1 ? 'connection' : 'connections'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {/* Skeleton loading state */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton skeleton-text" style={{ width: `${50 + Math.random() * 30}%` }} />
                <div className="skeleton skeleton-text-sm" style={{ width: `${30 + Math.random() * 20}%` }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Backlinks Section */}
            <div className="border-b border-white/5">
              <button
                onClick={() => setBacklinksExpanded(!backlinksExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {backlinksExpanded ? (
                    <ChevronDown className="w-4 h-4 text-nexus-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-nexus-text-muted" />
                  )}
                  <ArrowLeft className="w-4 h-4 text-nexus-accent" />
                  <span className="text-sm font-medium text-nexus-text-primary">
                    Backlinks
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-nexus-accent/20 text-nexus-accent">
                  {backlinks.length}
                </span>
              </button>

              {backlinksExpanded && (
                <div className="px-4 pb-4">
                  {backlinks.length === 0 ? (
                    <p className="text-xs text-nexus-text-muted opacity-60 pl-6">
                      No notes link here yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {backlinks.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => onSelectNote(note.id)}
                          className="w-full text-left p-3 rounded-lg bg-nexus-bg-secondary hover:bg-nexus-bg-tertiary transition-colors group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3.5 h-3.5 text-nexus-text-muted flex-shrink-0" />
                            <span className="text-sm font-medium text-nexus-text-primary group-hover:text-nexus-accent truncate">
                              {note.title || 'Untitled'}
                            </span>
                          </div>
                          {note.context && (
                            <p className="text-xs text-nexus-text-muted pl-5 mb-1.5 line-clamp-2">
                              {note.context}
                            </p>
                          )}
                          <div className="flex items-center gap-3 pl-5 text-[10px] text-nexus-text-muted opacity-70">
                            <span>{note.folder}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(note.updated_at)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Outgoing Links Section */}
            <div>
              <button
                onClick={() => setOutgoingExpanded(!outgoingExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {outgoingExpanded ? (
                    <ChevronDown className="w-4 h-4 text-nexus-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-nexus-text-muted" />
                  )}
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-nexus-text-primary">
                    Outgoing
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400">
                  {outgoingLinks.length}
                </span>
              </button>

              {outgoingExpanded && (
                <div className="px-4 pb-4">
                  {outgoingLinks.length === 0 ? (
                    <p className="text-xs text-nexus-text-muted opacity-60 pl-6">
                      No outgoing links yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {outgoingLinks.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => onSelectNote(note.id)}
                          className="w-full text-left p-3 rounded-lg bg-nexus-bg-secondary hover:bg-nexus-bg-tertiary transition-colors group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3.5 h-3.5 text-nexus-text-muted flex-shrink-0" />
                            <span className="text-sm font-medium text-nexus-text-primary group-hover:text-nexus-accent truncate">
                              {note.title || 'Untitled'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 pl-5 text-[10px] text-nexus-text-muted opacity-70">
                            <span>{note.folder}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(note.updated_at)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
