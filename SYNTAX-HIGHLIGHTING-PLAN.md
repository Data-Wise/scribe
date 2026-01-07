# Syntax Highlighting & Theme Integration Plan

**Date:** 2026-01-06
**Requested by:** User

---

## User Requests

1. **Live Mode**: Make sure syntax highlighting and suggestions adjust to themes selected
2. **Source Mode**: Apply syntax highlighting and LaTeX capabilities to Source mode as well

---

## Current State

### Live Preview Mode (CodeMirror 6)
- ✅ LaTeX rendering working (inline `$...$` and display `$$...$$`)
- ✅ Markdown syntax hiding (Obsidian-style)
- ❓ Theme integration unclear
- ❓ Syntax highlighting unclear

### Source Mode (CodeMirror 6)
- ✅ Raw markdown editing
- ❌ No syntax highlighting
- ❌ No LaTeX capabilities (auto-completion, snippets)
- ❌ No theme integration

---

## Research: CodeMirror 6 Features

### 1. Markdown Syntax Highlighting

CodeMirror 6 has built-in markdown support:

**Packages:**
- `@codemirror/lang-markdown` - Markdown language support
- `@lezer/markdown` - Parser for markdown

**Features:**
- Syntax highlighting for markdown elements
- Works with both Source and Live modes
- Customizable through themes

### 2. Theme System

CodeMirror 6 has a robust theme system:

**Packages:**
- `@codemirror/theme-one-dark` - Dark theme example
- `@uiw/codemirror-themes` - Multiple pre-built themes

**Custom Theming:**
```typescript
import { EditorView } from '@codemirror/view'

const myTheme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#034"
  },
  ".cm-content": {
    caretColor: "#0e9"
  },
  // ... more customization
}, { dark: true })
```

### 3. LaTeX Extensions in Source Mode

**Current Implementation:**
- Live mode has LaTeX ViewPlugin for rendering
- Source mode has none

**Needed:**
- Auto-completion for LaTeX commands
- Snippets for common patterns
- Syntax highlighting for LaTeX (within `$...$`)

---

## Implementation Plan

### Phase 1: Add Markdown Syntax Highlighting

**File:** `CodeMirrorEditor.tsx`

1. Install package:
   ```bash
   npm install @codemirror/lang-markdown
   ```

2. Add to Source mode extensions:
   ```typescript
   import { markdown } from '@codemirror/lang-markdown'

   const sourceExtensions = [
     markdown(),  // ← Add this
     // ... existing extensions
   ]
   ```

**Benefit:** Syntax highlighting for headings, bold, italic, code blocks, etc.

---

### Phase 2: Theme Integration

**Current themes in Scribe:**
- `nexus-dark` (default)
- `nexus-light`
- `solarized-dark`
- `nord`
- `gruvbox`
- `dracula`

**Implementation:**

1. Create CodeMirror theme factory that reads from Tailwind CSS variables:

```typescript
function createCodeMirrorTheme(themeName: string): Extension {
  // Read CSS variables from current theme
  const root = getComputedStyle(document.documentElement)

  return EditorView.theme({
    "&": {
      color: root.getPropertyValue('--nexus-text-primary'),
      backgroundColor: root.getPropertyValue('--nexus-background'),
    },
    ".cm-content": {
      caretColor: root.getPropertyValue('--nexus-accent'),
    },
    ".cm-cursor": {
      borderLeftColor: root.getPropertyValue('--nexus-accent'),
    },
    ".cm-selectionBackground": {
      backgroundColor: root.getPropertyValue('--nexus-accent') + '33',  // 20% opacity
    },
    // Markdown syntax highlighting
    ".cm-heading": {
      color: root.getPropertyValue('--nexus-accent'),
      fontWeight: "bold",
    },
    ".cm-strong": {
      fontWeight: "bold",
    },
    ".cm-em": {
      fontStyle: "italic",
    },
    ".cm-link": {
      color: root.getPropertyValue('--nexus-link'),
      textDecoration: "underline",
    },
    ".cm-code": {
      fontFamily: "monospace",
      backgroundColor: root.getPropertyValue('--nexus-background-secondary'),
    },
    // LaTeX highlighting (custom)
    ".cm-latex-inline": {
      color: root.getPropertyValue('--nexus-math-color'),  // Add this CSS var
    },
    ".cm-latex-display": {
      color: root.getPropertyValue('--nexus-math-color'),
    },
  }, { dark: themeName.includes('dark') })
}
```

