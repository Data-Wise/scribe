# Tauri Enhancement Proposals

> **Generated:** 2025-12-30
> **Context:** Post-integration improvements for Tauri backend

---

## Overview

With Tauri SQLite now at parity with browser IndexedDB, these enhancements would add validation, search capabilities, and cross-platform sync.

---

## Quick Wins (< 30 min each)

### 1. Property Type Validation in Rust

**Effort:** ⚡ Quick
**Files:** `src-tauri/src/database.rs`

Currently properties are stored as raw JSON strings. Add validation before insert/update.

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Property {
    pub key: String,
    pub value: serde_json::Value,
    #[serde(rename = "type")]
    pub prop_type: PropertyType,
    #[serde(default)]
    pub readonly: bool,
}

#[derive(Debug, Serialize, Deserialize)]
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

fn validate_properties(json: &str) -> Result<(), String> {
    let props: HashMap<String, Property> = serde_json::from_str(json)
        .map_err(|e| format!("Invalid properties JSON: {}", e))?;

    for (key, prop) in props {
        match (&prop.prop_type, &prop.value) {
            (PropertyType::Number, v) if !v.is_number() => {
                return Err(format!("Property '{}' should be a number", key));
            }
            (PropertyType::Checkbox, v) if !v.is_boolean() => {
                return Err(format!("Property '{}' should be a boolean", key));
            }
            (PropertyType::List | PropertyType::Tags, v) if !v.is_array() => {
                return Err(format!("Property '{}' should be an array", key));
            }
            _ => {}
        }
    }
    Ok(())
}
```

**Benefit:** Catch malformed data early, better error messages

---

### 2. Add Property to Search Index

**Effort:** ⚡ Quick
**Files:** `src-tauri/src/database.rs`

Include property values in `search_text` column for full-text search.

```rust
fn build_search_text(title: &str, content: &str, properties: Option<&str>) -> String {
    let mut text = format!("{} {}", title, content);

    if let Some(props_json) = properties {
        if let Ok(props) = serde_json::from_str::<HashMap<String, Property>>(props_json) {
            for (key, prop) in props {
                text.push(' ');
                text.push_str(&key);
                text.push(' ');
                match &prop.value {
                    serde_json::Value::String(s) => text.push_str(s),
                    serde_json::Value::Array(arr) => {
                        for v in arr {
                            if let Some(s) = v.as_str() {
                                text.push(' ');
                                text.push_str(s);
                            }
                        }
                    }
                    v => text.push_str(&v.to_string()),
                }
            }
        }
    }
    text
}
```

**Benefit:** Search finds notes by property values (e.g., search "due:2025-01-15")

---

## Medium Effort (1-2 hours)

### 3. Property-Specific Search/Filter API

**Effort:** 🔧 Medium
**Files:** `src-tauri/src/database.rs`, `src-tauri/src/commands.rs`

Add commands to filter notes by property values.

```rust
#[tauri::command]
pub fn filter_notes_by_property(
    state: State<AppState>,
    property_key: String,
    property_value: Option<String>,
    operator: Option<String>, // "eq", "contains", "gt", "lt", "exists"
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.filter_by_property(&property_key, property_value.as_deref(), operator.as_deref())
        .map_err(|e| e.to_string())
}
```

**Use cases:**
- Find all notes with `status: draft`
- Find notes where `due` date is before today
- Find notes that have a `project` property (exists check)

---

### 4. Export/Import for Browser ↔ Tauri Sync

**Effort:** 🔧 Medium
**Files:** New `src-tauri/src/sync.rs`, commands

Create JSON export/import for moving data between browser and Tauri.

```rust
#[derive(Serialize, Deserialize)]
pub struct ExportData {
    pub version: u32,
    pub exported_at: i64,
    pub notes: Vec<Note>,
    pub tags: Vec<Tag>,
    pub note_tags: Vec<NoteTag>,
    pub links: Vec<Link>,
    pub projects: Vec<Project>,
    pub project_settings: Vec<ProjectSettings>,
}

#[tauri::command]
pub fn export_database(state: State<AppState>) -> Result<ExportData, String>

#[tauri::command]
pub fn import_database(state: State<AppState>, data: ExportData, merge: bool) -> Result<ImportResult, String>
```

**Options:**
- `merge: true` — Merge with existing data (update if newer)
- `merge: false` — Replace all data

**Benefit:** Users can switch between browser demo and Tauri app seamlessly

---

## Long-term (Future sessions)

### 5. Real-time Sync via File Watcher

**Effort:** 🏗️ Large

Watch a shared JSON file for changes, enabling:
- Multiple Scribe instances syncing
- External tools modifying notes
- Obsidian-style vault sync

---

## Recommended Path

→ **Start with #1 (Property Type Validation)** — Prevents data corruption, < 30 min

Then:
1. #2 (Search index) — Immediate UX improvement
2. #3 (Filter API) — Enables advanced queries
3. #4 (Export/Import) — Nice-to-have for power users

---

## Decision Points

| Enhancement | Adds Complexity? | User-Facing? | Priority |
|-------------|------------------|--------------|----------|
| Type validation | Low | Indirect (errors) | High |
| Search indexing | Low | Yes | High |
| Property filter API | Medium | Yes | Medium |
| Export/Import | Medium | Yes | Low |
| Real-time sync | High | Yes | Defer |

---

## Next Steps

1. [ ] Implement #1 (validation) — Quick win
2. [ ] Implement #2 (search) — Quick win
3. [ ] Evaluate need for #3-4 based on user feedback
