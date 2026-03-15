/**
 * Log Evaluator - Evaluates conversation transcripts against harness compliance
 *
 * Analyzes how well a Claude Code session followed harness engineering practices.
 */

import type { TranscriptStats } from "./transcript.js";

// ─── Types ───

export interface LogEvalCheck {
  id: string;
  name: string;
  pass: boolean;
  score: number;         // 0-100
  details: string;
}

export interface LogEvalReport {
  sessionId: string;
  timestamp: string;
  overallScore: number;
  grade: string;
  stats: TranscriptStats;
  checks: LogEvalCheck[];
}

// ─── Evaluator ───

/** Evaluate a transcript's compliance with harness practices */
export function evaluateLog(stats: TranscriptStats): LogEvalReport {
  const checks: LogEvalCheck[] = [
    checkHumanTurns(stats),
    checkAutonomyRatio(stats),
    checkBuildTestExecution(stats),
    checkToolDiversity(stats),
    checkSessionDuration(stats),
  ];

  const overallScore = Math.round(
    checks.reduce((sum, c) => sum + c.score, 0) / checks.length,
  );

  const grade =
    overallScore >= 90 ? "A" :
    overallScore >= 75 ? "B" :
    overallScore >= 60 ? "C" :
    overallScore >= 40 ? "D" : "F";

  return {
    sessionId: stats.sessionId,
    timestamp: new Date().toISOString(),
    overallScore,
    grade,
    stats,
    checks,
  };
}

// ─── Individual Checks ───

/** Fewer human turns = more autonomous agent work */
function checkHumanTurns(stats: TranscriptStats): LogEvalCheck {
  const { userTurns, assistantTurns } = stats;
  const total = userTurns + assistantTurns;

  if (total === 0) {
    return { id: "human-turns", name: "Human Turn Count", pass: false, score: 0, details: "No conversation data" };
  }

  // Ideal: low human intervention. Score decreases as human ratio increases.
  const humanRatio = userTurns / total;
  let score: number;
  if (humanRatio <= 0.2) score = 100;       // Excellent: <20% human
  else if (humanRatio <= 0.3) score = 80;   // Good: 20-30%
  else if (humanRatio <= 0.4) score = 60;   // OK: 30-40%
  else if (humanRatio <= 0.5) score = 40;   // Below average: 40-50%
  else score = 20;                           // High intervention: >50%

  return {
    id: "human-turns",
    name: "Human Turn Count",
    pass: score >= 60,
    score,
    details: `${userTurns} human turns / ${total} total (${Math.round(humanRatio * 100)}% human)`,
  };
}

/** Higher autonomy ratio = agent doing more work independently */
function checkAutonomyRatio(stats: TranscriptStats): LogEvalCheck {
  const ratio = stats.autonomyRatio;
  let score: number;
  if (ratio >= 0.8) score = 100;
  else if (ratio >= 0.7) score = 80;
  else if (ratio >= 0.6) score = 60;
  else if (ratio >= 0.5) score = 40;
  else score = 20;

  return {
    id: "autonomy-ratio",
    name: "Autonomy Ratio",
    pass: score >= 60,
    score,
    details: `${Math.round(ratio * 100)}% agent autonomy (${stats.assistantTurns} agent / ${stats.userTurns + stats.assistantTurns} total)`,
  };
}

/** Check if build/test commands were executed */
function checkBuildTestExecution(stats: TranscriptStats): LogEvalCheck {
  const bashUses = stats.toolUses.find((t) => t.toolName === "Bash");
  const hasBash = (bashUses?.count ?? 0) > 0;

  // We can't inspect actual commands from stats alone,
  // but Bash tool usage is a proxy for build/test execution
  let score: number;
  if (!hasBash) {
    score = 30; // No shell commands at all
  } else if (bashUses!.count >= 5) {
    score = 100; // Active shell usage
  } else {
    score = 60;
  }

  return {
    id: "build-test",
    name: "Build/Test Execution",
    pass: score >= 60,
    score,
    details: `${bashUses?.count ?? 0} Bash tool invocations`,
  };
}

/** Check tool diversity - using multiple tools shows thorough work */
function checkToolDiversity(stats: TranscriptStats): LogEvalCheck {
  const uniqueTools = stats.toolUses.length;
  let score: number;
  if (uniqueTools >= 6) score = 100;
  else if (uniqueTools >= 4) score = 80;
  else if (uniqueTools >= 2) score = 60;
  else if (uniqueTools >= 1) score = 40;
  else score = 20;

  const toolNames = stats.toolUses.map((t) => `${t.toolName}(${t.count})`).join(", ");

  return {
    id: "tool-diversity",
    name: "Tool Diversity",
    pass: score >= 60,
    score,
    details: `${uniqueTools} unique tools: ${toolNames || "none"}`,
  };
}

/** Reasonable session duration - not too short, not excessively long */
function checkSessionDuration(stats: TranscriptStats): LogEvalCheck {
  const mins = stats.durationMinutes;
  let score: number;
  if (mins >= 5 && mins <= 120) score = 100;     // Sweet spot
  else if (mins >= 2 && mins <= 180) score = 80;
  else if (mins < 2) score = 40;                   // Too short
  else score = 60;                                  // Very long

  return {
    id: "session-duration",
    name: "Session Duration",
    pass: score >= 60,
    score,
    details: `${mins} minutes`,
  };
}

// ─── Formatter ───

/** Format a log evaluation report as readable text */
export function formatLogEval(report: LogEvalReport): string {
  const lines: string[] = [];

  lines.push(`## Harness Log Evaluation Report`);
  lines.push(``);
  lines.push(`**Score: ${report.overallScore}/100 (${report.grade})**`);
  lines.push(`**Session: ${report.sessionId}**`);
  lines.push(`**Duration: ${report.stats.durationMinutes} min** | Human turns: ${report.stats.userTurns} | Agent turns: ${report.stats.assistantTurns}`);
  lines.push(``);

  for (const check of report.checks) {
    const icon = check.pass ? "PASS" : "FAIL";
    const bar = "[" + "#".repeat(Math.round(check.score / 5)) + "-".repeat(20 - Math.round(check.score / 5)) + "]";
    lines.push(`### ${check.name}  ${bar}  ${check.score}/100`);
    lines.push(``);
    lines.push(`- [${icon}] ${check.details}`);
    lines.push(``);
  }

  return lines.join("\n");
}
