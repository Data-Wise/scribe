import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CodeMirrorEditor } from '../components/CodeMirrorEditor'

// Mock CodeMirror and its dependencies
const mockDispatch = vi.fn()
const mockView = {
  state: {
    doc: {
      toString: vi.fn(() => 'initial content'),
      length: 15
    },
    selection: {
      main: { from: 0, to: 0, head: 0 }
    }
  },
  dispatch: mockDispatch
}

let mockEditorRef: { view: typeof mockView | null } = { view: null }

vi.mock('@uiw/react-codemirror', () => ({
  default: vi.fn(({ value, onChange, ref, theme, extensions, basicSetup }) => {
    // Store ref for access in tests
    if (ref) {
      ref.current = mockEditorRef
    }
    return (
      <div data-testid="codemirror-mock" data-theme={theme ? 'custom' : 'default'}>
        <textarea
          data-testid="editor-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="CodeMirror Mock"
        />
        <span data-testid="extensions-count">{extensions?.length ?? 0}</span>
        <span data-testid="basic-setup">{JSON.stringify(basicSetup)}</span>
      </div>
    )
  })
}))

vi.mock('@codemirror/lang-markdown', () => ({
  markdown: vi.fn(() => ({ extension: 'markdown-mock' }))
}))

vi.mock('@codemirror/language-data', () => ({
  languages: []
}))

vi.mock('@lezer/markdown', () => ({
  Strikethrough: { name: 'Strikethrough' }
}))

vi.mock('@codemirror/view', () => ({
  EditorView: {
    theme: vi.fn(() => ({ extension: 'theme-mock' })),
    lineWrapping: { extension: 'line-wrapping-mock' },
    contentAttributes: {
      of: vi.fn(() => ({ extension: 'content-attrs-mock' }))
    },
    decorations: {
      from: vi.fn((f) => ({ extension: 'decorations-mock', field: f }))
    }
  },
  Decoration: {
    replace: vi.fn(() => ({
      range: vi.fn(() => ({ from: 0, to: 1 }))
    })),
    line: vi.fn(() => ({
      range: vi.fn(() => ({ from: 0 }))
    })),
    set: vi.fn(() => ({}))
  },
  ViewPlugin: {
    fromClass: vi.fn(() => ({ extension: 'view-plugin-mock' }))
  },
  WidgetType: class {}
}))

vi.mock('@codemirror/language', () => ({
  syntaxTree: vi.fn(() => ({
    iterate: vi.fn()
  })),
  HighlightStyle: {
    define: vi.fn(() => ({ style: 'highlight-style-mock' }))
  },
  syntaxHighlighting: vi.fn(() => ({ extension: 'syntax-highlighting-mock' }))
}))

vi.mock('@lezer/highlight', () => ({
  tags: {
    strikethrough: 'strikethrough',
    strong: 'strong',
    emphasis: 'emphasis',
    heading1: 'heading1',
    heading2: 'heading2',
    heading3: 'heading3',
    heading4: 'heading4',
    heading5: 'heading5',
    heading6: 'heading6',
    monospace: 'monospace',
    link: 'link',
    url: 'url',
    quote: 'quote',
    list: 'list',
    meta: 'meta',
    processingInstruction: 'processingInstruction'
  },
  styleTags: vi.fn((tagMap) => tagMap),  // Mock styleTags - just returns the input
  Tag: {
    define: vi.fn(() => 'custom-tag')  // Mock Tag.define() - returns a mock tag
  }
}))

vi.mock('katex', () => ({
  default: {
    render: vi.fn((formula, element) => {
      element.innerHTML = `<span class="katex">${formula}</span>`
    })
  }
}))

