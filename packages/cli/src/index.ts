#!/usr/bin/env node
/**
 * Harness Plugin CLI
 *
 * Usage:
 *   npx rulebased-harness init [--force]
 *   npx rulebased-harness audit [path]
 *   npx rulebased-harness recommend [path]
 */

import { resolve } from "node:path";
import { audit, formatReport, formatScore } from "@rulebased/core/auditor";
import { recommend, formatRecommendations } from "@rulebased/core/recommender";
import { initHarness } from "@rulebased/core/initializer";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
  @rulebased/harness - AI 에이전트를 위한 하네스 구축 도구
  https://github.com/rulebased-io/harness

  Usage:
    rulebased-harness <command> [options]

  Commands:
    audit [path]          하네스 구축 정도 점검 (17개 항목, 0-100 점수)
    recommend [path]      빠진 하네스 요소 추천 (우선순위별)
    init [path]           하네스 구조 초기화 (AGENTS.md, specs/, tasks/)

  Options:
    --force               기존 파일 덮어쓰기 (init)
    --json                JSON 형식 출력 (audit, recommend)
    -h, --help            도움말
    -v, --version         버전 정보

  Examples:
    rulebased-harness audit              현재 디렉토리 점검
    rulebased-harness audit ./my-app     특정 경로 점검
    rulebased-harness audit --json       JSON 출력
    rulebased-harness recommend          개선 추천
    rulebased-harness init               하네스 초기화
    rulebased-harness init --force       기존 파일 덮어쓰기

  Skills (skills.sh):
    npx skills add rulebased-io/harness
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
    console.log(`Initializing harness in: ${projectPath} (preset: ${preset ?? "standard"})\n`);

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
      console.log(JSON.stringify({ score: report.score, grade: report.grade, passed: report.summary.passed, total: report.summary.total }));
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

  case "-v":
  case "--version":
    console.log("@rulebased/harness v1.0.0");
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
