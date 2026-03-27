import { WebSocketServer, type WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { ServerState } from "../state.js";
import type { WsMessage, MessageRequest } from "../../types.js";
import { validateMessageRequest } from "../validators.js";

const PING_INTERVAL = 30_000;
const MAX_MISSED_PONGS = 2;

export function setupWebSocket(server: Server, state: ServerState): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }

    const peerId = url.searchParams.get("peerId");

    wss.handleUpgrade(req, socket, head, (ws) => {
      // validate AFTER upgrade, then close with code 4001 if invalid
      if (!peerId || !state.getPeer(peerId)) {
        ws.close(4001, "Unknown peerId");
        return;
      }
      handleConnection(ws, peerId, state);
    });
  });

  return wss;
}

function handleConnection(ws: WebSocket, peerId: string, state: ServerState): void {
  state.setConnection(peerId, ws);

  // Send connected confirmation
  ws.send(JSON.stringify({ type: "connected", payload: { peerId } }));

  // Heartbeat tracking
  let missedPongs = 0;
  const heartbeat = setInterval(() => {
    if (missedPongs >= MAX_MISSED_PONGS) {
      ws.terminate();
      return;
    }
    missedPongs++;
    ws.ping();
  }, PING_INTERVAL);

  ws.on("pong", () => {
    missedPongs = 0;
  });

  ws.on("message", (data) => {
    let parsed: WsMessage;
    try {
      parsed = JSON.parse(data.toString()) as WsMessage;
    } catch {
      // ignore malformed messages
      return;
    }

    if (parsed.type === "message") {
      let req: MessageRequest;
      try {
        req = validateMessageRequest(parsed.payload);
      } catch {
        // ignore invalid message requests
        return;
      }
      state.routeMessage(req);
    }
  });

  ws.on("close", () => {
    clearInterval(heartbeat);
    state.removeConnection(peerId);
  });
}
