---
name: Cross-Repo Bridge Plugin
description: 서로 다른 폴더(레포)의 AI 에이전트가 대화할 수 있는 브릿지 플러그인
type: backlog
created: 2026-03-27
priority: high
---

# Cross-Repo Bridge Plugin

## 아이디어

서로 다른 폴더에 AGENTS.md가 있고 양쪽에 이 플러그인이 설치된 상태에서, 두 레포의 AI 에이전트가 서로 대화할 수 있는 브릿지 역할을 하는 플러그인.

## 유스케이스

- 한쪽: Second Brain (지식 베이스)
- 한쪽: 실제 프로젝트
- 항상 연결될 필요 없음 — 연결 시점에만 대화 가능하면 됨

## 열린 질문

- 통신 메커니즘: 파일 기반? IPC? 소켓?
- 연결/해제 라이프사이클 설계
- 대화 프로토콜 (메시지 포맷, 요청/응답 구조)
- 보안: 어떤 정보까지 공유할 것인가
- Claude Code 플러그인 시스템 내에서 cross-repo 통신이 가능한 방법
