# Tags Panel Redesign - Brainstorm Proposal

**Generated:** December 26, 2025
**Context:** Scribe - ADHD-friendly note-taking app
**Current Location:** `src/renderer/src/components/TagsPanel.tsx`

---

## Current State Analysis

### What Exists Now
- Tree/flat view toggle (Network/List icons)
- "This Note" section showing tags on current note
- "All Tags" section with hierarchical display
- Tag color dots
- Note counts per tag
- Expandable tree for nested tags (e.g., `research/statistics`)
- "Clear Filters" button when tags selected
- localStorage persistence for view mode and expanded paths

### Pain Points Identified
1. **Orphan/Ghost Tags** - Tags referenced in notes but possibly not in database
2. **No search/filter** for tags
3. **No tag management** (rename, delete, merge)
4. **Limited visual hierarchy** - just indentation
5. **No recent/frequent tags** section
6. **Can't create tags from panel**
7. **No tag suggestions** based on content

---

## Brainstorm: Ideas by Category

### 🏷️ Tag Discovery & Navigation

1. **Search/Filter Bar** ⭐
   - Instant filter as you type
   - Fuzzy matching for typos
   - Highlight matching characters

2. **Recently Used Tags** ⭐
   - Top 5-10 most recently used
   - Configurable count
   - One-click to filter

3. **Frequently Used Tags**
   - Show most common tags prominently
   - Heat map visualization option

4. **Alphabetical Jump**
   - A-Z sidebar for quick navigation
   - Like iOS contacts

5. **Tag Cloud View** ⭐
   - Size based on frequency
   - Alternative to tree/flat
   - ADHD-friendly visual scanning

6. **Smart Sections**
   - "This Note" (current)
   - "Recent" (new)
   - "Favorites" (pinned)
   - "All Tags" (current)

### 🔧 Tag Management

7. **Inline Tag Editing** ⭐
   - Right-click → Rename/Delete/Merge
   - Double-click to edit name
   - Confirmation for destructive actions

8. **Tag Merging**
   - Select multiple → Merge into one
   - Preserve all note associations
   - Handle hierarchy conflicts

9. **Orphan Tag Detection** ⭐⭐
   - Scan notes for `#tag` patterns not in DB
   - Show in separate "Unregistered Tags" section
   - One-click to register them
   - Strikethrough for deleted tags still referenced

10. **Bulk Operations**
    - Multi-select tags
    - Bulk delete/rename/color change
    - Export tag list

11. **Tag Color Picker**
    - Click color dot to change
    - Preset palettes
    - Custom hex input

12. **Create Tag Button**
    - "+" button in header
    - Quick create without note context
    - Set name, color, parent

### 🎨 Visual Design

13. **Compact Mode** ⭐
    - Smaller text, tighter spacing
    - More tags visible
    - Toggle in header

14. **Badge Style Tags**
    - Pill/chip style like in notes
    - Consistent visual language
    - Optional: just dots for minimal

15. **Progress Indicators**
    - Small bar showing % of notes tagged
    - Visual feedback on tag coverage

16. **Drag & Drop Reordering**
    - Manual sort option
    - Drag to create hierarchy
    - Drag tag onto note

17. **Collapsible Sections**
    - Collapse "This Note" when not needed
    - Remember state per-session

18. **Tag Icons** ⭐
    - Optional emoji/icon per tag
    - Visual differentiation
    - Category indicators

19. **Dark/Light Indicators**
    - Different visual weight for used vs unused
    - Fade out zero-count tags

### 🧠 ADHD-Friendly Features

20. **Focus Mode Integration** ⭐
    - Hide panel in focus mode
    - Or show only current note's tags

21. **Visual Hierarchy Enhancement**
    - Color-coded depth levels
    - Connecting lines (like file trees)
    - Indentation guides

22. **Quick Actions**
    - Keyboard shortcuts for common actions
    - `t` to open tag panel
    - `/` to focus search
    - Number keys for recent tags

23. **Reduced Cognitive Load**
    - Hide zero-count tags option
    - "Essentials only" mode
    - Progressive disclosure

24. **Tag Suggestions Panel**
    - AI-suggested tags for current note
    - Based on content analysis
    - One-click to apply

### 🔍 Advanced Features

25. **Tag Relationships**
    - Show related tags (often used together)
    - "People who use X also use Y"

