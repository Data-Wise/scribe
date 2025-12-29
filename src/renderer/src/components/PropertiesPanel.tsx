import { useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronDown, Plus, X, Clock, FileText, Hash, Settings } from 'lucide-react'
import { Property, PropertyType, Tag } from '../types'

/**
 * PropertiesPanel - Collapsible sections for note metadata
 *
 * Sprint 27: Reorganized into collapsible sections:
 * - Statistics (word count, created, modified)
 * - Document (status, type, priority)
 * - Custom Properties (user-defined)
 */

interface PropertiesPanelProps {
  properties: Record<string, Property>
  onChange: (properties: Record<string, Property>) => void
  editable?: boolean
  noteTags?: Tag[]
  wordCount?: number
  wordGoal?: number
  defaultWordGoal?: number
  streak?: number
  createdAt?: number
  updatedAt?: number
}

const TYPE_ICONS: Record<PropertyType, string> = {
  text: '📝',
  date: '📅',
  number: '🔢',
  checkbox: '☑️',
  list: '📋',
  link: '🔗',
  tags: '🏷️'
}

const TYPE_LABELS: Record<PropertyType, string> = {
  text: 'Text',
  date: 'Date',
  number: 'Number',
  checkbox: 'Checkbox',
  list: 'List',
  link: 'Link',
  tags: 'Tags'
}

// Options for list-type properties
const LIST_OPTIONS: Record<string, string[]> = {
  status: ['draft', 'in-progress', 'review', 'complete', 'archived'],
  type: ['note', 'daily', 'meeting', 'reference', 'idea', 'research', 'lecture'],
  priority: ['high', 'medium', 'low'],
}

// Document properties that get their own section
const DOCUMENT_PROPERTY_KEYS = ['status', 'type', 'priority', 'due_date', 'word_goal']

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  count?: number
  defaultExpanded?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
}

