import {
  validatePeerRegistration,
  validateMessageRequest,
  validateUnregisterRequest,
  ValidationError,
} from "../../src/server/validators.js";

describe("validators", () => {
  describe("validatePeerRegistration", () => {
    it("should accept valid registration", () => {
      const result = validatePeerRegistration({
        project: "test",
        agents: [{ name: "researcher", description: "Search" }],
      });
      expect(result.project).toBe("test");
      expect(result.agents).toHaveLength(1);
    });

    it("should reject missing project", () => {
      expect(() => validatePeerRegistration({ agents: [] })).toThrow(ValidationError);
    });

    it("should reject missing agents", () => {
      expect(() => validatePeerRegistration({ project: "test" })).toThrow(ValidationError);
    });

    it("should reject empty agents array", () => {
      expect(() => validatePeerRegistration({ project: "test", agents: [] })).toThrow(ValidationError);
    });

    it("should reject agent without name", () => {
      expect(() => validatePeerRegistration({
        project: "test",
        agents: [{ description: "Search" }],
      })).toThrow(ValidationError);
    });

    it("should reject non-object input", () => {
      expect(() => validatePeerRegistration(null)).toThrow(ValidationError);
      expect(() => validatePeerRegistration("string")).toThrow(ValidationError);
    });
  });

  describe("validateMessageRequest", () => {
    it("should accept valid message with from", () => {
      const result = validateMessageRequest({
        from: "app:user",
        to: "brain:researcher",
        content: "hello",
      });
      expect(result.to).toBe("brain:researcher");
      expect(result.from).toBe("app:user");
    });

    it("should default from to anonymous", () => {
      const result = validateMessageRequest({
        to: "brain:researcher",
        content: "hello",
      });
      expect(result.from).toBe("anonymous");
    });

    it("should reject missing to", () => {
      expect(() => validateMessageRequest({ content: "hello" })).toThrow(ValidationError);
    });

    it("should reject invalid agent ID format", () => {
      expect(() => validateMessageRequest({ to: "nocolon", content: "hello" })).toThrow(ValidationError);
    });

    it("should reject missing content", () => {
      expect(() => validateMessageRequest({ to: "a:b" })).toThrow(ValidationError);
    });

    it("should preserve replyTo", () => {
      const result = validateMessageRequest({
        to: "brain:researcher",
        content: "hello",
        replyTo: "msg-1",
      });
      expect(result.replyTo).toBe("msg-1");
    });
  });

  describe("validateUnregisterRequest", () => {
    it("should accept valid peerId", () => {
      const result = validateUnregisterRequest({ peerId: "uuid-123" });
      expect(result.peerId).toBe("uuid-123");
    });

    it("should reject missing peerId", () => {
      expect(() => validateUnregisterRequest({})).toThrow(ValidationError);
    });
  });
});
