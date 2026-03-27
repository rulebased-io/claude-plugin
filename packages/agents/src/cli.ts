#!/usr/bin/env node

import { resolve } from "node:path";
import { createAgentsServer } from "./server/index.js";
import { createLocalAgent } from "./agent/index.js";
import { initAgents } from "./initializer.js";
import { loadConfig, getDelegatesDir } from "./config.js";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
  @rulebased/agents - Cross-repo AI agent communication
  https://github.com/rulebased-io/claude-plugin

  Usage:
    npx @rulebased/agents <command> [options]

  Commands:
    serve                 Start the agents server
    agent                 Start local agent (register delegates, subscribe via WebSocket)
    init [project-name]   Initialize .rulebased/agents/ structure
    status                Show server status

  Options:
    --port <number>       Server port (default: 9100)
    --cwd <path>          Working directory
    -h, --help            Show help
    -v, --version         Show version
`);
}

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

async function main(): Promise<void> {
  if (!command || command === "-h" || command === "--help") {
    printUsage();
    return;
  }

  if (command === "-v" || command === "--version") {
    console.log("0.1.0");
    return;
  }

  const cwd = resolve(getArg("--cwd") ?? process.cwd());

  if (command === "serve") {
    const port = Number(getArg("--port") ?? "9100");
    console.log(`Starting agents server on localhost:${port}...`);
    const { server } = await createAgentsServer({ port });
    console.log(`Agents server running at http://localhost:${port}`);

    process.on("SIGINT", () => { server.close(); process.exit(0); });
    process.on("SIGTERM", () => { server.close(); process.exit(0); });
    return;
  }

  if (command === "agent") {
    const config = loadConfig(cwd);
    if (!config) {
      console.error("No .rulebased/agents/config.json found. Run 'init' first.");
      process.exit(1);
    }
    const port = Number(getArg("--port") ?? String(config.server.port));
    console.log(`Starting local agent for project "${config.project}"...`);

    const agent = await createLocalAgent({
      serverUrl: `http://localhost:${port}`,
      project: config.project,
      delegatesDir: getDelegatesDir(cwd),
      delegateRunner: async (name, _systemPrompt, userMessage) => {
        // Phase 1: placeholder — will be replaced with actual delegate execution
        return `[${name}] Received: ${userMessage}`;
      },
    });

    console.log(`Agent online. Delegates: ${agent.delegates.map((d) => `${config.project}:${d.name}`).join(", ")}`);

    process.on("SIGINT", async () => { await agent.shutdown(); process.exit(0); });
    process.on("SIGTERM", async () => { await agent.shutdown(); process.exit(0); });
    return;
  }

  if (command === "init") {
    const project = args[1];
    if (!project) {
      console.error("Usage: npx @rulebased/agents init <project-name>");
      process.exit(1);
    }
    const result = initAgents(cwd, project);
    console.log(result.message);
    return;
  }

  if (command === "status") {
    const port = Number(getArg("--port") ?? "9100");
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      const body = (await res.json()) as { uptime: number; peers: number };
      console.log(`Server: online (uptime: ${body.uptime}s, peers: ${body.peers})`);
    } catch {
      console.log("Server: offline");
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
