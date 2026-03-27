# Server Refactor: Hono + WebSocket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the agents server from raw `node:http` + SSE to Hono + WebSocket for structured, production-ready architecture.

**Architecture:** Replace monolithic `server.ts` with modular `server/` directory (state, validators, routes, ws handler). Replace SSE in `agent.ts` with `AgentWsClient` class using `ws` library. Hono handles HTTP routing, `ws` handles real-time bidirectional communication.

**Tech Stack:** Hono, @hono/node-server, ws, TypeScript (ESM, strict), Jest

**Spec:** `docs/superpowers/specs/2026-03-27-server-refactor-design.md`

---

## File Structure

```
packages/agents/src/
├── server/
│   ├── index.ts           # createAgentsServer() — Hono app + WS setup
│   ├── state.ts           # ServerState class
│   ├── validators.ts      # ValidationError + validate functions
│   ├── routes/
│   │   ├── health.ts      # GET /health
│   │   ├── agents.ts      # GET /agents, POST /register, POST /unregister
│   │   └── messages.ts    # POST /messages
│   └── ws/
│       └── handler.ts     # WebSocket upgrade, connection, message routing
├── agent/
│   ├── index.ts           # createLocalAgent()
│   └── ws-client.ts       # AgentWsClient class
├── types.ts               # (add WsMessage, StateError)
├── config.ts              # (unchanged)
├── delegate.ts            # (unchanged)
├── initializer.ts         # (unchanged)
└── cli.ts                 # (update imports)

packages/agents/tests/
├── unit/
│   ├── state.test.ts
│   └── validators.test.ts
├── integration/
│   ├── routes.test.ts
│   ├── ws.test.ts
│   └── agent.test.ts
├── config.test.ts         # (unchanged)
├── delegate.test.ts       # (unchanged)
├── initializer.test.ts    # (unchanged)
├── types.test.ts          # (unchanged)
└── fixtures/              # (unchanged)
```

---

### Task 1: Add Dependencies

**Files:**
- Modify: `packages/agents/package.json`

- [ ] **Step 1: Install runtime dependencies**

Run: `cd packages/agents && pnpm add hono @hono/node-server ws`

- [ ] **Step 2: Install dev dependency**

Run: `cd packages/agents && pnpm add -D @types/ws`

- [ ] **Step 3: Update package.json exports**

Update `main` and `exports` to point to new server path:
```json
{
  "main": "dist/server/index.js",
  "types": "dist/server/index.d.ts",
  "exports": {
    "./server": "./dist/server/index.js",
    "./agent": "./dist/agent/index.js",
    "./types": "./dist/types.js",
    "./config": "./dist/config.js",
    "./delegate": "./dist/delegate.js",
    "./initializer": "./dist/initializer.js"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/agents/package.json pnpm-lock.yaml
git commit -m "chore(agents): add hono, @hono/node-server, ws dependencies"
```

---

### Task 2: Types Update

**Files:**
- Modify: `packages/agents/src/types.ts`
- Modify: `packages/agents/tests/types.test.ts`

- [ ] **Step 1: Add WsMessage and StateError types to types.ts**

Add to `packages/agents/src/types.ts`:

```typescript
export interface WsMessage {
  type: string;
  payload: unknown;
}

export interface WsConnectedPayload {
  peerId: string;
}

export class StateError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "StateError";
  }
}
```

Also make `from` optional in `MessageRequest`:
```typescript
export interface MessageRequest {
  from?: string;
  to: string;
  content: string;
  replyTo?: string;
}
```

Remove unused `InboxResponse` and `MessageAck` types.

- [ ] **Step 2: Update types test**

Add to `packages/agents/tests/types.test.ts`:
```typescript
import { StateError } from "../src/types.js";

it("should create StateError with status code", () => {
  const err = new StateError("duplicate", 409);
  expect(err.message).toBe("duplicate");
  expect(err.status).toBe(409);
  expect(err.name).toBe("StateError");
});

it("should allow MessageRequest without from", () => {
  const req: MessageRequest = { to: "brain:researcher", content: "hello" };
  expect(req.from).toBeUndefined();
});
```

- [ ] **Step 3: Run tests**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/types.test.ts -v`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/agents/src/types.ts packages/agents/tests/types.test.ts
git commit -m "feat(agents): add WsMessage, StateError types, make from optional"
```

---

### Task 3: Validators

**Files:**
- Create: `packages/agents/src/server/validators.ts`
- Create: `packages/agents/tests/unit/validators.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/agents/tests/unit/validators.test.ts`:

