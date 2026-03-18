---
title: Permission Set 운영 가이드
date: {{DATE}}
tags: [brains, federation, permission]
type: permanent
---

# Permission Set 운영 가이드

> 외부 에이전트가 이 세컨드 브레인에 접근할 때 사용하는 권한 템플릿.

---

## 개념

**Permission Set**은 외부 에이전트에게 열어줄 경로와 행동 범위를 정의한다.

- 기본 정책은 `deny` — 명시적으로 열지 않으면 아무 것도 접근 불가
- 소유자({{OWNER_NAME}})가 어떤 Permission Set을 적용할지 선택
- 세션이 끝나면 권한은 자동 폐기

---

## 구조

```
brains/
├── README.md                    # 이 파일
├── mentor-session/
│   └── template.md              # 멘토링 세션용 Permission Set
└── project-collab/
    └── template.md              # 프로젝트 협업용 Permission Set
```

---

## Permission Set 작성 규칙

각 `template.md`에 다음을 포함:

```yaml
---
name: Permission Set 이름
description: 용도 한 줄 설명
type: permission-set
---
```

### 필수 섹션

1. **목적** — 이 Permission Set이 필요한 상황
2. **허용 경로** — 에이전트가 읽기/쓰기할 수 있는 디렉토리
3. **금지 사항** — 절대 하면 안 되는 행동
4. **Role 조합 힌트** — 이 세션에서 Agent가 맡을 역할 (AGENTS.md 참조)

---

## 사용 흐름

```
1. 외부 에이전트 → BRAIN.md 읽기 요청
2. 소유자가 Permission Set 선택 (예: "mentor-session")
3. 시스템이 template.md 기반으로 에이전트 Role 즉석 조합
4. 에이전트가 허용 범위 내에서 작업
5. 세션 종료 → Role 폐기, 접근 권한 소멸
```

---

## 새 Permission Set 추가

1. `brains/` 아래 새 폴더 생성 (예: `brains/code-review/`)
2. `template.md` 작성 (위 규칙 참고)
3. `BRAIN.md`의 Permission Sets 테이블에 등록
