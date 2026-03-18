---
title: 아이디어 생명주기
date: {{DATE}}
tags: [ideas, lifecycle, zettelkasten]
type: permanent
---

# ideas/

> 아이디어의 성장 공간. 씨앗에서 프로젝트로 발전하는 과정을 추적한다.

---

## 아이디어 스테이지 (Idea Emergence)

```
seed → growing → ripe → project
 🌱      🌿       🍎      🚀
```

| 스테이지 | 의미 | 다음 행동 |
|----------|------|----------|
| **seed** | 막 떠오른 생각. 한 줄이면 충분 | 정기 리뷰에서 발전 가능성 판단 |
| **growing** | 구체화 중. 관련 노트 연결, 세부사항 추가 | 실행 가능성 검토 |
| **ripe** | 실행 준비 완료. 충분히 구체적 | `workspace/projects/`로 이동 |
| **project** | 프로젝트로 전환됨 | ideas/에서 제거, 프로젝트 노트에 링크 |

---

## 아이디어 노트 형식

```yaml
---
title: 아이디어 제목
date: YYYY-MM-DD
tags: [idea, 관련주제]
type: idea
stage: seed
related: []
---
```

`system/templates/idea.md` 템플릿 사용 권장.

---

## 리뷰 주기

- **주간**: seed 아이디어 훑어보기 — 발전시킬 것 / 버릴 것 구분
- **월간**: growing 아이디어 점검 — ripe로 올릴 것 판단
- **분기**: 전체 정리 — 오래된 seed는 `archives/`로

---

## 연결 원칙 (Zettelkasten)

- 아이디어 하나에 노트 하나 (원자성)
- 관련 아이디어끼리 `[[wiki-link]]`로 연결
- 3개 이상 연결된 아이디어 클러스터 → MOC 생성 고려
