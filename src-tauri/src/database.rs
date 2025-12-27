use rusqlite::{Connection, Result as SqlResult, params_from_iter};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub folder: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
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
    
    // Note CRUD operations
    
    pub fn create_note(&self, title: &str, content: &str, folder: &str) -> SqlResult<Note> {
        self.conn.execute(
            "INSERT INTO notes (title, content, folder) VALUES (?, ?, ?)",
            [title, content, folder],
        )?;
        
        let note = self.conn.query_row(
            "SELECT id, title, content, folder, created_at, updated_at, deleted_at 
             FROM notes WHERE rowid = last_insert_rowid()",
            [],
            |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                    deleted_at: row.get(6)?,
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
            "SELECT id, title, content, folder, created_at, updated_at, deleted_at 
             FROM notes WHERE id = ? AND deleted_at IS NULL",
            [id],
            |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                    deleted_at: row.get(6)?,
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
                "SELECT id, title, content, folder, created_at, updated_at, deleted_at 
                 FROM notes WHERE folder = ? AND deleted_at IS NULL 
                 ORDER BY updated_at DESC",
            )?;
            
            let notes = stmt.query_map([f], |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                    deleted_at: row.get(6)?,
                })
            })?;
            
            notes.collect()
        } else {
            let mut stmt = self.conn.prepare(
                "SELECT id, title, content, folder, created_at, updated_at, deleted_at 
                 FROM notes WHERE deleted_at IS NULL 
                 ORDER BY updated_at DESC",
            )?;
            
            let notes = stmt.query_map([], |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    folder: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                    deleted_at: row.get(6)?,
                })
            })?;
            
            notes.collect()
        }
    }
    
    pub fn update_note(&self, id: &str, title: Option<&str>, content: Option<&str>) -> SqlResult<Option<Note>> {
        if title.is_none() && content.is_none() {
            return self.get_note(id);
        }
        
        let mut sql_parts = Vec::new();
        
        if title.is_some() {
            sql_parts.push("title = ?");
        }
        if content.is_some() {
            sql_parts.push("content = ?");
        }
        sql_parts.push("updated_at = strftime('%s', 'now')");
        
        let sql = format!("UPDATE notes SET {} WHERE id = ?", sql_parts.join(", "));
        
        match (title, content) {
            (Some(t), Some(c)) => {
                self.conn.execute(&sql, rusqlite::params![t, c, id])?;
            }
            (Some(t), None) => {
                self.conn.execute(&sql, rusqlite::params![t, id])?;
            }
            (None, Some(c)) => {
                self.conn.execute(&sql, rusqlite::params![c, id])?;
            }
            (None, None) => unreachable!(),
        }
        
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
            "SELECT notes.id, notes.title, notes.content, notes.folder, 
                    notes.created_at, notes.updated_at, notes.deleted_at
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
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                deleted_at: row.get(6)?,
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
            "SELECT notes.id, notes.title, notes.content, notes.folder, 
                    notes.created_at, notes.updated_at, notes.deleted_at
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
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                deleted_at: row.get(6)?,
            })
        })?;
        
        notes.collect()
    }

    pub fn filter_notes_by_tags(&self, tag_ids: Vec<String>, match_all: bool) -> SqlResult<Vec<Note>> {
        if tag_ids.is_empty() {
            return self.list_notes(None);
        }

        let placeholders = vec!["?"; tag_ids.len()].join(",");
        
        let sql = if match_all {
            format!(
                "SELECT notes.* FROM notes
                 WHERE notes.deleted_at IS NULL
                 AND notes.id IN (
                   SELECT note_id FROM note_tags
                   WHERE tag_id IN ({})
                   GROUP BY note_id
                   HAVING COUNT(DISTINCT tag_id) = ?
                 )
                 ORDER BY notes.updated_at DESC",
                placeholders
            )
        } else {
            format!(
                "SELECT DISTINCT notes.* FROM notes
                 JOIN note_tags ON notes.id = note_tags.note_id
                 WHERE notes.deleted_at IS NULL
                 AND note_tags.tag_id IN ({})
                 ORDER BY notes.updated_at DESC",
                placeholders
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
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                deleted_at: row.get(6)?,
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
            "SELECT notes.id, notes.title, notes.content, notes.folder, 
                    notes.created_at, notes.updated_at, notes.deleted_at
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
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                deleted_at: row.get(6)?,
            })
        })?;
        
        notes.collect()
    }

    pub fn get_outgoing_links(&self, note_id: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT notes.id, notes.title, notes.content, notes.folder, 
                    notes.created_at, notes.updated_at, notes.deleted_at
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
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                deleted_at: row.get(6)?,
            })
        })?;
        
        notes.collect()
    }
    pub fn get_note_by_title_and_folder(&self, title: &str, folder: &str) -> SqlResult<Option<Note>> {
        let mut stmt = self.conn.prepare("SELECT id, title, content, folder, created_at, updated_at, deleted_at FROM notes WHERE title = ? AND folder = ? AND deleted_at IS NULL LIMIT 1")?;
        let note = stmt.query_row([title, folder], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                folder: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                deleted_at: row.get(6)?,
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
}

