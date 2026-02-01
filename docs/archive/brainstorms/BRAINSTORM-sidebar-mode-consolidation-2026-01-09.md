# BRAINSTORM: Sidebar Mode Consolidation & Persistence

**Generated:** 2026-01-09
**Mode:** Deep Feature Brainstorm (20 expert questions)
**Duration:** ~15 minutes
**Status:** ✅ Spec Approved & Implementation Started (2026-01-10)
**Spec:** docs/specs/SPEC-sidebar-mode-consolidation-2026-01-09.md

## Approval Summary (2026-01-10)

| Decision | Choice |
|----------|--------|
| **Release** | Mega v1.15.0 (combine with Sprint 35/36) |
| **Settings** | 2 toggles (removed auto-update preset) |
| **Testing** | Focused 30-40 E2E tests |
| **Sprint** | Late Sprint 36 work |

**Key Simplification:** Removed `appearance.alwaysUpdatePreset` toggle, replaced with "Don't ask again" checkbox in dialog (localStorage).

---

## Problem Statement

Currently, icon mode (48px collapsed) and expanded modes (Compact/Card) are separate systems:

- ⚠️ **Limited Scope:** Only Projects can expand; Inbox and Smart Folders stuck in icon-only mode
- ❌ **No Persistence:** Mode doesn't persist across collapse/expand cycles
- ❌ **No Visual Feedback:** Users don't know which mode will restore on expand
- ⚠️ **Inconsistent UX:** Different behaviors for different item types

---

## Key Insights from Q&A

### Current Behavior (from questions 1-4)

1. **Expand only for projects** - Inbox and Smart Folders can't expand currently
2. **User wants unified behavior** - All items should expand to same mode
3. **Always Compact default** - Compact is the intended default expanded state
4. **Preset controls mode** - Width preset (narrow/medium/wide) determines expand target

### Expansion & Triggers (from questions 5-8)

