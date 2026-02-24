import { useMemo, useState, useEffect, useRef } from 'react'
import { Target, TrendingUp, Flame, Sparkles } from 'lucide-react'

interface WritingProgressProps {
  wordCount: number
  wordGoal?: number
  sessionStartWords?: number
  streak?: number
  showDetails?: boolean
}

// Word count milestones to celebrate
const MILESTONES = [100, 250, 500, 750, 1000, 1500, 2000]

/**
 * WritingProgress - ADHD-friendly progress visualization with celebrations
 *
 * Features:
 * - Word goal progress bar with percentage
 * - Session word count (words written this session)
 * - Writing streak indicator with glow
 * - Milestone celebrations at specific word counts
 * - Respects prefers-reduced-motion
 */
export function WritingProgress({
  wordCount,
  wordGoal = 500,
  sessionStartWords = 0,
  streak = 0,
  showDetails = false
}: WritingProgressProps) {
  // Track last word count to detect milestones
  const lastWordCountRef = useRef(wordCount)
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null)
  const [goalJustReached, setGoalJustReached] = useState(false)

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Calculate progress
  const progress = useMemo(() => {
    if (wordGoal <= 0) return 0
    return Math.min(100, Math.round((wordCount / wordGoal) * 100))
  }, [wordCount, wordGoal])

  // Words written this session
  const sessionWords = useMemo(() => {
    return Math.max(0, wordCount - sessionStartWords)
  }, [wordCount, sessionStartWords])

  // Detect milestone crossings and trigger celebrations
  useEffect(() => {
    const prev = lastWordCountRef.current
    const curr = wordCount

    // Check for goal reached
    if (prev < wordGoal && curr >= wordGoal) {
      setGoalJustReached(true)
      setTimeout(() => setGoalJustReached(false), 1500)
    }

    // Check for word count milestones
    for (const milestone of MILESTONES) {
      if (prev < milestone && curr >= milestone) {
        setCelebratingMilestone(milestone)
        setTimeout(() => setCelebratingMilestone(null), 1000)
        break
      }
    }

    lastWordCountRef.current = curr
  }, [wordCount, wordGoal])

  // Progress bar color based on progress
  const progressColor = useMemo(() => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-emerald-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-cyan-500'
    return 'bg-nexus-accent'
  }, [progress])

  // Milestone messages
  const milestone = useMemo(() => {
    if (progress >= 100) return { emoji: '🎉', message: 'Goal reached!' }
    if (progress >= 75) return { emoji: '🔥', message: 'Almost there!' }
    if (progress >= 50) return { emoji: '💪', message: 'Halfway!' }
    if (progress >= 25) return { emoji: '✨', message: 'Great start!' }
    return null
  }, [progress])

  // Animation classes (respecting reduced motion)
  const getAnimationClass = (type: 'pulse' | 'goal' | 'delta' | 'streak') => {
    if (prefersReducedMotion) return ''
    switch (type) {
      case 'pulse': return celebratingMilestone ? 'animate-milestone-pulse' : ''
      case 'goal': return goalJustReached ? 'animate-goal-reached' : ''
      case 'delta': return sessionWords > 0 ? 'animate-delta-pop' : ''
      case 'streak': return streak > 0 ? 'animate-streak-glow' : ''
      default: return ''
    }
  }

  return (
    <div className="writing-progress flex items-center gap-3">
      {/* Word delta this session */}
      {sessionWords > 0 && (
        <div
          className={`flex items-center gap-1 text-[11px] text-green-400 ${getAnimationClass('delta')}`}
          key={`delta-${Math.floor(sessionWords / 10)}`} // Re-trigger animation every 10 words
        >
          <TrendingUp className="w-3 h-3" />
          <span className="tabular-nums">+{sessionWords}</span>
        </div>
      )}

      {/* Progress bar with celebration */}
      <div className={`flex items-center gap-2 ${getAnimationClass('pulse')} ${getAnimationClass('goal')}`}>
        <Target className="w-3.5 h-3.5 text-nexus-text-muted" />
        <div className="word-goal-progress w-16">
          <div
            className={`word-goal-bar ${progressColor} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] text-nexus-text-muted whitespace-nowrap tabular-nums">
          {wordCount}/{wordGoal}
        </span>
      </div>

      {/* Streak indicator */}
      {streak > 0 && (
        <div className={`flex items-center gap-1 text-[11px] text-orange-400 ${getAnimationClass('streak')}`}>
          <Flame className="w-3.5 h-3.5" />
          <span className="tabular-nums">{streak}</span>
        </div>
      )}

      {/* Celebrating milestone indicator */}
      {celebratingMilestone && !prefersReducedMotion && (
        <div className="flex items-center gap-1 text-[11px] text-yellow-400 animate-confetti">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{celebratingMilestone}!</span>
        </div>
      )}

      {/* Milestone celebration (brief flash) */}
      {milestone && showDetails && (
        <div className="flex items-center gap-1 text-[11px] text-nexus-accent">
          <span>{milestone.emoji}</span>
          <span>{milestone.message}</span>
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
