#!/bin/bash
#
# resolve-plugin-path.sh — Resolve CLAUDE_PLUGIN_PATH for second-brain skills
#
# Triggered by UserPromptSubmit hook.
# Reads the user prompt from stdin and checks if it matches second-brain skill patterns.
# If matched, outputs the plugin path so Claude can locate plugin files.
#

set -euo pipefail

INPUT=$(cat)

# Extract the user prompt
PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || echo "")

# Check if the prompt matches any second-brain skill pattern
if ! echo "$PROMPT" | grep -qE '/second-brain:(capture|connect|review|organize|synthesize|search|daily|refactor)'; then
  exit 0
fi

# Resolve plugin path from this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_PATH="$(cd "$SCRIPT_DIR/../.." && pwd)"

cat <<EOF
[second-brain plugin]
CLAUDE_PLUGIN_PATH=${PLUGIN_PATH}

This is the installed path of the second-brain plugin.
Use this path to read any plugin files referenced in the skill documentation.
EOF
