# Tab System Proposal: Pinned Mission Control + Editor Tabs

**Generated:** 2025-12-27
**Branch:** wonderful-wilson
**Scope:** Major architectural change

---

## Current State

```
┌─────────────────────────────────────────────────────────┐
│  [Sidebar]  │  [Single View: MissionControl OR Editor]  │
└─────────────────────────────────────────────────────────┘
```

- No note selected → Shows MissionControl
- Note selected → Shows Editor (MissionControl hidden)
- User must navigate back/forth

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Tab Bar]                                                          │
│  🏠 Home │ 📄 Chapter 1 │ 📄 Methods │ 📄 Literature Review  [+]   │
├─────────────────────────────────────────────────────────────────────┤
│  [Sidebar]  │  [Active Tab Content]                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Tab Types

| Tab Type | Icon | Closable | Pinned | Content |
|----------|------|----------|--------|---------|
| **Home** | 🏠 | No | Yes (always first) | Mission Control |
| **Editor** | 📄 | Yes (×) | No | Note editor |

---

## Behavior Specification

### Home Tab (Pinned)
- Always visible as first tab
- Cannot be closed or moved
- Shows Mission Control dashboard
- Clicking "Continue Writing" opens note in new tab
- Clicking project cards opens filtered view (stays on Home)

### Editor Tabs
- Open when note is selected (from sidebar, search, wiki-link, etc.)
- Show note title (truncated if long)
- Close button (×) on hover
- Middle-click to close
- Drag to reorder
- Context menu: Close, Close Others, Close All

### Tab Opening Behavior
- **From Home (Continue Writing)**: Open in new tab, switch to it
- **From Sidebar**: Open in new tab if not already open, else switch to existing
- **From Wiki-link**: Open in new tab, switch to it
- **⌘+click**: Open in background tab (don't switch)

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| ⌘1 | Go to Home tab |
| ⌘2-9 | Go to tab 2-9 |
| ⌘W | Close current tab (if editor) |
| ⌘⇧T | Reopen last closed tab |
| ⌃Tab | Next tab |
| ⌃⇧Tab | Previous tab |

---

## State Management

### New Store: `useTabStore.ts`

```typescript
interface Tab {
  id: string                    // Unique tab ID
  type: 'home' | 'editor'
  noteId?: string               // For editor tabs
  title: string                 // Display title
  isPinned: boolean
  isDirty: boolean              // Unsaved changes indicator
}

interface TabState {
  tabs: Tab[]
  activeTabId: string
  closedTabs: Tab[]             // For ⌘⇧T reopen

  // Actions
  openTab: (noteId: string) => void
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  closeAllTabs: () => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  reopenLastClosed: () => void
}
```

### localStorage Persistence
- `scribe:openTabs` - Array of tab IDs
- `scribe:activeTab` - Current active tab
- `scribe:tabOrder` - Tab positions

---

## Component Structure

### New Components

```
src/renderer/src/components/
├── tabs/
│   ├── TabBar.tsx           # Tab bar container
│   ├── Tab.tsx              # Individual tab
│   ├── HomeTab.tsx          # Pinned home tab (special styling)
│   ├── EditorTab.tsx        # Note editor tab
│   └── TabContextMenu.tsx   # Right-click menu
```

### Modified Components

| Component | Changes |
|-----------|---------|
| `App.tsx` | Add TabBar, route content based on active tab |
| `MissionControl.tsx` | No changes (just rendered in Home tab) |
| `HybridEditor.tsx` | No changes (just rendered in Editor tabs) |

---

## Visual Design

### Tab Bar Styling

```css
.tab-bar {
  height: 36px;
  background: var(--nexus-bg-secondary);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 2px;
  overflow-x: auto;
}

.tab {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  max-width: 200px;
}

.tab.active {
  background: var(--nexus-bg-primary);
}

.tab.pinned {
  padding-left: 8px;
}

.tab .close-btn {
  opacity: 0;
  transition: opacity 0.15s;
}

.tab:hover .close-btn {
  opacity: 1;
}
```

### Tab States

| State | Visual |
|-------|--------|
| Default | Transparent background |
| Hover | Subtle highlight |
| Active | Matches editor background |
| Dirty | Dot indicator before title |
| Pinned | No close button, icon only |

---

## Implementation Plan

### Phase 1: Core Tab System (4-6 hours)
1. Create `useTabStore.ts`
2. Create `TabBar.tsx` and `Tab.tsx`
3. Integrate into `App.tsx`
4. Basic open/close/switch functionality

### Phase 2: Tab Persistence (2 hours)
1. Save open tabs to localStorage
2. Restore tabs on app launch
3. Remember active tab

### Phase 3: Advanced Features (3-4 hours)
1. Tab reordering (drag & drop)
2. Context menu (close others, close all)
3. Reopen closed tab (⌘⇧T)
4. Tab overflow handling

### Phase 4: Polish (2 hours)
1. Dirty indicator
2. Tab animations
3. Keyboard shortcuts
4. Edge cases (close last tab → show Home)

---

## ADHD Considerations

### Benefits
- **Context preservation** - Keep multiple notes open, switch freely
- **Visible state** - See all open work at a glance
- **Quick navigation** - ⌘1-9 to jump between notes
- **Safe home base** - Home tab always there for grounding

### Potential Concerns
- **Tab overload** - Could lead to too many open tabs
  - Mitigation: Limit to 10 tabs, warn before opening more
- **Visual clutter** - Tab bar adds UI element
  - Mitigation: Minimal design, auto-hide option?

---

## Alternatives Considered

### 1. Split Panes Instead of Tabs
- Editor takes left pane, Mission Control in right pane
- Rejected: Takes too much horizontal space

### 2. Overlay Home (like browser new tab)
- Home shows as overlay, editor beneath
- Rejected: Complex, confusing layering

### 3. Keep Current (Single View)
- User explicitly requested tabs
- Rejected: Doesn't meet user need

---

## Questions to Resolve

1. **Tab limit?** - Max 10? 20? Unlimited?
2. **Dirty indicator placement?** - Dot before title? Different close icon?
3. **Tab width?** - Fixed 150px? Flexible? Min/max?
4. **Close behavior?** - When closing active tab, go to previous or next?
5. **Split view?** - Future: Allow splitting editor into two panes?

---

## Next Steps

1. [ ] User confirms approach
2. [ ] Create `useTabStore.ts`
3. [ ] Create `TabBar.tsx` component
4. [ ] Integrate into `App.tsx`
5. [ ] Add tests
6. [ ] Iterate on UX