5. **Add expand to Inbox AND Smart Folders** - Full parity across all items
6. **Click + keyboard triggers** - Single click OR ⌘⇧[ expands
7. **Settings location** - Appearance › Sidebar Settings
8. **Dual persistence** - Settings for preference, localStorage for state

### Cycle & Interaction (from questions 9-12)

9. **Unified expansion** - All items expand to same mode (not independent)
10. **Three-way cycle** - Compact → Card → Icon (preset-aware)
11. **Preset sets mode** - narrow=Compact, wide=Card
12. **Animation preview on hover** - 300ms delay, then show expand target

### Priority & Logic (from questions 13-16)

13. **Preset respects cycle** - narrow: C→I, medium: C→I, wide: C→W→I
14. **System tooltip delay** - Honors OS tooltip timing (300-700ms)
15. **"Remember sidebar mode on collapse"** - Setting name
16. **Priority:** Setting ON: last mode | Setting OFF: preset

### Manual Resize (from questions 17-20)

17. **Prompt to update preset** - "Update preset to this width?"
18. **Immediate preset switch** - Changing preset while expanded → instant resize + mode change
19. **Each mode has width** - Compact remembers 240px, Card remembers 320px separately
20. **System tooltip delay** - Use OS preference for hover timing

### Empty States (from questions 21-24)

21. **Empty Inbox action** - "Inbox is empty" + Quick Capture button
22. **Empty Smart Folder** - "No [type] projects" + Create Project button
23. **Prompt on drag end** - Show "Update preset?" immediately after resize
24. **Migration: Default ON** - All users (new + existing) get "remember mode" enabled

### Keyboard & Accessibility (from questions 25-28)

25. **⌘⇧[ cycles only** - No separate shortcuts for specific modes
26. **User choice** - Settings override for reduced-motion (not auto-detect)
27. **Works immediately** - Preview animation on first hover (no training)
28. **Debounce 200ms** - Prevent rapid clicking spam

### Polish & Testing (from questions 29-32)

29. **No multi-window sync** - Each window has independent mode state
30. **ActivityBar indicator** - Show "Compact Mode" or "Card Mode" text
31. **"Always update" checkbox** - Remember user's preset update preference
32. **Comprehensive E2E tests** - Persistence, presets, cycles, animation timing

---

## Recommended Implementation Path

### Hybrid Path (6-7 hours)

**Phases:**
1. **State Management** (2h) - Add persistence layer, priority logic
2. **Cycle Behavior** (2h) - Preset-aware cycling with debounce
3. **Universal Expand** (2h) - Inbox + Smart Folders expansion
4. **Settings Integration** (1h) - 3 new toggles in Appearance
5. **Preset Dialog** (1h) - "Update preset?" prompt
6. **Mode Indicator** (30min) - ActivityBar footer label
7. **Migration** (30min) - v1.14.0 → v1.15.0 smooth upgrade

**Deferred to v1.16.0:**
- Preview animation (Phase 4) - Polish, not critical path

---

## Quick Wins

1. ⚡ Add `lastExpandedMode` state variable (15min)
2. ⚡ Update settings schema with 3 toggles (15min)
3. ⚡ Change ⌘⇧[ to cycle handler (15min)
4. ⚡ Add mode indicator to ActivityBar (30min)

---

## Medium Effort

1. 🔧 Implement cycle behavior with preset rules (2h)
2. 🔧 Add Inbox expand capability (1h)
3. 🔧 Add Smart Folder expand (1h)
4. 🔧 "Update preset?" dialog (1h)

---

## Long-term (v2.0)

1. 🏗️ Preview animation with content rendering
2. 🏗️ Per-item-type mode memory (Inbox separate from Projects)
3. 🏗️ Gesture support (trackpad swipe)
4. 🏗️ Mode presets ("Compact for work, Card for creative")

---

## Success Metrics

- **Discoverability:** 80%+ users discover expand within first session
- **Efficiency:** < 2 clicks to reach preferred mode
- **Consistency:** Same behavior for Projects, Inbox, Smart Folders
- **Performance:** Preview < 16ms frame time (60fps)

---

## Files to Modify

| File | Changes | Effort |
|------|---------|--------|
| `useAppViewStore.ts` | Add state + cycle logic | 2h |
| `settingsSchema.ts` | 3 new toggles | 15min |
| `App.tsx` | Expand handlers for all items | 1h |
| `IconBarMode.tsx` | Cycle behavior | 2h |
| `CompactListMode.tsx` | Inbox + Smart Folders | 1h |
| `CardViewMode.tsx` | Inbox + Smart Folders | 1h |
| `MissionSidebar.tsx` | Preset update dialog | 1h |
| `ActivityBar.tsx` | Mode indicator | 30min |
| `index.css` | Mode indicator styles | 15min |

**Total:** 6-7 hours

---

## Design Specifications

### Widths & Modes

| Preset | Width | Mode | Cycle |
|--------|-------|------|-------|
| Narrow | 200px | Compact | C ↔ I |
| Medium | 280px | Compact | C ↔ I |
| Wide | 360px | Card | C → W → I |

### Animation Timings

| Event | Timing | Easing |
|-------|--------|--------|
| Hover Delay | System tooltip delay | - |
| Preview | 150ms | ease-out |
| Full Expand | 200ms | ease-in-out |
| Cycle Debounce | 200ms | - |

---

## Open Questions (Remaining)

❓ **Q1:** Should clicking an already-expanded item cycle or do nothing?
**Recommendation:** Cycle always (consistent UX)

❓ **Q2:** Preview animation with content or just width?
**Recommendation:** Width only for v1.15.0, content for v2.0

---

## Next Steps

✅ **Brainstorm complete** - 20 expert questions answered
✅ **Spec captured** - See `docs/specs/SPEC-sidebar-mode-consolidation-2026-01-09.md`
→ **Spec review** - DT approval
→ **Phase 1 start** - State Management (2h)
→ **Ship v1.15.0** - Core feature without preview animation

---

**Saved:** 2026-01-09
**From:** /workflow:brainstorm deep feat
**Next:** Spec review and implementation approval
