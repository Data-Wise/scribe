import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, any>
  onLinkClick: (title: string) => void
}

export const WikiLink = Mark.create<WikiLinkOptions>({
  name: 'wikiLink',

  addOptions() {
    return {
      HTMLAttributes: {},
      onLinkClick: () => {}
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="wiki-link"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'wiki-link',
        class: 'wiki-link cursor-pointer text-blue-400 hover:text-blue-300 hover:underline'
      }),
      0
    ]
  },

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          return {
            'data-title': attributes.title
          }
        }
      }
    }
  },

  // Parse [[wiki links]] as you type using decorations
  addProseMirrorPlugins() {
    const { onLinkClick } = this.options

    return [
      new Plugin({
        key: new PluginKey('wikiLinkParser'),

        // Decorate [[links]] in the document
        props: {
          decorations(state) {
            const { doc } = state
            const decorations: Decoration[] = []
            const regex = /\[\[([^\]]+)\]\]/g

            doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text || ''
              let match

              while ((match = regex.exec(text)) !== null) {
                const from = pos + match.index
                const to = from + match[0].length
                const title = match[1]

                // Add decoration for the entire [[link]]
                decorations.push(
                  Decoration.inline(from, to, {
                    class: 'wiki-link-decoration text-blue-400 font-medium',
                    'data-title': title
                  })
                )
              }
            })

            return DecorationSet.create(doc, decorations)
          },

          // Handle clicks on wiki links
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement

            // Check if clicked on a wiki link decoration
            if (target.classList.contains('wiki-link-decoration')) {
              const title = target.getAttribute('data-title')
              if (title) {
                onLinkClick(title)
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
