import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initAgents } from "../src/initializer.js";

describe("initializer", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "agents-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("should create .rulebased/agents/ directory structure", () => {
    const result = initAgents(tempDir, "test-project");

    expect(result.created).toBe(true);
    expect(existsSync(join(tempDir, ".rulebased/agents/config.json"))).toBe(true);
    expect(existsSync(join(tempDir, ".rulebased/agents/delegates"))).toBe(true);
    expect(existsSync(join(tempDir, ".rulebased/agents/logs"))).toBe(true);
  });

  it("should write correct config.json", () => {
    initAgents(tempDir, "test-project");

    const config = JSON.parse(
      readFileSync(join(tempDir, ".rulebased/agents/config.json"), "utf-8")
    );
    expect(config.project).toBe("test-project");
    expect(config.server.port).toBe(9100);
  });

  it("should not overwrite existing config", () => {
    initAgents(tempDir, "first-project");
    const result = initAgents(tempDir, "second-project");

    expect(result.created).toBe(false);
    const config = JSON.parse(
      readFileSync(join(tempDir, ".rulebased/agents/config.json"), "utf-8")
    );
    expect(config.project).toBe("first-project");
  });

  it("should return meaningful message", () => {
    const result = initAgents(tempDir, "test-project");
    expect(result.message).toContain("test-project");
    expect(result.configPath).toContain(".rulebased/agents/config.json");
  });
});
