import type {
  AgentConfig,
  DelegateDefinition,
  PeerRegistration,
  InboxMessage,
  MessageRequest,
  ServerHealth,
  WsMessage,
  WsConnectedPayload,
} from "../src/types.js";
import { StateError } from "../src/types.js";

describe("types", () => {
  it("should allow creating a valid AgentConfig", () => {
    const config: AgentConfig = {
      project: "my-project",
      server: { port: 9100 },
    };
    expect(config.project).toBe("my-project");
    expect(config.server.port).toBe(9100);
  });

  it("should allow creating a valid DelegateDefinition", () => {
    const delegate: DelegateDefinition = {
      name: "researcher",
      description: "Knowledge search specialist",
      body: "You are a search delegate...",
    };
    expect(delegate.name).toBe("researcher");
  });

  it("should allow creating a valid InboxMessage", () => {
    const msg: InboxMessage = {
      messageId: "msg-1",
      from: "app:user",
      to: "brain:researcher",
      agentName: "researcher",
      content: "Hello",
      replyTo: null,
      timestamp: Date.now(),
    };
    expect(msg.to).toBe("brain:researcher");
    expect(msg.replyTo).toBeNull();
  });

  it("should allow creating an InboxMessage with replyTo", () => {
    const msg: InboxMessage = {
      messageId: "msg-2",
      from: "brain:researcher",
      to: "app:user",
      agentName: "user",
      content: "Response",
      replyTo: "msg-1",
      timestamp: Date.now(),
    };
    expect(msg.replyTo).toBe("msg-1");
  });

  it("should allow creating a valid PeerRegistration", () => {
    const reg: PeerRegistration = {
      project: "my-project",
      agents: [{ name: "researcher", description: "Search" }],
    };
    expect(reg.agents).toHaveLength(1);
  });

  it("should allow creating a MessageRequest with replyTo", () => {
    const req: MessageRequest = {
      from: "app:user",
      to: "brain:researcher",
      content: "question",
      replyTo: "orig-msg-id",
    };
    expect(req.replyTo).toBe("orig-msg-id");
  });

  it("should allow MessageRequest without from", () => {
    const req: MessageRequest = { to: "brain:researcher", content: "hello" };
    expect(req.from).toBeUndefined();
  });

  it("should create StateError with status code", () => {
    const err = new StateError("duplicate", 409);
    expect(err.message).toBe("duplicate");
    expect(err.status).toBe(409);
    expect(err.name).toBe("StateError");
  });
});