```typescript
import {
  validatePeerRegistration,
  validateMessageRequest,
  validateUnregisterRequest,
  ValidationError,
} from "../../src/server/validators.js";

describe("validators", () => {
  describe("validatePeerRegistration", () => {
    it("should accept valid registration", () => {
      const result = validatePeerRegistration({
        project: "test",
        agents: [{ name: "researcher", description: "Search" }],
      });
      expect(result.project).toBe("test");
      expect(result.agents).toHaveLength(1);
    });

    it("should reject missing project", () => {
      expect(() => validatePeerRegistration({ agents: [] })).toThrow(ValidationError);
    });

    it("should reject missing agents", () => {
      expect(() => validatePeerRegistration({ project: "test" })).toThrow(ValidationError);
    });

    it("should reject empty agents array", () => {
      expect(() => validatePeerRegistration({ project: "test", agents: [] })).toThrow(ValidationError);
    });

    it("should reject agent without name", () => {
      expect(() => validatePeerRegistration({
        project: "test",
        agents: [{ description: "Search" }],
      })).toThrow(ValidationError);
    });

    it("should reject non-object input", () => {
      expect(() => validatePeerRegistration(null)).toThrow(ValidationError);
      expect(() => validatePeerRegistration("string")).toThrow(ValidationError);
    });
  });

  describe("validateMessageRequest", () => {
    it("should accept valid message with from", () => {
      const result = validateMessageRequest({
        from: "app:user",
        to: "brain:researcher",
        content: "hello",
      });
      expect(result.to).toBe("brain:researcher");
      expect(result.from).toBe("app:user");
    });

    it("should default from to anonymous", () => {
      const result = validateMessageRequest({
        to: "brain:researcher",
        content: "hello",
      });
      expect(result.from).toBe("anonymous");
    });

    it("should reject missing to", () => {
      expect(() => validateMessageRequest({ content: "hello" })).toThrow(ValidationError);
    });

    it("should reject invalid agent ID format", () => {
      expect(() => validateMessageRequest({ to: "nocolon", content: "hello" })).toThrow(ValidationError);
    });

    it("should reject missing content", () => {
      expect(() => validateMessageRequest({ to: "a:b" })).toThrow(ValidationError);
    });

    it("should preserve replyTo", () => {
      const result = validateMessageRequest({
        to: "brain:researcher",
        content: "hello",
        replyTo: "msg-1",
      });
      expect(result.replyTo).toBe("msg-1");
    });
  });

  describe("validateUnregisterRequest", () => {
    it("should accept valid peerId", () => {
      const result = validateUnregisterRequest({ peerId: "uuid-123" });
      expect(result.peerId).toBe("uuid-123");
    });

    it("should reject missing peerId", () => {
      expect(() => validateUnregisterRequest({})).toThrow(ValidationError);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/unit/validators.test.ts -v`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

Create `packages/agents/src/server/validators.ts`:

```typescript
import type { PeerRegistration, MessageRequest } from "../types.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validatePeerRegistration(body: unknown): PeerRegistration {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid body");
  }
  const b = body as Record<string, unknown>;
  if (typeof b.project !== "string" || !b.project) {
    throw new ValidationError("Missing 'project'");
  }
  if (!Array.isArray(b.agents) || b.agents.length === 0) {
    throw new ValidationError("Missing or empty 'agents'");
  }
  for (const agent of b.agents) {
    if (!agent || typeof agent !== "object") {
      throw new ValidationError("Invalid agent entry");
    }
    const a = agent as Record<string, unknown>;
    if (typeof a.name !== "string" || !a.name) {
      throw new ValidationError("Agent missing 'name'");
    }
    if (typeof a.description !== "string") {
      throw new ValidationError("Agent missing 'description'");
    }
  }
  return body as PeerRegistration;
}

export function validateMessageRequest(body: unknown): MessageRequest {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid body");
  }
  const b = body as Record<string, unknown>;
  if (typeof b.to !== "string" || !b.to) {
    throw new ValidationError("Missing 'to'");
  }
  if (!b.to.includes(":")) {
    throw new ValidationError("Invalid agent ID format. Use 'project:agent'");
  }
  if (typeof b.content !== "string" || !b.content) {
    throw new ValidationError("Missing 'content'");
  }
  return {
    from: typeof b.from === "string" ? b.from : "anonymous",
    to: b.to,
    content: b.content,
    replyTo: typeof b.replyTo === "string" ? b.replyTo : undefined,
  };
}

export function validateUnregisterRequest(body: unknown): { peerId: string } {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid body");
  }
  const b = body as Record<string, unknown>;
  if (typeof b.peerId !== "string" || !b.peerId) {
    throw new ValidationError("Missing 'peerId'");
  }
  return { peerId: b.peerId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/unit/validators.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/server/validators.ts packages/agents/tests/unit/validators.test.ts
git commit -m "feat(agents): add input validators with ValidationError"
```

---

### Task 4: ServerState Class

**Files:**
- Create: `packages/agents/src/server/state.ts`
- Create: `packages/agents/tests/unit/state.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/agents/tests/unit/state.test.ts`:

