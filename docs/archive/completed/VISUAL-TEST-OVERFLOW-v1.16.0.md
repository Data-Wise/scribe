# Visual Testing Guide: v1.16.0 Overflow Scenarios

**Date:** 2026-01-10
**Purpose:** Test text overflow handling in icon-centric sidebar
**Browser:** http://localhost:5173/

---

## 🎯 Test Scenarios

### 1. Icon Bar Overflow (Strip Sidebar)

**What to test:** Very long project names in the 48px icon bar

**Steps:**
1. Open http://localhost:5173/ in Chrome
2. Create a new project with a very long name:
   - Name: `This Is A Really Extremely Long Project Name That Should Test Overflow Behavior In The Icon Strip`
3. Pin the project to the sidebar (if not already pinned)
4. Observe the icon in the 48px icon bar

**Expected behavior:**
- ✅ Icon shows first letter or emoji only (no text visible)
- ✅ Tooltip appears on hover showing full project name
- ✅ No horizontal overflow or text clipping issues

**Current CSS (should be working):**
```css
.project-icon-btn {
  width: 32px;
  height: 32px;
  /* Icon only, no text */
}
```

---

### 2. Compact Mode Overflow (Expanded Panel)

**What to test:** Long project and note names in compact list view

**Steps:**
1. Click the project icon to expand in compact mode
2. Create notes with very long titles:
   - `This is an extremely long note title that should demonstrate text overflow behavior in compact mode`
   - `Another very long note name with many words to test ellipsis truncation`
3. Observe how titles are displayed

**Expected behavior:**
- ✅ Project names truncate with ellipsis (`...`)
- ✅ Note titles truncate with ellipsis
- ✅ No horizontal scrolling in the panel
- ✅ Hover shows full title in tooltip (if implemented)

**Affected CSS classes:**
```css
.compact-project-item .project-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-project-wrapper .project-note-item .note-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

### 3. Card Mode Overflow (Expanded Panel)

**What to test:** Long names in card grid view

**Steps:**
1. Click mode toggle to switch to card view
2. Observe project cards with long names
3. Check note titles in expanded project cards

**Expected behavior:**
- ✅ Project names in cards truncate properly
- ✅ Descriptions use line-clamp for 2 lines
- ✅ No card width overflow

**Affected CSS:**
```css
.project-card .project-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card .project-description {
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

### 4. ExpandedIconPanel Width Test

**What to test:** Panel width doesn't break layout with long content

**Steps:**
1. Expand Inbox (should show notes list)
2. Create many notes with varying title lengths
3. Resize sidebar width using resize handle
4. Switch between compact and card modes

**Expected behavior:**
- ✅ Panel respects width constraints
- ✅ Content doesn't overflow panel boundaries
- ✅ Scrolling works for long lists (vertical only)
- ✅ No horizontal scrolling

---

## 🐛 Known Issues (from user report)

### Issue 1: Icon Bar - Very Big Project Folder Name
**Reported:** "Add projects folder is very big and test overflow on the strip side bar"

**Status:** ⚠️ NEEDS TESTING
**Expected:** Tooltips should handle this (icon shows letter/emoji only)

### Issue 2: Folder Mode - Notes and Folders Overflow
**Reported:** "In the folder mode, the notes and folder are overflown"

**Status:** ⚠️ NEEDS FIX
**Location:** CompactListView.tsx / CSS

---

## 🔧 CSS Fixes to Apply (if issues found)

### Fix 1: Ensure all project names truncate

Add to `index.css` if missing:

```css
/* CompactListView project names */
.compact-project-item .item-row {
  min-width: 0; /* Critical for flex truncation */
}

.compact-project-item .project-name {
  flex: 1;
  min-width: 0; /* Allow shrinking */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Nested note titles */
.compact-project-wrapper .project-note-item {
  min-width: 0;
}

.compact-project-wrapper .project-note-item .note-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Fix 2: Panel content max-width enforcement

```css
.expanded-icon-panel {
  overflow: hidden; /* Prevent any overflow */
}

.expanded-icon-panel .panel-content {
  overflow-y: auto; /* Vertical scroll only */
  overflow-x: hidden; /* Never horizontal */
}
```

### Fix 3: CardGridView truncation

```css
.project-card .card-header {
  min-width: 0;
}

.project-card .project-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

---

## 📸 Testing Checklist

- [ ] Create project with 100+ character name
- [ ] Pin project to sidebar
- [ ] Expand in compact mode
- [ ] Check project name truncation
- [ ] Create notes with 80+ character titles
- [ ] Check note title truncation
- [ ] Switch to card mode
- [ ] Check card layout doesn't break
- [ ] Resize sidebar to narrow width (180px)
- [ ] Verify truncation still works
- [ ] Check tooltips show full text on hover

---

## 🚀 Quick Test Command

```bash
# Start dev server if not running
npm run dev:vite

# Open in Chrome
open -a "Google Chrome" http://localhost:5173/
```

---

## 📝 Report Format

After testing, report findings:

**Icon Bar (48px strip):**
- ✅ / ⚠️ / ❌ Project icon tooltips
- ✅ / ⚠️ / ❌ No text overflow

**Compact Mode:**
- ✅ / ⚠️ / ❌ Project name truncation
- ✅ / ⚠️ / ❌ Note title truncation
- ✅ / ⚠️ / ❌ Nested notes truncation

**Card Mode:**
- ✅ / ⚠️ / ❌ Card header truncation
- ✅ / ⚠️ / ❌ Description line-clamp

**Screenshots:** (if possible)
- Attach before/after if fixes needed
