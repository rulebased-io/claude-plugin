#!/bin/bash
#
# resolve-plugin-path.sh — Resolve CLAUDE_PLUGIN_PATH for harness skills
#
# Triggered by UserPromptSubmit hook.
# Reads the user prompt from stdin and checks if it matches harness skill patterns.
# If matched, outputs the plugin path so Claude can locate plugin files.
#
# Reference: https://code.claude.com/docs/en/hooks.md
# UserPromptSubmit stdout is automatically visible to Claude.
#

set -euo pipefail

INPUT=$(cat)

# Extract the user prompt
PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || echo "")

# Check if the prompt matches any harness skill pattern
if ! echo "$PROMPT" | grep -qE '/(rulebased:harness|rulebased-harness:)(audit|init|recommend|eval-log)'; then
  exit 0
fi

# Resolve plugin path from this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_PATH="$(cd "$SCRIPT_DIR/../.." && pwd)"

cat <<EOF
[rulebased-harness plugin]
CLAUDE_PLUGIN_PATH=${PLUGIN_PATH}

This is the installed path of the rulebased-harness plugin.
Use this path to read any plugin files referenced in the skill documentation.
For example: ${PLUGIN_PATH}/reference/checklist.md
EOF
