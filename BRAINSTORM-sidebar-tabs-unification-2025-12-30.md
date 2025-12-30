# Brainstorm: Unify Right Sidebar Tabs with Editor Tab Bar

**Topic:** Make right sidebar tabs match editor tab bar styling & alignment
**Mode:** design | **Depth:** default | **Generated:** 2025-12-30

---

## Current State Analysis

### Visual Comparison (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CURRENT LAYOUT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LEFT         EDITOR TABS (44px, pills)                   RIGHT SIDEBAR    │
│  SIDEBAR      ┌────────────────────────────────────────┐  ┌──────────────┐ │
│  ┌──────┐     │ (●) Mission  (●) Note 1  (●) Note 2    │  │ Props│Links  │ │
│  │      │     └────────────────────────────────────────┘  │ Tags │Stats  │ │
│  │ Proj │     ┌────────────────────────────────────────┐  │ Claude│Term  │ │
│  │ List │     │                                        │  ├──────────────┤ │
│  │      │     │           EDITOR CONTENT               │  │              │ │
│  │      │     │                                        │  │   Content    │ │
│  │      │     │                                        │  │              │ │
│  └──────┘     └────────────────────────────────────────┘  └──────────────┘ │
│                                                                             │
│  Note: Editor tabs = PILLS, Sidebar tabs = TOP-ROUNDED RECTANGLES          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Styling Differences Table

| Aspect | Editor Tabs | Right Sidebar Tabs |
|--------|-------------|-------------------|
| **Shape** | Pill (border-radius: 999px) | Top-rounded (6px 6px 0 0) |
| **Container Height** | 44px | Variable (flex) |
| **Tab Height** | 32px | Unset |
| **Background (inactive)** | `rgba(128,128,128,0.08)` | transparent |
| **Background (active)** | `rgba(128,128,128,0.2)` | `var(--nexus-bg-primary)` |
| **Active Indicator** | Gradient accent bar (bottom) | Inset shadow underline |
| **Gap** | 6px | 2px |
| **Padding** | 6px 14px | 6px 8px |
| **Y Position** | Top of main content | Top of right sidebar |

### Key Files

| Component | File | Lines |
|-----------|------|-------|
| Editor tabs CSS | `src/renderer/src/components/EditorTabs/EditorTabs.css` | 7-212 |
| Sidebar tabs CSS | `src/renderer/src/index.css` | 254-309 |
| Sidebar tabs JSX | `src/renderer/src/App.tsx` | 1420-1467 |

---

## Design Options

### Option A: Style Match Only (Same Theme, Separate Rows)

**Keep tabs in separate areas but apply identical styling**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EDITOR TABS (44px)                                                         │
│  ┌────────────────────────────────────────┐   ┌─────────────────────────┐   │
│  │ (●) Mission  (●) Note 1  (●) Note 2    │   │ (Props)(Links)(Tags)(●) │   │
│  └────────────────────────────────────────┘   └─────────────────────────┘   │
│                                               ↑ Same pill style            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Changes:**
- Apply pill shape (border-radius: 999px) to `.sidebar-tab`
- Match 32px height, 6px gap
- Same background colors
- Add gradient accent bar for active state

**Effort:** ⚡ Quick (CSS only)

---

### Option B: Same Level (Unified Tab Row)

**Merge both tab bars into ONE horizontal strip at the top**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  UNIFIED TAB BAR (44px) - Editor tabs left, Sidebar tabs right              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ (●) Mission  (●) Note 1  (●) Note 2   │   (Props)(Links)(Tags)(●)    │   │
│  │ [Editor tabs]                          │   [Sidebar tabs]             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────┬─────────────────────────────┐   │
│  │           EDITOR CONTENT               │      SIDEBAR CONTENT        │   │
│  │           (full height)                │      (no header)            │   │
│  └────────────────────────────────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Changes:**
- Move sidebar tabs into EditorTabs component
- Add visual separator between groups
- Sidebar loses its own tab header
- EditorTabs spans full width

**Effort:** 🏗️ Large (layout restructure)

---

### Option C: Aligned Parallel Bars (Same Y, Different Areas)

**Keep separate bars but align them horizontally at same vertical level**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────┐   │
│  │ (●) Mission  (●) Note 1  (●) Note 2 │ │ (Props)(Links)(Tags)(●)     │   │
│  │ [Editor tabs - 44px]                │ │ [Sidebar tabs - 44px]       │   │
│  └─────────────────────────────────────┘ └─────────────────────────────┘   │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────┐   │
│  │                                     │ │                             │   │
│  │         EDITOR CONTENT              │ │      SIDEBAR CONTENT        │   │
│  │                                     │ │                             │   │
│  └─────────────────────────────────────┘ └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Changes:**
- Apply pill styling (same as A)
- Ensure both bars are 44px height
- Both start at same Y coordinate
- Layout restructure to put them in same row

**Effort:** 🔧 Medium (CSS + minor layout)

---

## Final Plan: Option A (Style Match) ✅

**Decision:** Same style, separate rows + settings-configurable indicator style

---

### Implementation Steps

#### Step 1: Update `.sidebar-tab` styling to pills

**File:** `src/renderer/src/index.css` (lines 268-296)

```css
.sidebar-tab {
  display: flex;
  align-items: center;
  gap: 6px;                           /* Was 4px */
  height: 32px;                       /* Match editor tab */
  padding: 6px 14px;                  /* Was 6px 8px */
  border-radius: 999px;               /* PILL shape (was 6px 6px 0 0) */
  font-size: 12px;
  font-weight: 500;
  background: rgba(128, 128, 128, 0.08);  /* Was transparent */
  color: var(--nexus-text-muted);
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.sidebar-tab:hover {
  background: rgba(128, 128, 128, 0.15);
  color: var(--nexus-text-primary);
}

.sidebar-tab.active {
  background: rgba(128, 128, 128, 0.2);   /* Was nexus-bg-primary */
  color: var(--nexus-text-primary);
}
```

#### Step 2: Update `.sidebar-tabs` container to match editor tabs

```css
.sidebar-tabs {
  display: flex;
  align-items: center;
  height: 44px;                       /* Match editor tabs container */
  padding: 4px 8px;                   /* Match editor tabs */
  gap: 6px;                           /* Was 2px */
  background: var(--nexus-bg-tertiary);
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
```

#### Step 3: Remove top padding from sidebar tabs

**File:** `src/renderer/src/App.tsx` (line 1421)

```tsx
// Change from:
<div className="sidebar-tabs pt-10" ...>

// To:
<div className="sidebar-tabs" ...>
```

#### Step 4: Add settings option for tab indicator style (Future)

The editor tabs already have a `tabBarStyle` setting with variants (subtle, elevated, glass, borderless). The sidebar tabs should inherit this setting so both tab areas look consistent.

**Optional enhancement:** In `SettingsModal.tsx`, the existing "Tab Bar Style" dropdown should affect both editor and sidebar tabs.

---

## Files to Modify

| File | Changes | Lines |
|------|---------|-------|
| `src/renderer/src/index.css` | Update `.sidebar-tab` and `.sidebar-tabs` | ~20 lines |
| `src/renderer/src/App.tsx` | Remove `pt-10` class | 1 line |

---

## Summary

| Before | After |
|--------|-------|
| Top-rounded rectangles | Pill shape (999px radius) |
| Transparent background | `rgba(128,128,128,0.08)` |
| 2px gap | 6px gap |
| Variable height | 32px fixed |
| Inset shadow indicator | Solid background |

**Effort:** ⚡ Quick (~15 min CSS-only change)
