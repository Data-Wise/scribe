# Project-Note Relationship Analysis

**Date:** December 27, 2024  
**Branch:** feat/mission-sidebar-persistent  
**Issue:** Projects and notes are not properly connected

---

## 🔍 Current State Analysis

### Database Schema ✅

**Notes table HAS project_id column:**
```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    folder TEXT DEFAULT 'inbox',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    deleted_at INTEGER NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL  -- ✅ EXISTS
);

CREATE INDEX idx_notes_project ON notes(project_id);  -- ✅ INDEXED
```

**Projects table:**
```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK(type IN ('research', 'teaching', 'r-package', 'r-dev', 'generic')),
    color TEXT,
    settings TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### Live Database State 📊

**Current data:**
- Total notes: 19
- Notes with project: 1
- Orphaned notes: 18 (94.7%)
- Total projects: 1

**Example data:**
```
Note Title               | project_id | Project Name
------------------------|------------|-------------
Test Note               | NULL       | (no project)
Capture: Buy milk       | NULL       | (no project)
New Note                | b664...    | test project  ← ONLY ONE
```

---

## 🚨 Root Cause: Missing API Functions

### What's Missing

**Backend (database.rs):** ❌
```rust
// MISSING FUNCTION
pub fn set_note_project(&self, note_id: &str, project_id: Option<&str>) -> SqlResult<()> {
    // This doesn't exist!
}

// MISSING FUNCTION  
pub fn get_project_notes(&self, project_id: &str) -> SqlResult<Vec<Note>> {
    // This doesn't exist!
}
```

**Backend (commands.rs):** ❌
```rust
// MISSING TAURI COMMAND
#[tauri::command]
pub fn set_note_project(
    state: State<AppState>,
    note_id: String,
    project_id: Option<String>
) -> Result<(), String> {
    // This doesn't exist!
}

// MISSING TAURI COMMAND
#[tauri::command]
pub fn get_project_notes(
    state: State<AppState>,
    project_id: String
) -> Result<Vec<Note>, String> {
    // This doesn't exist!
}
```

**Frontend (types/index.ts):** ✅ (API declared but not implemented)
```typescript
// These are DECLARED in the Window interface:
setNoteProject: (noteId: string, projectId: string | null) => Promise<void>
getProjectNotes: (projectId: string) => Promise<Note[]>

// But the backend commands don't exist!
```

---

## 💡 Solution: Three-Layer Implementation

### Layer 1: Database Functions (database.rs)

Add these methods to the `Database` implementation:

```rust
// Set or clear a note's project assignment
pub fn set_note_project(&self, note_id: &str, project_id: Option<&str>) -> SqlResult<()> {
    self.conn.execute(
        "UPDATE notes SET project_id = ?, updated_at = strftime('%s', 'now') 
         WHERE id = ?",
        params![project_id, note_id],
    )?;
    Ok(())
}

// Get all notes for a specific project
pub fn get_project_notes(&self, project_id: &str) -> SqlResult<Vec<Note>> {
    let mut stmt = self.conn.prepare(
        "SELECT id, title, content, folder, project_id, created_at, updated_at, deleted_at
         FROM notes 
         WHERE project_id = ? AND deleted_at IS NULL
         ORDER BY updated_at DESC",
    )?;

    let notes = stmt.query_map([project_id], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            folder: row.get(3)?,
            project_id: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
            deleted_at: row.get(7)?,
        })
    })?;

    notes.collect()
}

