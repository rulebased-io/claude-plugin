---
name: recommend
description: Recommends missing harness elements for your project and auto-generates them (AGENTS.md, lint, eval, CI, etc.)
---

Audits the current project's harness state and recommends missing elements.

## Workflow

1. Runs an audit first (checks for the existence of files/directories in the project root)
2. Generates a recommendation list based on failed items
3. Sorts recommendations by priority (high -> medium -> low)
4. Items tagged with [auto-fix] can be auto-generated with user consent

## Recommendable Items

- **Generate/improve AGENTS.md** - Build commands, architecture, common pitfalls sections
- **Generate CLAUDE.md** - References AGENTS.md
- **specs/tasks directories** - Workflow structure
- **Linter/formatter** - ESLint, Prettier configuration
- **Eval dataset** - Agent evaluation prompts
- **CI/CD** - GitHub Actions workflow
- **.gitignore, .editorconfig** - Basic configuration

## Execution

CLI:
```bash
npx rulebased-harness recommend
npx rulebased-harness recommend --json
```

After presenting the recommendation list, ask the user which items to generate.
Only generate files for items the user has approved.

$ARGUMENTS
