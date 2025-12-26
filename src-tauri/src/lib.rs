mod database;
mod commands;
mod academic;

use commands::AppState;
use database::Database;
use std::sync::Mutex;
use tauri::Manager;
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
    ])




    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
