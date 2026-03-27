---
name: Server refactor to Hono + WebSocket
description: Refactor agents server from raw node:http + SSE to Hono + ws for structured, production-ready architecture
type: spec
created: 2026-03-27
---

# Server Refactor: Hono + WebSocket

## Overview

Refactor the `@rulebased/agents` server from raw `node:http` with manual SSE to a structured architecture using **Hono** (HTTP framework) and **ws** (WebSocket). This improves code organization, real-time communication, reliability, and maintainability.

## Problem

The current implementation has:
- 197-line monolithic `server.ts` with manual routing, body parsing, and SSE
- 137-line `agent.ts` with manual SSE stream parsing via `ReadableStream`
- No runtime input validation (`body as Type` casting)
- SSE is server→client only, requiring separate HTTP POST for agent responses
- No heartbeat, reconnection, or connection state management

## Architecture

### Dependencies

| Package | Purpose | Size | Type |
|---------|---------|------|------|
| `hono` | HTTP framework | ~14KB | runtime |
| `@hono/node-server` | Node.js adapter | ~3KB | runtime |
| `ws` | WebSocket server/client | ~30KB | runtime |
| `@types/ws` | ws type definitions | - | dev |

Exception to the zero-dependency rule: `@rulebased/agents` allows runtime dependencies. `@rulebased/harness` and `@rulebased/second-brain` remain zero-dependency.

### File Structure

```
src/
├── server/
│   ├── index.ts           # createAgentsServer() — Hono app + WS setup
│   ├── state.ts           # ServerState class — peer registry, agent directory, message routing
│   ├── validators.ts      # Input validation functions + ValidationError
│   ├── routes/
│   │   ├── health.ts      # GET /health
│   │   ├── agents.ts      # GET /agents, POST /register, POST /unregister
│   │   └── messages.ts    # POST /messages
│   └── ws/
│       └── handler.ts     # WebSocket connection management, message routing
├── agent/
│   ├── index.ts           # createLocalAgent()
│   └── ws-client.ts       # AgentWsClient class — connect, send, reconnect
├── types.ts               # (unchanged)
├── config.ts              # (unchanged)
├── delegate.ts            # (unchanged)
├── initializer.ts         # (unchanged)
└── cli.ts                 # (minimal changes — import paths)
```

### Test Structure

```
tests/
├── unit/
│   ├── state.test.ts        # ServerState class unit tests (no HTTP)
│   └── validators.test.ts   # Validation function tests
├── integration/
│   ├── routes.test.ts       # Hono route tests (HTTP)
│   ├── ws.test.ts           # WebSocket connection/push tests
│   └── agent.test.ts        # Agent ↔ server E2E flow
├── delegate.test.ts         # (unchanged)
├── config.test.ts           # (unchanged)
├── initializer.test.ts      # (unchanged)
├── types.test.ts            # (unchanged)
└── fixtures/                # (unchanged)
```

## Components

### 1. ServerState Class

Encapsulates all state management in a single class. Route handlers call methods instead of manipulating Maps directly.

```typescript
class ServerState {
  // Peer management
  register(project: string, agents: AgentInfo[]): { peerId: string; registered: string[] }
    // Throws StateError if project name already registered (409 conflict)
  unregister(peerId: string): { unregistered: string[] }
    // Also calls removeConnection() to close WS and clean up
  getPeer(peerId: string): PeerEntry | undefined

  // Agent lookup
  findAgent(agentId: string): { peer: PeerEntry; agentName: string } | null
  listAgents(project?: string): RegisteredAgent[]

  // WebSocket connection management
  setConnection(peerId: string, ws: WebSocket): void
  removeConnection(peerId: string): void

  // Message routing
  routeMessage(msg: MessageRequest): { ok: true; messageId: string } | { ok: false; error: string; status: number }

  // Status
  getHealth(): ServerHealth
}
```

`routeMessage` is responsible for creating the `InboxMessage` and pushing it through the target peer's WebSocket connection.

### 2. Hono Routes

Each route file exports a function that receives `ServerState` and returns a `Hono` instance.

```typescript
// server/routes/agents.ts
export function agentRoutes(state: ServerState): Hono {
  const app = new Hono();
  app.get("/agents", (c) => c.json(state.listAgents(c.req.query("project"))));
  app.post("/register", async (c) => {
    const body = validatePeerRegistration(await c.req.json());
    return c.json(state.register(body.project, body.agents));
  });
  app.post("/unregister", async (c) => {
    const { peerId } = await c.req.json();
    return c.json(state.unregister(peerId));
  });
  return app;
}
```

Hono global error handler catches `ValidationError` and returns 400.

### 3. WebSocket Protocol

All WS messages follow a typed envelope:

```typescript
interface WsMessage {
  type: string;
  payload: unknown;
}
```

**Server → Agent:**
```
{ type: "connected", payload: { peerId: string } }
{ type: "message", payload: InboxMessage }
```

**Agent → Server:**
```
{ type: "message", payload: MessageRequest }
```

