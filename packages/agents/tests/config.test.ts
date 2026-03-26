import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, getDefaultConfig, getConfigDir, getConfigPath, getDelegatesDir, getLogsDir } from "../src/config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

describe("config", () => {
  describe("getDefaultConfig", () => {
    it("should return default config with given project name", () => {
      const config = getDefaultConfig("my-project");
      expect(config.project).toBe("my-project");
      expect(config.server.port).toBe(9100);
    });
  });

  describe("loadConfig", () => {
    it("should load config from project root (cwd)", () => {
      const config = loadConfig(fixturesDir);
      expect(config).not.toBeNull();
      expect(config!.project).toBe("test-project");
      expect(config!.server.port).toBe(9100);
    });

    it("should return null if config does not exist", () => {
      const config = loadConfig("/nonexistent/path");
      expect(config).toBeNull();
    });
  });

  describe("path helpers", () => {
    it("should return correct config dir", () => {
      expect(getConfigDir("/foo")).toBe(join("/foo", ".rulebased/agents"));
    });

    it("should return correct config path", () => {
      expect(getConfigPath("/foo")).toBe(join("/foo", ".rulebased/agents/config.json"));
    });

    it("should return correct delegates dir", () => {
      expect(getDelegatesDir("/foo")).toBe(join("/foo", ".rulebased/agents/delegates"));
    });

    it("should return correct logs dir", () => {
      expect(getLogsDir("/foo")).toBe(join("/foo", ".rulebased/agents/logs"));
    });
  });
});
