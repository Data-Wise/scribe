# ============================================================================
# Utility Functions
# ============================================================================

# Generate 32-character hex ID (matching Scribe's format)
_scribe_generate_id() {
  # Use OpenSSL for cryptographic random bytes, convert to hex
  openssl rand -hex 16
}

# Escape single quotes for SQL
_scribe_escape() {
  echo "${1//'/""}"
}

# Format timestamp for display
_scribe_format_time() {
  local ts="$1"
  date -r "$ts" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "Unknown"
}
