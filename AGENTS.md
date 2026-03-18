# AGENTS.md - @rulebased/harness

이 프로젝트의 SSOT(Single Source of Truth) 문서입니다.

## 프로젝트 개요

**@rulebased/harness** - AI 에이전트를 위한 하네스 구축 도구.
프로젝트의 하네스 구축 정도를 점검(audit), 빠진 요소를 추천(recommend), 하네스를 초기화(init)합니다.

- 플러그인명: `rulebased` → `/rulebased:harness-init`, `/rulebased:harness-audit`, `/rulebased:harness-recommend`
- npm: `@rulebased/harness`
- GitHub: `rulebased-io/harness`
- 도메인: `rulebased.io`

## 빌드 & 검증

```bash
npm install          # 의존성 설치
npm run build        # TypeScript → dist/
npm test             # Jest (26개 테스트)
npm run audit        # 이 프로젝트의 하네스 점검
```

## 핵심 규칙

### 1. 워크플로우 (자동 적용)

**사용자의 아이디어/요구사항은 먼저 spec으로 기록합니다.**

| 유형 | 행동 | 위치 |
|------|------|------|
| **명시적 구현 지시** ("이거 만들어줘", "구현해줘") | spec 작성 → task 도출 → 구현 | `specs/todo/` |
| **그 외 모든 새로운 이야기** | 백로그에 기록만 함 | `specs/backlog/` |
| 현재 작업 중인 코드의 버그 수정/오타 | 바로 진행 | - |

**기본 원칙: 사용자가 새로운 것을 말하면, 기본값은 "백로그에 기록"이다.**

구현을 시작하는 것은 예외이며, 사용자가 명시적으로 "해줘", "만들어줘", "구현해줘", "진행해줘" 등 실행을 지시할 때만 한다.

다음과 같은 발언은 모두 **백로그 기록 대상**이다:
- 아이디어 언급 ("~하면 좋겠다", "~도 가능할까")
- 해야 할 일 언급 ("~도 해야 하는데", "~가 필요해")
- 질문 형태의 제안 ("~는 어떻게 하지?", "~를 넣어야 하나?")
- 가벼운 언급 ("나중에 ~도 봐야 해", "~도 있으면 좋겠네")
- 비교/탐색 ("~랑 비교하면", "다른 방법은 없을까")

**자동 행동:**
1. 바로 구현/브레인스토밍을 시작하지 않는다
2. `specs/backlog/YYYY-MM-DD-{슬러그}.md`에 간결하게 기록한다
3. 사용자에게 "백로그에 기록했습니다." 라고 짧게 안내한다
4. 현재 하던 작업이 있으면 그것을 계속한다

**"다음 할 작업은?" 질문 시:**
사용자가 다음 작업을 물어보면:
1. `specs/todo/` 에 대기 중인 spec이 있으면 그것을 먼저 제안한다
2. todo가 없으면 `specs/backlog/`의 항목을 우선순위 순으로 제안한다
3. 백로그도 없으면 `pnpm run audit:harness`로 프로젝트 하네스 점검 후 개선 항목을 제안한다

### 2. README 이중 언어 동기화 (자동 적용)

**README.md (영어)와 README.ko.md (한국어)는 항상 동기화 상태를 유지한다.**

README.md를 수정하면 반드시 README.ko.md도 동일한 내용으로 업데이트한다.
- 새 스킬/기능이 추가되면 양쪽 모두에 반영
- 구조, 섹션 순서, 코드 블록은 동일하게 유지
- 영어가 기본, 한국어는 번역본

### 3. 프로젝트 구조

```
├── rulebased-harness/               # 플러그인 폴더
│   ├── .claude-plugin/plugin.json   # 플러그인 매니페스트
│   ├── docs/                        # 공유 문서 (skills/commands 공통)
│   │   ├── audit.md
│   │   ├── init.md
│   │   ├── recommend.md
│   │   └── eval-log.md
│   ├── skills/                      # Claude Code slash 커맨드 (docs/ 링크)
│   ├── commands/                    # Claude Code slash 커맨드 (docs/ 링크)
│   ├── agents/                      # 하네스 감사 에이전트 (독립 내용)
│   ├── hooks/                       # 자동화 훅
│   └── reference/                   # 평가 기준 (index → guide → criteria)
├── references/                      # 외부 레퍼런스 링크 모음
├── packages/
│   ├── core/                        # 핵심 로직 (auditor, recommender 등)
│   └── cli/                         # CLI 엔트리포인트
├── specs/ / tasks/                  # 이 프로젝트 워크플로우
└── docs/                            # 프로젝트 문서
```

### 4. 코딩 규칙

- `strict: true`, any 금지
- ESM: import 경로에 `.js`, `import type` 사용
- 외부 runtime 의존성 없음 (Node.js 내장 모듈만)
- 테스트: `tests/` 디렉토리, fixture 기반

### 5. 버전 관리 (자동 적용)

**플러그인/마켓플레이스 관련 변경 시 반드시 버전을 올린다.**

