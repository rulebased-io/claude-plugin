---
name: rulebased-agents design
description: Design spec for cross-repo agent communication plugin
type: spec
created: 2026-03-27
---

# @rulebased/agents — Cross-Repo Agent Communication Plugin

## Overview

A Claude Code plugin that enables AI agents across different repositories to communicate with each other through a local chat server. Each repo can define multiple delegate agents with distinct roles and sandboxed access, and agents discover and talk to each other via a central WebSocket-based server.

## Problem

Currently, Claude Code sessions operate in isolation within a single project directory. There is no mechanism for agents in different repos (e.g., a second brain and a project repo) to exchange information, ask questions, or collaborate. Users must manually copy context between sessions.

## Architecture

### Three Components, One Package

```
@rulebased/agents (npm: npx executable)
├── server    — WebSocket chat server (routing, message queue, peer registry)
├── agent     — Local agent process (WS subscriber, delegate spawner)
└── plugin    — Claude Code plugin (skills, hooks)
```

### System Diagram

```
[Repo A: Claude Code]                            [Repo B: Local Agent]
       │                                                  │
  /rulebased-agents:ask                            (detached process,
  "rulebased:researcher" "질문"                     polling server)
       │                                                  │
  curl POST localhost:9100/messages                       │
       │                                                  │
       ▼                                                  │
┌──────────────────────┐                                  │
│   Agents Server      │                                  │
│  (localhost:9100)    │      Server routes message        │
│                      │      to Local Agent B             │
│  - Peer registry     │─────────────────────────▶ Message received
│  - Message routing   │                           │
│  - Agent directory   │                           ▼
│                      │                    Load delegate def
│                      │                    researcher.md
│                      │                           │
│                      │                    Spawn delegate
│                      │                    (sandboxed response)
│                      │       HTTP response       │
│                      │◀─────────────────────────┘
└──────────┬───────────┘
           │
     Response returned
     (sync HTTP)
           │
           ▼
  Response displayed to user
```

### Address Scheme

```
{project}:{agent}

Examples:
  rulebased:researcher     — rulebased project's search agent
  rulebased:curator        — rulebased project's curation agent
  my-app:architect         — my-app project's architecture agent
  my-app:reviewer          — my-app project's review agent
```

- Agents register themselves with this ID when going online
- Project name is set in `.rulebased/agents/config.json`

### Server Meta-Graph

The server provides a directory of all registered agents:

```
GET /agents
[
  { "id": "rulebased:researcher", "description": "Knowledge search specialist", "status": "online" },
  { "id": "my-app:architect", "description": "System design discussions", "status": "online" }
]
```

## Components

### 1. Agents Server

- **Transport**: WebSocket for push notifications to local agents, HTTP REST for skill interactions
- **Responsibilities**: peer registry, message routing, agent directory
- **Execution**: `npx @rulebased/agents serve` — runs as a detached independent process
- **Lifecycle**: started lazily on first `ask` or `online` command. Shuts down via timeout when last peer disconnects
- **Port**: default `localhost:9100`, configurable in config
- **Auth (MVP)**: localhost trust only, no authentication. Future: token-based auth for remote/multi-user

### 2. Local Agent

- **Transport**: WebSocket client, persistent connection to server
- **Responsibilities**: subscribe to messages for this project's delegates, spawn delegates on incoming messages, return responses to server
- **Execution**: `npx @rulebased/agents agent --cwd /path/to/repo` — runs as a detached process
- **Lifecycle**: started by `/rulebased-agents:online`, stopped by `/rulebased-agents:offline` or manual termination
- **Delegate spawning**: loads delegate definition from `.rulebased/agents/delegates/{name}.md`, generates sandboxed response within defined boundaries

### 3. Plugin (Skills + Hooks)

Skills interact with the server via HTTP (curl), providing a simple user interface for all operations.

## Sandbox Model

- Each delegate agent hides the actual repository from external agents
- Delegates respond only within their defined scope and data disclosure boundaries
- No direct file access across repos — all communication goes through message exchange
- Delegate definitions explicitly state what information can be shared

## Directory Structure

After `/rulebased-agents:init my-project`:

```
.rulebased/agents/
├── config.json          # Project name, server port, etc.
├── delegates/           # Delegate definition files
│   └── researcher.md    # (created via :create skill)
├── logs/                # agent.log, server.log (when detached)
└── outbox/              # Unsent messages when offline (Phase 2+)
```

```json
// config.json
{
  "project": "my-project",
  "server": {
    "port": 9100
  }
}
```

### Delegate Definition Format

```markdown
---
name: researcher
description: Knowledge base search specialist
---

You are a search delegate for this second brain.
When you receive a question, explore inbox/, projects/, resources/
to find related notes and respond with a summary.

Disclosure scope: only share titles and summaries from resources/ and projects/.
Do not directly quote original content.
```

## Skills

| Skill | argument-hint | Description |
|-------|--------------|-------------|
| `rulebased-agents:init` | `[project-name]` | Initialize `.rulebased/agents/` structure |
| `rulebased-agents:create` | `[agent-name] [role-description]` | Create a delegate definition file |
| `rulebased-agents:online` | | Start server (if needed) + local agent + register delegates |
| `rulebased-agents:offline` | | Disconnect + unregister delegates |
| `rulebased-agents:ask` | `[project:agent] [message]` | Send a question to a remote agent |
| `rulebased-agents:list` | `[project]` | List registered agents (filter by project) |
| `rulebased-agents:status` | | Show server/local agent status |

