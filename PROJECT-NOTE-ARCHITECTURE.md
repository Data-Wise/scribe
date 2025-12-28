# Project-Note Relationship: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CURRENT STATE (BROKEN)                          │
└─────────────────────────────────────────────────────────────────────────┘

Frontend (TypeScript)              Backend (Rust)                Database
─────────────────────              ──────────────                ────────

window.api {                       commands.rs {                 notes table:
  setNoteProject() ───────X──────>   ❌ MISSING                  │ id
  getProjectNotes() ──────X──────>   ❌ MISSING                  │ title
}                                  }                              │ content
                                                                  │ folder
                                   database.rs {                  │ project_id ← EXISTS but unused!
                                     ❌ set_note_project()        │ created_at
                                     ❌ get_project_notes()       │ updated_at
                                   }                              └──────────

                                                                  projects table:
                                                                  │ id
                                                                  │ name  
                                                                  │ type
                                                                  │ color
                                                                  └──────────

Result: 18 of 19 notes (94.7%) are orphaned!


┌─────────────────────────────────────────────────────────────────────────┐
│                      PROPOSED SOLUTION (FIXED)                          │
└─────────────────────────────────────────────────────────────────────────┘

Frontend                           Backend                       Database
────────                           ───────                       ────────

MissionSidebar.tsx                 commands.rs                   notes
├─ CompactListMode                 ┌────────────────┐           ┌──────────┐
│  └─ [+ button] ─────────┐        │ #[tauri::     │           │ project_id│
│                          │        │  command]     │           │    ↓      │
├─ CardViewMode            │        │               │           │  (FK to   │
│  └─ [+ button] ──────────┼───────>│ set_note_    │           │  projects)│
│                          │        │  project()    │────SQL───>│           │
NoteEditor.tsx             │        │               │  UPDATE   └──────────┘
└─ <select project> ───────┘        └────────────────┘
         │                                  │
         │                          ┌────────────────┐
         └─────────────────────────>│ get_project_  │           projects
                                    │  notes()      │────SQL───>┌──────────┐
window.api.setNoteProject()         │               │  SELECT   │ id       │
window.api.getProjectNotes()        └────────────────┘           │ name     │
         ↑                                  ↑                    └──────────┘
         │                                  │
    (defined in                      database.rs
     types/index.ts)                 ┌────────────────┐
                                     │ impl Database  │
                                     │ {              │
                                     │  set_note_     │
                                     │   project()    │
                                     │                │
                                     │  get_project_  │
                                     │   notes()      │
                                     │ }              │
                                     └────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                           USER WORKFLOWS                                │
└─────────────────────────────────────────────────────────────────────────┘

Workflow 1: Quick Add from Sidebar
───────────────────────────────────
User clicks [+] next to "mediationverse" project in sidebar
  ↓
window.api.createNote({ title: 'New Note', ... })
  ↓
window.api.setNoteProject(noteId, 'mediationverse-project-id')
  ↓
Note appears in project with project_id assigned ✅


Workflow 2: Assign Existing Note
─────────────────────────────────
User opens note in editor
  ↓
Selects project from dropdown: <select> "RMediation"
  ↓
window.api.setNoteProject(noteId, 'rmediation-id')
  ↓
Note now belongs to RMediation project ✅


Workflow 3: View Project Notes
───────────────────────────────
User clicks "mediationverse" in sidebar
  ↓
window.api.getProjectNotes('mediationverse-id')
  ↓
Returns: [note1, note2, note3] all with project_id = 'mediationverse-id'
  ↓
Display in project view ✅


Workflow 4: Unassign Note
──────────────────────────
User changes dropdown from "RMediation" to "No Project"
  ↓
window.api.setNoteProject(noteId, null)
  ↓
Note's project_id set to NULL - note is now orphaned ✅


┌─────────────────────────────────────────────────────────────────────────┐
│                     DATA FLOW DIAGRAM                                   │
└─────────────────────────────────────────────────────────────────────────┘

