# Left Sidebar Layouts - Comprehensive Brainstorm

**Generated:** 2026-01-08
**Mode:** Max depth (expert analysis + 2 agents)
**Context:** Scribe left Mission Sidebar redesign

---

## 📋 Executive Summary

Based on expert UX analysis, architecture review, and your specific requirements, here are **3 comprehensive layout options** for the left Mission Sidebar, each optimized for ADHD-friendly workflows with clear visual hierarchy.

### Your Key Requirements (from Questions)

✅ **Primary Goal:** Reduce visual clutter (ADHD-friendly)
✅ **Default State:** Icon mode (48px minimal)
✅ **Activity Bar:** Integrated at bottom
✅ **5 Pinned Vaults:** Inbox (top), Research, Teaching, R pkg, dev tools
✅ **Inbox Behavior:** Always visible, pinned at top
✅ **Project Click:** Expand to show notes list
✅ **Recent Notes:** Separate panel (right side)
✅ **Priority:** Clear visual hierarchy

---

## 🎯 Layout Option A: "Focus First" (Recommended)

### Concept

**Minimal by default, rich when needed.** Start users in icon mode to maximize editor space, with smooth expansion to show context.

###

 Visual Hierarchy

```
Level 1: CRITICAL (Always Visible - Even in Icon Mode)
├── Inbox (top, amber badge)
└── Activity Bar (bottom, 3 icons)

Level 2: PRIMARY (Compact/Card Mode)
├── 5 Pinned Vaults (Inbox + 4 custom)
└── Current project highlight

Level 3: SECONDARY (Card Mode Only)
├── Project descriptions
└── Rich statistics

Level 4: TERTIARY (On-demand)
└── All projects (via Command Palette)
```

### Wireframes

**Icon Mode (48px) - Default**

```
┌────┐
│ ⚡ │  ← Mission Control (Home)
├────┤
│ 📥 │  ← INBOX (always visible)
│ •3 │     Unread badge
├────┤  ← DIVIDER
│ 🔵 │  ← Research (active - blue dot)
│ ⚪ │  ← Teaching
│ ⚪ │  ← R pkg
│ ⚪ │  ← dev tools
│ ➕ │  ← Add vault (subtle)
├────┤  ← SPACER (flexible)
├────┤  ← ACTIVITY BAR
│ 🔍 │  ← Search
│ 📅 │  ← Daily
│ ⚙️ │  ← Settings
└────┘

INTERACTIONS:
• Hover dot → Tooltip (name + stats)
• Click dot → Expand to compact + scroll to project
• Click Inbox → Expand + show inbox notes
• 500ms tooltip delay (prevent accidents)
```

**Compact Mode (240px) - Quick Overview**

```
┌──────────────────────┐
│  ⚡ Scribe      [◀]  │
├──────────────────────┤
│ 📥 INBOX (3)    [▼]  │
│  • Quick note 1  2h  │
│  • Idea capture  1d  │
│  • Meeting note  2d  │
├──────────────────────┤
│ PINNED           [−] │
│                      │
│ 🔬 Research      ●  │
│    3 notes, 2.4k     │
│                      │
│ 📚 Teaching          │
│    12 notes, 8.1k    │
│                      │
│ 📦 R pkg             │
│    5 notes, 1.2k     │
│                      │
│ 🛠️ dev tools         │
│    8 notes, 3.4k     │
│                      │
│ [+ New Project]      │
├──────────────────────┤
│ 🔍  📅  ⚙️          │  ← Activity Bar
└──────────────────────┘

INTERACTIONS:
• Click project → Expand notes list
• Right-click → Context menu
• [◀] → Collapse to icon mode
• Collapsible sections (Inbox, Pinned)
```

**Card Mode (380px) - Rich Information**

```
┌─────────────────────────────┐
│  ⚡ Scribe          [◀] [▣] │
├─────────────────────────────┤
│ 📥 INBOX (3)    [⚡ Capture] │
│ ┌───────────────────────────┐│
│ │ • Quick note 1      2h ago││
│ │ • Idea capture      1d ago││
│ │ • Meeting note      2d ago││
│ └───────────────────────────┘│
├─────────────────────────────┤
│ PINNED PROJECTS             │
│ ┌───────────────────────────┐│
│ │ 🔬 Research           ●   ││
│ │ ───────────────────────   ││
│ │ Mediation Analysis        ││
│ │ 📄 3  📊 2,447  🔥 today  ││
│ └───────────────────────────┘│
│                             │
│ ┌───────────────────────────┐│
│ │ 📚 Teaching               ││
│ │ ───────────────────────   ││
│ │ STAT 440 Regression       ││
│ │ 📄 12  📊 8,123  📅 3d ago││
│ └───────────────────────────┘│
│                             │
│ [+ New Project]             │
├─────────────────────────────┤
│ 🔍 Search  📅 Daily  ⚙️ Set │
└─────────────────────────────┘

INTERACTIONS:
• Click card → Open project
• Hover → Lift animation
• Drag cards to reorder
• [▣] Toggle card/list view
```

