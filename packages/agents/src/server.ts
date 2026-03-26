import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type {
  RegisteredAgent,
  PeerRegistration,
  AgentInfo,
  MessageRequest,
  InboxMessage,
  ServerHealth,
} from "./types.js";

interface PeerEntry {
  peerId: string;
  project: string;
  agents: Map<string, AgentInfo>;
  inbox: InboxMessage[];
}

interface ServerState {
  peers: Map<string, PeerEntry>;
  projectIndex: Map<string, string>;
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

  if (method === "GET" && path === "/health") return handleHealth(res, state);
  if (method === "GET" && path === "/agents") return handleListAgents(res, state, url.searchParams.get("project") ?? undefined);
  if (method === "POST" && path === "/register") return handleRegister(res, state, await readBody(req));
  if (method === "POST" && path === "/unregister") return handleUnregister(res, state, await readBody(req));
  if (method === "POST" && path === "/messages") return handleMessage(res, state, await readBody(req));
  if (method === "GET" && path === "/messages/inbox") return handleInbox(res, state, url.searchParams.get("peerId") ?? "");
  if (method === "POST" && path === "/messages/ack") return handleAck(res, state, await readBody(req));

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
      agents.push({ id: `${peer.project}:${name}`, description: info.description, status: "online", peerId: peer.peerId });
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
    sendJson(res, 409, { error: "duplicate_project", message: `Project "${reg.project}" is already registered. Use a different name.` });
    return;
  }

  const peerId = randomUUID();
  const agentsMap = new Map<string, AgentInfo>();
  for (const agent of reg.agents) agentsMap.set(agent.name, agent);

  state.peers.set(peerId, { peerId, project: reg.project, agents: agentsMap, inbox: [] });
  state.projectIndex.set(reg.project, peerId);
  sendJson(res, 200, { peerId, registered: reg.agents.map((a) => `${reg.project}:${a.name}`) });
}

function handleUnregister(res: ServerResponse, state: ServerState, body: unknown): void {
  const { peerId } = body as { peerId: string };
  const peer = state.peers.get(peerId);
  if (!peer) { sendJson(res, 404, { error: "peer_not_found", message: "Peer not registered" }); return; }

  const unregistered = Array.from(peer.agents.keys()).map((name) => `${peer.project}:${name}`);
  state.projectIndex.delete(peer.project);
  state.peers.delete(peerId);
  sendJson(res, 200, { unregistered });
}

function handleMessage(res: ServerResponse, state: ServerState, body: unknown): void {
  const msg = body as MessageRequest;
  if (!msg.to || !msg.content) { sendJson(res, 400, { error: "bad_request", message: "Missing 'to' or 'content'" }); return; }

  const [project, agentName] = msg.to.split(":");
  if (!project || !agentName) { sendJson(res, 400, { error: "bad_request", message: "Invalid agent ID format. Use 'project:agent'" }); return; }

  const peerId = state.projectIndex.get(project);
  if (!peerId) { sendJson(res, 404, { error: "agent_not_found", message: `${msg.to} not registered` }); return; }

  const peer = state.peers.get(peerId);
  if (!peer || !peer.agents.has(agentName)) { sendJson(res, 404, { error: "agent_not_found", message: `${msg.to} not registered` }); return; }

  const messageId = randomUUID();
  const inboxMsg: InboxMessage = {
    messageId,
    from: msg.from ?? "anonymous",
    to: msg.to,
    agentName,
    content: msg.content,
    replyTo: msg.replyTo ?? null,
    timestamp: Date.now(),
  };
  peer.inbox.push(inboxMsg);
  sendJson(res, 200, { messageId });
}

function handleInbox(res: ServerResponse, state: ServerState, peerId: string): void {
  if (!peerId || !state.peers.has(peerId)) { sendJson(res, 404, { error: "peer_not_found", message: "Peer not registered" }); return; }
  const peer = state.peers.get(peerId)!;
  sendJson(res, 200, { messages: peer.inbox });
}

function handleAck(res: ServerResponse, state: ServerState, body: unknown): void {
  const { peerId, messageIds } = body as { peerId: string; messageIds: string[] };
  if (!peerId || !messageIds) { sendJson(res, 400, { error: "bad_request", message: "Missing 'peerId' or 'messageIds'" }); return; }
  const peer = state.peers.get(peerId);
  if (!peer) { sendJson(res, 404, { error: "peer_not_found", message: "Peer not registered" }); return; }

  const ackSet = new Set(messageIds);
  peer.inbox = peer.inbox.filter((m) => !ackSet.has(m.messageId));
  sendJson(res, 200, { acknowledged: messageIds.length });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch { resolve({}); } });
    req.on("error", reject);
  });
}
