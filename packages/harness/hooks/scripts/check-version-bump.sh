#!/bin/bash
#
# check-version-bump.sh — Warn if any packages/*/ plugin was modified without a version bump
#
# Triggered on UserPromptSubmit and Stop. Scans all packages/*/ directories
# for changes and verifies that each modified plugin's plugin.json version was also updated.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPO_ROOT="$(cd "$PLUGIN_DIR/../.." && pwd)"

cd "$REPO_ROOT"

# Iterate over each plugin directory under packages/
for PKG_DIR in packages/*/; do
  [ -d "$PKG_DIR" ] || continue

  PKG_NAME=$(basename "$PKG_DIR")

  # Check if this plugin has any staged or unstaged changes
  CHANGED_FILES=$(git diff --name-only HEAD -- "$PKG_DIR" 2>/dev/null || git diff --name-only -- "$PKG_DIR" 2>/dev/null || echo "")

  if [ -z "$CHANGED_FILES" ]; then
    continue
  fi

  # Check if plugin.json version was modified
  VERSION_BUMPED=$(echo "$CHANGED_FILES" | grep -c "\.claude-plugin/plugin.json" 2>/dev/null || true)

  if [ "$VERSION_BUMPED" -eq 0 ]; then
    PLUGIN_JSON="$PKG_DIR.claude-plugin/plugin.json"
    if [ -f "$PLUGIN_JSON" ]; then
      CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' "$PLUGIN_JSON" | cut -d'"' -f4)
      echo "[$PKG_NAME] packages/$PKG_NAME/ has changes but version is still ${CURRENT_VERSION}. Please bump the version in .claude-plugin/plugin.json."
    fi
  fi
done
