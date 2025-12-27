# Sprint 17: Tags Visual + Polish

> **Goal:** Final polish before v1.0 release

---

## Overview

| Field | Value |
|-------|-------|
| **Sprint** | 17 |
| **Focus** | Tags Visual Improvements + v1.0 Polish |
| **Estimated** | 4 hours |
| **Status** | In Progress |
| **Started** | 2025-12-26 |

---

## Tasks

### Tags Visual Improvements

- [ ] **Tag color indicators** - Color dots/badges in tag list
- [ ] **Tag count badges** - Show note count per tag
- [ ] **Tag sorting options** - Alphabetical, by count, by recent
- [ ] **Tag drag-drop reorder** - Manual ordering in panel

### Writing Stats

- [ ] **Word count goal** - Set daily/session target
- [ ] **Progress indicator** - Visual bar in status area
- [ ] **Session stats** - Words written this session

### Note Search

- [ ] **Search within project** - ⌘F or search box
- [ ] **Search results panel** - Show matching notes
- [ ] **Search highlighting** - Highlight matches in results

### UI Polish

- [ ] **Reduced motion** - Respect system preference
- [ ] **Loading states** - Skeleton loaders
- [ ] **Error states** - User-friendly messages
- [ ] **Empty states** - Helpful prompts

---

## Acceptance Criteria

1. Tags panel shows color indicators and counts
2. Word count goal can be set and progress is visible
3. Notes can be searched within current context
4. All animations respect reduced motion preference
5. No console errors or warnings
6. All existing tests pass (483+)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/renderer/src/components/TagsPanel.tsx` | Color indicators, counts, sorting |
| `src/renderer/src/components/StatusBar.tsx` | Word count goal, progress |
| `src/renderer/src/components/SearchPanel.tsx` | New component |
| `src/renderer/src/store/settingsStore.ts` | Word count goal settings |
| `src/renderer/src/lib/themes.ts` | Reduced motion support |

---

## Notes

- Keep changes minimal - this is final polish before v1.0
- Focus on user-facing improvements
- Don't add new features, just polish existing ones
