---
name: offline
description: Disconnect local agent and unregister delegates from the agents server
type: skill
created: 2026-03-27
---

Disconnect the local agent and unregister this project's delegates from the agents server.

## How to Go Offline

1. **Find the local agent process** associated with this project:
   ```bash
   pgrep -f "rulebased/agents agent"
   ```
   Or more specifically:
   ```bash
   ps aux | grep "@rulebased/agents agent"
   ```

2. **Stop the local agent process:**
   ```bash
   kill <pid>
   ```

3. **Check if any other peers are still connected:**
   ```bash
   curl -s http://localhost:9100/health
   ```
   Look at the `peers` count in the response.

4. **Optionally stop the server** — ask the user:
   - If no other peers are connected: "No other agents are connected. Stop the server too? (y/n)"
   - If other peers remain: "Other agents are still connected. The server will remain running."
   - If user confirms, stop the server process:
     ```bash
     pgrep -f "@rulebased/agents serve" | xargs kill
     ```

5. **Report to the user:**
   - Local agent stopped
   - Delegates unregistered
   - Server status (stopped / still running)
