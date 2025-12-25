# Sprint 8: BlockNote + Focus Mode

> **Status:** Planning → Ready to Start
> **Effort:** 6 hours
> **Priority:** P1

---

## 🎯 Goal

Replace TipTap editor with BlockNote and implement distraction-free focus mode.

---

## ✅ Success Criteria

- [ ] BlockNote editor renders and accepts input
- [ ] Wiki links work (`[[link]]` with autocomplete)
- [ ] Tags work (`#tag` with colored badges)
- [ ] Focus mode hides sidebar
- [ ] Dark mode is default
- [ ] Auto-save (no save button)
- [ ] Word count visible in status bar
- [ ] All existing tests pass or updated

---

## 📋 Tasks

### Day 1: BlockNote Setup (2h)

```
├── [ ] Install BlockNote packages
│   └── npm install @blocknote/core @blocknote/react @blocknote/mantine
├── [ ] Create BlockNoteEditor component
│   └── src/renderer/src/components/Editor/BlockNoteEditor.tsx
├── [ ] Replace TipTap in App.tsx
├── [ ] Verify basic editing works
├── [ ] Set up dark theme
└── [ ] Configure auto-save on change
```

### Day 2: Custom Blocks (2h)

```
├── [ ] Create WikiLinkBlock
│   ├── src/renderer/src/blocks/WikiLink.tsx
│   ├── Regex trigger: [[
│   ├── Autocomplete from existing notes
│   └── Click to navigate
├── [ ] Create TagMark (inline)
│   ├── src/renderer/src/blocks/Tag.tsx
│   ├── Regex trigger: #
│   ├── Colored badges
│   └── Autocomplete from existing tags
└── [ ] Test both extensions
```

### Day 3: Focus Mode + Polish (2h)

```
├── [ ] Implement FocusMode component
│   ├── Hide sidebar
│   ├── Center editor
│   ├── Dim background
│   └── Hotkey: ⌘.
├── [ ] Add word count to status bar
├── [ ] Verify dark mode default
├── [ ] Update serialization (JSON blocks ↔ SQLite)
├── [ ] Migration script for existing notes (if needed)
└── [ ] Update tests
```

---

## 🔧 Technical Details

### BlockNote Installation

```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine
```

### BlockNote Editor Component

```tsx
// src/renderer/src/components/Editor/BlockNoteEditor.tsx
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

export function BlockNoteEditor({ content, onChange }) {
  const editor = useCreateBlockNote({
    initialContent: content,
  });

  return (
    <BlockNoteView 
      editor={editor} 
      theme="dark"
      onChange={() => onChange(editor.document)}
    />
  );
}
```

### Custom WikiLink Block

```tsx
// src/renderer/src/blocks/WikiLink.tsx
import { createReactInlineContentSpec } from "@blocknote/react";

export const WikiLink = createReactInlineContentSpec({
  type: "wikiLink",
  propSchema: {
    title: { default: "" },
    noteId: { default: "" },
  },
  content: "none",
}, {
  render: ({ inlineContent }) => (
    <span 
      className="wiki-link text-blue-400 cursor-pointer"
      onClick={() => navigateToNote(inlineContent.props.noteId)}
    >
      [[{inlineContent.props.title}]]
    </span>
  ),
});
```

### Focus Mode

```tsx
// src/renderer/src/components/FocusMode/FocusMode.tsx
export function FocusMode({ children, enabled }) {
  if (!enabled) return <>{children}</>;
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-3xl px-8">
        {children}
      </div>
    </div>
  );
}
```

---

## 📁 Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `components/Editor/BlockNoteEditor.tsx` | Main editor component |
| `blocks/WikiLink.tsx` | Wiki link inline content |
| `blocks/Tag.tsx` | Tag inline content |
| `components/FocusMode/FocusMode.tsx` | Focus mode wrapper |
| `components/StatusBar/StatusBar.tsx` | Word count, etc. |

### Files to Modify

| File | Changes |
|------|---------|
| `App.tsx` | Replace TipTap with BlockNote |
| `package.json` | Add BlockNote deps |
| `index.css` | Focus mode styles |

### Files to Archive

| File | Reason |
|------|--------|
| `components/Editor.tsx` | TipTap version |
| `extensions/` | TipTap extensions |

---

## ⚠️ Migration Considerations

### Content Format Change

**TipTap (current):**

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [...] }
  ]
}
```

**BlockNote:**

```json
[
  {
    "id": "abc123",
    "type": "paragraph",
    "content": [...]
  }
]
```

### Migration Strategy

Option A: Convert on load (lazy migration)
Option B: Batch migration script

**Recommendation:** Option A (convert on load) — simpler, no breaking changes.

---

## 🧪 Testing

### Test Updates Needed

```
├── [ ] Update editor component tests
├── [ ] Update wiki link tests
├── [ ] Update tag tests
├── [ ] Add focus mode tests
└── [ ] Add word count tests
```

### Manual Testing Checklist

- [ ] Create new note
- [ ] Edit existing note
- [ ] Add wiki link with autocomplete
- [ ] Click wiki link to navigate
- [ ] Add tag with autocomplete
- [ ] Toggle focus mode (⌘.)
- [ ] Verify word count updates
- [ ] Verify dark mode
- [ ] Verify auto-save

---

## 🎯 Definition of Done

- [ ] BlockNote replaces TipTap
- [ ] Wiki links work
- [ ] Tags work
- [ ] Focus mode implemented
- [ ] Word count visible
- [ ] All tests passing
- [ ] No console errors
- [ ] CHANGELOG updated
- [ ] .STATUS updated
