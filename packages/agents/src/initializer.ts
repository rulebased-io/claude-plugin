import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { getConfigDir, getConfigPath, getDelegatesDir, getLogsDir, getDefaultConfig } from "./config.js";

export interface InitResult {
  created: boolean;
  configPath: string;
  message: string;
}

export function initAgents(cwd: string, project: string): InitResult {
  const configDir = getConfigDir(cwd);
  const configPath = getConfigPath(cwd);
  const delegatesDir = getDelegatesDir(cwd);
  const logsDir = getLogsDir(cwd);

  if (existsSync(configPath)) {
    return {
      created: false,
      configPath,
      message: `Already initialized at ${configDir}`,
    };
  }

  mkdirSync(configDir, { recursive: true });
  mkdirSync(delegatesDir, { recursive: true });
  mkdirSync(logsDir, { recursive: true });

  const config = getDefaultConfig(project);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

  return {
    created: true,
    configPath,
    message: `.rulebased/agents/ initialized. Project: ${project}`,
  };
}
