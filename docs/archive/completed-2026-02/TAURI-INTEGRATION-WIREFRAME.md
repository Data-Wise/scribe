# Tauri Integration Wireframe

> **Purpose:** Bring Tauri SQLite backend to parity with browser IndexedDB implementation
> **Created:** 2025-12-30
> **Completed:** 2025-12-30 ✅

---

## Status Overview

| Category | Browser (IndexedDB) | Tauri (SQLite) | Gap |
|----------|---------------------|----------------|-----|
| **Note CRUD** | Complete | Complete | None |
| **Tags** | Complete | Complete | None |
| **Note-Tag Relations** | Complete | Complete | None |
| **Wiki Links** | Complete | Complete | None |
| **Projects** | Complete | Complete ✅ | None |
| **Note Properties** | Complete | Complete ✅ | None |
| **Daily Notes** | Complete | Complete | None |
| **AI (Claude/Gemini)** | Stub | Complete | N/A (Tauri-only) |
| **Export** | Stub | Complete | N/A (Tauri-only) |

> **All gaps closed.** Browser and Tauri backends are now at full parity.

---

## Gap Analysis

### 1. Note Properties (HIGH PRIORITY)

Browser stores `properties` as JSON on notes. Tauri Note struct lacks this.

**TypeScript Type:**
```typescript
interface Note {
  // ... existing fields
  properties?: Record<string, Property>  // Missing in Tauri
}

interface Property {
  key: string
  value: string | number | boolean | string[]
  type: 'text' | 'date' | 'number' | 'checkbox' | 'list' | 'link' | 'tags'
  readonly?: boolean
}
```

**Required Tauri Changes:**

```rust
// src-tauri/src/database.rs

// 1. Update Note struct
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub folder: String,
    pub project_id: Option<String>,
    pub properties: Option<String>,  // ADD: JSON string
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
}

// 2. Update CREATE TABLE in init_database()
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    folder TEXT NOT NULL DEFAULT 'inbox',
    project_id TEXT REFERENCES projects(id),
    properties TEXT,  -- ADD: JSON blob
    search_text TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
);

// 3. Update create_note()
pub fn create_note(&self, title: &str, content: &str, folder: &str, properties: Option<&str>) -> SqlResult<Note>

// 4. Update update_note()
pub fn update_note(&self, id: &str, title: Option<&str>, content: Option<&str>, properties: Option<&str>) -> SqlResult<Option<Note>>
```

**Migration Required:**
```sql
ALTER TABLE notes ADD COLUMN properties TEXT;
```

---

### 2. Project Settings (MEDIUM PRIORITY)

Browser has separate `projectSettings` table. Tauri lacks this.

**TypeScript Type:**
```typescript
interface ProjectSettings {
  theme?: string
  font?: string
  fontSize?: number
  bibliographyPath?: string
  citationStyle?: string
  dailyNoteTemplate?: string
  wordGoal?: number
}
```

**Required Tauri Changes:**

```rust
// src-tauri/src/database.rs

// 1. Add ProjectSettings struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub project_id: String,
    pub settings: String,  // JSON blob
}

// 2. Add table in init_database()
CREATE TABLE IF NOT EXISTS project_settings (
    project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    settings TEXT NOT NULL DEFAULT '{}'
);

// 3. Add methods
pub fn get_project_settings(&self, project_id: &str) -> SqlResult<Option<String>> {
    let conn = self.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT settings FROM project_settings WHERE project_id = ?1")?;
    let result: Option<String> = stmt.query_row([project_id], |row| row.get(0)).optional()?;
    Ok(result)
}

pub fn update_project_settings(&self, project_id: &str, settings: &str) -> SqlResult<()> {
    let conn = self.conn.lock().unwrap();
    conn.execute(
        "INSERT INTO project_settings (project_id, settings) VALUES (?1, ?2)
         ON CONFLICT(project_id) DO UPDATE SET settings = ?2",
        [project_id, settings],
    )?;
    Ok(())
}
```

**Commands to Add (src-tauri/src/commands.rs):**
```rust
#[tauri::command]
pub fn get_project_settings(state: State<AppState>, project_id: String) -> Result<Option<String>, String> {
    let db = state.db.lock().unwrap();
    db.get_project_settings(&project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_project_settings(state: State<AppState>, project_id: String, settings: String) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.update_project_settings(&project_id, &settings).map_err(|e| e.to_string())
}
```

---

### 3. Command Registration (lib.rs)

Add new commands to Tauri invoke handler:

