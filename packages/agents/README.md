# @rulebased/agents

Cross-repo AI agent communication for Claude Code.

---

## Overview

`@rulebased/agents` enables Claude Code sessions running in different repositories to discover and communicate with each other. One agent can delegate a question to another agent in a different project and receive a response — without any manual copy-paste or context switching.

Key capabilities:
- Start a lightweight local agent server that registers your project's delegates
- Send questions to remote agents by `project:agent` address
- Fire-and-forget messaging with inbox polling for async replies
- Manage delegate definitions that describe each agent's role and disclosure scope

---

## Installation

```bash
# Step 1: Add marketplace (inside Claude Code)
/plugin marketplace add rulebased-io/claude-plugin

# Step 2: Install the plugin
/plugin install rulebased-agents@rulebased
```

Or test locally during development:

```bash
claude --plugin-dir ./packages/agents
```

---

## Skills

| Skill | Argument hint | Description |
|-------|--------------|-------------|
| `/rulebased-agents:init` | — | Initialize `.rulebased/agents/` directory structure for cross-repo agent communication |
| `/rulebased-agents:create` | `<name> <role>` | Create a new delegate agent definition file with name, role, and disclosure scope |
| `/rulebased-agents:online` | — | Start the agents server and local agent, register delegates for cross-repo communication |
| `/rulebased-agents:offline` | — | Disconnect local agent and unregister delegates from the agents server |
| `/rulebased-agents:ask` | `<project:agent> <question>` | Send a question to a remote agent and wait for the response |
| `/rulebased-agents:list` | `[project]` | List all registered agents on the server, optionally filtered by project |
| `/rulebased-agents:status` | — | Show the status of the agents server and local agent connections |

---

## Quick Start

```bash
# 1. Initialize agent structure in your project
/rulebased-agents:init

# 2. Create a delegate agent
/rulebased-agents:create backend-expert "TypeScript API and database specialist"

# 3. Bring your agent online
/rulebased-agents:online

# 4. From another project, ask this agent a question
/rulebased-agents:ask my-project:backend-expert "How should I structure the user auth endpoints?"
```

---

## Architecture

```
Project A (Claude Code)          Project B (Claude Code)
┌─────────────────────┐          ┌─────────────────────┐
│  /rulebased-agents  │          │  /rulebased-agents  │
│  :ask projectB:api  │──────┐   │  :online            │
└─────────────────────┘      │   └─────────────────────┘
                              │           │
                         ┌────▼───────────▼────┐
                         │   Agents Server      │
                         │   (localhost:39821)  │
                         │   - Registry         │
                         │   - Message inbox    │
                         └─────────────────────┘
```

- **Server**: A lightweight local HTTP server that acts as a message broker between Claude Code sessions. Starts automatically when any agent goes online.
- **Local agent**: Each project registers its delegates with the server on `:online` and deregisters on `:offline`.
- **Fire-and-forget + inbox polling**: Messages are delivered asynchronously. The asking agent polls the server inbox until a response arrives.
- **Delegates**: Defined in `.rulebased/agents/delegates/` as YAML/JSON files that describe each agent's name, role, and what context it may disclose.

---

## License

MIT
