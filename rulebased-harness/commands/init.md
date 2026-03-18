---
description: Initialize harness structure with reconciliation — creates AGENTS.md, specs/, tasks/ and migrates existing artifacts
argument-hint: "[--preset minimal|standard] [--force]"
---

Initializes the harness engineering structure for the current project.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for harness elements, `guide-context-engineering.md` for AGENTS.md structure, `guide-security.md` for .gitignore patterns.

Creates: AGENTS.md, CLAUDE.md, .gitignore, README.md, specs/, tasks/ directories.
Then scans for existing artifacts (TODO.md, backlog.md, plans/) and offers migration to specs/backlog/.
Warns about hollow (empty) structures after creation.

$ARGUMENTS
