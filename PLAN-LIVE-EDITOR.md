# Live Editor Enhancements Plan

**Branch:** `feat/live-editor-enhancements`
**Created:** 2025-12-31
**Status:** Planning

---

## Overview

Implement Obsidian-style "Live Preview" editing features that render markdown inline while typing, with cursor-aware syntax reveal.

---

## Feature 1: Cursor-Aware Syntax Hiding

**The Core Mechanic** - Show markdown syntax only when cursor is on that line.

### Behavior
```
Normal view (cursor elsewhere):
  Welcome to Scribe
  This is bold text and italic text

Cursor on line:
  # Welcome to Scribe
  This is **bold** text and *italic* text
```

### Implementation Approach

**Option A: CSS + contenteditable (Recommended)**
- Use CSS to hide syntax markers (*, #, etc.)
- Add `data-cursor-line` attribute to current line
- CSS rule: `[data-cursor-line] .syntax-marker { display: inline; }`
- Pros: Simple, performant
- Cons: Limited control over complex syntax

**Option B: Virtual DOM manipulation**
- Parse markdown on each keystroke
- Render different DOM for cursor line vs others
- Pros: Full control
- Cons: Performance overhead, complexity

**Option C: CodeMirror/ProseMirror**
- Use established editor with decorations API
- Pros: Battle-tested, handles edge cases
- Cons: Major refactor, different architecture

### Recommended: Hybrid Approach
1. Keep HybridEditor++ foundation
2. Add line-level tracking (`currentLineIndex` state)
3. Use CSS classes for syntax visibility
4. Parse/render markdown differently based on cursor position

### Elements to Handle
| Element | Syntax | Hidden When Not Focused |
|---------|--------|------------------------|
| Headings | `# ## ###` | Hash symbols |
| Bold | `**text**` | Asterisks |
| Italic | `*text*` or `_text_` | Markers |
| Strikethrough | `~~text~~` | Tildes |
| Code | `` `code` `` | Backticks |
| Links | `[text](url)` | URL + brackets |
| Images | `![alt](src)` | Everything except image |

### Files to Modify
- `src/renderer/src/components/Editor/HybridEditor.tsx`
- `src/renderer/src/styles/editor.css` (new)
- Possibly create `LivePreviewEngine.ts` utility

---

## Feature 2: Inline Checkboxes

**Quick Win** - Render `- [ ]` and `- [x]` as clickable checkboxes.

### Behavior
```markdown
- [ ] Unchecked task    →  ☐ Unchecked task
- [x] Completed task    →  ☑ Completed task
```

### Implementation
1. **Regex Pattern:** `/^(\s*)- \[([ x])\] (.+)$/gm`
2. **Render:** Replace with `<input type="checkbox">` + label
3. **Click Handler:** Toggle `[ ]` ↔ `[x]` in source
4. **Sync:** Update note content on checkbox change

### Styling
```css
.task-checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--accent);
  border-radius: 3px;
  cursor: pointer;
}
.task-checkbox:checked {
  background: var(--accent);
}
.task-checkbox:checked + .task-label {
  text-decoration: line-through;
  opacity: 0.7;
}
```

### Files to Modify
- `src/renderer/src/components/Editor/HybridEditor.tsx`
- Add checkbox click handler
- CSS for checkbox styling

---

## Feature 3: Callout Blocks

**Visual Appeal** - Render `> [!type]` as styled callout boxes.

### Obsidian Callout Syntax
```markdown
> [!note]
> This is a note callout

> [!warning]
> This is a warning

> [!tip] Custom Title
> Tips are helpful
```

### Callout Types
| Type | Icon | Color |
|------|------|-------|
| `note` | 📝 | Blue |
| `tip` | 💡 | Green |
| `warning` | ⚠️ | Yellow |
| `danger` | 🔴 | Red |
| `info` | ℹ️ | Cyan |
| `quote` | 💬 | Gray |
| `example` | 📋 | Purple |
| `question` | ❓ | Orange |

### Implementation
1. **Regex:** `/^>\s*\[!(\w+)\](.*)?\n((?:>.*\n?)*)/gm`
2. **Parse:** Extract type, optional title, content
3. **Render:**
```html
<div class="callout callout-note">
  <div class="callout-title">
    <span class="callout-icon">📝</span>
    <span class="callout-title-text">Note</span>
  </div>
  <div class="callout-content">
    Content here...
  </div>
</div>
```

### Styling
```css
.callout {
  border-left: 4px solid var(--callout-color);
  background: var(--callout-bg);
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 4px;
}
.callout-note { --callout-color: #3b82f6; --callout-bg: #3b82f610; }
.callout-warning { --callout-color: #f59e0b; --callout-bg: #f59e0b10; }
.callout-danger { --callout-color: #ef4444; --callout-bg: #ef444410; }
```

### Collapsible Callouts (Future)
```markdown
> [!note]- Collapsed by default
> Content hidden until clicked

> [!note]+ Expanded by default
> Content visible, can collapse
```

---

## Implementation Order

### Phase 1: Foundation (Feature 2 - Checkboxes)
- [ ] Add checkbox regex detection
- [ ] Render checkboxes in preview
- [ ] Add click handler to toggle state
- [ ] Sync checkbox state to source markdown
- [ ] Add checkbox CSS styling
- [ ] Tests for checkbox functionality

### Phase 2: Callouts (Feature 3)
- [ ] Add callout regex detection
- [ ] Define callout types and colors
- [ ] Render callout blocks in preview
- [ ] Add callout CSS styling
- [ ] Support custom titles
- [ ] Tests for callout rendering

### Phase 3: Cursor-Aware Syntax (Feature 1)
- [ ] Track current cursor line
- [ ] Add line-level CSS classes
- [ ] Implement syntax hiding CSS
- [ ] Handle heading rendering
- [ ] Handle bold/italic rendering
- [ ] Handle link rendering
- [ ] Tests for cursor-aware behavior

---

## Technical Considerations

### Performance
- Avoid re-parsing entire document on each keystroke
- Use incremental parsing where possible
- Debounce expensive operations

### Accessibility
- Checkboxes must be keyboard accessible
- Callouts should have proper ARIA roles
- Syntax hiding should not break screen readers

### Editor State
- Track cursor position (line, column)
- Sync visual state with source markdown
- Handle undo/redo correctly

---

## Design Decisions

### Checkbox Persistence: Immediate Sync
- Checkbox toggle saves to SQLite immediately
- No batching - instant feedback for user
- Rationale: Tasks are high-value actions, should never be lost

### Callout Editing: Styled Body, Raw Header
- Callout body stays styled even with cursor inside
- Only `> [!type]` header line reveals raw syntax when focused
- Rationale: Better visual context while editing content

---

## Success Metrics

1. **Checkboxes:** Can create and toggle tasks without leaving edit mode
2. **Callouts:** 8 callout types render correctly with icons/colors
3. **Cursor-aware:** Markdown syntax hidden except on current line

---

## References

- [Obsidian Live Preview](https://help.obsidian.md/Editing+and+formatting/Live+preview)
- [Obsidian Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts)
- [CodeMirror Decorations](https://codemirror.net/docs/ref/#view.Decoration)
