---
name: audit
description: 하네스 감사 공유 문서 — skills/audit, commands/audit 공통 참조
type: skill
created: 2026-03-18
---

> **Plugin path**: The `CLAUDE_PLUGIN_PATH` value provided by the hook is the root of this plugin.
> Start by reading `${CLAUDE_PLUGIN_PATH}/reference/index.md` — it indexes all evaluation guides.
>
> **Reading order**: `index.md` → `guide-*.md` (methodology) → `*.md` (item details, only if needed)
>
> ```
> ${CLAUDE_PLUGIN_PATH}/reference/
> ├── index.md                        ← Start here: 8 categories, 36 items, scoring
> ├── guide-context-engineering.md     ← Evaluation guide (links to criteria)
> ├── guide-workflow.md
> ├── guide-constraints.md
> ├── guide-eval.md
> ├── guide-build-and-test.md
> ├── guide-documentation.md
> ├── guide-security.md
> ├── guide-agent-autonomy.md
> ├── context-engineering.md           ← Per-item criteria (What/Why/How/Fix)
> ├── workflow.md
> ├── constraints.md
> ├── eval.md
> ├── build-and-test.md
> ├── documentation.md
> ├── security.md
> └── agent-autonomy.md
> ```

Audits the current project's harness engineering setup.

## How to Audit

1. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the scoring system, 36-item summary, and hollow criteria
2. For each category, read the `guide-*.md` file for evaluation methodology
3. Check each item against the current project:
   - **pass**: Structure exists AND has meaningful content
   - **hollow**: Structure exists but empty/placeholder only (see `H` column in index.md for detection criteria)
   - **fail**: Structure does not exist
4. Calculate the weighted score using the 3-level formula

## Scoring

Each item has a severity that determines its weight:
- **Critical** (weight 3): AGENTS.md, build commands, test scripts, secrets exclusion
- **Important** (weight 2): Architecture, pitfalls, conventions, boundaries, linter, type safety, quality gate, context completeness, README, .gitignore, gitignore patterns
- **Nice-to-have** (weight 1): All other items

**Formula**: `score = (pass_weights + hollow_weights × 0.5) / total_weights × 100`
**Grades**: A (90+), B (75+), C (60+), D (40+), F (<40)

## Output Format

Present results as a per-category breakdown. For each item show:

```
[PASS]   ctx-agents-exists — AGENTS.md exists (3/3)
[HOLLOW] ctx-agents-build — Build commands section exists but no actual commands (1.5/3)
         → AGENTS.md의 빌드 섹션에 실제 npm/yarn/pnpm 커맨드를 추가하세요
[FAIL]   ctx-agents-arch — No architecture description (0/2)
         → AGENTS.md에 프로젝트 구조 트리와 디렉토리 설명을 추가하세요
```

End with: overall score, grade, and top 3 improvement recommendations.

To auto-generate missing items, run `/rulebased-harness:recommend`.
