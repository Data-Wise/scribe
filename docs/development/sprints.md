# Sprint Planning

Scribe follows a sprint-based development approach with ~4-8 hour sprints.

## Current Status

**Progress:** 92% complete
**Tests:** 483 passing
**Current Sprint:** 16 Complete
**Next Sprint:** 17 - Tags Visual Improvements

## Sprint Overview

| Phase | Sprint | Focus | Hours | Status |
|-------|--------|-------|-------|--------|
| **1** | 8 | Editor Foundation | 4h | ✅ Complete |
| 1 | 9 | Editor Enhancement | 4h | ✅ Complete |
| 1 | 10 | Hotkey + Commands | 6h | ✅ Complete |
| 1 | 10.5 | Theme & Font System | 4h | ✅ Complete |
| **2** | 11 | Academic Features | 8h | ✅ Complete |
| 2 | 12 | UI Polish & Micro-interactions | 4h | ✅ Complete |
| **3** | 13 | Preferences & Keyboard | 4h | ✅ Complete |
| 3 | 14 | Knowledge Graph & Templates | 6h | ✅ Complete |
| **4** | 15 | Tags Panel Quick Wins | 4h | ✅ Complete |
| 4 | 16 | Tags Panel Core Features | 4h | ✅ Complete |
| **5** | 17 | Tags Visual Improvements | 4h | ○ Next |

## Completed Sprints

### Sprint 16: Tags Panel Core Features ✅

- Orphan tag detection (scans notes for unregistered `#tags`)
- Unregistered Tags section with warning styling
- Register single/all tags buttons
- Right-click context menu (Rename/Delete)
- Tag-YAML sync (inline #tags sync to properties.tags)
- Hierarchical tag regex fix (supports `/` in paths)

### Sprint 15: Tags Panel Quick Wins ✅

- Search/filter bar with real-time filtering
- Recent tags section (tracks last 8, shows top 5)
- Compact mode toggle (reduces padding/fonts)

### Sprint 14: Knowledge Graph & Templates ✅

- Knowledge Graph visualization (D3 force-directed)
- Daily Notes templates (5 built-in + custom)
- Markdown export with frontmatter
- Tag hierarchy (path notation: `research/statistics`)
- Backlinks panel improvements

### Sprint 13: Preferences & Keyboard ✅

- User preferences system (localStorage)
- Writing streak tracking
- Enhanced keyboard shortcuts
- Zotero citation integration
- Export improvements

### Sprint 12: UI Polish & Micro-interactions ✅

- EmptyState component with animated pen icon
- Button press feedback (scale animations)
- Sidebar tooltips with keyboard shortcuts
- `prefers-reduced-motion` support
- Daily note template fix (HTML → Markdown)

### Sprint 11: Academic Features ✅

- KaTeX for math rendering (replaced MathJax)
- Theme colors apply to editor area
- 10 built-in themes (5 dark, 5 light)
- 14 ADHD-friendly font recommendations

### Sprint 10.5: Theme & Font System ✅

- 10 built-in themes (5 dark, 5 light)
- Auto-theme by time of day
- Custom theme creator
- Theme import/export (JSON + Base16 YAML)
- Theme keyboard shortcuts (Cmd+Alt+0-9)
- Font settings (family, size, line height)
- 14 ADHD-friendly font recommendations
- One-click Homebrew font installation
- **101 new tests** → 407 total

### Sprint 10: Global Hotkey + Commands ✅

- Global hotkey ⌘⇧N opens app
- Command palette ⌘K with 6 actions
- Autocomplete cursor positioning
- Accessibility improvements
- **31 new tests** → 300 total

### Sprint 9: Editor Enhancement ✅

- Wiki-link autocomplete
- Tag autocomplete
- Live highlighting
- Cursor-following popups

### Sprint 8: Editor Foundation ✅

- HybridEditor with write/preview modes
- Focus mode (⌘⇧F)
- Word count
- Auto-save

## Upcoming Sprints

### Sprint 17: Tags Visual Improvements

- [ ] Tag cloud view (size-based frequency visualization)
- [ ] Tag icons/emoji (optional per tag)
- [ ] Connecting lines (tree view indentation guides)
- [ ] Color picker (click dot to change tag color)

### Sprint 18: Power User Features

- [ ] Bulk operations (multi-select tags for batch operations)
- [ ] Keyboard shortcuts (`t` to focus panel, `/` to search)
- [ ] Tag merging (select multiple → merge into one)
- [ ] Exclusion filters (notes WITHOUT certain tags)

### Sprint 19: Advanced Features

- [ ] AI tag suggestions (based on note content)
- [ ] Tag templates (preset groups for project types)
- [ ] Tag statistics (last used, growth over time)
- [ ] Tag relationships (often used together)

## Feature Tiers

### Tier 1: MVP ✅

- HybridEditor
- Focus Mode
- Dark Mode
- Auto-Save
- Wiki Links
- Tags (with panel, search, recent, orphan detection)
- Word Count
- Global Hotkey

### Tier 2: Core ✅

- Claude CLI
- Gemini CLI
- Command Palette
- Writing goals & streaks

### Tier 3: Academic ✅

- Zotero Integration
- Citation Autocomplete
- KaTeX Equation Blocks
- Export (LaTeX/PDF/Word)

### Tier 4: Knowledge ✅

- Knowledge Graph (D3)
- Daily Notes with Templates
- Backlinks Panel
- Tag Hierarchy

### Deferred to v2

- Terminal (xterm.js)
- Multi-tab Editing
- File Tree Browser
- Project System

### Never Build

- API-based AI (no keys)
- Plugin system
- Mobile app
- Cloud sync
