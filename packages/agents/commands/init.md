---
description: Initialize .rulebased/agents/ directory structure for cross-repo agent communication
argument-hint: "[project-name]"
---

Initialize the `.rulebased/agents/` directory structure in the current project for cross-repo agent communication.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root.

## How to Initialize

1. If no project name is provided in `$ARGUMENTS`, ask the user: "What is the project name for this agent? (e.g., `my-api`, `frontend`)"
2. Run the initializer:
   ```bash
   npx @rulebased/agents init <project-name>
   ```
3. Confirm the created files and explain next steps:
   - Edit `.rulebased/agents/agent.md` to describe this project's agent identity
   - Run `/rulebased-agents:create` to define delegate agents

## Next Steps

After initialization, guide the user to:
- Define at least one delegate using `/rulebased-agents:create`
- Bring the agent online using `/rulebased-agents:online`

$ARGUMENTS
