---
name: eval-log
description: 세션 로그 평가 공유 문서 — skills/eval-log, commands/eval-log 공통 참조
type: skill
created: 2026-03-18
---

> **Plugin path**: The `CLAUDE_PLUGIN_PATH` value provided by the hook is the root of this plugin.
> Use it to read plugin files when additional context is needed.

Evaluates a Claude Code conversation transcript against harness engineering compliance.

Analyzes the JSONL session log stored at `~/.claude/projects/<project>/<session>.jsonl` and scores how well the session followed harness practices.

## Evaluation Criteria

### Human Turn Count
Fewer human turns = more autonomous agent work. Measures the ratio of human interventions to total conversation turns.

### Autonomy Ratio
Percentage of agent-driven turns. Higher is better — indicates the agent worked independently.

### Build/Test Execution
Whether shell commands (Bash tool) were used during the session. Proxy for running builds and tests.

### Tool Diversity
Number of unique tools used. More diverse tool usage indicates thorough work (Read, Write, Edit, Bash, Grep, etc.)

### Session Duration
Reasonable session length — not too short (incomplete), not excessively long.

## How to Evaluate

1. Find the session log file at `~/.claude/projects/<project-path>/<session-id>.jsonl`
2. Parse the JSONL and count human vs assistant turns
3. Count unique tools used and Bash invocations
4. Calculate scores per criterion and an overall grade
