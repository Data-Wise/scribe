import { useState, useEffect } from 'react'
import { Sparkles, MessageSquare, Lightbulb, TrendingUp, X } from 'lucide-react'
import { Note, Project } from '../types'

interface ClaudePanelProps {
  currentNote: Note | null
  currentProject: Project | null
  notes: Note[]
  onClose: () => void
}

export function ClaudePanel({ currentNote, currentProject, notes, onClose }: ClaudePanelProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'suggestions' | 'connections'>('insights')
  const [isThinking, setIsThinking] = useState(false)

  // Simulate AI analysis
  useEffect(() => {
    if (currentNote || currentProject) {
      setIsThinking(true)
      const timer = setTimeout(() => setIsThinking(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [currentNote, currentProject])

  const getInsights = () => {
    if (!currentNote && !currentProject) {
      return [
        { icon: Lightbulb, text: 'Select a note or project to see AI insights', type: 'info' }
      ]
    }

    if (currentNote) {
      const wordCount = currentNote.content.split(/\s+/).filter(Boolean).length
      const hasLinks = /\[\[.*?\]\]/.test(currentNote.content)
      // Tags are stored in junction table, not on Note directly
      // Check for tag references in content as a proxy
      const hasTags = /#\w+/.test(currentNote.content)

      return [
        { 
          icon: TrendingUp, 
          text: `Note has ${wordCount} words. ${wordCount > 500 ? 'Well developed!' : 'Room to expand.'}`,
          type: 'metric' 
        },
        { 
          icon: MessageSquare, 
          text: hasLinks ? 'Good use of backlinks for context' : 'Consider adding backlinks to related notes',
          type: hasLinks ? 'positive' : 'suggestion'
        },
        { 
          icon: Lightbulb, 
          text: hasTags ? 'Tags help with organization' : 'Add tags to improve discoverability',
          type: hasTags ? 'positive' : 'suggestion'
        },
      ]
    }

    if (currentProject) {
      const projectNotes = notes.filter(n => n.project_id === currentProject.id)
      const totalWords = projectNotes.reduce((sum, n) => 
        sum + n.content.split(/\s+/).filter(Boolean).length, 0
      )

      return [
        { 
          icon: TrendingUp, 
          text: `Project contains ${projectNotes.length} notes with ${totalWords} total words`,
          type: 'metric' 
        },
        { 
          icon: Lightbulb, 
          text: projectNotes.length > 5 ? 'Good note density' : 'Add more notes to build context',
          type: projectNotes.length > 5 ? 'positive' : 'suggestion'
        },
        { 
          icon: MessageSquare, 
          text: currentProject.progress !== undefined 
            ? `Project is ${currentProject.progress}% complete` 
            : 'Set progress tracking for better visibility',
          type: 'info'
        },
      ]
    }

    return []
  }

  const insights = getInsights()

  return (
    <div className="claude-panel">
      {/* Header */}
      <div className="claude-panel-header">
        <div className="header-title">
          <Sparkles size={18} className="sparkle-icon" />
          <h3>Claude Assistant</h3>
        </div>
        <button className="close-btn" onClick={onClose} title="Close panel">
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="claude-tabs">
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <TrendingUp size={14} />
          Insights
        </button>
        <button 
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          <Lightbulb size={14} />
          Suggestions
        </button>
        <button 
          className={`tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <MessageSquare size={14} />
          Connections
        </button>
      </div>

      {/* Content */}
      <div className="claude-panel-content">
        {isThinking ? (
          <div className="thinking-state">
            <div className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Analyzing...</p>
          </div>
        ) : (
          <div className="insights-list">
            {insights.map((insight, idx) => (
              <div key={idx} className={`insight-item ${insight.type}`}>
                <insight.icon size={16} className="insight-icon" />
                <span className="insight-text">{insight.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Forest-themed decorative element */}
        <div className="forest-accent">
          <svg width="100%" height="60" viewBox="0 0 400 60" fill="none">
            <path 
              d="M0 40 Q50 20, 100 40 T200 40 T300 40 T400 40" 
              stroke="var(--nexus-accent)" 
              strokeWidth="1.5" 
              opacity="0.2"
              fill="none"
            />
            <circle cx="100" cy="40" r="2" fill="var(--nexus-accent)" opacity="0.3" />
            <circle cx="200" cy="40" r="2" fill="var(--nexus-accent)" opacity="0.3" />
            <circle cx="300" cy="40" r="2" fill="var(--nexus-accent)" opacity="0.3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
