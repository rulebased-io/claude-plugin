---
name: audit
description: Audits your project's harness engineering setup and assigns a score (36 items across 8 categories, 3-level grading)
---

Audits the current project's harness engineering setup.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the full 36-item criteria, scoring, and hollow detection rules.

**Reading order**: `index.md` → `guide-*.md` (methodology) → `*.md` (item details, only if needed)

## How to Audit

1. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the scoring system, 36-item summary, and hollow criteria
2. For each category, read the `guide-*.md` file for evaluation methodology
3. Check each item against the current project:
   - **pass**: Structure exists AND has meaningful content
   - **hollow**: Structure exists but empty/placeholder only (see `H` column in index.md)
   - **fail**: Structure does not exist
4. Calculate the weighted score using the 3-level formula

## Scoring

- **Critical** (weight 3) · **Important** (weight 2) · **Nice-to-have** (weight 1)
- **Formula**: `score = (pass_weights + hollow_weights × 0.5) / total_weights × 100`
- **Grades**: A (90+), B (75+), C (60+), D (40+), F (<40)

## Output Format

```
[PASS]   ctx-agents-exists — AGENTS.md exists (3/3)
[HOLLOW] ctx-agents-build — Build commands section exists but no actual commands (1.5/3)
         → AGENTS.md의 빌드 섹션에 실제 npm/yarn/pnpm 커맨드를 추가하세요
[FAIL]   ctx-agents-arch — No architecture description (0/2)
         → AGENTS.md에 프로젝트 구조 트리와 디렉토리 설명을 추가하세요
```

End with: overall score, grade, and top 3 improvement recommendations.

$ARGUMENTS
