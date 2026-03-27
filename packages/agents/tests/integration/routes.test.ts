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
