---
description: Start the agents server and local agent, register delegates for cross-repo communication
argument-hint: ""
---

Start the agents server (if not already running) and the local agent, then register this project's delegates.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root.

## How to Go Online

1. **Check if the server is running:**
   ```bash
   curl -s http://localhost:9100/health
   ```
   - If the request fails or returns an error, start the server:
     ```bash
     npx @rulebased/agents serve &
     ```
   - Wait ~1 second, then verify with the health check again.

2. **Start the local agent for this project:**
   ```bash
   npx @rulebased/agents agent --cwd $(pwd) &
   ```

3. **Confirm registration** by listing delegates:
   ```bash
   curl -s http://localhost:9100/agents
   ```

4. **Report to the user:**
   - Server status (running / just started)
   - Local agent status (started)
   - List of registered delegates from this project

## Notes

- The server runs on `http://localhost:9100` by default.
- The agent reads delegate definitions from `.rulebased/agents/delegates/`.
- If `.rulebased/agents/` does not exist, prompt the user to run `/rulebased-agents:init` first.

$ARGUMENTS
