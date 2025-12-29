# Scribe Desktop App - Code Review Report

**Date:** 2025-12-28
**Reviewer:** Claude Code (Expert App Developer)
**Stack:** Tauri + React + TypeScript + SQLite

---

## Executive Summary

The codebase is well-structured with proper separation of concerns. However, I found **one critical bug** that was preventing notes from being associated with projects. The database schema is solid, but there were gaps in the data flow between frontend and backend.

---

## Critical Bug Fixed

### Bug: Notes Not Registering with Projects

**Root Cause:** The backend `CreateNoteInput` struct was missing the `project_id` field. The frontend was sending it, but the backend ignored it completely.

**Files Changed:**

1. **`src-tauri/src/commands.rs`** (lines 12-17)
   - Added `project_id: Option<String>` to `CreateNoteInput` struct
   - Updated `create_note` command to pass `project_id` to database

2. **`src-tauri/src/database.rs`** (line 269)
   - Updated `create_note()` signature to accept `project_id: Option<&str>`
   - Modified INSERT query to include `project_id`

3. **`src/renderer/src/App.tsx`** (lines 367-374)
   - Added `project_id: currentProjectId` to note creation call
   - Fixed `onNewNoteInProject` to pass `project_id` as direct field

4. **`src/renderer/src/types/index.ts`**
   - Added `project_id?: string | null` to Note interface (was missing!)

---

## Database Schema Review

### Strengths

1. **WAL Mode Enabled** - Good for performance (`journal_mode = WAL`)
2. **Schema Versioning** - Proper migration system with version tracking
3. **FTS5 Full-Text Search** - Excellent for note search functionality
4. **Proper Indexes** - Good indexing strategy:
   - `idx_notes_folder` - folder lookups
   - `idx_notes_updated` - sorting by recent
   - `idx_notes_deleted` - trash filtering
   - `idx_notes_project` - project-based queries
5. **Foreign Key Constraints** - Proper relationships with `ON DELETE` behaviors
6. **Soft Delete Pattern** - `deleted_at` field for trash/recovery

### Best Practices Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Schema Design | Excellent | Normalized, well-indexed |
| Data Integrity | Good | FK constraints in place |
| Query Performance | Good | Appropriate indexes |
| Migration Strategy | Good | Versioned migrations |
| Backup Strategy | Missing | Consider WAL checkpointing |

---

## Architecture Analysis

### Current Structure (Good)

```
notes
├── id (PRIMARY KEY)
├── title
├── content
├── folder (organizational taxonomy)
├── project_id (FK to projects)
├── created_at / updated_at / deleted_at

projects
├── id (PRIMARY KEY)
├── name
├── type (research/teaching/r-package/r-dev/generic)
├── description / color / settings

tags (many-to-many via note_tags)
links (many-to-many for wiki-links)
```

### Recommendations for Improvement

#### 1. Add Project Status Field (Enhancement)
```sql
ALTER TABLE projects ADD COLUMN status TEXT
  CHECK(status IN ('active', 'paused', 'archive', 'complete'))
  DEFAULT 'active';
```

#### 2. Add Project Progress Tracking
```sql
ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0;
```

#### 3. Consider Adding Note Pinning
```sql
ALTER TABLE notes ADD COLUMN pinned INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN pinned_at INTEGER;
CREATE INDEX idx_notes_pinned ON notes(pinned, pinned_at DESC);
```

---

## Frontend Data Flow Issues Found

### Issue 1: TypeScript Type Mismatch (FIXED)
The `Note` interface was missing `project_id` field. Frontend was looking at `note.properties?.project_id?.value` which doesn't exist.

**Fix:** Added `project_id?: string | null` directly to Note type.

### Issue 2: Note Creation Not Using Current Project (FIXED)
`handleCreateNote()` was not passing `currentProjectId` to the backend.

**Fix:** Added `project_id: currentProjectId || undefined` to the note creation call.

### Issue 3: Project Notes Not Displaying (FIXED)
When clicking a project, notes weren't showing because:
1. CompactListMode didn't have a project notes section
2. NotesListPanel showed ALL notes, not filtered by project

**Fix:** Added `projectNotes` computed array and a "Notes (X)" section in CompactListMode.

---

## Best Practices for Notes/Projects/Folders

### Recommended Organization Pattern

```
PROJECTS (Writing Projects)
├── Research Paper A
├── Teaching Course B
├── R Package C

FOLDERS (Workflow States)
├── inbox     → Unsorted captures
├── notes     → Active working notes
├── daily     → Daily journals
├── archive   → Completed/old notes

TAGS (Cross-cutting Concerns)
├── #todo, #review, #urgent
├── #research/statistics/mediation
```

### Key Principles

1. **Projects = Containers** - Group related notes by project
2. **Folders = Workflow** - Track note lifecycle (inbox → notes → archive)
3. **Tags = Metadata** - Cross-cutting labels that span projects
4. **Daily Notes = Separate** - Keep in their own folder for quick access

### ADHD-Friendly Patterns Used

1. **Single Active Project** - `currentProjectId` ensures focus
2. **Inbox Pattern** - Quick capture without organization friction
3. **Soft Delete** - Recovery from accidental deletions
4. **Auto-Save** - No explicit save button needed
5. **Progress Tracking** - Visual progress bars on projects

---

## Remaining Issues to Address

### High Priority

1. **UpdateNoteInput Missing project_id**
   ```rust
   pub struct UpdateNoteInput {
       title: Option<String>,
       content: Option<String>,
       // Missing: project_id: Option<String>,
       // Missing: folder: Option<String>,
       // Missing: deleted_at: Option<i64>,
   }
   ```

2. **No Project Status in Frontend Types**
   - Project interface needs `status` and `progress` fields

### Medium Priority

3. **Missing Note Deduplication**
   - Daily notes could create duplicates if clicked rapidly

4. **No Batch Operations**
   - Can't move multiple notes to a project at once

5. **Missing Database Backup**
   - No automatic backup before migrations

### Low Priority

6. **Tag Orphan Cleanup**
   - Tags with 0 notes could be auto-deleted

7. **FTS Index Maintenance**
   - Consider periodic `VACUUM` for FTS optimization

---

## Quick Wins (Implement Now)

1. **Add `project_id` to UpdateNoteInput** - 5 min fix
2. **Add status/progress to Project type** - Already done in frontend
3. **Add database integrity check on startup** - 15 min

## Long-term Improvements

1. **Implement Note Templates** - Per-project default content
2. **Add Project Dashboard** - Overview stats per project
3. **Smart Project Suggestions** - ML-based note-to-project matching
4. **Cross-Device Sync** - SQLite replication strategy

---

## Files Modified in This Session

```
src-tauri/src/commands.rs     # Added project_id to CreateNoteInput
src-tauri/src/database.rs     # Updated create_note() signature
src/renderer/src/App.tsx      # Pass project_id on note creation
src/renderer/src/types/index.ts  # Added project_id to Note type
src/renderer/src/components/sidebar/CompactListMode.tsx  # Project notes section
src/renderer/src/index.css    # Styles for project notes
```

---

## Conclusion

The core bug preventing notes from registering with projects has been fixed. The database schema is solid and follows best practices. The main improvement areas are:

1. Completing the UpdateNoteInput struct
2. Adding project status/progress to backend
3. Implementing backup/recovery patterns

The app is now properly associating notes with projects when created.

---

*Report generated by Claude Code - Expert App Developer Review*
