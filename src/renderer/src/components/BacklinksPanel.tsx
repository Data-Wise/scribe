import { useEffect, useState } from 'react'
import { Note } from '../types'

export interface BacklinksPanelProps {
  noteId: string | null
  onSelectNote: (noteId: string) => void
}

export function BacklinksPanel({ noteId, onSelectNote }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<Note[]>([])
  const [outgoingLinks, setOutgoingLinks] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!noteId) {
      setBacklinks([])
      setOutgoingLinks([])
      return
    }

    loadLinks()
  }, [noteId])

  const loadLinks = async () => {
    if (!noteId) return

    setLoading(true)
    try {
      const [backlinksData, outgoingData] = await Promise.all([
        window.api.getBacklinks(noteId),
        window.api.getOutgoingLinks(noteId)
      ])

      setBacklinks(backlinksData)
      setOutgoingLinks(outgoingData)
    } catch (error) {
      console.error('Failed to load links:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!noteId) {
    return (
      <div className="h-full bg-gray-900 border-l border-gray-700 p-4">
        <div className="text-center text-gray-500 mt-8">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-600"
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

  return (
    <div className="h-full bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Links
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading links...</div>
        ) : (
          <>
            {/* Backlinks Section */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Backlinks ({backlinks.length})
              </h3>

              {backlinks.length === 0 ? (
                <p className="text-xs text-gray-500">No notes link here yet</p>
              ) : (
                <div className="space-y-1">
                  {backlinks.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => onSelectNote(note.id)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-800 transition-colors group"
                    >
                      <div className="text-sm text-gray-300 group-hover:text-white truncate">
                        {note.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {note.folder}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Links Section */}
            <div className="p-4">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                Outgoing ({outgoingLinks.length})
              </h3>

              {outgoingLinks.length === 0 ? (
                <p className="text-xs text-gray-500">No outgoing links yet</p>
              ) : (
                <div className="space-y-1">
                  {outgoingLinks.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => onSelectNote(note.id)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-800 transition-colors group"
                    >
                      <div className="text-sm text-gray-300 group-hover:text-white truncate">
                        {note.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {note.folder}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
