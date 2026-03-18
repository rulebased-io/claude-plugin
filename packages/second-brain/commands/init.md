---
description: Initialize second brain directory structure — scaffold, templates, system files
argument-hint: "[--owner name]"
---

Initializes a second brain directory structure in the current working directory.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read scaffold templates from `${CLAUDE_PLUGIN_PATH}/scaffold/`.

Creates: BRAIN.md, AGENTS.md, CLAUDE.md, system/ (rules, glossary, templates), inbox/, workspace/ (notes, code, projects), ideas/, journal/, areas/, archives/, brains/.
Replaces `{{OWNER_NAME}}` and `{{DATE}}` placeholders. Skips existing files.
Then scans for existing assets and offers migration to new structure.

$ARGUMENTS
