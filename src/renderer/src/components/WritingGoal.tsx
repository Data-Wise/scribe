import { useState, useEffect } from 'react'
import { Target, Check, Edit3, X } from 'lucide-react'
import {
  getDailyGoalInfo,
  setDailyGoalTarget,
  toggleDailyGoalOptIn,
  DailyGoalInfo
} from '../lib/preferences'

interface WritingGoalProps {
  /** Callback when user wants to start writing */
  onStartWriting?: () => void
}

/**
 * WritingGoal - Daily word count goal tracker for Mission Control
 *
 * ADHD-friendly features:
 * - Opt-in only (no pressure by default)
 * - Visual progress bar for immediate feedback
 * - Celebration when goal reached
 * - Easy goal adjustment
 * - Clear "words remaining" messaging
 */
export function WritingGoal({ onStartWriting }: WritingGoalProps) {
  const [goalInfo, setGoalInfo] = useState<DailyGoalInfo>(getDailyGoalInfo)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  // Refresh goal info periodically (in case words are added in editor)
  useEffect(() => {
    const interval = setInterval(() => {
      setGoalInfo(getDailyGoalInfo())
    }, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Handle enabling the goal
  const handleEnable = () => {
    toggleDailyGoalOptIn(true)
    setGoalInfo(getDailyGoalInfo())
  }

  // Handle disabling the goal
  const handleDisable = () => {
    toggleDailyGoalOptIn(false)
    setGoalInfo(getDailyGoalInfo())
  }

  // Handle goal editing
  const handleStartEdit = () => {
    setEditValue(goalInfo.target.toString())
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const newTarget = parseInt(editValue, 10)
    if (!isNaN(newTarget) && newTarget > 0) {
      setDailyGoalTarget(newTarget)
      setGoalInfo(getDailyGoalInfo())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  // Not opted in - show enable prompt
  if (!goalInfo.isEnabled) {
    return (
      <div className="writing-goal-prompt p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-nexus-text-primary">Set a daily goal?</h3>
              <p className="text-xs text-nexus-text-muted">Track your writing progress</p>
            </div>
          </div>
          <button
            onClick={handleEnable}
            className="px-3 py-1.5 text-sm font-medium bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors"
          >
            Enable
          </button>
        </div>
      </div>
    )
  }

  // Goal completed - celebration state
  if (goalInfo.isComplete) {
    return (
      <div className="writing-goal-complete p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-400">Goal reached!</h3>
              <p className="text-xs text-emerald-400/70">
                {goalInfo.written.toLocaleString()} / {goalInfo.target.toLocaleString()} words
              </p>
            </div>
          </div>
          <button
            onClick={handleDisable}
            className="p-1.5 text-nexus-text-muted hover:text-nexus-text-secondary transition-colors"
            title="Disable daily goal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Active goal - progress tracking
  return (
    <div className="writing-goal-active p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-nexus-text-primary">Today's Goal</h3>
            {isEditing ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-20 px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded text-nexus-text-primary focus:outline-none focus:border-amber-500/50"
                  autoFocus
                  min="1"
                />
                <span className="text-xs text-nexus-text-muted">words</span>
                <button
                  onClick={handleSaveEdit}
                  className="ml-1 p-0.5 text-emerald-500 hover:text-emerald-400"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-0.5 text-nexus-text-muted hover:text-nexus-text-secondary"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-nexus-text-muted">
                {goalInfo.remaining.toLocaleString()} words to go
                <button
                  onClick={handleStartEdit}
                  className="ml-2 text-amber-500/70 hover:text-amber-500 transition-colors"
                  title="Edit goal"
                >
                  <Edit3 className="w-3 h-3 inline" />
                </button>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onStartWriting && (
            <button
              onClick={onStartWriting}
              className="px-3 py-1.5 text-sm font-medium bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              Write
            </button>
          )}
          <button
            onClick={handleDisable}
            className="p-1.5 text-nexus-text-muted hover:text-nexus-text-secondary transition-colors"
            title="Disable daily goal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${goalInfo.progress}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex justify-between mt-2 text-xs text-nexus-text-muted">
        <span>{goalInfo.written.toLocaleString()} written</span>
        <span>{goalInfo.progress}%</span>
      </div>
    </div>
  )
}