```typescript
import { ServerState } from "../../src/server/state.js";
import { StateError } from "../../src/types.js";

describe("ServerState", () => {
  let state: ServerState;

  beforeEach(() => {
    state = new ServerState();
  });

  describe("register", () => {
    it("should register a peer and return peerId", () => {
      const result = state.register("test", [{ name: "researcher", description: "Search" }]);
      expect(result.peerId).toBeDefined();
      expect(result.registered).toEqual(["test:researcher"]);
    });

    it("should throw StateError for duplicate project", () => {
      state.register("test", [{ name: "a", description: "A" }]);
      expect(() => state.register("test", [{ name: "b", description: "B" }])).toThrow(StateError);
      try {
        state.register("test", [{ name: "b", description: "B" }]);
      } catch (e) {
        expect((e as StateError).status).toBe(409);
      }
    });
  });

  describe("unregister", () => {
    it("should unregister a peer", () => {
      const { peerId } = state.register("test", [{ name: "a", description: "A" }]);
      const result = state.unregister(peerId);
      expect(result.unregistered).toEqual(["test:a"]);
      expect(state.listAgents()).toEqual([]);
    });

    it("should throw StateError for unknown peerId", () => {
      expect(() => state.unregister("nonexistent")).toThrow(StateError);
    });
  });

  describe("findAgent", () => {
    it("should find a registered agent", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      const result = state.findAgent("brain:researcher");
      expect(result).not.toBeNull();
      expect(result!.agentName).toBe("researcher");
    });

    it("should return null for unknown agent", () => {
      expect(state.findAgent("brain:researcher")).toBeNull();
    });

    it("should return null for invalid format", () => {
      expect(state.findAgent("nocolon")).toBeNull();
    });
  });

  describe("listAgents", () => {
    it("should list all agents", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      state.register("app", [{ name: "architect", description: "Design" }]);
      const agents = state.listAgents();
      expect(agents).toHaveLength(2);
    });

    it("should filter by project", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      state.register("app", [{ name: "architect", description: "Design" }]);
      const agents = state.listAgents("brain");
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe("brain:researcher");
    });
  });

  describe("routeMessage", () => {
    it("should return error for unknown agent", () => {
      const result = state.routeMessage({ to: "brain:researcher", content: "hello" });
      expect(result.ok).toBe(false);
    });

    it("should return messageId when agent is registered (no WS)", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      const result = state.routeMessage({ to: "brain:researcher", content: "hello" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.messageId).toBeDefined();
    });
  });

  describe("getHealth", () => {
    it("should return health with peer count", () => {
      state.register("test", [{ name: "a", description: "A" }]);
      const health = state.getHealth();
      expect(health.status).toBe("ok");
      expect(health.peers).toBe(1);
      expect(typeof health.uptime).toBe("number");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/unit/state.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create `packages/agents/src/server/state.ts`:

```typescript
import { randomUUID } from "node:crypto";
import type WebSocket from "ws";
import type {
  AgentInfo,
  RegisteredAgent,
  MessageRequest,
  InboxMessage,
  ServerHealth,
} from "../types.js";
import { StateError } from "../types.js";

interface PeerEntry {
  peerId: string;
  project: string;
  agents: Map<string, AgentInfo>;
  ws: WebSocket | null;
}

export class ServerState {
  private peers = new Map<string, PeerEntry>();
  private projectIndex = new Map<string, string>();
  private startTime = Date.now();

  register(project: string, agents: AgentInfo[]): { peerId: string; registered: string[] } {
    if (this.projectIndex.has(project)) {
      throw new StateError(`Project "${project}" is already registered. Use a different name.`, 409);
    }

    const peerId = randomUUID();
    const agentsMap = new Map<string, AgentInfo>();
    for (const agent of agents) {
      agentsMap.set(agent.name, agent);
    }

    this.peers.set(peerId, { peerId, project, agents: agentsMap, ws: null });
    this.projectIndex.set(project, peerId);

    return {
      peerId,
      registered: agents.map((a) => `${project}:${a.name}`),
    };
  }

  unregister(peerId: string): { unregistered: string[] } {
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new StateError("Peer not registered", 404);
    }

    this.removeConnection(peerId);

    const unregistered = Array.from(peer.agents.keys()).map(
      (name) => `${peer.project}:${name}`,
    );
    this.projectIndex.delete(peer.project);
    this.peers.delete(peerId);