function CollapsibleSection({
  title,
  icon,
  count,
  defaultExpanded = true,
  children,
  actions
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="properties-section">
      <button
        className="properties-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="section-chevron">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="section-count">{count}</span>
        )}
        <div className="flex-1" />
        {actions && (
          <div className="section-actions" onClick={e => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </button>
      {isExpanded && (
        <div className="properties-section-content">
          {children}
        </div>
      )}
    </div>
  )
}

export function PropertiesPanel({
  properties,
  onChange,
  editable = true,
  noteTags = [],
  wordCount = 0,
  wordGoal,
  defaultWordGoal: _defaultWordGoal = 500,
  streak: _streak = 0,
  createdAt,
  updatedAt
}: PropertiesPanelProps) {
  const [newPropertyKey, setNewPropertyKey] = useState('')
  const [showAddRow, setShowAddRow] = useState(false)

  // Format date for display
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '—'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format relative time
  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return '—'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days}d ago`
    return formatDate(timestamp)
  }

  // Separate properties into categories
  const { documentProps, customProps } = useMemo(() => {
    const docProps: Record<string, Property> = {}
    const custProps: Record<string, Property> = {}

    Object.entries(properties).forEach(([key, prop]) => {
      if (DOCUMENT_PROPERTY_KEYS.includes(key)) {
        docProps[key] = prop
      } else {
        custProps[key] = prop
      }
    })

    return { documentProps: docProps, customProps: custProps }
  }, [properties])

  const handleValueChange = useCallback((key: string, value: string | number | boolean | string[]) => {
    const updated = { ...properties }
    if (updated[key]) {
      updated[key] = { ...updated[key], value }
      onChange(updated)
    }
  }, [properties, onChange])

  const handleAddProperty = useCallback(() => {
    if (!newPropertyKey.trim()) return

    const key = newPropertyKey.trim().toLowerCase().replace(/\s+/g, '_')
    if (properties[key]) return // Key exists

    const updated = {
      ...properties,
      [key]: { key, value: '', type: 'text' as PropertyType }
    }
    onChange(updated)
    setNewPropertyKey('')
    setShowAddRow(false)
  }, [newPropertyKey, properties, onChange])

  const handleRemoveProperty = useCallback((key: string) => {
    const updated = { ...properties }
    delete updated[key]
    onChange(updated)
  }, [properties, onChange])

  const renderValue = (prop: Property) => {
    // Readonly properties (auto-managed)
    if (prop.readonly || !editable) {
      if (prop.key === 'word_count') {
        return <span className="text-nexus-text-muted">{Number(prop.value).toLocaleString()} words</span>
      }
      return <span className="text-nexus-text-muted">{String(prop.value)}</span>
    }

    switch (prop.type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={Boolean(prop.value)}
            onChange={(e) => handleValueChange(prop.key, e.target.checked)}
            className="w-4 h-4 rounded accent-nexus-accent"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={Number(prop.value)}
            onChange={(e) => handleValueChange(prop.key, parseFloat(e.target.value) || 0)}
            className="bg-transparent border-b border-transparent hover:border-nexus-text-muted focus:border-nexus-accent outline-none w-full text-nexus-text-primary"
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={String(prop.value)}
            onChange={(e) => handleValueChange(prop.key, e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-nexus-text-muted focus:border-nexus-accent outline-none text-nexus-text-primary"
          />
        )
      case 'list':
        const options = LIST_OPTIONS[prop.key]
        if (options) {
          return (
            <select
              value={String(prop.value)}
              onChange={(e) => handleValueChange(prop.key, e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-nexus-text-muted focus:border-nexus-accent outline-none text-nexus-text-primary cursor-pointer"
            >
              <option value="" className="bg-neutral-800">Select...</option>
              {options.map((opt) => (
                <option key={opt} value={opt} className="bg-neutral-800">{opt}</option>
              ))}
            </select>
          )
        }
        return (
          <input
            type="text"
            value={String(prop.value)}
            onChange={(e) => handleValueChange(prop.key, e.target.value)}
            placeholder="Empty"
            className="bg-transparent border-b border-transparent hover:border-nexus-text-muted focus:border-nexus-accent outline-none w-full text-nexus-text-primary placeholder:text-nexus-text-muted/50"
          />
        )
      case 'tags':
        return <span className="text-nexus-text-muted">{noteTags.length} tags</span>
      default:
        return (
          <input
            type="text"
            value={String(prop.value)}
            onChange={(e) => handleValueChange(prop.key, e.target.value)}
            placeholder="Empty"
            className="bg-transparent border-b border-transparent hover:border-nexus-text-muted focus:border-nexus-accent outline-none w-full text-nexus-text-primary placeholder:text-nexus-text-muted/50"
          />
        )
    }
  }

  // Calculate word goal progress
  const effectiveWordGoal = wordGoal || (properties.word_goal ? Number(properties.word_goal.value) : 0)
  const progressPercent = effectiveWordGoal > 0 ? Math.min((wordCount / effectiveWordGoal) * 100, 100) : 0
  const hasWordGoal = effectiveWordGoal > 0
  const isGoalComplete = wordCount >= effectiveWordGoal

  return (
    <div className="properties-panel">
      {/* Word Goal Progress (always visible when set) */}
      {hasWordGoal && (
        <div className="word-goal-progress">
          <div className="word-goal-header">
            <span>Word Goal</span>
            <span className={isGoalComplete ? 'text-green-500 font-medium' : ''}>
              {wordCount.toLocaleString()} / {effectiveWordGoal.toLocaleString()}
              {isGoalComplete && ' ✓'}
            </span>
          </div>
          <div className="word-goal-bar">
            <div
              className={`word-goal-fill ${isGoalComplete ? 'complete' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="word-goal-percent">
            {Math.round(progressPercent)}% complete
          </div>
        </div>
      )}

      {/* Statistics Section */}
      <CollapsibleSection
        title="Statistics"
        icon={<Hash size={12} />}
        defaultExpanded={true}
      >
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Words</span>
            <span className="stat-value">{wordCount.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Created</span>
            <span className="stat-value" title={formatDate(createdAt)}>
              {formatRelativeTime(createdAt)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Modified</span>
            <span className="stat-value" title={formatDate(updatedAt)}>
              {formatRelativeTime(updatedAt)}
            </span>
          </div>
          {noteTags.length > 0 && (
            <div className="stat-item">
              <span className="stat-label">Tags</span>
              <span className="stat-value">{noteTags.length}</span>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Document Properties Section */}
      {(Object.keys(documentProps).length > 0 || editable) && (
        <CollapsibleSection
          title="Document"
          icon={<FileText size={12} />}
          count={Object.keys(documentProps).length}
          defaultExpanded={true}
        >
          {Object.keys(documentProps).length === 0 ? (
            <div className="empty-section-hint">
              No document properties set
            </div>
          ) : (
            <div className="properties-list">
              {Object.entries(documentProps).map(([key, prop]) => (
                <div key={key} className="property-row">
                  <span className="property-icon" title={TYPE_LABELS[prop.type]}>
                    {TYPE_ICONS[prop.type]}
                  </span>
                  <span className="property-key">{key}</span>
                  <div className="property-value">{renderValue(prop)}</div>
                  {editable && !prop.readonly && (
                    <button
                      onClick={() => handleRemoveProperty(key)}
                      className="property-remove"
                      title="Remove property"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Custom Properties Section */}
      <CollapsibleSection
        title="Custom"
        icon={<Settings size={12} />}
        count={Object.keys(customProps).length}
        defaultExpanded={Object.keys(customProps).length > 0}
        actions={
          editable && (
            <button
              onClick={() => setShowAddRow(true)}
              className="add-property-btn"
              title="Add property"
            >
              <Plus size={12} />
            </button>
          )
        }
      >
        {Object.keys(customProps).length === 0 && !showAddRow ? (
          <div className="empty-section-hint">
            No custom properties
          </div>
        ) : (
          <div className="properties-list">
            {Object.entries(customProps).map(([key, prop]) => (
              <div key={key} className="property-row">
                <span className="property-icon" title={TYPE_LABELS[prop.type]}>
                  {TYPE_ICONS[prop.type]}
                </span>
                <span className="property-key">{key}</span>
                <div className="property-value">{renderValue(prop)}</div>
                {editable && !prop.readonly && (
                  <button
                    onClick={() => handleRemoveProperty(key)}
                    className="property-remove"
                    title="Remove property"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}

            {/* Add new property row */}
            {showAddRow && (
              <div className="property-row add-row">
                <span className="property-icon">📝</span>
                <input
                  type="text"
                  value={newPropertyKey}
                  onChange={(e) => setNewPropertyKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddProperty()
                    if (e.key === 'Escape') {
                      setShowAddRow(false)
                      setNewPropertyKey('')
                    }
                  }}
                  placeholder="property name"
                  autoFocus
                  className="add-property-input"
                />
                <span className="add-property-hint">Enter to add</span>
                <button
                  onClick={() => {
                    setShowAddRow(false)
                    setNewPropertyKey('')
                  }}
                  className="property-remove"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
