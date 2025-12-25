use crate::database::{Database, Note, Tag, Folder};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use std::process::Command;

pub struct AppState {
    pub db: Mutex<Database>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNoteInput {
    title: String,
    content: String,
    folder: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNoteInput {
    title: Option<String>,
    content: Option<String>,
}

// Note commands

#[tauri::command]
pub fn create_note(
    state: State<AppState>,
    note: CreateNoteInput,
) -> Result<Note, String> {
    let db = state.db.lock().unwrap();
    db.create_note(&note.title, &note.content, &note.folder)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_note(
    state: State<AppState>,
    id: String,
) -> Result<Option<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_note(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_notes(
    state: State<AppState>,
    folder: Option<String>,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.list_notes(folder.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_note(
    state: State<AppState>,
    id: String,
    updates: UpdateNoteInput,
) -> Result<Option<Note>, String> {
    let db = state.db.lock().unwrap();
    db.update_note(&id, updates.title.as_deref(), updates.content.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_note(
    state: State<AppState>,
    id: String,
) -> Result<bool, String> {
    let db = state.db.lock().unwrap();
    db.delete_note(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_notes(
    state: State<AppState>,
    query: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.search_notes(&query).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_folders(
    state: State<AppState>,
) -> Result<Vec<Folder>, String> {
    let db = state.db.lock().unwrap();
    db.get_folders().map_err(|e| e.to_string())
}

// Tag commands

#[tauri::command]
pub fn get_all_tags(
    state: State<AppState>,
) -> Result<Vec<serde_json::Value>, String> {
    let db = state.db.lock().unwrap();
    db.get_all_tags().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn filter_notes_by_tags(
    state: State<AppState>,
    tag_ids: Vec<String>,
    match_all: bool,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.filter_notes_by_tags(tag_ids, match_all).map_err(|e| e.to_string())
}


#[tauri::command]
pub fn create_tag(
    state: State<AppState>,
    name: String,
    color: Option<String>,
) -> Result<Tag, String> {
    let db = state.db.lock().unwrap();
    db.create_tag(&name, color.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_tag(
    state: State<AppState>,
    id: String,
    new_name: String,
) -> Result<bool, String> {
    let db = state.db.lock().unwrap();
    db.rename_tag(&id, &new_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_tag(
    state: State<AppState>,
    id: String,
) -> Result<bool, String> {
    let db = state.db.lock().unwrap();
    db.delete_tag(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_tag_to_note(
    state: State<AppState>,
    note_id: String,
    tag_name: String,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.add_tag_to_note(&note_id, &tag_name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_tag_from_note(
    state: State<AppState>,
    note_id: String,
    tag_id: String,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.remove_tag_from_note(&note_id, &tag_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_note_tags(
    state: State<AppState>,
    note_id: String,
) -> Result<Vec<Tag>, String> {
    let db = state.db.lock().unwrap();
    db.get_note_tags(&note_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_notes_by_tag(
    state: State<AppState>,
    tag_id: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_notes_by_tag(&tag_id).map_err(|e| e.to_string())
}

// Link commands

#[tauri::command]
pub fn get_tag_by_name(
    state: State<AppState>,
    name: String,
) -> Result<Option<Tag>, String> {
    let db = state.db.lock().unwrap();
    db.get_tag_by_name(&name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_note_tags(
    state: State<AppState>,
    note_id: String,
    content: String,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.update_note_tags(&note_id, &content).map_err(|e| e.to_string())
}

// Link commands

#[tauri::command]
pub fn update_note_links(
    state: State<AppState>,
    note_id: String,
    content: String,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.update_note_links(&note_id, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_backlinks(

    state: State<AppState>,
    note_id: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_backlinks(&note_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_outgoing_links(
    state: State<AppState>,
    note_id: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_outgoing_links(&note_id).map_err(|e| e.to_string())
}

// AI commands

#[tauri::command]
pub fn run_claude(prompt: String) -> Result<String, String> {
    let output = Command::new("claude")
        .arg(prompt)
        .output()
        .map_err(|e| format!("Failed to execute claude CLI: {}", e))?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[tauri::command]
pub fn run_gemini(prompt: String) -> Result<String, String> {
    let output = Command::new("gemini")
        .arg(prompt)
        .output()
        .map_err(|e| format!("Failed to execute gemini CLI: {}", e))?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[tauri::command]
pub fn get_or_create_daily_note(state: State<AppState>, date: String) -> Result<Note, String> {
    let db = state.db.lock().unwrap();
    
    // Check if it exists
    if let Some(note) = db.get_note_by_title_and_folder(&date, "daily").map_err(|e| e.to_string())? {
        return Ok(note);
    }
    
    // Create it
    let content = format!("<h2>{}</h2>\n<p></p>", date);
    
    let note = db.create_note(&date, &content, "daily").map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
pub fn export_to_obsidian(state: State<AppState>, target_path: String) -> Result<String, String> {
    let db = state.db.lock().unwrap();
    let notes = db.list_notes(None).map_err(|e| e.to_string())?;
    
    let path = std::path::Path::new(&target_path);
    if !path.exists() {
        std::fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    let count = notes.len();
    for note in notes {
        let safe_title = note.title.chars().map(|c| if c.is_alphanumeric() || c == ' ' { c } else { '-' }).collect::<String>();
        let filename = if safe_title.is_empty() { format!("{}.md", note.id) } else { format!("{}.md", safe_title) };
        let file_path = path.join(filename);
        
        // Simple frontmatter and content
        let content = format!("---\ntitle: \"{}\"\nfolder: \"{}\"\ncreated: {}\n---\n\n{}", 
            note.title.replace("\"", "\\\""), note.folder, note.created_at, note.content);
            
        std::fs::write(file_path, content).map_err(|e| e.to_string())?;
    }
    
    Ok(format!("Successfully exported {} notes to {}", count, target_path))
}



