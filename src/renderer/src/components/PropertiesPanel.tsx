import { useState, useCallback } from 'react'
import { Property, PropertyType } from '../types'

interface PropertiesPanelProps {
  properties: Record<string, Property>
  onChange: (properties: Record<string, Property>) => void
  editable?: boolean
}

const TYPE_ICONS: Record<PropertyType, string> = {
  text: '📝',
  date: '📅',
  number: '🔢',
  checkbox: '☑️',
  list: '📋',
  link: '🔗'
}

const TYPE_LABELS: Record<PropertyType, string> = {
  text: 'Text',
  date: 'Date',
  number: 'Number',
  checkbox: 'Checkbox',
  list: 'List',
  link: 'Link'
}

export function PropertiesPanel({ 
  properties, 
  onChange, 
  editable = true 
}: PropertiesPanelProps) {
  console.log('🔍 PropertiesPanel rendering - this should ONLY appear in right sidebar')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [newPropertyKey, setNewPropertyKey] = useState('')
  const [showAddRow, setShowAddRow] = useState(false)

  const propertyEntries = Object.entries(properties)

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
    if (!editable) {
      return <span className="text-nexus-text-primary">{String(prop.value)}</span>
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

  if (propertyEntries.length === 0 && !showAddRow) {
    return (
      <div className="properties-panel px-6 py-2 border-b border-white/5">
        <button 
          onClick={() => setShowAddRow(true)}
          className="text-xs text-nexus-text-muted hover:text-nexus-accent transition-colors flex items-center gap-1"
        >
          <span>+</span> Add property
        </button>
      </div>
    )
  }

  return (
    <div className="properties-panel border-b border-white/5">
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
              
              {/* Remove button */}
              {editable && (
                <button
                  onClick={() => handleRemoveProperty(key)}
                  className="opacity-0 group-hover:opacity-100 text-nexus-text-muted hover:text-nexus-error text-xs transition-opacity"
                  title="Remove property"
                >
                  ×
                </button>
              )}
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
