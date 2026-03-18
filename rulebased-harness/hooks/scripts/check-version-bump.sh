#!/bin/bash
#
# check-version-bump.sh — Warn if rulebased-harness/ was modified without a version bump
#
# Triggered on Stop. Checks git diff for changes in rulebased-harness/ and
# verifies that .claude-plugin/plugin.json version was also updated.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPO_ROOT="$(cd "$PLUGIN_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Check if rulebased-harness/ has any staged or unstaged changes
CHANGED_FILES=$(git diff --name-only HEAD -- rulebased-harness/ 2>/dev/null || git diff --name-only -- rulebased-harness/ 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

# Check if plugin.json version was modified
VERSION_BUMPED=$(echo "$CHANGED_FILES" | grep -c "\.claude-plugin/plugin.json" || echo "0")

if [ "$VERSION_BUMPED" -eq 0 ]; then
  CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' "$PLUGIN_DIR/.claude-plugin/plugin.json" | cut -d'"' -f4)
  echo "[harness] rulebased-harness/ has changes but version is still ${CURRENT_VERSION}. Please bump the version in .claude-plugin/plugin.json."
fi
