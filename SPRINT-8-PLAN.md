# Sprint 8: Search & Filter Enhancements - Implementation Plan

**Status:** 📋 Planning
**Assignee:** Backend Architect + Testing Specialist (Agents)
**Estimated Time:** 3-4 hours
**Priority:** High
**Dependencies:** Sprint 5 (FTS5 search), Sprint 6 (Wiki Links), Sprint 7 (Tags)

---

## 🎯 Objectives

Enhance the existing FTS5 search with highlighting, advanced filtering, search history, and improved UX.

---

## 📋 Requirements

### Functional Requirements

1. **Search Highlighting**
   - Highlight search terms in search results
   - Highlight in note titles and content previews
   - Support multiple term highlighting
   - Context snippets showing matches

2. **Advanced Filters**
   - Filter by folder (PARA)
   - Filter by date range (created/modified)
   - Combine search with tag filters
   - Combine search with folder filters
   - Sort options (relevance, date, title)

3. **Search History**
   - Store recent searches (last 20)
   - Quick access to previous searches
   - Clear history option
   - Persist across sessions

4. **Search Results UI**
   - Show result count
   - Preview snippets with context
   - Highlight matches in snippets
   - Click to open note
   - Show metadata (folder, tags, date)

5. **Keyboard Navigation**
   - Cmd/Ctrl+K to focus search
   - Arrow keys to navigate results
   - Enter to open selected result
   - Escape to clear search

### Non-Functional Requirements
- Search response <100ms
- Highlighting performant (no flicker)
- Snippets max 200 characters
- History limited to 20 entries
- Smooth scroll to matches in opened note

---

## 🏗️ Technical Architecture

### Current State (Sprint 5)

**Existing Components:**
- `SearchBar.tsx` - Basic search input with Cmd+K
- `SearchResults.tsx` - Result list component
- `HighlightedText.tsx` - Text highlighting utility
- `utils/search.ts` - Search helper functions
- DatabaseService.searchNotes() - FTS5 search

**Database:**
```sql
-- Existing FTS5 table (Sprint 5)
CREATE VIRTUAL TABLE notes_fts USING fts5(
  title,
  content,
  content=notes,
  content_rowid=id
);
```

### Proposed Enhancements

**New Database Methods:**
```typescript
// Search with filters
searchNotesAdvanced(query: string, options: SearchOptions): SearchResult[]

interface SearchOptions {
  folder?: string
  tags?: string[]
  dateFrom?: number
  dateTo?: number
  sortBy?: 'relevance' | 'date' | 'title'
  limit?: number
}

interface SearchResult {
  note: Note
  snippets: string[]  // Context snippets with matches
  rank: number        // FTS5 rank score
}

// Search history
getSearchHistory(): string[]
addToSearchHistory(query: string): void
clearSearchHistory(): void
```

**Component Architecture:**
```
Components:
├── SearchBar.tsx (Enhanced)
│   ├── Search input
│   ├── Search history dropdown
│   └── Clear button
│
├── SearchFilters.tsx (NEW)
│   ├── Folder filter dropdown
│   ├── Date range picker
│   ├── Sort options
│   └── Clear filters button
│
├── SearchResults.tsx (Enhanced)
│   ├── Result count header
│   ├── Result cards with:
│   │   ├── Highlighted title
│   │   ├── Context snippets
│   │   ├── Metadata (folder, tags, date)
│   │   └── Click handler
│   └── No results state
│
├── HighlightedText.tsx (Enhanced)
│   ├── Multi-term highlighting
│   ├── Case-insensitive matching
│   └── HTML-safe highlighting
│
└── SearchHistoryDropdown.tsx (NEW)
    ├── Recent searches list
    ├── Click to search
    └── Clear history button
```

### UI Layout

