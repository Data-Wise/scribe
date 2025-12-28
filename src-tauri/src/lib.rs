mod database;
mod commands;
mod academic;
mod testing;

use commands::AppState;
use database::Database;
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder, PredefinedMenuItem};
use tauri::Emitter;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Register global shortcut: Cmd+Shift+N (using SUPER for Command on macOS)
      let ctrl_shift_n = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyN);
      app.global_shortcut().register(ctrl_shift_n)?;

      // Initialize database
      let db = Database::new(&app.handle())
        .expect("Failed to initialize database");

      // Store database in app state
      app.manage(AppState {
        db: Mutex::new(db),
      });

      // Build the native menu
      build_menu(app)?;

      Ok(())
    })
    .plugin(
      tauri_plugin_global_shortcut::Builder::new()
        .with_handler(|app, _shortcut, event| {
          if event.state() == ShortcutState::Pressed {
            // Simplified check: since we only have one shortcut, we can check if it matches the one we care about
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
        })
        .build(),
    )


    .invoke_handler(tauri::generate_handler![
      commands::create_note,
      commands::get_note,
      commands::list_notes,
      commands::update_note,
      commands::delete_note,
      commands::restore_note,
      commands::permanent_delete_note,
      commands::search_notes,
      commands::get_folders,
      commands::get_all_tags,
      commands::create_tag,
      commands::rename_tag,
      commands::delete_tag,
      commands::add_tag_to_note,
      commands::remove_tag_from_note,
      commands::get_note_tags,
      commands::get_notes_by_tag,
      commands::filter_notes_by_tags,
      commands::get_tag_by_name,
      commands::get_tag,
      commands::update_note_tags,
      commands::update_note_links,
      commands::get_backlinks,
      commands::get_outgoing_links,
      commands::run_claude,
      commands::run_gemini,
      commands::get_or_create_daily_note,
      commands::export_to_obsidian,
      // Font management
      commands::get_installed_fonts,
      commands::is_font_installed,
      commands::install_font_via_homebrew,
      commands::is_homebrew_available,
      // Academic (citations & export)
      commands::get_citations,
      commands::search_citations,
      commands::get_citation_by_key,
      commands::set_bibliography_path,
      commands::get_bibliography_path,
      commands::export_document,
      commands::is_pandoc_available,
      // Project management
      commands::create_project,
      commands::get_project,
      commands::list_projects,
      commands::update_project,
      commands::delete_project,
      commands::get_notes_by_project,
      commands::assign_note_to_project,
      commands::get_project_note_count,
      // Testing harness (debug builds only, but safe in release)
      commands::run_test_scenario,
      commands::list_test_scenarios,
    ])




    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// Build the native macOS menu bar
fn build_menu(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // === Scribe Menu (Application menu on macOS - always first) ===
    let about = MenuItemBuilder::with_id("about", "About Scribe").build(app)?;
    let preferences = MenuItemBuilder::with_id("preferences", "Settings...")
        .accelerator("CmdOrCtrl+,")
        .build(app)?;
    let quit = PredefinedMenuItem::quit(app, Some("Quit Scribe"))?;

    let scribe_menu = SubmenuBuilder::new(app, "Scribe")
        .item(&about)
        .separator()
        .item(&preferences)
        .separator()
        .item(&quit)
        .build()?;

    // === File Menu ===
    let new_note = MenuItemBuilder::with_id("new_note", "New Note")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let new_project = MenuItemBuilder::with_id("new_project", "New Project...")
        .accelerator("CmdOrCtrl+Shift+P")
        .build(app)?;
    let daily_note = MenuItemBuilder::with_id("daily_note", "Daily Note")
        .accelerator("CmdOrCtrl+D")
        .build(app)?;
    let quick_capture = MenuItemBuilder::with_id("quick_capture", "Quick Capture")
        .accelerator("CmdOrCtrl+Shift+C")
        .build(app)?;
    let search = MenuItemBuilder::with_id("search", "Search Notes...")
        .accelerator("CmdOrCtrl+F")
        .build(app)?;
    let export = MenuItemBuilder::with_id("export", "Export...")
        .accelerator("CmdOrCtrl+Shift+E")
        .build(app)?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_note)
        .item(&new_project)
        .item(&daily_note)
        .item(&quick_capture)
        .separator()
        .item(&search)
        .separator()
        .item(&export)
        .build()?;

    // === Edit Menu (Standard macOS) ===
    let undo = PredefinedMenuItem::undo(app, Some("Undo"))?;
    let redo = PredefinedMenuItem::redo(app, Some("Redo"))?;
    let cut = PredefinedMenuItem::cut(app, Some("Cut"))?;
    let copy = PredefinedMenuItem::copy(app, Some("Copy"))?;
    let paste = PredefinedMenuItem::paste(app, Some("Paste"))?;
    let select_all = PredefinedMenuItem::select_all(app, Some("Select All"))?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .item(&undo)
        .item(&redo)
        .separator()
        .item(&cut)
        .item(&copy)
        .item(&paste)
        .separator()
        .item(&select_all)
        .build()?;

    // === View Menu ===
    let mission_control = MenuItemBuilder::with_id("mission_control", "Mission Control")
        .accelerator("CmdOrCtrl+0")
        .build(app)?;
    let focus_mode = MenuItemBuilder::with_id("focus_mode", "Focus Mode")
        .accelerator("CmdOrCtrl+Shift+F")
        .build(app)?;
    let source_mode = MenuItemBuilder::with_id("source_mode", "Source Mode")
        .accelerator("CmdOrCtrl+1")
        .build(app)?;
    let live_preview = MenuItemBuilder::with_id("live_preview", "Live Preview")
        .accelerator("CmdOrCtrl+2")
        .build(app)?;
    let reading_mode = MenuItemBuilder::with_id("reading_mode", "Reading Mode")
        .accelerator("CmdOrCtrl+3")
        .build(app)?;
    let toggle_sidebar = MenuItemBuilder::with_id("toggle_sidebar", "Toggle Sidebar")
        .accelerator("CmdOrCtrl+\\")
        .build(app)?;
    let knowledge_graph = MenuItemBuilder::with_id("knowledge_graph", "Knowledge Graph")
        .accelerator("CmdOrCtrl+Shift+G")
        .build(app)?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&mission_control)
        .separator()
        .item(&focus_mode)
        .separator()
        .item(&source_mode)
        .item(&live_preview)
        .item(&reading_mode)
        .separator()
        .item(&toggle_sidebar)
        .item(&knowledge_graph)
        .build()?;

    // === Window Menu ===
    let minimize = PredefinedMenuItem::minimize(app, Some("Minimize"))?;
    let close = PredefinedMenuItem::close_window(app, Some("Close"))?;

    let window_menu = SubmenuBuilder::new(app, "Window")
        .item(&minimize)
        .item(&close)
        .build()?;

    // === Help Menu ===
    let shortcuts = MenuItemBuilder::with_id("shortcuts", "Keyboard Shortcuts")
        .accelerator("CmdOrCtrl+?")
        .build(app)?;
    let documentation = MenuItemBuilder::with_id("documentation", "Documentation")
        .build(app)?;
    let github = MenuItemBuilder::with_id("github", "GitHub Repository")
        .build(app)?;

    let help_menu = SubmenuBuilder::new(app, "Help")
        .item(&shortcuts)
        .separator()
        .item(&documentation)
        .item(&github)
        .build()?;

    // === Build Complete Menu ===
    let menu = MenuBuilder::new(app)
        .items(&[
            &scribe_menu,
            &file_menu,
            &edit_menu,
            &view_menu,
            &window_menu,
            &help_menu,
        ])
        .build()?;

    app.set_menu(menu)?;

    // === Handle Menu Events ===
    app.on_menu_event(move |app_handle, event| {
        let id = event.id().0.as_str();

        // Emit event to frontend for handling
        if let Err(e) = app_handle.emit("menu-event", id) {
            log::error!("Failed to emit menu event: {}", e);
        }

        // Handle some events directly in Rust
        match id {
            "documentation" => {
                let _ = open::that("https://data-wise.github.io/scribe");
            }
            "github" => {
                let _ = open::that("https://github.com/Data-Wise/scribe");
            }
            _ => {}
        }
    });

    Ok(())
}
