# Scribe Component Reference

> React component documentation — v1.20.0
>
> **Last Updated:** 2026-02-24

---

## Core Components

### App.tsx

Main application component. Manages:
- Note selection and editing
- Sidebar visibility
- Focus mode
- Keyboard shortcuts (delegated to `KeyboardShortcutHandler`)
- User preferences via `usePreferences()` hook
- Pomodoro timer integration
- Tab management

**Key State:** Managed via Zustand stores (`useNotesStore`, `useAppViewStore`, `useProjectStore`, `usePomodoroStore`, `useSettingsStore`).

**Keyboard Handlers:** Delegated to `KeyboardShortcutHandler.tsx` — 27 registered shortcuts.

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

### MissionSidebar (sidebar/)

Icon-centric sidebar system introduced in v1.16. Replaces the original Ribbon.

**Structure:**
- `MissionSidebar.tsx` — Container orchestrating IconBar + ExpandedIconPanel
- `IconBar.tsx` — 48px icon column (always visible): pinned vaults, smart icons, system icons
- `ExpandedIconPanel.tsx` — Collapsible panel showing note list, search, graph preview
- `SmartIconButton.tsx` — Typed project shortcut icons (`⌘⇧1`–`⌘⇧4`)
- `ActivityBar.tsx` — Activity indicator dots
- `StatusDot.tsx` — Project status indicators
- `InboxButton.tsx` — Quick inbox access
- `ProjectAvatar.tsx` — Project type icon rendering
- `CompactListView.tsx` / `CardGridView.tsx` — Two note list display styles

**25+ components** in `src/renderer/src/components/sidebar/`

**File:** `src/renderer/src/components/sidebar/MissionSidebar.tsx`

---

### SettingsModal (Settings/)

Application settings dialog with 12 sub-components.

**Tabs:**
1. **General** — App settings, Pomodoro timer config, writing goals
2. **Editor** — Font, size, line height, editor mode
3. **Appearance** — Themes (10 built-in), custom CSS, auto-theme, icon glow, UI style

**Key Sub-components:**
- `GeneralSettingsTab.tsx` — General preferences + Pomodoro settings
- `EditorSettingsTab.tsx` — Editor preferences
- `ThemeGallery.tsx` — Visual theme browser
- `PinnedVaultsSettings.tsx` — Manage pinned sidebar vaults
- `QuickActionsSettings.tsx` — Configure AI quick actions
- `ProjectTemplates.tsx` — Project type templates
- `SettingsToggle.tsx` — Reusable toggle switch (WCAG accessible)
- `SettingsSection.tsx` — Consistent section wrapper
- `ContextualHint.tsx` — Inline settings guidance

**File:** `src/renderer/src/components/SettingsModal.tsx` (prop-based, used by App.tsx)
**Unused:** `src/renderer/src/components/Settings/SettingsModal.tsx` (store-based, not imported)

---

### SettingsToggle.tsx

Reusable toggle switch for boolean settings.

**Props:**
```typescript
interface SettingsToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
  testId?: string
}
```

**Features:**
- Consistent label + description layout
- Animated toggle knob (accent color when on)
- WCAG accessible: `role="switch"`, `aria-checked`, `aria-label`
- Used by `GeneralSettingsTab` and `EditorSettingsTab`

**File:** `src/renderer/src/components/Settings/SettingsToggle.tsx`

---

### usePreferences (Hook)

Cached preferences hook with event-based sync.

**Returns:**
```typescript
{
  prefs: UserPreferences     // Current preferences (cached)
  updatePref(key, value)     // Update a single preference
  togglePref(key)            // Toggle a boolean preference
}
```

**Behavior:**
- Reads `localStorage` once on mount, caches in React state
- Listens for `preferences-changed` events to stay in sync across components
- Write-through: `updatePref` / `togglePref` immediately persist to `localStorage`

**File:** `src/renderer/src/hooks/usePreferences.ts`

---

### KeyboardShortcutHandler.tsx

Global keyboard shortcut handler (extracted from App.tsx).

**Features:**
- Handles 25 registered shortcuts
- Uses `matchesShortcut(event, shortcutId)` for registry-based event matching
- Manages Tauri menu registration

**File:** `src/renderer/src/components/KeyboardShortcutHandler.tsx`

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

## Additional Components (v1.16+)

| Component | Purpose |
|-----------|---------|
| `EditorOrchestrator.tsx` | Routes to correct editor mode (source/live/reading) |
| `EditorTabs/EditorTabs.tsx` | Tab bar with pin, reorder, close, reopen |
| `PomodoroTimer.tsx` | Status bar Pomodoro timer (v1.19) |
| `GraphView.tsx` | D3 force-directed knowledge graph |
| `TerminalPanel.tsx` | Embedded xterm.js terminal |
| `ClaudePanel.tsx` / `ClaudeChatPanel.tsx` | AI chat integration |
| `QuickCaptureOverlay.tsx` | `⌘⇧C` quick note capture modal |
| `CreateProjectModal.tsx` | New project creation dialog |
| `EditProjectModal.tsx` | Project editing dialog |
| `ProjectsPanel.tsx` | Project management view |
| `WritingProgress.tsx` | Word count goal progress |
| `StreakDisplay.tsx` | Writing streak visualization |
| `QuickActions.tsx` | AI quick action commands |
| `SearchPanel.tsx` | Full search interface |
| `DashboardShell.tsx` | Dashboard layout container |
| `Toast.tsx` | Notification toasts |
| `IconPicker.tsx` | Icon selection UI |

---

## Testing

76 test files with 2,280+ tests (Vitest + Testing Library + happy-dom).

**Run tests:**
```bash
npm test
```
