# Activity Bar Proposal - VS Code Style

**Generated:** 2024-12-28
**Context:** Scribe Mission Control HUD - feat/mission-control-hud branch

## Overview

Add a VS Code-style Activity Bar (left edge icon strip) to provide quick access to different views without taking horizontal space. This complements the existing Mission Sidebar (projects/notes) with global navigation.

---

## Current Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Title Bar (drag region)                       │
├──────────────┬─────────────────────────────────────┬───────────────────┤
│              │                                     │                   │
│  Mission     │                                     │   Properties /    │
│  Sidebar     │           Main Editor               │   Backlinks /     │
│  (48-500px)  │                                     │   Tags Panel      │
│              │                                     │   (250-600px)     │
│              │                                     │                   │
└──────────────┴─────────────────────────────────────┴───────────────────┘
```

---

## Proposed Options

### Option A: Integrated Activity Bar (Recommended)

Merge Activity Bar INTO the existing Mission Sidebar as a top section.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Title Bar (drag region)                       │
├──────────────┬─────────────────────────────────────┬───────────────────┤
│ ┌──────────┐ │                                     │                   │
│ │ 📁  🔍  │ │                                     │                   │
│ │ 🗓️  ⚙️  │ │                                     │                   │
│ └──────────┘ │                                     │                   │
│ ─────────── │           Main Editor               │   Right Panel     │
│              │                                     │                   │
│  Projects    │                                     │                   │
│  & Notes     │                                     │                   │
│              │                                     │                   │
└──────────────┴─────────────────────────────────────┴───────────────────┘

Icon Mode (48px):
┌────┐
│ 📁 │  ← Projects (active)
│ 🔍 │  ← Search
│ 🗓️ │  ← Daily Notes
│ ⚙️ │  ← Settings
├────┤
│ ≡  │  ← Menu/Expand
│ P1 │  ← Project icons
│ P2 │
│ .. │
├────┤
│ +  │  ← New Project
└────┘
```

**Effort:** 🔧 Medium (4-6 hours)
**Pros:**
- No additional horizontal space consumed
- Consistent with current icon mode design
- Activity icons replace hamburger menu
- Clean integration

**Cons:**
- Requires refactoring IconBarMode
- Slightly more complex state management

---

### Option B: Separate Activity Bar (VS Code Style)

Add a 48px vertical strip to the FAR LEFT, separate from Mission Sidebar.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Title Bar (drag region)                       │
├────┬─────────────┬─────────────────────────────────┬───────────────────┤
│ 📁 │             │                                 │                   │
│ 🔍 │   Mission   │                                 │   Right Panel     │
│ 🗓️ │   Sidebar   │        Main Editor              │                   │
│ ⚙️ │   (0-500px) │                                 │                   │
│    │             │                                 │                   │
│    │             │                                 │                   │
│────│             │                                 │                   │
│ 👤 │             │                                 │                   │
└────┴─────────────┴─────────────────────────────────┴───────────────────┘

Activity Bar (always 48px):
┌────┐
│ 📁 │  ← Projects (toggles Mission Sidebar)
│ 🔍 │  ← Search
│ 🗓️ │  ← Daily Notes
│ 🤖 │  ← Claude Panel
│    │
│    │  (spacer)
│    │
│────│
│ ⚙️ │  ← Settings
│ 👤 │  ← Account (future)
└────┘
```

**Effort:** 🔧 Medium (3-4 hours)
**Pros:**
- True VS Code parity
- Activity bar always visible
- Can toggle Mission Sidebar independently
- Clear separation of concerns

**Cons:**
- Takes 48px horizontal space always
- Two left elements to manage
- More complex for narrow screens

---

### Option C: Ribbon Bar (Top Horizontal)

Add a horizontal ribbon below the title bar (like Office apps).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Title Bar (drag region)                       │
├────────────────────────────────────────────────────────────────────────┤
│  📁 Projects   🔍 Search   🗓️ Daily   🤖 Claude   │  Focus   Settings  │
├──────────────┬─────────────────────────────────────┬───────────────────┤
│              │                                     │                   │
│  Mission     │           Main Editor               │   Right Panel     │
│  Sidebar     │                                     │                   │
│              │                                     │                   │
└──────────────┴─────────────────────────────────────┴───────────────────┘
```

