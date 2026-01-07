# Source Mode Syntax Highlighting Fix

**Date:** 2026-01-06
**Issue:** "Source mode does not show syntax highlighting"
**Status:** ✅ Fixed
**Commit:** `17a5927`

---

## Problem

**User Report:** Source mode was not showing markdown syntax highlighting.

**Root Cause:** The `richMarkdownPlugin` (which hides markdown syntax for Live Preview mode) was **always active**, even in Source mode. This meant:

- Source mode ❌ Syntax hidden (wrong behavior)
- Live Preview mode ✅ Syntax hidden (correct behavior)

The CodeMirrorEditor component wasn't receiving the `editorMode` prop, so it couldn't differentiate between Source and Live modes.

---

## Solution

### 1. Add `editorMode` Prop to CodeMirrorEditor

**File:** `CodeMirrorEditor.tsx` (line 1253)

**Before:**
```typescript
interface CodeMirrorEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}
```

**After:**
```typescript
interface CodeMirrorEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  editorMode?: 'source' | 'live-preview' | 'reading'  // Controls syntax hiding behavior
}
```

---

### 2. Conditionally Apply richMarkdownPlugin

**File:** `CodeMirrorEditor.tsx` (lines 1269, 1286)

**Before:**
```typescript
export function CodeMirrorEditor({
  content,
  onChange,
  placeholder,
  className,
}: CodeMirrorEditorProps) {
  // ...
  const extensions = [
    markdown({ ... }),
    syntaxHighlighting(markdownHighlighting),
    displayMathField,
    richMarkdownPlugin,  // ❌ Always active
    latexSyntaxPlugin,
    autocompletion({ ... }),
  ]
}
```

**After:**
```typescript
export function CodeMirrorEditor({
  content,
  onChange,
  placeholder,
  className,
  editorMode = 'source',  // ✅ Default to source mode
}: CodeMirrorEditorProps) {
  // ...
  const extensions = [
    markdown({ ... }),
    syntaxHighlighting(markdownHighlighting),
    displayMathField,
    // ✅ Only hide syntax in live-preview mode; show all syntax in source mode
    ...(editorMode === 'live-preview' ? [richMarkdownPlugin] : []),
    latexSyntaxPlugin,
    autocompletion({ ... }),
  ]
}
```

**Key Change:** Conditional spread operator
```typescript
...(editorMode === 'live-preview' ? [richMarkdownPlugin] : [])
```

---

### 3. Pass editorMode from HybridEditor

**File:** `HybridEditor.tsx` (line 490)

**Before:**
```typescript
<CodeMirrorEditor
  content={localContent}
  onChange={(newContent) => {
    setLocalContent(newContent)
    onChange(newContent)
  }}
  placeholder="Start writing..."
/>
```

**After:**
```typescript
<CodeMirrorEditor
  content={localContent}
  onChange={(newContent) => {
    setLocalContent(newContent)
    onChange(newContent)
  }}
  placeholder="Start writing..."
  editorMode={mode}  // ✅ Pass mode to control syntax hiding
/>
```

---

## Behavior After Fix

### Source Mode (⌘1)
**Purpose:** Raw markdown editing with full syntax visibility

**Behavior:**
- ✅ **All markdown syntax visible:**
  - `#` heading markers
  - `**bold**` asterisks
  - `_italic_` underscores
  - `~~strikethrough~~` tildes
  - `[link](url)` bracket syntax
  - `` `code` `` backticks
  - `> blockquote` markers
  - `- list` bullet markers
  - `$math$` dollar signs

- ✅ **Syntax highlighted with theme colors:**
  - Headings: Accent color, larger font
  - Bold: Font weight 700
  - Italic: Font style italic
  - Links: Link color, underline on hover
  - Code: Monospace, background color
  - LaTeX commands: Purple/orange syntax highlighting

- ✅ **LaTeX capabilities active:**
  - Auto-completion on `\` + letters
  - Snippets (frac12, int, matrix)
  - Syntax highlighting for commands

**Use Case:** Precise editing, seeing all syntax, learning markdown

---

### Live Preview Mode (⌘2)
**Purpose:** Obsidian-style WYSIWYG editing

**Behavior:**
- ✅ **Syntax hidden when cursor away:**
  - `# Heading` → **Heading** (syntax hidden)
  - `**bold**` → **bold** (asterisks hidden)
  - `$E=mc^2$` → E=mc² (dollar signs hidden, rendered)

- ✅ **Syntax revealed when cursor inside:**
  - Cursor on heading line → `#` visible
  - Cursor on bold text → `**` visible
  - Cursor on math → `$` visible for editing

- ✅ **Smooth editing experience:**
  - Click to edit reveals syntax
  - Move cursor away hides syntax
  - No jarring transitions

**Use Case:** Distraction-free writing, focus on content

---

### Reading Mode (⌘3)
**Purpose:** Read-only rendered view

**Behavior:**
- ✅ Fully rendered HTML output
- ✅ Math rendered with KaTeX
- ✅ No editing capabilities
- ✅ Clean reading experience

**Use Case:** Reviewing finished document, presenting

---

## What richMarkdownPlugin Does

The `richMarkdownPlugin` is a ViewPlugin that:

1. **Scans the document** for markdown syntax elements
2. **Checks cursor position** relative to each element
3. **Hides syntax** when cursor is on a different line
4. **Reveals syntax** when cursor is on the same line

**Implementation:** Uses `Decoration.replace()` with `HiddenWidget` to hide syntax characters

**Example:**
```markdown
# Heading One          # ← Cursor here: syntax visible
Some paragraph text
## Heading Two         ## ← Cursor away: syntax hidden, shows as styled heading
```

---

## Technical Details

### Extension Array Spread Pattern

The conditional inclusion uses JavaScript spread operator:

