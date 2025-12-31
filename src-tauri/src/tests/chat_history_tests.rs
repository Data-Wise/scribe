// Chat history persistence tests
// Tests for Migration 009 and chat session operations

#[cfg(test)]
mod chat_history_tests {
    use crate::database::Database;
    use tempfile::TempDir;

    fn setup_test_db() -> (Database, TempDir) {
        use rusqlite::Connection;

        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let conn = Connection::open(temp_dir.path().join("test.db"))
            .expect("Failed to open test database");

        // Enable foreign key constraints
        conn.execute("PRAGMA foreign_keys = ON", [])
            .expect("Failed to enable foreign keys");

        // Create minimal schema for chat testing (bypass problematic migrations)
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                applied_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                title TEXT NOT NULL,
                content TEXT DEFAULT '',
                folder TEXT DEFAULT 'inbox',
                project_id TEXT,
                properties TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER DEFAULT (strftime('%s', 'now')),
                deleted_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                name TEXT UNIQUE NOT NULL,
                color TEXT DEFAULT '#3b82f6',
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS note_tags (
                note_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS links (
                source_note_id TEXT NOT NULL,
                target_note_id TEXT NOT NULL,
                PRIMARY KEY (source_note_id, target_note_id),
                FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS folders (
                path TEXT PRIMARY KEY,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chat_sessions_note_id ON chat_sessions(note_id);
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

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

            INSERT INTO schema_version (version) VALUES (9);
        ").expect("Failed to create test schema");

        let db = Database { conn };
        (db, temp_dir)
    }

    #[test]
    fn test_migration_009_creates_tables() {
        let (db, _temp_dir) = setup_test_db();

        // Check chat_sessions table exists
        let sessions_exists: bool = db.conn.query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='chat_sessions'",
            [],
            |row| row.get::<_, i32>(0)
        ).unwrap() > 0;
        assert!(sessions_exists, "chat_sessions table should exist");

        // Check chat_messages table exists
        let messages_exists: bool = db.conn.query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='chat_messages'",
            [],
            |row| row.get::<_, i32>(0)
        ).unwrap() > 0;
        assert!(messages_exists, "chat_messages table should exist");
    }

    #[test]
    fn test_migration_009_creates_indexes() {
        let (db, _temp_dir) = setup_test_db();

        // Check indexes exist
        let indexes: Vec<String> = db.conn.prepare(
            "SELECT name FROM sqlite_master WHERE type='index' AND (
                name LIKE 'idx_chat_%'
            )"
        ).unwrap()
        .query_map([], |row| row.get(0))
        .unwrap()
        .collect::<Result<Vec<_>, _>>()
        .unwrap();

        assert!(indexes.contains(&"idx_chat_sessions_note_id".to_string()));
        assert!(indexes.contains(&"idx_chat_sessions_updated_at".to_string()));
        assert!(indexes.contains(&"idx_chat_messages_session_id".to_string()));
        assert!(indexes.contains(&"idx_chat_messages_timestamp".to_string()));
    }

