---
name: recommend
description: 하네스 추천 공유 문서 — skills/recommend, commands/recommend 공통 참조
type: skill
created: 2026-03-18
---

> **Plugin path**: The `CLAUDE_PLUGIN_PATH` value provided by the hook is the root of this plugin.
> Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the full audit criteria to base recommendations on.
> **Reading order**: `index.md` → `guide-*.md` → `*.md` (only if needed)

Audits the current project's harness state and recommends improvements.

## Workflow

1. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the 36-item criteria (including hollow detection)
2. Check each item: **pass**, **hollow**, or **fail**
3. For failed items: recommend creation (read `guide-*.md` for code examples)
4. For hollow items: recommend content filling or migration
5. Sort by priority: critical fail → critical hollow → important fail → important hollow → nice-to-have

## Recommendation Types

### Type 1: Missing (fail → pass)
항목이 존재하지 않음. 새로 생성 필요.
```
[FAIL → CREATE] ctx-agents-exists
  AGENTS.md가 없습니다.
  [auto-fix] 스캐폴딩을 생성하시겠습니까?
```

### Type 2: Hollow (hollow → pass)
구조는 있으나 콘텐츠가 없음. 채우기 또는 마이그레이션 필요.
```
[HOLLOW → FILL] wf-backlog
  specs/backlog/ 디렉토리가 비어 있습니다.
  → TODO.md에서 미완료 항목 3건을 발견했습니다.
  [auto-fix] 개별 spec으로 마이그레이션하시겠습니까?
```

### Type 3: Enhancement (pass → better pass)
기본 요건은 충족하나 추가 개선 가능.
```
[ENHANCE] ctx-agents-conventions
  코딩 컨벤션 섹션이 있으나 코드 예시가 없습니다.
  → guide-context-engineering.md의 좋은 예/나쁜 예 패턴을 참고하세요
```

## Priority Mapping

| Priority | 대상 | auto-fix |
|----------|------|----------|
| **Critical** | fail인 critical 항목 | ✓ |
| **High** | hollow인 critical 항목 + fail인 important 항목 | ✓ |
| **Medium** | hollow인 important 항목 + fail인 nice-to-have 항목 | 일부 |
| **Low** | hollow인 nice-to-have 항목 | - |

## Migration Scan

recommend 실행 시 hollow 항목이 발견되면, 프로젝트 내 기존 자산을 탐색한다:

- `TODO.md`, `backlog.md`, `roadmap.md` → `specs/backlog/`로 마이그레이션 후보
- `exec-plans/`, `plans/` → `specs/todo/`로 마이그레이션 후보
- 기존 이슈 템플릿 → spec 템플릿 변환 후보

발견된 항목을 사용자에게 보여주고, 승인 시에만 변환한다.

## Execution

After presenting the recommendation list, ask the user which items to generate or migrate.
Only generate/migrate for items the user has approved.
Use the code examples from guide files as templates for auto-generated content.
