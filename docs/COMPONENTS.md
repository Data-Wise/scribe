# Scribe Component Reference

> React component documentation

---

## Core Components

### App.tsx

Main application component. Manages:
- Note selection and editing
- Sidebar visibility
- Focus mode
- Keyboard shortcuts

**Key State:**
```typescript
selectedNoteId: string | null
focusMode: boolean
leftSidebarCollapsed: boolean
rightSidebarCollapsed: boolean
editorMode: 'write' | 'preview'
```

**Keyboard Handlers:**
- `⌘N` → Create new note
- `⌘D` → Open daily note
- `⌘⇧F` → Toggle focus mode
- `⌘K` → Open command palette

---

### HybridEditor.tsx

Custom markdown editor with live highlighting.

**Props:**
```typescript
interface HybridEditorProps {
  content: string
  onChange: (content: string) => void
  onWikiLinkClick?: (title: string) => void
  onTagClick?: (tagName: string) => void
  onSearchNotes?: (query: string) => Promise<Note[]>
  onSearchTags?: (query: string) => Promise<Tag[]>
  placeholder?: string
  initialMode?: 'write' | 'preview'
}
```

**Features:**
- Live `[[wiki-link]]` highlighting
- Live `#tag` highlighting
- Mode toggle (⌘E)
- Word count display
- Cursor-following autocomplete

**File:** `src/renderer/src/components/HybridEditor.tsx`

---

### EmptyState.tsx

Engaging empty state shown when no note is selected.

**Props:**
```typescript
interface EmptyStateProps {
  onCreateNote: () => void
  onOpenDaily: () => void
  onOpenCommandPalette: () => void
}
```

**Features:**
- Animated pen icon (CSS keyframes)
- "Ready to write" heading
- Quick action buttons (New Note, Daily Note)
- Random inspirational quote
- Keyboard shortcut hints

**File:** `src/renderer/src/components/EmptyState.tsx`

---

### CommandPalette.tsx

⌘K quick actions menu.

**Props:**
```typescript
interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
  notes: Note[]
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDailyNote: () => void
  onToggleFocus: () => void
  onObsidianSync: () => void
  onRunClaude: () => void
  onRunGemini: () => void
}
```

**Commands:**
| Command | Shortcut | Description |
|---------|----------|-------------|
| New Note | ⌘N | Create blank note |
| Daily Note | ⌘D | Open today's daily |
| Focus Mode | ⌘⇧F | Toggle focus |
| Obsidian Sync | - | Export to vault |
| Ask Claude | - | AI assistance |
| Ask Gemini | - | AI assistance |

**File:** `src/renderer/src/components/CommandPalette.tsx`

---

### Ribbon.tsx

Left icon bar with navigation buttons.

**Props:**
```typescript
interface RibbonProps {
  onToggleLeft: () => void
  onToggleRight: () => void
  onSearch: () => void
  onSettings: () => void
  leftCollapsed: boolean
  rightCollapsed: boolean
}
```

**Icons:**
- Files (toggle left sidebar)
- Search
- Tags (toggle right sidebar)
- Stats
- Settings

**Features:**
- CSS tooltips on hover
- Keyboard shortcut hints
- Active state highlighting

**File:** `src/renderer/src/components/Ribbon.tsx`

---

### SettingsModal.tsx

Application settings dialog.

**Tabs:**
1. **General** - App settings
2. **Editor** - Font, size, line height
3. **Appearance** - Themes, custom creator

**Theme System:**
- 10 built-in themes (5 dark, 5 light)
- Custom theme creator with live preview
- Import/export (JSON, Base16 YAML, URL)
- Keyboard shortcuts (⌘Alt+0-9)

**Font System:**
- 14 ADHD-friendly font recommendations
- One-click Homebrew installation
- Font preview

**File:** `src/renderer/src/components/SettingsModal.tsx`

---

## Autocomplete Components

### SimpleWikiLinkAutocomplete.tsx

Autocomplete for `[[wiki-links]]`.

