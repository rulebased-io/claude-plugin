---
description: Evaluate conversation log against harness compliance — measures autonomy, tool usage, session patterns
argument-hint: "[--file path/to/transcript.jsonl]"
---

# /eval-log — Conversation Log Evaluation

Analyze a Claude Code session transcript and score how well it followed harness practices.

## Evaluation criteria

- Human turn count (fewer = more autonomous)
- Autonomy ratio (agent turns / total turns)
- Build/test execution (Bash tool usage)
- Tool diversity (unique tools used)
- Session duration

## Usage

```
/rulebased-harness:eval-log
/rulebased-harness:eval-log --file ~/.claude/projects/.../transcript.jsonl
```

Or via CLI:
```bash
npx @rulebased/cli eval-log
npx @rulebased/cli eval-log --file /path/to/transcript.jsonl
```

$ARGUMENTS
