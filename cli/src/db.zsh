# ============================================================================
# Database Helpers
# ============================================================================

_scribe_check_db() {
  if [[ ! -f "$SCRIBE_DB" ]]; then
    echo "scribe: database not found at $SCRIBE_DB" >&2
    echo "Run Scribe app at least once to create the database." >&2
    return 1
  fi
  return 0
}

_scribe_query() {
  sqlite3 -separator '|' "$SCRIBE_DB" "$1" 2>/dev/null
}

_scribe_exec() {
  sqlite3 "$SCRIBE_DB" "$1" 2>/dev/null
}
