---
name: eval-log
description: Evaluates a Claude Code conversation log against harness compliance — measures human intervention, agent autonomy, tool usage, and session patterns
---

Evaluates a Claude Code conversation transcript against harness engineering compliance.

Analyzes the JSONL session log at `~/.claude/projects/<project>/<session>.jsonl`.

## Evaluation Criteria

- **Human Turn Count**: fewer human turns = more autonomous. Ratio of human to total turns.
- **Autonomy Ratio**: percentage of agent-driven turns. Higher is better.
- **Build/Test Execution**: Bash tool invocations as proxy for builds and tests.
- **Tool Diversity**: unique tools used (Read, Write, Edit, Bash, Grep, etc.)
- **Session Duration**: not too short (incomplete) or excessively long.

## How to Evaluate

1. Find the session log at `~/.claude/projects/<project-path>/<session-id>.jsonl`
2. Parse JSONL, count human vs assistant turns
3. Count unique tools and Bash invocations
4. Calculate scores per criterion and overall grade

$ARGUMENTS
