import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AgentConfig } from "./types.js";

const CONFIG_DIR = ".rulebased/agents";
const CONFIG_FILE = "config.json";

export function getDefaultConfig(project: string): AgentConfig {
  return {
    project,
    server: { port: 9100 },
  };
}

export function loadConfig(cwd: string): AgentConfig | null {
  const configPath = getConfigPath(cwd);
  if (!existsSync(configPath)) {
    return null;
  }
  const raw = readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as AgentConfig;
}

export function getConfigDir(cwd: string): string {
  return join(cwd, CONFIG_DIR);
}

export function getConfigPath(cwd: string): string {
  return join(cwd, CONFIG_DIR, CONFIG_FILE);
}

export function getDelegatesDir(cwd: string): string {
  return join(cwd, CONFIG_DIR, "delegates");
}

export function getLogsDir(cwd: string): string {
  return join(cwd, CONFIG_DIR, "logs");
}