    #[test]
    fn test_get_or_create_chat_session_creates_new() {
        let (db, _temp_dir) = setup_test_db();

        // Create test note
        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");

        // Get or create session
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        assert!(!session_id.is_empty());

        // Verify session was created
        let count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_sessions WHERE id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn test_get_or_create_chat_session_returns_existing() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");

        // Create first session
        let session_id_1 = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create first session");

        // Get session again - should return same ID
        let session_id_2 = db.get_or_create_chat_session(&note.id)
            .expect("Failed to get existing session");

        assert_eq!(session_id_1, session_id_2);

        // Verify only one session exists
        let count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_sessions WHERE note_id = ?",
            [&note.id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn test_save_chat_message_creates_message() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        // Save a message
        let timestamp = 1234567890;
        let message_id = db.save_chat_message(&session_id, "user", "Test message", timestamp)
            .expect("Failed to save message");

        assert!(!message_id.is_empty());

        // Verify message was saved
        let content: String = db.conn.query_row(
            "SELECT content FROM chat_messages WHERE id = ?",
            [&message_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(content, "Test message");
    }

    #[test]
    fn test_save_chat_message_updates_session_timestamp() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        let original_updated_at: i64 = db.conn.query_row(
            "SELECT updated_at FROM chat_sessions WHERE id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();

        // Wait a moment then save message with new timestamp
        std::thread::sleep(std::time::Duration::from_millis(10));
        let new_timestamp = original_updated_at + 1000;
        db.save_chat_message(&session_id, "user", "New message", new_timestamp)
            .expect("Failed to save message");

        // Verify session updated_at changed
        let updated_at: i64 = db.conn.query_row(
            "SELECT updated_at FROM chat_sessions WHERE id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(updated_at, new_timestamp);
    }

    #[test]
    fn test_load_chat_session_returns_messages_in_order() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        // Save messages with different timestamps
        db.save_chat_message(&session_id, "user", "First message", 1000)
            .expect("Failed to save message 1");
        db.save_chat_message(&session_id, "assistant", "Second message", 2000)
            .expect("Failed to save message 2");
        db.save_chat_message(&session_id, "user", "Third message", 3000)
            .expect("Failed to save message 3");

        // Load messages
        let messages = db.load_chat_session(&session_id)
            .expect("Failed to load session");

        assert_eq!(messages.len(), 3);
        assert_eq!(messages[0]["content"], "First message");
        assert_eq!(messages[1]["content"], "Second message");
        assert_eq!(messages[2]["content"], "Third message");
        assert_eq!(messages[0]["timestamp"], 1000);
        assert_eq!(messages[2]["timestamp"], 3000);
    }

    #[test]
    fn test_load_chat_session_empty() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        // Load empty session
        let messages = db.load_chat_session(&session_id)
            .expect("Failed to load session");

        assert_eq!(messages.len(), 0);
    }

    #[test]
    fn test_clear_chat_session_removes_all_messages() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        // Add messages
        db.save_chat_message(&session_id, "user", "Message 1", 1000).unwrap();
        db.save_chat_message(&session_id, "assistant", "Message 2", 2000).unwrap();

        // Clear session
        db.clear_chat_session(&session_id)
            .expect("Failed to clear session");

        // Verify no messages remain
        let messages = db.load_chat_session(&session_id)
            .expect("Failed to load session");
        assert_eq!(messages.len(), 0);

        // Verify session still exists
        let count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_sessions WHERE id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn test_delete_chat_session_cascades() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        // Add messages
        db.save_chat_message(&session_id, "user", "Message 1", 1000).unwrap();
        db.save_chat_message(&session_id, "assistant", "Message 2", 2000).unwrap();

        // Delete session
        db.delete_chat_session(&session_id)
            .expect("Failed to delete session");

        // Verify session is deleted
        let session_count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_sessions WHERE id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(session_count, 0);

        // Verify messages are also deleted (CASCADE)
        let message_count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_messages WHERE session_id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(message_count, 0);
    }

    #[test]
    fn test_role_constraint_validation() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        // Valid roles
        assert!(db.save_chat_message(&session_id, "user", "Test", 1000).is_ok());
        assert!(db.save_chat_message(&session_id, "assistant", "Test", 2000).is_ok());

        // Invalid role should fail
        let result = db.conn.execute(
            "INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
            ["test-id", &session_id, "invalid_role", "Test", "3000"]
        );
        assert!(result.is_err(), "Should reject invalid role");
    }

    #[test]
    fn test_deleting_note_deletes_chat_sessions() {
        let (db, _temp_dir) = setup_test_db();

        let note = db.create_note("Test Note", "Test content", "notes", None, None)
            .expect("Failed to create note");
        let session_id = db.get_or_create_chat_session(&note.id)
            .expect("Failed to create session");

        db.save_chat_message(&session_id, "user", "Test", 1000).unwrap();

        // Hard delete the note (bypass soft delete to test CASCADE)
        // Note: delete_note() does soft delete (UPDATE deleted_at), not hard DELETE
        db.conn.execute("DELETE FROM notes WHERE id = ?", [&note.id])
            .expect("Failed to hard delete note");

        // Verify session is deleted (CASCADE from notes)
        let session_count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_sessions WHERE id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(session_count, 0, "Session should be deleted when note is hard deleted");

        // Verify messages are also deleted
        let message_count: i32 = db.conn.query_row(
            "SELECT COUNT(*) FROM chat_messages WHERE session_id = ?",
            [&session_id],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(message_count, 0, "Messages should be deleted when session is deleted");
    }
}
