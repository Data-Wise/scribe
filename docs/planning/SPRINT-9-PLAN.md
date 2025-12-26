# Sprint 9: Editor Enhancement

> **Status:** Planning
> **Effort:** 3-4 hours (Option A/D)
> **Priority:** P1
> **Updated:** 2024-12-25

---

## 🎯 Goal

Enhance HybridEditor to support wiki-links and tags in both write and preview modes, with inline autocomplete.

**Decision Point:** This sprint implements Option A/D from Sprint 8 assessment.

---

## ✅ Success Criteria

- [ ] Wiki-link `[[...]]` clickable in write mode
- [ ] Tag `#tag` clickable in write mode
- [ ] Wiki-link autocomplete appears on `[[` trigger
- [ ] Tag autocomplete appears on `#` trigger
- [ ] Visual highlighting for wiki-links/tags in write mode
- [ ] Tests passing
- [ ] No console errors
- [ ] CHANGELOG updated
- [ ] .STATUS updated

---

## 📋 Tasks

### Day 1: Write Mode Wiki-Links & Tags (1.5h)

```
├── [ ] Test current wiki-link/tag behavior
│   ├── Write mode: Check [[ and # behavior
│   ├── Preview mode: Verify clicking works
│   └── Identify exact issues
├── [ ] Add visual highlighting in write mode
│   ├── Textarea overlay for [[...]]
│   ├── Textarea overlay for #tag
│   ├── Click handlers for both
│   └── Keyboard navigation
└── [ ] Update regex patterns
    ├── Fix wiki-link regex (if broken)
    ├── Fix tag regex (if broken)
    └── Test edge cases
```

### Day 2: Autocomplete (1.5h)

```
├── [ ] Implement wiki-link autocomplete
│   ├── Trigger on [[ pattern
│   ├── Show note list (use existing api.listNotes())
│   ├── Position popup near cursor
│   ├── Keyboard navigation (↑↓, Enter, Esc)
│   └── Insert selected note
├── [ ] Implement tag autocomplete
│   ├── Trigger on # pattern
│   ├── Show tag list (use existing api.getAllTags())
│   ├── Position popup near cursor
│   ├── Keyboard navigation
│   └── Insert selected tag
└── [ ] Integration with HybridEditor
    ├── Use cmdk for popup UI
    ├── Handle focus management
    └── Prevent textarea interference
```

### Day 3: Testing & Polish (1h)

```
├── [ ] Manual testing
│   ├── Create wiki-link with autocomplete
│   ├── Click wiki-link in write mode
│   ├── Create tag with autocomplete
│   ├── Click tag in write mode
│   └── Test edge cases (brackets, special chars)
├── [ ] Clean up dead code
│   ├── Remove BlockNoteEditor.tsx
│   ├── Remove Editor.tsx
│   ├── Remove extensions/ directory
│   └── Update imports
├── [ ] Run automated tests
│   └── Fix any failing tests
└── [ ] Update documentation
    ├── CHANGELOG.md
    ├── .STATUS
    └── Sprint 9 summary
```

---

## 🔧 Technical Details

### Option A: Simple Highlighting (2-3h)

**Approach:** Use textarea + div overlay for highlighting

```tsx
// src/renderer/src/components/HybridEditor.tsx

export function HybridEditor({ content, onChange, onWikiLinkClick }) {
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const highlightedContent = useMemo(() => {
    return content
      // Highlight wiki-links [[...]]
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link-highlight">[[$1]]</span>')
      // Highlight tags #tag (but not ## headings)
      .replace(/(?<![#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g, '<span class="tag-highlight">#$1</span>')
  }, [content])

  return (
    <div className="h-full flex flex-col">
      {mode === 'write' ? (
        <div className="relative h-full">
          {/* Highlight overlay */}
          <div
            ref={highlightRef}
            className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words"
            style={{ color: 'transparent' }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
              className="editor-highlighting"
            />
          </div>

          {/* Textarea on top */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            className="absolute inset-0 bg-transparent caret-white"
            spellCheck={false}
          />
        </div>
      ) : (
        <ReactMarkdown>{content}</ReactMarkdown>
      )}
    </div>
  )
}
```

**Styles:**
```css
/* src/renderer/src/index.css */
.wiki-link-highlight {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  cursor: pointer;
  text-decoration: underline;
  border-radius: 2px;
  padding: 0 2px;
}

.tag-highlight {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  cursor: pointer;
  border-radius: 2px;
  padding: 0 2px;
}
```

---

### Option D: HybridEditor++ with ContentEditable (3-4h) ⭐ Recommended

**Approach:** Replace textarea with contenteditable, use cmdk for autocomplete