**Effort:** ⚡ Quick (2 hours)
**Pros:**
- Familiar ribbon pattern
- Doesn't take horizontal space
- Easy to implement

**Cons:**
- Takes vertical space (30-40px)
- Less "IDE-like"
- May conflict with title bar

---

## Activity Bar Icons & Actions

| Icon | Label | Action | Shortcut |
|------|-------|--------|----------|
| 📁 | Projects | Toggle Mission Sidebar | ⌘0 |
| 🔍 | Search | Open Search Panel | ⌘F |
| 🗓️ | Daily | Create/Open Daily Note | ⌘D |
| 🤖 | Claude | Toggle Claude Panel | ⌘J |
| 📊 | Graph | Open Knowledge Graph | ⌘⇧G |
| ⚙️ | Settings | Open Settings Modal | ⌘, |

---

## Settings Integration

### Activity Bar Visibility

```typescript
// In preferences.ts
interface UserPreferences {
  // ... existing
  activityBarEnabled: boolean      // Toggle entire bar
  activityBarPosition: 'left' | 'integrated' | 'top'
  activityBarItems: ActivityBarItem[]  // Customize visible items
}

interface ActivityBarItem {
  id: string
  enabled: boolean
  order: number
}
```

### Settings UI (ASCII Mockup)

```
┌─────────────────────────────────────────────────────┐
│  Settings > Appearance > Activity Bar              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ☑ Show Activity Bar                               │
│                                                     │
│  Position:  ○ Left (separate)                      │
│             ● Integrated (in sidebar)               │
│             ○ Top (ribbon)                          │
│                                                     │
│  ─────────────────────────────────────────────     │
│  Visible Items:                                     │
│  ☑ Projects      [↑] [↓]                           │
│  ☑ Search        [↑] [↓]                           │
│  ☑ Daily Notes   [↑] [↓]                           │
│  ☐ Claude Panel  [↑] [↓]                           │
│  ☑ Graph View    [↑] [↓]                           │
│  ☑ Settings      [↑] [↓]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan (Option A - Recommended)

### Phase 1: Core Activity Bar (2 hours)

1. Create `ActivityBar.tsx` component
2. Add activity bar state to `useAppViewStore.ts`
3. Integrate at top of `IconBarMode.tsx`
4. Style with existing design tokens

### Phase 2: View Switching (2 hours)

1. Wire up click handlers for each activity
2. Add hover tooltips with shortcuts
3. Active state indicator (left border highlight)
4. Keyboard navigation (Tab between icons)

### Phase 3: Settings Integration (2 hours)

1. Add activity bar preferences
2. Add settings UI section
3. Persist to localStorage
4. Handle enabled/disabled items

---

## Quick Wins (< 30 min each)

1. ⚡ Add activity icons to existing IconBarMode header area
2. ⚡ Wire Search icon to existing `setIsSearchPanelOpen(true)`
3. ⚡ Wire Daily icon to existing `handleDailyNote()`
4. ⚡ Add active indicator CSS (2px left border, accent color)

## Medium Effort (1-2 hours)

- [ ] Create ActivityBar component with full icon set
- [ ] Add settings section for activity bar preferences
- [ ] Implement icon reordering with drag-and-drop

## Long-term (Future sessions)

- [ ] Custom activity icons (user-defined)
- [ ] Badge notifications on activity icons
- [ ] Context-aware activity suggestions

---

## Recommended Path

→ **Start with Option A (Integrated)** because:
1. It uses existing patterns from IconBarMode
2. No additional horizontal space
3. Natural evolution of current design
4. Easier to implement and test

Start with Quick Win #1: Add the activity icon row to IconBarMode.tsx header area.

---

## Next Steps

1. [ ] Create `ActivityBar.tsx` component
2. [ ] Add activity bar state to app view store
3. [ ] Integrate into IconBarMode header
4. [ ] Test with keyboard navigation
5. [ ] Add settings toggle in SettingsModal

---

## Sources

- [VS Code Activity Bar UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/activity-bar)
- [VS Code Custom Layout](https://code.visualstudio.com/docs/configure/custom-layout)
- [VS Code User Interface](https://code.visualstudio.com/docs/getstarted/userinterface)