```
┌─────────────────────────────────────────┐
│  [🔍 Search...] [⌘K]  [History ▼]      │  SearchBar
│  [📁 Folder] [📅 Date] [⬇️ Sort]        │  SearchFilters
├─────────────────────────────────────────┤
│  Found 12 results for "mediation"       │  Result Count
├─────────────────────────────────────────┤
│  📄 Causal *Mediation* Analysis         │  Result Card
│     ...discussing *mediation* effects   │  (Highlighted)
│     in the context of...                │
│     📁 Projects  #research #causal       │  Metadata
│     Modified: 2 days ago                │
├─────────────────────────────────────────┤
│  📄 *Mediation* Package Updates         │
│     ...the rmediation package now...    │
│     📁 Areas  #R #development           │
│     Modified: 1 week ago                │
└─────────────────────────────────────────┘
```

---

## 📝 Implementation Steps

### Phase 1: Search Highlighting (Agent: Backend Architect)
**Estimated Time:** 45 minutes

**Tasks:**
1. Enhance `HighlightedText.tsx` for multi-term highlighting
2. Add context snippet generation to search utility
3. Update `SearchResults.tsx` to display snippets
4. Add highlighting to note titles
5. Implement scroll-to-match in opened notes

**Files to modify:**
- `src/renderer/src/components/HighlightedText.tsx`
- `src/renderer/src/components/SearchResults.tsx`
- `src/renderer/src/utils/search.ts`
- `src/renderer/src/components/Editor.tsx` (scroll to match)

**Snippet Generation Algorithm:**
```typescript
function generateSnippets(content: string, query: string, maxSnippets = 3): string[] {
  const terms = query.toLowerCase().split(/\s+/)
  const sentences = content.split(/[.!?]+/)

  const matches = sentences
    .map((sentence, index) => ({
      sentence: sentence.trim(),
      index,
      score: terms.reduce((acc, term) =>
        acc + (sentence.toLowerCase().includes(term) ? 1 : 0), 0)
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSnippets)
    .map(s => truncate(s.sentence, 200))

  return matches
}
```

**Acceptance Criteria:**
- [ ] Search terms highlighted in results
- [ ] Context snippets show matches
- [ ] Multi-term highlighting works
- [ ] Scroll to match when opening note
- [ ] Performance <100ms

---

### Phase 2: Advanced Filters (Agent: Backend Architect)
**Estimated Time:** 60 minutes

**Tasks:**
1. Create `SearchFilters.tsx` component
2. Add folder filter dropdown
3. Add date range picker
4. Add sort options (relevance, date, title)
5. Implement `searchNotesAdvanced()` in DatabaseService
6. Wire up filters to App.tsx state

**Files to create:**
- `src/renderer/src/components/SearchFilters.tsx`

**Files to modify:**
- `src/main/database/DatabaseService.ts`
- `src/main/index.ts` (IPC handler)
- `src/preload/index.ts` (API)
- `src/renderer/src/App.tsx`

**Database Implementation:**
```typescript
searchNotesAdvanced(query: string, options: SearchOptions): SearchResult[] {
  let sql = `
    SELECT
      n.*,
      fts.rank
    FROM notes n
    JOIN notes_fts fts ON n.id = fts.rowid
    WHERE notes_fts MATCH ?
  `

  const params: any[] = [query]

  // Add folder filter
  if (options.folder) {
    sql += ` AND n.folder = ?`
    params.push(options.folder)
  }

  // Add date range filter
  if (options.dateFrom) {
    sql += ` AND n.updated_at >= ?`
    params.push(options.dateFrom)
  }
  if (options.dateTo) {
    sql += ` AND n.updated_at <= ?`
    params.push(options.dateTo)
  }

  // Add tag filter (requires join)
  if (options.tags && options.tags.length > 0) {
    sql += ` AND n.id IN (
      SELECT note_id FROM note_tags nt
      JOIN tags t ON nt.tag_id = t.id
      WHERE t.name IN (${options.tags.map(() => '?').join(',')})
      GROUP BY note_id
      HAVING COUNT(DISTINCT t.id) = ?
    )`
    params.push(...options.tags, options.tags.length)
  }

  // Add sorting
  switch (options.sortBy) {
    case 'relevance':
      sql += ` ORDER BY fts.rank`
      break
    case 'date':
      sql += ` ORDER BY n.updated_at DESC`
      break
    case 'title':
      sql += ` ORDER BY n.title COLLATE NOCASE`
      break
  }

  // Add limit
  if (options.limit) {
    sql += ` LIMIT ?`
    params.push(options.limit)
  }

  const results = this.db.prepare(sql).all(...params)

  // Generate snippets for each result
  return results.map(note => ({
    note,
    snippets: generateSnippets(note.content, query),
    rank: note.rank
  }))
}
```

