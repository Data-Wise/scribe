import { useState, useEffect } from 'react'

interface EmptyStateProps {
  onCreateNote: () => void
  onOpenDaily: () => void
  onOpenCommandPalette: () => void
}

// Writing quotes for inspiration - gentle, non-pressure
const writingQuotes = [
  { text: "The scariest moment is always just before you start.", author: "Stephen King" },
  { text: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
  { text: "You don't start out writing good stuff. You start out writing crap and thinking it's good stuff, and then gradually you get better at it.", author: "Octavia E. Butler" },
  { text: "The first draft is just you telling yourself the story.", author: "Terry Pratchett" },
  { text: "Write drunk, edit sober.", author: "Ernest Hemingway" },
  { text: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Writing is thinking. To write well is to think clearly.", author: "David McCullough" },
  { text: "Almost all good writing begins with terrible first efforts.", author: "Anne Lamott" },
]

export function EmptyState({ onCreateNote, onOpenDaily, onOpenCommandPalette }: EmptyStateProps) {
  const [quote, setQuote] = useState(writingQuotes[0])

  useEffect(() => {
    // Pick a random quote on mount
    const randomIndex = Math.floor(Math.random() * writingQuotes.length)
    setQuote(writingQuotes[randomIndex])
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
      {/* Animated pen icon */}
      <div className="mb-8 relative">
        <svg
          className="w-16 h-16 text-nexus-accent animate-pen-write"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-nexus-accent/10 rounded-full blur-xl animate-pulse-slow" />
      </div>

      {/* Main heading */}
      <h2 className="text-2xl font-semibold text-nexus-text-primary mb-2">
        Ready to write
      </h2>
      <p className="text-nexus-text-muted mb-8 text-center max-w-md">
        Capture your thoughts, one page at a time
      </p>

      {/* Action buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={onCreateNote}
          className="btn-action flex items-center gap-2 px-5 py-3 bg-nexus-accent text-white rounded-lg font-medium hover:bg-nexus-accent-hover"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Page
          <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded">⌘N</kbd>
        </button>

        <button
          onClick={onOpenDaily}
          className="btn-action flex items-center gap-2 px-5 py-3 bg-nexus-bg-tertiary text-nexus-text-primary rounded-lg font-medium hover:bg-nexus-bg-secondary border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Today
          <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/10 rounded">⌘D</kbd>
        </button>
      </div>

      {/* Quick tip */}
      <div className="text-sm text-nexus-text-muted mb-8">
        <span className="opacity-60">or press</span>
        <button
          onClick={onOpenCommandPalette}
          className="mx-1.5 px-2 py-1 bg-nexus-bg-tertiary rounded border border-white/10 hover:bg-nexus-bg-secondary transition-colors"
        >
          ⌘K
        </button>
        <span className="opacity-60">for all commands</span>
      </div>

      {/* Inspirational quote */}
      <blockquote className="max-w-lg text-center border-l-2 border-nexus-accent/30 pl-4 py-2">
        <p className="text-nexus-text-muted italic text-sm leading-relaxed">
          "{quote.text}"
        </p>
        <footer className="text-nexus-text-muted/60 text-xs mt-2">
          — {quote.author}
        </footer>
      </blockquote>
    </div>
  )
}
