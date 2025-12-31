use rusqlite::{Connection, Result as SqlResult, params_from_iter};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub folder: String,
    pub project_id: Option<String>,
    pub properties: Option<String>,  // JSON blob for note properties
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub project_id: String,
    pub settings: String,  // JSON blob
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub project_type: String,
    pub color: Option<String>,
    pub settings: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub path: String,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub sort_order: i32,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> SqlResult<Self> {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory");
        
        std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
        
        let db_path = app_data_dir.join("scribe.db");
        let conn = Connection::open(db_path)?;
        
        // Enable WAL mode for better performance
        conn.pragma_update(None, "journal_mode", "WAL")?;
        
        let mut db = Database { conn };
        db.initialize()?;
        
        Ok(db)
    }
    
    fn initialize(&mut self) -> SqlResult<()> {
        // Create schema_version table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                applied_at INTEGER DEFAULT (strftime('%s', 'now'))
            )",
            [],
        )?;
        
        let current_version = self.get_current_schema_version()?;
        
        if current_version < 1 {
            self.run_migration_001()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [1])?;
        }
        
        if current_version < 2 {
            self.run_migration_002()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [2])?;
        }
        
        if current_version < 3 {
            self.run_migration_003()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [3])?;
        }

        if current_version < 4 {
            self.run_migration_004()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [4])?;
        }

        if current_version < 5 {
            self.run_migration_005()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [5])?;
        }

        if current_version < 6 {
            self.run_migration_006()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [6])?;
        }

        if current_version < 7 {
            self.run_migration_007_seed_demo_data()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [7])?;
        }

        Ok(())
    }
    
    fn get_current_schema_version(&self) -> SqlResult<i32> {
        let version: Result<i32, _> = self.conn.query_row(
            "SELECT MAX(version) FROM schema_version",
            [],
            |row| row.get(0),
        );
        Ok(version.unwrap_or(0))
    }
    
    fn run_migration_001(&self) -> SqlResult<()> {
        println!("✅ Database initialized (schema version 1)");
        
        self.conn.execute_batch(
            "CREATE TABLE notes (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                title TEXT NOT NULL,
                content TEXT DEFAULT '',
                folder TEXT DEFAULT 'inbox',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER DEFAULT (strftime('%s', 'now')),
                deleted_at INTEGER NULL
            );

            CREATE VIRTUAL TABLE notes_fts USING fts5(
                note_id UNINDEXED,
                title,
                content
            );

            CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(note_id, title, content)
                VALUES (new.id, new.title, new.content);
            END;

            CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
                DELETE FROM notes_fts WHERE note_id = old.id;
            END;

            CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
                DELETE FROM notes_fts WHERE note_id = old.id;
                INSERT INTO notes_fts(note_id, title, content)
                VALUES (new.id, new.title, new.content);
            END;

            CREATE INDEX idx_notes_folder ON notes(folder);
            CREATE INDEX idx_notes_updated ON notes(updated_at DESC);
            CREATE INDEX idx_notes_deleted ON notes(deleted_at);

            CREATE TABLE tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id TEXT NOT NULL,
                tag TEXT NOT NULL,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                UNIQUE(note_id, tag)
            );

            CREATE INDEX idx_tags_note ON tags(note_id);
            CREATE INDEX idx_tags_tag ON tags(tag);

            CREATE TABLE folders (
                path TEXT PRIMARY KEY,
                color TEXT,
                icon TEXT,
                sort_order INTEGER DEFAULT 0
            );

            INSERT INTO folders (path, sort_order) VALUES
                ('inbox', 1),
                ('projects', 2),
                ('areas', 3),
                ('resources', 4),
                ('archive', 5);",
        )?;
        
        Ok(())
    }
    
    fn run_migration_002(&self) -> SqlResult<()> {
        println!("✅ Database updated (schema version 2)");
        
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_note_id TEXT NOT NULL,
                target_note_id TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE,
                UNIQUE(source_note_id, target_note_id)
            );

            CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_note_id);
            CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_note_id);",
        )?;
        
        Ok(())
    }
    
    fn run_migration_003(&self) -> SqlResult<()> {
        println!("✅ Database updated (schema version 3)");
        
        self.conn.execute_batch(
            "DROP TABLE IF EXISTS tags;

            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                color TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                UNIQUE(name COLLATE NOCASE)
            );

            CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name COLLATE NOCASE);

            CREATE TABLE IF NOT EXISTS note_tags (
                note_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
            CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);",
        )?;

        Ok(())
    }

    fn run_migration_004(&self) -> SqlResult<()> {
        println!("Running database migration 004 (projects system)");

        self.conn.execute_batch(
            "-- Create projects table
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                name TEXT NOT NULL,
                description TEXT,
                type TEXT CHECK(type IN ('research', 'teaching', 'r-package', 'r-dev', 'generic')) DEFAULT 'generic',
                color TEXT,
                settings TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            -- Add project_id column to notes table
            ALTER TABLE notes ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;

            -- Create index for efficient project-based note lookups
            CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id);

            -- Create index for project name lookups
            CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
            CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);",
        )?;

        println!("Database migration 004 completed (projects system)");
        Ok(())
    }

    fn run_migration_005(&self) -> SqlResult<()> {
        println!("Running database migration 005 (note properties)");

        // Add properties column to notes table
        self.conn.execute(
            "ALTER TABLE notes ADD COLUMN properties TEXT",
            [],
        )?;

        println!("Database migration 005 completed (note properties)");
        Ok(())
    }

    fn run_migration_006(&self) -> SqlResult<()> {
        println!("Running database migration 006 (project settings table)");

        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS project_settings (
                project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
                settings TEXT NOT NULL DEFAULT '{}'
            );",
        )?;

        println!("Database migration 006 completed (project settings table)");
        Ok(())
    }

    /// Migration 007: Seed demo data for new users
    ///
    /// Creates a "Getting Started" project with example notes to help
    /// users understand how Scribe works. Only runs if no projects exist.
    fn run_migration_007_seed_demo_data(&self) -> SqlResult<()> {
        println!("Running database migration 007 (demo data seeding)");

        // Check if any projects already exist (don't seed if user has data)
        let project_count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM projects",
            [],
            |row| row.get(0),
        )?;

        if project_count > 0 {
            println!("  Skipping demo data - projects already exist");
            return Ok(());
        }

        println!("  Seeding demo data for new user...");

        // Generate UUIDs for our entities
        let project_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;

        let note1_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;

        let note2_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;

        let note3_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;

        // Create demo project
        self.conn.execute(
            "INSERT INTO projects (id, name, description, type, color) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![
                &project_id,
                "Getting Started",
                "Learn how to use Scribe with these example notes",
                "generic",
                "#3B82F6"
            ],
        )?;

        // Create demo notes
        let welcome_content = r#"# Welcome to Scribe! 👋

