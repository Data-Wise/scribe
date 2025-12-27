import { useMemo } from 'react'
import { Target, TrendingUp, Flame, Award } from 'lucide-react'

interface WritingProgressProps {
  wordCount: number
  wordGoal?: number
  sessionStartWords?: number
  streak?: number
  showDetails?: boolean
}

/**
 * WritingProgress - ADHD-friendly progress visualization
 *
 * Features:
 * - Word goal progress bar with percentage
 * - Session word count (words written this session)
 * - Writing streak indicator
 * - Milestone celebrations at 25%, 50%, 75%, 100%
 */
export function WritingProgress({
  wordCount,
  wordGoal = 500,
  sessionStartWords = 0,
  streak = 0,
  showDetails = false
}: WritingProgressProps) {
  // Calculate progress
  const progress = useMemo(() => {
    if (wordGoal <= 0) return 0
    return Math.min(100, Math.round((wordCount / wordGoal) * 100))
  }, [wordCount, wordGoal])

  // Words written this session
  const sessionWords = useMemo(() => {
    return Math.max(0, wordCount - sessionStartWords)
  }, [wordCount, sessionStartWords])

  // Milestone messages
  const milestone = useMemo(() => {
    if (progress >= 100) return { emoji: '🎉', message: 'Goal reached!' }
    if (progress >= 75) return { emoji: '🔥', message: 'Almost there!' }
    if (progress >= 50) return { emoji: '💪', message: 'Halfway!' }
    if (progress >= 25) return { emoji: '✨', message: 'Great start!' }
    return null
  }, [progress])

  // Progress bar color based on progress
  const progressColor = useMemo(() => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-emerald-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-cyan-500'
    return 'bg-nexus-accent'
  }, [progress])

  return (
    <div className="writing-progress flex items-center gap-3">
      {/* Compact view - just progress bar */}
      <div className="flex items-center gap-2">
        <Target className="w-3.5 h-3.5 text-nexus-text-muted" />
        <div className="word-goal-progress w-20">
          <div
            className={`word-goal-bar ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] text-nexus-text-muted whitespace-nowrap">
          {wordCount}/{wordGoal}
        </span>
      </div>

      {/* Session words */}
      {sessionWords > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-nexus-text-muted">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span>+{sessionWords}</span>
        </div>
      )}

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-orange-400">
          <Flame className="w-3 h-3" />
          <span>{streak}d</span>
        </div>
      )}

      {/* Milestone celebration (brief flash) */}
      {milestone && showDetails && (
        <div className="flex items-center gap-1 text-[11px] text-nexus-accent animate-pulse">
          <span>{milestone.emoji}</span>
          <span>{milestone.message}</span>
        </div>
      )}

      {/* Detailed view (for expanded status bar) */}
      {showDetails && (
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-nexus-text-muted">
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            {progress}% of goal
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * WritingProgressCompact - Minimal inline version for status bars
 */
export function WritingProgressCompact({
  wordCount,
  wordGoal = 500
}: {
  wordCount: number
  wordGoal?: number
}) {
  const progress = Math.min(100, Math.round((wordCount / wordGoal) * 100))

  return (
    <div className="flex items-center gap-2">
      <div className="word-goal-progress w-14">
        <div
          className="word-goal-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-nexus-text-muted tabular-nums">
        {progress}%
      </span>
    </div>
  )
}

export default WritingProgress
