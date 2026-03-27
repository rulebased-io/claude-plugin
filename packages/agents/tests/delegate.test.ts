import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDelegate, loadAllDelegates, parseDelegateMarkdown } from "../src/delegate.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

describe("delegate", () => {
  describe("loadDelegate", () => {
    it("should parse frontmatter and body from delegate .md file", () => {
      const delegate = loadDelegate(join(fixturesDir, "delegates", "researcher.md"));
      expect(delegate.name).toBe("researcher");
      expect(delegate.description).toBe("Knowledge base search specialist");
      expect(delegate.body).toContain("You are a search delegate");
      expect(delegate.body).toContain("Disclosure scope");
    });

    it("should throw for non-existent file", () => {
      expect(() => loadDelegate("/nonexistent.md")).toThrow();
    });
  });

  describe("loadAllDelegates", () => {
    it("should load all .md files from delegates directory", () => {
      const delegates = loadAllDelegates(join(fixturesDir, "delegates"));
      expect(delegates).toHaveLength(1);
      expect(delegates[0].name).toBe("researcher");
    });

    it("should return empty array for non-existent directory", () => {
      const delegates = loadAllDelegates("/nonexistent");
      expect(delegates).toEqual([]);
    });
  });

  describe("parseDelegateMarkdown", () => {
    it("should handle CRLF line endings", () => {
      const content = "---\r\nname: test\r\ndescription: Test delegate\r\n---\r\nBody here.";
      const delegate = parseDelegateMarkdown(content);
      expect(delegate.name).toBe("test");
      expect(delegate.body).toBe("Body here.");
    });

    it("should throw for missing frontmatter", () => {
      expect(() => parseDelegateMarkdown("no frontmatter")).toThrow("missing frontmatter");
    });

    it("should throw for missing name", () => {
      expect(() => parseDelegateMarkdown("---\ndescription: test\n---\nbody")).toThrow("missing 'name'");
    });

    it("should throw for missing description", () => {
      expect(() => parseDelegateMarkdown("---\nname: test\n---\nbody")).toThrow("missing 'description'");
    });
  });
});
