# ORCHESTRATE: Responsive UI Enhancements

> **Feature branch:** `feature/responsive-ui`
> **Base:** `dev` (v1.21.0)
> **Target version:** v1.22.0
> **Estimated effort:** 22-32 hours across 5 increments

---

## Overview

Make Scribe's UI responsive to window resizing: auto-collapse sidebars, minimum window size, global zoom (⌘+/⌘-), window position memory, right sidebar resize handle, smooth animations, and full macOS window arrangement support (Stage Manager, split-screen, Sequoia snap zones).

---

## Increment 1: Foundation — Window Config + Memory + Transitions (~4-6h)

### Tasks

1. **Minimum window size** — `src-tauri/tauri.conf.json`
   - Add `"minWidth": 900, "minHeight": 600`
   - Add `"hiddenTitle": true` (removes redundant title text, we have breadcrumb)
   - Keep `"visible": true` initially (change to `false` after plugin works)

2. **Window state plugin** — Install `tauri-plugin-window-state`
   ```bash
   cd src-tauri && cargo add tauri-plugin-window-state
   npm install @tauri-apps/plugin-window-state
   ```
   - Register in `src-tauri/src/lib.rs`:
     ```rust
     .plugin(tauri_plugin_window_state::Builder::default().build())
     ```
   - Add permissions in `src-tauri/capabilities/default.json`:
     ```json
     "window-state:default"
     ```
   - After verified working, set `"visible": false` in tauri.conf.json to prevent flash

3. **CSS transition infrastructure** — `src/renderer/src/index.css`
   - Add to `.mission-sidebar`:
     ```css
     transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
     ```
   - Add `.resizing` class that sets `transition: none`
   - Extend `@media (prefers-reduced-motion: reduce)` to cover new transitions
   - Add right sidebar width transition (match pattern)

4. **macOS verification** — Manual testing
   - Stage Manager: drag window into stage groups
   - Split-screen: hold green traffic light, select tile position
   - Sequoia snap zones: drag to screen edges
   - ⌃⌘← / ⌃⌘→ keyboard tiling

### Files to Modify
- `src-tauri/tauri.conf.json` — minWidth, minHeight, hiddenTitle, visible
- `src-tauri/Cargo.toml` — add window-state plugin
- `src-tauri/src/lib.rs` — register plugin
- `src-tauri/capabilities/default.json` — add plugin permissions
- `package.json` — add @tauri-apps/plugin-window-state
- `src/renderer/src/index.css` — transitions

### Tests (~8 new)
- Config snapshot test for minWidth/minHeight
- CSS transition class assertions
- Window state plugin registration (mock)
- Reduced-motion class verification

### Commit: `feat(window): add minimum size, position memory, and transition infrastructure`

---

## Increment 2: Responsive Breakpoints — Auto-Collapse Sidebars (~6-8h)

### Tasks

1. **Create `useResponsiveLayout` hook** — New file: `src/renderer/src/hooks/useResponsiveLayout.ts`
   ```typescript
   const MIN_EDITOR_WIDTH = 500
   const ICON_WIDTH = 48

   // Debounced window resize listener (150ms)
   // Calculate: available = windowWidth - leftWidth - rightWidth
   // Collapse priority: right sidebar first, then left
   // Track userOverride to not fight manual re-expansion
   // Re-expand when window grows back
   ```

2. **Add auto-collapse state** — `src/renderer/src/store/useAppViewStore.ts`
   ```typescript
   autoCollapsedLeft: boolean   // true when collapsed by resize, not user
   autoCollapsedRight: boolean
   setAutoCollapsedLeft: (v: boolean) => void
   setAutoCollapsedRight: (v: boolean) => void
   ```

3. **Wire into App.tsx** — `src/renderer/src/App.tsx`
   - Call `useResponsiveLayout({ leftWidth, rightWidth, onCollapseLeft, onCollapseRight, onExpandLeft, onExpandRight })`
   - Keep separate from existing auto-collapse-on-typing (focus-based)
   - On collapse: set `autoCollapsed*` flag
   - On user manual expand: clear `autoCollapsed*` flag, set `userOverride`

