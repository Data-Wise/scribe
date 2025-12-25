import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface TagMarkOptions {
  HTMLAttributes: Record<string, any>
  onTagClick?: (tagName: string) => void
}

export const TagMark = Mark.create<TagMarkOptions>({
  name: 'tagMark',

  addOptions() {
    return {
      HTMLAttributes: {},
      onTagClick: () => {}
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="tag"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'tag',
        class: 'tag-mark'
      }),
      0
    ]
  },

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-name'),
        renderHTML: (attributes) => {
          return {
            'data-tag-name': attributes.name
          }
        }
      },
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-color'),
        renderHTML: (attributes) => {
          return {
            'data-tag-color': attributes.color
          }
        }
      }
    }
  },

  // Parse #tags as you type using decorations
  addProseMirrorPlugins() {
    const { onTagClick } = this.options

    return [
      new Plugin({
        key: new PluginKey('tagParser'),

        // Decorate #tags in the document
        props: {
          decorations(state) {
            const { doc } = state
            const decorations: Decoration[] = []
            const tagRegex = /#([a-zA-Z0-9_-]+)/g

            doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text || ''
              let match

              while ((match = tagRegex.exec(text)) !== null) {
                const from = pos + match.index
                const to = from + match[0].length
                const tagName = match[1]

                // Generate color from tag name
                const color = generateTagColor(tagName)

                // Add decoration for the #tag
                decorations.push(
                  Decoration.inline(from, to, {
                    class: 'tag-decoration',
                    style: `
                      display: inline-flex;
                      align-items: center;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 0.875rem;
                      font-weight: 500;
                      cursor: pointer;
                      background-color: ${color};
                      color: white;
                      margin: 0 2px;
                    `,
                    'data-tag-name': tagName,
                    'data-tag-color': color
                  })
                )
              }
            })

            return DecorationSet.create(doc, decorations)
          },

          // Handle clicks on tags
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement

            // Check if clicked on a tag decoration
            if (target.classList.contains('tag-decoration')) {
              const tagName = target.getAttribute('data-tag-name')
              if (tagName && onTagClick) {
                onTagClick(tagName)
                return true // Prevent default behavior
              }
            }

            return false
          }
        }
      })
    ]
  }
})

/**
 * Generate consistent color from tag name using hash
 */
function generateTagColor(name: string): string {
  const hash = name.split('').reduce((acc, char) =>
    char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}
