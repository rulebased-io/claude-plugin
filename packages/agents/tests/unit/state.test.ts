import { ServerState } from "../../src/server/state.js";
import { StateError } from "../../src/types.js";

describe("ServerState", () => {
  let state: ServerState;

  beforeEach(() => {
    state = new ServerState();
  });

  describe("register", () => {
    it("should register a peer and return peerId", () => {
      const result = state.register("test", [{ name: "researcher", description: "Search" }]);
      expect(result.peerId).toBeDefined();
      expect(result.registered).toEqual(["test:researcher"]);
    });

    it("should throw StateError for duplicate project", () => {
      state.register("test", [{ name: "a", description: "A" }]);
      expect(() => state.register("test", [{ name: "b", description: "B" }])).toThrow(StateError);
      try {
        state.register("test", [{ name: "b", description: "B" }]);
      } catch (e) {
        expect((e as StateError).status).toBe(409);
      }
    });
  });

  describe("unregister", () => {
    it("should unregister a peer", () => {
      const { peerId } = state.register("test", [{ name: "a", description: "A" }]);
      const result = state.unregister(peerId);
      expect(result.unregistered).toEqual(["test:a"]);
      expect(state.listAgents()).toEqual([]);
    });

    it("should throw StateError for unknown peerId", () => {
      expect(() => state.unregister("nonexistent")).toThrow(StateError);
    });
  });

  describe("findAgent", () => {
    it("should find a registered agent", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      const result = state.findAgent("brain:researcher");
      expect(result).not.toBeNull();
      expect(result!.agentName).toBe("researcher");
    });

    it("should return null for unknown agent", () => {
      expect(state.findAgent("brain:researcher")).toBeNull();
    });

    it("should return null for invalid format", () => {
      expect(state.findAgent("nocolon")).toBeNull();
    });
  });

  describe("listAgents", () => {
    it("should list all agents", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      state.register("app", [{ name: "architect", description: "Design" }]);
      const agents = state.listAgents();
      expect(agents).toHaveLength(2);
    });

    it("should filter by project", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      state.register("app", [{ name: "architect", description: "Design" }]);
      const agents = state.listAgents("brain");
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe("brain:researcher");
    });
  });

  describe("routeMessage", () => {
    it("should return error for unknown agent", () => {
      const result = state.routeMessage({ to: "brain:researcher", content: "hello" });
      expect(result.ok).toBe(false);
    });

    it("should return messageId when agent is registered (no WS)", () => {
      state.register("brain", [{ name: "researcher", description: "Search" }]);
      const result = state.routeMessage({ to: "brain:researcher", content: "hello" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.messageId).toBeDefined();
    });
  });

  describe("getHealth", () => {
    it("should return health with peer count", () => {
      state.register("test", [{ name: "a", description: "A" }]);
      const health = state.getHealth();
      expect(health.status).toBe("ok");
      expect(health.peers).toBe(1);
      expect(typeof health.uptime).toBe("number");
    });
  });
});
