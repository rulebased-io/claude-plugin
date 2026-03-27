import WebSocket from "ws";
import { createAgentsServer } from "../../src/server/index.js";
import type { Server } from "node:http";
import type { ServerState } from "../../src/server/state.js";

const BASE_URL = (port: number) => `http://localhost:${port}`;
const WS_URL = (port: number, peerId: string) => `ws://localhost:${port}/ws?peerId=${peerId}`;

async function register(
  port: number,
  project: string,
  agents: Array<{ name: string; description: string }>,
): Promise<string> {
  const res = await fetch(`${BASE_URL(port)}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, agents }),
  });
  const body = (await res.json()) as { peerId: string };
  return body.peerId;
}

function waitForMessage(ws: WebSocket, timeoutMs = 3000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WS message timeout")), timeoutMs);
    ws.once("message", (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()));
    });
  });
}

/**
 * Wait for the first message from the server (registers listener before open fires,
 * so we never miss a message sent immediately after the upgrade).
 */
function waitForFirstMessage(ws: WebSocket, timeoutMs = 3000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WS first-message timeout")), timeoutMs);
    // Register message listener first
    ws.once("message", (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()));
    });
    ws.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }
    ws.once("open", resolve);
    ws.once("error", reject);
  });
}

function waitForClose(ws: WebSocket): Promise<{ code: number; reason: string }> {
  return new Promise((resolve) => {
    ws.once("close", (code, reason) => resolve({ code, reason: reason.toString() }));
  });
}

describe("WebSocket handler", () => {
  let server: Server;
  let port: number;
  let state: ServerState;

  beforeEach(async () => {
    const result = await createAgentsServer({ port: 0 });
    server = result.server;
    port = result.port;
    state = result.state;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe("Test 1: WS connection with valid peerId → receives 'connected' message", () => {
    it("should receive connected message on valid peerId", async () => {
      const peerId = await register(port, "proj-a", [{ name: "alice", description: "Alice" }]);

      const ws = new WebSocket(WS_URL(port, peerId));
      // Register listener BEFORE waiting for open to avoid missing the message
      const msgPromise = waitForFirstMessage(ws);
      await waitForOpen(ws);

      const msg = (await msgPromise) as { type: string; payload: { peerId: string } };

      expect(msg.type).toBe("connected");
      expect(msg.payload.peerId).toBe(peerId);

      ws.close();
    });
  });

  describe("Test 2: WS connection with invalid peerId → close code 4001", () => {
    it("should close with code 4001 for unknown peerId", async () => {
      const ws = new WebSocket(WS_URL(port, "non-existent-peer-id"));

      const { code, reason } = await waitForClose(ws);

      expect(code).toBe(4001);
      expect(reason).toBe("Unknown peerId");
    });
  });

  describe("Test 3: HTTP POST /messages pushes to WS subscriber in real-time", () => {
    it("should deliver message via WS when POST /messages is called", async () => {
      const peerId = await register(port, "proj-b", [{ name: "bob", description: "Bob" }]);

      const ws = new WebSocket(WS_URL(port, peerId));
      // consume the connected message (register listener before open)
      const connectedPromise = waitForFirstMessage(ws);
      await waitForOpen(ws);
      await connectedPromise;

      // Register listener BEFORE posting to avoid missing the pushed message
      const incomingPromise = waitForMessage(ws);

      // Now post a message targeting bob
      const postRes = await fetch(`${BASE_URL(port)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: "tester", to: "proj-b:bob", content: "hello bob" }),
      });
      expect(postRes.status).toBe(200);

      const incoming = (await incomingPromise) as {
        type: string;
        payload: { from: string; content: string; agentName: string };
      };

      expect(incoming.type).toBe("message");
      expect(incoming.payload.from).toBe("tester");
      expect(incoming.payload.content).toBe("hello bob");
      expect(incoming.payload.agentName).toBe("bob");

      ws.close();
    });
  });

  describe("Test 4: Agent-to-agent routing via WS", () => {
    it("should route WS message from peer B to peer A", async () => {
      // Register peer A (receiver)
      const peerIdA = await register(port, "proj-c-a", [{ name: "agent-a", description: "A" }]);
      // Register peer B (sender)
      const peerIdB = await register(port, "proj-c-b", [{ name: "agent-b", description: "B" }]);

      const wsA = new WebSocket(WS_URL(port, peerIdA));
      const wsB = new WebSocket(WS_URL(port, peerIdB));

      // Register message listeners BEFORE open to avoid missing 'connected'
      const connectedA = waitForFirstMessage(wsA);
      const connectedB = waitForFirstMessage(wsB);

      await waitForOpen(wsA);
      await waitForOpen(wsB);

      // consume connected messages
      await connectedA;
      await connectedB;

      // B sends a WS message targeting A
      const wsMsg = {
        type: "message",
        payload: {
          from: "proj-c-b:agent-b",
          to: "proj-c-a:agent-a",
          content: "hey agent-a from agent-b",
        },
      };
      wsB.send(JSON.stringify(wsMsg));

      // A should receive it
      const incoming = (await waitForMessage(wsA)) as {
        type: string;
        payload: { from: string; content: string; agentName: string };
      };

      expect(incoming.type).toBe("message");
      expect(incoming.payload.from).toBe("proj-c-b:agent-b");
      expect(incoming.payload.content).toBe("hey agent-a from agent-b");
      expect(incoming.payload.agentName).toBe("agent-a");

      wsA.close();
      wsB.close();
    });
  });
});
