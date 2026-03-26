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

    it("should queue message in target peer inbox (fire-and-forget)", async () => {
      const regRes = await fetch(`http://localhost:${port}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "brain",
          agents: [{ name: "researcher", description: "Search" }],
        }),
      });
      const { peerId } = await regRes.json();

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

      const inboxRes = await fetch(`http://localhost:${port}/messages/inbox?peerId=${peerId}`);
      const { messages } = await inboxRes.json();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Any notes on this?");
      expect(messages[0].replyTo).toBeNull();

      const ackRes = await fetch(`http://localhost:${port}/messages/ack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId, messageIds: [messages[0].messageId] }),
      });
      expect(ackRes.status).toBe(200);

      const inbox2 = await fetch(`http://localhost:${port}/messages/inbox?peerId=${peerId}`);
      const { messages: msgs2 } = await inbox2.json();
      expect(msgs2).toHaveLength(0);
    });

    it("should support replyTo for response routing", async () => {
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

      const inboxRes = await fetch(`http://localhost:${port}/messages/inbox?peerId=${peerA}`);
      const { messages } = await inboxRes.json();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Answer!");
      expect(messages[0].replyTo).toBe(messageId);
    });
  });
});
