# @rulebased/agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that enables cross-repo AI agent communication via a local HTTP server, with sandboxed delegate agents.

**Architecture:** Three components in one npm package — HTTP server (message routing + peer registry), local agent (delegate spawner + server client), Claude Code plugin (7 skills + hooks). Phase 1 uses synchronous HTTP only, no WebSocket.

**Tech Stack:** Node.js built-in `http` module, TypeScript (ESM, strict), Jest for tests, pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-03-27-rulebased-agents-design.md`

---

## File Structure

```
packages/agents/
├── .claude-plugin/
│   └── plugin.json
├── src/
│   ├── types.ts            # Shared types (Agent, Peer, Message, Config)
│   ├── config.ts           # Config loading/saving (.rulebased/agents/config.json)
│   ├── server.ts           # HTTP server (routes, peer registry, message routing)
│   ├── agent.ts            # Local agent (server client, delegate spawning, polling)
│   ├── delegate.ts         # Delegate loader (parse .md, extract frontmatter + body)
│   ├── cli.ts              # CLI entry point (serve, agent, status subcommands)
│   └── initializer.ts      # Init logic (create .rulebased/agents/ structure)
├── tests/
│   ├── fixtures/
│   │   ├── delegates/
│   │   │   └── researcher.md
│   │   └── config.json
│   ├── types.test.ts
│   ├── config.test.ts
│   ├── server.test.ts
│   ├── agent.test.ts
│   ├── delegate.test.ts
│   └── initializer.test.ts
├── skills/
│   ├── init/
│   │   └── SKILL.md
│   ├── create/
│   │   └── SKILL.md
│   ├── online/
│   │   └── SKILL.md
│   ├── offline/
│   │   └── SKILL.md
│   ├── ask/
│   │   └── SKILL.md
│   ├── list/
│   │   └── SKILL.md
│   └── status/
│       └── SKILL.md
├── commands/
│   ├── init.md
│   ├── create.md
│   ├── online.md
│   ├── offline.md
│   ├── ask.md
│   ├── list.md
│   └── status.md
├── hooks/
│   ├── hooks.json
│   └── scripts/
│       └── resolve-plugin-path.sh
├── docs/
│   ├── init.md
│   ├── create.md
│   ├── online.md
│   ├── offline.md
│   ├── ask.md
│   ├── list.md
│   └── status.md
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

### Task 1: Package Scaffolding

