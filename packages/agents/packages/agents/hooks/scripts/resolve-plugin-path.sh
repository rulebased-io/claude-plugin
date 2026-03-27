#!/bin/bash
#
# resolve-plugin-path.sh — Resolve CLAUDE_PLUGIN_PATH for agents skills
#
# Triggered by UserPromptSubmit hook.
# Reads the user prompt from stdin and checks if it matches agents skill patterns.
# If matched, outputs the plugin path so Claude can locate plugin files.
#
# Reference: https://code.claude.com/docs/en/hooks.md
# UserPromptSubmit stdout is automatically visible to Claude.
#

set -euo pipefail

INPUT=$(cat)

# Extract the user prompt
PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || echo "")

# Check if the prompt matches any agents skill pattern
if ! echo "$PROMPT" | grep -qE '/(rulebased:agents|rulebased-agents:)(init|create|online|offline|ask|list|status)'; then
  exit 0
fi

# Resolve plugin path from this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_PATH="$(cd "$SCRIPT_DIR/../.." && pwd)"

cat <<EOF
[agents plugin]
CLAUDE_PLUGIN_PATH=${PLUGIN_PATH}

This is the installed path of the agents plugin.
Use this path to read any plugin files referenced in the skill documentation.
EOF
