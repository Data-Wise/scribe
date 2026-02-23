import { useState } from 'react'
import { User, Terminal, Globe, Database, Trash2, RotateCcw, Home, Timer } from 'lucide-react'
import { isBrowser, isTauri } from '../../lib/platform'
import { loadPreferences, updatePreferences } from '../../lib/preferences'
import { getDefaultTerminalFolder, setDefaultTerminalFolder } from '../../lib/terminal-utils'
import { db, seedDemoData } from '../../lib/browser-db'
import { PinnedVaultsSettings } from './PinnedVaultsSettings'
import { SettingsSection } from './SettingsSection'

/**
 * General Settings Tab
 * 
 * Includes:
 * - Startup settings
 * - ADHD features (streak milestones)
 * - User identity
 * - Pinned vaults configuration
 * - Terminal settings (Tauri only)
 * - Browser mode settings (Browser only)
 */
export function GeneralSettingsTab() {
  const [terminalFolder, setTerminalFolder] = useState(() => getDefaultTerminalFolder())

  return (
    <div className="space-y-6">
      {/* Startup Settings */}
      <SettingsSection title="Startup">
        <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
          <div>
            <div className="text-sm font-medium text-nexus-text-primary">Open last page on startup</div>
            <div className="text-xs text-nexus-text-muted">Return to exactly where you left off.</div>
          </div>
          <div className="w-10 h-5 bg-nexus-accent rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      </SettingsSection>

      {/* ADHD Features */}
      <SettingsSection title="ADHD Features">
        <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
          <div>
            <div className="text-sm font-medium text-nexus-text-primary">Show writing streak milestones</div>
            <div className="text-xs text-nexus-text-muted">Celebrate at 7, 30, 100, and 365 days. Off by default to avoid anxiety.</div>
          </div>
          <button
            onClick={() => {
              const prefs = loadPreferences()
              updatePreferences({ streakDisplayOptIn: !prefs.streakDisplayOptIn })
            }}
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
              loadPreferences().streakDisplayOptIn ? 'bg-nexus-accent' : 'bg-white/10'
            }`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
              loadPreferences().streakDisplayOptIn ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>
      </SettingsSection>
      
      {/* Focus Timer (Pomodoro) */}
      <SettingsSection
        title="Focus Timer"
        icon={<Timer className="w-3 h-3" style={{ color: 'var(--nexus-accent)' }} />}
      >
        <div className="space-y-3">
          {/* Enable/Disable toggle */}
          <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
            <div>
              <div className="text-sm font-medium text-nexus-text-primary">Show pomodoro timer</div>
              <div className="text-xs text-nexus-text-muted">Display a focus timer in the status bar. Click to start.</div>
            </div>
            <button
              onClick={() => {
                const prefs = loadPreferences()
                updatePreferences({ pomodoroEnabled: !prefs.pomodoroEnabled })
              }}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                loadPreferences().pomodoroEnabled ? 'bg-nexus-accent' : 'bg-white/10'
              }`}
              data-testid="pomodoro-enabled-toggle"
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                loadPreferences().pomodoroEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Duration settings */}
          <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
            <FocusTimerInput
              label="Work duration"
              description="Minutes per focus session"
              prefKey="pomodoroWorkMinutes"
              min={1}
              max={120}
            />
            <FocusTimerInput
              label="Short break"
              description="Minutes between work sessions"
              prefKey="pomodoroShortBreakMinutes"
              min={1}
              max={30}
            />
            <FocusTimerInput
              label="Long break"
              description="Minutes after every Nth session"
              prefKey="pomodoroLongBreakMinutes"
              min={1}
              max={60}
            />
            <FocusTimerInput
              label="Long break interval"
              description="Take a long break every N pomodoros"
              prefKey="pomodoroLongBreakInterval"
              min={2}
              max={10}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Identity */}
      <SettingsSection title="Identity">
        <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-nexus-purple/20 flex items-center justify-center border border-nexus-purple/30">
            <User className="w-6 h-6 text-nexus-purple" />
          </div>
          <div>
            <div className="text-sm font-medium text-nexus-text-primary">Research Assistant</div>
            <div className="text-xs text-nexus-text-muted">Causal Inference Specialist</div>
          </div>
        </div>
      </SettingsSection>

      {/* Pinned Vaults Section */}
      <PinnedVaultsSettings />

      {/* Terminal Section - only shown in Tauri mode */}
      {isTauri() && (
        <SettingsSection 
          title="Terminal"
          icon={<Terminal className="w-3 h-3" style={{ color: 'var(--nexus-accent)' }} />}
        >
          <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
            <div>
              <label className="text-xs text-nexus-text-muted mb-2 block">Default Terminal Folder</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={terminalFolder}
                  onChange={(e) => setTerminalFolder(e.target.value)}
                  onBlur={() => setDefaultTerminalFolder(terminalFolder)}
                  placeholder="~"
                  className="flex-1 bg-nexus-bg-primary border border-white/10 rounded-md px-3 py-2 text-sm text-nexus-text-primary placeholder:text-nexus-text-muted/50 focus:outline-none focus:border-nexus-accent/50"
                />
                <button
                  onClick={() => {
                    setTerminalFolder('~')
                    setDefaultTerminalFolder('~')
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-xs text-nexus-text-secondary transition-colors"
                  title="Reset to home directory"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-nexus-text-muted mt-2">
                Fallback location when project folder doesn't exist. Terminal opens in project-specific folders when available.
              </p>
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Browser Mode Section - only shown in browser mode */}
      {isBrowser() && (
        <SettingsSection 
          title="Browser Mode"
          icon={<Globe className="w-3 h-3" style={{ color: 'rgb(251, 146, 60)' }} />}
        >
          <div className="p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)' }}>
                <Database className="w-5 h-5" style={{ color: 'rgb(251, 146, 60)' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-nexus-text-primary">IndexedDB Storage</div>
                <div className="text-xs text-nexus-text-muted">Your data is stored locally in this browser.</div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <button
                onClick={async () => {
                  if (confirm('This will delete ALL notes, projects, and tags. This cannot be undone. Continue?')) {
                    await db.notes.clear()
                    await db.projects.clear()
                    await db.tags.clear()
                    await db.noteTags.clear()
                    await db.noteLinks.clear()
                    await db.projectSettings.clear()
                    window.location.reload()
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>

              <button
                onClick={async () => {
                  const seeded = await seedDemoData()
                  if (seeded) {
                    alert('Demo data has been restored!')
                    window.location.reload()
                  } else {
                    alert('Demo data already exists. Clear data first to re-seed.')
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-nexus-text-secondary rounded-lg transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Demo Data
              </button>
            </div>

            <div className="text-xs text-nexus-text-muted pt-2 border-t border-white/5">
              Some features like AI assistance and PDF export require the desktop app.
            </div>
          </div>
        </SettingsSection>
      )}
    </div>
  )
}

/** Number input for Focus Timer settings */
function FocusTimerInput({
  label,
  description,
  prefKey,
  min,
  max,
}: {
  label: string
  description: string
  prefKey: 'pomodoroWorkMinutes' | 'pomodoroShortBreakMinutes' | 'pomodoroLongBreakMinutes' | 'pomodoroLongBreakInterval'
  min: number
  max: number
}) {
  const prefs = loadPreferences()
  const value = prefs[prefKey]

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-nexus-text-primary">{label}</div>
        <div className="text-xs text-nexus-text-muted">{description}</div>
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const num = parseInt(e.target.value, 10)
          if (!isNaN(num) && num >= min && num <= max) {
            updatePreferences({ [prefKey]: num })
          }
        }}
        className="w-16 bg-nexus-bg-primary border border-white/10 rounded-md px-2 py-1 text-sm text-nexus-text-primary text-center focus:outline-none focus:border-nexus-accent/50"
        data-testid={`pomodoro-${prefKey}`}
      />
    </div>
  )
}
