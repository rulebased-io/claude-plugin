---
name: harness-audit-criteria
description: 하네스 평가 기준 인덱스 — 8 카테고리, 36항목. guide → criteria 순으로 점진적 참조.
type: reference
created: 2026-03-18
---

# Harness Audit Criteria

8 카테고리, 36개 평가 항목.

## 읽는 순서

```
index.md (이 파일)  →  guide-*.md (평가 가이드)  →  *.md (항목 정의)
```

1. **이 파일**(index.md): 전체 카테고리 구조와 점수 체계 파악
2. **guide-*.md**: 각 카테고리의 평가 방법론, 등급 기준, 개선 전략
3. ***.md** (guide가 링크): 개별 항목의 What, Why, How to Check, Fix, Reference

모든 항목을 읽을 필요 없이 guide 수준에서 평가를 수행할 수 있다.
항목별 상세가 필요할 때만 guide가 링크하는 criteria 파일을 참조한다.

## Scoring

### 가중치

| Severity | Weight | 의미 | 해당 항목 수 | 소계 |
|----------|--------|------|-------------|------|
| Critical | 3 | 없으면 에이전트가 제대로 동작할 수 없음 | 4 | 12 |
| Important | 2 | 품질과 일관성에 직접 영향 | 13 | 26 |
| Nice-to-have | 1 | 성숙도를 높이는 보조 항목 | 19 | 19 |

**만점**: 57점

### 3단계 평가

각 항목은 3단계로 평가한다:

| 상태 | 의미 | 점수 비율 |
|------|------|-----------|
| **pass** | 구조 존재 + 실제 콘텐츠 있음 | weight × 100% |
| **hollow** | 구조 존재하나 비어 있거나 플레이스홀더만 있음 | weight × 50% |
| **fail** | 구조 자체가 없음 | 0 |

hollow 상태가 적용되는 항목은 Summary Table의 `H` 열에 `✓`로 표시.
hollow가 적용되지 않는 항목(설정 파일, boolean 판정)은 pass/fail만 사용.

### 점수 공식

```
score = (pass_weight_합 + hollow_weight_합 × 0.5) / 전체_weight_합 × 100
```

예시: critical 4개 중 3개 pass(9) + 1개 hollow(1.5), important 8개 pass(16) + 2개 hollow(2), nice-to-have 10개 pass(10)
→ `(9 + 1.5 + 16 + 2 + 10) / 57 × 100 = 67.5` → **C등급**

### 등급

| 등급 | 점수 | 의미 |
|------|------|------|
| A | 90-100 | 에이전트 자율 작업에 최적화된 하네스 |
| B | 75-89 | 대부분의 핵심 요소 갖춤, 일부 보완 필요 |
| C | 60-74 | 기본 구조는 있으나 상당한 보강 필요 |
| D | 40-59 | 최소 요건 미달, 에이전트 자율성 제한적 |
| F | 0-39 | 하네스 부재, 에이전트 작업에 부적합 |

### 카테고리별 점수

각 카테고리도 동일한 공식으로 개별 점수를 산출한다.
`카테고리 점수 = (카테고리 내 통과 weight 합 / 카테고리 만점) × 100`

## Categories

| # | 카테고리 | 항목 수 | 만점 | 가이드 |
|---|----------|---------|------|--------|
| 1 | Context Engineering | 8 | 17 | [guide-context-engineering.md](guide-context-engineering.md) |
| 2 | Workflow | 5 | 5 | [guide-workflow.md](guide-workflow.md) |
| 3 | Constraints | 5 | 7 | [guide-constraints.md](guide-constraints.md) |
| 4 | Eval | 4 | 5 | [guide-eval.md](guide-eval.md) |
| 5 | Build & Test | 4 | 7 | [guide-build-and-test.md](guide-build-and-test.md) |
| 6 | Documentation | 4 | 6 | [guide-documentation.md](guide-documentation.md) |
| 7 | Security | 3 | 6 | [guide-security.md](guide-security.md) |
| 8 | Agent Autonomy | 3 | 4 | [guide-agent-autonomy.md](guide-agent-autonomy.md) |

