---
name: score
description: Scores your project's harness engineering setup by category and generates a report
---

Scores your project's harness engineering setup by category and generates a report.

While audit provides a pass/fail checklist, score shows **per-category scores and an overall grade**.

## Execution

```bash
npx rulebased-harness score
```

## Example Output

```
## Harness Score Report

[###############-----]  **77/100 (B)**

### Context Engineering  [####################]  100/100  (5/5)

- [PASS] AGENTS.md exists
- [PASS] AGENTS.md includes build commands
- [PASS] AGENTS.md includes architecture description
- [PASS] AGENTS.md includes common pitfalls list
- [PASS] CLAUDE.md exists

### Constraints  [--------------------]  0/100  (0/2)

- [FAIL] Linter/formatter configuration exists
  -> Add a configuration file for ESLint, Prettier, Biome, etc.
- [FAIL] Pre-commit hook setup
  -> Set up Husky, Lefthook, or pre-commit.

### Build & Test  [#############-------]  67/100  (2/3)

- [PASS] Test script defined
- [PASS] Build script defined
- [FAIL] CI/CD configuration exists
  -> Add a CI workflow in .github/workflows/.
```

$ARGUMENTS
