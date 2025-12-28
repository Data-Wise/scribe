# ============================================================================
# Configuration
# ============================================================================

# Version
SCRIBE_CLI_VERSION="1.2.0"

# Database location
: ${SCRIBE_DB:="${HOME}/Library/Application Support/com.scribe.app/scribe.db"}

# Colors for output
typeset -A _scribe_colors
_scribe_colors=(
  reset    $'\e[0m'
  bold     $'\e[1m'
  dim      $'\e[2m'
  green    $'\e[32m'
  yellow   $'\e[33m'
  blue     $'\e[34m'
  magenta  $'\e[35m'
  cyan     $'\e[36m'
  red      $'\e[31m'
)