**Connection flow:**
1. Agent connects: `ws://localhost:9100/ws?peerId=xxx`
2. Server validates peerId, stores WebSocket reference in `ServerState`
3. Server sends `{ type: "connected" }`
4. On `POST /messages`, server calls `state.routeMessage()` which pushes via WS
5. Agent receives message, processes with delegate, sends response back via WS
6. Server receives WS message, routes to target peer via `state.routeMessage()`

**Heartbeat:** Server calls `ws.ping()` every 30s via `setInterval`. The `ws` library auto-responds with pong on the client side. Server listens for `pong` events and terminates connections that miss 2 consecutive pongs.

**Message routing has two entry points:**
- `POST /messages` (HTTP) — used by skills via curl. Server calls `state.routeMessage()`.
- Incoming WS message `{ type: "message" }` — used by agents. Server calls `state.routeMessage()`.

Both entry points converge on `state.routeMessage()` which pushes to the target peer's WS connection. There is no loop risk because `routeMessage` only pushes to the *target* peer, not back to the sender.

### 4. WebSocket Handler

```typescript
// server/ws/handler.ts
export function setupWebSocket(server: Server, state: ServerState): void
```

- Handles HTTP upgrade requests to `ws://localhost:9100/ws`
- Validates `peerId` query parameter
- Registers WebSocket connection in `ServerState`
- Routes incoming WS messages through `state.routeMessage()`
- Cleans up on disconnect

### 5. AgentWsClient Class

```typescript
// agent/ws-client.ts
class AgentWsClient {
  constructor(serverUrl: string, peerId: string, onMessage: (msg: InboxMessage) => Promise<void>)
  connect(): void
  send(msg: MessageRequest): void
  disconnect(): void
}
```

- Converts HTTP URL to WS URL automatically (`http://` → `ws://`)
- Auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s)
- Handles ping/pong via `ws` library
- Emits parsed `InboxMessage` objects to callback

### 6. Agent Message Processing

`createLocalAgent()` in `agent/index.ts` orchestrates message processing. `AgentWsClient` only handles connection and raw message delivery.

**Flow:**
1. `AgentWsClient.onMessage` fires with `InboxMessage`
2. `createLocalAgent` callback checks: if `msg.replyTo` is set, **skip** (it's a response, not a question)
3. Look up delegate by `msg.agentName` in `delegateMap`
4. Call `delegateRunner(delegate.name, delegate.body, msg.content)`
5. Send response via `client.send()` (WebSocket) with `replyTo: msg.messageId`
6. On delegate error, send `"[Error: delegate failed to respond]"` via same path

**Agents always send responses via WebSocket**, not HTTP POST. Skills (curl) use HTTP POST to send initial messages. This is the key distinction:
- **Skills → HTTP POST → Server → WS push → Agent**
- **Agent → WS send → Server → WS push → Target Agent**

### 7. Input Validators

```typescript
// server/validators.ts
validatePeerRegistration(body: unknown): PeerRegistration    // throws ValidationError
validateMessageRequest(body: unknown): MessageRequest        // throws ValidationError
validateUnregisterRequest(body: unknown): { peerId: string } // throws ValidationError
class ValidationError extends Error { ... }
```

Runtime validation at system boundaries. Internal code trusts validated types.

## Server Lifecycle

```typescript
export interface AgentsServerResult {
  server: Server;   // Node.js http.Server from @hono/node-server
  port: number;     // Actual port (supports port: 0 for random assignment)
}
```

- `@hono/node-server`'s `serve()` returns a Node.js `Server` instance
- Host binding: `127.0.0.1` (localhost only, no external access)
- `port: 0` is supported for tests (random port assignment)
- Hono `notFound` handler returns JSON: `{ error: "not_found", message: "..." }`
- `from` field in `MessageRequest` is optional, defaults to `"anonymous"` in validator

## HTTP API (unchanged endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health |
| GET | `/agents` | List agents (optional `?project=` filter) |
| POST | `/register` | Register peer + agents |
| POST | `/unregister` | Unregister peer |
| POST | `/messages` | Fire-and-forget message send |

## WebSocket Endpoint (new)

| Path | Description |
|------|-------------|
| `ws://localhost:9100/ws?peerId=xxx` | Agent subscription — real-time bidirectional |

## Removed

- `GET /messages/subscribe` (SSE) — replaced by WebSocket
- `sendJson()` helper — replaced by `c.json()`
- `readBody()` helper — replaced by `c.req.json()`
- `handleRequest()` if/else router — replaced by Hono routes
- Agent `ReadableStream` SSE parsing — replaced by `AgentWsClient`

## Migration

Files unchanged: `types.ts`, `config.ts`, `delegate.ts`, `initializer.ts`
Files with minimal changes: `cli.ts` (import paths)
Files replaced entirely: `server.ts` → `server/`, `agent.ts` → `agent/`
New files: `server/state.ts`, `server/validators.ts`, `server/routes/*`, `server/ws/handler.ts`, `agent/ws-client.ts`
