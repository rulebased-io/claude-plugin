---
title: workspace 구조 가이드
date: {{DATE}}
tags: [workspace, structure, para]
type: permanent
---

# workspace/

> 직접 작업하는 모든 것의 공간. PARA의 Projects + Resources에 해당.

---

## 구조

```
workspace/
├── notes/
│   ├── fleeting/      # 일시적 메모 (나중에 정리 또는 삭제)
│   └── literature/    # 읽은 것에서 추출한 노트 (source 필수)
├── code/
│   ├── snippets/      # 재사용 코드 조각
│   └── til/           # Today I Learned
├── projects/          # 활성 프로젝트별 폴더
└── resources/         # 참고 자료, 레퍼런스
```

---

## notes/

### fleeting (일시 노트)
- 빠르게 적은 메모. inbox/에서 분류되어 온 것
- 정기 리뷰에서 permanent로 승격하거나 삭제

### literature (문헌 노트)
- 책, 글, 영상 등 외부 자료에서 추출한 핵심 내용
- `source` 필드 필수 — 출처를 반드시 기록
- 원문 복사가 아닌 자신의 말로 재구성

---

## code/

### snippets (코드 조각)
- 재사용할 코드 패턴, 설정, 명령어
- `language` 필드로 프로그래밍 언어 표기

### til (Today I Learned)
- 오늘 새로 알게 된 기술적 사실
- 짧고 구체적으로 — 하나의 배움에 하나의 TIL

---

## projects/

활성 프로젝트마다 하위 폴더를 생성한다.

```
projects/
└── my-project/
    ├── README.md      # 프로젝트 개요, 목표, 상태
    ├── notes/         # 프로젝트 관련 노트
    └── decisions/     # 결정 기록 (ADR 스타일)
```

- 완료된 프로젝트 → `archives/`로 이동
- 프로젝트 노트에서 `ideas/`의 원본 아이디어로 역링크

---

## resources/

- 자주 참고하는 외부 자료 링크·요약
- 특정 프로젝트에 속하지 않는 범용 참고자료
