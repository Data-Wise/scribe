//! Terminal PTY module for Scribe
//!
//! Provides a pseudo-terminal shell that can be used from the Tauri frontend.
//! Uses portable-pty for cross-platform PTY support.

use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;
use std::thread;
use tauri::{AppHandle, Emitter};

/// Global counter for shell IDs
static SHELL_ID_COUNTER: AtomicU32 = AtomicU32::new(1);

/// Active shell session
pub struct ShellSession {
    /// Master PTY handle for writing
    master: Box<dyn MasterPty + Send>,
    /// Writer for sending data to the shell
    writer: Box<dyn Write + Send>,
}

/// Global shell state - stores active shell sessions
pub struct ShellState {
    sessions: Mutex<HashMap<u32, ShellSession>>,
}

impl Default for ShellState {
    fn default() -> Self {
        Self::new()
    }
}

impl ShellState {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    /// Get the number of active sessions
    #[allow(dead_code)]  // May be used for debugging/monitoring
    pub fn session_count(&self) -> usize {
        self.sessions.lock().unwrap().len()
    }
}

/// Expand ~ to home directory
fn expand_home_dir(path: &str) -> String {
    if path.starts_with("~/") {
        if let Some(home) = dirs::home_dir() {
            return format!("{}{}", home.display(), &path[1..]);
        }
    } else if path == "~" {
        if let Some(home) = dirs::home_dir() {
            return home.display().to_string();
        }
    }
    path.to_string()
}

/// Spawn a new shell session
///
/// Returns the shell_id that can be used for subsequent operations.
/// Emits "shell-output" events with the shell's output.
///
/// # Arguments
/// * `cwd` - Optional working directory. If not provided or doesn't exist, uses home dir.
#[tauri::command]
pub fn spawn_shell(
    app_handle: AppHandle,
    state: tauri::State<'_, ShellState>,
    cwd: Option<String>,
) -> Result<serde_json::Value, String> {
    // Get the native PTY system
    let pty_system = native_pty_system();

    // Create PTY with reasonable default size
    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    // Get the user's default shell
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());

    // Build command to run the shell
    let mut cmd = CommandBuilder::new(&shell);
    cmd.arg("-l"); // Login shell for proper environment

    // Determine working directory
    let working_dir = match cwd {
        Some(path) => {
            let expanded = expand_home_dir(&path);
            let path_buf = std::path::PathBuf::from(&expanded);
            if path_buf.exists() && path_buf.is_dir() {
                log::info!("Terminal starting in: {}", expanded);
                path_buf
            } else {
                log::warn!("Path '{}' doesn't exist, falling back to home", path);
                dirs::home_dir().unwrap_or_else(|| std::path::PathBuf::from("/"))
            }
        }
        None => dirs::home_dir().unwrap_or_else(|| std::path::PathBuf::from("/")),
    };
    cmd.cwd(working_dir);

    // Spawn the shell
    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    // Generate unique shell ID
    let shell_id = SHELL_ID_COUNTER.fetch_add(1, Ordering::SeqCst);

    // Get the master PTY and create a reader/writer pair
    let master = pair.master;
    let mut reader = master
        .try_clone_reader()
        .map_err(|e| format!("Failed to clone PTY reader: {}", e))?;
    let writer = master
        .take_writer()
        .map_err(|e| format!("Failed to take PTY writer: {}", e))?;

    // Store the session
    {
        let mut sessions = state.sessions.lock().unwrap();
        sessions.insert(
            shell_id,
            ShellSession {
                master,
                writer,
            },
        );
    }

    // Spawn a thread to read shell output and emit events
    let app_handle_clone = app_handle.clone();
    let shell_id_for_thread = shell_id;

    thread::spawn(move || {
        let mut buffer = [0u8; 4096];

        loop {
            match reader.read(&mut buffer) {
                Ok(0) => {
                    // EOF - shell closed
                    log::info!("Shell {} closed (EOF)", shell_id_for_thread);
                    break;
                }
                Ok(n) => {
                    // Convert to string (lossy for non-UTF8)
                    let output = String::from_utf8_lossy(&buffer[..n]).to_string();

                    // Emit event to frontend
                    if let Err(e) = app_handle_clone.emit("shell-output", serde_json::json!({
                        "shell_id": shell_id_for_thread,
                        "data": output
                    })) {
                        log::error!("Failed to emit shell output: {}", e);
                    }
                }
                Err(e) => {
                    log::error!("Error reading from shell {}: {}", shell_id_for_thread, e);
                    break;
                }
            }
        }

        // Emit shell closed event
        let _ = app_handle_clone.emit("shell-closed", serde_json::json!({
            "shell_id": shell_id_for_thread
        }));
    });

    log::info!("Spawned shell with ID {}", shell_id);

    Ok(serde_json::json!({
        "shell_id": shell_id
    }))
}

/// Write data to a shell session
#[tauri::command]
pub fn write_to_shell(
    state: tauri::State<'_, ShellState>,
    shell_id: u32,
    data: String,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();

    if let Some(session) = sessions.get_mut(&shell_id) {
        session
            .writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Failed to write to shell: {}", e))?;

        session
            .writer
            .flush()
            .map_err(|e| format!("Failed to flush shell: {}", e))?;

        Ok(())
    } else {
        Err(format!("Shell {} not found", shell_id))
    }
}

/// Resize a shell session's PTY
#[tauri::command]
pub fn resize_shell(
    state: tauri::State<'_, ShellState>,
    shell_id: u32,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    let sessions = state.sessions.lock().unwrap();

    if let Some(session) = sessions.get(&shell_id) {
        session
            .master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to resize PTY: {}", e))?;

        Ok(())
    } else {
        Err(format!("Shell {} not found", shell_id))
    }
}

/// Kill a shell session
#[tauri::command]
pub fn kill_shell(state: tauri::State<'_, ShellState>, shell_id: u32) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();

    if sessions.remove(&shell_id).is_some() {
        log::info!("Killed shell {}", shell_id);
        Ok(())
    } else {
        Err(format!("Shell {} not found", shell_id))
    }
}

/// Get list of active shell sessions
#[tauri::command]
pub fn list_shells(state: tauri::State<'_, ShellState>) -> Vec<u32> {
    let sessions = state.sessions.lock().unwrap();
    sessions.keys().copied().collect()
}

/// Check if a directory path exists
#[tauri::command]
pub fn check_path_exists(path: String) -> serde_json::Value {
    let expanded = expand_home_dir(&path);
    let path_buf = std::path::PathBuf::from(&expanded);

    serde_json::json!({
        "exists": path_buf.exists(),
        "is_dir": path_buf.is_dir(),
        "expanded_path": expanded
    })
}

/// Create a directory (with parents if needed)
#[tauri::command]
pub fn create_directory(path: String) -> Result<String, String> {
    let expanded = expand_home_dir(&path);
    let path_buf = std::path::PathBuf::from(&expanded);

    std::fs::create_dir_all(&path_buf)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    log::info!("Created directory: {}", expanded);
    Ok(expanded)
}
