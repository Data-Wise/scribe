#!/bin/bash
# Test script to verify project-note relationship API

DB_PATH="$HOME/Library/Application Support/com.scribe.app/scribe.db"

echo "=== Current Project-Note Relationships ==="
echo ""

echo "Projects:"
sqlite3 "$DB_PATH" "SELECT id, name, type FROM projects;"
echo ""

echo "Notes with projects:"
sqlite3 "$DB_PATH" "
  SELECT n.id, n.title, n.project_id, p.name as project_name
  FROM notes n 
  LEFT JOIN projects p ON n.project_id = p.id
  WHERE n.deleted_at IS NULL
  ORDER BY n.updated_at DESC
  LIMIT 10;
"
echo ""

echo "Orphaned notes (no project):"
sqlite3 "$DB_PATH" "
  SELECT COUNT(*) as orphaned_count 
  FROM notes 
  WHERE project_id IS NULL AND deleted_at IS NULL;
"
echo ""

echo "Notes per project:"
sqlite3 "$DB_PATH" "
  SELECT p.name, COUNT(n.id) as note_count
  FROM projects p
  LEFT JOIN notes n ON p.id = n.project_id AND n.deleted_at IS NULL
  GROUP BY p.id, p.name
  ORDER BY note_count DESC;
"
