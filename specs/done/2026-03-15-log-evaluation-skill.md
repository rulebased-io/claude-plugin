# 로그 평가 스킬 - 채팅 기록 기반 하네스 부합도 평가

- **생성일**: 2026-03-15
- **상태**: todo
- **우선순위**: medium

## 조사 결과

### 채팅 기록 저장 위치

```
~/.claude/projects/<project>/sessions/<session-id>/transcript.jsonl
```

- `<project>`: git 루트 경로에서 `/` → `-` (예: `Users-jungyoun-Documents-dev-harness-plugin`)
- `<session-id>`: UUID
- 포맷: JSONL (한 줄에 하나의 JSON 이벤트)
- 자동 저장됨 (설정 불필요)

### JSONL 이벤트 타입

```json
{"type":"user_message","content":"...","timestamp":"..."}
{"type":"assistant_message","content":"...","timestamp":"..."}
{"type":"tool_use","tool_name":"Bash","tool_input":{...},"tool_result":"..."}
```

### 접근 방법

- **Hook에서**: `Stop` 이벤트 시 `transcript_path`가 JSON input으로 전달됨
- **스킬에서**: 직접 파일 경로 접근 가능
- **세션 목록**: `~/.claude/projects/<project>/sessions-index.json`

## 구현 계획

### 1. core에 transcript parser 추가

```
packages/core/src/transcript.ts
```

- JSONL 파싱
- 이벤트 타입별 분류 (user_message, assistant_message, tool_use)
- 통계 추출

### 2. core에 log evaluator 추가

```
packages/core/src/log-evaluator.ts
```

평가 기준:
- **Human turn count**: user_message 수
- **Autonomy ratio**: assistant turns / total turns
- **Build/test execution**: tool_use에서 npm test, npm build 실행 여부
- **Workflow compliance**: spec/task 파일 생성 여부 (tool_use에서 Write 감지)
- **Error recovery**: 실패 후 재시도 패턴

### 3. 스킬 추가

```
skills/eval-log/SKILL.md    # harness-eval-log
```

### 4. Hook 자동화 (선택)

```json
{
  "hooks": {
    "Stop": [{
      "type": "command",
      "command": "npx rulebased-harness eval-log"
    }]
  }
}
```

## 수용 기준

- [ ] transcript.jsonl 파싱 가능
- [ ] 평가 기준 3개 이상 구현
- [ ] 스킬로 수동 실행 가능
- [ ] Hook으로 자동 실행 가능
