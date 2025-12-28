#!/bin/zsh
# Simple test runner for Scribe CLI

# Setup environment
TEST_DB="/tmp/scribe_test_$(date +%s).db"
export SCRIBE_DB="$TEST_DB"
export EDITOR="echo" # Mock editor

# Mock sqlite3 if not present (unlikely on macOS)
if ! command -v sqlite3 &> /dev/null; then
  echo "Error: sqlite3 not found"
  exit 1
fi

# Initialize DB schema (minimal)
sqlite3 "$TEST_DB" "
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    folder TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    deleted_at INTEGER
);
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT,
    color TEXT
);
CREATE TABLE IF NOT EXISTS note_tags (
    note_id TEXT,
    tag_id TEXT,
    PRIMARY KEY (note_id, tag_id)
);
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title,
    content,
    content='notes',
    content_rowid='id'
);
"

# Source the CLI script
source cli/scribe.zsh

# Helpers
failed=0

assert_contains() {
  local output="$1"
  local substring="$2"
  if [[ "$output" != *"$substring"* ]]; then
    echo "FAIL: Output does not contain '$substring'"
    echo "Output: $output"
    failed=1
  else
    echo "PASS: Output contains '$substring'"
  fi
}

assert_file_exists() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "FAIL: File '$file' does not exist"
    failed=1
  else
    echo "PASS: File '$file' exists"
  fi
}

# Tests
echo "=== Running Tests ==="

echo "Test: scribe new"
out=$(scribe new "Test Note")
assert_contains "$out" "Created"
assert_contains "$out" "Test Note"

echo "Test: scribe list"
out=$(scribe list)
assert_contains "$out" "Test Note"
assert_contains "$out" "inbox"

echo "Test: scribe capture"
out=$(scribe capture "Buy milk")
assert_contains "$out" "Captured!"
out_list=$(scribe list)
assert_contains "$out_list" "Capture: Buy milk"

echo "Test: scribe daily"
scribe list
osascript() { echo "Mock osascript called"; }
out=$(scribe daily)
assert_contains "$out" "Created daily note"

echo "Test: scribe delete"
# Create a note to delete
scribe new "To Delete" > /dev/null
# Mock input for confirmation
echo "y" | scribe delete "To Delete" > /tmp/del_out
out=$(cat /tmp/del_out)
assert_contains "$out" "Deleted"

echo "Test: scribe export"
scribe new "Export Me" > /dev/null
# Mock content update
db_id=$(sqlite3 "$TEST_DB" "SELECT id FROM notes WHERE title='Export Me'")
echo "DB ID for Export Me: $db_id"
sqlite3 "$TEST_DB" "UPDATE notes SET content='## Some content' WHERE id='$db_id'"
out=$(scribe export "Export Me")
assert_contains "$out" "## Some content"

echo "Test: scribe backup"
backup_file="/tmp/scribe_backup.db"
scribe backup "$backup_file" > /dev/null
assert_file_exists "$backup_file"

# Cleanup
rm -f "$TEST_DB" "$backup_file" /tmp/del_out

if [[ $failed -eq 0 ]]; then
  echo "=== All Tests Passed ==="
  exit 0
else
  echo "=== Tests Failed ==="
  exit 1
fi
