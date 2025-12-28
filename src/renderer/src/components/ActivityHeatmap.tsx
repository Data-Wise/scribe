import { useMemo } from 'react'
import { Note } from '../types'

interface ActivityHeatmapProps {
  notes: Note[]
  /** Number of weeks to show (default 12) */
  weeks?: number
}

interface DayActivity {
  date: string // YYYY-MM-DD
  count: number // Number of notes modified
  wordCount: number // Approximate words written
}

/**
 * ActivityHeatmap - GitHub-style contribution calendar
 *
 * Shows writing activity over time with color intensity
 * based on the amount written each day.
 *
 * ADHD-friendly: Visual progress, no pressure, satisfying to see
 */
export function ActivityHeatmap({ notes, weeks = 12 }: ActivityHeatmapProps) {
  // Calculate activity data for the past N weeks
  const { activityMap, weekDays, maxActivity } = useMemo(() => {
    const map: Map<string, DayActivity> = new Map()
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (weeks * 7) + 1)

    // Initialize all days
    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      map.set(dateStr, { date: dateStr, count: 0, wordCount: 0 })
    }

    // Count activity from notes
    notes.filter(n => !n.deleted_at).forEach(note => {
      const dateStr = new Date(note.updated_at).toISOString().split('T')[0]
      const existing = map.get(dateStr)
      if (existing) {
        existing.count++
        // Rough word count estimate
        existing.wordCount += (note.content?.split(/\s+/).length || 0)
      }
    })

    // Group by weeks (Sunday start)
    const weeks2D: DayActivity[][] = []
    let currentWeek: DayActivity[] = []
    const entries = Array.from(map.values())

    // Pad start to align with day of week
    const firstDate = new Date(entries[0]?.date || today)
    const startDayOfWeek = firstDate.getDay() // 0 = Sunday

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: '', count: -1, wordCount: 0 }) // Empty padding
    }

    entries.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks2D.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      // Pad end
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: -1, wordCount: 0 })
      }
      weeks2D.push(currentWeek)
    }

    // Find max for color scaling
    let max = 0
    map.forEach(day => {
      if (day.count > max) max = day.count
    })

    return { activityMap: map, weekDays: weeks2D, maxActivity: max || 1 }
  }, [notes, weeks])

  // Get color intensity based on activity level
  const getColorClass = (count: number): string => {
    if (count < 0) return 'bg-transparent' // Empty padding
    if (count === 0) return 'bg-white/[0.03]'
    const intensity = count / maxActivity
    if (intensity < 0.25) return 'bg-emerald-500/20'
    if (intensity < 0.5) return 'bg-emerald-500/40'
    if (intensity < 0.75) return 'bg-emerald-500/60'
    return 'bg-emerald-500/80'
  }

  // Format tooltip
  const formatTooltip = (day: DayActivity): string => {
    if (day.count < 0) return ''
    if (day.count === 0) return `${formatDate(day.date)}: No activity`
    return `${formatDate(day.date)}: ${day.count} ${day.count === 1 ? 'note' : 'notes'} modified`
  }

  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = []
    let lastMonth = -1

    weekDays.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d.date)
      if (firstValidDay) {
        const month = new Date(firstValidDay.date).getMonth()
        if (month !== lastMonth) {
          labels.push({
            label: new Date(firstValidDay.date).toLocaleDateString('en-US', { month: 'short' }),
            weekIndex
          })
          lastMonth = month
        }
      }
    })

    return labels
  }, [weekDays])

  // Calculate stats
  const stats = useMemo(() => {
    let activeDays = 0
    let totalNotes = 0
    Array.from(activityMap.values()).forEach(day => {
      if (day.count > 0) {
        activeDays++
        totalNotes += day.count
      }
    })
    return { activeDays, totalNotes }
  }, [activityMap])

  return (
    <div className="activity-heatmap">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-nexus-text-muted uppercase tracking-wide">
          Writing Activity
        </h3>
        <span className="text-xs text-nexus-text-muted">
          {stats.activeDays} active {stats.activeDays === 1 ? 'day' : 'days'}
        </span>
      </div>

      {/* Calendar grid */}
      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-1 text-xs text-nexus-text-muted/70 h-4">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute"
              style={{ left: `${(m.weekIndex / weekDays.length) * 100}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Day labels */}
        <div className="flex">
          <div className="flex flex-col gap-[3px] mr-2 text-xs text-nexus-text-muted/50">
            <span className="h-[14px]"></span>
            <span className="h-[14px] leading-[14px]">M</span>
            <span className="h-[14px]"></span>
            <span className="h-[14px] leading-[14px]">W</span>
            <span className="h-[14px]"></span>
            <span className="h-[14px] leading-[14px]">F</span>
            <span className="h-[14px]"></span>
          </div>

          {/* Weeks grid */}
          <div className="flex gap-[3px] flex-1">
            {weekDays.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-[14px] h-[14px] rounded-sm ${getColorClass(day.count)} transition-colors hover:ring-1 hover:ring-white/30`}
                    title={formatTooltip(day)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-nexus-text-muted/70">
          <span>Less</span>
          <div className="flex gap-[2px]">
            <div className="w-[10px] h-[10px] rounded-sm bg-white/[0.03]" />
            <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500/20" />
            <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500/40" />
            <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500/60" />
            <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500/80" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
