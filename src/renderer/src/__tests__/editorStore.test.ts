import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore, getEditorTypeForFile, getMonacoLanguage } from '../store/editorStore'

describe('editorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorStore.getState().reset()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useEditorStore.getState()

      expect(state.currentFile).toEqual({
        path: null,
        content: '',
        editorType: 'text',
        isDirty: false,
        lastSaved: expect.any(Number)
      })

      expect(state.milkdown).toEqual({
        instance: null,
        cursorPosition: 0,
        scrollPosition: 0
      })

      expect(state.monaco).toEqual({
        instance: null,
        language: 'markdown',
        pdfPath: null,
        isCompiling: false,
        cursorPosition: null,
        scrollTop: 0
      })
    })
  })

  describe('setCurrentFile', () => {
    it('should update current file state', () => {
      const { setCurrentFile } = useEditorStore.getState()

      setCurrentFile({ path: 'test.md', content: '# Hello' })

      const state = useEditorStore.getState()
      expect(state.currentFile.path).toBe('test.md')
      expect(state.currentFile.content).toBe('# Hello')
      expect(state.currentFile.editorType).toBe('milkdown')
      expect(state.currentFile.isDirty).toBe(false)
    })

    it('should set editor type based on file extension', () => {
      const { setCurrentFile } = useEditorStore.getState()

      setCurrentFile({ path: 'document.tex', content: '\\documentclass{article}' })

      const state = useEditorStore.getState()
      expect(state.currentFile.editorType).toBe('monaco')
      expect(state.monaco.language).toBe('latex')
    })

    it('should update Monaco language for code files', () => {
      const { setCurrentFile } = useEditorStore.getState()

      setCurrentFile({ path: 'script.R', content: 'x <- 1' })

      const state = useEditorStore.getState()
      expect(state.monaco.language).toBe('r')
    })
  })

  describe('updateContent', () => {
    it('should update content and mark as dirty', () => {
      const { setCurrentFile, updateContent } = useEditorStore.getState()

      setCurrentFile({ path: 'test.md', content: '# Hello' })
      updateContent('# Hello World')

      const state = useEditorStore.getState()
      expect(state.currentFile.content).toBe('# Hello World')
      expect(state.currentFile.isDirty).toBe(true)
    })
  })

  describe('setDirty', () => {
    it('should update isDirty flag', () => {
      const { setCurrentFile, setDirty } = useEditorStore.getState()

      setCurrentFile({ path: 'test.md', content: '# Hello' })
      setDirty(true)

      expect(useEditorStore.getState().currentFile.isDirty).toBe(true)

      setDirty(false)
      expect(useEditorStore.getState().currentFile.isDirty).toBe(false)
    })
  })

  describe('Milkdown state management', () => {
    it('should save cursor and scroll position', () => {
      const { saveMilkdownState } = useEditorStore.getState()

      saveMilkdownState(42, 100)

      const state = useEditorStore.getState()
      expect(state.milkdown.cursorPosition).toBe(42)
      expect(state.milkdown.scrollPosition).toBe(100)
    })

    it('should set Milkdown instance', () => {
      const { setMilkdownInstance } = useEditorStore.getState()
      const mockInstance = { id: 'milkdown-1' }

      setMilkdownInstance(mockInstance)

      expect(useEditorStore.getState().milkdown.instance).toBe(mockInstance)
    })
  })

  describe('Monaco state management', () => {
    it('should save Monaco state', () => {
      const { saveMonacoState } = useEditorStore.getState()

      saveMonacoState('latex', '/tmp/output.pdf')

      const state = useEditorStore.getState()
      expect(state.monaco.language).toBe('latex')
      expect(state.monaco.pdfPath).toBe('/tmp/output.pdf')
    })

    it('should set Monaco instance', () => {
      const { setMonacoInstance } = useEditorStore.getState()
      const mockInstance = { id: 'monaco-1' } as any

      setMonacoInstance(mockInstance)

      expect(useEditorStore.getState().monaco.instance).toBe(mockInstance)
    })

    it('should update compiling state', () => {
      const { setCompiling } = useEditorStore.getState()

      setCompiling(true)
      expect(useEditorStore.getState().monaco.isCompiling).toBe(true)

      setCompiling(false)
      expect(useEditorStore.getState().monaco.isCompiling).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { setCurrentFile, updateContent, setCompiling, reset } = useEditorStore.getState()

      // Modify state
      setCurrentFile({ path: 'test.md', content: '# Hello' })
      updateContent('# Modified')
      setCompiling(true)

      // Reset
      reset()

      const state = useEditorStore.getState()
      expect(state.currentFile.path).toBe(null)
      expect(state.currentFile.content).toBe('')
      expect(state.currentFile.isDirty).toBe(false)
      expect(state.monaco.isCompiling).toBe(false)
    })
  })
})

