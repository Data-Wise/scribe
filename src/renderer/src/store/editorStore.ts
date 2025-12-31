import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { editor as MonacoEditorType } from 'monaco-editor'

/**
 * EditorStore - State management for hybrid editor system
 *
 * Manages dual-editor architecture:
 * - Milkdown for markdown/Quarto (.md, .qmd)
 * - Monaco for LaTeX/code (.tex, .R, .py)
 *
 * See: PLAN-HYBRID-EDITOR.md
 */

export type EditorType = 'milkdown' | 'monaco' | 'text'

export interface CurrentFile {
  path: string | null
  content: string
  editorType: EditorType
  isDirty: boolean
  lastSaved: number
}

export interface MilkdownState {
  instance: unknown | null // Will be typed properly when Milkdown component is created
  cursorPosition: number
  scrollPosition: number
}

export interface MonacoState {
  instance: MonacoEditorType.IStandaloneCodeEditor | null
  language: string
  pdfPath: string | null
  isCompiling: boolean
  cursorPosition: { lineNumber: number; column: number } | null
  scrollTop: number
}

interface EditorStore {
  // Current file state
  currentFile: CurrentFile

  // Editor-specific state
  milkdown: MilkdownState
  monaco: MonacoState

  // Actions
  setCurrentFile: (file: { path: string; content: string }) => void
  updateContent: (content: string) => void
  setDirty: (isDirty: boolean) => void

  // Milkdown actions
  saveMilkdownState: (cursor: number, scroll: number) => void
  setMilkdownInstance: (instance: unknown) => void

  // Monaco actions
  saveMonacoState: (language: string, pdfPath: string | null) => void
  saveMonacoCursorScroll: (cursor: { lineNumber: number; column: number } | null, scrollTop: number) => void
  setMonacoInstance: (instance: MonacoEditorType.IStandaloneCodeEditor | null) => void
  setCompiling: (isCompiling: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  currentFile: {
    path: null,
    content: '',
    editorType: 'text' as EditorType,
    isDirty: false,
    lastSaved: Date.now()
  },
  milkdown: {
    instance: null,
    cursorPosition: 0,
    scrollPosition: 0
  },
  monaco: {
    instance: null,
    language: 'markdown',
    pdfPath: null,
    isCompiling: false,
    cursorPosition: null,
    scrollTop: 0
  }
}

/**
 * Determines editor type based on file extension
 */
export function getEditorTypeForFile(filePath: string | null): EditorType {
  if (!filePath) return 'text'

  const ext = filePath.split('.').pop()?.toLowerCase()

  if (ext === 'md' || ext === 'qmd') return 'milkdown'
  if (ext === 'tex' || ext === 'r' || ext === 'py') return 'monaco'

  return 'text'
}

/**
 * Gets Monaco language ID from file extension
 */
export function getMonacoLanguage(filePath: string | null): string {
  if (!filePath) return 'plaintext'

  const ext = filePath.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'tex': return 'latex'
    case 'r': return 'r'
    case 'py': return 'python'
    case 'js': return 'javascript'
    case 'ts': return 'typescript'
    case 'json': return 'json'
    default: return 'plaintext'
  }
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentFile: (file) =>
        set((state) => ({
          currentFile: {
            ...state.currentFile,
            path: file.path,
            content: file.content,
            editorType: getEditorTypeForFile(file.path),
            isDirty: false,
            lastSaved: Date.now()
          },
          monaco: {
            ...state.monaco,
            language: getMonacoLanguage(file.path)
          }
        })),

      updateContent: (content) =>
        set((state) => ({
          currentFile: {
            ...state.currentFile,
            content,
            isDirty: true
          }
        })),

      setDirty: (isDirty) =>
        set((state) => ({
          currentFile: {
            ...state.currentFile,
            isDirty
          }
        })),

      saveMilkdownState: (cursor, scroll) =>
        set((state) => ({
          milkdown: {
            ...state.milkdown,
            cursorPosition: cursor,
            scrollPosition: scroll
          }
        })),

      setMilkdownInstance: (instance) =>
        set((state) => ({
          milkdown: {
            ...state.milkdown,
            instance
          }
        })),

      saveMonacoState: (language, pdfPath) =>
        set((state) => ({
          monaco: {
            ...state.monaco,
            language,
            pdfPath
          }
        })),

      saveMonacoCursorScroll: (cursor, scrollTop) =>
        set((state) => ({
          monaco: {
            ...state.monaco,
            cursorPosition: cursor,
            scrollTop
          }
        })),

      setMonacoInstance: (instance) =>
        set((state) => ({
          monaco: {
            ...state.monaco,
            instance
          }
        })),

      setCompiling: (isCompiling) =>
        set((state) => ({
          monaco: {
            ...state.monaco,
            isCompiling
          }
        })),

      reset: () => set(initialState)
    }),
    {
      name: 'scribe-editor-storage',
      // Only persist cursor/scroll positions, not editor instances
      partialize: (state) => ({
        milkdown: {
          instance: null,
          cursorPosition: state.milkdown.cursorPosition,
          scrollPosition: state.milkdown.scrollPosition
        },
        monaco: {
          instance: null,
          language: state.monaco.language,
          pdfPath: state.monaco.pdfPath,
          isCompiling: false,
          cursorPosition: state.monaco.cursorPosition,
          scrollTop: state.monaco.scrollTop
        }
      })
    }
  )
)
