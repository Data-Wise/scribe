# Theme-Aware Status Dots

**Implementation Date:** 2026-01-09
**Feature:** CSS variable-based status dots that adapt to all Scribe themes
**Inspired by:** Obsidian's Rainbow-Colored Sidebar plugin

---

## Overview

Status dots in Scribe's sidebar now use CSS variables instead of hardcoded colors, allowing them to adapt automatically to all 10 built-in themes (5 dark, 5 light).

## Changes

### 1. CSS Variables (index.css)

Added semantic status color variables to each theme:

```css
/* Example: Oxford Dark theme */
:root.oxford-dark {
  /* Status colors - theme-aware */
  --status-active: #22c55e;      /* Green - active work */
  --status-planning: #3b82f6;    /* Blue - planning stage */
  --status-complete: #8b5cf6;    /* Purple - finished */
  --status-archive: #6b7280;     /* Gray - archived */
}
```

**Color Scheme:**
- **Active:** Green (varies by theme: #22c55e to #34d399)
- **Planning:** Blue (varies by theme: #3b82f6 to #7dd3fc)
- **Complete:** Purple (varies by theme: #8b5cf6 to #d8b4fe)
- **Archive:** Gray (varies by theme: #6b7280 to #a8a29e)

Each theme has its own variations to maintain visual harmony with the theme's color palette.

### 2. StatusDot Component (StatusDot.tsx)

**Before:**
```typescript
const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: '#22c55e',    // Hardcoded green
  planning: '#3b82f6',  // Hardcoded blue
  complete: '#8b5cf6',  // Hardcoded purple
  archive: '#6b7280'    // Hardcoded gray
}
```

**After:**
```typescript
const STATUS_CSS_VARS: Record<ProjectStatus, string> = {
  active: 'var(--status-active)',
  planning: 'var(--status-planning)',
  complete: 'var(--status-complete)',
  archive: 'var(--status-archive)',
}
```

**Features:**
- Semantic CSS variables that respond to theme changes
- Tooltip on hover showing status name
- Smooth 150ms transition on color changes
- Size variants: sm (8px), md (12px), lg (16px)
- Full accessibility with aria-label and title attributes

### 3. Test Coverage

Created comprehensive test suite (`__tests__/StatusDot.test.tsx`):
- 25 tests covering all functionality
- Tests rendering with all status types
- Tests size variants (sm, md, lg)
- Tests styling and transitions
- Tests accessibility (aria-label, title)
- Tests theme awareness via CSS variables
- Tests fallback behavior for invalid status
- Tests getStatusColor() utility function

**Test Results:** ✅ 25/25 passing

## Benefits

1. **Theme Consistency:** Status dots now harmonize with each theme's color palette
2. **ADHD-Friendly:** Colors chosen for each theme maintain appropriate contrast without being overwhelming
3. **Automatic Updates:** Changing themes instantly updates all status dots
4. **Maintainability:** Single source of truth for colors (CSS variables)
5. **Extensibility:** Easy to add new themes by defining 4 CSS variables

## Theme-Specific Colors

### Dark Themes

| Theme | Active | Planning | Complete | Archive |
|-------|--------|----------|----------|---------|
| Oxford Dark | #22c55e | #3b82f6 | #8b5cf6 | #6b7280 |
| Forest Night | #34d399 | #60a5fa | #a78bfa | #9ca3af |
| Warm Cocoa | #4ade80 | #60a5fa | #c084fc | #a8a29e |
| Midnight Purple | #34d399 | #60a5fa | #d8b4fe | #a1a1aa |
| Deep Ocean | #34d399 | #7dd3fc | #a78bfa | #94a3b8 |

### Light Themes

| Theme | Active | Planning | Complete | Archive |
|-------|--------|----------|----------|---------|
| Soft Paper | #059669 | #2563eb | #7c3aed | #57534e |
| Morning Fog | #059669 | #2563eb | #7c3aed | #525252 |
| Sage Garden | #15803d | #2563eb | #7c3aed | #52525b |
| Lavender Mist | #059669 | #2563eb | #6d28d9 | #57534e |
| Sand Dune | #059669 | #2563eb | #7c3aed | #78716c |

## Usage Example

```tsx
import { StatusDot } from './components/sidebar/StatusDot'

// Basic usage
<StatusDot status="active" />

// With size variant
<StatusDot status="planning" size="lg" />

// With custom className
<StatusDot status="complete" size="md" className="mr-2" />

// Get color programmatically
import { getStatusColor } from './components/sidebar/StatusDot'
const color = getStatusColor('active') // Returns 'var(--status-active)'
```

## Future Enhancements

Potential improvements for future versions:

1. **Animation on status change:** Add subtle pulse or fade animation when status changes
2. **Custom status colors:** Allow users to customize status colors in settings
3. **Accessibility modes:** High-contrast or colorblind-friendly alternatives
4. **Status patterns:** Add patterns (stripes, dots) for additional differentiation beyond color

## Related Files

- `/src/renderer/src/index.css` - CSS variable definitions
- `/src/renderer/src/components/sidebar/StatusDot.tsx` - Component implementation
- `/src/renderer/src/components/sidebar/__tests__/StatusDot.test.tsx` - Test suite
- `/src/renderer/src/types/index.ts` - ProjectStatus type definition

## References

- [Obsidian Rainbow-Colored Sidebar Plugin](https://github.com/CyanVoxel/Obsidian-Colored-Sidebar)
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- ADHD-Friendly Design Principles (Scribe PROJECT-DEFINITION.md)
