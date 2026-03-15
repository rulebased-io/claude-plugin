/**
 * Transcript Parser - Parses Claude Code JSONL session transcripts
 *
 * Transcript location: ~/.claude/projects/<project>/sessions/<uuid>.jsonl
 * Or: ~/.claude/projects/<project>/<session-id>.jsonl
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

// ─── Types ───

export interface TranscriptEvent {
  type: "user" | "assistant" | "progress" | "system" | "file-history-snapshot" | "queue-operation" | string;
  uuid: string;
  parentUuid: string | null;
  timestamp: string;
  sessionId: string;
  message?: unknown;
  cwd?: string;
  userType?: string;
  version?: string;
}

export interface TranscriptStats {
  sessionId: string;
  totalEvents: number;
  userTurns: number;
  assistantTurns: number;
  systemEvents: number;
  progressEvents: number;
  autonomyRatio: number;      // assistant / (user + assistant)
  durationMinutes: number;
  firstTimestamp: string;
  lastTimestamp: string;
  toolUses: ToolUseSummary[];
}

export interface ToolUseSummary {
  toolName: string;
  count: number;
}

// ─── Parser ───

/** Parse a JSONL transcript file into events */
export function parseTranscript(filePath: string): TranscriptEvent[] {
  const content = readFileSync(filePath, "utf-8");
  const events: TranscriptEvent[] = [];

  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      // Skip malformed lines
    }
  }

  return events;
}

/** Extract statistics from parsed events */
export function computeStats(events: TranscriptEvent[]): TranscriptStats {
  const userTurns = events.filter((e) => e.type === "user").length;
  const assistantTurns = events.filter((e) => e.type === "assistant").length;
  const systemEvents = events.filter((e) => e.type === "system").length;
  const progressEvents = events.filter((e) => e.type === "progress").length;

  const timestamps = events
    .map((e) => e.timestamp)
    .filter(Boolean)
    .sort();

  const first = timestamps[0] ?? "";
  const last = timestamps[timestamps.length - 1] ?? "";
  const durationMs = first && last ? new Date(last).getTime() - new Date(first).getTime() : 0;

  // Extract tool uses from assistant messages
  const toolCounts = new Map<string, number>();
  for (const event of events) {
    if (event.type === "assistant" && event.message) {
      const msg = event.message as { content?: Array<{ type: string; name?: string }> };
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === "tool_use" && block.name) {
            toolCounts.set(block.name, (toolCounts.get(block.name) ?? 0) + 1);
          }
        }
      }
    }
  }

  const toolUses = Array.from(toolCounts.entries())
    .map(([toolName, count]) => ({ toolName, count }))
    .sort((a, b) => b.count - a.count);

  const totalConversational = userTurns + assistantTurns;

  return {
    sessionId: events[0]?.sessionId ?? "unknown",
    totalEvents: events.length,
    userTurns,
    assistantTurns,
    systemEvents,
    progressEvents,
    autonomyRatio: totalConversational > 0 ? assistantTurns / totalConversational : 0,
    durationMinutes: Math.round(durationMs / 60000),
    firstTimestamp: first,
    lastTimestamp: last,
    toolUses,
  };
}

// ─── Discovery ───

/** Find the transcript file for the current project */
export function findProjectTranscripts(projectPath: string): string[] {
  const claudeDir = join(homedir(), ".claude", "projects");
  if (!existsSync(claudeDir)) return [];

  // Derive project directory name from path
  const projectDirName = "-" + projectPath.replace(/^\//, "").replace(/\//g, "-");
  const projectDir = join(claudeDir, projectDirName);

  if (!existsSync(projectDir)) return [];

  const files: string[] = [];
  for (const entry of readdirSync(projectDir)) {
    if (entry.endsWith(".jsonl")) {
      files.push(join(projectDir, entry));
    }
  }

  return files.sort();
}

/** Find the most recent transcript for a project */
export function findLatestTranscript(projectPath: string): string | null {
  const transcripts = findProjectTranscripts(projectPath);
  return transcripts.length > 0 ? transcripts[transcripts.length - 1] : null;
}