## User Experience

### First-time Setup

```
User: /rulebased-agents:init my-brain
→ ".rulebased/agents/ initialized. Project: my-brain"

User: /rulebased-agents:create researcher "Knowledge base search specialist"
→ ".rulebased/agents/delegates/researcher.md created. Edit to define scope."

User: /rulebased-agents:online
→ "Server started (localhost:9100). Agents registered: my-brain:researcher [online]"
```

### Asking a Remote Agent

```
User: "rulebased:researcher에게 이 패턴에 대한 노트 있는지 물어봐"
→ Skill internally:
   1. Check server running → curl localhost:9100/health
   2. POST /messages {"to": "rulebased:researcher", "content": "..."}
   3. Wait for sync response (timeout: 120s)
   4. Display response to user
```

### Discovery

```
User: "어떤 에이전트들이 있어?"
→ /rulebased-agents:list
→ GET /agents
→ "Online agents:
    rulebased:researcher — Knowledge base search specialist
    rulebased:curator — Knowledge curation and recommendations
    my-app:architect — System design discussions"
```

## Deployment

- **Package**: `packages/agents/` in the monorepo
- **npm**: `@rulebased/agents`
- **Plugin name**: `rulebased-agents`
- **Marketplace**: added to `.claude-plugin/marketplace.json`

## Phasing

### Phase 1 (MVP)

- Synchronous ask/response (HTTP wait for delegate response)
- Localhost trust, no authentication
- Offline = fail with message ("Agent is offline")
- Single machine, local server only
- Basic delegate spawning

### Phase 2

- Async polling (POST → poll status → receive response)
- Offline message queuing (server stores, delivers when online)
- Conversation sessions (multi-turn context between agents)

### Phase 3

- Token-based authentication
- Remote server support (cross-machine communication)
- Agent capability negotiation
- Message history and audit trail

## Delegate Execution Model

The delegate execution mechanism is intentionally left open for Phase 1 prototyping. Possible approaches include:

- Invoking `claude` CLI with the delegate `.md` as system prompt and the incoming message as user input
- Direct LLM API call with delegate definition as context
- A lightweight script runner that reads the delegate definition and generates responses

The chosen approach must satisfy these constraints:
- The delegate runs within the repo directory (`--cwd`)
- The delegate's file access is scoped by its definition (enforced by instruction, not filesystem)
- The delegate's response is captured as text and returned to the server

This will be resolved during Phase 1 implementation through prototyping.

## Server API (Phase 1)

### Health Check

```
GET /health
→ 200 { "status": "ok", "uptime": 1234, "peers": 2 }
```

### Agent Directory

```
GET /agents
→ 200 [{ "id": "project:agent", "description": "...", "status": "online" }]

GET /agents?project=rulebased
→ 200 (filtered by project)
```

### Peer Registration

```
POST /register
{ "project": "my-project", "agents": [{ "name": "researcher", "description": "..." }] }
→ 200 { "peerId": "...", "registered": ["my-project:researcher"] }

POST /unregister
{ "peerId": "..." }
→ 200 { "unregistered": ["my-project:researcher"] }
```

### Messaging

```
POST /messages
{ "from": "my-app:user", "to": "rulebased:researcher", "content": "질문 내용" }
→ 200 { "response": "대리자의 응답 내용" }  (sync, blocks until delegate responds)
→ 404 { "error": "agent_not_found", "message": "rulebased:researcher not registered" }
→ 503 { "error": "agent_offline", "message": "rulebased:researcher is offline" }
→ 504 { "error": "timeout", "message": "Delegate did not respond within 120s" }
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Target agent not found | 404 — "Agent not registered" |
| Target agent offline | 503 — "Agent is offline" (Phase 1: no queuing) |
| Delegate response timeout (120s) | 504 — "Delegate did not respond in time" |
| Server not running | Skill detects via health check failure, prompts user to run `:online` |
| Server port in use | Server startup fails with clear error, suggest alternative port |
| Duplicate project name | First-come-first-served; second registration gets error with suggestion to rename |
| Malformed delegate `.md` | Local agent logs warning, skips registration of that delegate |
| Server crash mid-request | Client receives connection error, skill reports "Server unavailable" |

## Logging

- Server logs: stdout (visible when running in foreground) or `.rulebased/agents/server.log` (when detached)
- Local agent logs: `.rulebased/agents/agent.log`
- `:status` skill shows recent log entries for debugging

## Technical Constraints

- Phase 1: HTTP only (no WebSocket). Server uses Node.js built-in `http` module. Local agent polls or uses HTTP long-polling for message reception. WebSocket upgrades in Phase 2 for real-time push.
- No external runtime dependencies for Phase 1 (Node.js built-in modules only)
- Phase 2+: `ws` package for WebSocket support (explicit exception to zero-dependency rule, documented)
- ESM, strict TypeScript, no `any`
- Tests in `tests/` directory, fixture-based