**Acceptance Criteria:**
- [ ] Folder filter works
- [ ] Date range filter works
- [ ] Tag + search combination works
- [ ] Sort options work
- [ ] Filters clear properly

---

### Phase 3: Search History (Agent: Backend Architect)
**Estimated Time:** 30 minutes

**Tasks:**
1. Create `search_history` table
2. Implement history CRUD methods
3. Create `SearchHistoryDropdown.tsx` component
4. Add history to SearchBar dropdown
5. Persist history across sessions

**Files to create:**
- `src/renderer/src/components/SearchHistoryDropdown.tsx`

**Files to modify:**
- `src/main/database/DatabaseService.ts` (migration 004)
- `src/main/index.ts` (IPC handlers)
- `src/preload/index.ts` (API)
- `src/renderer/src/components/SearchBar.tsx`

**Database Schema:**
```sql
-- Migration 004: Search History
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  searched_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(query)
);

CREATE INDEX IF NOT EXISTS idx_search_history_date
  ON search_history(searched_at DESC);
```

**API Methods:**
```typescript
// Database methods
getSearchHistory(limit = 20): string[]
addToSearchHistory(query: string): void  // Upserts to update timestamp
clearSearchHistory(): void

// IPC handlers
ipcMain.handle('search:getHistory', () => db.getSearchHistory())
ipcMain.handle('search:addToHistory', (_, query) => db.addToSearchHistory(query))
ipcMain.handle('search:clearHistory', () => db.clearSearchHistory())
```

**Acceptance Criteria:**
- [ ] Recent searches persist
- [ ] Max 20 searches stored
- [ ] Duplicate queries update timestamp
- [ ] History dropdown shows recent searches
- [ ] Click history item to search
- [ ] Clear history works

---

### Phase 4: Enhanced Search Results UI (Agent: Backend Architect)
**Estimated Time:** 45 minutes

**Tasks:**
1. Update `SearchResults.tsx` with rich result cards
2. Add result count header
3. Add metadata display (folder, tags, date)
4. Add keyboard navigation (arrow keys, enter)
5. Add "no results" state
6. Add loading state

**Files to modify:**
- `src/renderer/src/components/SearchResults.tsx`
- `src/renderer/src/App.tsx` (keyboard handlers)
- `src/renderer/src/index.css` (result card styles)

