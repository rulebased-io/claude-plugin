import WebSocket from "ws";
import type { InboxMessage, WsMessage } from "../types.js";

export class AgentWsClient {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(
    private readonly wsUrl: string,
    private readonly peerId: string,
    private readonly onMessage: (msg: InboxMessage) => Promise<void>,
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.wsUrl}/ws?peerId=${this.peerId}`;
      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        this.reconnectAttempt = 0;
      });

      this.ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString()) as WsMessage;
          if (msg.type === "connected") {
            resolve();
            return;
          }
          if (msg.type === "message") {
            this.onMessage(msg.payload as InboxMessage).catch(() => {});
          }
        } catch {
          // ignore parse errors
        }
      });

      this.ws.on("close", () => {
        if (!this.closed) {
          this.scheduleReconnect();
        }
      });

      this.ws.on("error", (err) => {
        if (this.reconnectAttempt === 0 && !this.ws?.readyState) {
          reject(err);
        }
      });
    });
  }

  send(msg: { from: string; to: string; content: string; replyTo?: string }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "message", payload: msg }));
    }
  }

  disconnect(): void {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30_000);
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via close handler
      });
    }, delay);
  }

  static httpToWs(httpUrl: string): string {
    return httpUrl.replace(/^http/, "ws");
  }
}
