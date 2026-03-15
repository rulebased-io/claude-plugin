---
name: init
description: Initializes the harness structure for the current project (AGENTS.md, specs/, tasks/, etc.)
---

Initializes the harness engineering structure for the current project.

## Tasks Performed

1. Creates the following in the project root:
   - `AGENTS.md` - Agent rules (build instructions, architecture, common pitfalls)
   - `CLAUDE.md` - References AGENTS.md
   - `specs/todo/`, `specs/done/`, `specs/backlog/` - Spec workflow
   - `tasks/todo/`, `tasks/done/` - Task workflow
   - `.gitignore` (if not already present)

2. Existing files are skipped.

3. AGENTS.md contains TODO markers that should be filled in with project-specific content after generation.

## Execution

Use the CLI:
```bash
npx rulebased-harness init
```

Or manually create the files listed above.

Fill in the TODO items in the generated AGENTS.md to match your project:
- Project description
- Build/test commands
- Directory structure
- Coding conventions
- Common pitfalls to avoid

$ARGUMENTS
