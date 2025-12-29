# Brainstorm: Right Sidebar Revision

**Generated:** 2025-12-28
**Context:** Mission Control HUD - Scribe App
**Current State:** Right sidebar with tabs (Properties, Backlinks, Tags), "..." menu, "+" button

---

## Current Analysis

### What Works
- Three clear tabs (Properties, Backlinks, Tags)
- Resizable width
- Properties show key metadata
- Clean layout

### Pain Points Identified
- No right-click context menus
- Tab switching requires precise clicks
- No keyboard shortcuts for tabs
- "..." menu not immediately discoverable
- No visual feedback on hover states
- Can't collapse/expand right sidebar easily

---

## Brainstorm Ideas by Category

### 1. Context Menus & Right-Click

| Idea | Effort | Impact |
|------|--------|--------|
| **Right-click on property row** → Edit, Delete, Copy Value | Low | High |
| **Right-click on backlink** → Open, Open in New Tab, Copy Link | Low | High |
| **Right-click on tag** → Filter by Tag, Remove Tag, Rename Tag | Low | High |
| **Right-click on tab header** → Close Panel, Move Tab, Pin Tab | Med | Med |
| Right-click on sidebar background → Add Property, Collapse All | Low | Med |

### 2. Icons & Visual Improvements

| Idea | Effort | Impact |
|------|--------|--------|
| **Add icons to each tab** (📋 Properties, 🔗 Backlinks, 🏷️ Tags) | Low | High |
| **Hover states** with subtle background change | Low | High |
| **Active tab indicator** - underline or pill highlight | Low | Med |
| Property type icons (📅 date, 🔢 number, 📝 text) | Low | Med |
| Color-coded tags (inherit from tag color) | Med | High |
| Animated tab transitions | Low | Low |
| Badge counts on tabs (e.g., "Backlinks (3)") | Low | High |

### 3. Click Behaviors

| Idea | Effort | Impact |
|------|--------|--------|
| **Double-click property** → Edit inline | Low | High |
| **Double-click backlink** → Open note | Low | High |
| **Click + drag** properties to reorder | Med | Med |
| Single-click tag → Toggle filter | Low | Med |
| Click tab while active → Collapse panel | Low | Med |
| Middle-click backlink → Open in background | Low | Low |

### 4. Keyboard Shortcuts

| Shortcut | Action | Effort |
|----------|--------|--------|
| **⌘1/2/3** | Switch to Properties/Backlinks/Tags tab | Low |
| **⌘]** | Toggle right sidebar | Low |
| **Tab** | Navigate between properties | Med |
| **Enter** | Edit selected property | Low |
| **Delete** | Remove selected property/tag | Low |
| **/** | Quick add property (already planned) | Low |
| **⌘F** in sidebar | Search within current tab | Med |

### 5. ADHD-Friendly Improvements

| Idea | Effort | Impact |
|------|--------|--------|
| **Visual hierarchy** - larger text for important props | Low | High |
| **Progress indicators** - word count as progress bar | Low | High |
| **Collapsible sections** within Properties | Med | High |
| **Quick actions row** at top (most used actions) | Med | Med |
| Reduce cognitive load - hide rarely-used properties | Med | Med |
| **Streak visualization** - fire icon with animation | Low | Med |
| Color temperature for dates (red=old, green=recent) | Med | Low |

### 6. Panel Modes & Layouts

| Idea | Effort | Impact |
|------|--------|--------|
| **Icon-only mode** for right sidebar (like left) | Med | High |
| **Floating panel** option (detached from sidebar) | High | Med |
| **Bottom panel** option (horizontal layout) | High | Med |
| **Stacked tabs** (all visible, collapsed) | Med | Med |
| Mini mode (shows just icons + counts) | Med | Med |
| Full-width overlay mode for deep dives | Med | Low |

### 7. Integration Ideas

| Idea | Effort | Impact |
|------|--------|--------|
| **AI summary** in Properties (1-line description) | Med | High |
| **Related notes** section (AI-suggested) | High | High |
| **Graph preview** in Backlinks tab | High | Med |
| Quick capture to current note | Low | Med |
| Share/export options in Properties | Med | Med |
| Version history in Properties | High | Med |

---

## Top Recommendations

### Quick Wins (< 2 hours each)

1. **Add right-click context menus** to properties, backlinks, and tags
   - Follow the same pattern as left sidebar context menus
   - Immediate usability improvement

2. **Add icons to tabs** with badge counts
   ```
   📋 Properties (3)  |  🔗 Backlinks (5)  |  🏷️ Tags (2)
   ```

3. **Keyboard shortcuts for tabs** (⌘1/2/3)
   - Already have keyboard handler in App.tsx
   - Quick addition

4. **Double-click to edit** properties inline
   - Natural interaction pattern
   - Reduces clicks

### Medium Effort (Half day each)

5. **Icon-only collapsed mode** for right sidebar
   - Mirrors left sidebar pattern
   - Just show: 📋 🔗 🏷️ vertically
   - Click to expand

6. **Collapsible sections** in Properties
   - Group: Metadata, Custom, Stats
   - Remember collapsed state

### Strategic (Future sprints)

7. **AI-powered features** (Related notes, summaries)
8. **Graph preview** in Backlinks

---

## Recommended Implementation Order

```
Phase 1: Context Menus (matches left sidebar work just done)
├── PropertyContextMenu.tsx
├── BacklinkContextMenu.tsx
└── TagContextMenu.tsx

Phase 2: Visual Polish
├── Tab icons + badges
├── Hover states
└── Double-click behaviors

Phase 3: Keyboard Navigation
├── Tab shortcuts (⌘1/2/3)
├── Toggle sidebar (⌘])
└── Property navigation

Phase 4: Advanced Modes
├── Icon-only mode
└── Collapsible sections
```

---

## Technical Notes

### Files to Modify
- `App.tsx` - Keyboard shortcuts, sidebar state
- `PropertiesPanel.tsx` - Context menu, double-click
- `BacklinksPanel.tsx` - Context menu
- `TagsPanel.tsx` - Context menu
- New: `PropertyContextMenu.tsx`
- New: `BacklinkContextMenu.tsx`
- CSS: Tab styling, hover states

### Existing Patterns to Follow
- `ProjectContextMenu.tsx` - Portal-based context menu
- `NoteContextMenu.tsx` - Menu items structure
- `useAppViewStore.ts` - Sidebar mode state

---

## Questions for User

1. Which tab do you use most? (Properties/Backlinks/Tags)
2. Do you want icon-only mode for right sidebar?
3. Priority: Context menus vs keyboard shortcuts vs visual polish?
4. Any specific property types you want better support for?

---

*Save this brainstorm: `/BRAINSTORM-RIGHT-SIDEBAR.md`*