    return { unregistered };
  }

  getPeer(peerId: string): PeerEntry | undefined {
    return this.peers.get(peerId);
  }

  findAgent(agentId: string): { peer: PeerEntry; agentName: string } | null {
    const colonIdx = agentId.indexOf(":");
    if (colonIdx === -1) return null;

    const project = agentId.slice(0, colonIdx);
    const agentName = agentId.slice(colonIdx + 1);

    const peerId = this.projectIndex.get(project);
    if (!peerId) return null;

    const peer = this.peers.get(peerId);
    if (!peer || !peer.agents.has(agentName)) return null;

    return { peer, agentName };
  }

  listAgents(project?: string): RegisteredAgent[] {
    const agents: RegisteredAgent[] = [];
    for (const peer of this.peers.values()) {
      if (project && peer.project !== project) continue;
      for (const [name, info] of peer.agents) {
        agents.push({
          id: `${peer.project}:${name}`,
          description: info.description,
          status: "online",
          peerId: peer.peerId,
        });
      }
    }
    return agents;
  }

  setConnection(peerId: string, ws: WebSocket): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.ws = ws;
    }
  }

  removeConnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer?.ws) {
      try { peer.ws.close(); } catch { /* ignore */ }
      peer.ws = null;
    }
  }

  routeMessage(msg: MessageRequest): { ok: true; messageId: string } | { ok: false; error: string; status: number } {
    const found = this.findAgent(msg.to);
    if (!found) {
      return { ok: false, error: `${msg.to} not registered`, status: 404 };
    }

    const messageId = randomUUID();
    const inboxMsg: InboxMessage = {
      messageId,
      from: msg.from ?? "anonymous",
      to: msg.to,
      agentName: found.agentName,
      content: msg.content,
      replyTo: msg.replyTo ?? null,
      timestamp: Date.now(),
    };

    if (found.peer.ws && found.peer.ws.readyState === 1) {
      found.peer.ws.send(JSON.stringify({ type: "message", payload: inboxMsg }));
    }

    return { ok: true, messageId };
  }

  getHealth(): ServerHealth {
    return {
      status: "ok",
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      peers: this.peers.size,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/unit/state.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/server/state.ts packages/agents/tests/unit/state.test.ts
git commit -m "feat(agents): add ServerState class with peer registry and message routing"
```

---

### Task 5: Hono Routes

**Files:**
- Create: `packages/agents/src/server/routes/health.ts`
- Create: `packages/agents/src/server/routes/agents.ts`
- Create: `packages/agents/src/server/routes/messages.ts`
- Create: `packages/agents/src/server/index.ts`
- Create: `packages/agents/tests/integration/routes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/agents/tests/integration/routes.test.ts`:

```typescript
import { createAgentsServer } from "../../src/server/index.js";
import type { Server } from "node:http";

describe("routes", () => {
  let server: Server;
  let port: number;

  beforeEach(async () => {
    const result = await createAgentsServer({ port: 0 });
    server = result.server;
    port = result.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe("GET /health", () => {
    it("should return ok status", async () => {
      const res = await fetch(`http://localhost:${port}/health`);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.status).toBe("ok");
      expect(typeof body.uptime).toBe("number");
      expect(body.peers).toBe(0);
    });
  });

  describe("GET /agents", () => {
    it("should return empty list initially", async () => {
      const res = await fetch(`http://localhost:${port}/agents`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it("should filter by project", async () => {
      await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "brain", agents: [{ name: "r", description: "R" }] }),
      });
      const res = await fetch(`http://localhost:${port}/agents?project=brain`);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe("brain:r");

      const res2 = await fetch(`http://localhost:${port}/agents?project=other`);
      expect(await res2.json()).toEqual([]);
    });
  });

  describe("POST /register", () => {
    it("should register and return peerId", async () => {
      const res = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "test", agents: [{ name: "a", description: "A" }] }),
      });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.peerId).toBeDefined();
      expect(body.registered).toEqual(["test:a"]);
    });

    it("should reject duplicate project (409)", async () => {
      await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "dup", agents: [{ name: "a", description: "A" }] }),
      });
      const res = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "dup", agents: [{ name: "b", description: "B" }] }),
      });
      expect(res.status).toBe(409);
    });

    it("should reject invalid body (400)", async () => {
      const res = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "test" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /unregister", () => {
    it("should unregister a peer", async () => {
      const regRes = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "test", agents: [{ name: "a", description: "A" }] }),
      });
      const { peerId } = await regRes.json();

      const res = await fetch(`http://localhost:${port}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      });
      expect(res.status).toBe(200);
      expect(await (await fetch(`http://localhost:${port}/agents`)).json()).toEqual([]);
    });
  });

  describe("POST /messages", () => {
    it("should return 404 for unknown agent", async () => {
      const res = await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "brain:researcher", content: "hello" }),
      });
      expect(res.status).toBe(404);
    });

    it("should return messageId for known agent", async () => {
      await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "brain", agents: [{ name: "r", description: "R" }] }),
      });
      const res = await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "brain:r", content: "hello" }),
      });
      expect(res.status).toBe(200);
      expect((await res.json()).messageId).toBeDefined();
    });

    it("should return 400 for invalid body", async () => {
      const res = await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "hello" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("404 handler", () => {
    it("should return JSON for unknown routes", async () => {
      const res = await fetch(`http://localhost:${port}/nonexistent`);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("not_found");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/integration/routes.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write route files**

Create `packages/agents/src/server/routes/health.ts`:
```typescript
import { Hono } from "hono";
import type { ServerState } from "../state.js";

export function healthRoutes(state: ServerState): Hono {
  const app = new Hono();
  app.get("/health", (c) => c.json(state.getHealth()));
  return app;
}
```

Create `packages/agents/src/server/routes/agents.ts`:
```typescript
import { Hono } from "hono";
import type { ServerState } from "../state.js";
import { validatePeerRegistration, validateUnregisterRequest } from "../validators.js";

export function agentRoutes(state: ServerState): Hono {
  const app = new Hono();

  app.get("/agents", (c) => {
    const project = c.req.query("project");
    return c.json(state.listAgents(project));
  });

  app.post("/register", async (c) => {
    const body = validatePeerRegistration(await c.req.json());
    return c.json(state.register(body.project, body.agents));
  });

  app.post("/unregister", async (c) => {
    const body = validateUnregisterRequest(await c.req.json());
    return c.json(state.unregister(body.peerId));
  });

  return app;
}
```

Create `packages/agents/src/server/routes/messages.ts`:
```typescript
import { Hono } from "hono";
import type { ServerState } from "../state.js";
import { validateMessageRequest } from "../validators.js";

export function messageRoutes(state: ServerState): Hono {
  const app = new Hono();

  app.post("/messages", async (c) => {
    const msg = validateMessageRequest(await c.req.json());
    const result = state.routeMessage(msg);
    if (!result.ok) {
      return c.json({ error: "agent_not_found", message: result.error }, result.status as 404);
    }
    return c.json({ messageId: result.messageId });
  });

  return app;
}
```

- [ ] **Step 4: Write server/index.ts**

Create `packages/agents/src/server/index.ts`:
```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { Server } from "node:http";
import { ServerState } from "./state.js";
import { healthRoutes } from "./routes/health.js";
import { agentRoutes } from "./routes/agents.js";
import { messageRoutes } from "./routes/messages.js";
import { ValidationError } from "./validators.js";
import { StateError } from "../types.js";

export { ServerState } from "./state.js";
export { ValidationError } from "./validators.js";

export interface AgentsServerResult {
  server: Server;
  port: number;
  state: ServerState;
}

export async function createAgentsServer(opts: { port: number }): Promise<AgentsServerResult> {
  const state = new ServerState();

  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof ValidationError) {
      return c.json({ error: "bad_request", message: err.message }, 400);
    }
    if (err instanceof StateError) {
      return c.json({ error: "state_error", message: err.message }, { status: err.status });
    }
    return c.json({ error: "internal_error", message: "Unexpected server error" }, 500);
  });

  app.notFound((c) => {
    return c.json({ error: "not_found", message: `${c.req.method} ${c.req.path} not found` }, 404);
  });

  app.route("/", healthRoutes(state));
  app.route("/", agentRoutes(state));
  app.route("/", messageRoutes(state));

  return new Promise((resolve) => {
    const httpServer = serve(
      { fetch: app.fetch, port: opts.port, hostname: "127.0.0.1" },
      (info) => {
        // Setup WebSocket BEFORE resolving (avoid race condition)
        const wss = setupWebSocket(httpServer as unknown as Server, state);

        // Override server.close to also clean up WebSocket connections
        const originalClose = (httpServer as unknown as Server).close.bind(httpServer);
        (httpServer as unknown as Server).close = ((cb?: (err?: Error) => void) => {
          wss.close();
          return originalClose(cb);
        }) as Server["close"];

        resolve({ server: httpServer as unknown as Server, port: info.port, state });
      },
    );
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/integration/routes.test.ts -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/agents/src/server/
git commit -m "feat(agents): add Hono routes with validation and error handling"
```

---

### Task 6: WebSocket Handler

**Files:**
- Create: `packages/agents/src/server/ws/handler.ts`
- Create: `packages/agents/tests/integration/ws.test.ts`
- Modify: `packages/agents/src/server/index.ts` (add WS setup)

- [ ] **Step 1: Write the failing test**

Create `packages/agents/tests/integration/ws.test.ts`:

```typescript
import { createAgentsServer } from "../../src/server/index.js";
import WebSocket from "ws";
import type { Server } from "node:http";
import type { InboxMessage, WsMessage } from "../../src/types.js";

describe("websocket", () => {
  let server: Server;
  let port: number;

  beforeEach(async () => {
    const result = await createAgentsServer({ port: 0 });
    server = result.server;
    port = result.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("should accept WS connection with valid peerId", async () => {
    const regRes = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "test", agents: [{ name: "a", description: "A" }] }),
    });
    const { peerId } = await regRes.json();

    const ws = new WebSocket(`ws://localhost:${port}/ws?peerId=${peerId}`);
    const msg = await new Promise<WsMessage>((resolve) => {
      ws.on("message", (data) => resolve(JSON.parse(data.toString())));
    });
    expect(msg.type).toBe("connected");
    ws.close();
  });

  it("should reject WS connection with invalid peerId", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws?peerId=invalid`);
    const code = await new Promise<number>((resolve) => {
      ws.on("close", (code) => resolve(code));
    });
    expect(code).toBe(4001);
  });

  it("should push messages via WS in real-time", async () => {
    const regRes = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "brain", agents: [{ name: "researcher", description: "Search" }] }),
    });
    const { peerId } = await regRes.json();

    const ws = new WebSocket(`ws://localhost:${port}/ws?peerId=${peerId}`);
    // Wait for connected message
    await new Promise<void>((resolve) => {
      ws.on("message", () => resolve());
    });

    // Send a message via HTTP
    const msgPromise = new Promise<InboxMessage>((resolve) => {
      ws.on("message", (data) => {
        const msg = JSON.parse(data.toString()) as WsMessage;
        if (msg.type === "message") resolve(msg.payload as InboxMessage);
      });
    });

    await fetch(`http://localhost:${port}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "app:user", to: "brain:researcher", content: "Hello WS!" }),
    });

    const received = await msgPromise;
    expect(received.content).toBe("Hello WS!");
    expect(received.agentName).toBe("researcher");
    expect(received.replyTo).toBeNull();

    ws.close();
  }, 10_000);

  it("should route WS messages from agent to target peer", async () => {
    // Register two peers
    const regA = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "app", agents: [{ name: "user", description: "User" }] }),
    });
    const { peerId: peerA } = await regA.json();

    const regB = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "brain", agents: [{ name: "researcher", description: "Search" }] }),
    });
    const { peerId: peerB } = await regB.json();

    // Connect both via WS
    const wsA = new WebSocket(`ws://localhost:${port}/ws?peerId=${peerA}`);
    const wsB = new WebSocket(`ws://localhost:${port}/ws?peerId=${peerB}`);
    await Promise.all([
      new Promise<void>((r) => wsA.on("message", () => r())),
      new Promise<void>((r) => wsB.on("message", () => r())),
    ]);

    // B sends a message to A via WS
    const msgPromise = new Promise<InboxMessage>((resolve) => {
      wsA.on("message", (data) => {
        const msg = JSON.parse(data.toString()) as WsMessage;
        if (msg.type === "message") resolve(msg.payload as InboxMessage);
      });
    });

    wsB.send(JSON.stringify({
      type: "message",
      payload: { from: "brain:researcher", to: "app:user", content: "Answer!", replyTo: "msg-1" },
    }));

    const received = await msgPromise;
    expect(received.content).toBe("Answer!");
    expect(received.replyTo).toBe("msg-1");

    wsA.close();
    wsB.close();
  }, 10_000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/integration/ws.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write WebSocket handler**

Create `packages/agents/src/server/ws/handler.ts`:

```typescript
import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import type { IncomingMessage } from "node:http";
import type { ServerState } from "../state.js";
import type { WsMessage, MessageRequest } from "../../types.js";
import { validateMessageRequest } from "../validators.js";

const PING_INTERVAL = 30_000;

export function setupWebSocket(server: Server, state: ServerState): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }

    const peerId = url.searchParams.get("peerId");

    wss.handleUpgrade(req, socket, head, (ws) => {
      if (!peerId || !state.getPeer(peerId)) {
        ws.close(4001, "Unknown peerId");
        return;
      }
      handleConnection(ws, peerId, state);
    });
  });

  return wss;
}

function handleConnection(ws: WebSocket, peerId: string, state: ServerState): void {
  state.setConnection(peerId, ws);

  // Send connected confirmation
  ws.send(JSON.stringify({ type: "connected", payload: { peerId } }));

  // Heartbeat — terminate after 2 consecutive missed pongs
  let missedPongs = 0;
  const pingInterval = setInterval(() => {
    if (missedPongs >= 2) {
      ws.terminate();
      return;
    }
    missedPongs++;
    ws.ping();
  }, PING_INTERVAL);

  ws.on("pong", () => {
    missedPongs = 0;
  });

  // Handle incoming messages from agent
  ws.on("message", (data) => {
    try {
      const wsMsg = JSON.parse(data.toString()) as WsMessage;
      if (wsMsg.type === "message") {
        const msg = validateMessageRequest(wsMsg.payload);
        state.routeMessage(msg);
      }
    } catch {
      // Invalid message, ignore
    }
  });

  // Cleanup
  ws.on("close", () => {
    clearInterval(pingInterval);
    state.removeConnection(peerId);
  });
}
```

- [ ] **Step 4: Update server/index.ts to import setupWebSocket**

Add import to `packages/agents/src/server/index.ts`:
```typescript
import { setupWebSocket } from "./ws/handler.js";
```

The `createAgentsServer` function from Task 5 already calls `setupWebSocket` inside the `serve` callback (before `resolve`). Verify the import resolves correctly.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/integration/ws.test.ts -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/agents/src/server/ws/ packages/agents/src/server/index.ts packages/agents/tests/integration/ws.test.ts
git commit -m "feat(agents): add WebSocket handler with real-time push and heartbeat"
```

---

### Task 7: AgentWsClient

**Files:**
- Create: `packages/agents/src/agent/ws-client.ts`
- Create: `packages/agents/src/agent/index.ts`
- Create: `packages/agents/tests/integration/agent.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/agents/tests/integration/agent.test.ts`:

```typescript
import { createAgentsServer } from "../../src/server/index.js";
import { createLocalAgent } from "../../src/agent/index.js";
import WebSocket from "ws";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import type { InboxMessage, WsMessage } from "../../src/types.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures");

describe("agent (WS)", () => {
  let server: Server;
  let port: number;

  beforeEach(async () => {
    const result = await createAgentsServer({ port: 0 });
    server = result.server;
    port = result.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("should register delegates and connect via WS", async () => {
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async (_n, _b, c) => `Echo: ${c}`,
    });

    const res = await fetch(`http://localhost:${port}/agents`);
    const agents = await res.json();
    expect(agents).toHaveLength(1);
    expect(agents[0].id).toBe("test:researcher");

    await agent.shutdown();
  });

  it("should receive messages via WS and respond with replyTo", async () => {
    // Register sender
    const senderReg = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "other", agents: [{ name: "user", description: "User" }] }),
    });
    const { peerId: senderPeerId } = await senderReg.json();

    // Connect sender WS to receive response
    const senderWs = new WebSocket(`ws://localhost:${port}/ws?peerId=${senderPeerId}`);
    await new Promise<void>((r) => senderWs.on("message", () => r()));

    // Create agent
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async (_n, _b, content) => `Response to: ${content}`,
    });

    // Send message
    const msgRes = await fetch(`http://localhost:${port}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "other:user", to: "test:researcher", content: "Question?" }),
    });
    const { messageId } = await msgRes.json();

    // Wait for response on sender's WS
    const reply = await new Promise<InboxMessage>((resolve) => {
      senderWs.on("message", (data) => {
        const msg = JSON.parse(data.toString()) as WsMessage;
        if (msg.type === "message") resolve(msg.payload as InboxMessage);
      });
    });

    expect(reply.content).toBe("Response to: Question?");
    expect(reply.replyTo).toBe(messageId);

    senderWs.close();
    await agent.shutdown();
  }, 15_000);

  it("should skip replyTo messages (not invoke delegateRunner)", async () => {
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async () => { throw new Error("should not be called"); },
    });

    // Register another peer
    await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "other", agents: [{ name: "bot", description: "Bot" }] }),
    });

    // Send a replyTo message
    await fetch(`http://localhost:${port}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "other:bot",
        to: "test:researcher",
        content: "This is a response",
        replyTo: "some-id",
      }),
    });

    // Give time for WS delivery
    await new Promise((r) => setTimeout(r, 200));
    await agent.shutdown();
  }, 10_000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/integration/agent.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write AgentWsClient**

