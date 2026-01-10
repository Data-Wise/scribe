import { PinOff, GripVertical } from 'lucide-react'
import { useAppViewStore } from '../../store/useAppViewStore'

export function PinnedVaultsSettings() {
  const pinnedVaults = useAppViewStore(state => state.pinnedVaults)
  const removePinnedVault = useAppViewStore(state => state.removePinnedVault)

  // Filter out Inbox (permanent)
  const customVaults = pinnedVaults.filter(v => v.id !== 'inbox')
  const count = customVaults.length
  const maxCount = 4

  const handleUnpin = (vaultId: string) => {
    removePinnedVault(vaultId)
  }

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Pinned Projects</h3>
        <span className="settings-count">{count}/{maxCount}</span>
      </div>

      <p className="settings-description">
        Pin up to 4 projects to the Icon Mode sidebar for quick access. The Inbox is always pinned.
      </p>

      {count === 0 ? (
        <div className="empty-state">
          <p className="text-muted">No projects pinned</p>
          <p className="text-sm text-muted">
            Right-click on a project in Compact or Card mode and select "Pin to Sidebar"
          </p>
        </div>
      ) : (
        <div className="pinned-vaults-list">
          {customVaults
            .sort((a, b) => a.order - b.order)
            .map(vault => (
              <div key={vault.id} className="pinned-vault-item">
                <div className="pinned-vault-info">
                  <GripVertical size={16} className="drag-handle" />
                  {vault.color && (
                    <div
                      className="status-dot"
                      style={{ backgroundColor: vault.color }}
                    />
                  )}
                  <span className="pinned-vault-label">{vault.label}</span>
                </div>

                <button
                  className="icon-btn danger"
                  onClick={() => handleUnpin(vault.id)}
                  title="Unpin from sidebar"
                >
                  <PinOff size={16} />
                </button>
              </div>
            ))}
        </div>
      )}

      <div className="settings-hint">
        <p className="text-xs text-muted">
          <strong>Tip:</strong> Drag projects in Icon Mode to reorder them.
        </p>
      </div>
    </div>
  )
}
