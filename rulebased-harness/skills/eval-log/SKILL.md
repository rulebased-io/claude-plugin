---
name: eval-log
description: Evaluates a Claude Code conversation log against harness compliance — measures human intervention, agent autonomy, tool usage, and session patterns
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

## Execution

```bash
npx rulebased-harness eval-log
npx rulebased-harness eval-log --file /path/to/transcript.jsonl
npx rulebased-harness eval-log --json
```

## Hook Automation

Add to your hooks to auto-evaluate after every session:

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

$ARGUMENTS
