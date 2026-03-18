#!/usr/bin/env node
/**
 * Harness Plugin CLI
 *
 * Usage:
 *   npx @rulebased/harness init [--force]
 *   npx @rulebased/harness audit [path]
 *   npx @rulebased/harness recommend [path]
 */

import { resolve } from "node:path";
import { audit, formatReport, formatScore } from "./auditor.js";
import { initHarness } from "./initializer.js";
import { evaluateLog, formatLogEval } from "./log-evaluator.js";
import { formatRecommendations, recommend } from "./recommender.js";
import {
  computeStats,
  findLatestTranscript,
  parseTranscript,
} from "./transcript.js";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
  @rulebased/harness - Harness scaffolding tool for AI agents
  https://github.com/rulebased-io/claude-plugin

  Usage:
    npx @rulebased/harness <command> [options]

  Commands:
    audit [path]          Audit harness coverage (17 criteria, score 0-100)
    score [path]          Per-category harness score report
    recommend [path]      Recommend missing harness elements (by priority)
    init [path]           Initialize harness structure (AGENTS.md, specs/, tasks/)
    eval-log [path]       Evaluate conversation log against harness compliance

  Options:
    --force               Overwrite existing files (init)
    --json                Output in JSON format (audit, recommend)
    -h, --help            Show help
    -v, --version         Show version

  Examples:
    npx @rulebased/harness audit              Audit the current directory
    npx @rulebased/harness audit ./my-app     Audit a specific path
    npx @rulebased/harness audit --json       Output as JSON
    npx @rulebased/harness recommend          Get improvement recommendations
    npx @rulebased/harness init               Initialize harness
    npx @rulebased/harness init --force       Overwrite existing files

  Skills (skills.sh):
    npx skills add rulebased-io/claude-plugin
`);
}

function getProjectPath(): string {
  const pathArg = args.find((a) => !a.startsWith("-") && a !== command);
  return resolve(pathArg || ".");
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function getOption(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
}

switch (command) {
  case "init": {
    const projectPath = getProjectPath();
    const force = hasFlag("--force");
    const preset = getOption("--preset") as "minimal" | "standard" | undefined;
    console.log(
      `Initializing harness in: ${projectPath} (preset: ${preset ?? "standard"})\n`,
    );

    const result = initHarness(projectPath, { force, preset });

    if (result.created.length > 0) {
      console.log("Created:");
      for (const f of result.created) console.log(`  + ${f}`);
    }
    if (result.skipped.length > 0) {
      console.log("Skipped (already exists):");
      for (const f of result.skipped) console.log(`  - ${f}`);
    }
    console.log(`\n${result.message}`);
    break;
  }

  case "audit": {
    const projectPath = getProjectPath();
    const report = audit(projectPath);

    if (hasFlag("--json")) {
      console.log(JSON.stringify(report, null, 2));
    } else if (hasFlag("--short")) {
      console.log(formatScore(report));
    } else {
      console.log(formatReport(report));
    }
    break;
  }

  case "score": {
    const projectPath = getProjectPath();
    const report = audit(projectPath);

    if (hasFlag("--json")) {
      console.log(
        JSON.stringify({
          score: report.score,
          grade: report.grade,
          passed: report.summary.passed,
          total: report.summary.total,
        }),
      );
    } else {
      console.log(formatScore(report));
    }
    break;
  }

  case "recommend": {
    const projectPath = getProjectPath();
    const report = audit(projectPath);
    const recs = recommend(report);

    if (hasFlag("--json")) {
      console.log(JSON.stringify(recs, null, 2));
    } else {
      console.log(formatRecommendations(recs));
    }
    break;
  }

  case "eval-log": {
    const projectPath = getProjectPath();
    const transcriptPath =
      getOption("--file") ?? findLatestTranscript(projectPath);

    if (!transcriptPath) {
      console.error(
        "No transcript found. Specify a path with --file or run from a project with Claude Code history.",
      );
      process.exit(1);
    }

    console.log(`Evaluating: ${transcriptPath}\n`);
    const events = parseTranscript(transcriptPath);
    const stats = computeStats(events);
    const report = evaluateLog(stats);

    if (hasFlag("--json")) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatLogEval(report));
    }
    break;
  }

  case "-v":
  case "--version":
    console.log("@rulebased/harness v1.4.2");
    break;

  case "-h":
  case "--help":
  case undefined:
    printUsage();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