26. **Tag Statistics**
    - Expandable stats per tag
    - Last used date
    - Growth over time

27. **Tag Templates**
    - Preset tag groups for projects
    - Apply template to note
    - "Research Project" = #research, #todo, #reading

28. **Exclusion Filters**
    - Filter notes WITHOUT certain tags
    - "Show untagged notes"

29. **Tag Aliases**
    - Multiple names → same tag
    - Handle typos automatically

30. **Export/Import Tags**
    - Backup tag structure
    - Share between vaults
    - Import from Obsidian

### 🐛 Orphan Tag Handling (User's Specific Request)

31. **Orphan Detection System** ⭐⭐
    ```
    ┌─────────────────────────────────┐
    │ ⚠️ Unregistered Tags (3)        │
    ├─────────────────────────────────┤
    │ ○ #newproject    [Register]     │
    │ ○ #meeting-notes [Register]     │
    │ ○ #2024          [Register]     │
    │                  [Register All] │
    └─────────────────────────────────┘
    ```

32. **Ghost Tag Highlighting**
    - Different color for orphan tags
    - Yellow/warning indicator
    - Tooltip explaining status

33. **Cleanup Wizard**
    - Scan all notes
    - Find orphan tags
    - Batch register/ignore

34. **Auto-Register Option**
    - Setting to auto-create tags when typed
    - Toggle per-user preference

35. **Tag Validation**
    - Mark invalid tag names (spaces, special chars)
    - Suggest corrections

---

## Combined Feature Sets

