#!/bin/bash
#
# eval-on-stop.sh — Run eval-log when a session ends
#
# Conditions:
#   - Only runs if the session had meaningful work (>= 10 assistant turns)
#   - Reads transcript_path from stdin JSON
#   - Outputs a brief score summary
#

set -euo pipefail

INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$INPUT" | grep -o '"transcript_path":"[^"]*"' | head -1 | cut -d'"' -f4)

# If no transcript path provided, try to find it
if [ -z "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# Check if transcript exists and has enough content
if [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

LINE_COUNT=$(wc -l < "$TRANSCRIPT_PATH" | tr -d ' ')
if [ "$LINE_COUNT" -lt 20 ]; then
  exit 0  # Too short, skip evaluation
fi

# Count assistant turns — only evaluate if meaningful work happened
ASSISTANT_TURNS=$(grep -c '"type":"assistant"' "$TRANSCRIPT_PATH" 2>/dev/null || echo "0")
if [ "$ASSISTANT_TURNS" -lt 10 ]; then
  exit 0  # Not enough agent work to evaluate
fi

# Run eval-log
npx rulebased-harness eval-log --file "$TRANSCRIPT_PATH" 2>/dev/null || true
