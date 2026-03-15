---
description: Audit harness coverage — 34 checks based on OpenAI Codex harness standards (0-100 score)
argument-hint: "[path]"
---

# /audit — Harness Audit

Run a harness audit on the current project (or specified path). Checks 34 items across 8 categories and assigns a weighted score.

## What it does

1. Scans the project root for harness elements (AGENTS.md, ARCHITECTURE.md, linter config, CI, etc.)
2. Scores each item by severity (critical=3, important=2, nice-to-have=1)
3. Reports per-category breakdown and failed items with fix suggestions

## Usage

```
/rulebased-harness:audit
/rulebased-harness:audit ./path/to/project
```

Or via CLI:
```bash
npx @rulebased/cli audit
npx @rulebased/cli audit --json
```

$ARGUMENTS
