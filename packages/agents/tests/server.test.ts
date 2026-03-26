import { createAgentsServer } from "../src/server.js";
import type { Server } from "node:http";
import type { InboxMessage } from "../src/types.js";

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

    it("should return messageId on success (fire-and-forget)", async () => {
      await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "brain",
          agents: [{ name: "researcher", description: "Search" }],
        }),
      });

      const msgRes = await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "app:user",
          to: "brain:researcher",
          content: "Any notes on this?",
        }),
      });
      const { messageId } = await msgRes.json();
      expect(msgRes.status).toBe(200);
      expect(messageId).toBeDefined();
    });
  });

  describe("GET /messages/subscribe (SSE)", () => {
    it("should push messages in real-time via SSE", async () => {
      const regRes = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "brain",
          agents: [{ name: "researcher", description: "Search" }],
        }),
      });
      const { peerId } = await regRes.json();

      // Open SSE connection
      const abortController = new AbortController();
      const sseRes = await fetch(`http://localhost:${port}/messages/subscribe?peerId=${peerId}`, {
        signal: abortController.signal,
      });
      expect(sseRes.status).toBe(200);
      expect(sseRes.headers.get("content-type")).toBe("text/event-stream");

      const reader = sseRes.body!.getReader();
      const decoder = new TextDecoder();

      // Read initial ":ok" comment
      const { value: initValue } = await reader.read();
      const initText = decoder.decode(initValue);
      expect(initText).toContain(":ok");

      // Send a message to this peer
      await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "app:user",
          to: "brain:researcher",
          content: "Hello via SSE!",
        }),
      });

      // Read the SSE event
      const { value } = await reader.read();
      const text = decoder.decode(value);
      expect(text).toContain("data: ");

      const jsonStr = text.split("data: ")[1].split("\n")[0];
      const msg = JSON.parse(jsonStr) as InboxMessage;
      expect(msg.content).toBe("Hello via SSE!");
      expect(msg.from).toBe("app:user");
      expect(msg.agentName).toBe("researcher");
      expect(msg.replyTo).toBeNull();

      abortController.abort();
    }, 10_000);

    it("should support replyTo in SSE push", async () => {
      // Register two peers
      const regA = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "app", agents: [{ name: "user", description: "User" }] }),
      });
      const { peerId: peerA } = await regA.json();

      await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: "brain", agents: [{ name: "researcher", description: "Search" }] }),
      });

      // Subscribe peer A to SSE
      const abortController = new AbortController();
      const sseRes = await fetch(`http://localhost:${port}/messages/subscribe?peerId=${peerA}`, {
        signal: abortController.signal,
      });
      const reader = sseRes.body!.getReader();
      const decoder = new TextDecoder();

      // Skip initial ":ok"
      await reader.read();

      // A sends to B
      const msgRes = await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "app:user",
          to: "brain:researcher",
          content: "Question?",
        }),
      });
      const { messageId } = await msgRes.json();

      // B responds to A with replyTo
      await fetch(`http://localhost:${port}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "brain:researcher",
          to: "app:user",
          content: "Answer!",
          replyTo: messageId,
        }),
      });

      // A receives the response via SSE
      const { value } = await reader.read();
      const text = decoder.decode(value);
      const jsonStr = text.split("data: ")[1].split("\n")[0];
      const msg = JSON.parse(jsonStr) as InboxMessage;
      expect(msg.content).toBe("Answer!");
      expect(msg.replyTo).toBe(messageId);

      abortController.abort();
    }, 10_000);
  });
});
