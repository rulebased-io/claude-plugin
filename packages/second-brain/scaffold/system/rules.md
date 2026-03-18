---
title: 세컨드 브레인 전체 규칙
date: {{DATE}}
tags: [rules, principles, standards]
type: permanent
related: [[design-principles]], [[glossary]]
---

# 세컨드 브레인 전체 규칙

> 모든 결정의 기준. 새로운 기능, 구조, 아이디어가 이 규칙과 충돌하면 규칙을 먼저 검토한다.

---

## 1. 구조 원칙

### 1-1. SSOT (Single Source of Truth)
- 세컨드 브레인은 하나의 진실 원본이다
- `.md` 파일이 메타데이터의 원본이다
- 파일을 삭제하면 그 데이터는 사라진다

### 1-2. 파일이 Source of Truth
- frontmatter가 메타데이터의 원본이다
- SQLite 인덱스, 벡터 DB 등은 캐시다

### 1-3. 이식성
- 사용자는 언제든 이 시스템을 떠날 수 있어야 한다
- `.md` 파일만 있으면 어떤 환경에서도 읽을 수 있어야 한다

### 1-4. 단순함 우선
- 기능을 추가하기 전에 "이것이 없으면 안 되는가"를 먼저 묻는다

---

## 2. 기록 위치 원칙

| 유형 | 위치 |
|------|------|
| 외부 유입·자동 캡처 | `inbox/` |
| 직접 작업 (노트, 프로젝트, 코드) | `workspace/` |
| 아이디어 | `ideas/` |
| 일상 회고 | `journal/` |
| 지속 관리 영역 | `areas/` |
| 비활성 보관 | `archives/` |

---

## 3. 파일 규칙

### 노트 frontmatter 기본 형식
```yaml
---
title:
date: YYYY-MM-DD
tags: []
type:
source:
related: []
---
```

---

## 4. Claude 행동 규칙

- 날카롭게 응답한다. 동조 전에 빠진 것, 모순, 위험 요소를 먼저 짚는다
- 파일 이동/삭제: 반드시 사용자에게 먼저 확인
- 기존 노트를 수정할 때는 반드시 먼저 읽고 파악한 뒤 수정
