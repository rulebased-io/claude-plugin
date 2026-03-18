---
title: 용어집
date: {{DATE}}
tags: [glossary, reference]
type: permanent
related: [[rules]], [[design-principles]], [[standard-schema]]
---

# 용어집

> 이 세컨드 브레인에서 사용하는 전문 용어 정의.

---

## A

### Areas (영역)
지속적으로 관리하는 책임 영역. 프로젝트와 달리 완료 시점이 없다. 예: 건강, 재정, 커리어. `areas/` 디렉토리에 저장.

### Archives (아카이브)
비활성화된 프로젝트, 더 이상 관련 없는 자료의 보관소. `archives/` 디렉토리.

---

## B

### BRAIN.md
외부 에이전트가 이 세컨드 브레인에 연결할 때 가장 먼저 읽는 파일. 소유자 정보, 접근 정책, Permission Set 목록을 포함.

---

## C

### CODE (Capture → Organize → Distill → Express)
Tiago Forte의 세컨드 브레인 워크플로우. 캡처하고, 정리하고, 핵심을 추출하고, 결과물을 만드는 4단계.

---

## D

### Distill (핵심 추출)
읽기 정리(reading)나 지식을 단계적으로 압축하는 과정. 원문 → 볼드 핵심 문장 → 요약. Progressive Summarization 기법 활용.

---

## E

### EntryTransit
SKILL이나 외부 에이전트가 콘텐츠를 생성·수정할 때 사용하는 중간 표현 형식. Storage Schema와 변환 규칙이 정의되어 있다. `standard-schema.md` 참조.

### EntryType
세컨드 브레인의 콘텐츠 유형. `memo | reading | knowledge | idea | journal | snippet | til` 7가지.

---

## F

### Federation (연합)
외부 에이전트가 BRAIN.md를 통해 세컨드 브레인에 접근하는 구조. Permission Set으로 접근 범위를 제어.

### frontmatter
Markdown 파일 상단의 YAML 메타데이터 블록. `---`으로 감싼다. Storage Schema의 핵심.

---

## I

### Idea Emergence (아이디어 부상)
아이디어가 seed → growing → ripe → project로 발전하는 과정. `ideas/` 디렉토리에서 추적.

---

## K

### knowledge (지식)
정제된 핵심 지식. 원자성(1파일=1주제)과 자립성(맥락 없이 이해 가능)을 갖춘 콘텐츠. `workspace/knowledge/`에 저장.

---

## M

### memo (메모)
빠르게 적은 임시 기록. 나중에 knowledge로 발전시키거나 삭제. `workspace/knowledge/memos/`.

### MOC (Map of Content)
여러 항목을 연결하는 인덱스. 특정 주제의 지도 역할. 3개 이상 관련 항목이 모이면 생성 고려.

---

## P

### PARA (Projects / Areas / Resources / Archives)
Tiago Forte의 정보 조직 프레임워크. 실행 가능성을 기준으로 정보를 4단계로 분류.

### Permission Set (권한 세트)
외부 에이전트에게 열어줄 경로와 행동 범위를 정의하는 템플릿. `brains/` 디렉토리에 저장.

---

## R

### reading (읽기 정리)
외부 자료(책, 글, 영상)에서 추출한 정리. 자신의 말로 재구성하며, `source` 필드 필수. `workspace/knowledge/readings/`.

---

## S

### SKILL
세컨드 브레인의 기능 단위. capture, connect, review 등. Claude 플러그인 스킬이 SKILL을 실행.

### SSOT (Single Source of Truth)
하나의 진실 원본. 이 세컨드 브레인에서는 `.md` 파일이 SSOT다.

### Storage Schema
`.md` 파일의 frontmatter 형식 정의. 모든 도구가 이 스키마를 따른다. `standard-schema.md` 참조.

---

## W

### wiki-link
`[[파일명]]` 형식의 내부 링크. 항목 간 연결의 기본 단위. 확장자를 제외하고 파일명만 사용.
