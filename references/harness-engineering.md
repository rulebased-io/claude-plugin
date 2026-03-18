---
name: harness-engineering-references
description: 외부 하네스 엔지니어링 공식 문서 및 블로그 링크 모음
type: reference
created: 2026-03-18
---

# Harness Engineering — 외부 레퍼런스 링크 모음

> **규칙**: 원본 콘텐츠를 복사하여 보관하지 않는다. 링크와 요약만 저장한다.
> 2차 가공 데이터(비교표, 분석 등)는 이 레포에 보관 가능.

---

## OpenAI

| 제목 | 요약 | 링크 |
|------|------|------|
| Harness engineering: leveraging Codex in an agent-first world | "하네스 엔지니어링" 개념을 정의. 소규모 팀이 Codex 에이전트만으로 100만줄+ 앱을 5개월간 구축한 사례. 스펙·품질 검증·워크플로우 가이드로 에이전트를 제어하는 하네스 구축법. | https://openai.com/index/harness-engineering/ |
| Unlocking the Codex harness: how we built the App Server | Codex App Server 아키텍처(양방향 JSON-RPC API) 기술 심층 분석. 코드 리뷰어, SRE 에이전트로 활용하는 팁. | https://openai.com/index/unlocking-the-codex-harness/ |
| Unrolling the Codex agent loop | Codex 내부 에이전트 루프(컨텍스트 읽기→계획→실행→반복) 설명. | https://openai.com/index/unrolling-the-codex-agent-loop/ |
| Custom instructions with AGENTS.md | Codex가 AGENTS.md를 읽는 방식(override, layering, 탐색 순서) 공식 가이드. | https://developers.openai.com/codex/guides/agents-md |

## Anthropic

| 제목 | 요약 | 링크 |
|------|------|------|
| Effective context engineering for AI agents | 컨텍스트 엔지니어링을 프롬프트 엔지니어링의 진화로 정의. 프롬프트·메모리·도구·데이터의 최적 토큰 조합으로 에이전트 행동을 제어. | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| Equipping agents for the real world with Agent Skills | Agent Skills 오픈 스탠다드 소개. SKILL.md frontmatter, 폴더 구조, 크로스 플랫폼 호환. | https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills |
| Claude Code Documentation | CLAUDE.md 규칙, 프로젝트 지시사항, 에이전트 스킬, 멀티 에이전트 오케스트레이션 공식 문서. | https://code.claude.com/docs/en/overview |

## Stripe

| 제목 | 요약 | 링크 |
|------|------|------|
| Minions: Stripe's one-shot, end-to-end coding agents (Part 1) | 자체 "미니언" 시스템. 에이전트마다 완전한 컨텍스트를 조립해 단일 LLM 콜로 CI 통과하는 PR 생산. 주당 1,300+ PR 머지. | https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents |
| Minions Part 2 | 아키텍처 상세, 컨텍스트 조립 방법, 원샷 에이전트 스케일링 교훈. | https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2 |

## GitHub

| 제목 | 요약 | 링크 |
|------|------|------|
| How to write a great agents.md | 2,500+ AGENTS.md 분석. 페르소나·명확한 커맨드·경계 설정·코드 예시가 효과적. "절대 시크릿 커밋 금지"가 가장 흔한 제약. | https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/ |
| Best practices for Copilot coding agent | `.github/copilot-instructions.md`, 경로별 `.instructions.md`, `.github/agents/` 에이전트 정의 공식 가이드. | https://docs.github.com/copilot/how-tos/agents/copilot-coding-agent/best-practices-for-using-copilot-to-work-on-tasks |
| About GitHub Copilot coding agent | Copilot 코딩 에이전트 개요. 이슈 자율 처리, 브랜치 생성, CI 연동 PR 제출. | https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent |

## Google

| 제목 | 요약 | 링크 |
|------|------|------|
| Architecting efficient context-aware multi-agent framework for production | 프로덕션 멀티 에이전트 시스템에서 컨텍스트 관리를 1급 아키텍처 관심사로 설계하는 방법. | https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/ |

## Manus

| 제목 | 요약 | 링크 |
|------|------|------|
| Context Engineering for AI Agents: Lessons from Building Manus | KV-cache 히트율을 가장 중요한 프로덕션 지표로 삼는 6가지 실용 원칙. 에이전트 프레임워크를 4번 재구축한 경험. | https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus |

## Martin Fowler / Thoughtworks

| 제목 | 요약 | 링크 |
|------|------|------|
| Harness Engineering (by Birgitta Bockeler) | OpenAI 하네스 엔지니어링 개념 분석. 스펙·품질 검증·워크플로우 가이드가 "하네스"이며, 이를 구축·유지하는 것이 사람의 역할. | https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html |

## AGENTS.md (오픈 스탠다드)

| 제목 | 요약 | 링크 |
|------|------|------|
| AGENTS.md 공식 사이트 | AGENTS.md 오픈 스탠다드 공식 페이지. Linux Foundation AAIF 관할. 60,000+ 레포 채택, Codex/Copilot/Cursor/Devin/Gemini CLI 등 지원. | https://agents.md/ |
| AGENTS.md GitHub 레포 | AGENTS.md 포맷 오픈소스 스펙 레포지토리. | https://github.com/agentsmd/agents.md |

## Linux Foundation / AAIF

| 제목 | 요약 | 링크 |
|------|------|------|
| Agentic AI Foundation (AAIF) 출범 | MCP(Anthropic), goose(Block), AGENTS.md(OpenAI) 세 프로젝트로 출범. AWS, Google, Microsoft 등 플래티넘 멤버. | https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation |
| OpenAI co-founds AAIF | OpenAI가 AGENTS.md를 AAIF에 기여한 공식 발표. | https://openai.com/index/agentic-ai-foundation/ |

## Block (Square)

| 제목 | 요약 | 링크 |
|------|------|------|
| Block Open Source Introduces codename goose | 오픈소스(Apache 2.0) 온머신 AI 에이전트. 파일 읽기/쓰기, 코드/테스트 실행, MCP 연동. AAIF 창립 프로젝트. | https://block.xyz/inside/block-open-source-introduces-codename-goose |

## Vercel

| 제목 | 요약 | 링크 |
|------|------|------|
| Vercel Agent Skills docs | Agent Skills 공식 문서. React 최적화, 웹 디자인 등 프로덕션 패턴을 AI 에이전트에 확장. | https://vercel.com/docs/agent-resources/skills |
| vercel-labs/agent-skills | 40+ 규칙(8 카테고리) React/Next.js 에이전트 스킬 컬렉션. `npx skills add`로 설치. | https://github.com/vercel-labs/agent-skills |

## Cursor

| 제목 | 요약 | 링크 |
|------|------|------|
| Cursor Agent Documentation | Cursor 에이전트 모드, `.cursor/rules/*.mdc` 프로젝트 규칙, 플랜 모드 공식 문서. | https://cursor.com/docs/agent/overview |

## Windsurf (Codeium)

| 제목 | 요약 | 링크 |
|------|------|------|
| Windsurf Documentation | `.windsurf/rules/*.md` 프로젝트 규칙, Memories/Cascade 시스템 공식 문서. | https://docs.windsurf.com/ |

## Shopify

| 제목 | 요약 | 링크 |
|------|------|------|
| Tobi Lutke on context engineering | Shopify CEO가 "컨텍스트 엔지니어링"을 대중화. AI 활용의 핵심은 추가 정보 없이 풀 수 있을 만큼 충분한 컨텍스트로 문제를 정의하는 것. | https://x.com/tobi/status/1909251946235437514 |
