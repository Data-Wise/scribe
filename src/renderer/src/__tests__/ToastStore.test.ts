import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToastStore } from '../store/useToastStore'

describe('useToastStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] })
  })

  describe('Initial State', () => {
    it('starts with empty toasts array', () => {
      const state = useToastStore.getState()
      expect(state.toasts).toEqual([])
    })
  })

  describe('addToast', () => {
    it('adds a toast with generated id', () => {
      const { addToast } = useToastStore.getState()

      const id = addToast({
        message: 'Test message',
        type: 'info'
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe(id)
      expect(state.toasts[0].message).toBe('Test message')
      expect(state.toasts[0].type).toBe('info')
    })

    it('returns unique ids for each toast', () => {
      const { addToast } = useToastStore.getState()

      const id1 = addToast({ message: 'Toast 1', type: 'info' })
      const id2 = addToast({ message: 'Toast 2', type: 'success' })
      const id3 = addToast({ message: 'Toast 3', type: 'error' })

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('supports all toast types', () => {
      const { addToast } = useToastStore.getState()
      const types = ['info', 'success', 'warning', 'error', 'undo'] as const

      types.forEach(type => {
        addToast({ message: `${type} toast`, type })
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(5)
      types.forEach((type, index) => {
        expect(state.toasts[index].type).toBe(type)
      })
    })

    it('preserves optional action', () => {
      const { addToast } = useToastStore.getState()
      const onClick = vi.fn()

      addToast({
        message: 'Undo action',
        type: 'undo',
        action: {
          label: 'Undo',
          onClick
        }
      })

      const state = useToastStore.getState()
      expect(state.toasts[0].action).toBeDefined()
      expect(state.toasts[0].action?.label).toBe('Undo')
      expect(state.toasts[0].action?.onClick).toBe(onClick)
    })

    it('preserves optional duration', () => {
      const { addToast } = useToastStore.getState()

      addToast({
        message: 'Custom duration',
        type: 'info',
        duration: 10000
      })

      const state = useToastStore.getState()
      expect(state.toasts[0].duration).toBe(10000)
    })

    it('adds multiple toasts in order', () => {
      const { addToast } = useToastStore.getState()

      addToast({ message: 'First', type: 'info' })
      addToast({ message: 'Second', type: 'success' })
      addToast({ message: 'Third', type: 'warning' })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(3)
      expect(state.toasts[0].message).toBe('First')
      expect(state.toasts[1].message).toBe('Second')
      expect(state.toasts[2].message).toBe('Third')
    })
  })

  describe('removeToast', () => {
    it('removes toast by id', () => {
      const { addToast, removeToast } = useToastStore.getState()

      const id = addToast({ message: 'To remove', type: 'info' })
      expect(useToastStore.getState().toasts).toHaveLength(1)

      removeToast(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('only removes the specified toast', () => {
      const { addToast, removeToast } = useToastStore.getState()

      const id1 = addToast({ message: 'Keep 1', type: 'info' })
      const id2 = addToast({ message: 'Remove', type: 'success' })
      const id3 = addToast({ message: 'Keep 2', type: 'warning' })

      removeToast(id2)

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(2)
      expect(state.toasts.find(t => t.id === id1)).toBeDefined()
      expect(state.toasts.find(t => t.id === id2)).toBeUndefined()
      expect(state.toasts.find(t => t.id === id3)).toBeDefined()
    })

    it('handles removing non-existent toast gracefully', () => {
      const { addToast, removeToast } = useToastStore.getState()

      addToast({ message: 'Existing', type: 'info' })

      // Should not throw
      removeToast('non-existent-id')

      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('clearToasts', () => {
    it('removes all toasts', () => {
      const { addToast, clearToasts } = useToastStore.getState()

      addToast({ message: 'Toast 1', type: 'info' })
      addToast({ message: 'Toast 2', type: 'success' })
      addToast({ message: 'Toast 3', type: 'error' })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('handles clearing empty toasts array', () => {
      const { clearToasts } = useToastStore.getState()

      // Should not throw
      clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('Undo Toast Pattern', () => {
    it('supports undo workflow', () => {
      const { addToast, removeToast } = useToastStore.getState()
      const undoFn = vi.fn()

      // Simulate delete action with undo toast
      const toastId = addToast({
        message: '"My Note" moved to trash',
        type: 'undo',
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: undoFn
        }
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)

      // Simulate clicking undo
      state.toasts[0].action?.onClick()
      expect(undoFn).toHaveBeenCalledTimes(1)

      // Remove toast after undo
      removeToast(toastId)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })
})
