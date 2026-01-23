import { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Shared settings section component with consistent styling
 * Used across all settings tabs for visual consistency
 */
export function SettingsSection({ title, icon, children, className = '' }: SettingsSectionProps) {
  return (
    <section className={className}>
      <h4 className="text-xs uppercase tracking-widest text-nexus-text-muted font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  )
}
