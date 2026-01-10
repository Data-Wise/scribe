# Accessibility Tracking - Scribe

> **Phase 4 Task 12:** Systematic accessibility improvements

**Status:** Infrastructure complete, gradual improvement in progress
**ESLint Plugin:** eslint-plugin-jsx-a11y v6.10.2 installed ✅
**Configuration:** All violations currently warnings (not blocking)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total violations** | 83 |
| **Files affected** | ~25 components |
| **Blocking errors** | 0 (all warnings) |

---

##Violation Breakdown

| Rule | Count | Severity | Priority |
|------|-------|----------|----------|
| `label-has-associated-control` | 31 | Medium | P2 |
| `no-static-element-interactions` | 21 | High | P1 |
| `click-events-have-key-events` | 17 | High | P1 |
| `no-autofocus` | 6 | Low | P3 |
| `no-noninteractive-element-interactions` | 3 | Medium | P2 |
| `anchor-is-valid` | 2 | Medium | P2 |
| `no-noninteractive-tabindex` | 1 | Low | P3 |
| `no-noninteractive-element-to-interactive-role` | 1 | Low | P3 |
| `interactive-supports-focus` | 1 | High | P1 |

---

## Priority 1: Keyboard Navigation (High Impact)

**Issue:** Clickable elements without keyboard support
**Affected Rules:**
- `click-events-have-key-events` (17 violations)
- `no-static-element-interactions` (21 violations)
- `interactive-supports-focus` (1 violation)

**Impact:** Keyboard-only users cannot access these elements

### Example Fix Pattern

**Before:**
```tsx
<div onClick={handleClick}>Click me</div>
```

**After:**
```tsx
<button onClick={handleClick} className="...">
  Click me
</button>

// OR if div is required for styling:
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Click me
</div>
```

### Files to Fix (P1)
- [ ] `App.tsx` - 14 violations
- [ ] `SettingsModal.tsx` - 8 violations
- [ ] `ProjectsPanel.tsx` - 3 violations
- [ ] `TagsPanel.tsx` - 2 violations

---

## Priority 2: Form Accessibility (Medium Impact)

**Issue:** Form labels not associated with controls
**Affected Rule:**
- `label-has-associated-control` (31 violations)

**Impact:** Screen readers cannot announce label/input relationships

### Example Fix Pattern

**Before:**
```tsx
<label>Name</label>
<input type="text" value={name} onChange={setName} />
```

**After:**
```tsx
<label htmlFor="name-input">Name</label>
<input
  id="name-input"
  type="text"
  value={name}
  onChange={setName}
  aria-label="Name"
/>
```

### Files to Fix (P2)
- [ ] `App.tsx` - 25 violations
- [ ] `SettingsModal.tsx` - 4 violations
- [ ] `CreateProjectModal.tsx` - 2 violations

---

## Priority 3: UX Polish (Low Impact)

**Issue:** Autofocus usage, invalid anchors
**Affected Rules:**
- `no-autofocus` (6 violations)
- `anchor-is-valid` (2 violations)

**Impact:** Minor usability issues, not blocking

### Autofocus Fix Pattern

**Before:**
```tsx
<input autoFocus type="text" />
```

**After:**
```tsx
<input
  ref={(input) => input?.focus()}
  type="text"
/>
```

### Anchor Fix Pattern

**Before:**
```tsx
<a href="#" onClick={handleClick}>Link</a>
```

**After:**
```tsx
<button onClick={handleClick} className="text-blue-500 underline">
  Link
</button>
```

---

## Implementation Plan

### Sprint 35 (Next Sprint)
**Goal:** Fix all P1 violations (keyboard navigation)

**Tasks:**
1. Create reusable `<InteractiveDiv>` component with keyboard support
2. Replace clickable divs in App.tsx (14 violations)
3. Replace clickable divs in SettingsModal.tsx (8 violations)
4. Add keyboard event handlers to remaining components

**Estimated effort:** 4-6 hours

### Sprint 36
**Goal:** Fix all P2 violations (form labels)

**Tasks:**
1. Create form input wrapper with auto-generated IDs
2. Audit all `<label>` + `<input>` pairs
3. Add `htmlFor` and `id` attributes systematically

**Estimated effort:** 3-4 hours

### Sprint 37
**Goal:** Fix all P3 violations (polish)

**Tasks:**
1. Replace `autoFocus` with `useEffect(() => inputRef.current?.focus())`
2. Convert invalid anchors to buttons with link styling

**Estimated effort:** 2-3 hours

---

## ESLint Configuration

**File:** `eslint.config.js`

```javascript
// Accessibility - Phase 4: Gradual improvement (warnings for now)
// These will be fixed systematically in future sprints
'jsx-a11y/click-events-have-key-events': 'warn',
'jsx-a11y/no-static-element-interactions': 'warn',
'jsx-a11y/no-autofocus': 'warn',
'jsx-a11y/label-has-associated-control': 'warn',
'jsx-a11y/no-noninteractive-element-interactions': 'warn',
'jsx-a11y/anchor-is-valid': 'warn',
'jsx-a11y/interactive-supports-focus': 'warn',
'jsx-a11y/no-noninteractive-tabindex': 'warn',
'jsx-a11y/no-noninteractive-element-to-interactive-role': 'warn',
```

**Strategy:** Warnings allow development to continue while tracking issues for systematic fixes.

---

## Resources

- [eslint-plugin-jsx-a11y Documentation](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)

---

## Testing Checklist

When fixing violations, test with:
- ✅ Keyboard only (Tab, Enter, Space, Arrow keys)
- ✅ Screen reader (VoiceOver on Mac, NVDA on Windows)
- ✅ High contrast mode
- ✅ Zoom to 200%

---

**Last Updated:** 2026-01-09
**Next Review:** Sprint 35
**Owner:** Development Team
