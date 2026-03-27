import { loadAllDelegates } from "../delegate.js";
import { AgentWsClient } from "./ws-client.js";
import type { DelegateDefinition, InboxMessage } from "../types.js";

export type DelegateRunner = (name: string, systemPrompt: string, userMessage: string) => Promise<string>;

export interface LocalAgentOptions {
  serverUrl: string;
  project: string;
  delegatesDir: string;
  delegateRunner: DelegateRunner;
}

export interface LocalAgent {
  peerId: string;
  delegates: DelegateDefinition[];
  shutdown: () => Promise<void>;
}

export async function createLocalAgent(opts: LocalAgentOptions): Promise<LocalAgent> {
  const delegates = loadAllDelegates(opts.delegatesDir);

  // Register via HTTP
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

  // Connect via WebSocket
  const wsUrl = AgentWsClient.httpToWs(opts.serverUrl);
  const client = new AgentWsClient(wsUrl, peerId, async (msg: InboxMessage) => {
    // Skip responses (replyTo set)
    if (msg.replyTo) return;

    const delegate = delegateMap.get(msg.agentName);
    if (!delegate) return;

    try {
      const response = await opts.delegateRunner(delegate.name, delegate.body, msg.content);
      client.send({
        from: `${opts.project}:${msg.agentName}`,
        to: msg.from,
        content: response,
        replyTo: msg.messageId,
      });
    } catch {
      client.send({
        from: `${opts.project}:${msg.agentName}`,
        to: msg.from,
        content: "[Error: delegate failed to respond]",
        replyTo: msg.messageId,
      });
    }
  });

  await client.connect();

  return {
    peerId,
    delegates,
    shutdown: async () => {
      client.disconnect();
      await fetch(`${opts.serverUrl}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      }).catch(() => {});
    },
  };
}
