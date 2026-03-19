---
description: Initialize second brain directory structure from scaffold templates
argument-hint: "[--owner name]"
---

Initialize a second brain directory structure in the current working directory.

Read scaffold templates from `${CLAUDE_PLUGIN_PATH}/scaffold/` and recreate in CWD. Replace `{{OWNER_NAME}}` and `{{DATE}}` placeholders. Skip existing files.
Then scan for existing assets and offer to migrate them into the new structure.

$ARGUMENTS