describe('getEditorTypeForFile', () => {
  describe('Markdown files', () => {
    it('should return milkdown for .md files', () => {
      expect(getEditorTypeForFile('note.md')).toBe('milkdown')
    })

    it('should return milkdown for .qmd files', () => {
      expect(getEditorTypeForFile('analysis.qmd')).toBe('milkdown')
    })

    it('should handle mixed case extensions', () => {
      expect(getEditorTypeForFile('NOTE.MD')).toBe('milkdown')
      expect(getEditorTypeForFile('Analysis.QMD')).toBe('milkdown')
    })
  })

  describe('Code files', () => {
    it('should return monaco for .tex files', () => {
      expect(getEditorTypeForFile('paper.tex')).toBe('monaco')
    })

    it('should return monaco for .R files', () => {
      expect(getEditorTypeForFile('script.R')).toBe('monaco')
    })

    it('should return monaco for .py files', () => {
      expect(getEditorTypeForFile('main.py')).toBe('monaco')
    })
  })

  describe('Edge cases', () => {
    it('should return text for null path', () => {
      expect(getEditorTypeForFile(null)).toBe('text')
    })

    it('should return text for unknown extensions', () => {
      expect(getEditorTypeForFile('data.csv')).toBe('text')
      expect(getEditorTypeForFile('config.yaml')).toBe('text')
    })

    it('should return text for files without extension', () => {
      expect(getEditorTypeForFile('README')).toBe('text')
    })

    it('should handle paths with multiple dots', () => {
      expect(getEditorTypeForFile('my.report.final.tex')).toBe('monaco')
    })
  })
})

describe('getMonacoLanguage', () => {
  describe('Supported languages', () => {
    it('should return latex for .tex files', () => {
      expect(getMonacoLanguage('document.tex')).toBe('latex')
    })

    it('should return r for .R files', () => {
      expect(getMonacoLanguage('script.R')).toBe('r')
    })

    it('should return python for .py files', () => {
      expect(getMonacoLanguage('main.py')).toBe('python')
    })

    it('should return javascript for .js files', () => {
      expect(getMonacoLanguage('app.js')).toBe('javascript')
    })

    it('should return typescript for .ts files', () => {
      expect(getMonacoLanguage('types.ts')).toBe('typescript')
    })

    it('should return json for .json files', () => {
      expect(getMonacoLanguage('package.json')).toBe('json')
    })
  })

  describe('Edge cases', () => {
    it('should return plaintext for null path', () => {
      expect(getMonacoLanguage(null)).toBe('plaintext')
    })

    it('should return plaintext for unknown extensions', () => {
      expect(getMonacoLanguage('data.csv')).toBe('plaintext')
    })

    it('should handle mixed case extensions', () => {
      expect(getMonacoLanguage('SCRIPT.R')).toBe('r')
      expect(getMonacoLanguage('Document.TEX')).toBe('latex')
    })

    it('should handle files with multiple dots', () => {
      expect(getMonacoLanguage('config.test.ts')).toBe('typescript')
    })
  })
})
