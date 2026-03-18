---
name: init
description: Initializes the harness structure and migrates existing project artifacts into it
---

Initializes the harness engineering structure for the current project.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. Read `${CLAUDE_PLUGIN_PATH}/reference/index.md` for the full list of harness elements. Read `${CLAUDE_PLUGIN_PATH}/reference/guide-context-engineering.md` for the AGENTS.md recommended structure, and `${CLAUDE_PLUGIN_PATH}/reference/guide-security.md` for .gitignore patterns.

## Phase 1: Scaffold

**Critical (must create)**:
- `AGENTS.md` — build commands, architecture, pitfalls, conventions, boundaries
- `CLAUDE.md` — References AGENTS.md
- Test script in `package.json` (if missing)

**Important (should create)**:
- `.gitignore` with secret exclusion patterns (`.env*`, `*.key`, `*.pem`)
- `README.md` (if missing)

**Workflow structure**:
- `specs/todo/`, `specs/done/`, `specs/backlog/`
- `tasks/todo/`, `tasks/done/`

Existing files are skipped.

## Phase 2: Reconciliation

구조 생성 후, 프로젝트 내 기존 자산을 탐색하여 마이그레이션 후보를 제시한다.

**탐색 대상**: `TODO.md`, `backlog.md`, `roadmap.md`, `exec-plans/`, `plans/`, `remaining-work.md`, `.github/ISSUE_TEMPLATE/`

**절차**:
1. 발견된 파일 목록을 사용자에게 보여준다
2. 미완료 항목을 추출하여 요약한다
3. `specs/backlog/`에 개별 spec으로 분리할지 묻는다
4. 승인된 항목만 변환 (frontmatter 포함). 원본은 보존한다

## Phase 3: Hollow Check

빈 구조를 경고한다:
- "AGENTS.md가 생성되었지만 TODO 마커만 있습니다."
- "specs/backlog/이 비어 있습니다."

$ARGUMENTS
