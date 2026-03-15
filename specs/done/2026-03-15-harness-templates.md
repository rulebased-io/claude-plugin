# 하네스 템플릿/표본 시스템

- **생성일**: 2026-03-15
- **상태**: backlog
- **우선순위**: medium

## 배경

audit/recommend로 점검할 때 비교 기준이 되는 "하네스 세부 스펙"을 어떻게 정의하고 제시할 것인가.
현재는 auditor.ts에 체크 항목이 하드코딩되어 있지만, 다양한 프로젝트 유형별로 다른 기준이 필요할 수 있음.

## 아이디어 목록

### 옵션 1: 기본 하네스 표본 내장
- 플러그인 내에 몇 가지 표본(preset)을 포함
- 예: `minimal`, `standard`, `enterprise`
- `/harness-plugin:init --preset standard`

### 옵션 2: 외부 레포 참조
- 하네스 구조를 정의한 외부 레포를 참조
- `/harness-plugin:init https://github.com/user/harness-template-node`
- 레포에 `.harness-spec.json` 같은 설정이 있어 audit 기준을 정의

### 옵션 3: 프리셋 목록 + 외부 레포 조합
- 기본 프리셋 몇 가지를 제공 (링크 포함)
- 사용자가 커스텀 레포도 지정 가능
- 예: 먼저 프리셋 목록을 보여주고, 선택하거나 직접 URL 입력

### 옵션 4: .harness.json 설정 파일
- 프로젝트 루트에 `.harness.json`을 두어 audit 기준을 커스터마이즈
- 어떤 체크를 활성화/비활성화할지, 심각도를 조절할지 등

## 고려사항

- 언어/프레임워크별 다른 체크가 필요 (Python 프로젝트에 tsconfig 체크는 불필요)
- 팀별로 다른 기준이 있을 수 있음
- 너무 복잡하면 안 됨 - 점진적으로 확장

## 수용 기준

- [ ] 구체적인 설계 결정
- [ ] 최소 1개 preset 구현
- [ ] 문서화