Create `packages/agents/src/agent/ws-client.ts`:

```typescript
import WebSocket from "ws";
import type { InboxMessage, WsMessage } from "../types.js";

export class AgentWsClient {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(
    private readonly wsUrl: string,
    private readonly peerId: string,
    private readonly onMessage: (msg: InboxMessage) => Promise<void>,
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.wsUrl}/ws?peerId=${this.peerId}`;
      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        this.reconnectAttempt = 0;
      });

      this.ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString()) as WsMessage;
          if (msg.type === "connected") {
            resolve();
            return;
          }
          if (msg.type === "message") {
            this.onMessage(msg.payload as InboxMessage).catch(() => {});
          }
        } catch {
          // ignore parse errors
        }
      });

      this.ws.on("close", () => {
        if (!this.closed) {
          this.scheduleReconnect();
        }
      });

      this.ws.on("error", (err) => {
        if (this.reconnectAttempt === 0 && !this.ws?.readyState) {
          reject(err);
        }
      });
    });
  }

  send(msg: { from: string; to: string; content: string; replyTo?: string }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "message", payload: msg }));
    }
  }

  disconnect(): void {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30_000);
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via close handler
      });
    }, delay);
  }

  static httpToWs(httpUrl: string): string {
    return httpUrl.replace(/^http/, "ws");
  }
}
```

- [ ] **Step 4: Write agent/index.ts**

Create `packages/agents/src/agent/index.ts`:

```typescript
import { loadAllDelegates } from "../delegate.js";
import { AgentWsClient } from "./ws-client.js";
import type { DelegateDefinition, InboxMessage } from "../types.js";

