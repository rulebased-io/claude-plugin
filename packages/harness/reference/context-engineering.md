---
name: context-engineering
description: 컨텍스트 엔지니어링 평가 항목 — AGENTS.md 품질, 페르소나, 경계, 컨벤션
type: reference
created: 2026-03-18
---

# Context Engineering (8 items)

에이전트가 프로젝트를 이해하고 자율적으로 작업하기 위한 컨텍스트 품질.

---

### ctx-agents-exists
- **Weight**: → index.md 참조
- **What**: AGENTS.md 파일 존재 여부
- **Why**: 에이전트가 프로젝트를 이해하는 첫 진입점. 60,000+ 레포에서 채택된 오픈 스탠다드.
- **How to Check**: 프로젝트 루트에 `AGENTS.md` 파일 존재 확인
- **Fix**: `/rulebased-harness:init` 스킬로 생성하거나 수동 작성
- **Reference**: [OpenAI — Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)

---

### ctx-agents-build
- **Weight**: → index.md 참조
- **What**: AGENTS.md에 빌드/테스트 커맨드 포함 여부
- **Why**: 에이전트가 코드를 수정한 후 검증할 방법을 알아야 자율 작업이 가능. OpenAI 하네스 엔지니어링의 핵심 요소.
- **How to Check**: AGENTS.md 내에 `npm`, `yarn`, `pnpm`, `make`, `cargo`, `go` 등 빌드/테스트 커맨드 존재
- **Fix**: AGENTS.md에 `## 빌드 & 검증` 섹션 추가
- **Reference**: [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)

---

### ctx-agents-arch
- **Weight**: → index.md 참조
- **What**: AGENTS.md에 아키텍처/디렉토리 구조 설명 존재
- **Why**: 에이전트가 어떤 파일을 어디서 찾아야 하는지 모르면 탐색에 토큰을 낭비. Stripe Minions는 완전한 컨텍스트 조립이 핵심.
- **How to Check**: AGENTS.md에 디렉토리 트리, 레이어 설명, 모듈 구조 중 하나 이상 포함
- **Fix**: 프로젝트 구조 트리와 각 디렉토리의 역할을 AGENTS.md에 추가
- **Reference**: [Stripe — Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

---

### ctx-agents-pitfalls
- **Weight**: → index.md 참조
- **What**: AGENTS.md에 흔한 실수/주의사항 목록 존재
- **Why**: 에이전트가 같은 실수를 반복하지 않도록 방지. 경험적으로 가장 효과적인 하네스 요소 중 하나.
- **How to Check**: AGENTS.md에 "주의", "금지", "실수", "pitfall", "avoid" 등 경고성 내용 존재
- **Fix**: `## 흔한 실수` 섹션을 추가하고 프로젝트 특화 실수 목록 작성
- **Reference**: [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)

---

### ctx-agents-conventions
- **Weight**: → index.md 참조
- **What**: AGENTS.md에 코딩 컨벤션/스타일 가이드 명시
- **Why**: GitHub 2,500개 AGENTS.md 분석에서 "코드 예시가 산문보다 효과적"이라는 결론. 구체적 코드 패턴을 보여주는 것이 일관성 유지의 핵심.
- **How to Check**: AGENTS.md에 코딩 스타일, 네이밍, import 규칙, 타입 사용 등 컨벤션 섹션 존재
- **Fix**: `## 코딩 규칙` 섹션에 프로젝트의 스타일 가이드와 코드 예시 추가
- **Reference**: [GitHub — How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

---

### ctx-agents-persona
- **Weight**: → index.md 참조
- **What**: AGENTS.md에 에이전트의 역할/페르소나 정의
- **Why**: GitHub 분석에서 페르소나 설정이 에이전트 행동의 일관성을 높이는 핵심 패턴으로 확인됨.
- **How to Check**: AGENTS.md 상단에 에이전트의 역할, 전문 분야, 행동 원칙 등 페르소나 정의 존재
- **Fix**: AGENTS.md 상단에 "당신은 ~입니다" 또는 프로젝트에서의 역할 정의 추가
- **Reference**: [GitHub — How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

---

### ctx-agents-boundaries
- **Weight**: → index.md 참조
- **What**: AGENTS.md에 금지 행동/경계 명시
- **Why**: GitHub 분석에서 "절대 시크릿 커밋 금지"가 가장 흔한 제약. 명확한 경계 설정이 에이전트의 안전한 자율 작업을 가능하게 함.
- **How to Check**: AGENTS.md에 "하지 마라", "금지", "never", "do not" 등 제약 조건 존재
- **Fix**: `## 제약 사항` 또는 `## 금지 행동` 섹션 추가
- **Reference**: [GitHub — How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

---

### ctx-claude-exists
- **Weight**: → index.md 참조
- **What**: CLAUDE.md 파일 존재 여부
- **Why**: Claude Code가 프로젝트 진입 시 자동으로 읽는 파일. AGENTS.md로 라우팅하거나 Claude 특화 지시를 담음.
- **How to Check**: 프로젝트 루트에 `CLAUDE.md` 파일 존재 확인
- **Fix**: `/rulebased-harness:init` 스킬로 생성. 내용은 AGENTS.md 참조로 충분.
- **Reference**: [Anthropic — Claude Code Documentation](https://code.claude.com/docs/en/overview)