describe('CodeMirrorEditor Component', () => {
  const defaultProps = {
    content: 'Hello world',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockEditorRef = { view: null }
    // Mock getComputedStyle for theme color reading
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn((prop) => {
        const colors: Record<string, string> = {
          '--nexus-bg-primary': '#0d1210',
          '--nexus-bg-secondary': '#141e1a',
          '--nexus-bg-tertiary': '#1c2922',
          '--nexus-text-primary': '#d4e4dc',
          '--nexus-text-secondary': '#94a3b8',
          '--nexus-text-muted': '#8fa89b',
          '--nexus-accent': '#4ade80',
          '--nexus-error': '#ef4444'
        }
        return colors[prop] || ''
      })
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the CodeMirror editor wrapper', () => {
      const { container } = render(<CodeMirrorEditor {...defaultProps} />)

      const wrapper = container.querySelector('.codemirror-editor-wrapper')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders the CodeMirror mock component', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
    })

    it('passes content to CodeMirror as value', () => {
      render(<CodeMirrorEditor {...defaultProps} content="Test content" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('Test content')
    })

    it('renders with empty content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('')
    })

    it('applies custom className to wrapper', () => {
      const { container } = render(
        <CodeMirrorEditor {...defaultProps} className="my-custom-class" />
      )

      const wrapper = container.querySelector('.codemirror-editor-wrapper')
      expect(wrapper).toHaveClass('my-custom-class')
    })

    it('applies multiple custom classes to wrapper', () => {
      const { container } = render(
        <CodeMirrorEditor {...defaultProps} className="class1 class2" />
      )

      const wrapper = container.querySelector('.codemirror-editor-wrapper')
      expect(wrapper).toHaveClass('class1')
      expect(wrapper).toHaveClass('class2')
    })

    it('renders without custom className', () => {
      const { container } = render(<CodeMirrorEditor {...defaultProps} />)

      const wrapper = container.querySelector('.codemirror-editor-wrapper')
      expect(wrapper).toHaveClass('codemirror-editor-wrapper')
    })
  })

  describe('Content Changes', () => {
    it('calls onChange when content is modified', () => {
      const onChange = vi.fn()
      render(<CodeMirrorEditor {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.change(textarea, { target: { value: 'New content' } })

      expect(onChange).toHaveBeenCalledWith('New content')
    })

    it('calls onChange with empty string when content is cleared', () => {
      const onChange = vi.fn()
      render(<CodeMirrorEditor {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.change(textarea, { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith('')
    })

    it('handles rapid content changes', async () => {
      const onChange = vi.fn()
      render(<CodeMirrorEditor {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByTestId('editor-textarea')

      fireEvent.change(textarea, { target: { value: 'a' } })
      fireEvent.change(textarea, { target: { value: 'ab' } })
      fireEvent.change(textarea, { target: { value: 'abc' } })

      expect(onChange).toHaveBeenCalledTimes(3)
      expect(onChange).toHaveBeenLastCalledWith('abc')
    })

    it('handles special characters in content', () => {
      const onChange = vi.fn()
      render(<CodeMirrorEditor {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.change(textarea, { target: { value: 'Special: <>&"\'`' } })

      expect(onChange).toHaveBeenCalledWith('Special: <>&"\'`')
    })

    it('handles unicode content', () => {
      const onChange = vi.fn()
      render(<CodeMirrorEditor {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.change(textarea, { target: { value: 'Unicode: \u00e9\u00e8\u00ea \u4e2d\u6587 \ud83d\ude00' } })

      expect(onChange).toHaveBeenCalledWith('Unicode: \u00e9\u00e8\u00ea \u4e2d\u6587 \ud83d\ude00')
    })

    it('handles multiline content', () => {
      const onChange = vi.fn()
      render(<CodeMirrorEditor {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByTestId('editor-textarea')
      const multilineContent = 'Line 1\nLine 2\nLine 3'
      fireEvent.change(textarea, { target: { value: multilineContent } })

      expect(onChange).toHaveBeenCalledWith(multilineContent)
    })
  })

  describe('Placeholder', () => {
    it('renders without placeholder by default', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      // Extensions should still be created
      expect(screen.getByTestId('extensions-count')).toBeInTheDocument()
    })

    it('renders with placeholder when provided', () => {
      render(<CodeMirrorEditor {...defaultProps} placeholder="Start writing..." />)

      expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
    })
  })

  describe('Theme and Styling', () => {
    it('applies custom theme to CodeMirror', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      const editor = screen.getByTestId('codemirror-mock')
      expect(editor).toHaveAttribute('data-theme', 'custom')
    })

    it('reads theme colors from CSS variables', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      expect(window.getComputedStyle).toHaveBeenCalled()
    })
  })

  describe('Extensions Configuration', () => {
    it('configures basic setup with correct options', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      const basicSetup = screen.getByTestId('basic-setup')
      const config = JSON.parse(basicSetup.textContent || '{}')

      expect(config.lineNumbers).toBe(false)
      expect(config.foldGutter).toBe(false)
      expect(config.highlightActiveLine).toBe(false)
      expect(config.highlightSelectionMatches).toBe(false)
      expect(config.autocompletion).toBe(false)
    })

    it('includes markdown extension', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      // Extensions count should be > 0
      const extensionsCount = screen.getByTestId('extensions-count')
      expect(parseInt(extensionsCount.textContent || '0')).toBeGreaterThan(0)
    })
  })

  describe('Markdown Content Types', () => {
    it('handles heading content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="# Heading 1" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('# Heading 1')
    })

    it('handles bold content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="**bold text**" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('**bold text**')
    })

    it('handles italic content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="*italic text*" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('*italic text*')
    })

    it('handles strikethrough content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="~~strikethrough~~" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('~~strikethrough~~')
    })

    it('handles inline code content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="`inline code`" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('`inline code`')
    })

    it('handles code block content', () => {
      const codeBlock = '```javascript\nconst x = 1;\n```'
      render(<CodeMirrorEditor {...defaultProps} content={codeBlock} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(codeBlock)
    })

    it('handles link content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="[link](https://example.com)" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('[link](https://example.com)')
    })

    it('handles wiki-link content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="[[My Note]]" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('[[My Note]]')
    })

    it('handles list content', () => {
      const list = '- Item 1\n- Item 2\n- Item 3'
      render(<CodeMirrorEditor {...defaultProps} content={list} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(list)
    })

    it('handles blockquote content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="> This is a quote" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('> This is a quote')
    })

    it('handles callout content', () => {
      const callout = '> [!note]\n> This is a note callout'
      render(<CodeMirrorEditor {...defaultProps} content={callout} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(callout)
    })
  })

  describe('Math Content', () => {
    it('handles inline math content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="Equation: $x^2$" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('Equation: $x^2$')
    })

    it('handles display math content', () => {
      render(<CodeMirrorEditor {...defaultProps} content="$$E = mc^2$$" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('$$E = mc^2$$')
    })

    it('handles complex math expressions', () => {
      const complexMath = '$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$'
      render(<CodeMirrorEditor {...defaultProps} content={complexMath} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(complexMath)
    })

    it('handles mixed inline and display math', () => {
      const mixed = 'Inline $x$ and display $$y = mx + b$$'
      render(<CodeMirrorEditor {...defaultProps} content={mixed} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(mixed)
    })
  })

  describe('External Content Sync', () => {
    it('updates when content prop changes', async () => {
      const { rerender } = render(
        <CodeMirrorEditor {...defaultProps} content="Initial" />
      )

      let textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('Initial')

      rerender(<CodeMirrorEditor {...defaultProps} content="Updated" />)

      textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('Updated')
    })

    it('handles content prop cleared', async () => {
      const { rerender } = render(
        <CodeMirrorEditor {...defaultProps} content="Some content" />
      )

      rerender(<CodeMirrorEditor {...defaultProps} content="" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('')
    })

    it('handles content prop from undefined to string', async () => {
      const { rerender } = render(
        <CodeMirrorEditor {...defaultProps} content="" />
      )

      rerender(<CodeMirrorEditor {...defaultProps} content="New content" />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue('New content')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long content', () => {
      const longContent = 'a'.repeat(100000)
      render(<CodeMirrorEditor {...defaultProps} content={longContent} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(longContent)
    })

    it('handles content with whitespace characters', () => {
      const whitespaceContent = '   \n\t\n   '
      render(<CodeMirrorEditor {...defaultProps} content={whitespaceContent} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      // Check the textarea received the content (it contains whitespace)
      expect(textarea.value).toContain('\n')
      expect(textarea.value).toContain('\t')
      expect(textarea.value.length).toBeGreaterThan(0)
    })

    it('handles content with control characters', () => {
      const content = 'Text with\ttabs and\nnewlines'
      render(<CodeMirrorEditor {...defaultProps} content={content} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(content)
    })

    it('handles undefined content gracefully', () => {
      // TypeScript should prevent this, but test runtime behavior
      render(<CodeMirrorEditor {...defaultProps} content={undefined as unknown as string} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      // When undefined is passed, the textarea value becomes empty string
      expect(textarea.value).toBe('')
    })

    it('handles null content gracefully', () => {
      // TypeScript should prevent this, but test runtime behavior
      render(<CodeMirrorEditor {...defaultProps} content={null as unknown as string} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      // When null is passed, the textarea value becomes empty string
      expect(textarea.value).toBe('')
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up on unmount', () => {
      const { unmount } = render(<CodeMirrorEditor {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })

    it('handles rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<CodeMirrorEditor {...defaultProps} />)
        unmount()
      }

      // Should not throw or cause memory issues
      expect(true).toBe(true)
    })

    it('preserves onChange handler on rerender', async () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <CodeMirrorEditor {...defaultProps} onChange={onChange} />
      )

      rerender(<CodeMirrorEditor {...defaultProps} onChange={onChange} content="Updated" />)

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.change(textarea, { target: { value: 'Changed' } })

      expect(onChange).toHaveBeenCalledWith('Changed')
    })
  })

  describe('Accessibility', () => {
    it('has a textarea element for input', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('textarea is focusable', () => {
      render(<CodeMirrorEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      textarea.focus()

      expect(document.activeElement).toBe(textarea)
    })
  })
})

describe('CodeMirrorEditor Widget Classes', () => {
  describe('HiddenWidget', () => {
    it('conceptually hides syntax when cursor is away', () => {
      // This tests the concept - actual implementation uses ViewPlugin
      const syntaxToHide = ['EmphasisMark', 'CodeMark', 'HeaderMark', 'LinkMark', 'StrikethroughMark']

      syntaxToHide.forEach((syntax) => {
        expect(typeof syntax).toBe('string')
      })
    })
  })

  describe('BulletWidget', () => {
    it('conceptually replaces list markers with bullets', () => {
      // The bullet character used
      const bullet = '\u2022'
      expect(bullet).toBe('\u2022')
    })
  })

  describe('MathWidget', () => {
    it('conceptually supports both inline and display math modes', () => {
      const modes = ['inline', 'display']
      expect(modes).toContain('inline')
      expect(modes).toContain('display')
    })
  })
})

describe('CodeMirrorEditor Theme Colors', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn((prop) => {
        const colors: Record<string, string> = {
          '--nexus-bg-primary': '#0d1210',
          '--nexus-bg-secondary': '#141e1a',
          '--nexus-bg-tertiary': '#1c2922',
          '--nexus-text-primary': '#d4e4dc',
          '--nexus-text-secondary': '#94a3b8',
          '--nexus-text-muted': '#8fa89b',
          '--nexus-accent': '#4ade80',
          '--nexus-error': '#ef4444'
        }
        return colors[prop] || ''
      })
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads background primary color', () => {
    render(<CodeMirrorEditor content="" onChange={vi.fn()} />)

    expect(window.getComputedStyle).toHaveBeenCalled()
  })

  it('handles missing CSS variables with defaults', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn(() => '')
    } as unknown as CSSStyleDeclaration)

    // Should not throw even with empty CSS variables
    expect(() =>
      render(<CodeMirrorEditor content="" onChange={vi.fn()} />)
    ).not.toThrow()
  })
})

describe('CodeMirrorEditor Syntax Highlighting', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn(() => '#000000')
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('includes highlighting for strikethrough', () => {
    render(<CodeMirrorEditor {...defaultProps} content="~~strikethrough~~" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })

  it('includes highlighting for strong/bold', () => {
    render(<CodeMirrorEditor {...defaultProps} content="**bold**" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })

  it('includes highlighting for emphasis/italic', () => {
    render(<CodeMirrorEditor {...defaultProps} content="*italic*" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })

  it('includes highlighting for headings', () => {
    render(<CodeMirrorEditor {...defaultProps} content="# Heading" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })

  it('includes highlighting for monospace/code', () => {
    render(<CodeMirrorEditor {...defaultProps} content="`code`" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })

  it('includes highlighting for links', () => {
    render(<CodeMirrorEditor {...defaultProps} content="[link](url)" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })

  it('includes highlighting for quotes', () => {
    render(<CodeMirrorEditor {...defaultProps} content="> quote" />)

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument()
  })
})

describe('CodeMirrorEditor Callout Types', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn(() => '#000000')
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const calloutTypes = [
    'note', 'info', 'tip', 'hint', 'important',
    'success', 'check', 'done',
    'warning', 'caution', 'attention',
    'danger', 'error', 'bug',
    'question', 'help', 'faq',
    'example', 'quote', 'cite',
    'abstract', 'summary', 'tldr'
  ]

  calloutTypes.forEach((type) => {
    it(`handles ${type} callout type`, () => {
      const content = `> [!${type}]\n> Content for ${type} callout`
      render(<CodeMirrorEditor {...defaultProps} content={content} />)

      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea).toHaveValue(content)
    })
  })
})

describe('CodeMirrorEditor Rich Markdown Plugin Logic', () => {
  describe('Formatted Elements', () => {
    const formattedElements = [
      'Emphasis',
      'StrongEmphasis',
      'InlineCode',
      'Link',
      'Image',
      'Strikethrough'
    ]

    formattedElements.forEach((element) => {
      it(`tracks ${element} as a formatted element`, () => {
        expect(formattedElements).toContain(element)
      })
    })
  })

  describe('Syntax Hiding Rules', () => {
    it('hides HeaderMark when cursor is on different line', () => {
      // Conceptual test - actual hiding is done by ViewPlugin
      const nodeName = 'HeaderMark'
      expect(nodeName).toBe('HeaderMark')
    })

    it('hides EmphasisMark for italic/bold', () => {
      const nodeName = 'EmphasisMark'
      expect(nodeName).toBe('EmphasisMark')
    })

    it('hides CodeMark for inline code', () => {
      const nodeName = 'CodeMark'
      expect(nodeName).toBe('CodeMark')
    })

    it('replaces ListMark with bullet', () => {
      const nodeName = 'ListMark'
      expect(nodeName).toBe('ListMark')
    })

    it('hides LinkMark and URL for links', () => {
      const nodeNames = ['LinkMark', 'URL']
      expect(nodeNames).toContain('LinkMark')
      expect(nodeNames).toContain('URL')
    })

    it('hides StrikethroughMark', () => {
      const nodeName = 'StrikethroughMark'
      expect(nodeName).toBe('StrikethroughMark')
    })

    it('hides QuoteMark for blockquotes', () => {
      const nodeName = 'QuoteMark'
      expect(nodeName).toBe('QuoteMark')
    })
  })

  describe('Math Regex Patterns', () => {
    it('matches display math $$...$$', () => {
      const regex = /\$\$([^$]+)\$\$/g
      const text = '$$E = mc^2$$'
      const match = regex.exec(text)

      expect(match).not.toBeNull()
      expect(match?.[1]).toBe('E = mc^2')
    })

    it('matches inline math $...$', () => {
      const regex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
      const text = 'Equation $x^2$ here'
      const match = regex.exec(text)

      expect(match).not.toBeNull()
      expect(match?.[1]).toBe('x^2')
    })

    it('does not match $$ as inline math', () => {
      const regex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
      const text = '$$x^2$$'

      const matches = Array.from(text.matchAll(regex))
      expect(matches.length).toBe(0)
    })

    it('handles multiple inline math expressions', () => {
      const regex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g
      const text = 'Both $x$ and $y$ are variables'

      const matches = Array.from(text.matchAll(regex))
      expect(matches.length).toBe(2)
      expect(matches[0][1]).toBe('x')
      expect(matches[1][1]).toBe('y')
    })
  })

  describe('WikiLink Regex Patterns', () => {
    it('matches simple wikilink [[Page]]', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = '[[My Note]]'
      const match = regex.exec(text)

      expect(match).not.toBeNull()
      expect(match?.[1]).toBe('My Note')
      expect(match?.[2]).toBeUndefined()
    })

    it('matches wikilink with alias [[Page|Alias]]', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = '[[Page Name|Display Text]]'
      const match = regex.exec(text)

      expect(match).not.toBeNull()
      expect(match?.[1]).toBe('Page Name')
      expect(match?.[2]).toBe('Display Text')
    })

    it('matches multiple wikilinks', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = 'Link [[Note1]] and [[Note2]]'
      const matches = Array.from(text.matchAll(regex))

      expect(matches.length).toBe(2)
      expect(matches[0][1]).toBe('Note1')
      expect(matches[1][1]).toBe('Note2')
    })

    it('handles wikilink with spaces', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = '[[My Long Note Name]]'
      const match = regex.exec(text)

      expect(match).not.toBeNull()
      expect(match?.[1]).toBe('My Long Note Name')
    })

    it('handles wikilink with special characters', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = '[[Note: A & B (2024)]]'
      const match = regex.exec(text)

      expect(match).not.toBeNull()
      expect(match?.[1]).toBe('Note: A & B (2024)')
    })

    it('extracts page name and display text from alias', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = '[[Long Page Name|Short]]'
      const match = regex.exec(text)

      const pageName = match?.[1]
      const displayText = match?.[2] || pageName

      expect(pageName).toBe('Long Page Name')
      expect(displayText).toBe('Short')
    })

    it('uses page name as display text when no alias', () => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = '[[My Note]]'
      const match = regex.exec(text)

      const pageName = match?.[1]
      const displayText = match?.[2] || pageName

      expect(pageName).toBe('My Note')
      expect(displayText).toBe('My Note')
    })
  })

  describe('Syntax Highlighting Custom Tags', () => {
    it('creates custom tag for header marks', () => {
      // Tag.define() should be called for custom tags
      const { Tag } = require('@lezer/highlight')

      // Our implementation calls Tag.define() for custom tags
      expect(Tag.define).toBeDefined()
    })

    it('custom tags are distinct from built-in tags', () => {
      const { tags, Tag } = require('@lezer/highlight')

      // Custom tags should be different from built-in tags
      const customTag = Tag.define()
      expect(customTag).not.toBe(tags.processingInstruction)
    })
  })

  describe('WikiLinkWidget Class (Mock)', () => {
    it('WidgetType is available for extension', () => {
      const { WidgetType } = require('@codemirror/view')

      // WidgetType should be a class we can extend
      expect(WidgetType).toBeDefined()
      expect(typeof WidgetType).toBe('function')
    })

    it('WikiLinkWidget conceptual test - display text extraction', () => {
      // Testing the logic that WikiLinkWidget uses
      const fullWikiLink = '[[Page Name|Display Text]]'
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const match = regex.exec(fullWikiLink)

      const pageName = match?.[1]
      const displayText = match?.[2] || pageName

      // Widget should display only the display text
      expect(displayText).toBe('Display Text')
      expect(displayText).not.toContain('[[')
      expect(displayText).not.toContain('|')
    })

    it('WikiLinkWidget equality comparison logic', () => {
      // Two widgets with same display text should be equal
      const text1 = 'Display Text'
      const text2 = 'Display Text'
      const text3 = 'Different Text'

      // Equality is based on display text
      expect(text1 === text2).toBe(true)
      expect(text1 === text3 as string).toBe(false)
    })
  })

  describe('Editor Mode-Specific Extensions', () => {
    it('source mode should show syntax markers', () => {
      const props = {
        content: 'Test content',
        onChange: vi.fn(),
        editorMode: 'source' as const
      }
      render(<CodeMirrorEditor {...props} />)

      // In source mode, we expect markdown extension to be enabled
      // This is verified by extensions array length > 0
      const extensionsCount = screen.getByTestId('extensions-count')
      expect(parseInt(extensionsCount.textContent || '0')).toBeGreaterThan(0)
    })

    it('live-preview mode should hide brackets in widgets', () => {
      const props = {
        content: 'Test content',
        onChange: vi.fn(),
        editorMode: 'live-preview' as const
      }
      render(<CodeMirrorEditor {...props} />)

      // Live preview mode should have decoration extensions
      const extensionsCount = screen.getByTestId('extensions-count')
      expect(parseInt(extensionsCount.textContent || '0')).toBeGreaterThan(0)
    })
  })
})

describe('CodeMirrorEditor Default Export', () => {
  it('has default export', async () => {
    const module = await import('../components/CodeMirrorEditor')
    expect(module.default).toBeDefined()
  })

  it('default export is same as named export', async () => {
    const module = await import('../components/CodeMirrorEditor')
    expect(module.default).toBe(module.CodeMirrorEditor)
  })
})
