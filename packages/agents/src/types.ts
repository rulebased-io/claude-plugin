export interface ServerConfig {
  port: number;
  host?: string;
}

export interface AgentConfig {
  project: string;
  server: ServerConfig;
}

export interface DelegateDefinition {
  name: string;
  description: string;
  body: string;
}

export interface AgentInfo {
  name: string;
  description: string;
}

export interface PeerRegistration {
  project: string;
  agents: AgentInfo[];
}

export interface RegisteredAgent {
  id: string;
  description: string;
  status: "online" | "offline";
  peerId: string;
}

export interface InboxMessage {
  messageId: string;
  from: string;
  to: string;
  agentName: string;
  content: string;
  replyTo: string | null;
  timestamp: number;
}

export interface InboxResponse {
  messages: InboxMessage[];
}

export interface MessageRequest {
  from: string;
  to: string;
  content: string;
  replyTo?: string;
}

export interface MessageAck {
  messageId: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface ServerHealth {
  status: "ok";
  uptime: number;
  peers: number;
}
