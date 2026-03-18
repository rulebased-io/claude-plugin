---
name: post-init-migration
description: init/recommend에 Post-Scaffold Reconciliation 단계 추가 — 구조 존재뿐 아니라 콘텐츠 유무까지 평가
type: backlog
created: 2026-03-18
priority: high
---

# Feature Request: Post-Init Migration & Reconciliation

## Problem

현재 init과 recommend는 구조 존재 여부(structural presence)만 검사한다.

- `wf-backlog`: "specs/backlog/ 디렉토리가 존재하는가?" → .gitkeep 있으면 pass
- 빈 폴더 + .gitkeep만 생성하고 "항목 통과"로 처리됨
- 프로젝트에 이미 존재하는 백로그, 작업 목록, 스펙 등이 새 구조로 옮겨지지 않음
- 사용자는 빈 하네스 구조와 실제 작업이 담긴 기존 파일을 이중으로 관리하게 됨

## Root Cause

init/recommend의 역할이 "scaffolding"에서 멈추고, "adoption"까지 이어지지 않음.

## Proposed Changes

### 1. init — Post-Scaffold Reconciliation 단계 추가

구조를 생성한 뒤, 프로젝트 내 기존 자산을 탐색하여 마이그레이션 후보를 제시.

```
[init workflow]
1. Create directories (현재와 동일)
2. NEW: Scan for existing artifacts
   - exec-plans/, plans/, TODO.md, backlog.md, roadmap.md 등 탐색
   - 발견된 파일에서 미완료 항목 추출
3. NEW: Suggest migration
   - "remaining-work.md에 미완료 작업 3건이 있습니다."
   - "specs/backlog/에 개별 spec으로 분리하시겠습니까? [auto-fix]"
4. NEW: Convert format (사용자 승인 시)
   - 기존 항목을 TEMPLATE.md 형식으로 변환하여 생성
   - 원본 파일은 보존
```

### 2. audit — 3단계 평가 등급 도입

| 등급 | 의미 |
|------|------|
| pass | 구조 존재 + 실제 콘텐츠 있음 |
| hollow | 구조 존재하나 비어 있음 — 마이그레이션 또는 콘텐츠 작성 필요 |
| fail | 구조 자체가 없음 |

### 3. 기대 효과

사용자가 하네스를 도입한 직후부터 기존 작업 흐름이 자연스럽게 새 구조 안으로 흡수됨.
