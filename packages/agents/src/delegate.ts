import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { DelegateDefinition } from "./types.js";

export function loadDelegate(filePath: string): DelegateDefinition {
  const raw = readFileSync(filePath, "utf-8");
  return parseDelegateMarkdown(raw);
}

export function loadAllDelegates(dirPath: string): DelegateDefinition[] {
  if (!existsSync(dirPath)) {
    return [];
  }
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
  return files.map((f) => loadDelegate(join(dirPath, f)));
}

export function parseDelegateMarkdown(content: string): DelegateDefinition {
  const normalized = content.replace(/\r\n/g, "\n");
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error("Invalid delegate file: missing frontmatter");
  }

  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();

  const name = extractField(frontmatter, "name");
  const description = extractField(frontmatter, "description");

  if (!name) {
    throw new Error("Invalid delegate file: missing 'name' in frontmatter");
  }
  if (!description) {
    throw new Error("Invalid delegate file: missing 'description' in frontmatter");
  }

  return { name, description, body };
}

function extractField(frontmatter: string, field: string): string {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}
