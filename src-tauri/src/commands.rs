use crate::database::{Database, Note, Tag, Folder, Project};
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
pub fn get_tag(
    state: State<AppState>,
    id: String,
) -> Result<Option<Tag>, String> {
    let db = state.db.lock().unwrap();
    db.get_tag(&id).map_err(|e| e.to_string())
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
#[allow(non_snake_case)]
pub fn update_note_links(
    state: State<AppState>,
    noteId: String,
    content: String,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.update_note_links(&noteId, &content).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(non_snake_case)]
pub fn get_backlinks(
    state: State<AppState>,
    noteId: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_backlinks(&noteId).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(non_snake_case)]
pub fn get_outgoing_links(
    state: State<AppState>,
    noteId: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_outgoing_links(&noteId).map_err(|e| e.to_string())
}

// Project commands

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub project_type: Option<String>,
    pub color: Option<String>,
    pub settings: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProjectInput {
    pub name: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub project_type: Option<String>,
    pub color: Option<String>,
    pub settings: Option<String>,
}

#[tauri::command]
pub fn create_project(
    state: State<AppState>,
    project: CreateProjectInput,
) -> Result<Project, String> {
    let db = state.db.lock().unwrap();
    db.create_project(
        &project.name,
        project.description.as_deref(),
        project.project_type.as_deref().unwrap_or("generic"),
        project.color.as_deref(),
        project.settings.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_project(
    state: State<AppState>,
    id: String,
) -> Result<Option<Project>, String> {
    let db = state.db.lock().unwrap();
    db.get_project(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_projects(
    state: State<AppState>,
    project_type: Option<String>,
) -> Result<Vec<Project>, String> {
    let db = state.db.lock().unwrap();
    db.list_projects(project_type.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_project(
    state: State<AppState>,
    id: String,
    updates: UpdateProjectInput,
) -> Result<Option<Project>, String> {
    let db = state.db.lock().unwrap();
    db.update_project(
        &id,
        updates.name.as_deref(),
        updates.description.as_deref(),
        updates.project_type.as_deref(),
        updates.color.as_deref(),
        updates.settings.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_project(
    state: State<AppState>,
    id: String,
) -> Result<bool, String> {
    let db = state.db.lock().unwrap();
    db.delete_project(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_notes_by_project(
    state: State<AppState>,
    project_id: String,
) -> Result<Vec<Note>, String> {
    let db = state.db.lock().unwrap();
    db.get_notes_by_project(&project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn assign_note_to_project(
    state: State<AppState>,
    note_id: String,
    project_id: Option<String>,
) -> Result<bool, String> {
    let db = state.db.lock().unwrap();
    db.assign_note_to_project(&note_id, project_id.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_project_note_count(
    state: State<AppState>,
    project_id: String,
) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    db.get_project_note_count(&project_id).map_err(|e| e.to_string())
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
    
    // Create it with Markdown format
    let content = format!("## {}\n\n", date);
    
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

// Font management commands

/// Get list of installed font families using fc-list
#[tauri::command]
pub fn get_installed_fonts() -> Result<Vec<String>, String> {
    let output = Command::new("fc-list")
        .args([":", "family"])
        .output()
        .map_err(|e| format!("Failed to execute fc-list: {}", e))?;
    
    if !output.status.success() {
        return Err("fc-list command failed".to_string());
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut fonts: Vec<String> = stdout
        .lines()
        .map(|line| {
            // fc-list returns "Family,Variant" format, we want just the family
            line.split(',').next().unwrap_or(line).trim().to_string()
        })
        .filter(|f| !f.is_empty() && !f.starts_with('.')) // Filter hidden fonts
        .collect();
    
    fonts.sort();
    fonts.dedup();
    
    Ok(fonts)
}

/// Check if a specific font family is installed
#[tauri::command]
pub fn is_font_installed(font_family: String) -> Result<bool, String> {
    let output = Command::new("fc-list")
        .args([":", "family"])
        .output()
        .map_err(|e| format!("Failed to execute fc-list: {}", e))?;
    
    if !output.status.success() {
        return Err("fc-list command failed".to_string());
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let font_lower = font_family.to_lowercase();
    
    Ok(stdout.lines().any(|line| {
        line.to_lowercase().contains(&font_lower)
    }))
}

/// Install a font via Homebrew cask
#[tauri::command]
pub fn install_font_via_homebrew(cask_name: String) -> Result<String, String> {
    // Validate cask name (must start with "font-" for safety)
    if !cask_name.starts_with("font-") {
        return Err("Invalid font cask name - must start with 'font-'".to_string());
    }
    
    // Check if Homebrew is available
    let brew_check = Command::new("which")
        .arg("brew")
        .output()
        .map_err(|e| format!("Failed to check for Homebrew: {}", e))?;
    
    if !brew_check.status.success() {
        return Err("Homebrew is not installed. Please install it from https://brew.sh".to_string());
    }
    
    // Run brew install
    let output = Command::new("brew")
        .args(["install", "--cask", &cask_name])
        .output()
        .map_err(|e| format!("Failed to run brew install: {}", e))?;
    
    if output.status.success() {
        Ok(format!("Successfully installed {}", cask_name))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to install {}: {}", cask_name, stderr))
    }
}

/// Check if Homebrew is available
#[tauri::command]
pub fn is_homebrew_available() -> bool {
    Command::new("which")
        .arg("brew")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

// Academic commands (citations & export)

use crate::academic::{Citation, ExportOptions, ExportResult};
use std::sync::RwLock;

// Global state for bibliography path
lazy_static::lazy_static! {
    static ref BIB_PATH: RwLock<Option<String>> = RwLock::new(None);
    static ref CITATIONS_CACHE: RwLock<Vec<Citation>> = RwLock::new(Vec::new());
}

/// Set bibliography file path
#[tauri::command]
pub fn set_bibliography_path(path: String) -> Result<(), String> {
    let mut bib_path = BIB_PATH.write().map_err(|e| e.to_string())?;
    *bib_path = Some(path.clone());

    // Load citations into cache
    let citations = crate::academic::read_bibliography(std::path::Path::new(&path))?;
    let mut cache = CITATIONS_CACHE.write().map_err(|e| e.to_string())?;
    *cache = citations;

    Ok(())
}

/// Get bibliography file path
#[tauri::command]
pub fn get_bibliography_path() -> Option<String> {
    BIB_PATH.read().ok().and_then(|p| p.clone())
}

/// Get all citations from cached bibliography
#[tauri::command]
pub fn get_citations() -> Result<Vec<Citation>, String> {
    let cache = CITATIONS_CACHE.read().map_err(|e| e.to_string())?;
    Ok(cache.clone())
}

/// Search citations by query
#[tauri::command]
pub fn search_citations(query: String) -> Result<Vec<Citation>, String> {
    let cache = CITATIONS_CACHE.read().map_err(|e| e.to_string())?;
    Ok(crate::academic::search_citations(&cache, &query))
}

/// Get citation by key
#[tauri::command]
pub fn get_citation_by_key(key: String) -> Result<Option<Citation>, String> {
    let cache = CITATIONS_CACHE.read().map_err(|e| e.to_string())?;
    Ok(cache.iter().find(|c| c.key == key).cloned())
}

/// Check if Pandoc is available
#[tauri::command]
pub fn is_pandoc_available() -> bool {
    crate::academic::is_pandoc_available()
}

/// Export document using Pandoc
#[tauri::command]
pub fn export_document(options: ExportOptions) -> Result<ExportResult, String> {
    // Get output directory from user's Documents folder
    let output_dir = dirs::document_dir()
        .ok_or("Could not find Documents directory")?
        .join("Scribe Exports");

    std::fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create export directory: {}", e))?;

    crate::academic::export_document(&options, &output_dir)
}



