---
name: harness-score
description: 프로젝트의 하네스 점수를 빠르게 확인합니다 (점수/등급/한줄 요약)
license: MIT
metadata:
  author: rulebased-io
  version: "1.0.0"
---

프로젝트의 하네스 점수를 빠르게 확인합니다.

harness-audit의 간결 버전입니다. 상세 리포트 대신 점수, 등급, 가장 시급한 개선 항목 하나를 보여줍니다.

## 실행

```bash
npx rulebased-harness score
npx rulebased-harness audit --short
```

## 출력 형식

```
[###############-----]  77/100 (B)  |  12/17 passed  |  critical: OK
Top fix: 린터/포맷터 설정 존재 — ESLint, Prettier, Biome 등의 설정 파일을 추가하세요.
```

$ARGUMENTS