export type DelegateRunner = (name: string, systemPrompt: string, userMessage: string) => Promise<string>;

export interface LocalAgentOptions {
  serverUrl: string;
  project: string;
  delegatesDir: string;
  delegateRunner: DelegateRunner;
}

export interface LocalAgent {
  peerId: string;
  delegates: DelegateDefinition[];
  shutdown: () => Promise<void>;
}

export async function createLocalAgent(opts: LocalAgentOptions): Promise<LocalAgent> {
  const delegates = loadAllDelegates(opts.delegatesDir);

  // Register via HTTP
  const regRes = await fetch(`${opts.serverUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: opts.project,
      agents: delegates.map((d) => ({ name: d.name, description: d.description })),
    }),
  });

  if (!regRes.ok) {
    const err = await regRes.json();
    throw new Error(`Registration failed: ${(err as { message: string }).message}`);
  }

  const { peerId } = (await regRes.json()) as { peerId: string };

  const delegateMap = new Map<string, DelegateDefinition>();
  for (const d of delegates) {
    delegateMap.set(d.name, d);
  }

  // Connect via WebSocket
  const wsUrl = AgentWsClient.httpToWs(opts.serverUrl);
  const client = new AgentWsClient(wsUrl, peerId, async (msg: InboxMessage) => {
    // Skip responses (replyTo set)
    if (msg.replyTo) return;

    const delegate = delegateMap.get(msg.agentName);
    if (!delegate) return;

    try {
      const response = await opts.delegateRunner(delegate.name, delegate.body, msg.content);
      client.send({
        from: `${opts.project}:${msg.agentName}`,
        to: msg.from,
        content: response,
        replyTo: msg.messageId,
      });
    } catch {
      client.send({
        from: `${opts.project}:${msg.agentName}`,
        to: msg.from,
        content: "[Error: delegate failed to respond]",
        replyTo: msg.messageId,
      });
    }
  });

  await client.connect();

  return {
    peerId,
    delegates,
    shutdown: async () => {
      client.disconnect();
      await fetch(`${opts.serverUrl}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      }).catch(() => {});
    },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/integration/agent.test.ts -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/agents/src/agent/ packages/agents/tests/integration/agent.test.ts