```tsx
// src/renderer/src/components/HybridEditor.tsx

export function HybridEditor({ content, onChange, onWikiLinkClick }) {
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [wikiLinkTrigger, setWikiLinkTrigger] = useState<number | null>(null)
  const [tagTrigger, setTagTrigger] = useState<number | null>(null)

  // Handle input changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = (e.target as HTMLElement).innerText
    onChange(text)

    // Check for [[ trigger
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const textBeforeCursor = text.substring(0, range.startOffset)

      if (textBeforeCursor.endsWith('[[')) {
        setWikiLinkTrigger(range.startOffset - 2)
      } else {
        setWikiLinkTrigger(null)
      }

      if (textBeforeCursor.match(/(?<![#\w])#[a-zA-Z]$/)) {
        setTagTrigger(range.startOffset - 1)
      } else {
        setTagTrigger(null)
      }
    }
  }

  // Insert wiki-link
  const insertWikiLink = (title: string) => {
    const editor = document.querySelector('[contenteditable]')
    if (!editor) return

    const text = editor.innerText
    const beforeCursor = text.substring(0, tagTrigger || 0)
    const afterCursor = text.substring(cursorPosition)

    const newText = beforeCursor.replace(/\[\[.*$/, '') + `[[${title}]]` + afterCursor
    onChange(newText)
    setWikiLinkTrigger(null)
  }

  return (
    <div className="h-full flex flex-col">
      {mode === 'write' ? (
        <div className="relative h-full">
          <div
            contentEditable
            onInput={handleInput}
            className="h-full outline-none prose prose-invert max-w-none p-4"
            suppressContentEditableWarning
          >
            {content}
          </div>

          {/* Wiki-link autocomplete */}
          {wikiLinkTrigger !== null && (
            <WikiLinkAutocomplete
              position={wikiLinkTrigger}
              onSelect={insertWikiLink}
              onClose={() => setWikiLinkTrigger(null)}
            />
          )}

          {/* Tag autocomplete */}
          {tagTrigger !== null && (
            <TagAutocomplete
              position={tagTrigger}
              onSelect={insertTag}
              onClose={() => setTagTrigger(null)}
            />
          )}
        </div>
      ) : (
        <ReactMarkdown>{content}</ReactMarkdown>
      )}
    </div>
  )
}
```

---

### Autocomplete with cmdk

```tsx
// src/renderer/src/components/WikiLinkAutocomplete.tsx

import { Command } from 'cmdk'

export function WikiLinkAutocomplete({ position, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const notes = useNotesStore(state => state.notes)
  const [filteredNotes, setFilteredNotes] = useState(notes)

  useEffect(() => {
    setFilteredNotes(
      notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    )
  }, [query, notes])

  return (
    <div className="autocomplete-dropdown">
      <Command>
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search notes..."
          autoFocus
        />
        <Command.List>
          {filteredNotes.map(note => (
            <Command.Item
              key={note.id}
              value={note.title}
              onSelect={() => onSelect(note.title)}
            >
              {note.title}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
```

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `src/renderer/src/components/HybridEditor.tsx` | Add highlighting, autocomplete |
| `src/renderer/src/index.css` | Add highlighting styles |
| `src/renderer/src/components/WikiLinkAutocomplete.tsx` | New or update |
| `src/renderer/src/components/TagAutocomplete.tsx` | New or update |

## Files to Delete

| File | Reason |
|------|---------|
| `src/renderer/src/components/BlockNoteEditor.tsx` | Dead code |
| `src/renderer/src/components/Editor.tsx` | Dead code |
| `src/renderer/src/extensions/` | Dead code |

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create new note
- [ ] Type `[[` in write mode
- [ ] Autocomplete appears
- [ ] Select note from autocomplete
- [ ] Wiki-link inserted correctly
- [ ] Wiki-link appears highlighted
- [ ] Click wiki-link in write mode → navigates
- [ ] Type `#tag` in write mode
- [ ] Autocomplete appears
- [ ] Select tag from autocomplete
- [ ] Tag inserted correctly
- [ ] Tag appears highlighted
- [ ] Click tag in write mode → filters notes
- [ ] Preview mode still works
- [ ] Toggle between write/preview modes
- [ ] Edit existing note with wiki-links
- [ ] Edit existing note with tags

### Edge Cases

- [ ] Type `[[` then cancel (Esc) → autocomplete closes
- [ ] Type `[[` then continue typing → filters results
- [ ] Type `##heading` → NOT highlighted as tag
- [ ] Type `#tag` inside code block → NOT highlighted
- [ ] Nested brackets `[[note[1]]` → handled correctly
- [ ] Special characters in tag names `#tag-name_123` → handled correctly

---

## 🎯 Definition of Done

- [ ] Wiki-links work in both write and preview modes
- [ ] Tags work in both write and preview modes
- [ ] Autocomplete works for both wiki-links and tags
- [ ] Visual highlighting in write mode
- [ ] Click handlers work correctly
- [ ] Dead code removed
- [ ] Tests passing
- [ ] No console errors
- [ ] CHANGELOG updated
- [ ] .STATUS updated

---

## 📊 Metrics

| Metric | Target |
|--------|--------|
| Time | 3-4 hours |
| Autocomplete Latency | < 100ms |
| Highlighting Performance | 60fps |
| Tests Passing | 100% |

---

## 🔄 Next Steps After Sprint 9

If Sprint 9 successful:
- **Sprint 10:** Global hotkey + Command palette
- **Decision:** Keep HybridEditor or reconsider BlockNote?

If Sprint 9 unsuccessful:
- **Revisit Options B/C:** BlockNote or TipTap migration

---

## 📝 Decision Rationale

**Why Option A/D over BlockNote:**

1. **ADHD-Friendly:** Minimal UI, no distractions
2. **Fast Implementation:** 3-4h vs 6-8h
3. **Stable:** ReactMarkdown is battle-tested
4. **True to Goals:** "Distraction-free writer"
5. **Defer Complexity:** Can add BlockNote later if needed

**When to Consider BlockNote:**
- Users demand rich editing features
- Complex document formatting needed
- Block-based workflow clearly beneficial

**When to Keep HybridEditor:**
- Simple markdown writing is sufficient
- Users love minimal interface
- ADHD focus is primary goal
