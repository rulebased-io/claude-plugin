# @rulebased/harness

AI 에이전트를 위한 하네스 구축 도구. 프로젝트의 하네스 엔지니어링 구축 정도를 평가하고, 빠진 요소를 추천하고, 자동으로 생성합니다.

> **하네스 엔지니어링** = 에이전트의 행동을 제약(Constraints)하고, 컨텍스트(Context)를 제공하고, 결과를 평가(Eval)하는 시스템 설계. [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) 참고.

[English](README.md)

## 설치

### Claude Code

1. 마켓플레이스를 추가한 후 플러그인을 설치합니다:

```bash
# 1단계: 마켓플레이스 추가 (Claude Code 내에서)
/plugin marketplace add rulebased-io/harness

# 2단계: 플러그인 설치
/plugin install rulebased@rulebased-harness
```

2. 또는 개발 중 로컬에서 테스트:

```bash
claude --plugin-dir ./packages/plugin-claude
```

설치 후 사용 가능한 slash 커맨드:

```
/rulebased:harness-audit      # 하네스 구축 정도 점검 (34개 체크, 0-100 점수)
/rulebased:harness-score      # 카테고리별 상세 점수 리포트
/rulebased:harness-init       # 하네스 구조 초기화
/rulebased:harness-recommend  # 빠진 하네스 요소 추천
/rulebased:harness-eval-log   # 대화 로그 부합도 평가
```

플러그인에는 **Stop hook**이 포함되어 있어, 10회 이상의 에이전트 턴이 있는 세션 종료 시 자동으로 부합도를 평가합니다.

### skills.sh

```bash
# 전체 스킬 설치
npx skills add rulebased-io/harness

# 특정 스킬만 설치
npx skills add rulebased-io/harness --skill harness-audit
```

### CLI (npm)

```bash
npx @rulebased/cli audit
npx @rulebased/cli score
npx @rulebased/cli init
npx @rulebased/cli recommend
npx @rulebased/cli eval-log
```

## 스킬

### harness-audit

[OpenAI Codex 하네스 기준](https://openai.com/index/unlocking-the-codex-harness/)에 따라 34개 항목을 검사하고 0-100 점수를 매깁니다.

**점검 카테고리:**

| 카테고리 | 점검 내용 |
|----------|-----------|
| Context Engineering | AGENTS.md (간결성, 빌드 명령어, 아키텍처, 실수방지, 보안, 점진적 공개), ARCHITECTURE.md, 서브디렉토리 AGENTS.md, docs/, CLAUDE.md |
| Bootstrap & Task Entry | 원커맨드 셋업, build/test/lint 명령어, lockfile |
| Constraints & Enforcement | 린터, 포맷터, pre-commit 훅, TypeScript strict, 아키텍처 경계 테스트 |
| Eval & CI | CI 파이프라인, CI lint 단계, 테스트 스위트, eval 데이터셋 |
| Entropy Management | 기술 부채 트래커, 레포 내 문서화 |
| Safety & Secrets | .gitignore, .env 차단, 보안 문서, 시크릿 미커밋 |
| Knowledge Management | ADRs(Architecture Decision Records), README |
| Workflow | specs/, tasks/ 디렉토리 |

### harness-score

카테고리별 상세 점수 리포트. 각 하네스 영역이 얼마나 구현되어 있는지 보여줍니다.

```
## Harness Score Report

[################----]  **81/100 (B)**

### Context Engineering  [####################]  100/100  (9/9)
- [PASS] AGENTS.md exists
- [PASS] AGENTS.md includes build/test commands
...

### Constraints  [--------------------]  0/100  (0/2)
- [FAIL] Linter configuration exists
  -> ESLint, Biome, ruff 등의 린터 설정을 추가하세요.
```

### harness-init

프로젝트에 하네스 구조를 초기화합니다.

생성되는 파일: `AGENTS.md`, `CLAUDE.md`, `.harness.json`, `specs/`, `tasks/`, `.gitignore`

**프리셋:**
- `standard` (기본) — 34개 전체 체크 활성화
- `minimal` — 필수 체크만 (AGENTS.md + 빌드 명령어)

`.harness.json`으로 커스터마이즈:
```json
{
  "preset": "standard",
  "checks": { "disable": ["eval-dataset", "cst-precommit"] }
}
```

### harness-recommend

빠진 하네스 요소를 우선순위별로 추천하고 자동 생성할 수 있습니다.

### harness-eval-log

Claude Code 대화 기록(transcript)을 분석하여 하네스 부합도를 평가합니다.

**평가 기준:**
- 사람 턴 수 (적을수록 자율적)
- 자율성 비율 (에이전트 턴 / 전체 턴)
- 빌드/테스트 실행 (Bash 도구 사용)
- 도구 다양성 (사용한 도구 종류 수)
- 세션 시간

**자동 실행:** 10회 이상의 에이전트 턴이 있는 세션 종료 시 Stop hook으로 자동 실행됩니다.

## 프로젝트 구조

```
@rulebased/harness (pnpm 모노레포)
├── skills/                      # 스킬 (skills.sh + Claude Code)
│   ├── audit/SKILL.md
│   ├── score/SKILL.md
│   ├── init/SKILL.md
│   ├── recommend/SKILL.md
│   └── eval-log/SKILL.md
├── packages/
│   ├── core/                    # @rulebased/core - auditor, recommender, initializer, transcript parser
│   ├── cli/                     # @rulebased/cli - CLI 엔트리포인트
│   └── plugin-claude/           # @rulebased/plugin-claude - Claude Code 플러그인 (훅, 에이전트)
├── specs/                       # 스펙 워크플로우 (todo/done/backlog)
├── tasks/                       # 태스크 워크플로우 (todo/done)
└── docs/                        # 문서
```

## 개발

```bash
pnpm install
pnpm build
pnpm test          # 26개 테스트
```

## 점수 체계

| 심각도 | 가중치 | 예시 |
|--------|--------|------|
| Critical | 3 | AGENTS.md 존재, build/test/lint 명령어, CI 파이프라인, .gitignore |
| Important | 2 | 아키텍처 설명, 린터, 포맷터, pre-commit, lockfile, ADRs |
| Nice-to-have | 1 | 워크플로우 폴더, eval 데이터셋, 보안 문서, 기술 부채 트래커 |

등급: A (90+), B (75+), C (60+), D (40+), F

## 로드맵

- [x] npm 배포 — `@rulebased/core`, `@rulebased/cli`
- [ ] 온보딩 위자드 — 프로젝트 타입별 대화형 세팅 (frontend, backend, fullstack)
- [ ] 내장 템플릿 — 타입별 AGENTS.md, 훅, audit 프리셋
- [ ] 하네스 가져오기 — 다른 프로젝트의 하네스를 비교 후 적용
- [ ] 멀티 에이전트 플러그인 — Codex, Cursor 지원

## 라이선스

MIT
