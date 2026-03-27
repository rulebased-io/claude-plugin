---
name: ask
description: Send a question to a remote agent and wait for the response
type: skill
created: 2026-03-27
---

Send a question to a remote agent identified by `project:agent` and wait for the response.

## How to Ask

1. **Parse arguments** from `$ARGUMENTS`:
   - Format: `<project:agent> <message>`
   - Example: `frontend:api-agent What endpoints does the auth module expose?`
   - If either is missing, ask the user to provide the target (`project:agent`) and the message.

2. **Check the server is running:**
   ```bash
   curl -s http://localhost:9100/health
   ```
   If not running, tell the user to run `/rulebased-agents:online` first.

3. **Send the message:**
   ```bash
   curl -s -X POST http://localhost:9100/messages \
     -H 'Content-Type: application/json' \
     -d '{"from":"<local-project>:<local-agent>","to":"<project:agent>","content":"<message>"}'
   ```
   Capture the returned message `id` for correlation.

4. **Poll the inbox** for a reply (check `replyTo` matches the sent message `id`):
   ```bash
   curl -s "http://localhost:9100/messages/inbox?agent=<local-project>:<local-agent>"
   ```
   Retry up to 10 times with 2-second intervals. Stop when a matching reply arrives.

5. **Display the response** content to the user. If no reply within ~20 seconds, report a timeout.

## Notes

- The local project name comes from `.rulebased/agents/agent.md` (the `name` frontmatter field).
- If `.rulebased/agents/` does not exist, prompt the user to run `/rulebased-agents:init` first.