## Summary Table

`H` 열: hollow 상태 적용 가능 여부. ✓ 항목은 "구조는 있으나 비어 있음"을 감지하여 50% 점수를 부여한다.

| ID | Item | Severity | Category | H | Hollow 판정 기준 |
|----|------|----------|----------|---|-------------------|
| ctx-agents-exists | AGENTS.md exists | critical | Context Engineering | ✓ | 파일 존재하나 TODO만 있거나 10줄 미만 |
| ctx-agents-build | Build commands in AGENTS.md | critical | Context Engineering | ✓ | 섹션 존재하나 실제 커맨드 없음 |
| ctx-agents-arch | Architecture description | important | Context Engineering | ✓ | 섹션 존재하나 디렉토리 트리/설명 없음 |
| ctx-agents-pitfalls | Common pitfalls | important | Context Engineering | ✓ | 섹션 존재하나 항목 0개 |
| ctx-agents-conventions | Coding conventions | important | Context Engineering | ✓ | 섹션 존재하나 구체적 규칙/예시 없음 |
| ctx-agents-persona | Agent persona/role | nice-to-have | Context Engineering | | |
| ctx-agents-boundaries | Boundaries/restrictions | important | Context Engineering | ✓ | 섹션 존재하나 항목 0개 |
| ctx-claude-exists | CLAUDE.md exists | important | Context Engineering | ✓ | 파일 존재하나 3줄 미만 또는 빈 내용 |
| wf-specs-dir | specs directory | nice-to-have | Workflow | ✓ | 디렉토리 존재하나 .md 파일 0개 |
| wf-tasks-dir | tasks directory | nice-to-have | Workflow | ✓ | 디렉토리 존재하나 .md 파일 0개 |
| wf-backlog | backlog directory | nice-to-have | Workflow | ✓ | 디렉토리 존재하나 .md 파일 0개 |
| wf-spec-template | spec template | nice-to-have | Workflow | | |
| wf-done-archive | done archive structure | nice-to-have | Workflow | ✓ | 디렉토리 존재하나 .md 파일 0개 |
| cst-lint | Linter/formatter | important | Constraints | | |
| cst-precommit | Pre-commit hook | nice-to-have | Constraints | | |
| cst-type-safety | Type safety (strict mode) | important | Constraints | | |
| cst-editorconfig | .editorconfig | nice-to-have | Constraints | | |
| cst-commit-convention | Commit message convention | nice-to-have | Constraints | | |
| eval-dir | Eval dataset | nice-to-have | Eval | ✓ | 디렉토리 존재하나 eval 파일 0개 |
| eval-log-config | Session log evaluation | nice-to-have | Eval | | |
| eval-autonomy-metric | Autonomy metric defined | nice-to-have | Eval | | |
| eval-quality-gate | Quality gate (CI pass) | important | Eval | | |
| build-test-script | Test script | critical | Build & Test | | |
| build-build-script | Build script | important | Build & Test | | |
| build-ci | CI/CD configuration | nice-to-have | Build & Test | | |
| build-lockfile | Package lock file | nice-to-have | Build & Test | | |
| docs-readme | README.md | important | Documentation | ✓ | 파일 존재하나 5줄 미만 또는 제목만 |
| docs-gitignore | .gitignore | important | Documentation | | |
| docs-license | LICENSE file | nice-to-have | Documentation | | |
| docs-changelog | CHANGELOG or release notes | nice-to-have | Documentation | ✓ | 파일 존재하나 엔트리 0개 |
| sec-no-secrets | Secrets excluded from repo | critical | Security | | |
| sec-gitignore-patterns | Sensitive file patterns blocked | important | Security | | |
| sec-dependency-audit | Dependency audit configured | nice-to-have | Security | | |
| auto-context-completeness | Context completeness | important | Agent Autonomy | | |
| auto-tool-config | MCP/Agent Skills configured | nice-to-have | Agent Autonomy | | |
| auto-memory-system | Persistent memory system | nice-to-have | Agent Autonomy | | |
