---
title: 세컨드 브레인 전체 규칙
date: {{DATE}}
tags: [rules, principles, standards]
type: permanent
related: [[design-principles]], [[glossary]], [[standard-schema]]
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

## 2. 스키마 규칙

모든 노트는 `system/standard-schema.md`에 정의된 Storage Schema를 따른다.

### frontmatter 기본 형식
```yaml
---
title: string
date: YYYY-MM-DD
tags: string[]
type: fleeting | literature | permanent | idea | journal | snippet | til
source: string          # 선택
related: wikilink[]     # 선택
---
```

### 파일명 규칙
- 일반: `YYYY-MM-DD-slug.md` (slug: 영문 소문자+하이픈, 3~60자)
- journal: `YYYY-MM-DD.md` (날짜만)

---

## 3. 기록 위치 원칙

| 유형 | 위치 | 설명 |
|------|------|------|
| 외부 유입·자동 캡처 | `inbox/` | 정리 전 임시 저장. 7일 내 분류 |
| 직접 작업 (노트, 프로젝트, 코드) | `workspace/` | 능동적으로 만드는 모든 것 |
| 아이디어 | `ideas/` | seed→growing→ripe 생명주기 |
| 일상 회고 | `journal/` | 일기, 감정, 에너지 기록 |
| 지속 관리 영역 | `areas/` | 역할, 건강, 재정 등 상시 관심사 |
| 비활성 보관 | `archives/` | 완료·폐기된 프로젝트와 노트 |

---

## 4. 캡처 규칙 (CODE: Capture)

- 캡처는 빠르게 — 형식·분류·품질을 신경 쓰지 않는다
- 모든 외부 유입은 `inbox/`를 거친다
- inbox는 정기적으로 비운다 (최대 7일)
- 분류 후 적절한 위치로 이동하거나 삭제

---

## 5. 노트 품질 규칙 (Zettelkasten)

### 원자성
- 노트 하나에 아이디어 하나
- 너무 길면 쪼갠다. 너무 짧으면 합칠 필요는 없다

### 자립성
- 맥락 없이도 이해 가능한 완전한 문장으로 작성
- "위 내용 참고" 같은 암시적 참조 금지

### 연결성
- 관련 노트가 있으면 `[[wiki-link]]`로 연결
- permanent 노트는 최소 1개 이상 연결 권장
- 3개 이상 연결된 클러스터 → MOC 생성 고려

### Progressive Summarization (Distill)
- 문헌 노트는 핵심 아이디어를 자신의 말로 요약
- **볼드**로 핵심 문장 표시 → 나중에 빠르게 스캔 가능
- `## 핵심 아이디어` 섹션으로 1-3줄 요약 추가

---

## 6. SKILL 규칙

> SKILL = 세컨드 브레인의 기능 단위. Claude 플러그인 스킬이 SKILL을 실행한다.

### 추상화 경계
- **SKILL 쪽**: 노트 생성·수정·검색·연결 로직
- **클라이언트 쪽**: UI, 동기화, 렌더링
- SKILL은 Transit Schema로 노트를 전달하고, 클라이언트가 Storage Schema로 저장

### SKILL이 지켜야 할 것
- 항상 `standard-schema.md`의 스키마를 따른다
- 파일 생성 시 frontmatter 필수
- 기존 파일 수정 시 반드시 먼저 읽고 파악한 뒤 수정

---

## 7. Federation 규칙

> Federation = 외부 에이전트가 BRAIN.md를 통해 접근하는 구조

- 기본 정책: `deny` — Permission Set 없이는 접근 불가
- Permission Set은 `brains/` 디렉토리에 정의
- 세션 종료 시 모든 권한 자동 폐기
- 외부 에이전트는 `system/`, `brains/` 수정 불가

---

## 8. Claude 행동 규칙

- 날카롭게 응답한다. 동조 전에 빠진 것, 모순, 위험 요소를 먼저 짚는다
- 파일 이동/삭제: 반드시 사용자에게 먼저 확인
- 기존 노트를 수정할 때는 반드시 먼저 읽고 파악한 뒤 수정
- 노트 생성 시 템플릿(`system/templates/`)을 기반으로 작성
- `{{OWNER_NAME}}`을 실제 이름으로 치환하지 않은 파일이 있으면 경고
- 검색 시 frontmatter → 파일명 → 본문 순서로 탐색

---

## 9. 용어 & 네이밍 규칙

### 폴더·파일명
- 영문 소문자 + 하이픈 (`my-project`, `design-thinking`)
- 한글 폴더명 금지 (이식성)
- 깊이 2단계 제한 (`workspace/notes/` ← OK, `workspace/notes/sub/deep/` ← 지양)

### 태그
- 소문자, 하이픈 구분 (`#machine-learning`, `#side-project`)
- 계층 태그 허용 (`#dev/frontend`, `#reading/book`)
- 태그 수: 노트당 2~5개 권장

### wiki-link
- `[[파일명]]` 형식 (확장자 제외)
- 표시 텍스트: `[[파일명|표시할 텍스트]]`

용어 정의는 `system/glossary.md` 참조.