git commit -m "feat(agents): add AgentWsClient with auto-reconnect and delegate dispatch"
```

---

### Task 8: CLI Update + Cleanup

**Files:**
- Modify: `packages/agents/src/cli.ts`
- Delete: `packages/agents/src/server.ts` (old monolithic)
- Delete: `packages/agents/src/agent.ts` (old SSE)
- Delete: `packages/agents/tests/server.test.ts` (replaced by integration/routes + ws)
- Delete: `packages/agents/tests/agent.test.ts` (replaced by integration/agent)

- [ ] **Step 1: Update cli.ts imports**

Change imports in `packages/agents/src/cli.ts`:
```typescript
// Before
import { createAgentsServer } from "./server.js";
import { createLocalAgent } from "./agent.js";

// After
import { createAgentsServer } from "./server/index.js";
import { createLocalAgent } from "./agent/index.js";
```

Also update the help text: change "poll for messages" to "subscribe via WebSocket".

- [ ] **Step 2: Delete old files**

```bash
rm packages/agents/src/server.ts
rm packages/agents/src/agent.ts
rm packages/agents/tests/server.test.ts
rm packages/agents/tests/agent.test.ts
```

- [ ] **Step 3: Build and run all tests**

Run: `cd packages/agents && pnpm run build`
Expected: compiles without errors

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest --verbose`
Expected: ALL PASS