**Files:**
- Create: `packages/agents/package.json`
- Create: `packages/agents/tsconfig.json`
- Create: `packages/agents/jest.config.js`
- Create: `packages/agents/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `package.json` (root — add publish:agents script)

- [ ] **Step 1: Create `packages/agents/package.json`**

```json
{
  "name": "@rulebased/agents",
  "version": "0.1.0",
  "description": "Cross-repo AI agent communication for Claude Code",
  "type": "module",
  "bin": {
    "agents": "dist/cli.js"
  },
  "main": "dist/server.js",
  "types": "dist/server.d.ts",
  "exports": {
    "./server": "./dist/server.js",
    "./agent": "./dist/agent.js",
    "./types": "./dist/types.js",
    "./config": "./dist/config.js",
    "./delegate": "./dist/delegate.js",
    "./initializer": "./dist/initializer.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest",
    "test:watch": "NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest --watch",
    "lint": "tsc --noEmit && biome check src/"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.5.0"
  },
  "files": [
    "dist/",
    "skills/",
    "commands/",
    "hooks/",
    "docs/",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rulebased-io/claude-plugin.git"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create `packages/agents/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "tests"]
}
```

- [ ] **Step 3: Create `packages/agents/jest.config.js`**

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "Node16",
          moduleResolution: "Node16",
          isolatedModules: true,
        },
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
  ],
  testTimeout: 30000,
  verbose: true,
};
```

- [ ] **Step 4: Create `packages/agents/.claude-plugin/plugin.json`**

```json
{
  "name": "rulebased-agents",
  "description": "Cross-repo AI agent communication — init, create, online, offline, ask, list, status",
  "version": "0.1.0",
  "author": {
    "name": "rulebased.io"
  },
  "homepage": "https://rulebased.io",
  "repository": "https://github.com/rulebased-io/claude-plugin",
  "license": "MIT"
}
```

- [ ] **Step 5: Add to marketplace.json**

Add to `.claude-plugin/marketplace.json` plugins array:
```json
{
  "name": "rulebased-agents",
  "description": "Cross-repo AI agent communication — init, create, online, offline, ask, list, status",
  "source": "./packages/agents",
  "version": "0.1.0",
  "category": "communication",
  "author": {
    "name": "rulebased.io",
    "email": "jungyoun@rulebased.io"
  }
}
```

Bump root `package.json` version and `marketplace.json` version to `1.4.10` (patch — per AGENTS.md marketplace version rule).

- [ ] **Step 6: Add root scripts**

Add to root `package.json` scripts:
```json
"publish:agents": "cd packages/agents && npm publish"
```

- [ ] **Step 7: Run `pnpm install` and verify build**

Run: `pnpm install`
Expected: workspace detects new package

- [ ] **Step 8: Commit**

```bash
git add packages/agents/package.json packages/agents/tsconfig.json packages/agents/jest.config.js packages/agents/.claude-plugin/plugin.json .claude-plugin/marketplace.json package.json
git commit -m "chore: scaffold packages/agents with build config and marketplace entry"
```

---

### Task 2: Types Module

**Files:**
- Create: `packages/agents/src/types.ts`
- Create: `packages/agents/tests/types.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/types.test.ts
import type {
  AgentConfig,
  DelegateDefinition,
  PeerRegistration,
  AgentInfo,
  Message,
  MessageResponse,
  ServerHealth,
} from "../src/types.js";

describe("types", () => {
  it("should allow creating a valid AgentConfig", () => {
    const config: AgentConfig = {
      project: "my-project",
      server: { port: 9100 },
    };
    expect(config.project).toBe("my-project");
    expect(config.server.port).toBe(9100);
  });

  it("should allow creating a valid DelegateDefinition", () => {
    const delegate: DelegateDefinition = {
      name: "researcher",
      description: "Knowledge search specialist",
      body: "You are a search delegate...",
    };
    expect(delegate.name).toBe("researcher");
  });

  it("should allow creating a valid Message", () => {
    const msg: Message = {
      id: "msg-1",
      from: "app:user",
      to: "brain:researcher",
      content: "Hello",
      timestamp: Date.now(),
    };
    expect(msg.to).toBe("brain:researcher");
  });

  it("should allow creating a valid PeerRegistration", () => {
    const reg: PeerRegistration = {
      project: "my-project",
      agents: [{ name: "researcher", description: "Search" }],
    };
    expect(reg.agents).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/types.test.ts -v`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// src/types.ts
export interface ServerConfig {
  port: number;
  host?: string;
}

export interface AgentConfig {
  project: string;
  server: ServerConfig;
}

export interface DelegateDefinition {
  name: string;
  description: string;
  body: string;
}

export interface AgentInfo {
  name: string;
  description: string;
}

export interface PeerRegistration {
  project: string;
  agents: AgentInfo[];
}

export interface RegisteredAgent {
  id: string;
  description: string;
  status: "online" | "offline";
  peerId: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

export interface MessageRequest {
  from: string;
  to: string;
  content: string;
}

export interface MessageResponse {
  response: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface ServerHealth {
  status: "ok";
  uptime: number;
  peers: number;
}

export interface PendingMessage {
  messageId: string;
  from: string;
  agentName: string;
  content: string;
  timestamp: number;
}

export interface PendingMessagesResponse {
  messages: PendingMessage[];
}

export interface MessageResult {
  messageId: string;
  response: string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/types.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/types.ts packages/agents/tests/types.test.ts
git commit -m "feat(agents): add core type definitions"
```

---

### Task 3: Config Module

**Files:**
- Create: `packages/agents/src/config.ts`
- Create: `packages/agents/tests/config.test.ts`
- Create: `packages/agents/tests/fixtures/config.json`

- [ ] **Step 1: Create test fixture**

```
// tests/fixtures/.rulebased/agents/config.json
{
  "project": "test-project",
  "server": {
    "port": 9100
  }
}
```

Note: The fixture `config.json` must be at `tests/fixtures/.rulebased/agents/config.json` to match the real directory structure.

- [ ] **Step 2: Write the failing test**

```typescript
// tests/config.test.ts
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, getDefaultConfig } from "../src/config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

describe("config", () => {
  describe("getDefaultConfig", () => {
    it("should return default config with given project name", () => {
      const config = getDefaultConfig("my-project");
      expect(config.project).toBe("my-project");
      expect(config.server.port).toBe(9100);
    });
  });

  describe("loadConfig", () => {
    it("should load config from project root (cwd)", () => {
      const config = loadConfig(fixturesDir);
      expect(config).not.toBeNull();
      expect(config!.project).toBe("test-project");
      expect(config!.server.port).toBe(9100);
    });

    it("should return null if config does not exist", () => {
      const config = loadConfig("/nonexistent/path");
      expect(config).toBeNull();
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/config.test.ts -v`
Expected: FAIL

- [ ] **Step 4: Write implementation**

```typescript
// src/config.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AgentConfig } from "./types.js";

const CONFIG_DIR = ".rulebased/agents";
const CONFIG_FILE = "config.json";

export function getDefaultConfig(project: string): AgentConfig {
  return {
    project,
    server: { port: 9100 },
  };
}

export function loadConfig(cwd: string): AgentConfig | null {
  const configPath = getConfigPath(cwd);
  if (!existsSync(configPath)) {
    return null;
  }
  const raw = readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as AgentConfig;
}

export function getConfigDir(cwd: string): string {
  return join(cwd, CONFIG_DIR);
}

export function getConfigPath(cwd: string): string {
  return join(cwd, CONFIG_DIR, CONFIG_FILE);
}

export function getDelegatesDir(cwd: string): string {
  return join(cwd, CONFIG_DIR, "delegates");
}

export function getLogsDir(cwd: string): string {
  return join(cwd, CONFIG_DIR, "logs");
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/config.test.ts -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/agents/src/config.ts packages/agents/tests/config.test.ts packages/agents/tests/fixtures/config.json
git commit -m "feat(agents): add config loading and path helpers"
```

---

### Task 4: Delegate Loader

**Files:**
- Create: `packages/agents/src/delegate.ts`
- Create: `packages/agents/tests/delegate.test.ts`
- Create: `packages/agents/tests/fixtures/delegates/researcher.md`

- [ ] **Step 1: Create test fixture**

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

Save to `tests/fixtures/delegates/researcher.md`

- [ ] **Step 2: Write the failing test**

```typescript
// tests/delegate.test.ts
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDelegate, loadAllDelegates } from "../src/delegate.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

describe("delegate", () => {
  describe("loadDelegate", () => {
    it("should parse frontmatter and body from delegate .md file", () => {
      const delegate = loadDelegate(join(fixturesDir, "delegates", "researcher.md"));
      expect(delegate.name).toBe("researcher");
      expect(delegate.description).toBe("Knowledge base search specialist");
      expect(delegate.body).toContain("You are a search delegate");
      expect(delegate.body).toContain("Disclosure scope");
    });

    it("should throw for non-existent file", () => {
      expect(() => loadDelegate("/nonexistent.md")).toThrow();
    });
  });

  describe("loadAllDelegates", () => {
    it("should load all .md files from delegates directory", () => {
      const delegates = loadAllDelegates(join(fixturesDir, "delegates"));
      expect(delegates).toHaveLength(1);
      expect(delegates[0].name).toBe("researcher");
    });

    it("should return empty array for non-existent directory", () => {
      const delegates = loadAllDelegates("/nonexistent");
      expect(delegates).toEqual([]);
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/delegate.test.ts -v`
Expected: FAIL

- [ ] **Step 4: Write implementation**

```typescript
// src/delegate.ts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { DelegateDefinition } from "./types.js";

export function loadDelegate(filePath: string): DelegateDefinition {
  const raw = readFileSync(filePath, "utf-8");
  return parseDelegateMarkdown(raw);
}

export function loadAllDelegates(dirPath: string): DelegateDefinition[] {
  if (!existsSync(dirPath)) {
    return [];
  }
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
  return files.map((f) => loadDelegate(join(dirPath, f)));
}

export function parseDelegateMarkdown(content: string): DelegateDefinition {
  const normalized = content.replace(/\r\n/g, "\n");
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error("Invalid delegate file: missing frontmatter");
  }

  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();

  const name = extractField(frontmatter, "name");
  const description = extractField(frontmatter, "description");

  if (!name) {
    throw new Error("Invalid delegate file: missing 'name' in frontmatter");
  }
  if (!description) {
    throw new Error("Invalid delegate file: missing 'description' in frontmatter");
  }

  return { name, description, body };
}

function extractField(frontmatter: string, field: string): string {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/delegate.test.ts -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/agents/src/delegate.ts packages/agents/tests/delegate.test.ts packages/agents/tests/fixtures/delegates/researcher.md
git commit -m "feat(agents): add delegate markdown loader with frontmatter parsing"
```

---

### Task 5: Initializer

**Files:**
- Create: `packages/agents/src/initializer.ts`
- Create: `packages/agents/tests/initializer.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/initializer.test.ts
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initAgents } from "../src/initializer.js";

describe("initializer", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "agents-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("should create .rulebased/agents/ directory structure", () => {
    const result = initAgents(tempDir, "test-project");

    expect(result.created).toBe(true);
    expect(existsSync(join(tempDir, ".rulebased/agents/config.json"))).toBe(true);
    expect(existsSync(join(tempDir, ".rulebased/agents/delegates"))).toBe(true);
    expect(existsSync(join(tempDir, ".rulebased/agents/logs"))).toBe(true);
  });

  it("should write correct config.json", () => {
    initAgents(tempDir, "test-project");

    const config = JSON.parse(
      readFileSync(join(tempDir, ".rulebased/agents/config.json"), "utf-8")
    );
    expect(config.project).toBe("test-project");
    expect(config.server.port).toBe(9100);
  });

  it("should not overwrite existing config", () => {
    initAgents(tempDir, "first-project");
    const result = initAgents(tempDir, "second-project");

    expect(result.created).toBe(false);
    const config = JSON.parse(
      readFileSync(join(tempDir, ".rulebased/agents/config.json"), "utf-8")
    );
    expect(config.project).toBe("first-project");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/initializer.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/initializer.ts
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getConfigDir, getConfigPath, getDelegatesDir, getLogsDir, getDefaultConfig } from "./config.js";

export interface InitResult {
  created: boolean;
  configPath: string;
  message: string;
}

export function initAgents(cwd: string, project: string): InitResult {
  const configDir = getConfigDir(cwd);
  const configPath = getConfigPath(cwd);
  const delegatesDir = getDelegatesDir(cwd);
  const logsDir = getLogsDir(cwd);

  if (existsSync(configPath)) {
    return {
      created: false,
      configPath,
      message: `Already initialized at ${configDir}`,
    };
  }

  mkdirSync(configDir, { recursive: true });
  mkdirSync(delegatesDir, { recursive: true });
  mkdirSync(logsDir, { recursive: true });

  const config = getDefaultConfig(project);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

  return {
    created: true,
    configPath,
    message: `.rulebased/agents/ initialized. Project: ${project}`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/initializer.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/initializer.ts packages/agents/tests/initializer.test.ts
git commit -m "feat(agents): add initializer for .rulebased/agents/ structure"
```

---

### Task 6: HTTP Server

**Files:**
- Create: `packages/agents/src/server.ts`
- Create: `packages/agents/tests/server.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/server.test.ts
import { createAgentsServer } from "../src/server.js";
import type { Server } from "node:http";

describe("server", () => {
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
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toEqual([]);
    });
  });

  describe("POST /register", () => {
    it("should register agents and return peerId", async () => {
      const res = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "test",
          agents: [{ name: "researcher", description: "Search" }],
        }),
      });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.peerId).toBeDefined();
      expect(body.registered).toEqual(["test:researcher"]);
    });

    it("should reject duplicate project names", async () => {
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

      const agentsRes = await fetch(`http://localhost:${port}/agents`);
      const agents = await agentsRes.json();
      expect(agents).toEqual([]);
    });
  });

  describe("GET /agents?project=", () => {
    it("should filter agents by project", async () => {
      await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "brain",
          agents: [{ name: "researcher", description: "Search" }],
        }),
      });

      const res = await fetch(`http://localhost:${port}/agents?project=brain`);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe("brain:researcher");

      const res2 = await fetch(`http://localhost:${port}/agents?project=other`);
      const body2 = await res2.json();
      expect(body2).toEqual([]);
    });
  });

  describe("POST /messages", () => {
    it("should return 404 for unknown agent", async () => {
      const res = await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "app:user",
          to: "brain:researcher",
          content: "Hello",
        }),
      });
      expect(res.status).toBe(404);
    });

    it("should queue message and return when agent responds", async () => {
      // Register a peer
      const regRes = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "brain",
          agents: [{ name: "researcher", description: "Search" }],
        }),
      });
      const { peerId } = await regRes.json();

      // Send message (async — will be queued as pending)
      const msgPromise = fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "app:user",
          to: "brain:researcher",
          content: "Any notes on this?",
        }),
      });

      // Agent polls for pending messages
      const pendingRes = await fetch(`http://localhost:${port}/messages/pending?peerId=${peerId}`);
      const { messages } = await pendingRes.json();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Any notes on this?");

      // Agent responds
      await fetch(`http://localhost:${port}/messages/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: messages[0].messageId,
          response: "Found 3 related notes.",
        }),
      });

      // Original request resolves
      const msgRes = await msgPromise;
      const body = await msgRes.json();
      expect(msgRes.status).toBe(200);
      expect(body.response).toBe("Found 3 related notes.");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/server.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/server.ts
import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type {
  RegisteredAgent,
  PeerRegistration,
  AgentInfo,
  MessageRequest,
  ServerHealth,
} from "./types.js";

interface PeerEntry {
  peerId: string;
  project: string;
  agents: Map<string, AgentInfo>;
}

interface PendingMessageEntry {
  messageId: string;
  from: string;
  peerId: string;
  agentName: string;
  content: string;
  timestamp: number;
  resolve: (response: string) => void;
  reject: (err: Error) => void;
}

interface ServerState {
  peers: Map<string, PeerEntry>;
  projectIndex: Map<string, string>; // project -> peerId
  pendingMessages: Map<string, PendingMessageEntry>; // messageId -> entry
  startTime: number;
}

export interface AgentsServerResult {
  server: Server;
  port: number;
}

export async function createAgentsServer(opts: { port: number }): Promise<AgentsServerResult> {
  const state: ServerState = {
    peers: new Map(),
    projectIndex: new Map(),
    pendingMessages: new Map(),
    startTime: Date.now(),
  };

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res, state);
    } catch {
      sendJson(res, 500, { error: "internal_error", message: "Unexpected server error" });
    }
  });

  return new Promise((resolve) => {
    server.listen(opts.port, "127.0.0.1", () => {
      const addr = server.address();
      const actualPort = typeof addr === "object" && addr ? addr.port : opts.port;
      resolve({ server, port: actualPort });
    });
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, state: ServerState): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;
  const method = req.method ?? "GET";

  if (method === "GET" && path === "/health") {
    return handleHealth(res, state);
  }
  if (method === "GET" && path === "/agents") {
    const project = url.searchParams.get("project") ?? undefined;
    return handleListAgents(res, state, project);
  }
  if (method === "POST" && path === "/register") {
    const body = await readBody(req);
    return handleRegister(res, state, body);
  }
  if (method === "POST" && path === "/unregister") {
    const body = await readBody(req);
    return handleUnregister(res, state, body);
  }
  if (method === "POST" && path === "/messages") {
    const body = await readBody(req);
    return await handleMessage(res, state, body);
  }
  if (method === "GET" && path === "/messages/pending") {
    const peerId = url.searchParams.get("peerId") ?? "";
    return handlePendingMessages(res, state, peerId);
  }
  if (method === "POST" && path === "/messages/respond") {
    const body = await readBody(req);
    return handleMessageRespond(res, state, body);
  }

  sendJson(res, 404, { error: "not_found", message: `${method} ${path} not found` });
}

function handleHealth(res: ServerResponse, state: ServerState): void {
  const health: ServerHealth = {
    status: "ok",
    uptime: Math.floor((Date.now() - state.startTime) / 1000),
    peers: state.peers.size,
  };
  sendJson(res, 200, health);
}

function handleListAgents(res: ServerResponse, state: ServerState, project?: string): void {
  const agents: RegisteredAgent[] = [];
  for (const peer of state.peers.values()) {
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
  sendJson(res, 200, agents);
}

function handleRegister(res: ServerResponse, state: ServerState, body: unknown): void {
  const reg = body as PeerRegistration;
  if (!reg.project || !reg.agents) {
    sendJson(res, 400, { error: "bad_request", message: "Missing project or agents" });
    return;
  }

  if (state.projectIndex.has(reg.project)) {
    sendJson(res, 409, {
      error: "duplicate_project",
      message: `Project "${reg.project}" is already registered. Use a different name.`,
    });
    return;
  }

  const peerId = randomUUID();
  const agentsMap = new Map<string, AgentInfo>();
  for (const agent of reg.agents) {
    agentsMap.set(agent.name, agent);
  }

  state.peers.set(peerId, {
    peerId,
    project: reg.project,
    agents: agentsMap,
    messageHandler: null,
  });
  state.projectIndex.set(reg.project, peerId);

  sendJson(res, 200, {
    peerId,
    registered: reg.agents.map((a) => `${reg.project}:${a.name}`),
  });
}

function handleUnregister(res: ServerResponse, state: ServerState, body: unknown): void {
  const { peerId } = body as { peerId: string };
  const peer = state.peers.get(peerId);
  if (!peer) {
    sendJson(res, 404, { error: "peer_not_found", message: "Peer not registered" });
    return;
  }

  const unregistered = Array.from(peer.agents.keys()).map((name) => `${peer.project}:${name}`);
  state.projectIndex.delete(peer.project);
  state.peers.delete(peerId);

  sendJson(res, 200, { unregistered });
}

async function handleMessage(res: ServerResponse, state: ServerState, body: unknown): Promise<void> {
  const msg = body as MessageRequest;
  if (!msg.to || !msg.content) {
    sendJson(res, 400, { error: "bad_request", message: "Missing 'to' or 'content'" });
    return;
  }

  const [project, agentName] = msg.to.split(":");
  if (!project || !agentName) {
    sendJson(res, 400, { error: "bad_request", message: "Invalid agent ID format. Use 'project:agent'" });
    return;
  }

  const peerId = state.projectIndex.get(project);
  if (!peerId) {
    sendJson(res, 404, { error: "agent_not_found", message: `${msg.to} not registered` });
    return;
  }

  const peer = state.peers.get(peerId);
  if (!peer || !peer.agents.has(agentName)) {
    sendJson(res, 404, { error: "agent_not_found", message: `${msg.to} not registered` });
    return;
  }

  // Queue message and wait for agent to respond via polling
  const messageId = randomUUID();
  const responsePromise = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      state.pendingMessages.delete(messageId);
      reject(new Error("timeout"));
    }, 120_000);

    state.pendingMessages.set(messageId, {
      messageId,
      from: msg.from ?? "anonymous",
      peerId,
      agentName,
      content: msg.content,
      timestamp: Date.now(),
      resolve: (response: string) => {
        clearTimeout(timeout);
        resolve(response);
      },
      reject: (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      },
    });
  });

  try {
    const response = await responsePromise;
    sendJson(res, 200, { response });
  } catch {
    sendJson(res, 504, { error: "timeout", message: `Delegate did not respond within 120s` });
  }
}

function handlePendingMessages(res: ServerResponse, state: ServerState, peerId: string): void {
  if (!peerId || !state.peers.has(peerId)) {
    sendJson(res, 404, { error: "peer_not_found", message: "Peer not registered" });
    return;
  }

  const messages = [];
  for (const entry of state.pendingMessages.values()) {
    if (entry.peerId === peerId) {
      messages.push({
        messageId: entry.messageId,
        from: entry.from,
        agentName: entry.agentName,
        content: entry.content,
        timestamp: entry.timestamp,
      });
    }
  }
  sendJson(res, 200, { messages });
}

function handleMessageRespond(res: ServerResponse, state: ServerState, body: unknown): void {
  const { messageId, response } = body as { messageId: string; response: string };
  if (!messageId || !response) {
    sendJson(res, 400, { error: "bad_request", message: "Missing 'messageId' or 'response'" });
    return;
  }

  const entry = state.pendingMessages.get(messageId);
  if (!entry) {
    sendJson(res, 404, { error: "message_not_found", message: "Message not found or already responded" });
    return;
  }

  entry.resolve(response);
  state.pendingMessages.delete(messageId);
  sendJson(res, 200, { ok: true });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/server.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/server.ts packages/agents/tests/server.test.ts
git commit -m "feat(agents): add HTTP server with registration, agents directory, and messaging"
```

---

### Task 7: Local Agent

**Files:**
- Create: `packages/agents/src/agent.ts`
- Create: `packages/agents/tests/agent.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/agent.test.ts
import { createAgentsServer } from "../src/server.js";
import { createLocalAgent } from "../src/agent.js";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

describe("agent", () => {
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

  it("should register delegates from fixtures directory", async () => {
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async (_name, _body, content) => `Echo: ${content}`,
      pollIntervalMs: 100,
    });

    const res = await fetch(`http://localhost:${port}/agents`);
    const agents = await res.json();
    expect(agents).toHaveLength(1);
    expect(agents[0].id).toBe("test:researcher");

    await agent.shutdown();
  });

  it("should handle incoming messages via polling and delegateRunner", async () => {
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async (_name, _body, content) => `Response to: ${content}`,
      pollIntervalMs: 100, // fast polling for tests
    });

    // Send message — agent's polling loop will pick it up and respond
    const res = await fetch(`http://localhost:${port}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "other:user",
        to: "test:researcher",
        content: "What notes do you have?",
      }),
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.response).toBe("Response to: What notes do you have?");

    await agent.shutdown();
  }, 15_000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/agent.test.ts -v`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/agent.ts
import { loadAllDelegates } from "./delegate.js";
import type { DelegateDefinition, PendingMessage } from "./types.js";

export type DelegateRunner = (name: string, systemPrompt: string, userMessage: string) => Promise<string>;

export interface LocalAgentOptions {
  serverUrl: string;
  project: string;
  delegatesDir: string;
  delegateRunner: DelegateRunner;
  pollIntervalMs?: number;
}

export interface LocalAgent {
  peerId: string;
  delegates: DelegateDefinition[];
  shutdown: () => Promise<void>;
}

export async function createLocalAgent(opts: LocalAgentOptions): Promise<LocalAgent> {
  const delegates = loadAllDelegates(opts.delegatesDir);
  const pollInterval = opts.pollIntervalMs ?? 1000;

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

  let running = true;

  // Polling loop: check for pending messages and respond
  const poll = async (): Promise<void> => {
    while (running) {
      try {
        const res = await fetch(`${opts.serverUrl}/messages/pending?peerId=${peerId}`);
        if (res.ok) {
          const { messages } = (await res.json()) as { messages: PendingMessage[] };
          for (const msg of messages) {
            const delegate = delegateMap.get(msg.agentName);
            if (!delegate) continue;

            try {
              const response = await opts.delegateRunner(delegate.name, delegate.body, msg.content);
              await fetch(`${opts.serverUrl}/messages/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: msg.messageId, response }),
              });
            } catch {
              // Delegate failed, respond with error
              await fetch(`${opts.serverUrl}/messages/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: msg.messageId, response: "[Error: delegate failed to respond]" }),
              });
            }
          }
        }
      } catch {
        // Server unreachable, will retry on next poll
      }

      if (running) {
        await new Promise((r) => setTimeout(r, pollInterval));
      }
    }
  };

  // Start polling in background
  const pollPromise = poll();

  return {
    peerId,
    delegates,
    shutdown: async () => {
      running = false;
      await fetch(`${opts.serverUrl}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      }).catch(() => {});
      await pollPromise.catch(() => {});
    },
  };
}
```

- [ ] **Step 4: Adjust test and implementation until passing**

The agent-server integration in Phase 1 uses direct function references in tests. The production standalone agent process will use HTTP long-polling (Task 8 CLI). Iterate on the test/implementation boundary until tests pass.

Run: `cd packages/agents && NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest tests/agent.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/agent.ts packages/agents/tests/agent.test.ts
git commit -m "feat(agents): add local agent with delegate registration and message handling"
```

---

### Task 8: CLI Entry Point

**Files:**
- Create: `packages/agents/src/cli.ts`

- [ ] **Step 1: Write implementation**

```typescript
// src/cli.ts
#!/usr/bin/env node

import { resolve } from "node:path";
import { createAgentsServer } from "./server.js";
import { createLocalAgent } from "./agent.js";
import { initAgents } from "./initializer.js";
import { loadConfig } from "./config.js";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
  @rulebased/agents - Cross-repo AI agent communication
  https://github.com/rulebased-io/claude-plugin

  Usage:
    npx @rulebased/agents <command> [options]

  Commands:
    serve                 Start the agents server
    agent                 Start local agent (register delegates, poll for messages)
    init [project-name]   Initialize .rulebased/agents/ structure
    status                Show server status

  Options:
    --port <number>       Server port (default: 9100)
    --cwd <path>          Working directory
    -h, --help            Show help
    -v, --version         Show version
`);
}

async function main(): Promise<void> {
  if (!command || command === "-h" || command === "--help") {
    printUsage();
    return;
  }

  if (command === "-v" || command === "--version") {
    console.log("0.1.0");
    return;
  }

  const cwd = getArg("--cwd") ?? process.cwd();

  if (command === "serve") {
    const port = Number(getArg("--port") ?? "9100");
    console.log(`Starting agents server on localhost:${port}...`);
    const { server } = await createAgentsServer({ port });
    console.log(`Agents server running at http://localhost:${port}`);

    process.on("SIGINT", () => {
      server.close();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      server.close();
      process.exit(0);
    });
    return;
  }

  if (command === "init") {
    const project = args[1];
    if (!project) {
      console.error("Usage: npx @rulebased/agents init <project-name>");
      process.exit(1);
    }
    const result = initAgents(resolve(cwd), project);
    console.log(result.message);
    return;
  }

  if (command === "agent") {
    const cwd2 = resolve(getArg("--cwd") ?? process.cwd());
    const config = loadConfig(cwd2);
    if (!config) {
      console.error("No .rulebased/agents/config.json found. Run 'init' first.");
      process.exit(1);
    }
    const port2 = Number(getArg("--port") ?? String(config.server.port));
    console.log(`Starting local agent for project "${config.project}"...`);

    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port2}`,
      project: config.project,
      delegatesDir: resolve(cwd2, ".rulebased/agents/delegates"),
      delegateRunner: async (name, systemPrompt, userMessage) => {
        // Phase 1: placeholder — will be replaced with actual delegate execution
        return `[${name}] Received: ${userMessage}`;
      },
    });

    console.log(`Agent online. Delegates: ${agent.delegates.map((d) => `${config.project}:${d.name}`).join(", ")}`);

    process.on("SIGINT", async () => {
      await agent.shutdown();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      await agent.shutdown();
      process.exit(0);
    });
    return;
  }

  if (command === "status") {
    const port = Number(getArg("--port") ?? "9100");
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      const body = await res.json();
      console.log(`Server: online (uptime: ${(body as { uptime: number }).uptime}s, peers: ${(body as { peers: number }).peers})`);
    } catch {
      console.log("Server: offline");
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Build and verify**

Run: `cd packages/agents && pnpm run build`
Expected: compiles without errors

Run: `node dist/cli.js --help`
Expected: shows usage

Run: `node dist/cli.js --version`
Expected: `0.1.0`

- [ ] **Step 3: Commit**

```bash
git add packages/agents/src/cli.ts
git commit -m "feat(agents): add CLI entry point with serve, init, status commands"
```

---

### Task 9: Plugin Files (Skills + Commands + Hooks)

**Files:**
- Create: 7 skills (`skills/*/SKILL.md`)
- Create: 7 commands (`commands/*.md`)
- Create: 7 docs (`docs/*.md`)
- Create: `hooks/hooks.json`
- Create: `hooks/scripts/resolve-plugin-path.sh`

This task creates all plugin static assets. Since these are `.md` files following established patterns, they do not need unit tests.

- [ ] **Step 1: Create shared docs**

Create `packages/agents/docs/init.md`, `create.md`, `online.md`, `offline.md`, `ask.md`, `list.md`, `status.md` — each containing the detailed instructions for the corresponding skill/command.

- [ ] **Step 2: Create skills**

Create `packages/agents/skills/{init,create,online,offline,ask,list,status}/SKILL.md` — each with frontmatter (`name`, `description`) and instructions that reference `${CLAUDE_PLUGIN_PATH}`.

- [ ] **Step 3: Create commands**

Create `packages/agents/commands/{init,create,online,offline,ask,list,status}.md` — each with frontmatter (`description`, `argument-hint`) matching the skill content.

- [ ] **Step 4: Create hooks**

`hooks/hooks.json`:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/resolve-plugin-path.sh",
            "statusMessage": "Resolving agents plugin path..."
          }
        ]
      }
    ]
  }
}
```

`hooks/scripts/resolve-plugin-path.sh`: same pattern as harness, matching `/rulebased-agents:` skill patterns.

- [ ] **Step 5: Commit**

```bash
git add packages/agents/skills/ packages/agents/commands/ packages/agents/docs/ packages/agents/hooks/
git commit -m "feat(agents): add skills, commands, docs, and hooks for all 7 operations"
```

---

### Task 10: README + Build Verification

**Files:**
- Create: `packages/agents/README.md`
- Modify: `README.md` (root — add agents to plugin list)
- Modify: `README.ko.md` (root — sync Korean version)

- [ ] **Step 1: Create package README**

Create `packages/agents/README.md` with: overview, installation, skills list, architecture diagram, quick start guide.

- [ ] **Step 2: Update root READMEs**

Add `rulebased-agents` to the plugins section in both `README.md` and `README.ko.md`.

- [ ] **Step 3: Full build and test**

Run: `pnpm install && pnpm run build && pnpm test`
Expected: all packages build, all tests pass

- [ ] **Step 4: Commit**

```bash
git add packages/agents/README.md README.md README.ko.md
git commit -m "docs: add agents README, update root READMEs with new plugin"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|----------------|
| 1 | Package scaffolding | 8 |
| 2 | Types module | 5 |
| 3 | Config module | 6 |
| 4 | Delegate loader | 6 |
| 5 | Initializer | 5 |
| 6 | HTTP server | 5 |
| 7 | Local agent | 5 |
| 8 | CLI entry point | 3 |
| 9 | Plugin files (skills/commands/hooks) | 5 |
| 10 | README + build verification | 4 |
| **Total** | | **52 steps** |