// Count notes per project (useful for sidebar)
pub fn count_project_notes(&self) -> SqlResult<Vec<(String, i64)>> {
    let mut stmt = self.conn.prepare(
        "SELECT project_id, COUNT(*) as count
         FROM notes
         WHERE deleted_at IS NULL AND project_id IS NOT NULL
         GROUP BY project_id",
    )?;

    let counts = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?))
    })?;

    counts.collect()
}
```

### Layer 2: Tauri Commands (commands.rs)

Add these #[tauri::command] functions:

```rust
#[tauri::command]
pub fn set_note_project(
    state: State<AppState>,
    note_id: String,
    project_id: Option<String>
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.set_note_project(&note_id, project_id.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_project_notes(
    state: State<AppState>,
    project_id: String
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_project_notes(&project_id)
        .map_err(|e| e.to_string())
}
```

**CRITICAL:** Add these to the command handler in `lib.rs`:

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // ... existing commands ...
        set_note_project,      // ← ADD THIS
        get_project_notes,     // ← ADD THIS
    ])
```

### Layer 3: UI Integration

**Option A: Automatic Assignment (Recommended)**

When user creates note via project sidebar:
```typescript
// In CompactListMode.tsx or CardViewMode.tsx
const handleQuickAdd = async (projectId: string) => {
  const note = await window.api.createNote({
    title: 'New Note',
    content: '',
    folder: 'inbox'
  })
  
  // Immediately assign to project
  await window.api.setNoteProject(note.id, projectId)
  
  onSelectNote(note.id)
}
```

**Option B: Manual Assignment UI**

Add project selector in note editor:
```typescript
<select 
  value={currentNote.project_id || ''}
  onChange={async (e) => {
    const projectId = e.target.value || null
    await window.api.setNoteProject(currentNote.id, projectId)
  }}
>
  <option value="">No Project</option>
  {projects.map(p => (
    <option key={p.id} value={p.id}>{p.name}</option>
  ))}
</select>
```

**Option C: Drag & Drop (Future)**

```typescript
// In MissionSidebar.tsx
const handleNoteDrop = async (noteId: string, projectId: string) => {
  await window.api.setNoteProject(noteId, projectId)
  // Refresh UI
}
```

---

## 🎯 Implementation Priorities

### Priority 1: Core Functionality [2-3 hours]
1. ✅ Add `set_note_project()` to database.rs
2. ✅ Add `get_project_notes()` to database.rs  
3. ✅ Add Tauri commands to commands.rs
4. ✅ Register commands in lib.rs
5. ✅ Test with direct API calls

### Priority 2: Sidebar Integration [1-2 hours]
6. ✅ Wire up "quick add" button in CompactListMode
7. ✅ Wire up "quick add" button in CardViewMode
8. ✅ Auto-assign new notes to active project
9. ✅ Display note counts in sidebar

### Priority 3: Note Editor Enhancement [30 min]
10. ✅ Add project dropdown in note properties panel
11. ✅ Show current project in note header
12. ✅ Allow changing project assignment

### Priority 4: Orphan Migration [15 min]
13. ✅ Create "Assign to Project" batch UI
14. ✅ Show orphaned notes count
15. ✅ Quick-assign workflow

---

## 📝 Testing Plan

### Manual Tests
```bash
# 1. Test database functions directly
sqlite3 "$HOME/Library/Application Support/com.scribe.app/scribe.db"

# Assign note to project
UPDATE notes SET project_id = 'b6645e532fa37756288f047069b829b3' WHERE id = 'some-note-id';

# Verify
SELECT n.title, p.name FROM notes n LEFT JOIN projects p ON n.project_id = p.id;

# 2. Test via UI
# - Create project
# - Click "+" in project sidebar item
# - Verify note is assigned
# - Check database

# 3. Test edge cases
# - Assign note to non-existent project (should fail gracefully)
# - Assign note to NULL (should work - unassign)
# - Delete project (notes should have project_id set to NULL via ON DELETE SET NULL)
```

### Automated Tests
```typescript
// tests/project-note-relationship.test.ts
describe('Project-Note Relationship', () => {
  it('should assign note to project', async () => {
    const project = await window.api.createProject({...})
    const note = await window.api.createNote({...})
    
    await window.api.setNoteProject(note.id, project.id)
    
    const projectNotes = await window.api.getProjectNotes(project.id)
    expect(projectNotes).toContainEqual(expect.objectContaining({ id: note.id }))
  })
  
  it('should unassign note from project', async () => {
    // ...
  })
})
```

---

## 🔗 Related Files

**Backend:**
- `/Users/dt/projects/dev-tools/scribe/src-tauri/src/database.rs` - Database layer
- `/Users/dt/projects/dev-tools/scribe/src-tauri/src/commands.rs` - Tauri commands
- `/Users/dt/projects/dev-tools/scribe/src-tauri/src/lib.rs` - Command registration

**Frontend:**
- `/Users/dt/projects/dev-tools/scribe/src/renderer/src/types/index.ts` - TypeScript types
- `/Users/dt/projects/dev-tools/scribe/src/renderer/src/components/sidebar/CompactListMode.tsx`
- `/Users/dt/projects/dev-tools/scribe/src/renderer/src/components/sidebar/CardViewMode.tsx`
- `/Users/dt/projects/dev-tools/scribe/src/renderer/src/components/NoteEditor.tsx`

**Database:**
- `~/Library/Application Support/com.scribe.app/scribe.db`

---

## 🚀 Quick Start Implementation

Want me to implement this now? I can:

1. **Quick fix (30 min):** Add backend functions + commands
2. **Full implementation (2-3 hours):** Backend + sidebar integration + note editor
3. **Research alternative approaches:** Explore different relationship models

Which approach would you prefer?
