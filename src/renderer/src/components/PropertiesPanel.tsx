import { useState, useCallback } from 'react'
import { Property, PropertyType, Tag } from '../types'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
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

  // Build auto-managed properties
  const autoProperties: Record<string, Property> = {
    created: { key: 'created', value: formatDate(createdAt), type: 'date', readonly: true },
    modified: { key: 'modified', value: formatDate(updatedAt), type: 'date', readonly: true },
    word_count: { key: 'word_count', value: wordCount, type: 'number', readonly: true },
  }

  // Merge auto properties with user properties
  const allProperties = { ...autoProperties, ...properties }
  const propertyEntries = Object.entries(allProperties)

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
        // Check if we have predefined options for this property
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
        // Fallback to text input
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
        // Tags are displayed separately, just show count here
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

  // Word goal progress bar component
  const WordGoalProgress = () => {
    if (!hasWordGoal) return null
    
    const isComplete = wordCount >= effectiveWordGoal
    const progressColor = isComplete ? 'bg-green-500' : 'bg-nexus-accent'
    
    return (
      <div className="px-6 py-3 border-b border-white/5">
        <div className="flex items-center justify-between text-xs text-nexus-text-muted mb-2">
          <span>Word Goal</span>
          <span className={isComplete ? 'text-green-500 font-medium' : ''}>
            {wordCount.toLocaleString()} / {effectiveWordGoal.toLocaleString()}
            {isComplete && ' ✓'}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-300 ease-out rounded-full`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-right text-[10px] text-nexus-text-muted mt-1">
          {Math.round(progressPercent)}% complete
        </div>
      </div>
    )
  }

  if (propertyEntries.length === 0 && !showAddRow) {
    return (
      <div className="properties-panel">
        <WordGoalProgress />
        <div className="px-6 py-2 border-b border-white/5">
          <button 
            onClick={() => setShowAddRow(true)}
            className="text-xs text-nexus-text-muted hover:text-nexus-accent transition-colors flex items-center gap-1"
          >
            <span>+</span> Add property
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="properties-panel" data-testid="properties-panel">
      {/* Word Goal Progress */}
      <WordGoalProgress />
      {/* Header */}
      <div 
        className="px-6 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2 text-xs text-nexus-text-muted">
          <span className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
          <span>Properties</span>
          <span className="bg-white/10 px-1.5 rounded">{propertyEntries.length}</span>
        </div>
        {editable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAddRow(true)
            }}
            className="text-xs text-nexus-text-muted hover:text-nexus-accent"
            title="Add property"
          >
            +
          </button>
        )}
      </div>

      {/* Properties list */}
      {!isCollapsed && (
        <div className="px-6 pb-3 space-y-1">
          {propertyEntries.map(([key, prop]) => (
            <div 
              key={key}
              className="property-row grid grid-cols-[24px_100px_1fr_24px] gap-2 items-center text-sm group"
            >
              {/* Type icon */}
              <span 
                className="text-xs cursor-pointer" 
                title={TYPE_LABELS[prop.type]}
              >
                {TYPE_ICONS[prop.type]}
              </span>
              
              {/* Key */}
              <span className="text-nexus-text-muted truncate">{key}</span>
              
              {/* Value */}
              <div>{renderValue(prop)}</div>
              
              {/* Remove button - not shown for readonly properties */}
              {editable && !prop.readonly && (
                <button
                  onClick={() => handleRemoveProperty(key)}
                  className="opacity-0 group-hover:opacity-100 text-nexus-text-muted hover:text-nexus-error text-xs transition-opacity"
                  title="Remove property"
                >
                  ×
                </button>
              )}
              {prop.readonly && <span className="w-4" />}
            </div>
          ))}

          {/* Add new property row */}
          {showAddRow && (
            <div className="property-row grid grid-cols-[24px_100px_1fr_24px] gap-2 items-center text-sm">
              <span className="text-xs">📝</span>
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
                placeholder="key"
                autoFocus
                className="bg-transparent border-b border-nexus-accent outline-none text-nexus-text-muted placeholder:text-nexus-text-muted/50"
              />
              <span className="text-nexus-text-muted/50 text-xs">Press Enter to add</span>
              <button
                onClick={() => {
                  setShowAddRow(false)
                  setNewPropertyKey('')
                }}
                className="text-nexus-text-muted hover:text-nexus-error text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
