---
name: init
description: Initializes the harness structure and migrates existing project artifacts into it
---

> **Plugin path**: The `CLAUDE_PLUGIN_PATH` value provided by the hook is the root of this plugin.
> Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the full list of harness elements to initialize.
> **Reading order**: `index.md` → `guide-*.md` → `*.md` (only if needed)

Initializes the harness engineering structure for the current project.

## Workflow

### Phase 1: Scaffold (구조 생성)

Based on the 36-item audit criteria in `${CLAUDE_PLUGIN_PATH}/reference/index.md`, create:

**Critical (must create)**:
- `AGENTS.md` — See `${CLAUDE_PLUGIN_PATH}/reference/guide-context-engineering.md` for recommended structure
- `CLAUDE.md` — References AGENTS.md
- Test script in `package.json` (if missing)

**Important (should create)**:
- `.gitignore` with secret exclusion patterns (see `guide-security.md`)
- `README.md` (if missing)

**Workflow structure**:
- `specs/todo/`, `specs/done/`, `specs/backlog/`
- `tasks/todo/`, `tasks/done/`

Existing files are skipped. AGENTS.md contains TODO markers to fill in.

### Phase 2: Reconciliation (기존 자산 탐색 및 마이그레이션)

구조 생성 후, 프로젝트 내 기존 자산을 탐색하여 마이그레이션 후보를 제시한다.

**탐색 대상**:
- `TODO.md`, `TODO`, `todo.txt` — 미완료 작업 목록
- `backlog.md`, `roadmap.md`, `ROADMAP.md` — 백로그/로드맵
- `exec-plans/`, `plans/`, `planning/` — 기존 계획 문서
- `remaining-work.md`, `WORK.md` — 잔여 작업
- `.github/ISSUE_TEMPLATE/` — 이슈 템플릿 (spec 변환 후보)
- 프로젝트 루트의 단독 계획/작업 문서

**마이그레이션 절차**:
1. 발견된 파일 목록을 사용자에게 보여준다
2. 각 파일에서 미완료 항목을 추출하여 요약한다
3. `specs/backlog/`에 개별 spec으로 분리할지 사용자에게 묻는다
4. 승인된 항목만 변환하여 생성한다 (frontmatter 포함)
5. 원본 파일은 삭제하지 않는다 (사용자가 직접 정리)

**변환 형식** (specs/backlog/ 엔트리):
```markdown
---
name: migrated-item-slug
description: 기존 파일에서 추출된 항목 한 줄 요약
type: backlog
created: YYYY-MM-DD
priority: medium
source: 원본 파일 경로
---

# 항목 제목

(원본에서 추출된 내용)
```

### Phase 3: Hollow Check (빈 구조 경고)

생성된 구조 중 콘텐츠가 없는 항목을 경고한다:
- "AGENTS.md가 생성되었지만 TODO 마커만 있습니다. 빌드 커맨드와 아키텍처를 채워주세요."
- "specs/backlog/이 비어 있습니다. 기존 작업 항목을 마이그레이션하거나 새 spec을 작성하세요."

$ARGUMENTS
