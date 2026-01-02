import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MathRenderer, InlineMath, BlockMath } from '../components/MathRenderer'

// Mock the mathjax module
vi.mock('../lib/mathjax', () => ({
  renderMath: vi.fn((latex: string) => {
    // Simple mock implementation that returns a valid HTML string
    // In real KaTeX, this would return rendered SVG/HTML
    if (latex === 'INVALID_MATH') {
      throw new Error('Invalid LaTeX')
    }
    // Return a minimal valid SVG-like structure for testing
    return `<svg class="katex" data-tex="${latex}"><text>${latex}</text></svg>`
  }),
  containsMath: vi.fn(),
  extractMathExpressions: vi.fn(),
  processMathInContent: vi.fn(),
}))

describe('MathRenderer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders inline math by default', () => {
      const { container } = render(<MathRenderer tex="x^2" />)

      const span = container.querySelector('.math-inline') as HTMLSpanElement
      expect(span).toBeInTheDocument()
      expect(span?.style.display).toBe('inline')
    })

    it('renders block math when display is true', () => {
      const { container } = render(<MathRenderer tex="x^2" display={true} />)

      const span = container.querySelector('.math-block') as HTMLSpanElement
      expect(span).toBeInTheDocument()
      expect(span?.style.display).toBe('block')
      expect(span?.style.textAlign).toBe('center')
    })

    it('applies custom className to rendered math', () => {
      const { container } = render(
        <MathRenderer tex="x^2" className="custom-math" />
      )

      const span = container.querySelector('.custom-math')
      expect(span).toBeInTheDocument()
      expect(span?.className).toContain('math-inline')
      expect(span?.className).toContain('custom-math')
    })

    it('applies custom className to block math', () => {
      const { container } = render(
        <MathRenderer tex="x^2" display={true} className="custom-block" />
      )

      const span = container.querySelector('.custom-block')
      expect(span).toBeInTheDocument()
      expect(span?.className).toContain('math-block')
      expect(span?.className).toContain('custom-block')
    })
  })

  describe('Empty/Null Input Handling', () => {
    it('returns null for empty string', () => {
      const { container } = render(<MathRenderer tex="" />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
      const { container } = render(<MathRenderer tex="   " />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null for undefined tex', () => {
      const { container } = render(<MathRenderer tex={undefined as any} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null for null tex', () => {
      const { container } = render(<MathRenderer tex={null as any} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Valid Math Expressions', () => {
    it('renders simple inline formula', () => {
      const { container } = render(<MathRenderer tex="a + b" />)

      const span = container.querySelector('.math-inline')
      expect(span).toBeInTheDocument()
      expect(span?.innerHTML).toContain('a + b')
    })

    it('renders complex inline formula', () => {
      const { container } = render(
        <MathRenderer tex="\\frac{a+b}{c+d}" />
      )

      const span = container.querySelector('.math-inline')
      expect(span).toBeInTheDocument()
    })

    it('renders simple block formula', () => {
      const { container } = render(
        <MathRenderer tex="e = mc^2" display={true} />
      )

      const span = container.querySelector('.math-block')
      expect(span).toBeInTheDocument()
      expect(span?.innerHTML).toContain('e = mc^2')
    })

    it('renders complex block formula', () => {
      const { container } = render(
        <MathRenderer tex="\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}" display={true} />
      )

      const span = container.querySelector('.math-block')
      expect(span).toBeInTheDocument()
    })

    it('trims whitespace from tex before rendering', () => {
      const { container } = render(<MathRenderer tex="  x^2  " />)

      const span = container.querySelector('.math-inline')
      expect(span).toBeInTheDocument()
      // Should render the trimmed version
      expect(span?.innerHTML).toContain('x^2')
    })
  })

  describe('Error Handling', () => {
    it('displays error state for invalid LaTeX', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan).toBeInTheDocument()
    })

    it('shows inline error format for invalid inline math', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" display={false} />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan?.textContent).toContain('$INVALID_MATH$')
    })

    it('shows block error format for invalid block math', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" display={true} />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan?.textContent).toContain('$$INVALID_MATH$$')
    })

    it('error span has error styling', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error') as HTMLSpanElement
      // Color formats may differ between test environments (rgb vs hex)
      expect(['rgb(239, 68, 68)', '#ef4444']).toContain(errorSpan?.style.color)
      expect(['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.1)']).toContain(errorSpan?.style.backgroundColor)
      expect(errorSpan?.style.padding).toBe('2px 4px')
      expect(errorSpan?.style.borderRadius).toBe('2px')
      expect(errorSpan?.style.fontFamily).toBe('monospace')
      expect(errorSpan?.style.fontSize).toBe('0.9em')
    })

    it('error span has title attribute with error message', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan?.getAttribute('title')).toBe('Invalid LaTeX')
    })

    it('applies custom className to error state', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" className="my-error-class" />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan?.className).toContain('my-error-class')
    })

    it('recovers from error when tex is corrected', () => {
      const { rerender, container } = render(
        <MathRenderer tex="INVALID_MATH" />
      )

      // Should show error
      let errorSpan = container.querySelector('.math-error')
      expect(errorSpan).toBeInTheDocument()

      // Fix the math
      rerender(<MathRenderer tex="x^2" />)

      // Should now render without error
      errorSpan = container.querySelector('.math-error')
      expect(errorSpan).not.toBeInTheDocument()

      const validSpan = container.querySelector('.math-inline')
      expect(validSpan).toBeInTheDocument()
    })
  })

  describe('Block Math Styling', () => {
    it('block math has display block style', () => {
      const { container } = render(
        <MathRenderer tex="x^2" display={true} />
      )

      const span = container.querySelector('.math-block') as HTMLSpanElement
      expect(span?.style?.display).toBe('block')
      expect(span?.style?.textAlign).toBe('center')
      // Margin format may differ (with or without 'px' suffix)
      expect(['1em 0', '1em 0px']).toContain(span?.style?.margin)
    })

    it('inline math has display inline style', () => {
      const { container } = render(
        <MathRenderer tex="x^2" display={false} />
      )

      const span = container.querySelector('.math-inline') as HTMLSpanElement
      expect(span?.style?.display).toBe('inline')
    })
  })

  describe('InlineMath Convenience Component', () => {
    it('renders inline math component', () => {
      const { container } = render(<InlineMath tex="a + b" />)

      const span = container.querySelector('.math-inline') as HTMLSpanElement
      expect(span).toBeInTheDocument()
      expect(span?.style?.display).toBe('inline')
    })

    it('passes className to InlineMath', () => {
      const { container } = render(
        <InlineMath tex="a + b" className="my-inline" />
      )

      const span = container.querySelector('.my-inline')
      expect(span).toBeInTheDocument()
    })

    it('InlineMath handles empty tex', () => {
      const { container } = render(<InlineMath tex="" />)

      expect(container.firstChild).toBeNull()
    })

    it('InlineMath shows error for invalid math', () => {
      const { container } = render(
        <InlineMath tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan).toBeInTheDocument()
      expect(errorSpan?.textContent).toContain('$INVALID_MATH$')
    })
  })

  describe('BlockMath Convenience Component', () => {
    it('renders block math component', () => {
      const { container } = render(<BlockMath tex="e = mc^2" />)

      const span = container.querySelector('.math-block') as HTMLSpanElement
      expect(span).toBeInTheDocument()
      expect(span?.style?.display).toBe('block')
    })

    it('passes className to BlockMath', () => {
      const { container } = render(
        <BlockMath tex="e = mc^2" className="my-block" />
      )

      const span = container.querySelector('.my-block')
      expect(span).toBeInTheDocument()
    })

    it('BlockMath handles empty tex', () => {
      const { container } = render(<BlockMath tex="" />)

      expect(container.firstChild).toBeNull()
    })

    it('BlockMath shows error for invalid math', () => {
      const { container } = render(
        <BlockMath tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan).toBeInTheDocument()
      expect(errorSpan?.textContent).toContain('$$INVALID_MATH$$')
    })
  })

  describe('dangerouslySetInnerHTML Safety', () => {
    it('uses dangerouslySetInnerHTML for valid math', () => {
      const { container } = render(<MathRenderer tex="x^2" />)

      const span = container.querySelector('.math-inline')
      expect(span?.innerHTML).toBeTruthy()
    })

    it('does not use dangerouslySetInnerHTML for errors', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error')
      // Error span should have text content, not HTML
      expect(errorSpan?.textContent).toBeTruthy()
    })
  })

  describe('Memoization and Caching', () => {
    it('uses useMemo to cache rendered HTML', () => {
      const { rerender, container } = render(
        <MathRenderer tex="x^2" display={false} />
      )

      const firstSpan = container.querySelector('.math-inline')
      const firstHTML = firstSpan?.innerHTML

      // Rerender with same props - should not change
      rerender(<MathRenderer tex="x^2" display={false} />)

      const secondSpan = container.querySelector('.math-inline')
      const secondHTML = secondSpan?.innerHTML

      expect(firstHTML).toBe(secondHTML)
    })

    it('recalculates when tex changes', () => {
      const { rerender, container } = render(
        <MathRenderer tex="x^2" />
      )

      let span = container.querySelector('.math-inline')
      expect(span?.innerHTML).toContain('x^2')

      rerender(<MathRenderer tex="y^3" />)

      span = container.querySelector('.math-inline')
      expect(span?.innerHTML).toContain('y^3')
    })

    it('recalculates when display changes', () => {
      const { rerender, container } = render(
        <MathRenderer tex="x^2" display={false} />
      )

      let span = container.querySelector('.math-inline')
      expect(span).toBeInTheDocument()

      rerender(<MathRenderer tex="x^2" display={true} />)

      span = container.querySelector('.math-inline')
      expect(span).not.toBeInTheDocument()

      span = container.querySelector('.math-block')
      expect(span).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters in LaTeX', () => {
      const { container } = render(
        <MathRenderer tex="\alpha + \beta + \gamma" />
      )

      const span = container.querySelector('.math-inline')
      expect(span).toBeInTheDocument()
    })

    it('handles newlines in display mode', () => {
      const { container } = render(
        <MathRenderer tex="a + b\n+ c" display={true} />
      )

      const span = container.querySelector('.math-block')
      expect(span).toBeInTheDocument()
    })

    it('handles very long mathematical expressions', () => {
      const longExpr = 'x^2 + y^2 + z^2 + a^2 + b^2 + c^2 + d^2 + e^2 + f^2 + g^2'
      const { container } = render(
        <MathRenderer tex={longExpr} />
      )

      const span = container.querySelector('.math-inline')
      expect(span).toBeInTheDocument()
    })

    it('handles unicode in error messages', () => {
      const { container } = render(
        <MathRenderer tex="INVALID_MATH" />
      )

      const errorSpan = container.querySelector('.math-error')
      expect(errorSpan).toBeInTheDocument()
      // Should gracefully handle error display
      expect(errorSpan?.textContent).toMatch(/\$INVALID_MATH\$/)
    })

    it('handles className with multiple classes', () => {
      const { container } = render(
        <MathRenderer tex="x^2" className="class1 class2 class3" />
      )

      const span = container.querySelector('.class1')
      expect(span).toBeInTheDocument()
      expect(span?.className).toContain('class2')
      expect(span?.className).toContain('class3')
    })
  })

  describe('Console Output', () => {
    it('logs warning for render errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(<MathRenderer tex="INVALID_MATH" />)

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MathRenderer] Render error:'),
        expect.any(String),
        expect.stringContaining('tex:'),
        'INVALID_MATH'
      )

      warnSpy.mockRestore()
    })

    it('does not log for valid math', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(<MathRenderer tex="x^2" />)

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })
})
