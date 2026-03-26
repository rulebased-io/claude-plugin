---
description: List all registered agents on the server, optionally filtered by project
argument-hint: "[project]"
---

List all agents currently registered on the agents server, optionally filtered by project.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root.

## How to List

1. **Check the server is running:**
   ```bash
   curl -s http://localhost:9100/health
   ```
   If not running, tell the user to run `/rulebased-agents:online` first.

2. **Fetch registered agents:**
   - If a project filter is provided in `$ARGUMENTS`:
     ```bash
     curl -s "http://localhost:9100/agents?project=<project>"
     ```
   - Otherwise, fetch all:
     ```bash
     curl -s http://localhost:9100/agents
     ```

3. **Display as a formatted list:**

```
Registered Agents (3 total)

  frontend
    └── api-agent       — Answers questions about REST API contracts
    └── test-runner     — Reports test suite status

  backend
    └── db-admin        — Manages database schema queries
```

4. If no agents are registered, inform the user and suggest running `/rulebased-agents:online` from each project.

$ARGUMENTS
