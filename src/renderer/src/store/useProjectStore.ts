import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { api } from '../lib/api'
import { Project, ProjectType, ProjectSettings } from '../types'

// Re-export types for convenience
export type { Project, ProjectType, ProjectSettings }

interface ProjectState {
  projects: Project[]
  currentProjectId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadProjects: () => Promise<void>
  createProject: (name: string, type: ProjectType, description?: string, color?: string) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (id: string | null) => void
  getCurrentProject: () => Project | null
  updateProjectSettings: (id: string, settings: Partial<ProjectSettings>) => Promise<void>
}

// localStorage key for persisting current project
const CURRENT_PROJECT_KEY = 'scribe:currentProjectId'

// Default demo project for first-time users
const DEFAULT_RESEARCH_PROJECT = {
  name: 'Research',
  type: 'research' as ProjectType,
  description: 'Your research workspace - papers, notes, and ideas',
  color: '#3b82f6'  // Blue
}

// Helper to get persisted project ID
const getPersistedProjectId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_PROJECT_KEY)
  } catch {
    return null
  }
}

// Helper to persist project ID
const persistProjectId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(CURRENT_PROJECT_KEY, id)
    } else {
      localStorage.removeItem(CURRENT_PROJECT_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
  projects: [],
  currentProjectId: getPersistedProjectId(),
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      let projects = await api.listProjects()

      // Create default Research project if no projects exist (first-time user)
      if (projects.length === 0) {
        const defaultProject = await api.createProject(DEFAULT_RESEARCH_PROJECT)
        projects = [defaultProject]
        // Auto-select the default project
        set({
          projects,
          currentProjectId: defaultProject.id,
          isLoading: false
        })
        persistProjectId(defaultProject.id)
        return
      }

      // Validate persisted project ID still exists
      const currentId = get().currentProjectId
      const projectExists = currentId && projects.some(p => p.id === currentId)

      set({
        projects,
        isLoading: false,
        // Clear current project if it no longer exists
        currentProjectId: projectExists ? currentId : null
      })

      // Update localStorage if project was cleared
      if (!projectExists && currentId) {
        persistProjectId(null)
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createProject: async (name: string, type: ProjectType, description?: string, color?: string) => {
    set({ isLoading: true, error: null })
    try {
      const newProject = await api.createProject({ name, type, description, color })
      set((state) => {
        // Immer allows direct mutations
        state.projects.unshift(newProject)
        state.currentProjectId = newProject.id
        state.isLoading = false
      })
      persistProjectId(newProject.id)
      return newProject
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedProject = await api.updateProject(id, updates)
      if (updatedProject) {
        set((state) => {
          // Immer allows direct mutations
          const index = state.projects.findIndex((project) => project.id === id)
          if (index !== -1) {
            state.projects[index] = updatedProject
          }
          state.isLoading = false
        })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteProject(id)
      const wasCurrentProject = get().currentProjectId === id

      set((state) => {
        // Immer allows direct mutations
        const index = state.projects.findIndex((project) => project.id === id)
        if (index !== -1) {
          state.projects.splice(index, 1)
        }
        if (wasCurrentProject) {
          state.currentProjectId = null
        }
        state.isLoading = false
      })

      if (wasCurrentProject) {
        persistProjectId(null)
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setCurrentProject: (id: string | null) => {
    set({ currentProjectId: id })
    persistProjectId(id)
  },

  getCurrentProject: () => {
    const state = get()
    if (!state.currentProjectId) return null
    return state.projects.find(p => p.id === state.currentProjectId) || null
  },

  updateProjectSettings: async (id: string, settings: Partial<ProjectSettings>) => {
    const project = get().projects.find(p => p.id === id)
    if (!project) return

    const mergedSettings = {
      ...project.settings,
      ...settings
    }

    await get().updateProject(id, { settings: mergedSettings })
  }
  }))
)
