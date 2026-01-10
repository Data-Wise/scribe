import { useState } from 'react'
import { X } from 'lucide-react'

interface PresetUpdateDialogProps {
  currentPreset: string
  currentWidth: number
  suggestedPreset: string
  suggestedWidth: number
  onUpdate: (dontAskAgain: boolean) => void
  onSkip: () => void
}

/**
 * PresetUpdateDialog - Phase 6: Mode Consolidation
 *
 * Prompts user to update width preset after manual resize.
 * Includes "Don't ask again" checkbox for auto-update.
 * Uses localStorage (NOT Settings) to persist preference.
 */
export function PresetUpdateDialog({
  currentPreset,
  currentWidth,
  suggestedPreset,
  suggestedWidth: _suggestedWidth,
  onUpdate,
  onSkip
}: PresetUpdateDialogProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false)

  const presetLabels: Record<string, string> = {
    'narrow': 'Narrow (200px)',
    'medium': 'Medium (280px)',
    'wide': 'Wide (360px)'
  }

  return (
    <div className="preset-update-dialog-overlay">
      <div className="preset-update-dialog">
        {/* Header */}
        <div className="dialog-header">
          <h3 className="dialog-title">Update Width Preset?</h3>
          <button
            className="dialog-close-btn"
            onClick={onSkip}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="dialog-content">
          <p className="dialog-description">
            You've resized the sidebar to <strong>{currentWidth}px</strong>, which matches the <strong>{presetLabels[suggestedPreset]}</strong> preset.
          </p>

          <div className="preset-comparison">
            <div className="preset-item">
              <span className="preset-label">Current Preset:</span>
              <span className="preset-value">{presetLabels[currentPreset]}</span>
            </div>
            <div className="preset-item suggested">
              <span className="preset-label">Suggested Preset:</span>
              <span className="preset-value">{presetLabels[suggestedPreset]}</span>
            </div>
          </div>

          <p className="dialog-hint">
            Updating the preset will adjust the cycle behavior and default widths.
          </p>
        </div>

        {/* Actions */}
        <div className="dialog-actions">
          <label className="dialog-checkbox">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
            />
            <span>Don't ask again (auto-update)</span>
          </label>

          <div className="dialog-buttons">
            <button
              className="dialog-btn dialog-btn-secondary"
              onClick={onSkip}
            >
              Skip
            </button>
            <button
              className="dialog-btn dialog-btn-primary"
              onClick={() => onUpdate(dontAskAgain)}
            >
              Update Preset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
