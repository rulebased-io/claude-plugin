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
