# Brainstorm: Project Note Display

**Generated:** 2025-12-28
**Context:** Sprint 25 - Plan B UI Redesign

## Overview

After removing the standalone "Recent Notes" section from the left sidebar, we need a better way to display notes within projects in both compact and extended (card) view modes.

---

## Current State

### Compact Mode (CompactListMode.tsx)
- Projects shown as collapsible list items
- When expanded: shows `ProjectContextCard` + up to 5 recent notes
- Notes displayed as simple buttons with FileText icon

### Card Mode (CardViewMode.tsx)
- Projects shown as cards with stats (note count, word count)
- **No notes visible** - only project metadata
- Recent Notes section was removed (redundant)

---

## Options

### Option A: Notes Inside Expanded Project (Current - Compact Only)
**How it works:**
- Click project chevron to expand
- Shows project context card + note list inline
- Already implemented in CompactListMode

**Pros:**
- Familiar pattern (Obsidian/VS Code file tree)
- Context preserved - notes grouped by project
- Low friction - single click to expand

**Cons:**
- Takes vertical space when expanded
- Card mode has no equivalent

**Effort:** ⚡ Already done (compact mode)

---

### Option B: Note Grid Inside Card (Card Mode Enhancement)
**How it works:**
- Hover or click card to reveal note grid overlay
- Shows 3-6 recent notes as small tiles
- Click tile to open note

```
┌─────────────────────────┐
│ Research          [+][⋮]│
│ 📄 12 notes  •  4.2k    │
├─────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ │  ← Note tiles
│ │Paper│ │Notes│ │Ideas│ │
│ └─────┘ └─────┘ └─────┘ │
└─────────────────────────┘
```

**Pros:**
- Compact - fits within card footprint
- Quick access without leaving view
- Visual preview of recent work

**Cons:**
- Adds complexity to card component
- Limited to ~6 notes visible
- May feel cramped

**Effort:** 🔧 Medium (2-3 hours)

---

### Option C: Slide-Out Note Panel (Both Modes)
**How it works:**
- Clicking project reveals slide-out panel on right
- Panel shows full note list with search/filter
- Similar to Obsidian's file explorer

```
Sidebar              │ Note Panel
┌────────────┐      │ ┌──────────────────┐
│ ▶ Research │──────┼─│ Research Notes   │
│ ▶ Course   │      │ │ ───────────────  │
│ ▶ Writing  │      │ │ 📄 Paper draft   │
└────────────┘      │ │ 📄 References    │
                    │ │ 📄 TODO list     │
                    │ │ 📄 Meeting notes │
                    │ └──────────────────┘
```

**Pros:**
- Full note list visible
- Search/filter capabilities
- Works for projects with many notes

**Cons:**
- Takes screen real estate
- Extra interaction step
- Complexity increase

**Effort:** 🏗️ Large (4-6 hours)

---

### Option D: Double-Click to Toggle Note List (Hybrid)
**How it works:**
- Single click selects project (sets context)
- Double-click expands inline note list
- Works in both compact and card modes

**Compact Mode:**
```
▶ Research (12)
  ▼ Course (5)        ← Double-clicked
    📄 Lecture 1
    📄 Lecture 2
    📄 Assignment
▶ Writing (3)
```

**Card Mode:**
```
┌─────────────────┐
│ Course          │  ← Double-clicked
│ ▼ Notes (5)     │
│   📄 Lecture 1  │
│   📄 Lecture 2  │
└─────────────────┘
```

**Pros:**
- Consistent behavior across modes
- Progressive disclosure
- No extra UI panels

**Cons:**
- Double-click not discoverable
- Single-click vs double-click confusion

**Effort:** 🔧 Medium (2-3 hours)

---

### Option E: Inline Notes Always Visible (Compact Mode Enhancement)
**How it works:**
- Show 2-3 recent notes directly under each project
- No expand/collapse needed
- Click to open, hover for preview

```
▶ Research          ●●●
  └ Paper draft     2h ago
  └ References      1d ago
▶ Course            ●●
  └ Lecture notes   now
```

**Pros:**
- Zero friction - notes always visible
- Shows activity at a glance
- Quick access

**Cons:**
- Takes more vertical space
- May feel cluttered with many projects
- Reduces project list density

**Effort:** 🔧 Medium (1-2 hours)

---

## Recommendation

### For Compact Mode: Keep Option A (Already Done)
The current expand/collapse pattern works well:
- Click chevron → project expands
- Shows context card + note list
- Familiar Obsidian/VS Code pattern

### For Card Mode: Add Option B (Note Tiles)
Enhance cards to show recent notes on hover/expand:
- Keep cards compact by default
- Click to expand and show note tiles
- Maintains the card aesthetic

### Implementation Priority
1. ⚡ **Phase 1:** Keep current compact mode behavior (done)
2. 🔧 **Phase 2:** Add expandable note tiles to card mode
3. ⏳ **Future:** Consider slide-out panel for power users

---

## Quick Wins

1. ⚡ Current compact mode already shows notes when expanded - done
2. ⚡ Remove duplicate "Recent Notes" section - done
3. 🔧 Add note tiles to card mode on expand

---

## Decision Points

Before implementing, consider:

1. **Card expansion behavior:**
   - Expand in-place (card grows)?
   - Overlay/popover?
   - Separate panel?

2. **Note limit per project:**
   - Show all notes?
   - Show recent 5-10?
   - Scrollable if more?

3. **Note preview:**
   - Title only?
   - Title + first line?
   - Title + modified time?

---

## Next Steps

1. [ ] Decide on card mode enhancement approach
2. [ ] Implement note tiles in CardViewMode
3. [ ] Add consistent note preview styling
4. [ ] Test with projects that have many notes

---

*Created: 2025-12-28*
