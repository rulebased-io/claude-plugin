import { loadAllDelegates } from "./delegate.js";
import type { DelegateDefinition, InboxMessage } from "./types.js";

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

  // Subscribe to SSE stream for real-time message push
  const abortController = new AbortController();
  const ssePromise = subscribeToMessages(opts.serverUrl, peerId, delegateMap, opts, abortController.signal);

  return {
    peerId,
    delegates,
    shutdown: async () => {
      abortController.abort();
      await ssePromise.catch(() => {});
      await fetch(`${opts.serverUrl}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      }).catch(() => {});
    },
  };
}

async function subscribeToMessages(
  serverUrl: string,
  peerId: string,
  delegateMap: Map<string, DelegateDefinition>,
  opts: LocalAgentOptions,
  signal: AbortSignal,
): Promise<void> {
  try {
    const res = await fetch(`${serverUrl}/messages/subscribe?peerId=${peerId}`, { signal });

    if (!res.ok || !res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6);
        let msg: InboxMessage;
        try {
          msg = JSON.parse(jsonStr) as InboxMessage;
        } catch {
          continue;
        }

        // Skip response messages (replyTo is set) — those are for the skill to consume
        if (msg.replyTo) continue;

        const delegate = delegateMap.get(msg.agentName);
        if (!delegate) continue;

        // Process message with delegate
        try {
          const response = await opts.delegateRunner(delegate.name, delegate.body, msg.content);
          await fetch(`${serverUrl}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: `${opts.project}:${msg.agentName}`,
              to: msg.from,
              content: response,
              replyTo: msg.messageId,
            }),
          });
        } catch {
          await fetch(`${serverUrl}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: `${opts.project}:${msg.agentName}`,
              to: msg.from,
              content: "[Error: delegate failed to respond]",
              replyTo: msg.messageId,
            }),
          });
        }
      }
    }
  } catch (err) {
    if (signal.aborted) return;
    throw err;
  }
}
