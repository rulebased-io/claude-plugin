---
name: guide-context-engineering
description: 컨텍스트 엔지니어링 평가 가이드 — 8항목 평가 방법론, 점수 산정, 개선 전략
type: reference
created: 2026-03-18
---

# Context Engineering — 평가 가이드

에이전트가 프로젝트를 이해하고 자율적으로 작업하기 위한 컨텍스트 품질을 평가한다.

> 항목별 상세 정의(What, Why, How to Check, Fix, Reference)는 [context-engineering.md](context-engineering.md) 참조.

## 왜 중요한가

OpenAI 하네스 엔지니어링의 첫 번째 기둥. Stripe는 "완전한 컨텍스트를 조립해 단일 LLM 콜로 PR 생산"하며, Shopify CEO는 "추가 정보 없이 풀 수 있을 만큼 충분한 컨텍스트로 문제를 정의하는 것"이 AI 활용의 핵심이라 정의. AGENTS.md는 이 컨텍스트의 중심 문서.

## 평가 항목 요약

> 가중치(W)의 정의는 [index.md](index.md) Summary Table이 SSOT이다.

| ID | Item | W |
|----|------|---|
| ctx-agents-exists | AGENTS.md 존재 | 3 |
| ctx-agents-build | 빌드 커맨드 포함 | 3 |
| ctx-agents-arch | 아키텍처 설명 | 2 |
| ctx-agents-pitfalls | 흔한 실수 목록 | 2 |
| ctx-agents-conventions | 코딩 컨벤션 | 2 |
| ctx-agents-persona | 에이전트 페르소나 | 1 |
| ctx-agents-boundaries | 금지 행동/경계 | 2 |
| ctx-claude-exists | CLAUDE.md 존재 | 2 |

**만점**: 17점

## 평가 방법

1. AGENTS.md 파일 존재 여부 확인 → 없으면 critical 2개(6점) 즉시 실패
2. AGENTS.md 내용을 읽고 각 섹션(빌드, 아키텍처, 실수, 컨벤션, 경계) 존재 확인
3. CLAUDE.md 존재 확인
4. 페르소나 정의 확인 (AGENTS.md 상단에 역할/전문 분야 기술)

## AGENTS.md 권장 구조

아래는 각 항목을 충족하는 AGENTS.md의 권장 섹션 구조이다. 프로젝트 유형에 따라 조정한다.

```markdown
# AGENTS.md

(ctx-agents-persona)
당신은 이 프로젝트의 백엔드 엔지니어입니다. API 설계와 데이터 모델링에 집중합니다.

## 빌드 & 검증 (ctx-agents-build)

\`\`\`bash
npm install        # 의존성 설치
npm run build      # TypeScript → dist/
npm test           # 테스트 실행
npm run lint       # 린트 검사
\`\`\`

## 프로젝트 구조 (ctx-agents-arch)

\`\`\`
├── src/
│   ├── api/       # REST 엔드포인트
│   ├── models/    # 데이터 모델
│   ├── services/  # 비즈니스 로직
│   └── utils/     # 유틸리티
├── tests/         # Jest 테스트
└── docs/          # 문서
\`\`\`

## 코딩 규칙 (ctx-agents-conventions)

- TypeScript `strict: true`, `any` 금지
- 함수명: camelCase, 타입명: PascalCase
- import 순서: 내장 → 외부 → 내부 → 타입

좋은 예:
\`\`\`typescript
import type { Request } from 'express';
import { userService } from '../services/user.js';
\`\`\`

나쁜 예:
\`\`\`typescript
import {userService} from "../services/user"
import {Request} from "express"
\`\`\`

## 흔한 실수 (ctx-agents-pitfalls)

1. ESM에서 `__dirname` 불가 → `fileURLToPath(import.meta.url)` 사용
2. DB 쿼리에 raw string 사용 금지 → 항상 parameterized query
3. 환경 변수를 코드에 하드코딩하지 않음 → `process.env` 사용

## 금지 행동 (ctx-agents-boundaries)

- `.env` 파일이나 시크릿을 절대 커밋하지 않는다
- `node_modules/`를 절대 커밋하지 않는다
- 기존 API의 응답 스키마를 변경하지 않는다 (breaking change 금지)
- 테스트 없이 코드를 커밋하지 않는다
```

## 좋은 예 vs 나쁜 예

### ctx-agents-pitfalls — 흔한 실수

**나쁜 예** (추상적, 실행 불가):
```
- strict 모드를 사용하세요
- 에러 핸들링을 잘 하세요
- 테스트를 작성하세요
```

**좋은 예** (구체적, 코드 포함):
```
1. ESM에서 `__dirname` 불가 → `fileURLToPath(import.meta.url)` 사용
2. `async` 함수에서 에러를 삼키지 말 것:
   나쁜 예: `try { await fn() } catch {}`
   좋은 예: `try { await fn() } catch (e) { logger.error(e); throw e; }`
```

### ctx-agents-conventions — 코딩 컨벤션

**나쁜 예** (산문만, 해석 여지):
```
일관된 코딩 스타일을 유지하세요. 변수명은 명확하게 짓습니다.
```

**좋은 예** (패턴 + 코드):
```
- 함수명: camelCase (`getUserById`)
- 타입/인터페이스: PascalCase (`UserResponse`)
- 상수: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- 파일명: kebab-case (`user-service.ts`)
```

## 등급 기준

- **A**: 8/8 항목 통과 (모든 섹션이 구체적이고 코드 예시 포함)
- **B**: critical + important 항목 통과 (7/8)
- **C**: critical 항목 통과 + important 일부
- **F**: AGENTS.md 없음

## 개선 전략

1. **즉시**: `/rulebased-harness:init` 스킬로 AGENTS.md 스캐폴딩 생성
2. **단기**: 빌드 커맨드, 아키텍처 트리, 흔한 실수 섹션 채우기
3. **중기**: 코딩 컨벤션에 코드 예시 추가, 금지 행동 목록 작성
4. **장기**: 페르소나 정의, 주기적 AGENTS.md 갱신 워크플로우 구축

## 참고 사례

- **GitHub 분석**: 2,500개 AGENTS.md에서 "페르소나 + 명확한 커맨드 + 경계 + 코드 예시"가 가장 효과적 패턴
- **Stripe**: 에이전트마다 완전한 컨텍스트를 조립해 원샷 PR 생산
- **Manus**: 에이전트 프레임워크를 4번 재구축하며 컨텍스트 완성도가 핵심임을 확인