Scribe is an **ADHD-friendly distraction-free writer** designed to help you focus.

## Quick Tips

- Press **⌘N** to create a new note
- Press **⌘D** to open today's daily note
- Press **⌘K** to open the command palette
- Press **Escape** to close panels

## Tauri Desktop App

You're running Scribe as a **native desktop app** with SQLite storage.
Your notes are saved locally and sync instantly!

## Getting Started

1. Create a new note with ⌘N
2. Start writing without distractions
3. Use #tags to organize your notes
4. Link notes with [[wiki links]]

See the [[Features Overview]] note for more details."#;

        let features_content = r#"# Features Overview

Scribe includes these core features to help you write:

## ✍️ Writing
- Clean, minimal editor
- Auto-save (never lose work)
- Dark mode for less eye strain
- Word count & reading time

## 🏷️ Organization
- **Tags**: Add #tags anywhere in your notes
- **Folders**: inbox, notes, archive
- **Projects**: Group related notes together

## 🔗 Knowledge
- **Wiki Links**: Connect notes with [[Note Title]]
- **Backlinks**: See what links to the current note
- **Daily Notes**: Quick journal entries

## 📚 Academic Features
- Citation management with Zotero
- Export to PDF, Word, LaTeX
- Equation support with KaTeX

## 🤖 AI Integration
- Claude CLI integration
- Gemini CLI integration
- No API keys needed - uses your installed CLI tools"#;

        let daily_content = format!(r#"# Daily Note Example

## Focus for Today
- [ ] Review the [[Welcome to Scribe]] tutorial
- [ ] Create your first note
- [ ] Try adding some #tags

## Notes
Use this space for quick thoughts and ideas.

Press ⌘D anytime to open today's daily note.

## End of Day Review
What did you accomplish today?"#);

        // Insert notes
        self.conn.execute(
            "INSERT INTO notes (id, title, content, folder, project_id) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![&note1_id, "Welcome to Scribe", welcome_content, "inbox", &project_id],
        )?;

        self.conn.execute(
            "INSERT INTO notes (id, title, content, folder, project_id) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![&note2_id, "Features Overview", features_content, "notes", &project_id],
        )?;

        self.conn.execute(
            "INSERT INTO notes (id, title, content, folder, project_id) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![&note3_id, "Daily Note Example", &daily_content, "notes", rusqlite::types::Null],
        )?;

        // Update FTS index
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content) VALUES (?, ?, ?)",
            rusqlite::params![&note1_id, "Welcome to Scribe", welcome_content],
        )?;
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content) VALUES (?, ?, ?)",
            rusqlite::params![&note2_id, "Features Overview", features_content],
        )?;
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content) VALUES (?, ?, ?)",
            rusqlite::params![&note3_id, "Daily Note Example", &daily_content],
        )?;

        // Create demo tags
        let tag_welcome_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;
        let tag_tutorial_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;
        let tag_tips_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;

        self.conn.execute(
            "INSERT INTO tags (id, name, color) VALUES (?, ?, ?)",
            rusqlite::params![&tag_welcome_id, "welcome", "#10B981"],
        )?;
        self.conn.execute(
            "INSERT INTO tags (id, name, color) VALUES (?, ?, ?)",
            rusqlite::params![&tag_tutorial_id, "tutorial", "#8B5CF6"],
        )?;
        self.conn.execute(
            "INSERT INTO tags (id, name, color) VALUES (?, ?, ?)",
            rusqlite::params![&tag_tips_id, "tips", "#F59E0B"],
        )?;

        // Associate tags with notes
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note1_id, &tag_welcome_id],
        )?;
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note1_id, &tag_tutorial_id],
        )?;
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note2_id, &tag_tutorial_id],
        )?;
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note2_id, &tag_tips_id],
        )?;

        // Create wiki link from Welcome to Features Overview
        self.conn.execute(
            "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
            rusqlite::params![&note1_id, &note2_id],
        )?;

        println!("  ✅ Demo data seeded successfully:");
        println!("     - 1 project: 'Getting Started'");
        println!("     - 3 notes: Welcome, Features, Daily Example");
        println!("     - 3 tags: #welcome, #tutorial, #tips");

        Ok(())
    }

    // Note CRUD operations
    
    pub fn create_note(&self, title: &str, content: &str, folder: &str, project_id: Option<&str>, properties: Option<&str>) -> SqlResult<Note> {
        self.conn.execute(
            "INSERT INTO notes (title, content, folder, project_id, properties) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![title, content, folder, project_id, properties],
        )?;

        let note = self.conn.query_row(
            "SELECT id, title, content, folder, project_id, properties, created_at, updated_at, deleted_at
             FROM notes WHERE rowid = last_insert_rowid()",
            [],
            |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    project_id: row.get(4)?,
                    properties: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                    deleted_at: row.get(8)?,
                })
            },
        )?;
        
        // Parse tags and links
        self.update_note_tags(&note.id, content)?;
        self.update_note_links(&note.id, content)?;
        
        Ok(note)
    }
    
    pub fn get_note(&self, id: &str) -> SqlResult<Option<Note>> {
        let result = self.conn.query_row(
            "SELECT id, title, content, folder, project_id, properties, created_at, updated_at, deleted_at
             FROM notes WHERE id = ? AND deleted_at IS NULL",
            [id],
            |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    project_id: row.get(4)?,
                    properties: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                    deleted_at: row.get(8)?,
                })
            },
        );

        match result {
            Ok(note) => Ok(Some(note)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
    
    pub fn list_notes(&self, folder: Option<&str>) -> SqlResult<Vec<Note>> {
        if let Some(f) = folder {
            let mut stmt = self.conn.prepare(
                "SELECT id, title, content, folder, project_id, properties, created_at, updated_at, deleted_at
                 FROM notes WHERE folder = ? AND deleted_at IS NULL
                 ORDER BY updated_at DESC",
            )?;

            let notes = stmt.query_map([f], |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    project_id: row.get(4)?,
                    properties: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                    deleted_at: row.get(8)?,
                })
            })?;

            notes.collect()
        } else {
            let mut stmt = self.conn.prepare(
                "SELECT id, title, content, folder, project_id, properties, created_at, updated_at, deleted_at
                 FROM notes WHERE deleted_at IS NULL
                 ORDER BY updated_at DESC",
            )?;

            let notes = stmt.query_map([], |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    project_id: row.get(4)?,
                    properties: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                    deleted_at: row.get(8)?,
                })
            })?;

            notes.collect()
        }
    }
    
    pub fn update_note(&self, id: &str, title: Option<&str>, content: Option<&str>, properties: Option<&str>) -> SqlResult<Option<Note>> {
        if title.is_none() && content.is_none() && properties.is_none() {
            return self.get_note(id);
        }

        // Build dynamic SQL and collect owned values for params
        let mut sql_parts = Vec::new();
        let mut param_values: Vec<String> = Vec::new();

        if let Some(t) = title {
            sql_parts.push("title = ?");
            param_values.push(t.to_string());
        }
        if let Some(c) = content {
            sql_parts.push("content = ?");
            param_values.push(c.to_string());
        }
        if let Some(p) = properties {
            sql_parts.push("properties = ?");
            param_values.push(p.to_string());
        }
        sql_parts.push("updated_at = strftime('%s', 'now')");
        param_values.push(id.to_string());

        let sql = format!("UPDATE notes SET {} WHERE id = ?", sql_parts.join(", "));

        // Convert to references for params_from_iter
        let params: Vec<&dyn rusqlite::ToSql> = param_values.iter().map(|s| s as &dyn rusqlite::ToSql).collect();
        self.conn.execute(&sql, params_from_iter(params))?;

        let note = self.get_note(id)?;
        if let Some(n) = &note {
            if content.is_some() {
                self.update_note_tags(&n.id, &n.content)?;
                self.update_note_links(&n.id, &n.content)?;
            }
        }

        Ok(note)
    }
    
    pub fn delete_note(&self, id: &str) -> SqlResult<bool> {
        let changes = self.conn.execute(
            "UPDATE notes SET deleted_at = strftime('%s', 'now') WHERE id = ?",
            [id],
        )?;
        Ok(changes > 0)
    }
    
    pub fn search_notes(&self, query: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT notes.id, notes.title, notes.content, notes.folder, notes.project_id,
                    notes.properties, notes.created_at, notes.updated_at, notes.deleted_at
             FROM notes
             JOIN notes_fts ON notes.id = notes_fts.note_id
             WHERE notes_fts MATCH ? AND notes.deleted_at IS NULL
             ORDER BY rank
             LIMIT 50",
        )?;

        let notes = stmt.query_map([query], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                project_id: row.get(4)?,
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        })?;

        notes.collect()
    }
    
    pub fn get_folders(&self) -> SqlResult<Vec<Folder>> {
        let mut stmt = self.conn.prepare(
            "SELECT path, color, icon, sort_order FROM folders ORDER BY sort_order",
        )?;
        
        let folders = stmt.query_map([], |row| {
            Ok(Folder {
                path: row.get(0)?,
                color: row.get(1)?,
                icon: row.get(2)?,
                sort_order: row.get(3)?,
            })
        })?;
        
        folders.collect()
    }

    // Tag operations

    pub fn create_tag(&self, name: &str, color: Option<&str>) -> SqlResult<Tag> {
        self.conn.execute(
            "INSERT INTO tags (name, color) VALUES (?, ?)",
            [name, color.unwrap_or("")],
        )?;
        
        let tag = self.conn.query_row(
            "SELECT id, name, color, created_at FROM tags WHERE rowid = last_insert_rowid()",
            [],
            |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )?;
        
        Ok(tag)
    }

    pub fn get_tag(&self, id: &str) -> SqlResult<Option<Tag>> {
        let result = self.conn.query_row(
            "SELECT id, name, color, created_at FROM tags WHERE id = ?",
            [id],
            |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        );
        
        match result {
            Ok(tag) => Ok(Some(tag)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn get_tag_by_name(&self, name: &str) -> SqlResult<Option<Tag>> {
        let result = self.conn.query_row(
            "SELECT id, name, color, created_at FROM tags WHERE name = ? COLLATE NOCASE",
            [name],
            |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        );
        
        match result {
            Ok(tag) => Ok(Some(tag)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn get_all_tags(&self) -> SqlResult<Vec<serde_json::Value>> {
        let mut stmt = self.conn.prepare(
            "SELECT tags.id, tags.name, tags.color, tags.created_at, COUNT(note_tags.note_id) as note_count
             FROM tags
             LEFT JOIN note_tags ON tags.id = note_tags.tag_id
             GROUP BY tags.id
             ORDER BY tags.name COLLATE NOCASE",
        )?;
        
        let tags = stmt.query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "name": row.get::<_, String>(1)?,
                "color": row.get::<_, Option<String>>(2)?,
                "created_at": row.get::<_, i64>(3)?,
                "note_count": row.get::<_, i64>(4)?
            }))
        })?;
        
        tags.collect()
    }

    pub fn rename_tag(&self, id: &str, new_name: &str) -> SqlResult<bool> {
        let changes = self.conn.execute(
            "UPDATE tags SET name = ? WHERE id = ?",
            [new_name, id],
        )?;
        Ok(changes > 0)
    }

    pub fn delete_tag(&self, id: &str) -> SqlResult<bool> {
        let changes = self.conn.execute("DELETE FROM tags WHERE id = ?", [id])?;
        Ok(changes > 0)
    }

    pub fn add_tag_to_note(&self, note_id: &str, tag_name: &str) -> SqlResult<()> {
        let mut tag = self.get_tag_by_name(tag_name)?;
        
        if tag.is_none() {
            // Generate a default color or just use null
            let color = self.generate_tag_color(tag_name);
            tag = Some(self.create_tag(tag_name, Some(&color))?);
        }
        
        let tag_id = tag.unwrap().id;
        
        self.conn.execute(
            "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            [note_id, &tag_id],
        )?;
        
        Ok(())
    }

    pub fn remove_tag_from_note(&self, note_id: &str, tag_id: &str) -> SqlResult<()> {
        self.conn.execute(
            "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
            [note_id, tag_id],
        )?;
        Ok(())
    }

    pub fn get_note_tags(&self, note_id: &str) -> SqlResult<Vec<Tag>> {
        let mut stmt = self.conn.prepare(
            "SELECT tags.id, tags.name, tags.color, tags.created_at
             FROM tags
             JOIN note_tags ON tags.id = note_tags.tag_id
             WHERE note_tags.note_id = ?
             ORDER BY tags.name COLLATE NOCASE",
        )?;
        
        let tags = stmt.query_map([note_id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?;
        
        tags.collect()
    }

    pub fn get_notes_by_tag(&self, tag_id: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT notes.id, notes.title, notes.content, notes.folder, notes.project_id,
                    notes.properties, notes.created_at, notes.updated_at, notes.deleted_at
             FROM notes
             JOIN note_tags ON notes.id = note_tags.note_id
             WHERE note_tags.tag_id = ? AND notes.deleted_at IS NULL
             ORDER BY notes.updated_at DESC",
        )?;

        let notes = stmt.query_map([tag_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                project_id: row.get(4)?,
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        })?;

        notes.collect()
    }

    pub fn filter_notes_by_tags(&self, tag_ids: Vec<String>, match_all: bool) -> SqlResult<Vec<Note>> {
        if tag_ids.is_empty() {
            return self.list_notes(None);
        }

        let placeholders = vec!["?"; tag_ids.len()].join(",");
        let columns = "notes.id, notes.title, notes.content, notes.folder, notes.project_id, notes.properties, notes.created_at, notes.updated_at, notes.deleted_at";

        let sql = if match_all {
            format!(
                "SELECT {} FROM notes
                 WHERE notes.deleted_at IS NULL
                 AND notes.id IN (
                   SELECT note_id FROM note_tags
                   WHERE tag_id IN ({})
                   GROUP BY note_id
                   HAVING COUNT(DISTINCT tag_id) = ?
                 )
                 ORDER BY notes.updated_at DESC",
                columns, placeholders
            )
        } else {
            format!(
                "SELECT DISTINCT {} FROM notes
                 JOIN note_tags ON notes.id = note_tags.note_id
                 WHERE notes.deleted_at IS NULL
                 AND note_tags.tag_id IN ({})
                 ORDER BY notes.updated_at DESC",
                columns, placeholders
            )
        };

        let mut params: Vec<Box<dyn rusqlite::ToSql>> = tag_ids
            .into_iter()
            .map(|id| Box::new(id) as Box<dyn rusqlite::ToSql>)
            .collect();

        if match_all {
            params.push(Box::new(params.len() as i32));
        }

        let mut stmt = self.conn.prepare(&sql)?;
        let notes_iter = stmt.query_map(params_from_iter(params), |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                project_id: row.get(4)?,
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        })?;

        notes_iter.collect()
    }

    pub fn update_note_tags(&self, note_id: &str, content: &str) -> SqlResult<()> {
        // Support hierarchical tags with / (e.g., #research/statistics/mediation)
        let tag_regex = regex::Regex::new(r"#([a-zA-Z0-9_/-]+)").unwrap();
        let tags: std::collections::HashSet<String> = tag_regex
            .captures_iter(content)
            .map(|cap| cap[1].to_string())
            .collect();

        // Get current tags
        let current_tags = self.get_note_tags(note_id)?;
        let current_tag_names: std::collections::HashSet<String> = current_tags.iter().map(|t| t.name.to_lowercase()).collect();

        // Add new tags
        for tag_name in &tags {
            if !current_tag_names.contains(&tag_name.to_lowercase()) {
                self.add_tag_to_note(note_id, tag_name)?;
            }
        }

        // Remove tags no longer in content
        for tag in current_tags {
            if !tags.iter().any(|t| t.to_lowercase() == tag.name.to_lowercase()) {
                self.remove_tag_from_note(note_id, &tag.id)?;
            }
        }

        Ok(())
    }

    // Link operations

    pub fn update_note_links(&self, note_id: &str, content: &str) -> SqlResult<()> {
        let link_regex = regex::Regex::new(r"\[\[([^\]]+)\]\]").unwrap();
        let linked_titles: Vec<String> = link_regex
            .captures_iter(content)
            .map(|cap| cap[1].trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        // Delete existing links
        self.conn.execute("DELETE FROM links WHERE source_note_id = ?", [note_id])?;

        // Add new links
        for title in linked_titles {
            let target_id_result: SqlResult<String> = self.conn.query_row(
                "SELECT id FROM notes WHERE title = ? AND deleted_at IS NULL",
                [title],
                |row| row.get(0),
            );

            if let Ok(target_id) = target_id_result {
                self.conn.execute(
                    "INSERT OR IGNORE INTO links (source_note_id, target_note_id) VALUES (?, ?)",
                    [note_id, &target_id],
                )?;
            }
        }

        Ok(())
    }

    pub fn get_backlinks(&self, note_id: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT notes.id, notes.title, notes.content, notes.folder, notes.project_id,
                    notes.properties, notes.created_at, notes.updated_at, notes.deleted_at
             FROM notes
             JOIN links ON notes.id = links.source_note_id
             WHERE links.target_note_id = ? AND notes.deleted_at IS NULL
             ORDER BY notes.updated_at DESC",
        )?;

        let notes = stmt.query_map([note_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                project_id: row.get(4)?,
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        })?;

        notes.collect()
    }

    pub fn get_outgoing_links(&self, note_id: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT notes.id, notes.title, notes.content, notes.folder, notes.project_id,
                    notes.properties, notes.created_at, notes.updated_at, notes.deleted_at
             FROM notes
             JOIN links ON notes.id = links.target_note_id
             WHERE links.source_note_id = ? AND notes.deleted_at IS NULL
             ORDER BY notes.updated_at DESC",
        )?;

        let notes = stmt.query_map([note_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                project_id: row.get(4)?,
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        })?;

        notes.collect()
    }

    pub fn get_note_by_title_and_folder(&self, title: &str, folder: &str) -> SqlResult<Option<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, content, folder, project_id, properties, created_at, updated_at, deleted_at
             FROM notes WHERE title = ? AND folder = ? AND deleted_at IS NULL LIMIT 1"
        )?;
        let note = stmt.query_row([title, folder], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                project_id: row.get(4)?,
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        });

        match note {
            Ok(n) => Ok(Some(n)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }


    fn generate_tag_color(&self, name: &str) -> String {
        let hash = name.chars().fold(0u32, |acc, c| {
            c as u32 + ((acc << 5).wrapping_sub(acc))
        });
        let hue = hash % 360;
        format!("hsl({}, 70%, 50%)", hue)
    }

    // Project CRUD operations

    pub fn create_project(
        &self,
        name: &str,
        description: Option<&str>,
        project_type: &str,
        color: Option<&str>,
        settings: Option<&str>,
    ) -> SqlResult<Project> {
        self.conn.execute(
            "INSERT INTO projects (name, description, type, color, settings) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![name, description, project_type, color, settings],
        )?;

        let project = self.conn.query_row(
            "SELECT id, name, description, type, color, settings, created_at, updated_at
             FROM projects WHERE rowid = last_insert_rowid()",
            [],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    project_type: row.get(3)?,
                    color: row.get(4)?,
                    settings: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )?;

        Ok(project)
    }

    pub fn get_project(&self, id: &str) -> SqlResult<Option<Project>> {
        let result = self.conn.query_row(
            "SELECT id, name, description, type, color, settings, created_at, updated_at
             FROM projects WHERE id = ?",
            [id],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    project_type: row.get(3)?,
                    color: row.get(4)?,
                    settings: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        );

        match result {
            Ok(project) => Ok(Some(project)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn list_projects(&self, project_type: Option<&str>) -> SqlResult<Vec<Project>> {
        if let Some(pt) = project_type {
            let mut stmt = self.conn.prepare(
                "SELECT id, name, description, type, color, settings, created_at, updated_at
                 FROM projects WHERE type = ?
                 ORDER BY name COLLATE NOCASE",
            )?;

            let projects = stmt.query_map([pt], |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    project_type: row.get(3)?,
                    color: row.get(4)?,
                    settings: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?;

            projects.collect()
        } else {
            let mut stmt = self.conn.prepare(
                "SELECT id, name, description, type, color, settings, created_at, updated_at
                 FROM projects
                 ORDER BY name COLLATE NOCASE",
            )?;

            let projects = stmt.query_map([], |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    project_type: row.get(3)?,
                    color: row.get(4)?,
                    settings: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?;

            projects.collect()
        }
    }

    pub fn update_project(
        &self,
        id: &str,
        name: Option<&str>,
        description: Option<&str>,
        project_type: Option<&str>,
        color: Option<&str>,
        settings: Option<&str>,
    ) -> SqlResult<Option<Project>> {
        let mut sql_parts = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(n) = name {
            sql_parts.push("name = ?");
            params.push(Box::new(n.to_string()));
        }
        if let Some(d) = description {
            sql_parts.push("description = ?");
            params.push(Box::new(d.to_string()));
        }
        if let Some(pt) = project_type {
            sql_parts.push("type = ?");
            params.push(Box::new(pt.to_string()));
        }
        if let Some(c) = color {
            sql_parts.push("color = ?");
            params.push(Box::new(c.to_string()));
        }
        if let Some(s) = settings {
            sql_parts.push("settings = ?");
            params.push(Box::new(s.to_string()));
        }

        if sql_parts.is_empty() {
            return self.get_project(id);
        }

        sql_parts.push("updated_at = strftime('%s', 'now')");
        params.push(Box::new(id.to_string()));

        let sql = format!("UPDATE projects SET {} WHERE id = ?", sql_parts.join(", "));
        self.conn.execute(&sql, params_from_iter(params))?;

        self.get_project(id)
    }

    pub fn delete_project(&self, id: &str) -> SqlResult<bool> {
        // First, unassign all notes from this project
        self.conn.execute(
            "UPDATE notes SET project_id = NULL WHERE project_id = ?",
            [id],
        )?;

        let changes = self.conn.execute("DELETE FROM projects WHERE id = ?", [id])?;
        Ok(changes > 0)
    }

    pub fn get_notes_by_project(&self, project_id: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, content, folder, project_id, properties, created_at, updated_at, deleted_at
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
                properties: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                deleted_at: row.get(8)?,
            })
        })?;

        notes.collect()
    }

    pub fn assign_note_to_project(&self, note_id: &str, project_id: Option<&str>) -> SqlResult<bool> {
        let changes = self.conn.execute(
            "UPDATE notes SET project_id = ?, updated_at = strftime('%s', 'now') WHERE id = ?",
            rusqlite::params![project_id, note_id],
        )?;
        Ok(changes > 0)
    }

    pub fn get_project_note_count(&self, project_id: &str) -> SqlResult<i64> {
        self.conn.query_row(
            "SELECT COUNT(*) FROM notes WHERE project_id = ? AND deleted_at IS NULL",
            [project_id],
            |row| row.get(0),
        )
    }

    // Project Settings operations

    pub fn get_project_settings(&self, project_id: &str) -> SqlResult<Option<String>> {
        let result = self.conn.query_row(
            "SELECT settings FROM project_settings WHERE project_id = ?",
            [project_id],
            |row| row.get(0),
        );
        match result {
            Ok(settings) => Ok(Some(settings)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn update_project_settings(&self, project_id: &str, settings: &str) -> SqlResult<()> {
        self.conn.execute(
            "INSERT INTO project_settings (project_id, settings) VALUES (?, ?)
             ON CONFLICT(project_id) DO UPDATE SET settings = excluded.settings",
            [project_id, settings],
        )?;
        Ok(())
    }
}

