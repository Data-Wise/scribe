#!/bin/bash
# Build script for Scribe CLI

OUTPUT="cli/scribe.zsh"
HEADER="#!/bin/zsh
# ============================================================================
# Scribe CLI - Terminal-based note access for Scribe app
# ============================================================================
# Location: ~/.config/zsh/functions/scribe.zsh
# Source:   source ~/.config/zsh/functions/scribe.zsh
# Man page: ~/.local/share/man/man1/scribe.1
#
# Generated: $(date)
# ============================================================================
"

echo "Building Scribe CLI to $OUTPUT..."

# Write header
echo "$HEADER" > "$OUTPUT"

# Concatenate files in order
cat cli/src/config.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/db.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/utils.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/commands/basic.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/commands/search.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/commands/capture.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/commands/manage.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/help.zsh >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat cli/src/main.zsh >> "$OUTPUT"

echo "Done."
chmod +x "$OUTPUT"
