import { useMemo } from 'react'
import { Note } from '../../types'

interface ActivityDotsProps {
  projectId: string
  notes: Note[]
  size?: 'sm' | 'md'
}

/**
 * Visual indicator of project activity/momentum
 * Shows 1-4 dots based on recent edit activity
 */
export function ActivityDots({ projectId, notes, size = 'sm' }: ActivityDotsProps) {
  const { score, label } = useMemo(() => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    // Get notes for this project
    const projectNotes = notes.filter(n => n.project_id === projectId && !n.deleted_at)

    if (projectNotes.length === 0) return { score: 0, label: 'No notes yet' }

    // Count edits in different time windows
    const editsToday = projectNotes.filter(n => now - n.updated_at < dayMs).length
    const editsThisWeek = projectNotes.filter(n => now - n.updated_at < 7 * dayMs).length
    const editsThisMonth = projectNotes.filter(n => now - n.updated_at < 30 * dayMs).length

    // Calculate momentum score (0-4)
    let score = 0
    if (editsToday > 0) score += 2  // Recent activity weighted heavily
    if (editsThisWeek > 2) score += 1
    if (editsThisMonth > 5) score += 1
    score = Math.min(score, 4)

    const labels = [
      'No recent activity',
      'Some activity',
      'Active this week',
      'Very active',
      'On fire!'
    ]

    return { score, label: labels[score] }
  }, [projectId, notes])

  return (
    <div
      className={`activity-dots ${size} ${score >= 3 ? 'hot' : score === 0 ? 'cold' : ''}`}
      title={label}
    >
      {[1, 2, 3, 4].map(level => (
        <span
          key={level}
          className={`dot ${level <= score ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}

/**
 * Calculate project statistics
 */
export function useProjectStats(projectId: string, notes: Note[]) {
  return useMemo(() => {
    const projectNotes = notes.filter(n => n.project_id === projectId && !n.deleted_at)
    const todayStart = new Date().setHours(0, 0, 0, 0)

    const noteCount = projectNotes.length
    const totalWords = projectNotes.reduce((sum, n) => sum + countWords(n.content), 0)

    // Notes edited today
    const editedToday = projectNotes.filter(n => n.updated_at >= todayStart)
    const wordsToday = editedToday.reduce((sum, n) => sum + countWords(n.content), 0)

    // Most recent edit
    const lastEdit = projectNotes.length > 0
      ? Math.max(...projectNotes.map(n => n.updated_at))
      : null

    return {
      noteCount,
      totalWords,
      wordsToday,
      editedTodayCount: editedToday.length,
      lastEdit
    }
  }, [projectId, notes])
}

function countWords(content: string): number {
  if (!content) return 0
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.split(/\s+/).filter(Boolean).length
}
