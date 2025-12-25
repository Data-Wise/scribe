import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface WikiLinkInputRuleOptions {
  onTrigger: (position: number) => void
}

export const WikiLinkInputRule = Extension.create<WikiLinkInputRuleOptions>({
  name: 'wikiLinkInputRule',

  addOptions() {
    return {
      onTrigger: () => {}
    }
  },

  addProseMirrorPlugins() {
    const { onTrigger } = this.options

    return [
      new Plugin({
        key: new PluginKey('wikiLinkInputRule'),

        props: {
          // Handle keyboard input
          handleTextInput(view, from, _to, text) {
            // Check if user just typed the second [
            if (text === '[') {
              const { state } = view
              const textBefore = state.doc.textBetween(Math.max(0, from - 1), from)

              console.log('[WikiLinkInputRule] Typed [, textBefore:', JSON.stringify(textBefore))

              // If the previous character was also [, we have [[
              if (textBefore === '[') {
                console.log('[WikiLinkInputRule] Detected [[, triggering autocomplete at position', from + 1)
                // Trigger autocomplete
                onTrigger(from + 1)
              }
            }

            return false // Let the character be inserted normally
          }
        }
      })
    ]
  }
})
