---
name: recommend
description: Recommends missing and hollow harness elements, suggests migrations and auto-generates fixes
---

Audits the current project's harness state and recommends improvements.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the 36-item criteria and hollow detection. Read the `guide-*.md` files for code examples and improvement strategies.

## Workflow

1. Check each item: **pass**, **hollow**, or **fail**
2. For failed items: recommend creation
3. For hollow items: recommend content filling or migration
4. Sort by priority: critical fail → critical hollow → important fail → important hollow → nice-to-have

## Recommendation Types

**Missing (fail → create)**: 항목이 없음. 새로 생성.
**Hollow (hollow → fill)**: 구조는 있으나 비어 있음. 콘텐츠 채우기 또는 마이그레이션.
**Enhancement (pass → better)**: 기본 충족, 추가 개선 가능.

## Priority Mapping

| Priority | 대상 | auto-fix |
|----------|------|----------|
| **Critical** | fail인 critical 항목 | ✓ |
| **High** | hollow인 critical + fail인 important | ✓ |
| **Medium** | hollow인 important + fail인 nice-to-have | 일부 |
| **Low** | hollow인 nice-to-have | - |

## Migration Scan

hollow 워크플로우 항목 발견 시 기존 자산 탐색:
- `TODO.md`, `backlog.md`, `roadmap.md` → `specs/backlog/`
- `exec-plans/`, `plans/` → `specs/todo/`

승인된 항목만 변환한다.

$ARGUMENTS
