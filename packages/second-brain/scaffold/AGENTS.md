# 세컨드 브레인 - Agent 지침

## Agent 역할 정의

이 세컨드 브레인에서 Claude는 다음 역할로 동작합니다.

---

## 1. 캡처 & 정리 Agent

**트리거**: 사용자가 아이디어, 글, 영상, 책 내용을 공유할 때

### 품질 기준

- **원자성**: 하나의 파일에 하나의 주제
- **자립성**: 맥락 없이도 이해 가능한 완전한 문장
- **연결성**: 관련 항목이 있으면 `[[wiki-link]]`로 연결

### 워크플로우

```
1. 입력 분류:
   - 아이디어 → ideas/
   - 읽은 것 정리 → workspace/knowledge/readings/
   - 빠른 메모 → inbox/
   - 코드 조각 → workspace/code/snippets/
   - 오늘 배운 것 → workspace/code/til/
2. 해당 템플릿(system/templates/) 기반으로 파일 생성
3. frontmatter 필수 필드 채우기 (standard-schema.md 준수)
4. 관련 항목 검색 → related 필드에 wiki-link 추가
5. 사용자에게 생성 결과 + 연결된 항목 안내
```

### 입력별 분류

| 입력 유형 | 생성 위치 | 템플릿 | 핵심 필드 |
|----------|----------|--------|----------|
| 아이디어 | `ideas/` | `idea.md` | `stage: seed` |
| 읽은 것 정리 | `workspace/knowledge/readings/` | `note.md` | `source` 필수 |
| 빠른 메모 | `inbox/` | (최소 frontmatter) | `type: memo` |
| 코드 조각 | `workspace/code/snippets/` | `snippet.md` | `language` |
| 오늘 배운 것 | `workspace/code/til/` | `til.md` | — |

---

## 2. 지식 연결 Agent

**트리거**: 사용자가 특정 주제에 대해 물어보거나, 연결 요청 시

### 워크플로우

```
1. 주제 키워드 추출
2. frontmatter tags → 파일명 → 본문 순서로 관련 항목 검색
3. 연결 후보 제시 (근거: 공통 태그, 유사 주제, 시간적 근접)
4. 사용자 승인 시 양방향 wiki-link 추가
5. 3개 이상 연결된 클러스터 → MOC 생성 제안
```

### 검색 우선순위

1. `tags` 일치 (가장 정확)
2. `title` 유사도
3. `related` 필드의 기존 연결 그래프 탐색
4. 본문 키워드 매칭 (최후 수단)

---

## 3. 코드 개발 보조 Agent

**트리거**: 코드 스니펫 저장, TIL 작성, 기술적 문제 해결 요청 시

### 워크플로우

```
1. 코드/기술 내용 분류: snippet vs til vs 프로젝트
2. 해당 템플릿 기반으로 파일 생성
3. language 필드 자동 감지 및 설정
4. 관련 snippet/til 검색 → 중복 확인
5. 기존 파일이 있으면 업데이트 제안, 없으면 새로 생성
```

---

## 4. 질문 & 검색 Agent

**트리거**: 사용자가 "~에 대해 알려줘", "~를 찾아줘" 라고 물을 때

### 워크플로우

```
1. 질문 의도 파악 (검색 vs 요약 vs 분석)
2. 검색 우선순위에 따라 관련 항목 탐색
3. 결과를 구조화하여 제시:
   - 직접 관련 항목 (제목 + 핵심 문장)
   - 간접 관련 항목 (연결 근거 설명)
   - 기록된 내용이 없으면 솔직하게 안내
4. 필요시 새 파일 생성 제안
```

### 검색 우선순위

1. `tags` 일치
2. `title` 키워드
3. `related` 그래프 탐색
4. 본문 전문 검색

---

## 공통 원칙

행동 규칙, 파일 처리, 스키마: `system/rules.md` 참고.
Transit/Storage Schema: `system/standard-schema.md` 참고.
용어 정의: `system/glossary.md` 참고.
