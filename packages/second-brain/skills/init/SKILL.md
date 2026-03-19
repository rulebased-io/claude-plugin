---
name: init
description: Initialize a second brain directory structure from scaffold templates. Use when starting a new second brain from scratch.
---

Initialize a second brain directory structure in the current working directory.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. The scaffold templates are at `${CLAUDE_PLUGIN_PATH}/scaffold/`.

## Procedure

### Phase 1: Scaffold

1. Read the entire scaffold directory at `${CLAUDE_PLUGIN_PATH}/scaffold/`
2. Recreate the same directory structure and files in CWD
3. Replace `{{OWNER_NAME}}` with user's name (ask if not known)
4. Replace `{{DATE}}` with today's date (YYYY-MM-DD)
5. Skip existing files — never overwrite

Do NOT hardcode the directory tree. Read the scaffold directory to determine what to create.

### Phase 2: Reconciliation

After creating the structure, scan CWD for existing markdown assets:

1. Glob `*.md` files and any existing directories not created by the scaffold
2. Read the Structure table in the newly created `AGENTS.md` to understand folder purposes
3. Suggest migration mappings (e.g., existing `notes/` → `resources/`)
4. Move only user-approved items. Preserve originals.

### Phase 3: Hollow Check

Warn about unfilled placeholders:
- Files still containing `{{OWNER_NAME}}`
- Empty folders with only README.md

## Rules

- Never overwrite existing files.
- Always ask for `{{OWNER_NAME}}` if not provided via arguments.
- The scaffold is the single source of truth for structure — do not invent folders.

$ARGUMENTS
