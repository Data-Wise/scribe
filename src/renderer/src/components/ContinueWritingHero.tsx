import { Note, Project } from '../types'
import { ArrowRight, FileText, Clock } from 'lucide-react'

interface ContinueWritingHeroProps {
  note: Note | null
  project: Project | null
  onContinue: () => void
}

/**
 * Hero component showing the last active note for quick continuation
 * ADHD Principle: Zero friction to resume writing (< 3 seconds)
 */
export function ContinueWritingHero({ note, project, onContinue }: ContinueWritingHeroProps) {
  // Filter out null or deleted notes
  if (!note || note.deleted_at) return null

  // Count words in content
  const wordCount = countWords(note.content)

  // Format time since last edit
  const timeAgo = formatTimeAgo(note.updated_at)

  // Get project color for accent
  const accentColor = project?.color || '#38bdf8'

  return (
    <button
      onClick={onContinue}
      aria-label={`Continue writing ${note.title || 'Untitled'}, ${wordCount} words, last edited ${timeAgo}`}
      className="continue-hero w-full text-left p-5 rounded-xl border-2 border-dashed transition-all duration-200 group hover:border-solid focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nexus-bg-primary"
      style={{
        borderColor: `${accentColor}40`,
        backgroundColor: `${accentColor}08`,
        // @ts-expect-error CSS custom property
        '--ring-color': accentColor,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        {/* Icon and content */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Document icon with accent */}
          <div
            className="flex-shrink-0 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <FileText
              className="w-6 h-6 transition-colors"
              style={{ color: accentColor }}
            />
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            {/* Label */}
            <div className="text-xs font-medium text-nexus-text-muted uppercase tracking-wide mb-1">
              Continue Writing
            </div>

            {/* Note title */}
            <h3
              className="text-lg font-semibold truncate transition-colors"
              style={{ color: 'var(--nexus-text-primary)' }}
            >
              {note.title || 'Untitled'}
            </h3>

            {/* Meta info */}
            <div className="flex items-center gap-3 mt-1.5 text-sm text-nexus-text-muted">
              {/* Project name */}
              {project && (
                <>
                  <span
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    {project.name}
                  </span>
                  <span className="opacity-40">•</span>
                </>
              )}

              {/* Word count */}
              <span>{wordCount.toLocaleString()} words</span>

              <span className="opacity-40">•</span>

              {/* Time ago */}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow button */}
        <div
          className="flex-shrink-0 p-2 rounded-lg transition-all duration-200 group-hover:translate-x-1"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <ArrowRight
            className="w-5 h-5 transition-colors"
            style={{ color: accentColor }}
          />
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 pt-3 border-t border-white/5 text-xs text-nexus-text-muted">
        Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">Enter</kbd> or click to continue
      </div>
    </button>
  )
}

// Helper: Count words in markdown content
function countWords(content: string): number {
  if (!content) return 0
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links to text
    .replace(/[#*_~>\-]/g, '') // Remove markdown symbols
    .replace(/\s+/g, ' ')
    .trim()
  return text.split(/\s+/).filter(Boolean).length
}

// Helper: Format relative time
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
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
