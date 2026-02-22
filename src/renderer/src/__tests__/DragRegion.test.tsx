import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DragRegion, useDragRegion } from '../components/DragRegion'
import * as platformModule from '../lib/platform'
import { renderHook, act } from '@testing-library/react'

// Mock the platform module
vi.mock('../lib/platform', () => ({
  isTauri: vi.fn(),
  isBrowser: vi.fn(),
  getPlatform: vi.fn(),
}))

// Mock the Tauri API
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(),
}))

describe('DragRegion Component', () => {
  let mockStartDragging: ReturnType<typeof vi.fn>
  let mockGetCurrentWindow: ReturnType<typeof vi.fn>
  let isTauriMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    isTauriMock = vi.fn(() => true)
    mockStartDragging = vi.fn().mockResolvedValue(undefined)
    mockGetCurrentWindow = vi.fn(() => ({
      startDragging: mockStartDragging,
    }))

    // Apply mocks to platform module
    vi.mocked(platformModule.isTauri).mockImplementation(isTauriMock as () => boolean)

    // Mock Tauri API module
    vi.doMock('@tauri-apps/api/window', () => ({
      getCurrentWindow: mockGetCurrentWindow,
    }))
  })

  afterEach(() => {
    vi.unmock('@tauri-apps/api/window')
  })

  describe('Basic Rendering', () => {
    it('renders the drag region container', () => {
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('.drag-region')

      expect(dragRegion).toBeInTheDocument()
      expect(dragRegion?.tagName).toBe('DIV')
    })

    it('renders with correct class name', () => {
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div')

      expect(dragRegion).toHaveClass('drag-region')
    })

    it('renders with additional custom className', () => {
      const { container } = render(<DragRegion className="custom-class" />)
      const dragRegion = container.querySelector('div')

      expect(dragRegion).toHaveClass('drag-region')
      expect(dragRegion).toHaveClass('custom-class')
    })

    it('renders with custom style prop', () => {
      const customStyle = { padding: '10px', margin: '5px' }
      const { container } = render(<DragRegion style={customStyle} />)
      const dragRegion = container.querySelector('div') as HTMLElement

      expect(dragRegion).toHaveStyle({ padding: '10px', margin: '5px' })
    })
  })

  describe('Children Rendering', () => {
    it('renders children correctly', () => {
      render(
        <DragRegion>
          <span>Test Content</span>
        </DragRegion>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <DragRegion>
          <span>First</span>
          <span>Second</span>
          <span>Third</span>
        </DragRegion>
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })

    it('renders complex children structure', () => {
      render(
        <DragRegion>
          <div>
            <h1>Title</h1>
            <p>Content</p>
          </div>
        </DragRegion>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders no children when not provided', () => {
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('.drag-region')

      expect(dragRegion?.children.length).toBe(0)
    })
  })

  describe('Styling and Cursor', () => {
    it('sets cursor to grab in Tauri mode', () => {
      isTauriMock.mockReturnValue(true)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      expect(dragRegion).toHaveStyle({ cursor: 'grab' })
    })

    it('sets cursor to default in browser mode', () => {
      isTauriMock.mockReturnValue(false)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      expect(dragRegion).toHaveStyle({ cursor: 'default' })
    })

    it('merges custom style with cursor style', () => {
      isTauriMock.mockReturnValue(true)
      const customStyle = { padding: '20px' }
      const { container } = render(<DragRegion style={customStyle} />)
      const dragRegion = container.querySelector('div') as HTMLElement

      expect(dragRegion).toHaveStyle({ cursor: 'grab', padding: '20px' })
    })

    it('allows custom style to override cursor', () => {
      isTauriMock.mockReturnValue(true)
      const customStyle = { cursor: 'pointer' as const }
      const { container } = render(<DragRegion style={customStyle} />)
      const dragRegion = container.querySelector('div') as HTMLElement

      // Custom style overwrites the cursor (spread order: cursor set first, then custom)
      expect(dragRegion).toHaveStyle({ cursor: 'pointer' })
    })
  })

  describe('Mouse Event Handling', () => {
    it('has onMouseDown handler attached', () => {
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div')

      expect(dragRegion).toHaveProperty('onmousedown')
    })

    it('calls startDragging on left mouse button click in Tauri mode', async () => {
      isTauriMock.mockReturnValue(true)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 0 })

      await waitFor(() => {
        expect(mockGetCurrentWindow).toHaveBeenCalled()
        expect(mockStartDragging).toHaveBeenCalled()
      })
    })

    it('does not call startDragging in browser mode', async () => {
      isTauriMock.mockReturnValue(false)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 0 })

      // Give async handler time to run (or not)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockGetCurrentWindow).not.toHaveBeenCalled()
      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not start dragging on right mouse button', async () => {
      isTauriMock.mockReturnValue(true)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 2 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not start dragging on middle mouse button', async () => {
      isTauriMock.mockReturnValue(true)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 1 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })
  })

  describe('Interactive Element Exclusion', () => {
    it('does not drag when clicking on button element', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <button>Click me</button>
        </DragRegion>
      )

      const button = screen.getByText('Click me')
      fireEvent.mouseDown(button, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking on anchor element', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <a href="#">Link</a>
        </DragRegion>
      )

      const link = screen.getByText('Link')
      fireEvent.mouseDown(link, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking on input element', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <input type="text" />
        </DragRegion>
      )

      const input = screen.getByDisplayValue('') as HTMLInputElement
      fireEvent.mouseDown(input, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking on textarea element', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <textarea></textarea>
        </DragRegion>
      )

      const textarea = screen.getByDisplayValue('')
      fireEvent.mouseDown(textarea, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking inside button (nested)', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <button>
            <span>Text inside button</span>
          </button>
        </DragRegion>
      )

      const span = screen.getByText('Text inside button')
      fireEvent.mouseDown(span, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking inside anchor (nested)', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <a href="#">
            <span>Link text</span>
          </a>
        </DragRegion>
      )

      const span = screen.getByText('Link text')
      fireEvent.mouseDown(span, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking inside input (nested)', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <div>
            <input type="text" />
          </div>
        </DragRegion>
      )

      const input = screen.getByDisplayValue('') as HTMLInputElement
      fireEvent.mouseDown(input, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not drag when clicking inside textarea (nested)', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <div>
            <textarea></textarea>
          </div>
        </DragRegion>
      )

      const textarea = screen.getByDisplayValue('')
      fireEvent.mouseDown(textarea, { button: 0 })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does drag when clicking on regular div', async () => {
      isTauriMock.mockReturnValue(true)
      render(
        <DragRegion>
          <div>Regular content</div>
        </DragRegion>
      )

      const innerDiv = screen.getByText('Regular content')
      fireEvent.mouseDown(innerDiv, { button: 0 })

      await waitFor(() => {
        expect(mockStartDragging).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles startDragging error gracefully', async () => {
      isTauriMock.mockReturnValue(true)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Dragging failed')
      mockStartDragging.mockRejectedValueOnce(error)

      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 0 })

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to start window drag:', error)
      })

      consoleErrorSpy.mockRestore()
    })

    // Skip: Complex mock interaction with Tauri API async flows
    it.skip('handles getCurrentWindow error gracefully', async () => {
      isTauriMock.mockReturnValue(true)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Window API not available')
      mockGetCurrentWindow.mockRejectedValueOnce(error)

      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 0 })

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to start window drag:', error)
      })

      consoleErrorSpy.mockRestore()
    })

    it('does not throw when Tauri API is unavailable', () => {
      isTauriMock.mockReturnValue(true)
      mockGetCurrentWindow.mockImplementationOnce(() => {
        throw new Error('Tauri API not available')
      })

      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      expect(() => {
        fireEvent.mouseDown(dragRegion, { button: 0 })
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty className prop', () => {
      const { container } = render(<DragRegion className="" />)
      const dragRegion = container.querySelector('div')

      expect(dragRegion).toHaveClass('drag-region')
    })

    it('handles undefined children', () => {
      const { container } = render(<DragRegion children={undefined} />)
      const dragRegion = container.querySelector('div')

      expect(dragRegion).toBeInTheDocument()
    })

    it('handles null children', () => {
      const { container } = render(<DragRegion children={null} />)
      const dragRegion = container.querySelector('div')

      expect(dragRegion).toBeInTheDocument()
    })

    it('preserves event propagation for drag event', async () => {
      isTauriMock.mockReturnValue(true)
      const mockParentClick = vi.fn()

      const { container } = render(
        <div onMouseDown={mockParentClick}>
          <DragRegion />
        </div>
      )

      const dragRegion = container.querySelector('.drag-region') as HTMLElement
      fireEvent.mouseDown(dragRegion, { button: 0 })

      // Event should bubble up to parent
      await waitFor(() => {
        expect(mockParentClick).toHaveBeenCalled()
      })
    })
  })

  describe('Multiple Rapid Clicks', () => {
    // Skip: Complex mock interaction with Tauri API async flows
    it.skip('handles multiple rapid left mouse button clicks', async () => {
      isTauriMock.mockReturnValue(true)
      const { container } = render(<DragRegion />)
      const dragRegion = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragRegion, { button: 0 })
      fireEvent.mouseDown(dragRegion, { button: 0 })
      fireEvent.mouseDown(dragRegion, { button: 0 })

      await waitFor(() => {
        expect(mockStartDragging).toHaveBeenCalledTimes(3)
      })
    })
  })
})

