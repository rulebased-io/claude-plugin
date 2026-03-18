---
name: init
description: 세컨드 브레인 디렉토리 구조 초기화 — scaffold 복사, 템플릿 배치, 기존 자산 탐색
type: skill
created: 2026-03-19
---

Initializes a second brain directory structure in the current working directory.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root. The scaffold templates are at `${CLAUDE_PLUGIN_PATH}/scaffold/`.

## Phase 1: Scaffold

Read the scaffold directory at `${CLAUDE_PLUGIN_PATH}/scaffold/` and recreate the structure in CWD.

**디렉토리 구조**:
```
<brain-root>/
├── BRAIN.md              # 외부 에이전트 접근 정책, Permission Set
├── AGENTS.md             # Agent 역할 정의, 작업 흐름
├── CLAUDE.md             # AGENTS.md, rules.md 참조
├── system/               # 규칙, 스키마, 용어집, 템플릿
│   ├── rules.md
│   ├── standard-schema.md  # Transit/Storage Schema 정의
│   ├── design-principles.md
│   ├── glossary.md
│   ├── MOC-index.md
│   └── templates/        # note, idea, journal, snippet, til
├── inbox/                # 빠른 캡처, 외부 유입
│   └── README.md         # inbox 운영 가이드
├── workspace/            # 직접 작업 공통 루트
│   ├── README.md         # workspace 구조 가이드
│   ├── knowledge/        # memos, readings
│   ├── code/             # snippets, til
│   ├── projects/
│   └── resources/
├── ideas/                # 아이디어 스테이징 (seed→growing→ripe)
│   └── README.md         # 아이디어 생명주기 가이드
├── journal/              # 일기, 회고
├── areas/                # 지속 관리 영역
│   └── profile.md        # 개인 프로필 템플릿
├── archives/             # 비활성 보관
└── brains/               # Permission Set 템플릿
    ├── README.md         # Permission Set 운영 가이드
    ├── mentor-session/   # 멘토링 세션 Permission Set
    └── project-collab/   # 프로젝트 협업 Permission Set
```

**절차**:
1. Read each file from `${CLAUDE_PLUGIN_PATH}/scaffold/`
2. Replace `{{OWNER_NAME}}` with user's name (ask if not known)
3. Replace `{{DATE}}` with today's date (YYYY-MM-DD)
4. Create directories and files in CWD
5. Skip existing files — never overwrite

## Phase 2: Reconciliation

구조 생성 후, CWD 내 기존 자산을 탐색하여 마이그레이션 후보를 제시한다.

**탐색 대상**:
- `notes/`, `daily/`, `maps/` — 기존 second-brain 스킬 스펙 구조
- `*.md` 파일 (루트) — 기존 파일
- `templates/` — 기존 템플릿

**절차**:
1. 발견된 파일 목록을 사용자에게 보여준다
2. 기존 구조와 새 구조의 매핑을 제안한다:
   - `notes/` → `workspace/knowledge/`
   - `daily/` → `journal/`
   - `maps/` → `system/` (MOC)
   - `inbox/` → `inbox/` (유지)
3. 승인된 항목만 이동. 원본은 보존한다

## Phase 3: Hollow Check

빈 구조를 경고한다:
- "BRAIN.md가 생성되었지만 `{{OWNER_NAME}}`이 아직 설정되지 않았습니다."
- "system/rules.md가 기본 템플릿 상태입니다. 프로젝트에 맞게 수정하세요."
- "workspace/가 비어 있습니다."

$ARGUMENTS