**Props:**
```typescript
interface Props {
  position: { top: number; left: number }
  query: string
  onSelect: (title: string) => void
  onClose: () => void
  searchNotes: (query: string) => Promise<Note[]>
}
```

**Behavior:**
- Appears when typing `[[`
- Follows cursor position
- Searches note titles
- Enter selects, Escape closes

---

### SimpleTagAutocomplete.tsx

Autocomplete for `#tags`.

**Props:**
```typescript
interface Props {
  position: { top: number; left: number }
  query: string
  onSelect: (tagName: string) => void
  onClose: () => void
  searchTags: (query: string) => Promise<Tag[]>
}
```

**Behavior:**
- Appears when typing `#`
- Shows existing tags
- Creates new tag on select if not exists

---

### CitationAutocomplete.tsx

Autocomplete for `@citations`.

**Props:**
```typescript
interface Props {
  position: { top: number; left: number }
  query: string
  onSelect: (key: string) => void
  onClose: () => void
}
```

**Behavior:**
- Appears when typing `@`
- Searches BibTeX entries
- Shows author, year, title
- Requires bibliography path set

---

## Sidebar Components

### TagsPanel.tsx

Right sidebar tag management.

**Features:**
- Tag list with counts
- Tag color picker
- Rename/delete tags
- Filter notes by tag

---

### BacklinksPanel.tsx

Right sidebar backlinks display.

**Features:**
- Shows notes linking to current note
- Click to navigate
- Shows link count

---

### PropertiesPanel.tsx

Right sidebar note properties.

**Standard Properties:**
- Status (draft, in-progress, review, complete)
- Type (note, daily, meeting, research, etc.)
- Priority (high, medium, low)
- Progress (0-100)
- Due date
- Word goal

---

### TagFilter.tsx

Active tag filter display.

**Props:**
```typescript
interface Props {
  selectedTags: Tag[]
  onRemoveTag: (id: string) => void
  onClearAll: () => void
}
```

---

## Academic Components

### MathRenderer.tsx

KaTeX math rendering component.

**Props:**
```typescript
interface Props {
  content: string
}
```

**Supported:**
- Inline math: `$...$`
- Display math: `$$...$$`
- Error handling for invalid LaTeX

---

### ExportDialog.tsx

Pandoc export dialog.

**Export Formats:**
- PDF
- Word (.docx)
- LaTeX (.tex)
- HTML

**Citation Styles:**
- APA
- Chicago
- MLA
- IEEE
- Harvard

---

## Utility Components

### SearchBar.tsx

Note search input.

**Props:**
```typescript
interface Props {
  onSearch: (query: string) => void
  onClear: () => void
}
```

---

### HighlightedText.tsx

Search result highlighting.

---

### SearchResults.tsx

Search results display.

---

## CSS Classes

### Micro-interactions

```css
/* Button press feedback */
.btn-interactive:active:not(:disabled) {
  transform: scale(0.95);
}

/* Ribbon button feedback */
.ribbon-button:active:not(:disabled) {
  transform: scale(0.92);
}

/* Tooltip system */
.tooltip-trigger::after {
  content: attr(data-tooltip);
  /* ... positioning ... */
}
```

### Animations

```css
/* Pen writing animation */
@keyframes penWrite {
  0%, 100% { transform: rotate(-5deg) translateY(0); }
  50% { transform: rotate(5deg) translateY(-2px); }
}

/* Pulse glow */
@keyframes pulseSlow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}
```

### Accessibility

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .btn-interactive, .ribbon-button, ... {
    transition: none !important;
    animation: none !important;
  }
}
```

---

## Testing

All components have corresponding test files in `src/renderer/src/__tests__/`:

| Component | Test File | Tests |
|-----------|-----------|-------|
| HybridEditor | HybridEditor.test.tsx | 37 |
| CommandPalette | CommandPalette.test.tsx | 24 |
| Tags | Tags.test.tsx | 52 |
| Components | Components.test.tsx | 16 |
| Integration | Integration.test.tsx | 32 |

**Run tests:**
```bash
npm test
```
