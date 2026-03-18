---
name: Monorepo structure with pnpm workspaces
description: packages/* 구조로 다중 플러그인을 하나의 마켓플레이스에서 관리
type: reference
created: 2026-03-19
status: accepted
---

# ADR-001: Monorepo Structure with pnpm Workspaces

## Context

단일 플러그인(rulebased-harness)으로 시작했으나, second-brain 등 추가 플러그인을 같은 마켓플레이스에서 배포하려면 모노레포 구조가 필요했다.

## Decision

- pnpm workspaces로 `packages/*` 구조 채택
- 루트 `package.json`은 private workspace root (`rulebased-plugin`)
- 각 플러그인은 독립 패키지로 `packages/<name>/`에 위치
- 마켓플레이스는 `.claude-plugin/marketplace.json`에서 모든 플러그인을 등록

## Consequences

- 플러그인 간 코드 공유 가능 (향후 shared 패키지)
- 각 플러그인의 독립적 빌드/테스트/배포
- 버전 관리 시 변경된 플러그인별로 개별 bump 필요