```typescript
const extensions = [
  markdown(),
  syntaxHighlighting(),
  displayMathField,
  ...(editorMode === 'live-preview' ? [richMarkdownPlugin] : []),
  //                                   ^^^^^^^^^^^^^^^^^^^   ^^
  //                                   Include if live       Empty array otherwise
]
```

**Behavior:**
- `editorMode === 'live-preview'` → `[richMarkdownPlugin]` → spreads to include plugin
- `editorMode === 'source'` → `[]` → spreads to nothing, plugin excluded

### Default Value

```typescript
editorMode = 'source'
```

**Rationale:** If no mode specified, default to Source mode (safest, most explicit)

---

## Mode Switching

**Keyboard Shortcuts:**
- ⌘1 → Source mode
- ⌘2 → Live Preview mode
- ⌘3 → Reading mode
- ⌘E → Cycle through modes

**User Preference:** Mode is saved to localStorage and persisted across sessions

---

## Testing

### Manual Testing Checklist
- [x] Source mode shows all markdown syntax
- [x] Source mode highlights syntax with theme colors
- [x] Live Preview mode hides syntax when cursor away
- [x] Live Preview mode reveals syntax when cursor inside
- [x] Reading mode renders cleanly
- [x] Mode switching works (⌘1, ⌘2, ⌘3)
- [x] LaTeX auto-complete works in Source mode
- [x] LaTeX rendering works in Live mode
- [x] Theme colors apply to syntax highlighting

### Unit Tests
✅ All 1942 tests passing
✅ No TypeScript errors

---

## Syntax Highlighting Examples

### Source Mode View

```
# Welcome to Scribe 👋     ← Heading with # visible, accent color

Scribe is an **ADHD-friendly** distraction-free writer
       ← Bold with ** visible, font weight 700

## Quick Tips              ← ## visible, larger font

- Press ⌘N to create a new note     ← - visible
- Press ⌘D to open today's daily note
- Press ⌘K to open the command palette
- Press Escape to close panels

$E = mc^2$                 ← $ visible, LaTeX highlighted
```

### Live Preview Mode View

```
Welcome to Scribe 👋       ← # hidden, styled as heading

Scribe is an ADHD-friendly distraction-free writer
       ← ** hidden, text rendered bold

Quick Tips                 ← ## hidden, styled as heading

• Press ⌘N to create a new note     ← - hidden, bullet rendered
• Press ⌘D to open today's daily note
• Press ⌘K to open the command palette
• Press Escape to close panels

E = mc²                    ← $ hidden, math rendered with KaTeX
```

---

## Impact

### Benefits

1. **Source Mode Now Functional** - Users can see and edit raw markdown
2. **Learning Tool** - New users can learn markdown syntax by seeing it
3. **Precise Editing** - Advanced users can edit syntax directly
4. **Theme Integration** - Syntax highlighted with theme colors
5. **Mode Clarity** - Clear difference between Source and Live modes

### No Breaking Changes

- ✅ Live Preview behavior unchanged
- ✅ Reading mode behavior unchanged
- ✅ Default behavior safe (defaults to Source mode)
- ✅ All existing tests passing
- ✅ No performance impact

---

## Code Quality

### Metrics
- **Lines changed:** 6 (minimal, surgical fix)
- **Complexity:** Low (simple conditional)
- **Performance:** No impact (extension array created once)
- **Maintainability:** High (clear intent, well-commented)

### Best Practices
- ✅ Single Responsibility Principle (richMarkdownPlugin has one job)
- ✅ Separation of Concerns (mode logic separate from rendering)
- ✅ Defensive Programming (default to safest mode)
- ✅ Clear Documentation (comments explain intent)

---

## Future Enhancements (Optional)

### 1. Source Mode Syntax Colors Enhancement

**Current:** Syntax uses basic theme colors
**Enhancement:** More distinct colors for different elements

```typescript
'.cm-heading1': { color: colors.heading, fontSize: '2em' },
'.cm-strong': { color: colors.emphasis, fontWeight: '700' },
'.cm-link': { color: colors.link, textDecoration: 'underline' },
'.cm-code': {
  color: colors.code,
  backgroundColor: colors.codeBackground,
  padding: '2px 4px',
  borderRadius: '3px'
},
```

### 2. Syntax Toggle Command

**Enhancement:** Toggle syntax visibility in Live mode

```typescript
{ id: 'toggle_syntax', name: 'Toggle Syntax Visibility' }
```

### 3. Selective Syntax Hiding

**Enhancement:** Hide some syntax but show others in Live mode

Example: Hide bold/italic asterisks but show heading markers

---

## Related Documentation

- `SYNTAX-THEME-STATUS.md` - Syntax highlighting implementation details
- `AUTOCOMPLETE-THEMING-2026-01-06.md` - Autocomplete theme integration
- `LIVE-PREVIEW-POLISH.md` - LaTeX rendering polish

---

## Commit Message

```
fix: Enable syntax highlighting in Source mode

- Add editorMode prop to CodeMirrorEditor interface
- Conditionally include richMarkdownPlugin only in live-preview mode
- Pass editorMode from HybridEditor to CodeMirrorEditor
- Source mode now shows all markdown syntax with highlighting
- Live mode continues to hide syntax (Obsidian-style)

Fixes: Source mode does not show syntax highlighting
Tests: All 1942 passing
```

**Hash:** `17a5927`

---

## Summary

✅ **Issue:** Source mode didn't show syntax
✅ **Cause:** richMarkdownPlugin always active
✅ **Fix:** Conditional plugin inclusion based on editorMode
✅ **Result:** Source mode shows syntax, Live mode works as before
✅ **Tests:** All 1942 passing

**Source mode is now fully functional with complete syntax highlighting!**
