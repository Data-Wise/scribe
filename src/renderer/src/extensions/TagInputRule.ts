import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface TagInputRuleOptions {
  onTrigger: (position: number) => void
}

export const TagInputRule = Extension.create<TagInputRuleOptions>({
  name: 'tagInputRule',

  addOptions() {
    return {
      onTrigger: () => {}
    }
  },

  addProseMirrorPlugins() {
    const { onTrigger } = this.options

    return [
      new Plugin({
        key: new PluginKey('tagInputRule'),

        props: {
          // Handle keyboard input
          handleTextInput(_view, from, _to, text) {
            // Check if user just typed #
            if (text === '#') {
              console.log('[TagInputRule] Typed #, triggering autocomplete at position', from + 1)
              // Trigger autocomplete
              onTrigger(from + 1)
            }

            return false // Let the character be inserted normally
          }
        }
      })
    ]
  }
})
