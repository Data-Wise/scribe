# Visual Testing Guide - Drag-Drop Feedback

**Date:** 2026-01-09
**Feature:** Project icon drag-and-drop visual feedback
**Branch:** `feat/sidebar-v2`
**Commit:** `d6a4921`

---

## Quick Test (5 minutes)

### Setup
```bash
cd /Users/dt/.git-worktrees/scribe/sidebar-v2
npm run dev:vite
# Open http://localhost:5173 in browser
```

### Test Checklist

#### 1. Basic Drag-Drop
- [ ] Click and hold on a project icon in Icon Bar mode
- [ ] **Expected:** Icon opacity reduces to 50%, scales down slightly
- [ ] **Expected:** Cursor changes to "grabbing" hand
- [ ] Move mouse over another project icon
- [ ] **Expected:** Blue pulsing line appears above the target icon
- [ ] **Expected:** Target icon has subtle blue background glow
- [ ] Release mouse to drop
- [ ] **Expected:** Brief bounce animation on the dropped icon
- [ ] **Expected:** Project order changes successfully

#### 2. Visual States

**Drag Start:**
- [ ] Item being dragged has reduced opacity
- [ ] Item scales down slightly (0.95)
- [ ] Cursor is "grabbing" (closed hand)

**Drag Over:**
- [ ] Blue line (2px) appears above target icon
- [ ] Line pulses with glow effect
- [ ] Target has subtle background color
- [ ] Line is centered horizontally

**Drop Success:**
- [ ] Brief bounce animation (< 300ms)
- [ ] Icon scales up slightly then back to normal
- [ ] Animation feels snappy, not laggy

#### 3. Theme Testing

**Dark Theme:**
- [ ] Blue accent color is visible (#3b82f6)
- [ ] Glow effect is visible but not too bright
- [ ] Pulsing animation is smooth

**Light Theme:**
- [ ] Blue accent color is still visible
- [ ] Glow effect adapts to light background
- [ ] All states remain clear

#### 4. Accessibility

**Reduced Motion:**
```bash
# Enable in System Settings:
# Accessibility → Display → Reduce motion
```

- [ ] Open browser with reduced motion enabled
- [ ] Drag a project icon
- [ ] **Expected:** NO pulse animation
- [ ] **Expected:** NO bounce animation
- [ ] **Expected:** NO transitions (instant state changes)
- [ ] **Expected:** Drag-drop still WORKS functionally

#### 5. Edge Cases

**Fast Drag:**
- [ ] Quickly drag and drop
- [ ] **Expected:** Animations don't overlap or glitch
- [ ] **Expected:** State resets cleanly

**Drag Outside:**
- [ ] Drag icon outside the sidebar area
- [ ] **Expected:** No drop occurs
- [ ] **Expected:** State resets to original position

**Multiple Icons:**
- [ ] Pin 5+ projects
- [ ] Drag from first to last position
- [ ] **Expected:** Smooth transition
- [ ] **Expected:** All icons maintain proper spacing

---

## Visual Regression Checklist

### Icon Bar Mode (Primary Test Area)

- [ ] Project icons display correctly
- [ ] Status dots are visible
- [ ] Note count badges are visible
- [ ] Drag handle (grab cursor) appears on hover
- [ ] Active indicator (blue bar) still works
- [ ] Tooltips still appear on hover
- [ ] Smart icons are not draggable
- [ ] Inbox icon is not draggable

### Compact List Mode (Should Be Unaffected)

- [ ] Compact list mode displays correctly
- [ ] No drag-drop cursors appear
- [ ] All existing functionality works
- [ ] No CSS bleed from Icon Bar styles

---

## Performance Check

### Animation Smoothness

- [ ] Pulse animation runs at 60fps
- [ ] No jank or stuttering during drag
- [ ] Bounce animation is smooth
- [ ] Browser doesn't freeze

### Memory/CPU

- [ ] Open DevTools → Performance
- [ ] Record while dragging 10 times
- [ ] **Expected:** No memory leaks
- [ ] **Expected:** CPU usage returns to baseline

---

## Browser Compatibility

Test in multiple browsers:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | [ ]    |
| Firefox | Latest  | [ ]    |
| Safari  | Latest  | [ ]    |
| Edge    | Latest  | [ ]    |

---

## Screenshots/Recording

### Record a GIF (Optional)

```bash
# Use Kap or similar tool
# Record:
# 1. Drag start (opacity/scale change)
# 2. Drag over (pulsing line)
# 3. Drop success (bounce)
```

Save to: `/Users/dt/.git-worktrees/scribe/sidebar-v2/docs/demos/drag-drop-feedback.gif`

---

## Known Issues

### Pre-Existing TypeScript Errors
- ActivityBar `onRecent` prop errors (not introduced by this change)
- ChildProjectIdentification test errors (pre-existing)
- These do NOT affect drag-drop functionality

### Browser-Specific Notes
- **Safari:** CSS animations may be slightly different timing
- **Firefox:** Drag ghost preview may look different (normal HTML5 drag API behavior)

---

## Success Criteria

All of the following must pass:

1. ✅ Drag-drop works functionally (project order changes)
2. ✅ Visual feedback is clear and non-distracting
3. ✅ Animations are smooth (60fps)
4. ✅ Reduced motion is respected
5. ✅ Works in all major browsers
6. ✅ No regressions in other sidebar features
7. ✅ ADHD-friendly (fast, clear, predictable)

---

## Rollback Plan

If visual feedback causes issues:

```bash
# Revert to previous commit
git revert d6a4921

# Or disable animations via CSS
# Add to index.css:
.project-icon-btn.dragging,
.project-icon-btn.drag-over::before,
.project-icon-btn.drop-success {
  animation: none !important;
  transition: none !important;
}
```

---

## Next Steps After Testing

1. **If tests pass:** Merge to `dev` branch
2. **If issues found:** Document in GitHub issue, fix before merge
3. **User feedback:** Monitor Discord/GitHub for user reports
4. **Performance:** Profile in production build

---

## Feedback Template

```markdown
**Feature:** Drag-drop visual feedback
**Date:** 2026-01-XX
**Tester:** [Your name]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge] [Version]
- OS: macOS [Version]
- Reduced Motion: [Enabled/Disabled]

**Test Results:**
- [ ] Basic drag-drop works
- [ ] Visual feedback is clear
- [ ] Animations are smooth
- [ ] Reduced motion respected
- [ ] No regressions found

**Issues Found:**
1. [Description]
2. [Description]

**Overall Rating:** [Pass/Fail/Needs Improvement]

**Notes:**
[Additional comments]
```

---

## Developer Notes

- Animations use `var(--nexus-accent)` for theme compatibility
- Z-index on drop indicator: 10 (above other sidebar elements)
- Animation timing: 150ms transitions, 300ms bounce
- Pulse animation: 1s infinite ease-in-out
- CSS class lifecycle: `.dragging` → `.drag-over` → `.drop-success` → clean
