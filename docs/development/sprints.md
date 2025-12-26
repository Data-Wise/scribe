# Sprint Planning

Scribe follows a sprint-based development approach with ~4-8 hour sprints.

## Current Status

**Progress:** 80% complete (48h / 60h estimated)
**Tests:** 407 passing

## Sprint Overview

| Phase | Sprint | Focus | Hours | Status |
|-------|--------|-------|-------|--------|
| **1** | 8 | Editor Foundation | 4h | ✅ Complete |
| 1 | 9 | Editor Enhancement | 4h | ✅ Complete |
| 1 | 10 | Hotkey + Commands | 6h | ✅ Complete |
| 1 | 10.5 | Theme & Font System | 4h | ✅ Complete |
| **2** | 11 | Academic Features | 8h | ⏳ Next |
| 2 | 12 | Obsidian Sync | 8h | Pending |
| **3** | 13 | LaTeX/PDF/Word Export | 6h | Pending |
| 3 | 14 | Quarto | 6h | Pending |
| **4** | 15 | Project System | 8h | Pending |
| 4 | 16 | Templates + Daily | 4h | Pending |
| **5** | 17 | Search + Goals | 4h | Pending |

## Completed Sprints

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

### Sprint 11: Academic Features

- [ ] Zotero integration
- [ ] Citation autocomplete (@cite)
- [ ] KaTeX equation blocks
- [ ] Bibliography rendering

### Sprint 12: Obsidian Sync

- [ ] Export notes to vault
- [ ] Sync settings
- [ ] Conflict handling

### Sprint 13-14: Export

- [ ] Pandoc integration
- [ ] LaTeX export
- [ ] PDF export
- [ ] Word export
- [ ] Quarto rendering

### Sprint 15-16: Projects

- [ ] Project switcher UI
- [ ] Project settings (project.json)
- [ ] Project templates
- [ ] Daily notes system

### Sprint 17: Polish

- [ ] Writing goals
- [ ] Streak tracking
- [ ] Note search improvements

## Feature Tiers

### Tier 1: MVP ✅

- HybridEditor
- Focus Mode
- Dark Mode
- Auto-Save
- Wiki Links
- Tags
- Word Count
- Global Hotkey

### Tier 2: Core ⏳

- Claude CLI
- Gemini CLI
- Command Palette
- Obsidian Sync

### Tier 3: Academic

- Zotero Integration
- Citation Autocomplete
- Equation Blocks
- Export (LaTeX/PDF/Word)

### Tier 4: Projects

- Project Switcher
- Project Settings
- Project Templates
- Daily Notes

### Deferred to v2

- Terminal (xterm.js)
- Graph View
- Multi-tab Editing
- File Tree Browser

### Never Build

- API-based AI (no keys)
- Plugin system
- Mobile app
- Cloud sync
