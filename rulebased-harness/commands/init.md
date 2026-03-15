---
description: Initialize harness structure — creates AGENTS.md, specs/, tasks/, .harness.json
argument-hint: "[--preset minimal|standard] [--force]"
---

# /init — Initialize Harness

Set up harness engineering structure in the current project.

## What it creates

- `AGENTS.md` — Agent rules (with TODO markers to fill in)
- `CLAUDE.md` — References AGENTS.md
- `.harness.json` — Audit configuration (preset selection)
- `specs/todo/`, `specs/done/`, `specs/backlog/` — Spec workflow
- `tasks/todo/`, `tasks/done/` — Task workflow
- `.gitignore` (if not present)

Existing files are skipped unless `--force` is used.

## Usage

```
/rulebased-harness:init
/rulebased-harness:init --preset minimal
```

Or via CLI:
```bash
npx @rulebased/cli init
npx @rulebased/cli init --preset minimal --force
```

$ARGUMENTS
