---
name: status
description: Show the status of the agents server and local agent connections
type: skill
created: 2026-03-27
---

Show the current status of the agents server and local agent connections.

## How to Check Status

1. **Query the server health endpoint:**
   ```bash
   curl -s http://localhost:9100/health
   ```

2. **Display the server status:**

   If the server is running, show a formatted summary:
   ```
   Agents Server
     Status:   running
     Uptime:   3h 12m
     Peers:    2 connected

   Local Agent
     Project:  my-api
     Delegates: 2 registered (api, test-runner)
     Status:   online
   ```

   If the server is not reachable:
   ```
   Agents Server
     Status:   offline

   Local Agent
     Status:   offline (server not reachable)
   ```

3. **Check local agent** by reading `.rulebased/agents/agent.md` for the project name and listing files in `.rulebased/agents/delegates/` for registered delegates.

4. If the server is offline, suggest running `/rulebased-agents:online` to start it.

## Notes

- The server runs on `http://localhost:9100` by default.
- If `.rulebased/agents/` does not exist, the local agent has not been initialized. Suggest `/rulebased-agents:init`.