다음 파일의 `version`을 동시에 올려야 함:
- `package.json` (루트)
- `packages/core/package.json`
- `packages/cli/package.json`
- `packages/plugin-claude/.claude-plugin/plugin.json`
- `plugins/rulebased/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

patch 단위(x.y.Z)로 올리고, 기능 추가 시 minor(x.Y.0).

### 6. 외부 레퍼런스 관리 규칙

**외부 콘텐츠의 원본을 이 레포에 복사·보관하지 않는다.**

- `references/` 디렉토리에 **링크와 요약만** 저장한다 (업체명, 제목, 1-2줄 요약, URL)
- 원본 블로그/문서의 내용을 그대로 옮기지 않는다 (저작권·라이선스 준수)
- 외부 자료를 **2차 가공**한 데이터(비교표, 분석, 체크리스트 도출 등)는 이 레포에 보관할 수 있다
- 새로운 레퍼런스를 발견하면 `references/harness-engineering/`에 업체별 파일로 추가한다

### 7. .md 문서 작성 시 frontmatter 활용 (자동 적용)

**이 프로젝트에서 .md 파일을 생성·수정할 때 YAML frontmatter를 반드시 포함한다.**

```yaml
---
name: 문서 이름
description: 이 문서의 목적을 한 줄로 설명
type: spec | reference | skill | agent | backlog
created: YYYY-MM-DD
---
```

- **모든 .md 파일**에 frontmatter를 작성한다 (README.md, AGENTS.md, CLAUDE.md 등 프로젝트 루트 문서는 제외)
- `name`, `description`은 필수. 그 외 필드는 문서 유형에 따라 추가한다
- 스킬(`skills/*/SKILL.md`)은 Claude Code 공식 스펙에 따라 `name`, `description` 필수
- specs/backlog 문서: `type`, `created`, `priority` (high/medium/low)
- references 문서: `type: reference`, `source` (출처 도메인)
- frontmatter는 파서가 메타데이터로 활용할 수 있으므로, 본문에 중복 기재하지 않는다

### 8. skills/commands 공유 문서 원칙 (자동 적용)

**`skills/*/SKILL.md`와 `commands/*.md`는 동일한 공유 문서(`docs/*.md`)를 참조한다.**

```
rulebased-harness/
├── docs/             ← 공유 문서 (실제 내용)
│   ├── audit.md
│   ├── init.md
│   ├── recommend.md
│   └── eval-log.md
├── skills/*/SKILL.md ← 링크만 (frontmatter + docs/*.md 참조)
├── commands/*.md     ← 링크만 (frontmatter + docs/*.md 참조)
└── agents/           ← 에이전트 전용 (독립 내용 가능)
```

- 기능 로직을 수정할 때 `docs/*.md`만 수정하면 skills와 commands에 동시 반영된다
- `skills/*/SKILL.md`와 `commands/*.md`에는 frontmatter + `docs/*.md` 링크 + `$ARGUMENTS`만 포함한다
- **agents만 예외**: agents는 자율 작업 특성상 독립된 내용을 가질 수 있다 (서브에이전트 위임 등)
- 향후 agents에만 적용할 차이가 있을 때 agents 정의 파일만 별도로 수정한다

### 9. 플러그인 평가 기준 데이터 원칙 (자동 적용)

**`rulebased-harness/reference/`의 평가 기준은 init·audit·recommend 스킬이 공통으로 사용하는 중립 데이터이다.**

- 특정 스킬의 관점에 치우치지 않는다 (audit 전용 문구, init 전용 문구 금지)
- 각 항목은 **What**(무엇), **Why**(왜 중요한지), **How to Check**(확인 방법), **Fix**(개선 방법)을 포함한다
- 코드/설정 예시는 특정 프레임워크에 종속되지 않는 범용 스니펫으로 작성한다
- 예시가 필요한 경우 guide-*.md(B 파일)에 담고, 항목 정의 *.md(A 파일)는 간결하게 유지한다
- 3단계 참조 구조를 유지한다: `index.md` → `guide-*.md` → `*.md`

### 10. 흔한 실수

1. ESM에서 `__dirname` 불가 → `fileURLToPath(import.meta.url)` 사용
2. ts-jest에서 `import.meta.dirname` 미지원 → `fileURLToPath` 패턴 사용
3. Jest ESM: `node --experimental-vm-modules` 필수
4. 테스트 fixture 경로는 `tests/fixtures/`에 실제 파일로 준비

## 라우팅

| 영역 | 인덱스 | 내용 |
|------|--------|------|
| 문서 | `docs/index.md` | 시작하기, 아키텍처, 설치, 사용법 |
| 공유 문서 | `rulebased-harness/docs/` | skills/commands 공통 문서 (audit, init, recommend, eval-log) |
| 스킬/커맨드 | `rulebased-harness/skills/`, `commands/` | docs/ 링크 래퍼 |
| Audit 기준 인덱스 | `rulebased-harness/reference/index.md` | 8 카테고리, 36항목 → guide-*.md → *.md |
| 외부 레퍼런스 | `references/harness-engineering/` | 업체별 공식 문서/블로그 링크 모음 (14개 파일) |
