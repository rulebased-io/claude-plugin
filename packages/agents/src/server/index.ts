import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { Server } from "node:http";
import { ServerState } from "./state.js";
import { healthRoutes } from "./routes/health.js";
import { agentRoutes } from "./routes/agents.js";
import { messageRoutes } from "./routes/messages.js";
import { ValidationError } from "./validators.js";
import { StateError } from "../types.js";
import { setupWebSocket } from "./ws/handler.js";

export { ServerState } from "./state.js";
export { ValidationError } from "./validators.js";

export interface AgentsServerResult {
  server: Server;
  port: number;
  state: ServerState;
}

export async function createAgentsServer(opts: { port: number }): Promise<AgentsServerResult> {
  const state = new ServerState();

  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof ValidationError) {
      return c.json({ error: "bad_request", message: err.message }, 400);
    }
    if (err instanceof StateError) {
      return c.json({ error: "state_error", message: err.message }, { status: err.status });
    }
    return c.json({ error: "internal_error", message: "Unexpected server error" }, 500);
  });

  app.notFound((c) => {
    return c.json({ error: "not_found", message: `${c.req.method} ${c.req.path} not found` }, 404);
  });

  app.route("/", healthRoutes(state));
  app.route("/", agentRoutes(state));
  app.route("/", messageRoutes(state));

  return new Promise((resolve) => {
    const httpServer = serve(
      { fetch: app.fetch, port: opts.port, hostname: "127.0.0.1" },
      (info) => {
        const wss = setupWebSocket(httpServer as unknown as Server, state);
        const originalClose = (httpServer as unknown as Server).close.bind(httpServer);
        (httpServer as unknown as Server).close = ((cb?: (err?: Error) => void) => {
          wss.close();
          return originalClose(cb);
        }) as Server["close"];
        resolve({ server: httpServer as unknown as Server, port: info.port, state });
      },
    );
  });
}
