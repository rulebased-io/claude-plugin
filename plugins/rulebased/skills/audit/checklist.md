# Harness Audit Checklist

## Context Engineering (Core)

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| ctx-agents-exists | AGENTS.md exists | critical | Check if `AGENTS.md` file exists |
| ctx-agents-build | Includes build commands | critical | AGENTS.md contains npm/yarn/pnpm/make commands |
| ctx-agents-arch | Architecture description | important | AGENTS.md describes structure/layers/directories |
| ctx-agents-pitfalls | Common pitfalls | important | AGENTS.md lists warnings/restrictions/things to avoid |
| ctx-claude-exists | CLAUDE.md exists | important | Check if `CLAUDE.md` file exists |

## Workflow

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| wf-specs-dir | specs directory | nice-to-have | `specs/` or `spec/` exists |
| wf-tasks-dir | tasks directory | nice-to-have | `tasks/` or `task/` exists |

## Constraints

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| cst-lint | Linter/formatter | important | .eslintrc, biome.json, etc. exist |
| cst-precommit | Pre-commit hook | nice-to-have | .husky/, lefthook.yml, etc. exist |

## Eval

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| eval-dir | Eval dataset | nice-to-have | evals/ or eval/ exists |

## Conventions

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| conv-editorconfig | .editorconfig | nice-to-have | File exists |
| conv-ts-strict | TS strict mode | important | tsconfig.json has strict: true |

## Build & Test

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| build-test-script | Test script | critical | package.json scripts.test exists |
| build-build-script | Build script | important | package.json scripts.build exists |
| build-ci | CI/CD configuration | nice-to-have | .github/workflows/ etc. exists |

## Documentation

| ID | Item | Severity | How to Check |
|----|------|----------|--------------|
| docs-readme | README.md | important | File exists |
| docs-gitignore | .gitignore | important | File exists |
