interface SettingsToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
  testId?: string
}

export function SettingsToggle({ label, description, checked, onChange, testId }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-nexus-bg-tertiary rounded-lg border border-white/5">
      <div>
        <div className="text-sm font-medium text-nexus-text-primary">{label}</div>
        <div className="text-xs text-nexus-text-muted">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
          checked ? 'bg-nexus-accent' : 'bg-white/10'
        }`}
        data-testid={testId}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
          checked ? 'right-1' : 'left-1'
        }`} />
      </button>
    </div>
  )
}