### "Quick Win" Package
- Search/filter bar (#1)
- Compact mode toggle (#13)
- Recently used section (#2)
- Orphan detection (#31)

### "Power User" Package
- Tag management (rename/delete/merge)
- Bulk operations
- Keyboard shortcuts
- Statistics

### "Visual" Package
- Tag cloud view
- Tag icons
- Color picker improvements
- Connecting lines

---

## Design Mockups

### Option A: Enhanced Current Design
```
┌──────────────────────────────────┐
│ Tags                    🔍 ≡ ⊞  │
├──────────────────────────────────┤
│ [Search tags...]                 │
├──────────────────────────────────┤
│ ⏱ RECENT                         │
│   • research  • meeting  • todo  │
├──────────────────────────────────┤
│ 📄 THIS NOTE                     │
│   #statistics  #mediation        │
├──────────────────────────────────┤
│ ⚠️ UNREGISTERED (2)       [+All] │
│   ○ #newproject           [+]    │
│   ○ #draft                [+]    │
├──────────────────────────────────┤
│ 📁 ALL TAGS (15)                 │
│ ▼ research (8)                   │
│   ├─ statistics (3)              │
│   └─ methods (2)                 │
│ ▶ personal (5)                   │
│ • todo (12)                      │
│ • reading (7)                    │
└──────────────────────────────────┘
```

### Option B: Minimal/Compact ⭐
```
┌────────────────────────┐
│ Tags      🔍  ≡  +     │
├────────────────────────┤
│ [Filter...]            │
│                        │
│ research/stats    3    │
│ research/methods  2    │
│ • todo           12    │
│ • reading         7    │
│ ○ unregistered    2 ⚠️  │
│                        │
│ [Clear filters]        │
└────────────────────────┘
```

### Option C: Tag Cloud ⭐
```
┌──────────────────────────────────┐
│ Tags                    ☁️ ≡ ⊞  │
├──────────────────────────────────┤
│                                  │
│   research    TODO    meeting    │
│      statistics   reading        │
│  personal  methods   draft       │
│     notes    project   2024      │
│                                  │
│ ⚠️ 2 unregistered tags [Review]  │
└──────────────────────────────────┘
```

---

## Technical Constraints

1. **Performance** - Tag scanning needs to be efficient
2. **Backward Compatibility** - Don't break existing tag data
3. **localStorage Limits** - Can't store too much state
4. **Tauri IPC** - Need backend support for orphan detection
5. **Real-time Updates** - Tags should sync when notes change

---

## Trade-offs

| Feature | Pros | Cons |
|---------|------|------|
| Tag Cloud | Visual, scannable | Less precise, takes space |
| Orphan Detection | Data integrity | Performance on large vaults |
| Inline Editing | Quick workflow | Accidental edits risk |
| AI Suggestions | Helpful | Needs AI integration |
| Compact Mode | More visible | Harder to read |

---

## Top 3 Recommendations

### 1. ⭐⭐ Orphan Tag Detection (User Request)
**Complexity:** Medium
**First Steps:**
1. Add API endpoint to scan notes for `#tag` patterns
2. Compare against registered tags in DB
3. Create "Unregistered Tags" section in panel
4. Add "Register" and "Register All" buttons
5. Style with warning indicator

### 2. ⭐⭐ Search + Recent Tags
**Complexity:** Low-Medium
**First Steps:**
1. Add search input at top of panel
2. Filter tags as user types (client-side)
3. Track recent tags in localStorage (last 10)
4. Display "Recent" section above "All Tags"

### 3. ⭐ Compact Mode + Visual Polish
**Complexity:** Low
**First Steps:**
1. Add compact mode toggle to header
2. Reduce padding/font when active
3. Add connecting lines for tree view
4. Improve visual hierarchy with subtle colors

---

## Implementation Status

### Sprint 15 (Quick Wins) ✅ COMPLETE
- [x] Search/filter bar - Real-time filtering with match count
- [x] Recent tags section - Tracks last 8 clicked, shows top 5
- [x] Compact mode toggle - Reduces padding/font sizes

### Sprint 16 (Core Feature) ✅ COMPLETE
- [x] Orphan tag detection - Scans all notes for unregistered `#tags`
- [x] Register unregistered tags - Single + "Register All" buttons
- [x] Tag management (rename/delete) - Right-click context menu

---

## Future Enhancements

### Sprint 17: Visual Improvements
| Feature | Effort | Description |
|---------|--------|-------------|
| Tag cloud view | Medium | Size-based frequency visualization |
| Tag icons/emoji | Low | Optional icon per tag for visual differentiation |
| Connecting lines | Low | Tree view indentation guides |
| Color picker | Low | Click color dot to change tag color |

### Sprint 18: Power User Features
| Feature | Effort | Description |
|---------|--------|-------------|
| Bulk operations | Medium | Multi-select tags for batch rename/delete/color |
| Keyboard shortcuts | Low | `t` to focus panel, `/` to search, numbers for recent |
| Tag merging | Medium | Select multiple → merge into one |
| Exclusion filters | Low | Filter notes WITHOUT certain tags |

### Sprint 19: Advanced Features
| Feature | Effort | Description |
|---------|--------|-------------|
| AI tag suggestions | High | Suggest tags based on note content |
| Tag templates | Medium | Preset tag groups for project types |
| Tag statistics | Low | Expandable stats per tag (last used, growth) |
| Tag relationships | Medium | Show related tags (often used together) |

### Backlog (Low Priority)
- [ ] Tag aliases (multiple names → same tag)
- [ ] Export/import tags
- [ ] Alphabetical jump (A-Z sidebar)
- [ ] Progress indicators (% of notes tagged)

---

## Technical Debt

### Backend Improvements Needed
1. **Hierarchical tag regex** - Current backend regex `#([a-zA-Z0-9_-]+)` doesn't capture `/` for hierarchical tags
2. **Tag-YAML sync** - Tags exist in DB tables AND can be in YAML frontmatter; needs unification
3. **Performance** - Orphan detection scans all notes; consider caching or incremental updates

---

## Completed Features Summary

```
TagsPanel Features (as of Sprint 16):
├── Header
│   ├── Title + tag count
│   ├── Compact mode toggle (Minimize2/Maximize2)
│   ├── Tree view toggle (Network icon)
│   └── Flat view toggle (List icon)
├── Search Bar
│   ├── Real-time filtering
│   ├── Clear button (X)
│   └── Match count display
├── Recent Tags Section
│   ├── Clock icon header
│   ├── Last 5 recently clicked
│   └── localStorage persistence
├── Unregistered Tags Section (warning style)
│   ├── AlertTriangle icon
│   ├── Individual register buttons
│   ├── "Register All" button
│   └── Note count per tag
├── This Note Section
│   └── Tags on current note (pill style)
├── All Tags Section
│   ├── Tree view (hierarchical)
│   ├── Flat view (alphabetical)
│   └── Right-click context menu
├── Context Menu
│   ├── Rename (with prompt)
│   └── Delete (with confirm)
└── Clear Filters Button
```

---

*Last updated: December 26, 2025 - Sprint 16 complete*
