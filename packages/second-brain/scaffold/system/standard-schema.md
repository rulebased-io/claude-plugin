---
title: Transit / Storage Schema
date: {{DATE}}
tags: [schema, standard, rules]
type: permanent
related: [[rules]], [[design-principles]]
---

# Transit / Storage Schema

> 노트 파일의 frontmatter 스키마 정의. 모든 도구(SKILL, 클라이언트, 외부 에이전트)는 이 스키마를 따른다.

---

## 1. Storage Schema (파일에 저장되는 형식)

`.md` 파일의 frontmatter가 SSOT다. 모든 필드는 YAML이며, 파서가 읽을 수 있어야 한다.

### 필수 필드

```yaml
---
title: string          # 노트 제목
date: YYYY-MM-DD       # 생성일
tags: string[]         # 분류 태그
type: string           # fleeting | literature | permanent | idea | journal | snippet | til
---
```

### 선택 필드

```yaml
source: string         # 출처 URL 또는 서적명
related: wikilink[]    # 관련 노트 링크 (예: [[design-principles]])
stage: string          # idea 전용: seed | growing | ripe
mood: string           # journal 전용: 감정 상태
energy: string         # journal 전용: high | medium | low
language: string       # snippet 전용: 프로그래밍 언어
reviewed: YYYY-MM-DD   # 마지막 리뷰 날짜 (Spaced Repetition용)
```

---

## 2. Transit Schema (도구 간 전달 형식)

SKILL이나 외부 에이전트가 노트를 생성·수정할 때 사용하는 중간 표현.

### 인터페이스 정의

```typescript
interface NoteTransit {
  title: string;
  date: string;           // YYYY-MM-DD
  tags: string[];
  type: NoteType;
  body: string;           // 마크다운 본문
  source?: string;
  related?: string[];     // wiki-link 대상 파일명 (확장자 제외)
  stage?: 'seed' | 'growing' | 'ripe';
  metadata?: Record<string, unknown>;  // 타입별 추가 필드
}

type NoteType = 'fleeting' | 'literature' | 'permanent' | 'idea' | 'journal' | 'snippet' | 'til';
```

### 변환 규칙

| Transit → Storage | 설명 |
|-------------------|------|
| `related: ["rules"]` | → `related: [[rules]]` (wiki-link 형식) |
| `body` | → frontmatter 아래 마크다운 본문 |
| `metadata.mood` | → `mood:` (frontmatter 최상위로 펼침) |

---

## 3. 타입별 필수 필드

| type | 필수 추가 필드 | 위치 |
|------|---------------|------|
| `fleeting` | — | `workspace/notes/fleeting/` |
| `literature` | `source` | `workspace/notes/literature/` |
| `permanent` | `related` (1개 이상 권장) | `workspace/notes/` |
| `idea` | `stage` | `ideas/` |
| `journal` | — | `journal/` |
| `snippet` | `language` | `workspace/code/snippets/` |
| `til` | — | `workspace/code/til/` |

---

## 4. 파일명 규칙

```
YYYY-MM-DD-slug.md
```

- `slug`: 영문 소문자 + 하이픈, 3~60자
- 예: `2026-03-19-transit-storage-schema.md`
- journal: `YYYY-MM-DD.md` (slug 없이 날짜만)
