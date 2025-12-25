import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export interface Note {
  id: string
  title: string
  content: string
  folder: string
  created_at: number
  updated_at: number
  deleted_at: number | null
}

export interface Tag {
  id: string
  name: string
  color: string | null
  created_at: number
}

export interface NoteTag {
  note_id: string
  tag_id: string
  created_at: number
}

export interface Folder {
  path: string
  color: string | null
  icon: string | null
  sort_order: number
}

export class DatabaseService {
  private db: Database.Database
  private dbPath: string

  constructor() {
    // Set up database location in user data directory
    const userDataPath = app.getPath('userData')
    const dbDir = join(userDataPath, 'data')

    // Ensure directory exists
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }

    this.dbPath = join(dbDir, 'nexus.db')
    this.db = new Database(this.dbPath)

    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL')

    this.initialize()
  }

  private initialize(): void {
    // Run migrations
    this.runMigrations()
  }

  private runMigrations(): void {
    // Create schema_version table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `)

    const currentVersion = this.getCurrentSchemaVersion()

    // Run migration 001 if not applied
    if (currentVersion < 1) {
      this.runMigration001()
      this.db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(1)
    }

    // Run migration 002 if not applied
    if (currentVersion < 2) {
      this.runMigration002()
      this.db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(2)
    }

    // Run migration 003 if not applied
    if (currentVersion < 3) {
      this.runMigration003()
      this.db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(3)
    }
  }

  private getCurrentSchemaVersion(): number {
    try {
      const result = this.db.prepare('SELECT MAX(version) as version FROM schema_version').get() as { version: number | null }
      return result.version || 0
    } catch {
      return 0
    }
  }

  private runMigration001(): void {
    console.log('✅ Database initialized (schema version 1)')

    this.db.exec(`
      -- Notes table
      CREATE TABLE notes (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        folder TEXT DEFAULT 'inbox',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        deleted_at INTEGER NULL
      );

      -- Full-text search (simplified - no external content to avoid corruption)
      CREATE VIRTUAL TABLE notes_fts USING fts5(
        note_id UNINDEXED,
        title,
        content
      );

      -- Triggers to keep FTS index in sync
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

      -- Indexes
      CREATE INDEX idx_notes_folder ON notes(folder);
      CREATE INDEX idx_notes_updated ON notes(updated_at DESC);
      CREATE INDEX idx_notes_deleted ON notes(deleted_at);

      -- Tags table
      CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        UNIQUE(note_id, tag)
      );

      CREATE INDEX idx_tags_note ON tags(note_id);
      CREATE INDEX idx_tags_tag ON tags(tag);

      -- Folders metadata
      CREATE TABLE folders (
        path TEXT PRIMARY KEY,
        color TEXT,
        icon TEXT,
        sort_order INTEGER DEFAULT 0
      );

      -- Insert default folders
      INSERT INTO folders (path, sort_order) VALUES
        ('inbox', 1),
        ('projects', 2),
        ('areas', 3),
        ('resources', 4),
        ('archive', 5);
    `)
  }

  private runMigration002(): void {
    console.log('✅ Database updated (schema version 2)')

    this.db.exec(`
      -- Links between notes
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_note_id TEXT NOT NULL,
        target_note_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE,
        UNIQUE(source_note_id, target_note_id)
      );

      CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_note_id);
      CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_note_id);
    `)
  }

  private runMigration003(): void {
    console.log('✅ Database updated (schema version 3)')

    this.db.exec(`
      -- Drop old tags table if it exists
      DROP TABLE IF EXISTS tags;

      -- New tags table with proper structure
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL UNIQUE COLLATE NOCASE,
        color TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(name COLLATE NOCASE)
      );

      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name COLLATE NOCASE);

      -- Note-Tags junction table
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
      CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);
    `)
  }

  // CRUD Operations

  /**
   * Create a new note with input validation
   */
  createNote(note: Partial<Note>): Note {
    // Validate and sanitize title (max 500 characters)
    const MAX_TITLE_LENGTH = 500
    let title = (note.title || 'Untitled').trim()

    if (title.length === 0) {
      title = 'Untitled'
    }

    if (title.length > MAX_TITLE_LENGTH) {
      throw new Error(`Title too long: maximum ${MAX_TITLE_LENGTH} characters allowed`)
    }

    // Validate and sanitize content (max 10MB)
    const MAX_CONTENT_LENGTH = 10 * 1024 * 1024 // 10MB
    const content = note.content || ''

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Content too large: maximum ${MAX_CONTENT_LENGTH / 1024 / 1024}MB allowed`)
    }

    // Validate folder
    const validFolders = ['inbox', 'projects', 'areas', 'resources', 'archive']
    const folder = note.folder && validFolders.includes(note.folder)
      ? note.folder
      : 'inbox'

    const stmt = this.db.prepare(`
      INSERT INTO notes (title, content, folder)
      VALUES (?, ?, ?)
      RETURNING *
    `)

    const result = stmt.get(title, content, folder) as Note

    return result
  }

  /**
   * Update a note with input validation
   */
  updateNote(id: string, updates: Partial<Note>): Note | null {
    const fields: string[] = []
    const values: any[] = []

    // Validate title if provided
    if (updates.title !== undefined) {
      const MAX_TITLE_LENGTH = 500
      const title = updates.title.trim()

      if (title.length === 0) {
        throw new Error('Title cannot be empty')
      }

      if (title.length > MAX_TITLE_LENGTH) {
        throw new Error(`Title too long: maximum ${MAX_TITLE_LENGTH} characters allowed`)
      }

      fields.push('title = ?')
      values.push(title)
    }

    // Validate content if provided
    if (updates.content !== undefined) {
      const MAX_CONTENT_LENGTH = 10 * 1024 * 1024 // 10MB

      if (updates.content.length > MAX_CONTENT_LENGTH) {
        throw new Error(`Content too large: maximum ${MAX_CONTENT_LENGTH / 1024 / 1024}MB allowed`)
      }

      fields.push('content = ?')
      values.push(updates.content)
    }

    // Validate folder if provided
    if (updates.folder !== undefined) {
      const validFolders = ['inbox', 'projects', 'areas', 'resources', 'archive']

      if (!validFolders.includes(updates.folder)) {
        throw new Error(`Invalid folder: must be one of ${validFolders.join(', ')}`)
      }

      fields.push('folder = ?')
      values.push(updates.folder)
    }

    if (fields.length === 0) {
      return this.getNote(id)
    }

    fields.push("updated_at = strftime('%s', 'now')")
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE notes
      SET ${fields.join(', ')}
      WHERE id = ?
      RETURNING *
    `)

    const result = stmt.get(...values) as Note | undefined
    return result || null
  }

  deleteNote(id: string): boolean {
    // Soft delete
    const stmt = this.db.prepare(`
      UPDATE notes
      SET deleted_at = strftime('%s', 'now')
      WHERE id = ?
    `)

    const result = stmt.run(id)
    return result.changes > 0
  }

  permanentlyDeleteNote(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  restoreNote(id: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE notes
      SET deleted_at = NULL
      WHERE id = ?
    `)

    const result = stmt.run(id)
    return result.changes > 0
  }

  getNote(id: string): Note | null {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL')
    const result = stmt.get(id) as Note | undefined
    return result || null
  }

  listNotes(folder?: string): Note[] {
    let stmt
    if (folder) {
      stmt = this.db.prepare(`
        SELECT * FROM notes
        WHERE folder = ? AND deleted_at IS NULL
        ORDER BY updated_at DESC
      `)
      return stmt.all(folder) as Note[]
    } else {
      stmt = this.db.prepare(`
        SELECT * FROM notes
        WHERE deleted_at IS NULL
        ORDER BY updated_at DESC
      `)
      return stmt.all() as Note[]
    }
  }

  searchNotes(query: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT notes.*
      FROM notes
      JOIN notes_fts ON notes.id = notes_fts.note_id
      WHERE notes_fts MATCH ? AND notes.deleted_at IS NULL
      ORDER BY rank
      LIMIT 50
    `)

    return stmt.all(query) as Note[]
  }

  // Tag CRUD operations

  /**
   * Create a new tag
   */
  createTag(name: string, color?: string): Tag {
    const stmt = this.db.prepare(`
      INSERT INTO tags (name, color)
      VALUES (?, ?)
      RETURNING *
    `)
    return stmt.get(name, color || null) as Tag
  }

  /**
   * Get tag by ID
   */
  getTag(id: string): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE id = ?')
    const result = stmt.get(id) as Tag | undefined
    return result || null
  }

  /**
   * Get tag by name (case-insensitive)
   */
  getTagByName(name: string): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE name = ? COLLATE NOCASE')
    const result = stmt.get(name) as Tag | undefined
    return result || null
  }

  /**
   * Get all tags with note counts
   */
  getAllTags(): Array<Tag & { note_count: number }> {
    const stmt = this.db.prepare(`
      SELECT tags.*, COUNT(note_tags.note_id) as note_count
      FROM tags
      LEFT JOIN note_tags ON tags.id = note_tags.tag_id
      GROUP BY tags.id
      ORDER BY tags.name COLLATE NOCASE
    `)
    return stmt.all() as Array<Tag & { note_count: number }>
  }

  /**
   * Rename a tag
   */
  renameTag(id: string, newName: string): boolean {
    try {
      const stmt = this.db.prepare('UPDATE tags SET name = ? WHERE id = ?')
      const result = stmt.run(newName, id)
      return result.changes > 0
    } catch {
      return false // Name conflict
    }
  }

  /**
   * Delete a tag (cascades to note_tags)
   */
  deleteTag(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Note-Tag relationship operations

  /**
   * Add tag to note (creates tag if it doesn't exist)
   */
  addTagToNote(noteId: string, tagName: string): void {
    // Check if tag exists
    let tag = this.getTagByName(tagName)

    // Create tag if it doesn't exist
    if (!tag) {
      // Generate color from tag name
      const color = this.generateTagColor(tagName)
      tag = this.createTag(tagName, color)
    }

    // Link tag to note
    try {
      this.db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(noteId, tag.id)
    } catch (error) {
      console.error('Failed to add tag to note:', error)
    }
  }

  /**
   * Remove tag from note
   */
  removeTagFromNote(noteId: string, tagId: string): void {
    this.db.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?').run(noteId, tagId)
  }

  /**
   * Get all tags for a note
   */
  getNoteTags(noteId: string): Tag[] {
    const stmt = this.db.prepare(`
      SELECT tags.* FROM tags
      JOIN note_tags ON tags.id = note_tags.tag_id
      WHERE note_tags.note_id = ?
      ORDER BY tags.name COLLATE NOCASE
    `)
    return stmt.all(noteId) as Tag[]
  }

  /**
   * Get all notes that have a specific tag
   */
  getNotesByTag(tagId: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT notes.* FROM notes
      JOIN note_tags ON notes.id = note_tags.note_id
      WHERE note_tags.tag_id = ? AND notes.deleted_at IS NULL
      ORDER BY notes.updated_at DESC
    `)
    return stmt.all(tagId) as Note[]
  }

  /**
   * Filter notes by multiple tags (AND or OR)
   */
  filterNotesByTags(tagIds: string[], matchAll: boolean = true): Note[] {
    if (tagIds.length === 0) {
      return this.listNotes()
    }

    // Validate inputs: ensure tagIds are non-empty strings
    if (!Array.isArray(tagIds) || tagIds.some(id => typeof id !== 'string' || id.trim() === '')) {
      throw new Error('Invalid tag IDs: must be non-empty strings')
    }

    // Limit number of tags for performance
    if (tagIds.length > 100) {
      throw new Error('Too many tags: maximum 100 tags allowed')
    }

    if (matchAll) {
      // AND logic: notes must have ALL tags
      // Generate placeholders safely - only creates '?' characters
      const placeholders = Array(tagIds.length).fill('?').join(',')

      // Verify placeholders only contains safe characters (defense in depth)
      if (!/^[?,\s]*$/.test(placeholders)) {
        throw new Error('Invalid placeholder format detected')
      }

      const stmt = this.db.prepare(`
        SELECT notes.* FROM notes
        WHERE notes.deleted_at IS NULL
        AND (
          SELECT COUNT(DISTINCT tag_id) FROM note_tags
          WHERE note_tags.note_id = notes.id
          AND note_tags.tag_id IN (${placeholders})
        ) = ?
        ORDER BY notes.updated_at DESC
      `)
      return stmt.all(...tagIds, tagIds.length) as Note[]
    } else {
      // OR logic: notes must have ANY tag
      // Generate placeholders safely - only creates '?' characters
      const placeholders = Array(tagIds.length).fill('?').join(',')

      // Verify placeholders only contains safe characters (defense in depth)
      if (!/^[?,\s]*$/.test(placeholders)) {
        throw new Error('Invalid placeholder format detected')
      }

      const stmt = this.db.prepare(`
        SELECT DISTINCT notes.* FROM notes
        JOIN note_tags ON notes.id = note_tags.note_id
        WHERE notes.deleted_at IS NULL
        AND note_tags.tag_id IN (${placeholders})
        ORDER BY notes.updated_at DESC
      `)
      return stmt.all(...tagIds) as Note[]
    }
  }

  /**
   * Parse content for #tags and update note_tags relationships
   * Wrapped in transaction for atomicity
   */
  updateNoteTags(noteId: string, content: string): void {
    // Wrap in transaction to ensure all-or-nothing update
    this.transaction(() => {
      // Parse #tags from content
      const tagRegex = /#([a-zA-Z0-9_-]+)/g
      const matches = Array.from(content.matchAll(tagRegex))
      const tagNames = [...new Set(matches.map(m => m[1].trim()).filter(Boolean))]

      // Get current tags
      const currentTags = this.getNoteTags(noteId)
      const currentTagNames = new Set(currentTags.map(t => t.name.toLowerCase()))

      // Add new tags
      for (const tagName of tagNames) {
        if (!currentTagNames.has(tagName.toLowerCase())) {
          this.addTagToNote(noteId, tagName)
        }
      }

      // Remove tags no longer in content
      const newTagNames = new Set(tagNames.map(t => t.toLowerCase()))
      for (const tag of currentTags) {
        if (!newTagNames.has(tag.name.toLowerCase())) {
          this.removeTagFromNote(noteId, tag.id)
        }
      }
    })
  }

  /**
   * Generate consistent color from tag name
   */
  private generateTagColor(name: string): string {
    const hash = name.split('').reduce((acc, char) =>
      char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  // Folder operations

  getFolders(): Folder[] {
    const stmt = this.db.prepare('SELECT * FROM folders ORDER BY sort_order')
    return stmt.all() as Folder[]
  }

  // Link operations

  /**
   * Parse content for [[wiki links]] and update database relationships
   * Wrapped in transaction for atomicity
   */
  updateNoteLinks(noteId: string, content: string): void {
    // Wrap in transaction to ensure all-or-nothing update
    this.transaction(() => {
      // Parse [[links]] from content
      const linkRegex = /\[\[([^\]]+)\]\]/g
      const matches = Array.from(content.matchAll(linkRegex))
      const linkedTitles = matches.map(m => m[1].trim()).filter(Boolean)

      // Delete existing links from this note
      this.db.prepare('DELETE FROM links WHERE source_note_id = ?').run(noteId)

      // Find notes by title and create links
      for (const title of linkedTitles) {
        const targetNote = this.db
          .prepare('SELECT id FROM notes WHERE title = ? AND deleted_at IS NULL')
          .get(title) as { id: string } | undefined

        if (targetNote) {
          try {
            this.db
              .prepare('INSERT OR IGNORE INTO links (source_note_id, target_note_id) VALUES (?, ?)')
              .run(noteId, targetNote.id)
          } catch (error) {
            console.error(`Failed to create link from ${noteId} to ${targetNote.id}:`, error)
          }
        }
      }
    })
  }

  /**
   * Get notes that link to this note (backlinks)
   */
  getBacklinks(noteId: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT notes.* FROM notes
      JOIN links ON notes.id = links.source_note_id
      WHERE links.target_note_id = ? AND notes.deleted_at IS NULL
      ORDER BY notes.updated_at DESC
    `)
    return stmt.all(noteId) as Note[]
  }

  /**
   * Get notes that this note links to (outgoing links)
   */
  getOutgoingLinks(noteId: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT notes.* FROM notes
      JOIN links ON notes.id = links.target_note_id
      WHERE links.source_note_id = ? AND notes.deleted_at IS NULL
      ORDER BY notes.updated_at DESC
    `)
    return stmt.all(noteId) as Note[]
  }

  // Transaction support
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }

  // Cleanup
  close(): void {
    this.db.close()
  }
}
