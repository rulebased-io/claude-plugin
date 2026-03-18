---
description: Audit harness coverage — 36 checks across 8 categories, 3-level grading (0-100 score)
argument-hint: "[path]"
---

Audits the current project's harness engineering setup.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the full 36-item criteria, scoring, and hollow detection rules.

**Reading order**: `index.md` → `guide-*.md` (methodology) → `*.md` (item details, only if needed)

## How to Audit

1. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the scoring system, 36-item summary, and hollow criteria
2. For each category, read the `guide-*.md` file for evaluation methodology
3. Check each item: **pass** / **hollow** / **fail**
4. Calculate: `score = (pass_weights + hollow_weights × 0.5) / total_weights × 100`
5. Grades: A (90+), B (75+), C (60+), D (40+), F (<40)

$ARGUMENTS
