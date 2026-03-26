import { createAgentsServer } from "../src/server.js";
import { createLocalAgent } from "../src/agent.js";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import type { InboxMessage } from "../src/types.js";

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
    });

    const res = await fetch(`http://localhost:${port}/agents`);
    const agents = await res.json();
    expect(agents).toHaveLength(1);
    expect(agents[0].id).toBe("test:researcher");

    await agent.shutdown();
  });

  it("should process incoming messages via SSE and send responses via replyTo", async () => {
    // Register sender peer so it can receive the response
    const senderReg = await fetch(`http://localhost:${port}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "other", agents: [{ name: "user", description: "User" }] }),
    });
    const { peerId: senderPeerId } = await senderReg.json();

    // Subscribe sender to SSE so we can read the response
    const abortController = new AbortController();
    const sseRes = await fetch(`http://localhost:${port}/messages/subscribe?peerId=${senderPeerId}`, {
      signal: abortController.signal,
    });
    const reader = sseRes.body!.getReader();
    const decoder = new TextDecoder();
    // Skip initial ":ok"
    await reader.read();

    // Create agent (will auto-subscribe to SSE)
    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: "test",
      delegatesDir: join(fixturesDir, "delegates"),
      delegateRunner: async (_name, _body, content) => `Response to: ${content}`,
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

    // Read response from sender's SSE stream
    const { value } = await reader.read();
    const text = decoder.decode(value);
    const jsonStr = text.split("data: ")[1].split("\n")[0];
    const reply = JSON.parse(jsonStr) as InboxMessage;
    expect(reply.content).toBe("Response to: What notes do you have?");
    expect(reply.replyTo).toBe(messageId);

    abortController.abort();
    await agent.shutdown();
  }, 15_000);

  it("should skip messages with replyTo (those are responses, not questions)", async () => {
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

    // Send a replyTo message (agent should NOT process it with delegateRunner)
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

    // Give SSE time to deliver
    await new Promise((r) => setTimeout(r, 200));

    // If delegateRunner was called, the test would have thrown
    await agent.shutdown();
  }, 10_000);
});
