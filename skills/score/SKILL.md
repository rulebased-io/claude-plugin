---
name: harness-score
description: 프로젝트의 하네스 구축 정도를 카테고리별로 점수 매겨서 리포트합니다
license: MIT
metadata:
  author: rulebased-io
  version: "1.0.0"
---

프로젝트의 하네스 엔지니어링 구축 정도를 카테고리별로 점수를 매겨서 리포트합니다.

audit가 pass/fail 체크리스트라면, score는 **각 카테고리별 점수와 전체 등급**을 보여줍니다.

## 실행

```bash
npx rulebased-harness score
```

## 출력 예시

```
## Harness Score Report

[###############-----]  **77/100 (B)**

### Context Engineering  [####################]  100/100  (5/5)

- [PASS] AGENTS.md 존재
- [PASS] AGENTS.md에 빌드 명령어 포함
- [PASS] AGENTS.md에 아키텍처 설명 포함
- [PASS] AGENTS.md에 흔한 실수 방지 목록
- [PASS] CLAUDE.md 존재

### Constraints  [--------------------]  0/100  (0/2)

- [FAIL] 린터/포맷터 설정 존재
  -> ESLint, Prettier, Biome 등의 설정 파일을 추가하세요.
- [FAIL] Pre-commit 훅 설정
  -> Husky, Lefthook, 또는 pre-commit을 설정하세요.

### Build & Test  [#############-------]  67/100  (2/3)

- [PASS] 테스트 스크립트 정의
- [PASS] 빌드 스크립트 정의
- [FAIL] CI/CD 설정 존재
  -> .github/workflows/ 에 CI 워크플로우를 추가하세요.
```

$ARGUMENTS
