import type { PeerRegistration, MessageRequest } from "../types.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validatePeerRegistration(body: unknown): PeerRegistration {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid body");
  }
  const b = body as Record<string, unknown>;
  if (typeof b.project !== "string" || !b.project) {
    throw new ValidationError("Missing 'project'");
  }
  if (!Array.isArray(b.agents) || b.agents.length === 0) {
    throw new ValidationError("Missing or empty 'agents'");
  }
  for (const agent of b.agents) {
    if (!agent || typeof agent !== "object") {
      throw new ValidationError("Invalid agent entry");
    }
    const a = agent as Record<string, unknown>;
    if (typeof a.name !== "string" || !a.name) {
      throw new ValidationError("Agent missing 'name'");
    }
    if (typeof a.description !== "string") {
      throw new ValidationError("Agent missing 'description'");
    }
  }
  return body as PeerRegistration;
}

export function validateMessageRequest(body: unknown): MessageRequest {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid body");
  }
  const b = body as Record<string, unknown>;
  if (typeof b.to !== "string" || !b.to) {
    throw new ValidationError("Missing 'to'");
  }
  if (!b.to.includes(":")) {
    throw new ValidationError("Invalid agent ID format. Use 'project:agent'");
  }
  if (typeof b.content !== "string" || !b.content) {
    throw new ValidationError("Missing 'content'");
  }
  return {
    from: typeof b.from === "string" ? b.from : "anonymous",
    to: b.to,
    content: b.content,
    replyTo: typeof b.replyTo === "string" ? b.replyTo : undefined,
  };
}

export function validateUnregisterRequest(body: unknown): { peerId: string } {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid body");
  }
  const b = body as Record<string, unknown>;
  if (typeof b.peerId !== "string" || !b.peerId) {
    throw new ValidationError("Missing 'peerId'");
  }
  return { peerId: b.peerId };
}
