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

  it("should process incoming messages and send responses via replyTo", async () => {
    // Register sender peer so it has an inbox for the response
    const senderReg = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "other", agents: [{ name: "user", description: "User" }] }),
    });
    const { peerId: senderPeerId } = await senderReg.json();

    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async (_name, _body, content) => `Response to: ${content}`,
      pollIntervalMs: 100,
    });

    // Send message to test:researcher
    const msgRes = await fetch(`http://localhost:${port}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "other:user",
        to: "test:researcher",
        content: "What notes do you have?",
      }),
    });
    const { messageId } = await msgRes.json();
    expect(msgRes.status).toBe(200);

    // Wait for agent polling to process and respond
    await new Promise((r) => setTimeout(r, 500));

    // Check sender's inbox for the response
    const inboxRes = await fetch(`http://localhost:${port}/messages/inbox?peerId=${senderPeerId}`);
    const { messages } = await inboxRes.json();
    expect(messages.length).toBeGreaterThanOrEqual(1);

    const reply = messages.find((m: { replyTo: string }) => m.replyTo === messageId);
    expect(reply).toBeDefined();
    expect(reply.content).toBe("Response to: What notes do you have?");

    await agent.shutdown();
  }, 15_000);

  it("should skip messages with replyTo (those are responses, not questions)", async () => {
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async () => { throw new Error("should not be called"); },
      pollIntervalMs: 100,
    });

    // Manually put a reply message in the agent's inbox
    const regRes = await fetch(`http://localhost:${port}/agents`);
    const agents = await regRes.json();
    const agentPeerId = agents[0].peerId;

    // Send a replyTo message to the agent's inbox (simulating a response coming back)
    // We need to register another peer first to be the "from"
    await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "other", agents: [{ name: "bot", description: "Bot" }] }),
    });

    // This is a response (replyTo set), agent should NOT process it with delegateRunner
    await fetch(`http://localhost:${port}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "other:bot",
        to: "test:researcher",
        content: "This is a response",
        replyTo: "some-original-msg-id",
      }),
    });

    // Wait for polling
    await new Promise((r) => setTimeout(r, 300));

    // If delegateRunner was called, the test would have thrown
    await agent.shutdown();
  }, 10_000);
});