CREATE NOTE → ASSIGN TO PROJECT
────────────────────────────────

    USER ACTION                    API CALL                   DATABASE
┌──────────────────┐         ┌──────────────────┐        ┌──────────────┐
│ Click [+] on     │         │ createNote()     │        │ INSERT INTO  │
│ "RMediation"     │────────>│                  │───────>│ notes        │
│ project          │         │ Returns note.id  │<───────│ VALUES(...)  │
└──────────────────┘         └──────────────────┘        └──────────────┘
         │                            │
         │                            ↓
         │                   ┌──────────────────┐        ┌──────────────┐
         └──────────────────>│ setNoteProject() │        │ UPDATE notes │
                             │ (note.id,        │───────>│ SET          │
                             │  project.id)     │        │ project_id=? │
                             └──────────────────┘        │ WHERE id=?   │
                                                         └──────────────┘

QUERY NOTES BY PROJECT
──────────────────────

    USER ACTION                    API CALL                   DATABASE
┌──────────────────┐         ┌──────────────────┐        ┌──────────────┐
│ Click            │         │ getProjectNotes()│        │ SELECT *     │
│ "RMediation"     │────────>│ (project.id)     │───────>│ FROM notes   │
│ in sidebar       │         │                  │<───────│ WHERE        │
└──────────────────┘         │ Returns Note[]   │        │ project_id=? │
         │                   └──────────────────┘        └──────────────┘
         │                            │
         ↓                            ↓
┌──────────────────┐         ┌──────────────────┐
│ Show 5 notes     │<────────│ [note1, note2,   │
│ for RMediation   │         │  note3, note4,   │
│ project          │         │  note5]          │
└──────────────────┘         └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                   ALTERNATIVE ARCHITECTURES                             │
└─────────────────────────────────────────────────────────────────────────┘

Option A: CURRENT APPROACH (Simple FK)
──────────────────────────────────────
✅ Pros:
  • Simple one-to-many relationship
  • Easy to query
  • Matches current schema
  • Notes can belong to 0 or 1 project

❌ Cons:
  • Note can only belong to ONE project
  • No hierarchical project structure
  • Moving note = UPDATE operation


Option B: JUNCTION TABLE (Many-to-Many)
───────────────────────────────────────
Schema:
  notes (id, title, content, ...)
  projects (id, name, ...)
  project_notes (project_id, note_id, role)  ← NEW TABLE

✅ Pros:
  • Note can belong to MULTIPLE projects
  • Can add metadata (role: "primary", "reference")
  • More flexible for future needs

❌ Cons:
  • More complex queries (JOINs)
  • Sidebar UI gets complicated (which project to show?)
  • Overkill for current use case


Option C: TAGS-BASED (Treat Projects as Special Tags)
─────────────────────────────────────────────────────
Schema:
  notes (id, title, ...)
  tags (id, name, type)  ← type = 'project' | 'regular'
  note_tags (note_id, tag_id)

✅ Pros:
  • Unified tag system
  • Can tag note with multiple "project tags"
  • Familiar mental model

❌ Cons:
  • Projects are more than tags (settings, bibliography, templates)
  • Loses project-specific metadata
  • Confusing semantics


Option D: FOLDERS-BASED (Hierarchical File System)
──────────────────────────────────────────────────
Schema:
  notes (id, title, folder_path)
  folders (path, project_id)

Example:
  /projects/RMediation/sensitivity-analysis.md
  /projects/mediationverse/roadmap.md

✅ Pros:
  • Natural file system metaphor
  • Hierarchical organization
  • Can nest: project > sprint > notes

❌ Cons:
  • Rigid structure (hard to move notes)
  • Path updates cascade to all notes
  • Doesn't match current "flat folder" design


RECOMMENDATION: Option A (Current FK approach)
──────────────────────────────────────────────
Stick with simple foreign key because:
1. Matches existing schema
2. Covers 95% of use cases
3. Easy to implement (2-3 hours)
4. Can migrate to Option B later if needed

Keep it simple. Ship it fast. Iterate based on real usage.
