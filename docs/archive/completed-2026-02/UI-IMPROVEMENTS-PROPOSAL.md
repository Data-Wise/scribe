# Scribe Terminology & UI Enhancement Proposal

**Generated:** 2025-12-27
**Mode:** Design (thorough)
**Status:** Ready for implementation

---

## Part 1: Terminology - Differentiating from Obsidian

### Current vs Proposed

| Current | Proposed | Rationale |
|---------|----------|-----------|
| Note | **Page** | Lighter feel, writing-app identity |
| Notes | **Pages** | Consistent |
| Daily Note | **Today** or **Journal** | Shorter, clearer |
| Quick Capture | **Capture** | Action verb |
| All Notes | **All Pages** | Consistent |
| Dashboard | **Mission Control** | Keep - distinctive! |

### Terms NOT to Change

| Term | Keep As-Is | Reason |
|------|------------|--------|
| Project | Project | Familiar, clear |
| Mission Control | Mission Control | Unique brand identity |
| Tags | Tags | Universal |
| Backlinks | Backlinks | Standard term |

### Terminology Philosophy

**Avoid Obsidian terms:**
- No "Vault" - Scribe is project-focused
- No "Graph View" - Use "Connections" or "Web" if implemented
- "Page" instead of "Note" - feels lighter, more like writing

---

## Part 2: UI Layout Improvements

### Current Issues

1. **Three columns** when expanded (Projects + Notes list + Content) - too busy
2. **Notes list panel** duplicates Project navigation purpose
3. **Quick Actions** cramped in header
4. **Empty state** could be smarter (suggest recent work)

### Recommended Layout: Command-First Design

```
+-------------------------------------------------------------------+
|                          SCRIBE                                    |
|                     Mission Control                                |
|                                                                    |
|              +------------------------------------+                 |
|              |  What would you like to do?       |                 |
|              |     Type or press Cmd+K           |                 |
|              +------------------------------------+                 |
|                                                                    |
|    [Today]    [+ New Page]    [Capture]    [Settings]             |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  PROJECTS                          RECENT PAGES                    |
|  +----------------------+         +----------------------+         |
|  | * Research Paper     |         | Chapter 3            |         |
|  |   3 pages, 2.4k      |---------| 2 hours ago          |         |
|  |                      |         +----------------------+         |
|  | o Teaching Notes     |         | Methods Section      |         |
|  |   12 pages, 8.1k     |         | yesterday            |         |
|  |                      |         +----------------------+         |
|  | o Blog Posts         |         | Journal Dec 26       |         |
|  |   5 pages, 1.2k      |         | 2 days ago           |         |
|  +----------------------+         +----------------------+         |
|  [+ New Project]                                                   |
|                                                                    |
+-------------------------------------------------------------------+
```

### Key Changes

1. **Remove notes list panel** - redundant with project click
2. **Center command bar** - make Cmd+K the primary action
3. **Two-column layout** - Projects (left) + Recent Pages (right)
4. **Quick actions as large buttons** - bigger touch targets
5. **Smart suggestions** - "Continue Chapter 3" based on recent

---

## Part 3: Implementation Plan

### Quick Wins (< 30 min each)

1. **Rename "Note" to "Page"** in UI strings
2. **Rename "Daily Note" to "Today"** in Quick Actions
3. **Update header stats** - "X pages" instead of "X notes"
4. **Fix empty state text** - use "page" terminology

### Medium Effort (1-2 hours)

- [ ] Remove redundant notes list panel from main view
- [ ] Add command bar to Mission Control center
- [ ] Create two-column Projects + Recent layout
- [ ] Update all component prop names

### Files to Update for Terminology

| File | Changes Needed |
|------|---------------|
| `DashboardHeader.tsx` | "notes" -> "pages" in stats |
| `DashboardShell.tsx` | Variable names, comments |
| `DashboardFooter.tsx` | "recent notes" -> "recent pages" |
| `ProjectsPanel.tsx` | "note count" labels |
| `EmptyState.tsx` | "note" -> "page" in copy |
| `SearchPanel.tsx` | "Search notes" -> "Search pages" |
| `NotesList.tsx` | Component rename consideration |

---

## Part 4: ADHD-Friendly Enhancements

### Motivation Features

- **Streak display** (opt-in) at milestones only (7, 30, 100 days)
- **"Welcome back"** greeting with time since last session
- **Quick win suggestions** - "Continue where you left off"

### Reduce Friction

- **Command bar front and center** - type to do anything
- **Large touch targets** for primary actions
- **Clear visual hierarchy** - what to click first is obvious

### Focus Helpers

- **Two-column max** when browsing - avoid information overload
- **Clean empty state** - not overwhelming with options
- **Recent pages** visible - reduces "where was I?" moments

---

## Decision Points

### Q1: Should we rename "Note" to "Page"?

**Recommendation:** Yes

- Differentiates from Obsidian ("notes")
- Feels lighter, more like a writing app
- "Page" implies a document you're creating
- "Note" implies something you're just capturing

### Q2: Keep "Daily Note" or rename to "Today"?

**Recommendation:** "Today" for button, "Journal" for the page

- "Today" as action (button label) - short, clear
- "Journal" as the page type - professional feel
- Example: Click "Today" -> creates "Journal - Dec 27, 2025"

### Q3: Two-column or three-column layout?

**Recommendation:** Two-column

- Projects list on left
- Content/Recent on right
- Notes list integrated into Projects (expand to see pages)
- Reduces cognitive load

---

## Next Steps

1. [ ] Review and approve terminology changes
2. [ ] Implement quick wins (terminology in UI)
3. [ ] Redesign Mission Control layout
4. [ ] User testing with new terminology

---

**Document Status:** Proposal ready for review
