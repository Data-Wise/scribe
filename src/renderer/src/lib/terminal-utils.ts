/**
 * Terminal utilities for working directory management
 */

import { Project, ProjectType, AppSettings } from '../types'

// Default app settings
const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultTerminalFolder: '~'  // $HOME
}

// localStorage key for app settings
const APP_SETTINGS_KEY = 'scribe-app-settings'

/**
 * Get app settings from localStorage
 */
export function getAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(APP_SETTINGS_KEY)
    if (stored) {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.warn('Failed to load app settings:', e)
  }
  return DEFAULT_APP_SETTINGS
}

/**
 * Update app settings in localStorage
 */
export function updateAppSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getAppSettings()
  const updated = { ...current, ...updates }
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updated))
  return updated
}

/**
 * Project type to folder mapping
 * Maps project types to their conventional folder locations
 */
const PROJECT_TYPE_FOLDERS: Record<ProjectType, string> = {
  'research': '~/projects/research',
  'teaching': '~/projects/teaching',
  'r-package': '~/projects/r-packages',
  'r-dev': '~/projects/dev-tools',
  'generic': '~/projects'
}

/**
 * Normalize a project name to a folder-friendly format
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters
 */
function normalizeFolderName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Infer the terminal working directory for a project
 *
 * Priority:
 * 1. Project's explicit workingDirectory setting
 * 2. Inferred path based on project type + name
 * 3. Default terminal folder from app settings
 *
 * @param project - The current project (if any)
 * @returns The working directory path
 */
export function inferTerminalCwd(project: Project | null): string {
  const settings = getAppSettings()

  if (!project) {
    // No project - use default folder
    return settings.defaultTerminalFolder
  }

  // Check for explicit working directory in project settings
  if (project.settings?.workingDirectory) {
    return project.settings.workingDirectory
  }

  // Infer from project type and name
  const typeFolder = PROJECT_TYPE_FOLDERS[project.type] || '~/projects'
  const folderName = normalizeFolderName(project.name)

  return `${typeFolder}/${folderName}`
}

/**
 * Get the inferred path for a project (without checking explicit setting)
 * Used to show the user what path would be inferred
 */
export function getInferredProjectPath(project: Project): string {
  const typeFolder = PROJECT_TYPE_FOLDERS[project.type] || '~/projects'
  const folderName = normalizeFolderName(project.name)
  return `${typeFolder}/${folderName}`
}

/**
 * Get the default terminal folder from settings
 */
export function getDefaultTerminalFolder(): string {
  return getAppSettings().defaultTerminalFolder
}

/**
 * Set the default terminal folder
 */
export function setDefaultTerminalFolder(path: string): void {
  updateAppSettings({ defaultTerminalFolder: path })
}
