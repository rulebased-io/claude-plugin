# @rulebased/harness

AI 에이전트를 위한 하네스 구축 도구. 프로젝트의 하네스 엔지니어링 구축 정도를 점검하고, 빠진 요소를 추천하고, 자동으로 생성합니다.

> **Harness Engineering** = 에이전트의 행동을 제약(Constraints)하고, 컨텍스트(Context)를 제공하고, 결과를 평가(Eval)하는 시스템 설계. [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) 참고.

## 설치

### skills.sh (권장)

40+ 에이전트 지원 (Claude Code, Cursor, Copilot 등)

```bash
# 전체 스킬 설치
npx skills add rulebased-io/harness

# 특정 스킬만
npx skills add rulebased-io/harness --skill harness-audit
```

### Claude Code Plugin

```bash
# Claude Code 내에서
/plugin install rulebased@marketplace-name
```

### CLI

```bash
npx rulebased-harness audit
npx rulebased-harness init
npx rulebased-harness recommend
```

## 스킬

### harness-audit

프로젝트의 하네스 구축 정도를 점검합니다. 17개 항목을 검사하고 0-100 점수를 매깁니다.

```bash
npx rulebased-harness audit

# 출력 예시:
# Score: 77/100 (B)
# Passed: 12/17 | Critical: 3/3
#
# [FAIL] 린터/포맷터 설정 없음
#   Fix: ESLint, Prettier, Biome 등의 설정 파일을 추가하세요.
```

**점검 항목:**

| 카테고리 | 점검 내용 |
|----------|-----------|
| Context Engineering | AGENTS.md, CLAUDE.md, 빌드 명령어, 아키텍처, 흔한 실수 |
| Constraints | 린터/포맷터, pre-commit 훅 |
| Eval | eval 데이터셋 |
| Workflow | specs/, tasks/ 폴더 |
| Build | 테스트/빌드 스크립트, CI/CD |
| Conventions | .editorconfig, TypeScript strict |
| Docs | README.md, .gitignore |

### harness-init

프로젝트에 하네스 구조를 초기화합니다.

```bash
npx rulebased-harness init

# 생성되는 파일:
# + AGENTS.md        (에이전트 규칙 - TODO 마커 포함)
# + CLAUDE.md        (AGENTS.md 참조)
# + specs/todo/      (스펙 워크플로우)
# + specs/done/
# + specs/backlog/
# + tasks/todo/      (태스크 워크플로우)
# + tasks/done/
# + .gitignore       (없는 경우)
```

이미 존재하는 파일은 건너뜁니다. `--force`로 덮어쓸 수 있습니다.

### harness-recommend

빠진 하네스 요소를 추천하고 자동 생성할 수 있습니다.

```bash
npx rulebased-harness recommend

# 출력 예시:
# ## Harness Recommendations (5개)
#
# ### High Priority
# - AGENTS.md 생성 [auto-fix] (medium)
# - 테스트 스크립트 추가 (small)
#
# ### Medium Priority
# - 린터/포맷터 설정 추가 (small)
# - README.md 작성 (small)
```

## 프로젝트 구조

```
@rulebased/harness (pnpm monorepo)
├── skills/                      # 스킬 (skills.sh + Claude Code)
│   ├── audit/SKILL.md
│   ├── init/SKILL.md
│   └── recommend/SKILL.md
├── packages/
│   ├── core/                    # @rulebased/core - 핵심 로직
│   ├── cli/                     # @rulebased/cli - CLI
│   └── plugin-claude/           # @rulebased/plugin-claude - Claude Code 플러그인
├── specs/                       # 스펙 워크플로우
├── tasks/                       # 태스크 워크플로우
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
| Critical | 3 | AGENTS.md 존재, 빌드 명령어, 테스트 스크립트 |
| Important | 2 | 아키텍처 설명, 린터, TypeScript strict |
| Nice-to-have | 1 | 워크플로우 폴더, eval, pre-commit |

등급: A(90+), B(75+), C(60+), D(40+), F

## License

MIT
