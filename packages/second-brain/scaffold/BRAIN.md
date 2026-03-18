# BRAIN.md

> 외부 에이전트가 이 세컨드 브레인에 연결할 때 가장 먼저 읽는 파일.

---

## Identity

```yaml
owner: {{OWNER_NAME}}
language: ko
description: 개인 세컨드 브레인. 지식, 프로젝트, 아이디어, 개발 관련 노트.
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
| _아직 없음_ | | |

---

## 연결 프로토콜

```
1. 외부 에이전트가 BRAIN.md 읽기 요청
2. 소유자가 어떤 Permission Set을 열지 선택
3. 시스템이 선택된 Permission Set 기반으로 Role 즉석 조합
4. 에이전트가 허용된 범위 내에서 작업
5. 완료 또는 소유자 종료 → Role 폐기
```
