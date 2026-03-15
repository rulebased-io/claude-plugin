---
name: eval-log
description: Evaluates a Claude Code conversation log against harness compliance — measures human intervention, agent autonomy, tool usage, and session patterns
---

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

## Example Output

```
## Harness Log Evaluation Report

**Score: 72/100 (B)**
**Session: 8d39913f-93ac-433e-871e-6b844d3ba232**
**Duration: 45 min** | Human turns: 15 | Agent turns: 48

### Human Turn Count  [################----]  80/100

- [PASS] 15 human turns / 63 total (24% human)

### Autonomy Ratio  [################----]  80/100

- [PASS] 76% agent autonomy (48 agent / 63 total)

### Build/Test Execution  [####################]  100/100

- [PASS] 12 Bash tool invocations

### Tool Diversity  [####################]  100/100

- [PASS] 8 unique tools: Write(25), Bash(12), Read(10), Edit(8), Grep(5), Glob(3), Agent(2), TaskCreate(1)
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