### Collapse Priority Algorithm
```
When window resizes smaller:
  1. If editor < 500px and right sidebar expanded → collapse right to 48px icons
  2. If still < 500px and left sidebar expanded → collapse left to 48px icons
  3. If still < 500px and right sidebar at 48px → hide right completely (0px)

When window resizes larger:
  1. If autoCollapsedLeft and room for left sidebar → re-expand left
  2. If autoCollapsedRight and room for right sidebar → re-expand right
  3. Never re-expand if user manually collapsed (userOverride check)
```

### Files to Modify
- New: `src/renderer/src/hooks/useResponsiveLayout.ts`
- `src/renderer/src/store/useAppViewStore.ts` — auto-collapse flags
- `src/renderer/src/App.tsx` — hook integration

### Tests (~10-12 new)
- Hook triggers collapse at correct threshold
- Right collapses before left (priority)
- User override prevents re-collapse
- Window grow re-expands auto-collapsed
- Both sidebars collapsed = editor fills space
- Edge case: start at narrow width

### Commit: `feat(layout): auto-collapse sidebars on window resize`

---

## Increment 3: Right Sidebar Parity — Resize Handle + Width Constants (~5-7h)

### Tasks

1. **Add right sidebar width constants** — `src/renderer/src/store/useAppViewStore.ts`
   ```typescript
   export const RIGHT_SIDEBAR_WIDTHS = {
     icon: 48,
     expanded: { default: 320, min: 250, max: 600 }
   }
   ```

2. **Replace inline resize handler with ResizeHandle** — `src/renderer/src/App.tsx`
   - Remove `isResizingRight` state and the `useEffect` mousedown/mousemove/mouseup handler (~lines 635-654)
   - Add `<ResizeHandle>` component before right sidebar `<aside>`
   - Negate deltaX (right sidebar grows leftward):
     ```tsx
     <ResizeHandle
       onResize={(deltaX) => {
         const newWidth = clamp(rightSidebarWidth - deltaX, RIGHT_SIDEBAR_WIDTHS.expanded.min, RIGHT_SIDEBAR_WIDTHS.expanded.max)
         setRightSidebarWidth(newWidth)
       }}
       onResizeEnd={() => localStorage.setItem('rightSidebarWidth', String(rightSidebarWidth))}
       onReset={() => { setRightSidebarWidth(320); localStorage.setItem('rightSidebarWidth', '320') }}
     />
     ```

3. **Formalize right sidebar icon mode** — Already partially implemented
   - Use `RIGHT_SIDEBAR_WIDTHS.icon` constant for collapsed width
   - Ensure icon buttons match left sidebar icon bar styling

### Files to Modify
- `src/renderer/src/store/useAppViewStore.ts` — RIGHT_SIDEBAR_WIDTHS
- `src/renderer/src/App.tsx` — replace inline handler, add ResizeHandle

### Tests (~6-8 new)
- Right sidebar ResizeHandle works (reversed deltaX)
- Double-click resets to 320px default
- Min/max constraints enforced (250-600px)
- localStorage persistence on resize end

### Commit: `feat(sidebar): add right sidebar resize handle and width constants`

---

## Increment 4: Global Zoom — ⌘+/⌘- (~4-6h)

### Tasks

1. **Create `useGlobalZoom` hook** — New file: `src/renderer/src/hooks/useGlobalZoom.ts`
   ```typescript
   // Tauri: getCurrentWindow().setZoom(factor)
   // Browser: document.documentElement.style.fontSize = `${factor * 100}%`
   // Range: 0.5 to 2.0 (WCAG 1.4.4 compliant)
   // Steps: 0.1 increments
   // Persist: localStorage 'scribe:zoomLevel'
   // Returns: { zoomLevel, zoomIn, zoomOut, resetZoom }
   ```

