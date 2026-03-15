---
name: audit
description: Audits your project's harness engineering setup and assigns a score (checks 17 items including AGENTS.md, specs, constraints, eval, etc.)
---

Audits the current project's harness engineering setup.

## Audit Criteria

The audit is based on the three pillars of OpenAI Harness Engineering:

### 1. Context Engineering
- AGENTS.md exists and contains required sections (build commands, architecture, common pitfalls)
- CLAUDE.md exists

### 2. Architectural Constraints
- Linter/formatter configuration (ESLint, Prettier, Biome, etc.)
- Pre-commit hook setup (Husky, Lefthook, etc.)

### 3. Eval & Workflow
- Eval dataset exists
- Specs/Tasks workflow directories

### 4. Build & Docs
- Test/build scripts defined
- CI/CD configuration
- README.md, .gitignore

## Scoring System

- **Critical** items (weight 3): AGENTS.md exists, build commands, test scripts
- **Important** items (weight 2): Architecture description, linter, TypeScript strict
- **Nice-to-have** items (weight 1): Workflow directories, eval, pre-commit

Score: 0-100 / Grades: A (90+), B (75+), C (60+), D (40+), F

## Execution

Check for the existence of the following files/directories in the project root:

Refer to [checklist.md](./checklist.md) for the full checklist.

You can also use the CLI:
```bash
npx rulebased-harness audit
npx rulebased-harness audit --json
```

Analyze the results and provide specific improvement suggestions for any failed items.
To auto-generate missing items, run `/rulebased:harness-recommend`.

$ARGUMENTS