**Result Card Component:**
```tsx
interface ResultCardProps {
  note: Note
  snippets: string[]
  query: string
  isSelected: boolean
  onClick: () => void
}

function ResultCard({ note, snippets, query, isSelected, onClick }: ResultCardProps) {
  return (
    <div
      className={`result-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* Title with highlighting */}
      <h3 className="result-title">
        <HighlightedText text={note.title} query={query} />
      </h3>

      {/* Snippets */}
      <div className="result-snippets">
        {snippets.map((snippet, i) => (
          <p key={i} className="result-snippet">
            <HighlightedText text={snippet} query={query} />
          </p>
        ))}
      </div>

      {/* Metadata */}
      <div className="result-metadata">
        <span className="result-folder">📁 {note.folder}</span>
        {note.tags.map(tag => (
          <span key={tag.id} className="result-tag" style={{color: tag.color}}>
            #{tag.name}
          </span>
        ))}
        <span className="result-date">
          {formatRelativeDate(note.updated_at)}
        </span>
      </div>
    </div>
  )
}
```

**Keyboard Navigation:**
```typescript
useEffect(() => {
  if (!searchResults.length) return

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, searchResults.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      openNote(searchResults[selectedIndex].note.id)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [searchResults, selectedIndex])
```

**Acceptance Criteria:**
- [ ] Result cards show all metadata
- [ ] Snippets display with highlights
- [ ] Arrow keys navigate results
- [ ] Enter opens selected result
- [ ] No results state displays
- [ ] Loading state displays
- [ ] Result count accurate

---

### Phase 5: Testing (Agent: Testing Specialist)
**Estimated Time:** 40 minutes

**Tasks:**
1. Add unit tests for search highlighting
2. Add unit tests for snippet generation
3. Add unit tests for advanced search filters
4. Add integration tests for search workflow
5. Add tests for search history

**Files to create:**
- `src/renderer/src/__tests__/Search.test.tsx`

**Test Coverage:**
```typescript
describe('Search System', () => {
  // Highlighting
  it('should highlight single search term')
  it('should highlight multiple search terms')
  it('should handle case-insensitive highlighting')
  it('should escape HTML in highlights')

  // Snippet generation
  it('should generate context snippets')
  it('should limit snippet length')
  it('should prioritize sentences with most matches')
  it('should handle multiple snippets')

  // Advanced filters
  it('should filter by folder')
  it('should filter by date range')
  it('should combine search with tags')
  it('should sort by relevance')
  it('should sort by date')
  it('should sort by title')

  // Search history
  it('should store search history')
  it('should limit history to 20 items')
  it('should update timestamp for duplicate queries')
  it('should clear search history')

  // Keyboard navigation
  it('should navigate results with arrow keys')
  it('should open result with Enter')
  it('should focus search with Cmd+K')
  it('should clear search with Escape')

  // Integration
  it('should perform full search workflow')
  it('should combine all filters correctly')
  it('should highlight matches in opened note')
})
```

**Acceptance Criteria:**
- [ ] All unit tests passing
- [ ] Search workflow tested end-to-end
- [ ] Edge cases covered
- [ ] No regressions in existing features

---

## 🎨 UI/UX Specifications

### Search Bar Enhancements

```tsx
// Search bar with history dropdown
<div className="search-container">
  <input
    type="text"
    placeholder="Search notes... (⌘K)"
    className="search-input"
  />

  {/* History dropdown (shows on focus if history exists) */}
  {showHistory && history.length > 0 && (
    <div className="search-history-dropdown">
      <div className="history-header">
        Recent Searches
        <button onClick={clearHistory}>Clear</button>
      </div>
      {history.map(query => (
        <div key={query} onClick={() => search(query)}>
          <SearchIcon /> {query}
        </div>
      ))}
    </div>
  )}
</div>
```

### Search Filters

```tsx
<div className="search-filters">
  <select className="filter-folder">
    <option value="">All Folders</option>
    <option value="inbox">📥 Inbox</option>
    <option value="projects">📁 Projects</option>
    <option value="areas">🗂️ Areas</option>
    <option value="resources">📚 Resources</option>
    <option value="archive">📦 Archive</option>
  </select>

  <div className="filter-date-range">
    <input type="date" placeholder="From" />
    <input type="date" placeholder="To" />
  </div>

  <select className="filter-sort">
    <option value="relevance">Sort: Relevance</option>
    <option value="date">Sort: Date</option>
    <option value="title">Sort: Title</option>
  </select>

  <button className="clear-filters">Clear Filters</button>
</div>
```

### Color Scheme

```css
.result-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.result-card.selected {
  border-color: #4a9eff;
  background: #252525;
}

.highlight {
  background-color: #4a9eff;
  color: #ffffff;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 500;
}

.result-snippet {
  color: #999;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 8px 0;
}
```

---

## 🧪 Test Scenarios

### Manual Testing Checklist

1. **Basic Search**
   - [ ] Type query → results appear
   - [ ] Search terms highlighted in titles
   - [ ] Search terms highlighted in snippets
   - [ ] Result count accurate

2. **Advanced Filters**
   - [ ] Filter by folder → correct results
   - [ ] Filter by date range → correct results
   - [ ] Combine search + tags → correct results
   - [ ] Sort by relevance → ranked correctly
   - [ ] Sort by date → newest first
   - [ ] Sort by title → alphabetical
   - [ ] Clear filters → resets to full results

3. **Search History**
   - [ ] Perform search → added to history
   - [ ] Focus search → history dropdown appears
   - [ ] Click history item → performs search
   - [ ] Duplicate query → updates timestamp
   - [ ] Clear history → removes all entries
   - [ ] History persists after restart

4. **Keyboard Navigation**
   - [ ] Cmd+K focuses search
   - [ ] Arrow Down selects next result
   - [ ] Arrow Up selects previous result
   - [ ] Enter opens selected result
   - [ ] Escape clears search and closes

5. **Performance**
   - [ ] Search with 1000+ notes <100ms
   - [ ] Highlighting renders without flicker
   - [ ] Snippet generation instant
   - [ ] Filter updates instant

---

## 📊 Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Basic search (FTS5) | <100ms | From input to results displayed |
| Advanced search (filters) | <150ms | With folder + tag filters |
| Snippet generation | <50ms | Per result |
| Highlighting render | <16ms | 60fps smooth |
| History retrieval | <10ms | From database |
| Keyboard navigation | <16ms | Result selection update |

---

## 🚀 Deployment Notes

### Migration Strategy

```typescript
// Migration 004: Search History
private runMigration004(): void {
  this.db.exec(`
    -- Search history table
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      searched_at INTEGER DEFAULT (unixepoch()),
      UNIQUE(query)
    );

    CREATE INDEX IF NOT EXISTS idx_search_history_date
      ON search_history(searched_at DESC);
  `)
}
```

### Rollback Plan

Search enhancements are additive. If issues arise:
1. Disable advanced filters (fallback to basic search)
2. Disable search history (no data loss)
3. Disable highlighting (show plain text)

No database changes affect existing notes/tags/links data.

---

## 📚 Reference Materials

### Similar Implementations
- **Notion**: Fuzzy search with filters
- **Obsidian**: Full-text search with highlighting
- **VS Code**: Cmd+P with fuzzy matching
- **Slack**: Search with filters and history

### Libraries Considered
- **mark.js**: Text highlighting (decided against - too heavy)
- **Fuse.js**: Fuzzy search (not needed - FTS5 sufficient)
- **React Window**: Virtualized results (not needed yet)

### SQLite FTS5 Resources
- [FTS5 Documentation](https://www.sqlite.org/fts5.html)
- FTS5 MATCH syntax for boolean queries
- Rank calculation for relevance sorting

---

## ✅ Definition of Done

Sprint 8 is complete when:

- [ ] Search highlighting works (titles + snippets)
- [ ] Advanced filters implemented (folder, date, tags)
- [ ] Sort options work (relevance, date, title)
- [ ] Search history persists across sessions
- [ ] Keyboard navigation works (arrow keys, enter, cmd+k, escape)
- [ ] Result cards show all metadata
- [ ] Automated tests passing (unit + integration)
- [ ] Performance targets met (<100ms search)
- [ ] No regressions in existing features
- [ ] Code committed and pushed to main
- [ ] Documentation updated (SPRINT-8-COMPLETE.md)

---

## 🔗 Related Documents

- Sprint 5: Full-Text Search (FTS5 foundation)
- Sprint 6: Wiki Links (link filtering integration)
- Sprint 7: Tags System (tag filtering integration)
- Database Schema: `src/main/database/DatabaseService.ts`

---

**Next Sprint:** Sprint 9 - Export/Backup System

---

## 📝 Notes

**Design Decisions:**
- Reuse existing FTS5 infrastructure from Sprint 5
- Build on tag filtering from Sprint 7
- Keep highlighting simple (no external libs)
- Limit history to 20 for performance
- Use SQLite joins for complex filters

**Trade-offs:**
- Basic highlighting vs mark.js (chose basic for simplicity)
- Full snippet generation vs preview (chose snippets for context)
- Client-side filtering vs SQL (chose SQL for performance)

**Future Enhancements** (Sprint 9+):
- Fuzzy search
- Search operators (AND, OR, NOT)
- Saved search presets
- Search in specific fields only
- Export search results