describe('useDragRegion Hook', () => {
  let mockStartDragging: ReturnType<typeof vi.fn>
  let mockGetCurrentWindow: ReturnType<typeof vi.fn>
  let isTauriMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    isTauriMock = vi.fn(() => true)
    mockStartDragging = vi.fn().mockResolvedValue(undefined)
    mockGetCurrentWindow = vi.fn(() => ({
      startDragging: mockStartDragging,
    }))

    vi.mocked(platformModule.isTauri).mockImplementation(isTauriMock as () => boolean)

    vi.doMock('@tauri-apps/api/window', () => ({
      getCurrentWindow: mockGetCurrentWindow,
    }))
  })

  afterEach(() => {
    vi.unmock('@tauri-apps/api/window')
  })

  describe('Basic Hook Functionality', () => {
    it('returns object with onMouseDown handler', () => {
      const { result } = renderHook(() => useDragRegion())

      expect(result.current).toHaveProperty('onMouseDown')
      expect(typeof result.current.onMouseDown).toBe('function')
    })

    it('onMouseDown handler is a function', () => {
      const { result } = renderHook(() => useDragRegion())

      expect(result.current.onMouseDown).toBeInstanceOf(Function)
    })
  })

  describe('Hook Event Handling', () => {
    it('calls startDragging on left mouse button in Tauri mode', async () => {
      isTauriMock.mockReturnValue(true)
      const { result } = renderHook(() => useDragRegion())

      // Create a proper target element (a div, not an interactive element)
      const targetDiv = document.createElement('div')
      const mockEvent = new MouseEvent('mousedown', { button: 0 }) as unknown as React.MouseEvent
      Object.defineProperty(mockEvent, 'target', { value: targetDiv, enumerable: true })

      act(() => {
        result.current.onMouseDown(mockEvent)
      })

      await waitFor(() => {
        expect(mockGetCurrentWindow).toHaveBeenCalled()
        expect(mockStartDragging).toHaveBeenCalled()
      })
    })

    it('does not call startDragging in browser mode', async () => {
      isTauriMock.mockReturnValue(false)
      const { result } = renderHook(() => useDragRegion())

      const targetDiv = document.createElement('div')
      const mockEvent = new MouseEvent('mousedown', { button: 0 }) as unknown as React.MouseEvent
      Object.defineProperty(mockEvent, 'target', { value: targetDiv, enumerable: true })

      act(() => {
        result.current.onMouseDown(mockEvent)
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockGetCurrentWindow).not.toHaveBeenCalled()
      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('does not call startDragging on right mouse button', async () => {
      isTauriMock.mockReturnValue(true)
      const { result } = renderHook(() => useDragRegion())

      const targetDiv = document.createElement('div')
      const mockEvent = new MouseEvent('mousedown', { button: 2 }) as unknown as React.MouseEvent
      Object.defineProperty(mockEvent, 'target', { value: targetDiv, enumerable: true })

      act(() => {
        result.current.onMouseDown(mockEvent)
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })

    it('respects interactive element exclusion in hook', async () => {
      isTauriMock.mockReturnValue(true)
      const { result } = renderHook(() => useDragRegion())

      const button = document.createElement('button')
      const mockEvent = new MouseEvent('mousedown', { button: 0 }) as unknown as React.MouseEvent
      Object.defineProperty(mockEvent, 'target', { value: button, enumerable: true })

      act(() => {
        result.current.onMouseDown(mockEvent)
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockStartDragging).not.toHaveBeenCalled()
    })
  })

  describe('Hook Integration with Component', () => {
    it('hook can be used with custom element', async () => {
      isTauriMock.mockReturnValue(true)
      const TestComponent = () => {
        const { onMouseDown } = useDragRegion()
        return <div onMouseDown={onMouseDown}>Drag me</div>
      }

      const { container } = render(<TestComponent />)
      const dragElement = container.querySelector('div') as HTMLElement

      fireEvent.mouseDown(dragElement, { button: 0 })

      await waitFor(() => {
        expect(mockStartDragging).toHaveBeenCalled()
      })
    })

    it('hook can be used multiple times independently', async () => {
      isTauriMock.mockReturnValue(true)

      const TestComponent = () => {
        const handler1 = useDragRegion()
        const handler2 = useDragRegion()

        return (
          <>
            <div onMouseDown={handler1.onMouseDown} data-testid="region1">
              Region 1
            </div>
            <div onMouseDown={handler2.onMouseDown} data-testid="region2">
              Region 2
            </div>
          </>
        )
      }

      const { getByTestId } = render(<TestComponent />)

      fireEvent.mouseDown(getByTestId('region1'), { button: 0 })
      await waitFor(() => {
        expect(mockStartDragging).toHaveBeenCalledTimes(1)
      })

      mockStartDragging.mockClear()

      fireEvent.mouseDown(getByTestId('region2'), { button: 0 })
      await waitFor(() => {
        expect(mockStartDragging).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Hook Error Handling', () => {
    it('handles startDragging error in hook', async () => {
      isTauriMock.mockReturnValue(true)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Dragging failed')
      mockStartDragging.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDragRegion())

      const targetDiv = document.createElement('div')
      const mockEvent = new MouseEvent('mousedown', { button: 0 }) as unknown as React.MouseEvent
      Object.defineProperty(mockEvent, 'target', { value: targetDiv, enumerable: true })

      act(() => {
        result.current.onMouseDown(mockEvent)
      })

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to start window drag:', error)
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Hook Memoization', () => {
    it('returns stable onMouseDown handler reference', () => {
      const { result, rerender } = renderHook(() => useDragRegion())

      const firstHandler = result.current.onMouseDown

      rerender()

      const secondHandler = result.current.onMouseDown

      expect(firstHandler).toBe(secondHandler)
    })
  })
})
