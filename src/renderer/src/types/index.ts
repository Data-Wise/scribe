// Property types for YAML frontmatter
export type PropertyType = 'text' | 'date' | 'number' | 'checkbox' | 'list' | 'link' | 'tags'

export interface Property {
  key: string
  value: string | number | boolean | string[]
  type: PropertyType
  readonly?: boolean  // For auto-managed properties like created, modified, word_count
}

// Standard property keys
export const STANDARD_PROPERTIES = {
  // Auto-managed (readonly)
  created: { key: 'created', type: 'date' as PropertyType, readonly: true },
  modified: { key: 'modified', type: 'date' as PropertyType, readonly: true },
  word_count: { key: 'word_count', type: 'number' as PropertyType, readonly: true },
  
  // Core properties
  status: { key: 'status', type: 'list' as PropertyType, options: ['draft', 'in-progress', 'review', 'complete', 'archived'] },
  type: { key: 'type', type: 'list' as PropertyType, options: ['note', 'daily', 'meeting', 'reference', 'idea', 'research', 'lecture'] },
  priority: { key: 'priority', type: 'list' as PropertyType, options: ['high', 'medium', 'low'] },
  
  // Progress
  progress: { key: 'progress', type: 'number' as PropertyType },
  due: { key: 'due', type: 'date' as PropertyType },
  word_goal: { key: 'word_goal', type: 'number' as PropertyType },
  
  // Academic
  author: { key: 'author', type: 'text' as PropertyType },
  project: { key: 'project', type: 'text' as PropertyType },
  course: { key: 'course', type: 'text' as PropertyType },
  week: { key: 'week', type: 'number' as PropertyType },
  journal: { key: 'journal', type: 'text' as PropertyType },
  
  // Tags
  tags: { key: 'tags', type: 'tags' as PropertyType },
}

// Default properties for new notes
export const DEFAULT_NOTE_PROPERTIES: Record<string, Property> = {
  status: { key: 'status', value: 'draft', type: 'list' },
  tags: { key: 'tags', value: [], type: 'tags' },
  created: { key: 'created', value: '', type: 'date', readonly: true },
  modified: { key: 'modified', value: '', type: 'date', readonly: true },
  word_count: { key: 'word_count', value: 0, type: 'number', readonly: true },
}

export interface Note {
  id: string
  title: string
  content: string
  folder: string
  properties?: Record<string, Property>
  created_at: number
  updated_at: number
  deleted_at: number | null
}

export interface Folder {
  path: string
  color: string | null
  icon: string | null
  sort_order: number
}

export interface Tag {
  id: string
  name: string
  color: string | null
  created_at: number
}

export interface TagWithCount extends Tag {
  note_count: number
}

// Project types (also exported from store/useProjectStore.ts)
export type ProjectType = 'research' | 'teaching' | 'r-package' | 'r-dev' | 'generic'
export type ProjectStatus = 'active' | 'planning' | 'complete' | 'archive'

export interface ProjectSettings {
  theme?: string
  font?: string
  fontSize?: number
  bibliographyPath?: string
  citationStyle?: string
  dailyNoteTemplate?: string
  wordGoal?: number
}

export interface Project {
  id: string
  name: string
  description?: string
  type: ProjectType
  status?: ProjectStatus // Optional - defaults to 'active' in UI
  progress?: number // 0-100 percentage
  color?: string
  settings?: ProjectSettings
  created_at: number
  updated_at: number
}

// Extend Window interface to include our custom API
declare global {
  interface Window {
    api: {
      // Note operations
      createNote: (note: Partial<Note>) => Promise<Note>
      updateNote: (id: string, updates: Partial<Note>) => Promise<Note | null>
      deleteNote: (id: string) => Promise<boolean>
      getNote: (id: string) => Promise<Note | null>
      listNotes: (folder?: string) => Promise<Note[]>
      searchNotes: (query: string) => Promise<Note[]>

      // Tag CRUD
      createTag: (name: string, color?: string) => Promise<Tag>
      getTag: (id: string) => Promise<Tag | null>
      getTagByName: (name: string) => Promise<Tag | null>
      getAllTags: () => Promise<TagWithCount[]>
      renameTag: (id: string, newName: string) => Promise<boolean>
      deleteTag: (id: string) => Promise<boolean>

      // Note-Tag relationships
      addTagToNote: (noteId: string, tagName: string) => Promise<void>
      removeTagFromNote: (noteId: string, tagId: string) => Promise<void>
      getNoteTags: (noteId: string) => Promise<Tag[]>
      getNotesByTag: (tagId: string) => Promise<Note[]>
      filterNotesByTags: (tagIds: string[], matchAll: boolean) => Promise<Note[]>
      updateNoteTags: (noteId: string, content: string) => Promise<void>

      // Folder operations
      getFolders: () => Promise<Folder[]>

      // Link operations
      updateNoteLinks: (noteId: string, content: string) => Promise<void>
      getBacklinks: (noteId: string) => Promise<Note[]>
      getOutgoingLinks: (noteId: string) => Promise<Note[]>

      // Project operations
      listProjects: () => Promise<Project[]>
      createProject: (project: { name: string; type: ProjectType; description?: string; color?: string }) => Promise<Project>
      getProject: (id: string) => Promise<Project | null>
      updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>
      deleteProject: (id: string) => Promise<boolean>
      getProjectSettings: (id: string) => Promise<ProjectSettings | null>
      updateProjectSettings: (id: string, settings: Partial<ProjectSettings>) => Promise<void>
      getProjectNotes: (projectId: string) => Promise<Note[]>
      setNoteProject: (noteId: string, projectId: string | null) => Promise<void>
    }
  }
}

export {}
