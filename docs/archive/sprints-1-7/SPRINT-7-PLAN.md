# Sprint 7: Tags System - Implementation Plan

**Status:** 🏗️ In Progress
**Assignee:** Backend Architect + Testing Specialist (Agents)
**Estimated Time:** 2-3 hours
**Priority:** High
**Dependencies:** None (Sprint 6 complete)

---

## 🎯 Objectives

Implement a complete tagging system with `#tag` syntax, autocomplete, filtering, and management UI.

---

## 📋 Requirements

### Functional Requirements
1. **Tag Input**
   - Type `#` to trigger tag autocomplete
   - Autocomplete shows existing tags + "Create new" option
   - Arrow key navigation, Enter to select, Escape to close
   - Tags rendered as colored badges in editor

2. **Tag Management**
   - Tags panel in sidebar (similar to BacklinksPanel)
   - Click tag to filter notes by that tag
   - Show tag count (how many notes use it)
   - Rename/delete tags functionality

3. **Tag Filtering**
   - Filter notes by selected tag(s)
   - Multi-tag filtering (AND/OR logic)
   - Clear filters button

4. **Database Layer**
   - `tags` table for tag metadata
   - `note_tags` junction table for many-to-many
   - CRUD operations: createTag, deleteTag, renameTag
   - Query operations: getNoteTags, getTagNotes, getAllTags

### Non-Functional Requirements
- Autocomplete appears in <50ms
- Tag colors auto-generated (hash-based)
- Case-insensitive tag matching
- No duplicate tags (case-insensitive)

---

## 🏗️ Technical Architecture

### Database Schema

```sql
-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  color TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(name COLLATE NOCASE)
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name COLLATE NOCASE);

-- Note-Tags junction table
CREATE TABLE IF NOT EXISTS note_tags (
  note_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);
```

### Component Architecture

**Pattern:** Reuse wiki link autocomplete architecture

```
Components:
├── TagInputRule.ts          # Detects # pattern (like WikiLinkInputRule)
├── TagAutocomplete.tsx      # Autocomplete UI (like WikiLinkAutocomplete)
├── TagMark.ts              # Renders #tags as badges (like WikiLink)
├── TagsPanel.tsx           # Sidebar panel for tag management
└── TagFilter.tsx           # Filter UI component

Database:
├── DatabaseService.ts      # Add tag methods
└── Migration               # Add tags tables

App Integration:
└── App.tsx                 # Wire up tag filtering and state
```

### API Methods (DatabaseService)

```typescript
// Tag CRUD
createTag(name: string, color?: string): Tag
getTag(id: string): Tag | null
getAllTags(): Tag[]
renameTag(id: string, newName: string): boolean
deleteTag(id: string): boolean

// Note-Tag relationships
addTagToNote(noteId: string, tagName: string): void
removeTagFromNote(noteId: string, tagId: string): void
getNoteTags(noteId: string): Tag[]
getNotesByTag(tagId: string): Note[]
updateNoteTags(noteId: string, content: string): void // Auto-parse #tags

// Filtering
filterNotesByTags(tagIds: string[], matchAll: boolean): Note[]
```

---

## 📝 Implementation Steps

### Phase 1: Database Layer (Agent: Backend Architect)
**Estimated Time:** 30 minutes

**Tasks:**
1. Add database schema migration for `tags` and `note_tags` tables
2. Implement tag CRUD methods in DatabaseService
3. Implement note-tag relationship methods
4. Add IPC handlers in main process
5. Add TypeScript types to preload

**Files to modify:**
- `src/main/database/DatabaseService.ts`
- `src/main/index.ts`
- `src/preload/index.ts`

**Acceptance Criteria:**
- [ ] Tables created with indices
- [ ] CRUD methods working
- [ ] Relationship methods working
- [ ] IPC handlers exposed
- [ ] No SQL errors

---

### Phase 2: Tag Parsing & Detection (Agent: Backend Architect)
**Estimated Time:** 20 minutes

**Tasks:**
1. Create TagInputRule extension (detect `#` pattern)
2. Create TagMark extension (render tags as badges)
3. Implement tag color generation (hash-based)
4. Add tag parsing regex to updateNoteTags()

**Files to create:**
- `src/renderer/src/extensions/TagInputRule.ts`
- `src/renderer/src/extensions/TagMark.ts`

**Pattern to match:**
```typescript
const tagRegex = /#([a-zA-Z0-9_-]+)/g
// Matches: #tag, #my-tag, #tag123
// Stops at: space, newline, punctuation (except - and _)
```

**Acceptance Criteria:**
- [ ] `#` triggers autocomplete
- [ ] Tags parsed from content
- [ ] Tags rendered as colored badges
- [ ] Tag colors consistent (same tag = same color)

---

### Phase 3: Tag Autocomplete UI (Agent: Backend Architect)
**Estimated Time:** 30 minutes

**Tasks:**
1. Create TagAutocomplete component (reuse WikiLinkAutocomplete pattern)
2. Add keyboard navigation
3. Add "Create new tag" option when tag doesn't exist
4. Integrate with Editor component

**Files to create:**
- `src/renderer/src/components/TagAutocomplete.tsx`

