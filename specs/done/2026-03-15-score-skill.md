# 하네스 점수 매기기 스킬 추가

- **생성일**: 2026-03-15
- **상태**: backlog
- **우선순위**: medium

## 내용

현재 audit는 체크리스트 기반 pass/fail + 점수를 이미 산출하지만, 별도의 "점수 매기기" 스킬로 더 직관적으로 노출하면 좋을 수 있음.

## 아이디어

- `harness-score` 스킬: 프로젝트 하네스 점수를 빠르게 보여주는 전용 커맨드
- audit의 상세 리포트와 달리 점수/등급/한줄 요약에 집중
- 뱃지 이미지 생성 (README에 붙일 수 있는 하네스 점수 뱃지)
- 시간에 따른 점수 변화 추적 (이전 결과와 비교)

## 판단 포인트

- audit과 기능 중복 우려 — score를 audit의 요약 모드(`--short`)로 제공할지, 별도 스킬로 제공할지
- CLI에서는 `npx rulebased-harness score` 또는 `npx rulebased-harness audit --score`
