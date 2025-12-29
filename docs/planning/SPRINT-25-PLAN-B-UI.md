# Sprint 25: Plan B UI Redesign

**Status:** 🔄 In Progress
**Started:** 2025-12-28
**Version:** v1.6.0

---

## Overview

Implementing "Plan B" from the UI redesign brainstorm:
- **Obsidian-style** file tree sidebar
- **Gradient accent tabs** (Style 5) for editor
- **Pinned Mission Control** as home tab
- **VS Code-style** status bar

**Design Document:** `SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md`

---

## Phases

### Phase 1: Editor Tabs ✅ COMPLETE (2025-12-28)

| Task | Status | Notes |
|------|--------|-------|
| Create EditorTabs component | ✅ | Gradient accent bar |
| Add tab state to useAppViewStore | ✅ | Full CRUD + persistence |
| Integrate into App.tsx | ✅ | Replaces fixed header |
| Mission Control pinned tab | ✅ | Cannot be closed |
| Keyboard shortcuts (⌘1-9, ⌘W) | ✅ | Tab switching + close |
| Middle-click to close | ✅ | Non-pinned only |

**Files Created:**
- `src/renderer/src/components/EditorTabs/EditorTabs.tsx`
- `src/renderer/src/components/EditorTabs/EditorTabs.css`
- `src/renderer/src/components/EditorTabs/index.ts`

**Files Modified:**
- `src/renderer/src/store/useAppViewStore.ts` (tab state)
- `src/renderer/src/App.tsx` (integration + shortcuts)

---

### Phase 2: Vault Sidebar ⏳ PENDING

Transform MissionSidebar into Obsidian-style file tree.

| Task | Status | Notes |
|------|--------|-------|
| Create VaultSidebar component | ⏳ | Replace MissionSidebar |
| Collapsible vault sections | ⏳ | Expand/collapse vaults |
| Folder tree within vaults | ⏳ | Nested file structure |
| Permanent Inbox section | ⏳ | Always visible at top |
| Drag files between vaults | ⏳ | Move notes |
| Right-click context menus | ⏳ | Vault/folder/note actions |
| Badge counts | ⏳ | Item counts |

**Files to Create:**
- `src/renderer/src/components/sidebar/VaultSidebar/VaultSidebar.tsx`
- `src/renderer/src/components/sidebar/VaultSidebar/VaultSection.tsx`
- `src/renderer/src/components/sidebar/VaultSidebar/FolderTree.tsx`
- `src/renderer/src/components/sidebar/VaultSidebar/InboxSection.tsx`

---

### Phase 3: Status Bar ⏳ PENDING

Add VS Code-style horizontal bottom status bar.

| Task | Status | Notes |
|------|--------|-------|
| Create StatusBar component | ⏳ | Horizontal bottom bar |
| Sync status indicator | ⏳ | ● Connected / ○ Offline |
| Writing streak display | ⏳ | 🔥 7 day streak |
| Words today counter | ⏳ | 📊 1,247 |
| Session time | ⏳ | ⏱️ 2h 15m |
| Editor mode indicator | ⏳ | Source / Live / Reading |

**Files to Create:**
- `src/renderer/src/components/StatusBar/StatusBar.tsx`
- `src/renderer/src/components/StatusBar/SyncStatus.tsx`
- `src/renderer/src/components/StatusBar/StreakIndicator.tsx`
- `src/renderer/src/components/StatusBar/WordCount.tsx`

---

### Phase 4: Mission Control Updates ⏳ PENDING

Update dashboard content and pinned tab behavior.

| Task | Status | Notes |
|------|--------|-------|
| Quick action buttons | ⏳ | Today, New, Capture, Vault |
| Recent pages list | ⏳ | Last 5 accessed |
| Writing stats panel | ⏳ | Streak, words, session |
| Inbox preview | ⏳ | Unprocessed items |
| Active projects section | ⏳ | Current work |
| ⌘1 shortcut | ⏳ | Always goes to Mission Control |
| Refresh on active click | ⏳ | Update dashboard |

---

## Keyboard Shortcuts (Implemented)

| Shortcut | Action | Status |
|----------|--------|--------|
| ⌘1-9 | Switch to tab by position | ✅ |
| ⌘W | Close current tab (non-pinned) | ✅ |
| ⌘0 | Cycle sidebar mode | ✅ (existing) |
| ⌘⇧T | Reopen closed tab | ⏳ |
| ⌘Tab | Cycle through tabs | ⏳ |

---

## Progress Summary

| Phase | Progress | Status |
|-------|----------|--------|
| Phase 1: Editor Tabs | 100% | ✅ Complete |
| Phase 2: Vault Sidebar | 0% | ⏳ Next |
| Phase 3: Status Bar | 0% | ⏳ Pending |
| Phase 4: Mission Control | 0% | ⏳ Pending |
| **Overall** | **25%** | **In Progress** |

---

## Design Decisions

1. **Style 5 (Gradient Tabs)** - Modern look with project-colored accent
2. **Mission Control Pinned** - Always accessible home base
3. **Obsidian File Tree** - Familiar pattern for PKM users
4. **VS Code Status Bar** - Information density without clutter

---

## Related Documents

- `SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md` - Full design schematic
- `BRAINSTORM-RIGHT-SIDEBAR.md` - Right panel design
- `BRAINSTORM-TAURI-TO-SWIFTUI.md` - Native port planning

---

## After This Sprint

| Next | Priority | Document |
|------|----------|----------|
| Playwright E2E Testing | P2 | `FUTURE-PLAYWRIGHT-E2E.md` |
| SwiftUI Native Port | P3 | `BRAINSTORM-TAURI-TO-SWIFTUI.md` |

---

*Created: 2025-12-28*
*Last Updated: 2025-12-28*
