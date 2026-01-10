interface ProjectAvatarProps {
  letter: string
  color: string  // Smart icon color (e.g., '#8B5CF6' for Research)
  size?: 'sm' | 'md'
}

/**
 * ProjectAvatar - First-letter icon component for child projects
 *
 * Displays the first letter of a project name in a colored box.
 * Uses smart icon color for visual grouping.
 *
 * @example
 * <ProjectAvatar letter="M" color="#8B5CF6" size="md" />
 * // Renders: [M] in purple box
 */
export function ProjectAvatar({ letter, color, size = 'md' }: ProjectAvatarProps) {
  return (
    <div
      className={`project-avatar ${size}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {letter.toUpperCase()}
    </div>
  )
}