### Activity Bar Integration (Bottom)

```
ICON MODE (48px height):
┌────┐
│ 🔍 │  Search
│ 📅 │  Daily
│ ⚙️ │  Settings
└────┘

COMPACT/CARD MODE (48px height):
┌─────────────────────────────┐
│ 🔍 Search  📅 Daily  ⚙️ Set │
└─────────────────────────────┘

Icons:
1. Search (⌘F) - Global search
2. Daily (⌘D) - Today's note
3. Settings (⌘,) - Preferences
```

### ADHD Optimizations

1. **Minimal Default:** Icon mode shows only dots - no overwhelming UI
2. **Persistent Landmarks:** Inbox always at top, Activity Bar always at bottom
3. **Fast Transitions:** Mode switching in 150ms (no bounce effects)
4. **Smart Defaults:** Icon mode on fresh start, last used mode on return
5. **Quick Escapes:** Cmd+0 toggles sidebar, Escape closes dialogs
6. **Status at Glance:** Amber inbox badge, blue active dot, green sync indicator

### Technical Implementation

**State Management:**
```typescript
interface MissionSidebarStore {
  mode: 'icon' | 'compact' | 'card'
  width: number
  pinnedVaults: PinnedVault[]  // Max 5
  expandedProjects: Set<string>
  scrollPosition: number
}

interface PinnedVault {
  id: 'inbox' | string  // Inbox always first
  label: string
  emoji: string
  order: number  // 0-4
  isPermanent: boolean  // true for Inbox
}
```

**Performance:**
- < 100ms mode switching (CSS transitions only)
- Virtualized note lists (react-window) for 100+ notes
- Memoized project stats (useMemo)
- Debounced scroll position saves (300ms)

### Pros

✅ Minimal cognitive load (icon mode default)
✅ ADHD-friendly (clear hierarchy, persistent landmarks)
✅ Smooth transitions (< 150ms)
✅ Customizable (5 pinned vaults)
✅ Always accessible actions (Activity Bar)
✅ Inbox prominence (always visible, top position)

### Cons

⚠️ Initial learning curve (users need to discover modes)
⚠️ Icon dots may be unclear without tooltips
⚠️ Compact mode might feel cramped at 240px

### Effort Estimate

**Total:** 20-24 hours across 6 phases

| Phase | Tasks | Hours |
|-------|-------|-------|
| 1. Icon Mode Polish | Tooltips, colored dots, Activity Bar | 4-6h |
| 2. Inbox Pinning | Permanent top position, badge, collapse | 6-8h |
| 3. Vault Pinning | Settings UI, drag-to-reorder | 6-8h |
| 4. Visual Polish | Hover states, transitions, animations | 4-6h |
| 5. Testing | Unit, component, E2E tests | 6-8h |
| 6. Documentation | User guide, dev docs | 2-3h |

---

## 🎯 Layout Option B: "Balanced Visibility"

### Concept

**Start in Compact mode by default.** Show enough context without overwhelming, with quick access to both minimal (icon) and rich (card) modes.

### Key Differences from Option A

- **Default:** Compact (240px) instead of Icon (48px)
- **Rationale:** Users see their vaults immediately without clicking
- **Trade-off:** Less editor space initially, but better orientation

### Visual Hierarchy

```
Level 1: ALWAYS VISIBLE
├── Sidebar header (logo + mode switcher)
├── Inbox section
├── 5 Pinned vaults with stats
└── Activity Bar

Level 2: ON HOVER
├── Expand/collapse indicators
└── Context menu triggers

Level 3: ON CLICK
└── Expanded note lists per vault
```

### Wireframe (Compact - Default State)

