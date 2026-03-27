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
