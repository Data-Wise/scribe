# Next Steps - Mission Control HUD

## UI Redesign: Plan B (Obsidian Style) 🎨 NEW

**Decision:** Plan B selected - Obsidian-style file tree + Gradient tabs + Pinned Mission Control
**See:** `SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md` for full details

### Phase 1: Editor Tabs (Priority 1)
- [ ] Create `EditorTabs` component with gradient accent style
- [ ] Add tab state to `useAppViewStore` (openTabs, activeTab, pinnedTabs)
- [ ] Integrate tabs into `App.tsx` layout
- [ ] Implement pinned Mission Control (always first, cannot close)
- [ ] Add keyboard shortcuts (⌘1-9, ⌘W, ⌘⇧T)
- [ ] Tab context menu (Close, Pin, Duplicate, etc.)

### Phase 2: Vault Sidebar (Priority 2)
- [ ] Rename Projects → Vaults throughout codebase
- [ ] Create `VaultSidebar` component (Obsidian-style tree)
- [ ] Add permanent Inbox section (cannot delete)
- [ ] Collapsible vault sections with folder trees
- [ ] Drag-and-drop between vaults/folders
- [ ] Right-click context menus

### Phase 3: Status Bar (Priority 3)
- [ ] Create bottom `StatusBar` component
- [ ] Sync status indicator (●/○)
- [ ] Writing streak display (🔥)
- [ ] Words today counter (📊)
- [ ] Session time tracker (⏱️)

### Phase 4: Mission Control Updates (Priority 4)
- [ ] Update dashboard for tabbed view
- [ ] Quick action buttons (Today, New Page, Capture, New Vault)
- [ ] Inbox preview section
- [ ] Active projects widget

---

## Testing (Browser Mode) ✅ Complete

- [x] Test creating a new note (⌘N) - Fixed project assignment bug
- [x] Test the Settings modal (⌘, or click gear icon) - Working
- [x] Try the "Clear All Data" / "Restore Demo Data" in Settings → General → Browser Mode - Working
- [x] PWA configuration verified (manifest, service worker, icons)
- [x] Offline mode tested - App works fully offline after first load
- [x] Context menus - Fixed for Card View Mode

## Testing (Desktop Mode)

- [ ] Run `npm run dev` to test Tauri desktop mode
- [ ] Verify Claude/Gemini AI features work (desktop only)
- [ ] Test Obsidian sync functionality (desktop only)
- [ ] Compare behavior between browser and desktop modes

## PR & Merge

- [ ] Create PR from `feat/mission-control-hud` to `main`
- [ ] Review all commits in the branch
- [ ] Merge after approval

## Future Enhancements

- [ ] Add E2E tests with Playwright or Cypress
- [ ] Add more edge case tests for error handling
- [ ] Consider adding data export/import for browser mode
- [ ] Add service worker update notifications
- [ ] Improve PWA offline experience with better caching strategies

## Dev Server

Running on: `http://localhost:5180`
Start command: `npm run dev:vite -- --port 5180`

---
*Updated: 2025-12-28*