```
┌──────────────────────┐
│ ⚡ Scribe  [□][◀][≡] │  ← Mode switcher
├──────────────────────┤     □ Icon, ◀ Compact, ≡ Card
│                      │
│ 📥 INBOX (3)    [↓]  │
│  • Quick note 1      │
│  • Idea capture      │
│  • Meeting note      │
│                      │
├──────────────────────┤
│ 🔬 Research      [>] │  ← Collapsed (click to expand)
│    3 notes, 2.4k     │
│                      │
│ 📚 Teaching      [↓] │  ← Expanded
│  • Week 3 Lecture    │
│  • Homework 2        │
│  • Grading rubric    │
│    12 notes, 8.1k    │
│                      │
│ 📦 R pkg         [>] │
│    5 notes, 1.2k     │
│                      │
│ 🛠️ dev tools     [>] │
│    8 notes, 3.4k     │
│                      │
├──────────────────────┤
│ 🔍  📅  ⚙️          │
└──────────────────────┘
```

### ADHD Optimizations

1. **Immediate Orientation:** See all vaults on open
2. **Expandable Detail:** Click to see notes (progressive disclosure)
3. **Mode Switcher:** Visual toggle in header (discoverability)
4. **Persistent State:** Remembers expanded vaults
5. **Quick Collapse:** Click [◀] icon mode for deep focus

### Pros

✅ Better discoverability (all vaults visible)
✅ Quick project scanning (no need to expand)
✅ Explicit mode switcher (clear affordance)
✅ Easier to learn (less hidden functionality)

### Cons

⚠️ Less editor space by default
⚠️ More visual clutter than Option A
⚠️ May overwhelm on narrow screens (< 1440px)

### Effort Estimate

**Total:** 16-20 hours (simpler than Option A - no icon mode polish needed)

---

## 🎯 Layout Option C: "Tab-Based Navigation"

### Concept

**Separate tab strip for vault switching** (like browser tabs). Always show all 5 pinned vaults as tabs, with content area showing active vault's notes.

### Visual Hierarchy

```
Level 1: TAB STRIP (Always Visible)
├── Inbox tab (amber)
├── Research tab (blue if active)
├── Teaching tab
├── R pkg tab
└── dev tools tab

Level 2: CONTENT AREA
├── Active vault's notes (full list)
└── Search/filter within vault

Level 3: ACTIVITY BAR
└── Bottom toolbar (consistent across tabs)
```

### Wireframe

```
┌─────────────────────────────┐
│ [📥][🔬][📚][📦][🛠️]  [+] │  ← Vault tabs
├─────────────────────────────┤
│ Research                    │  ← Active vault name
│ ┌─────────────────────────┐ │
│ │ 🔍 Search in Research... │ │  ← Scoped search
│ └─────────────────────────┘ │
│                             │
│ NOTES (3)                   │
│  • Methods Draft      2m ago│
│  • Results Section    1h ago│
│  • Discussion v3      2h ago│
│                             │
│ ─────────────────────────   │
│ 📊 3 notes  •  2,447 words  │
│ 🔥 Last edited: 2 min ago   │
│                             │
├─────────────────────────────┤
│ 🔍 Search  📅 Daily  ⚙️ Set │
└─────────────────────────────┘

INTERACTIONS:
• Click tab → Switch vault (instant)
• Hover tab → Preview (tooltip with stats)
• Drag tab → Reorder vaults
• Right-click tab → Context menu
```

### ADHD Optimizations

1. **Single Focus:** One vault at a time (reduces context switching)
2. **Tab Persistence:** Last active tab restored
3. **Visual Tabs:** Clear which vault is active
4. **Scoped Search:** Search only current vault (faster, focused)

### Pros

✅ Familiar pattern (browser tabs)
✅ Single vault focus (less cognitive load)
✅ Fast switching (one click)
✅ Scoped operations (search, stats per vault)

### Cons

⚠️ Can't see multiple vaults simultaneously
⚠️ Horizontal space for tabs (may crowd on narrow screens)
⚠️ Different from typical note apps (less familiar for Obsidian users)
⚠️ Harder to compare across vaults

### Effort Estimate

**Total:** 24-28 hours (new tab component, state management)

---

## 📊 Comparison Matrix

