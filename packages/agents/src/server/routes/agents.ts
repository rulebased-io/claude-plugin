import { Hono } from "hono";
import type { ServerState } from "../state.js";
import { validatePeerRegistration, validateUnregisterRequest } from "../validators.js";

export function agentRoutes(state: ServerState): Hono {
  const app = new Hono();

  app.get("/agents", (c) => {
    const project = c.req.query("project");
    return c.json(state.listAgents(project));
  });

  app.post("/register", async (c) => {
    const body = validatePeerRegistration(await c.req.json());
    return c.json(state.register(body.project, body.agents));
  });

  app.post("/unregister", async (c) => {
    const body = validateUnregisterRequest(await c.req.json());
    return c.json(state.unregister(body.peerId));
  });

  return app;
}
