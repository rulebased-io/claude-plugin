import { Hono } from "hono";
import type { ServerState } from "../state.js";

export function healthRoutes(state: ServerState): Hono {
  const app = new Hono();
  app.get("/health", (c) => c.json(state.getHealth()));
  return app;
}
