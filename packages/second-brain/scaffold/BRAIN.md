# BRAIN.md

> 외부 에이전트가 이 세컨드 브레인에 연결할 때 가장 먼저 읽는 파일.

---

## Identity

```yaml
owner: {{OWNER_NAME}}
language: ko
description: 개인 세컨드 브레인. 지식, 프로젝트, 아이디어, 코드를 관리.
```

---

## 기본 접근 정책

```yaml
default: deny
```

명시적으로 열린 Permission Set 외에는 모든 경로 접근 불가.

---

## Permission Sets

**Permission Set 정의 위치**: `brains/템플릿이름/template.md`

| 템플릿 | 설명 | 접근 |
|--------|------|------|
| `mentor-session` | 멘토에게 학습 기록·아이디어 공유 | 읽기 전용 |
| `project-collab` | 프로젝트 협업자에게 특정 프로젝트 범위 공유 | 읽기+쓰기 (프로젝트 폴더 한정) |

---

## Role 조합 규칙

외부 에이전트의 Role은 Permission Set 기반으로 즉석 조합된다.

1. 소유자가 Permission Set 선택 → 허용 경로와 권한 확정
2. Permission Set의 "Role 조합 힌트" 참조 → AGENTS.md의 Agent 역할 중 해당 역할만 활성화
3. 복수 Permission Set 동시 적용 가능 — 권한은 합집합, 금지는 교집합 (하나라도 금지면 금지)

### 제한

- `system/` 디렉토리: 모든 외부 에이전트 쓰기 금지 (읽기만 허용)
- `brains/` 디렉토리: 모든 외부 에이전트 접근 금지
- `BRAIN.md`, `AGENTS.md`, `CLAUDE.md`: 수정 금지

---

## 외부 에이전트 SKILL

외부 에이전트가 연결 시 사용할 수 있는 SKILL:

| SKILL | 설명 | 조건 |
|-------|------|------|
| 읽기 | 허용된 경로의 파일 읽기 | Permission Set에 경로 포함 |
| 검색 | frontmatter 기반 검색 | Permission Set에 경로 포함 |
| 작성 | 허용된 경로에 새 파일 생성 | 쓰기 권한 있는 경우만 |
| 연결 제안 | 관련 항목 링크 제안 | 읽기 권한 있는 경우 |

소유자 전용 SKILL (외부 에이전트 사용 불가):
- 파일 이동, 삭제, 아카이브
- Permission Set 생성·수정
- `system/` 파일 수정

---

## 연결 프로토콜

```
1. 외부 에이전트가 BRAIN.md 읽기 요청
2. 소유자가 어떤 Permission Set을 열지 선택
3. 시스템이 선택된 Permission Set + Role 조합 규칙 기반으로 Role 즉석 조합
4. 에이전트가 허용된 범위 내에서 작업
5. 에이전트는 작업 전 허용 경로를 먼저 확인
6. 완료 또는 소유자 종료 → Role 폐기, 접근 권한 소멸
```

---

## 설계 결정

이 구조의 설계 근거는 `system/design-principles.md` 참조.
Federation과 Permission Set의 용어 정의는 `system/glossary.md` 참조.