2. **Add keyboard shortcuts** — `src/renderer/src/lib/shortcuts.ts`
   ```typescript
   ZOOM_IN:    { key: '=', meta: true, label: '⌘+', description: 'Zoom in' },
   ZOOM_OUT:   { key: '-', meta: true, label: '⌘-', description: 'Zoom out' },
   ZOOM_RESET: { key: '0', meta: true, label: '⌘0', description: 'Reset zoom' },
   ```

3. **Wire shortcuts** — `src/renderer/src/components/KeyboardShortcutHandler.tsx`
   - Add cases for zoom in/out/reset
   - Call hook methods

4. **Status bar indicator** — Show "120%" text in StatusBar
   - Click to reset zoom
   - Only show when zoom ≠ 100%

5. **Settings UI** — Add zoom slider to Settings > Appearance
   - Range slider 50%-200%
   - +/- buttons
   - Reset button

### Files to Modify
- New: `src/renderer/src/hooks/useGlobalZoom.ts`
- `src/renderer/src/lib/shortcuts.ts` — zoom shortcut definitions
- `src/renderer/src/components/KeyboardShortcutHandler.tsx` — wire shortcuts
- `src/renderer/src/App.tsx` or StatusBar component — zoom indicator
- Settings Appearance tab — zoom control

### Tests (~8-10 new)
- Zoom increments within 0.5-2.0 range
- ⌘0 resets to 1.0
- Persistence across reload
- Status bar shows correct level
- Settings slider updates zoom

### Commit: `feat(zoom): add global UI zoom with ⌘+/⌘- shortcuts`

---

## Increment 5: Polish — Touch, Animation, Accessibility (~3-5h)

### Tasks

1. **Touch support for ResizeHandle** — `src/renderer/src/components/sidebar/ResizeHandle.tsx`
   - Add `onTouchStart` handler alongside `onMouseDown`
   - Add document-level `touchmove`/`touchend` listeners in useEffect
   - Use `e.touches[0].clientX` for position

2. **Disable transitions during drag** — `src/renderer/src/index.css` + ResizeHandle
   - Add/remove `.resizing` class on sidebar parent during drag
   - `.resizing` → `transition: none !important`

3. **Reduced-motion audit** — `src/renderer/src/index.css`
   - Ensure ALL new transitions covered by `@media (prefers-reduced-motion: reduce)`
   - Check: left sidebar, right sidebar, zoom transitions

### Files to Modify
- `src/renderer/src/components/sidebar/ResizeHandle.tsx` — touch events
- `src/renderer/src/index.css` — .resizing class, reduced-motion
- `src/renderer/src/components/sidebar/MissionSidebar.tsx` — add .resizing class during drag

### Tests (~4-6 new)
- Touch events on ResizeHandle
- `.resizing` class applied during drag
- Transitions disabled for reduced-motion users

### Commit: `feat(a11y): add touch resize support and animation polish`

---

## Final Checklist

- [ ] All 2,280+ tests pass
- [ ] TypeScript clean (no new errors)
- [ ] macOS Stage Manager works
- [ ] macOS split-screen works (⌃⌘←/→)
- [ ] macOS Sequoia snap zones work
- [ ] Window remembers position/size across restarts
- [ ] Left sidebar auto-collapses at breakpoint
- [ ] Right sidebar auto-collapses at breakpoint
- [ ] Right sidebar has drag resize handle
- [ ] ⌘+/⌘-/⌘0 zoom works
- [ ] Animations smooth (200ms) with reduced-motion respected
- [ ] CHANGELOG updated
- [ ] .STATUS updated
- [ ] Create PR: `feature/responsive-ui → dev`

---

## Dependency Graph

```
Increment 1 (Foundation)
    ├── Increment 2 (Breakpoints) ─── depends on transition CSS
    ├── Increment 3 (Right Sidebar) ─ independent
    └── Increment 4 (Zoom) ────────── independent
                                          │
Increment 5 (Polish) ──────────── depends on Inc 3 (ResizeHandle touch)
```

**Recommended order:** 1 → 2 → 3 → 4 → 5 (sequential for clean PRs)