**Files to modify:**
- `src/renderer/src/components/Editor.tsx`

**UI Behavior:**
```
Type: #m
Shows:
  #marketing (12 notes) [existing]
  #meeting (5 notes)    [existing]
  Create "#m"           [new tag]
```

**Acceptance Criteria:**
- [ ] Autocomplete appears on `#`
- [ ] Filters as user types
- [ ] Arrow keys navigate
- [ ] Enter selects tag
- [ ] Escape closes
- [ ] Creates new tags when needed

---

### Phase 4: Tags Panel & Filtering (Agent: Backend Architect)
**Estimated Time:** 40 minutes

**Tasks:**
1. Create TagsPanel component
2. Create TagFilter component
3. Add tag filtering logic to App.tsx
4. Wire up tag click → filter notes

**Files to create:**
- `src/renderer/src/components/TagsPanel.tsx`
- `src/renderer/src/components/TagFilter.tsx`

**Files to modify:**
- `src/renderer/src/App.tsx`

**UI Layout:**
```
TagsPanel (Sidebar):
  All Tags (24)
  ─────────────
  #meeting (12) [filter active]
  #research (8)
  #todo (15)

TagFilter (Top bar when active):
  Filtering by: #meeting ✕
  [Clear all filters]
```

**Acceptance Criteria:**
- [ ] Tags panel shows all tags with counts
- [ ] Click tag → filters note list
- [ ] Multi-tag filtering works
- [ ] Clear filters resets view
- [ ] Tag colors match rendered tags

---

### Phase 5: Testing (Agent: Testing Specialist)
**Estimated Time:** 30 minutes

**Tasks:**
1. Add unit tests for tag parsing
2. Add unit tests for database methods
3. Add integration tests for autocomplete
4. Test edge cases (special characters, long tags, etc.)

**Files to create:**
- `src/renderer/src/__tests__/Tags.test.tsx`

**Test Coverage:**
```typescript
describe('Tags System', () => {
  it('should parse #tags from content')
  it('should handle multiple tags on same line')
  it('should ignore # in middle of word')
  it('should generate consistent colors')
  it('should filter notes by tag')
  it('should handle multi-tag filtering (AND)')
  it('should create new tags via autocomplete')
  it('should update note tags on content change')
  it('should delete orphaned tags')
})
```

**Acceptance Criteria:**
- [ ] All unit tests passing
- [ ] Tag parsing edge cases covered
- [ ] Database methods validated
- [ ] No regressions in wiki links

---

## 🎨 UI/UX Specifications

### Tag Colors
Generate colors from tag name hash:
```typescript
function tagColor(name: string): string {
  const hash = name.split('').reduce((acc, char) =>
    char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}
```

### Tag Styling
```css
.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tag-badge:hover {
  opacity: 0.8;
}
```

---

## 🧪 Test Scenarios

### Manual Testing Checklist
1. [ ] Type `#` → autocomplete appears
2. [ ] Type `#tag` → filters to matching tags
3. [ ] Select existing tag → inserts `#tag`
4. [ ] Select "Create new" → inserts `#newtag` and creates tag
5. [ ] Tag rendered with color badge
6. [ ] Click tag in TagsPanel → filters notes
7. [ ] Multi-tag filter shows only notes with ALL tags
8. [ ] Delete tag content → removes from database
9. [ ] Rename tag updates all note references
10. [ ] Tag colors consistent across sessions

---

## 🚀 Deployment Notes

### Migration Strategy
```typescript
// Add migration in DatabaseService constructor
private migrate() {
  const version = this.db.pragma('user_version', { simple: true })

  if (version < 2) {
    // Add tags tables
    this.db.exec(TAGS_SCHEMA)
    this.db.pragma('user_version = 2')
  }
}
```

### Rollback Plan
Tags are additive - no breaking changes to existing data.
If issues arise, can disable tag features without data loss.

---

## 📚 Reference Materials

### Similar Implementations
- Obsidian: `#tag` with autocomplete
- Notion: `@tag` with color badges
- Roam Research: `#[[multi-word tags]]`

### Libraries Used
- TipTap Mark extension (same as WikiLink)
- ProseMirror Plugin (same as WikiLinkInputRule)
- React hooks (useState, useEffect)
- Better-sqlite3 (existing)

---

## ✅ Definition of Done

Sprint 7 is complete when:
- [ ] All database methods implemented and tested
- [ ] Tag autocomplete working (trigger, filter, select)
- [ ] Tags rendered as colored badges
- [ ] TagsPanel shows all tags with counts
- [ ] Tag filtering works (single and multi-tag)
- [ ] Automated tests passing (unit + integration)
- [ ] No regressions in existing features
- [ ] Code committed and pushed to main
- [ ] Documentation updated (SPRINT-7-COMPLETE.md)

---

## 🔗 Related Documents
- Sprint 6 (Wiki Links): `SPRINT-6-COMPLETE.md`
- Database Schema: `src/main/database/schema.sql`
- Architecture: `docs/architecture/overview.md`

---

**Next Sprint:** Sprint 8 - Search & Filter Enhancements
