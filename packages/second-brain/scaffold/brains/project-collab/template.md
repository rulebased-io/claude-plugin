---
name: project-collab
description: 프로젝트 협업자에게 특정 프로젝트 노트와 코드를 공유하는 Permission Set
type: permission-set
---

# Project Collaboration

> 프로젝트 협업자(동료, 팀원)에게 특정 프로젝트 범위만 열어주는 세션.

---

## 목적

- 프로젝트 관련 노트·코드 공유
- 협업자의 지식을 프로젝트에 반영
- 공동 브레인스토밍 및 아이디어 발전

---

## 허용 경로

| 경로 | 권한 | 용도 |
|------|------|------|
| `workspace/projects/{project-name}/` | 읽기+쓰기 | 프로젝트 노트 협업 |
| `workspace/code/snippets/` | 읽기 | 관련 코드 참조 |
| `workspace/resources/` | 읽기 | 프로젝트 참고 자료 |
| `ideas/` | 읽기 | 프로젝트 관련 아이디어 열람 |
| `system/MOC-index.md` | 읽기 | 전체 구조 파악 |

---

## 금지 사항

- `journal/` 접근 불가 (개인 영역)
- `areas/` 접근 불가 (개인 영역)
- `brains/` 접근 불가 (보안 설정)
- 프로젝트 폴더 외 파일 수정 불가
- 파일 삭제 불가 — 아카이브(`archives/`)로 이동만 허용

---

## Role 조합 힌트

이 세션에서 에이전트는 **노트 작성 Agent** + **코드 개발 보조 Agent** 역할을 조합한다.
- 프로젝트 노트 작성 및 구조화
- 코드 스니펫 저장 및 정리
- 소유자 확인 후에만 파일 이동
