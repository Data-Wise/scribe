import { Flame } from 'lucide-react'

interface StreakDisplayProps {
  streak: number
  isActiveToday: boolean
}

// Milestones to celebrate
const MILESTONES = [7, 30, 100, 365]

// Get milestone message
function getMilestoneMessage(streak: number): string | null {
  if (streak === 7) return '1 week streak!'
  if (streak === 30) return '1 month streak!'
  if (streak === 100) return '100 days!'
  if (streak === 365) return '1 year streak!'
  return null
}

// Check if near a milestone (within 2 days)
function isNearMilestone(streak: number): number | null {
  for (const milestone of MILESTONES) {
    if (streak >= milestone - 2 && streak < milestone) {
      return milestone
    }
  }
  return null
}

export function StreakDisplay({ streak, isActiveToday }: StreakDisplayProps) {
  // Only show if streak >= 3 days
  if (streak < 3) return null

  const isMilestone = MILESTONES.includes(streak)
  const milestoneMessage = getMilestoneMessage(streak)
  const nearMilestone = isNearMilestone(streak)

  return (
    <div
      className={`streak-display inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${isMilestone
          ? 'bg-amber-500/10 border border-amber-500/30 animate-pulse-subtle'
          : 'bg-white/[0.02] border border-white/10'
        }`}
    >
      {/* Flame icon */}
      <Flame
        className={`w-5 h-5 ${
          isMilestone
            ? 'text-amber-500'
            : isActiveToday
            ? 'text-orange-400'
            : 'text-nexus-text-muted'
        }`}
      />

      {/* Streak count */}
      <div className="flex flex-col">
        <span
          className={`font-bold ${
            isMilestone ? 'text-amber-500' : 'text-nexus-text-primary'
          }`}
        >
          {streak} {streak === 1 ? 'day' : 'days'}
        </span>
        {milestoneMessage && (
          <span className="text-xs text-amber-500 font-medium">
            {milestoneMessage}
          </span>
        )}
        {!isMilestone && nearMilestone && (
          <span className="text-xs text-nexus-text-muted">
            {nearMilestone - streak} more to {nearMilestone}!
          </span>
        )}
      </div>

      {/* Today indicator */}
      {isActiveToday && !isMilestone && (
        <span className="text-xs text-green-500 ml-2">✓ Today</span>
      )}
    </div>
  )
}
