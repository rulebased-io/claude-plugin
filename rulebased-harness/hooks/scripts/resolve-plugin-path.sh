#!/bin/bash
#
# resolve-plugin-path.sh — Resolve CLAUDE_PLUGIN_PATH for harness skills
#
# Triggered by UserPromptSubmit hook when a harness skill is invoked.
# Reads the user prompt from stdin and checks if it matches harness skill patterns.
# If matched, outputs the resolved plugin path so documents can reference plugin-relative files.
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

echo "CLAUDE_PLUGIN_PATH=${PLUGIN_PATH}"
