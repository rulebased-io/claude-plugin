---
title: inbox 운영 가이드
date: {{DATE}}
tags: [inbox, capture, workflow]
type: permanent
---

# inbox/

> 빠른 캡처의 진입점. 정리되지 않은 모든 것이 여기에 먼저 들어온다.

---

## 원칙 (CODE: Capture)

1. **빠르게 넣는다** — 형식, 분류, 품질을 신경 쓰지 않는다
2. **정기적으로 비운다** — inbox에 머무는 기간은 최대 7일
3. **분류 후 이동한다** — 적절한 위치로 옮기거나 삭제

---

## 캡처 → 분류 → 이동

```
inbox/에 도착
    ↓
내용 확인
    ↓
┌─────────────────────────────────────┐
│ 아이디어?      → ideas/             │
│ 학습할 내용?   → workspace/knowledge/ │
│ 일상 기록?     → journal/           │
│ 코드 조각?     → workspace/code/    │
│ 쓸모없음?      → 삭제               │
│ 나중에 볼 것?  → workspace/resources/ │
└─────────────────────────────────────┘
```

---

## 캡처 소스 예시

- 웹 클리핑 (글, 영상 요약)
- 대화 중 떠오른 생각
- 스크린샷, 메모
- AI 대화에서 건진 인사이트
- 읽은 책/글의 핵심 구절

---

## 파일명

```
YYYY-MM-DD-간단한-설명.md
```

frontmatter 최소:
```yaml
---
title: 간단한 설명
date: YYYY-MM-DD
tags: [inbox]
type: memo
---
```
