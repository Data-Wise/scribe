# ActivityBar Component

**Location**: `src/renderer/src/components/sidebar/ActivityBar.tsx`

## Overview

The ActivityBar is a fixed bottom section of the sidebar that provides quick access to three core application functions:

- **Search** - Opens the search panel (⌘K)
- **Daily Note** - Opens/creates today's daily note (⌘D)
- **Settings** - Opens the settings modal (⌘,)

## Design

The ActivityBar follows Scribe's established design patterns from the IconBarMode:

- 48px wide buttons (matching sidebar icon width)
- 16px icon size
- Vertical stacking with minimal gap
- Active state with left border accent (matching project icons)
- Hover states with subtle background
- Keyboard accessibility with focus-visible states

## Usage

```tsx
import { ActivityBar } from './components/sidebar/ActivityBar'

function Sidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="sidebar">
      {/* Sidebar content */}

      <ActivityBar
        onSearch={() => setIsSearchOpen(true)}
        onDaily={() => handleDailyNote()}
        onSettings={() => setIsSettingsOpen(true)}
        activeItem={isSearchOpen ? 'search' : null}
      />
    </div>
  )
}
```

## Props

```typescript
interface ActivityBarProps {
  onSearch: () => void
  onDaily: () => void
  onSettings: () => void
  activeItem?: 'search' | 'daily' | 'settings' | null
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSearch` | `() => void` | Yes | Callback when search button clicked |
| `onDaily` | `() => void` | Yes | Callback when daily note button clicked |
| `onSettings` | `() => void` | Yes | Callback when settings button clicked |
| `activeItem` | `'search' \| 'daily' \| 'settings' \| null` | No | Which button should show active state |

## Active State

The `activeItem` prop controls which button appears active:

- When set, the corresponding button gets:
  - `active` CSS class
  - Accent color text
  - Left border indicator (3px accent color)
  - Tertiary background color

## CSS Classes

### Component Classes

- `.activity-bar` - Container with border-top separator
- `.activity-bar-btn` - Individual button base styles
- `.activity-bar-btn.active` - Active state styling

### Theme Support

Both dark and light themes are supported:

```css
/* Dark theme (default) */
.activity-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.activity-bar-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* Light theme */
:root[data-theme-type="light"] .activity-bar {
  border-top-color: rgba(0, 0, 0, 0.08);
}

:root[data-theme-type="light"] .activity-bar-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}
```

## Accessibility

The component follows accessibility best practices:

1. **Keyboard Navigation**: All buttons are keyboard accessible via Tab
2. **Focus Indicators**: `:focus-visible` styles for keyboard focus
3. **ARIA Labels**: Each button has `aria-label` for screen readers
4. **Tooltips**: Native `title` attribute shows keyboard shortcuts
5. **Semantic HTML**: Uses `<button>` elements (not divs)

### Test Coverage

```bash
npm test -- ActivityBar.test.tsx
```

**Test Suite**: `src/renderer/src/__tests__/ActivityBar.test.tsx`

- ✅ Rendering all three buttons
- ✅ Correct titles and tooltips
- ✅ ARIA labels
- ✅ Click handlers
- ✅ Active state management
- ✅ Keyboard accessibility

**Coverage**: 16 passing tests

## Visual Specification

```
┌─────────────────┐
│                 │
│  Sidebar        │
│  Content        │
│                 │
├─────────────────┤ ← border-top separator
│                 │
│    🔍 Search    │ ← 48x48px button, 16px icon
│                 │
│    📅 Daily     │ ← 4px gap
│                 │
│    ⚙️ Settings  │
│                 │
└─────────────────┘
```

### Active State Visual

```
┌─────────────────┐
│█                │ ← 3px accent border on left
││   🔍 Search    │ ← accent color icon
│█                │ ← tertiary background
└─────────────────┘
```

## Integration Points

The ActivityBar is designed to be added to any sidebar mode:

### Icon Mode (48px)
```tsx
<div className="mission-sidebar-icon">
  <button className="sidebar-toggle-btn">...</button>
  <div className="project-icons">...</div>
  <div className="sidebar-spacer" />

  <ActivityBar {...handlers} />
</div>
```

### Compact Mode (240px)
```tsx
<div className="mission-sidebar-compact">
  <div className="sidebar-header">...</div>
  <div className="sidebar-content">...</div>

  <ActivityBar {...handlers} />
</div>
```

### Card Mode (320px+)
```tsx
<div className="mission-sidebar-card">
  <div className="sidebar-header">...</div>
  <div className="sidebar-content">...</div>

  <ActivityBar {...handlers} />
</div>
```

## Related Components

- **IconBarMode** - Uses similar icon button patterns
- **StatusDot** - Similar visual indicator pattern
- **ProjectIconButton** - Similar active state styling

## Implementation Notes

1. **Fixed Position**: The ActivityBar should be positioned at the bottom of the sidebar using flexbox (not absolute positioning)

2. **Z-Index**: No z-index needed - relies on natural stacking order

3. **Responsive**: Width adapts to sidebar mode (48px for icon, full width for compact/card)

4. **No State**: Component is fully controlled - parent manages active state

5. **Icons**: Uses lucide-react icons (Search, Calendar, Settings) at 16px

## Future Enhancements

Potential additions (not in current scope):

- [ ] Badge indicators (e.g., unread count on search)
- [ ] Context menu on right-click
- [ ] Drag-to-reorder buttons
- [ ] Custom button configurations
- [ ] Animation on active state changes
