import { Hono } from "hono";
import type { ServerState } from "../state.js";
import { validateMessageRequest } from "../validators.js";

export function messageRoutes(state: ServerState): Hono {
  const app = new Hono();

  app.post("/messages", async (c) => {
    const msg = validateMessageRequest(await c.req.json());
    const result = state.routeMessage(msg);
    if (!result.ok) {
      return c.json({ error: "agent_not_found", message: result.error }, result.status as 404);
    }
    return c.json({ messageId: result.messageId });
  });

  return app;
}