| Feature | Option A: Focus First | Option B: Balanced | Option C: Tabs |
|---------|----------------------|--------------------|--------------------|
| **Default State** | Icon (48px) | Compact (240px) | Tabs (280px) |
| **Visual Clutter** | ⭐⭐⭐⭐⭐ Minimal | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ Low |
| **Discoverability** | ⭐⭐ Hidden modes | ⭐⭐⭐⭐ Obvious | ⭐⭐⭐⭐⭐ Tab pattern |
| **Editor Space** | ⭐⭐⭐⭐⭐ Maximum | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent |
| **ADHD-Friendly** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐⭐ Very Good |
| **Implementation** | 20-24h | 16-20h | 24-28h |
| **Familiarity** | VS Code-like | Obsidian-like | Browser-like |
| **Customization** | ⭐⭐⭐⭐⭐ Highly flexible | ⭐⭐⭐⭐ Very flexible | ⭐⭐⭐ Limited |

---

## 💡 Recommended Path

### Short-term (Sprint 31): Option A - Focus First

**Rationale:**
1. **Matches your requirements:** Icon mode default, Activity Bar bottom, clear hierarchy
2. **ADHD-optimized:** Minimal by default, progressive disclosure
3. **Proven pattern:** VS Code Activity Bar is familiar to developers
4. **Flexible:** Can switch to compact/card when needed

**Implementation Order:**
1. **Phase 1** (6h): Icon mode enhancements (tooltips, colored dots, Activity Bar)
2. **Phase 2** (8h): Inbox pinning (permanent top, badge, quick capture)
3. **Phase 3** (8h): Vault pinning system (settings, drag-to-reorder)
4. **Phase 4** (6h): Visual polish (transitions, hover states)

**Total:** 28 hours across 2-3 sprints

### Mid-term (Post v2.0): Consider Option B for New Users

If user testing shows icon mode is too minimal for newcomers, add Option B (Balanced) as an alternative default for first-time users, with easy migration to Option A once familiar.

### Long-term: Tab Mode as Plugin/Extension

Option C (Tabs) could be a community plugin for users who prefer single-vault focus.

---

## 🚀 Quick Wins (Can Implement Today)

Regardless of which option you choose, these improvements apply to all:

1. **Inbox Badge** (2h) - Show unread count on Inbox icon/section
2. **Colored Project Dots** (2h) - Use project color or emoji for icon mode
3. **Tooltips on Hover** (2h) - Show project name + stats on icon hover
4. **Activity Bar Icons** (4h) - Add Search, Daily, Settings at bottom
5. **Keyboard Shortcuts** (2h) - Cmd+0 toggle, Tab navigation

**Total:** 12 hours for universal improvements

---

## 📋 Open Questions for Final Decision

Before proceeding with Option A (recommended), please confirm:

1. **Inbox behavior:** Should Inbox show ALL unassigned notes, or recent 5 only?
   **Recommendation:** Recent 5 (consistent with other vaults, less overwhelming)

2. **Activity Bar icons:** Limit to 3 (Search, Daily, Settings) or allow 5 (add Stats, Profile)?
   **Recommendation:** Start with 3, add more in settings later

3. **Default mode for fresh install:** Icon (minimal) or Compact (balanced)?
   **Recommendation:** Icon (matches your stated preference)

4. **Max pinned vaults:** Keep at 5, or make configurable (3-10)?
   **Recommendation:** Fixed 5 (ADHD: fewer choices, prevent clutter)

5. **Mode switcher location:** In header (explicit) or via Cmd+0 (hidden)?
   **Recommendation:** Both (Cmd+0 primary, header icon secondary)

---

## 📚 Related Documentation

Created by expert agents during this brainstorm:

1. **UX Analysis:** `docs/specs/UX-ANALYSIS-LEFT-SIDEBAR-2026-01-08.md`
   - Comprehensive wireframes for all 3 modes
   - Accessibility guidelines
   - ADHD-specific UX optimizations
   - Design tokens and spacing specifications

2. **Architecture:** `docs/mission-sidebar-state-flow.md`
   - State management diagrams (Mermaid)
   - Component hierarchy
   - Performance optimization strategy
   - Migration timeline (6 phases)

3. **Implementation Guide:** `docs/mission-sidebar-phase1-guide.md`
   - Step-by-step Phase 1 implementation
   - Code examples and snippets
   - Testing checklist

---

## ✅ Next Steps

1. **Review this brainstorm** and choose your preferred option (A recommended)
2. **Answer open questions** above to finalize requirements
3. **Approve Phase 1** implementation plan
4. **Begin implementation** (estimated 6 hours for first phase)

**Ready to proceed?** I'll generate the formal SPEC document once you confirm Option A and answer the open questions.

---

**Brainstorm Status:** ✅ Complete
**Duration:** ~25 minutes (2 expert agents + synthesis)
**Files Generated:** 4 (brainstorm + 3 expert documents)
