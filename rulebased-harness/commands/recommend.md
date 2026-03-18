---
description: Recommend missing and hollow harness elements by priority, suggest migrations and auto-generate fixes
argument-hint: "[path]"
---

Audits the current project and recommends improvements.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the 36-item criteria and guide files for code examples.

Checks each item (pass/hollow/fail), recommends creation or content filling, and offers migration of existing artifacts. Priority: critical fail → critical hollow → important fail → important hollow → nice-to-have.

$ARGUMENTS