Run: `cd /Users/jungyoun/Documents/dev/claude-plugin && pnpm run build && pnpm test`
Expected: ALL packages build and test

- [ ] **Step 4: Commit**

```bash
git add -A packages/agents/
git commit -m "refactor(agents): remove old server.ts/agent.ts, update CLI imports"
```

---

### Task 9: Version Bump

**Files:**
- Modify: `packages/agents/package.json`
- Modify: `packages/agents/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Bump versions**

Bump `@rulebased/agents` from `0.1.0` to `0.2.0` (minor — architecture change):
- `packages/agents/package.json` → `0.2.0`
- `packages/agents/.claude-plugin/plugin.json` → `0.2.0`
- `.claude-plugin/marketplace.json` → agents entry `0.2.0`, top-level `1.4.11`
- `package.json` (root) → `1.4.11`

- [ ] **Step 2: Final full build and test**

Run: `cd /Users/jungyoun/Documents/dev/claude-plugin && pnpm install && pnpm run build && pnpm test`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add packages/agents/package.json packages/agents/.claude-plugin/plugin.json .claude-plugin/marketplace.json package.json
git commit -m "chore(agents): bump to 0.2.0 — Hono + WebSocket architecture"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Add dependencies | package.json |
| 2 | Types update | types.ts |
| 3 | Validators | server/validators.ts |
| 4 | ServerState class | server/state.ts |
| 5 | Hono routes + server index | server/routes/*, server/index.ts |
| 6 | WebSocket handler | server/ws/handler.ts |
| 7 | AgentWsClient + agent index | agent/ws-client.ts, agent/index.ts |
| 8 | CLI update + cleanup | cli.ts, delete old files |
| 9 | Version bump | package.json, plugin.json, marketplace |
