use rusqlite::{Connection, Result as SqlResult, params_from_iter, params};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use tauri::{AppHandle, Manager};
use std::collections::HashMap;

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
#[allow(dead_code)]  // Future use for project-specific settings
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

// Property validation types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PropertyType {
    Text,
    Date,
    Number,
    Checkbox,
    List,
    Link,
    Tags,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub key: String,
    #[serde(rename = "type")]
    pub prop_type: PropertyType,
    pub value: JsonValue,
    #[serde(default)]
    pub readonly: bool,
}

pub struct Database {
    #[cfg(not(test))]
    conn: Connection,
    #[cfg(test)]
    pub(crate) conn: Connection,
}

// Database backup structures
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseBackup {
    pub version: String,
    pub timestamp: i64,
    pub notes: Vec<Note>,
    pub projects: Vec<Project>,
    pub tags: Vec<Tag>,
    pub folders: Vec<Folder>,
    pub note_tags: Vec<NoteTag>,
    pub links: Vec<Link>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteTag {
    pub note_id: String,
    pub tag_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Link {
    pub source_note_id: String,
    pub target_note_id: String,
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

    #[cfg(test)]
    pub fn new_with_path<P: AsRef<std::path::Path>>(path: P) -> SqlResult<Self> {
        let conn = Connection::open(path)?;
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

        if current_version < 8 {
            self.run_migration_008_add_properties_to_fts()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [8])?;
        }

        if current_version < 9 {
            self.run_migration_009_chat_history()?;
            self.conn.execute("INSERT INTO schema_version (version) VALUES (?)", [9])?;
        }

        Ok(())
    }
    
    #[cfg(not(test))]
    fn get_current_schema_version(&self) -> SqlResult<i32> {
        let version: Result<i32, _> = self.conn.query_row(
            "SELECT MAX(version) FROM schema_version",
            [],
            |row| row.get(0),
        );
        Ok(version.unwrap_or(0))
    }

    #[cfg(test)]
    pub(crate) fn get_current_schema_version(&self) -> SqlResult<i32> {
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

        let note4_id: String = self.conn.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        )?;

        let note5_id: String = self.conn.query_row(
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

        let callouts_content = r#"# Callout Types

Scribe supports Obsidian-style callouts for highlighting important information. Use the syntax `> [!type]` to create callouts.

## Informational Callouts

> [!note]
> This is a **note** callout. Use it for general information or side notes.

> [!info]
> This is an **info** callout. Perfect for additional context or explanations.

> [!abstract] Summary
> This is an **abstract** callout (also: summary, tldr). Great for executive summaries.

## Positive Callouts

> [!tip] Pro Tip
> This is a **tip** callout (also: hint, important). Share helpful suggestions!

> [!success] Well Done!
> This is a **success** callout (also: check, done). Celebrate achievements!

## Warning Callouts

> [!warning]
> This is a **warning** callout (also: caution, attention). Highlight potential issues.

> [!danger] Critical
> This is a **danger** callout (also: error). For critical warnings or errors.

> [!bug]
> This is a **bug** callout. Document known issues or bugs.

## Other Callouts

> [!question] FAQ
> This is a **question** callout (also: help, faq). Perfect for Q&A sections.

> [!example]
> This is an **example** callout. Show code examples or demonstrations.

> [!quote] Albert Einstein
> This is a **quote** callout (also: cite). Attribute quotes elegantly.

---

## Syntax Reference

```markdown
> [!note]
> Basic callout with default title

> [!tip] Custom Title
> Callout with a custom title

> [!warning]
> Multi-line callouts work too.
> Just keep using > on each line.
```

## Supported Types

| Type | Aliases | Color |
|------|---------|-------|
| note | - | Blue |
| info | - | Blue |
| tip | hint, important | Green |
| success | check, done | Green |
| warning | caution, attention | Orange |
| danger | error | Red |
| bug | - | Red |
| question | help, faq | Purple |
| example | - | Gray |
| quote | cite | Gray |
| abstract | summary, tldr | Cyan |

See also: [[Features Overview]]"#;

        let quarto_content = r####"# 🧪 Quarto Autocomplete Test Page

**Welcome!** This page helps you test and explore Quarto's powerful autocomplete features.

> [!tip] Getting Started
> 1. Press **⌘1** to enter Source mode (required for autocomplete)
> 2. Try the examples below - autocomplete will appear as you type!
> 3. Press **Ctrl+Space** to manually trigger autocomplete anytime

---

## 📝 Test 1: YAML Frontmatter Autocomplete

**Instructions:** Place your cursor in the YAML section below (between the `---` lines) and start typing.

```yaml
---
# Type "for" here to see format: completion
# Try: format, title, author, execute, bibliography, theme

# Example: Type "for" then accept "format:"
format:

# Try typing "tit" for title:
title:

# Try "exec" for execute options:
execute:
  echo:
  warning:

# More to try: cite-method, toc, code-fold, highlight-style
---
```

**What to expect:**
- Type partial keys (e.g., "for") → Menu shows matching options ("format:")
- After colon, type partial values (e.g., "ht") → Menu shows "html", "pdf", etc.

---

## 💻 Test 2: Chunk Options Autocomplete

**Instructions:** Inside code blocks below, type `#|` followed by a space to see chunk options.

### Example 1: Figure with Multiple Options

```{r}
#| label: fig-test-plot
#| fig-cap: "My test plot"
#| fig-width: 8
#| fig-height: 6
#| echo: false
#| warning: false

# Try adding more options here!
# Type "#| " (hash-pipe-space) below and explore:

plot(1:10)
```

### Example 2: Try It Yourself!

```python
# Add chunk options here:
# Type "#| " and try:
#   - echo (true/false)
#   - eval (true/false)
#   - output (true/false/asis)
#   - code-fold (true/false/show)

import matplotlib.pyplot as plt
plt.plot([1,2,3], [1,4,9])
```

**What to expect:**
- `#| ` (with space) → Menu shows all chunk options
- After option name, type value → Menu shows valid values (true/false, numbers, etc.)

---

## 🔗 Test 3: Cross-Reference Autocomplete

**Instructions:** Type `@` followed by a label prefix to see all matching references.

### Figures for Testing

![Test Figure 1](image1.png){#fig-example1}
![Test Figure 2](image2.png){#fig-example2}

```{r}
#| label: fig-scatter
#| fig-cap: "Scatter plot example"
plot(rnorm(100), rnorm(100))
```

### Tables for Testing

| Item | Value |
|------|-------|
| A    | 10    |
| B    | 20    |
{#tbl-data}

| Metric | Score |
|--------|-------|
| Speed  | 95%   |
{#tbl-performance}

### Sections for Testing

## Introduction {#sec-intro}

## Methods {#sec-methods}

## Results {#sec-results}

### Equations for Testing

$$
E = mc^2
$$ {#eq-einstein}

$$
y = mx + b
$$ {#eq-linear}

---

## 🎯 Now Try Cross-References!

Type `@` followed by a prefix below to see autocomplete:

- Figures: Type `@fig` to see all figures (@fig-example1, @fig-example2, @fig-scatter)
- Tables: Type `@tbl` to see all tables (@tbl-data, @tbl-performance)
- Sections: Type `@sec` to see all sections (@sec-intro, @sec-methods, @sec-results)
- Equations: Type `@eq` to see all equations (@eq-einstein, @eq-linear)

**Try it here:**



**What to expect:**
- `@fig` → Menu shows all figure labels with their captions
- `@tbl` → Menu shows all table labels
- `@sec` → Menu shows all section headers
- `@eq` → Menu shows all equation labels

---

## 🎓 Learning Tips

### YAML Frontmatter
- **40+ keys supported**: format, title, author, date, execute, bibliography, toc, theme, etc.
- **Smart value completion**: After typing key and colon, get relevant value suggestions
- **Nested options**: Works with nested YAML like `execute: echo: false`

### Chunk Options
- **30+ options**: echo, eval, warning, message, fig-width, fig-cap, label, etc.
- **Type-aware values**: Boolean options suggest true/false, numeric options suggest common sizes
- **Language agnostic**: Works in R, Python, Julia, JavaScript code blocks

### Cross-References
- **6 label types**: fig, tbl, eq, sec, lst, thm
- **Auto-detection**: Scans document for `{#type-label}` and `#| label: type-label`
- **Context hints**: Shows captions/titles in autocomplete detail panel
- **Fast scanning**: Handles 100+ labels instantly

---

## 🚀 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Trigger autocomplete | **Ctrl+Space** |
| Accept suggestion | **Enter** or **Tab** |
| Navigate options | **↑** / **↓** |
| Dismiss menu | **Escape** |
| Source mode | **⌘1** |
| Live Preview mode | **⌘2** |

---

## 🐛 Troubleshooting

**Autocomplete not appearing?**
1. Make sure you're in Source mode (**⌘1**)
2. Try **Ctrl+Space** to force trigger
3. Check you're in the right context (YAML block, code block, or typing `@`)

**Wrong suggestions?**
1. Verify cursor position (before/after special characters)
2. Check for proper spacing (e.g., `#| ` needs space after pipe)

---

> [!success] All Set!
> You now know how to use Quarto autocomplete in Scribe. Happy writing! 📝

See [[Features Overview]] for more Scribe tips."####;

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

        self.conn.execute(
            "INSERT INTO notes (id, title, content, folder, project_id) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![&note4_id, "Callout Types", callouts_content, "inbox", &project_id],
        )?;

        self.conn.execute(
            "INSERT INTO notes (id, title, content, folder, project_id) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![&note5_id, "🧪 Quarto Autocomplete Test Page", quarto_content, "inbox", &project_id],
        )?;

        // Update FTS index (properties column added in migration 008, use empty string for demo notes)
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content, properties) VALUES (?, ?, ?, '')",
            rusqlite::params![&note1_id, "Welcome to Scribe", welcome_content],
        )?;
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content, properties) VALUES (?, ?, ?, '')",
            rusqlite::params![&note2_id, "Features Overview", features_content],
        )?;
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content, properties) VALUES (?, ?, ?, '')",
            rusqlite::params![&note3_id, "Daily Note Example", &daily_content],
        )?;
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content, properties) VALUES (?, ?, ?, '')",
            rusqlite::params![&note4_id, "Callout Types", callouts_content],
        )?;
        self.conn.execute(
            "INSERT INTO notes_fts (note_id, title, content, properties) VALUES (?, ?, ?, '')",
            rusqlite::params![&note5_id, "🧪 Quarto Autocomplete Test Page", quarto_content],
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
        let tag_quarto_id: String = self.conn.query_row(
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
        self.conn.execute(
            "INSERT INTO tags (id, name, color) VALUES (?, ?, ?)",
            rusqlite::params![&tag_quarto_id, "quarto", "#2563EB"],
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
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note4_id, &tag_tutorial_id],
        )?;
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note4_id, &tag_tips_id],
        )?;
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note5_id, &tag_tutorial_id],
        )?;
        self.conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            rusqlite::params![&note5_id, &tag_quarto_id],
        )?;

        // Create wiki links
        self.conn.execute(
            "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
            rusqlite::params![&note1_id, &note2_id],
        )?;
        self.conn.execute(
            "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
            rusqlite::params![&note2_id, &note1_id],
        )?;
        self.conn.execute(
            "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
            rusqlite::params![&note2_id, &note4_id],
        )?;
        self.conn.execute(
            "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
            rusqlite::params![&note4_id, &note2_id],
        )?;
        self.conn.execute(
            "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
            rusqlite::params![&note5_id, &note2_id],
        )?;

        println!("  ✅ Demo data seeded successfully:");
        println!("     - 1 project: 'Getting Started'");
        println!("     - 5 notes: Welcome, Features, Daily Example, Callouts, Quarto Test");
        println!("     - 4 tags: #welcome, #tutorial, #tips, #quarto");

        Ok(())
    }

    #[cfg(not(test))]
    fn run_migration_008_add_properties_to_fts(&self) -> SqlResult<()> {
        println!("Running database migration 008 (add properties to FTS index)");

        // Drop old FTS table and triggers
        self.conn.execute_batch("
            DROP TRIGGER IF EXISTS notes_au;
            DROP TRIGGER IF EXISTS notes_ad;
            DROP TRIGGER IF EXISTS notes_ai;
            DROP TABLE IF EXISTS notes_fts;
        ")?;

        // Recreate FTS table with properties column
        self.conn.execute_batch("
            CREATE VIRTUAL TABLE notes_fts USING fts5(
                note_id UNINDEXED,
                title,
                content,
                properties
            );

            CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(note_id, title, content, properties)
                VALUES (new.id, new.title, new.content, COALESCE(new.properties, ''));
            END;

            CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
                DELETE FROM notes_fts WHERE note_id = old.id;
            END;

            CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
                DELETE FROM notes_fts WHERE note_id = old.id;
                INSERT INTO notes_fts(note_id, title, content, properties)
                VALUES (new.id, new.title, new.content, COALESCE(new.properties, ''));
            END;
        ")?;

        // Populate FTS table with existing notes
        self.conn.execute("
            INSERT INTO notes_fts(note_id, title, content, properties)
            SELECT id, title, content, COALESCE(properties, '')
            FROM notes
            WHERE deleted_at IS NULL
        ", [])?;

        println!("  ✅ FTS index updated with properties column");
        Ok(())
    }

    #[cfg(test)]
    pub(crate) fn run_migration_008_add_properties_to_fts(&self) -> SqlResult<()> {
        println!("Running database migration 008 (add properties to FTS index)");

        // Drop old FTS table and triggers
        self.conn.execute_batch("
            DROP TRIGGER IF EXISTS notes_au;
            DROP TRIGGER IF EXISTS notes_ad;
            DROP TRIGGER IF EXISTS notes_ai;
            DROP TABLE IF EXISTS notes_fts;
        ")?;

        // Recreate FTS table with properties column
        self.conn.execute_batch("
            CREATE VIRTUAL TABLE notes_fts USING fts5(
                note_id UNINDEXED,
                title,
                content,
                properties
            );

            CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(note_id, title, content, properties)
                VALUES (new.id, new.title, new.content, COALESCE(new.properties, ''));
            END;

            CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
                DELETE FROM notes_fts WHERE note_id = old.id;
            END;

            CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
                DELETE FROM notes_fts WHERE note_id = old.id;
                INSERT INTO notes_fts(note_id, title, content, properties)
                VALUES (new.id, new.title, new.content, COALESCE(new.properties, ''));
            END;
        ")?;

        // Populate FTS table with existing notes
        self.conn.execute("
            INSERT INTO notes_fts(note_id, title, content, properties)
            SELECT id, title, content, COALESCE(properties, '')
            FROM notes
            WHERE deleted_at IS NULL
        ", [])?;

        println!("  ✅ FTS index updated with properties column");
        Ok(())
    }

    #[cfg(not(test))]
    fn run_migration_009_chat_history(&self) -> SqlResult<()> {
        println!("Running database migration 009 (chat history tables)");

        // Create chat_sessions table
        self.conn.execute_batch("
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chat_sessions_note_id ON chat_sessions(note_id);
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
        ")?;

        // Create chat_messages table
        self.conn.execute_batch("
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp ASC);
        ")?;

        println!("  ✅ Chat history tables created");
        Ok(())
    }

    #[cfg(test)]
    pub(crate) fn run_migration_009_chat_history(&self) -> SqlResult<()> {
        println!("Running database migration 009 (chat history tables)");

        // Create chat_sessions table
        self.conn.execute_batch("
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chat_sessions_note_id ON chat_sessions(note_id);
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
        ")?;

        // Create chat_messages table
        self.conn.execute_batch("
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp ASC);
        ")?;

        println!("  ✅ Chat history tables created");
        Ok(())
    }

    // Note CRUD operations

    /// Validate properties JSON structure and type constraints
    fn validate_properties(properties_json: &str) -> Result<(), String> {
        // Parse JSON
        let properties: HashMap<String, Property> = serde_json::from_str(properties_json)
            .map_err(|e| format!("Invalid properties JSON: {}", e))?;

        // Validate each property's value matches its type
        for (key, prop) in properties.iter() {
            match (&prop.prop_type, &prop.value) {
                (PropertyType::Number, v) if !v.is_number() => {
                    return Err(format!("Property '{}' should be a number, got: {:?}", key, v));
                }
                (PropertyType::Checkbox, v) if !v.is_boolean() => {
                    return Err(format!("Property '{}' should be a boolean, got: {:?}", key, v));
                }
                (PropertyType::List | PropertyType::Tags, v) if !v.is_array() => {
                    return Err(format!("Property '{}' should be an array, got: {:?}", key, v));
                }
                (PropertyType::Text | PropertyType::Date | PropertyType::Link, v) if !v.is_string() => {
                    return Err(format!("Property '{}' should be a string, got: {:?}", key, v));
                }
                _ => {} // Type matches or is acceptable
            }
        }

        Ok(())
    }

    pub fn create_note(&self, title: &str, content: &str, folder: &str, project_id: Option<&str>, properties: Option<&str>) -> SqlResult<Note> {
        // Validate properties if provided
        if let Some(props) = properties {
            if !props.is_empty() {
                if let Err(e) = Self::validate_properties(props) {
                    return Err(rusqlite::Error::ToSqlConversionFailure(
                        Box::new(std::io::Error::new(std::io::ErrorKind::InvalidInput, e))
                    ));
                }
            }
        }

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

        // Validate properties if provided
        if let Some(props) = properties {
            if !props.is_empty() {
                if let Err(e) = Self::validate_properties(props) {
                    return Err(rusqlite::Error::ToSqlConversionFailure(
                        Box::new(std::io::Error::new(std::io::ErrorKind::InvalidInput, e))
                    ));
                }
            }
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

    // Chat history operations

    /// Get or create a chat session for a note
    pub fn get_or_create_chat_session(&self, note_id: &str) -> SqlResult<String> {
        // Try to get the most recent session for this note
        let existing: Result<String, _> = self.conn.query_row(
            "SELECT id FROM chat_sessions WHERE note_id = ? ORDER BY updated_at DESC LIMIT 1",
            [note_id],
            |row| row.get(0),
        );

        if let Ok(session_id) = existing {
            return Ok(session_id);
        }

        // Create new session
        let session_id = uuid::Uuid::new_v4().to_string();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        self.conn.execute(
            "INSERT INTO chat_sessions (id, note_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
            [&session_id, note_id, &now.to_string(), &now.to_string()],
        )?;

        Ok(session_id)
    }

    /// Save a chat message to the database
    pub fn save_chat_message(&self, session_id: &str, role: &str, content: &str, timestamp: i64) -> SqlResult<String> {
        let message_id = uuid::Uuid::new_v4().to_string();

        self.conn.execute(
            "INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
            params![message_id, session_id, role, content, timestamp],
        )?;

        // Update session's updated_at
        self.conn.execute(
            "UPDATE chat_sessions SET updated_at = ? WHERE id = ?",
            [&timestamp.to_string(), session_id],
        )?;

        Ok(message_id)
    }

    /// Load chat messages for a session
    pub fn load_chat_session(&self, session_id: &str) -> SqlResult<Vec<serde_json::Value>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, role, content, timestamp FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC"
        )?;

        let messages = stmt.query_map([session_id], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "role": row.get::<_, String>(1)?,
                "content": row.get::<_, String>(2)?,
                "timestamp": row.get::<_, i64>(3)?,
            }))
        })?
        .collect::<Result<Vec<_>, _>>()?;

        Ok(messages)
    }

    /// Clear all messages in a session
    pub fn clear_chat_session(&self, session_id: &str) -> SqlResult<()> {
        self.conn.execute("DELETE FROM chat_messages WHERE session_id = ?", [session_id])?;
        Ok(())
    }

    /// Delete a chat session and all its messages
    pub fn delete_chat_session(&self, session_id: &str) -> SqlResult<()> {
        // Messages will be deleted automatically via CASCADE
        self.conn.execute("DELETE FROM chat_sessions WHERE id = ?", [session_id])?;
        Ok(())
    }

    // Backup and restore operations

    /// Export entire database to JSON format
    pub fn export_backup(&self) -> SqlResult<DatabaseBackup> {
        // Get current timestamp
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        // Export notes (excluding deleted)
        let notes = self.list_notes(None)?;

        // Export projects
        let mut stmt = self.conn.prepare("SELECT id, name, description, type, color, settings, created_at, updated_at FROM projects")?;
        let projects: Vec<Project> = stmt.query_map([], |row| {
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
        })?.collect::<Result<Vec<_>, _>>()?;

        // Export tags
        let mut stmt = self.conn.prepare("SELECT id, name, color, created_at FROM tags")?;
        let tags: Vec<Tag> = stmt.query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;

        // Export folders
        let mut stmt = self.conn.prepare("SELECT path, color, icon, sort_order FROM folders")?;
        let folders: Vec<Folder> = stmt.query_map([], |row| {
            Ok(Folder {
                path: row.get(0)?,
                color: row.get(1)?,
                icon: row.get(2)?,
                sort_order: row.get(3)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;

        // Export note_tags associations
        let mut stmt = self.conn.prepare("SELECT note_id, tag_id FROM note_tags")?;
        let note_tags: Vec<NoteTag> = stmt.query_map([], |row| {
            Ok(NoteTag {
                note_id: row.get(0)?,
                tag_id: row.get(1)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;

        // Export links
        let mut stmt = self.conn.prepare("SELECT source_note_id, target_note_id FROM links")?;
        let links: Vec<Link> = stmt.query_map([], |row| {
            Ok(Link {
                source_note_id: row.get(0)?,
                target_note_id: row.get(1)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;

        Ok(DatabaseBackup {
            version: "1.0".to_string(),
            timestamp,
            notes,
            projects,
            tags,
            folders,
            note_tags,
            links,
        })
    }

    /// Import database from backup JSON
    /// WARNING: This will clear existing data!
    pub fn import_backup(&self, backup: DatabaseBackup) -> SqlResult<()> {
        // Start transaction for atomicity
        let tx = self.conn.unchecked_transaction()?;

        // Clear existing data (except schema_version)
        tx.execute("DELETE FROM links", [])?;
        tx.execute("DELETE FROM note_tags", [])?;
        tx.execute("DELETE FROM notes_fts", [])?;
        tx.execute("DELETE FROM notes", [])?;
        tx.execute("DELETE FROM tags", [])?;
        tx.execute("DELETE FROM projects", [])?;
        tx.execute("DELETE FROM folders WHERE path NOT IN ('inbox', 'notes', 'archive')", [])?;

        // Import folders
        for folder in backup.folders {
            tx.execute(
                "INSERT OR REPLACE INTO folders (path, color, icon, sort_order) VALUES (?, ?, ?, ?)",
                rusqlite::params![&folder.path, &folder.color, &folder.icon, folder.sort_order],
            )?;
        }

        // Import projects
        for project in backup.projects {
            tx.execute(
                "INSERT INTO projects (id, name, description, type, color, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![&project.id, &project.name, &project.description, &project.project_type, &project.color, &project.settings, project.created_at, project.updated_at],
            )?;
        }

        // Import tags
        for tag in backup.tags {
            tx.execute(
                "INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)",
                rusqlite::params![&tag.id, &tag.name, &tag.color, tag.created_at],
            )?;
        }

        // Import notes
        for note in backup.notes {
            tx.execute(
                "INSERT INTO notes (id, title, content, folder, project_id, properties, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![&note.id, &note.title, &note.content, &note.folder, &note.project_id, &note.properties, note.created_at, note.updated_at],
            )?;

            // Rebuild FTS index
            tx.execute(
                "INSERT INTO notes_fts (note_id, title, content, properties) VALUES (?, ?, ?, ?)",
                rusqlite::params![&note.id, &note.title, &note.content, note.properties.as_deref().unwrap_or("")],
            )?;
        }

        // Import note_tags
        for note_tag in backup.note_tags {
            tx.execute(
                "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
                rusqlite::params![&note_tag.note_id, &note_tag.tag_id],
            )?;
        }

        // Import links
        for link in backup.links {
            tx.execute(
                "INSERT INTO links (source_note_id, target_note_id) VALUES (?, ?)",
                rusqlite::params![&link.source_note_id, &link.target_note_id],
            )?;
        }

        tx.commit()?;
        Ok(())
    }
}

