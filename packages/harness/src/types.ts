/**
 * Core type definitions for the harness system
 *
 * Categories based on OpenAI Codex Harness Engineering:
 * https://openai.com/index/unlocking-the-codex-harness/
 */

// ─── Audit ───

export interface AuditCheck {
  id: string;
  category: AuditCategory;
  name: string;
  description: string;
  pass: boolean;
  severity: "critical" | "important" | "nice-to-have";
  details?: string;
  fix?: string;
}

export type AuditCategory =
  | "context" // AGENTS.md, ARCHITECTURE.md, docs/, progressive disclosure
  | "bootstrap" // One-command setup, reproducible environment
  | "constraints" // Linter, formatter, pre-commit, architectural enforcement
  | "eval" // CI pipeline, tests, coverage, regression
  | "entropy" // Tech debt tracking, doc freshness, pattern enforcement
  | "safety" // Secrets, .gitignore, security docs
  | "knowledge" // ADRs, decision records, in-repo knowledge
  | "workflow"; // specs/, tasks/ directories

export interface AuditReport {
  projectPath: string;
  timestamp: string;
  score: number; // 0-100
  grade: string; // A, B, C, D, F
  checks: AuditCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    byCritical: { passed: number; total: number };
    byCategory: Record<AuditCategory, { passed: number; total: number }>;
  };
}

// ─── Recommend ───

export interface Recommendation {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  effort: "small" | "medium" | "large";
  template?: string;
  targetPath?: string;
}

// ─── Preset ───

export type PresetName = "minimal" | "standard";

export interface HarnessConfig {
  preset?: PresetName;
  checks?: {
    enable?: string[];
    disable?: string[];
  };
  severity?: Record<string, "critical" | "important" | "nice-to-have">;
}

// ─── Init ───

export interface InitOptions {
  projectName?: string;
  preset?: PresetName;
  skipWorkflow?: boolean;
  force?: boolean;
}

export interface InitResult {
  created: string[];
  skipped: string[];
  message: string;
}