2. Update theme when user switches:

```typescript
useEffect(() => {
  const theme = createCodeMirrorTheme(currentTheme)
  view.dispatch({
    effects: StateEffect.reconfigure.of([
      // ... other extensions
      theme,
    ])
  })
}, [currentTheme])
```

---

### Phase 3: LaTeX Auto-Completion in Source Mode

**Implementation:**

1. Create LaTeX completions source:

```typescript
import { CompletionContext } from '@codemirror/autocomplete'

const latexCompletions = (context: CompletionContext) => {
  const word = context.matchBefore(/\\[a-zA-Z]*/)
  if (!word) return null

  return {
    from: word.from,
    options: [
      { label: '\\alpha', type: 'keyword', info: 'Greek letter alpha' },
      { label: '\\beta', type: 'keyword', info: 'Greek letter beta' },
      { label: '\\frac{}{}', type: 'keyword', info: 'Fraction' },
      { label: '\\sum', type: 'keyword', info: 'Summation' },
      { label: '\\int', type: 'keyword', info: 'Integral' },
      // ... more completions
    ]
  }
}
```

2. Add to autocomplete extension:

```typescript
import { autocompletion } from '@codemirror/autocomplete'

const sourceExtensions = [
  autocompletion({
    override: [latexCompletions]
  }),
  // ... other extensions
]
```

---

### Phase 4: LaTeX Snippets in Source Mode

**Implementation:**

```typescript
import { snippetCompletion } from '@codemirror/autocomplete'

const latexSnippets = [
  snippetCompletion('frac12', {
    label: 'frac12',
    type: 'keyword',
    detail: 'Fraction template',
    apply: '\\frac{${1:numerator}}{${2:denominator}}$0'
  }),
  snippetCompletion('int', {
    label: 'int',
    type: 'keyword',
    detail: 'Integral template',
    apply: '\\int_{${1:a}}^{${2:b}} ${3:f(x)} \\, dx$0'
  }),
  // ... more snippets
]
```

---

## File Structure

```
src/renderer/src/components/
├── CodeMirrorEditor.tsx          # Main editor component (UPDATE)
├── CodeMirror/                   # New directory
│   ├── themes.ts                 # Theme factory (NEW)
│   ├── latexCompletions.ts       # LaTeX completions (NEW)
│   └── latexSnippets.ts          # LaTeX snippets (NEW)
```

---

## Implementation Order

1. ✅ Phase 1: Markdown syntax highlighting (quick win)
2. 🔄 Phase 2: Theme integration (most visible impact)
3. 🔄 Phase 3: LaTeX auto-completion in Source mode
4. 🔄 Phase 4: LaTeX snippets in Source mode

---

## Testing Checklist

### Phase 1: Markdown Syntax
- [ ] Headings highlighted differently
- [ ] Bold/italic text styled
- [ ] Code blocks monospace
- [ ] Links underlined/colored

### Phase 2: Themes
- [ ] Light theme works
- [ ] Dark theme works
- [ ] All 6 themes render correctly
- [ ] Theme switches update editor immediately
- [ ] Syntax colors match theme palette

### Phase 3: Auto-Completion
- [ ] `\al` shows `\alpha` completion
- [ ] Completion popup themed correctly
- [ ] Works in both Source and Live modes
- [ ] Enter key accepts completion

### Phase 4: Snippets
- [ ] `frac12` expands to template
- [ ] Tab stops work correctly
- [ ] Snippets work in Source mode

---

## Expected Benefits

1. **Better Source Mode UX** - Syntax highlighting makes markdown structure visible
2. **Theme Consistency** - Editor matches app theme
3. **Faster LaTeX Input** - Auto-complete and snippets speed up math editing
4. **Discoverability** - Users learn LaTeX commands through auto-complete

---

## Next Steps

1. Install `@codemirror/lang-markdown`
2. Add markdown() to Source mode extensions
3. Test syntax highlighting
4. Implement theme factory
5. Add LaTeX auto-complete