```rust
// src-tauri/src/lib.rs

.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::get_project_settings,    // ADD
    commands::update_project_settings, // ADD
])
```

---

## API Parity Checklist

### Note Operations
- [x] `createNote` - Both have it
- [x] `getNote` - Both have it
- [x] `updateNote` - Both have it (properties added in migration 005 ✅)
- [x] `deleteNote` - Both have soft delete
- [x] `listNotes` - Both have it
- [x] `searchNotes` - Both have it

### Tag Operations
- [x] `createTag` - Both have it
- [x] `getTag` - Both have it
- [x] `getTagByName` - Both have it
- [x] `getAllTags` - Both have it (with counts)
- [x] `renameTag` - Both have it
- [x] `deleteTag` - Both have it

### Note-Tag Relations
- [x] `addTagToNote` - Both have it
- [x] `removeTagFromNote` - Both have it
- [x] `getNoteTags` - Both have it
- [x] `getNotesByTag` - Both have it
- [x] `filterNotesByTags` - Both have it
- [x] `updateNoteTags` - Both have it

### Link Operations
- [x] `updateNoteLinks` - Both have it
- [x] `getBacklinks` - Both have it
- [x] `getOutgoingLinks` - Both have it

### Folder Operations
- [x] `getFolders` - Both have it

### Project Operations
- [x] `listProjects` - Both have it
- [x] `createProject` - Both have it
- [x] `getProject` - Both have it
- [x] `updateProject` - Both have it
- [x] `deleteProject` - Both have it
- [x] `getProjectNotes` - Browser: getProjectNotes, Tauri: get_notes_by_project
- [x] `setNoteProject` - Browser: setNoteProject, Tauri: assign_note_to_project
- [x] `getProjectSettings` - Added in migration 006 ✅
- [x] `updateProjectSettings` - Added in migration 006 ✅

### Daily Notes
- [x] `getOrCreateDailyNote` - Both have it

### Tauri-Only (Browser stubs)
- [x] `runClaude` - Tauri has CLI wrapper
- [x] `runGemini` - Tauri has CLI wrapper
- [x] `exportToObsidian` - Tauri has it
- [x] `exportDocument` - Tauri has Pandoc integration
- [x] `getCitations` - Tauri has Zotero BibTeX parsing
- [x] Font operations - Tauri has Homebrew integration

---

## Implementation Order

### Phase 1: Note Properties (Required for Properties Panel)
1. Add `properties` column to notes table (migration)
2. Update Note struct in database.rs
3. Update create_note, update_note methods
4. Update commands.rs input types
5. Test with Properties Panel

### Phase 2: Project Settings (Required for Project Customization)
1. Create project_settings table (migration)
2. Add ProjectSettings struct
3. Add get/update methods
4. Add Tauri commands
5. Register in lib.rs

### Phase 3: Validation
1. Run full test suite
2. Test browser ↔ Tauri data compatibility
3. Verify Properties Panel works in Tauri mode
4. Verify Project Settings persist

---

## Database Migration Strategy

```rust
// src-tauri/src/database.rs

// Add version tracking
fn get_db_version(conn: &Connection) -> i32 {
    conn.pragma_query_value(None, "user_version", |row| row.get(0))
        .unwrap_or(0)
}

fn set_db_version(conn: &Connection, version: i32) {
    conn.pragma_update(None, "user_version", version).unwrap();
}

fn run_migrations(conn: &Connection) {
    let version = get_db_version(conn);

    if version < 1 {
        // Add properties column
        conn.execute("ALTER TABLE notes ADD COLUMN properties TEXT", []).ok();
        set_db_version(conn, 1);
    }

    if version < 2 {
        // Add project_settings table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS project_settings (
                project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
                settings TEXT NOT NULL DEFAULT '{}'
            )", []
        ).unwrap();
        set_db_version(conn, 2);
    }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src-tauri/src/database.rs` | Add properties column, ProjectSettings table, migrations |
| `src-tauri/src/commands.rs` | Add project settings commands, update note commands |
| `src-tauri/src/lib.rs` | Register new commands |
| `src/renderer/src/lib/api.ts` | Verify Tauri API matches browser API |

---

## Testing Plan

1. **Unit Tests**
   - Note with properties CRUD
   - Project settings CRUD
   - Migration runs without data loss

2. **Integration Tests**
   - Properties Panel saves/loads in Tauri
   - Project settings persist across restarts
   - Existing data preserved after migration

3. **Browser Compatibility**
   - Export from browser, import to Tauri
   - Data format matches between implementations
