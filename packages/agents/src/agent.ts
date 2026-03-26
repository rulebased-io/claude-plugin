import { loadAllDelegates } from "./delegate.js";
import type { DelegateDefinition, InboxMessage } from "./types.js";

export type DelegateRunner = (name: string, systemPrompt: string, userMessage: string) => Promise<string>;

export interface LocalAgentOptions {
  serverUrl: string;
  project: string;
  delegatesDir: string;
  delegateRunner: DelegateRunner;
  pollIntervalMs?: number;
}

export interface LocalAgent {
  peerId: string;
  delegates: DelegateDefinition[];
  shutdown: () => Promise<void>;
}

export async function createLocalAgent(opts: LocalAgentOptions): Promise<LocalAgent> {
  const delegates = loadAllDelegates(opts.delegatesDir);
  const pollInterval = opts.pollIntervalMs ?? 1000;

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

  let running = true;

  const poll = async (): Promise<void> => {
    while (running) {
      try {
        const res = await fetch(`${opts.serverUrl}/messages/inbox?peerId=${peerId}`);
        if (res.ok) {
          const { messages } = (await res.json()) as { messages: InboxMessage[] };
          const processedIds: string[] = [];

          for (const msg of messages) {
            // Skip response messages (replyTo is set)
            if (msg.replyTo) {
              continue;
            }

            const delegate = delegateMap.get(msg.agentName);
            if (!delegate) continue;

            try {
              const response = await opts.delegateRunner(delegate.name, delegate.body, msg.content);
              await fetch(`${opts.serverUrl}/messages`, {
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
              await fetch(`${opts.serverUrl}/messages`, {
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

            processedIds.push(msg.messageId);
          }

          if (processedIds.length > 0) {
            await fetch(`${opts.serverUrl}/messages/ack`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ peerId, messageIds: processedIds }),
            });
          }
        }
      } catch {
        // Server unreachable, retry next poll
      }

      if (running) {
        await new Promise((r) => setTimeout(r, pollInterval));
      }
    }
  };

  const pollPromise = poll();

  return {
    peerId,
    delegates,
    shutdown: async () => {
      running = false;
      await fetch(`${opts.serverUrl}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      }).catch(() => {});
      await pollPromise.catch(() => {});
    },
  };
}
