/**
 * Harness Auditor - Evaluates project harness setup against OpenAI Codex standards
 *
 * Based on: https://openai.com/index/unlocking-the-codex-harness/
 *
 * Categories:
 * 1. Context — AGENTS.md, ARCHITECTURE.md, docs/, progressive disclosure
 * 2. Bootstrap — One-command setup, reproducible environment, task entry points
 * 3. Constraints — Linter, formatter, pre-commit, architectural enforcement
 * 4. Eval & CI — CI pipeline, tests, coverage, regression
 * 5. Entropy Management — Tech debt tracking, pattern enforcement
 * 6. Safety — Secrets, .gitignore, security docs
 * 7. Knowledge — ADRs, decision records, in-repo knowledge
 * 8. Workflow — specs/, tasks/ directories
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AuditCheck, AuditCategory, AuditReport, HarnessConfig } from "./types.js";
import { getPreset, mergeConfig, isCheckDisabled, getSeverity } from "./presets.js";

/** Load .harness.json (falls back to standard preset if not found) */
export function loadConfig(projectPath: string): HarnessConfig {
  const configPath = join(projectPath, ".harness.json");
  const base = getPreset("standard");
  if (!existsSync(configPath)) return base;
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    const preset = raw.preset ? getPreset(raw.preset) : base;
    return mergeConfig(preset, raw);
  } catch { return base; }
}

/** Run a harness audit on the given project path */
export function audit(projectPath: string, config?: HarnessConfig): AuditReport {
  const cfg = config ?? loadConfig(projectPath);
  const allChecks: AuditCheck[] = [
    ...auditContext(projectPath),
    ...auditBootstrap(projectPath),
    ...auditConstraints(projectPath),
    ...auditEval(projectPath),
    ...auditEntropy(projectPath),
    ...auditSafety(projectPath),
    ...auditKnowledge(projectPath),
    ...auditWorkflow(projectPath),
  ];
  const checks = allChecks
    .filter((c) => !isCheckDisabled(c.id, cfg))
    .map((c) => ({ ...c, severity: getSeverity(c.id, c.severity, cfg) }));
  return buildReport(projectPath, checks);
}

// ─── 1. Context Engineering ───

function auditContext(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const agentsPath = join(p, "AGENTS.md");
  const agentsExists = existsSync(agentsPath);

  checks.push({
    id: "ctx-agents-exists", category: "context",
    name: "AGENTS.md exists",
    description: "Primary agent instruction file at project root",
    pass: agentsExists, severity: "critical",
    fix: "Create AGENTS.md. Use /rulebased-harness:init to auto-generate.",
  });

  if (agentsExists) {
    const content = readFileSync(agentsPath, "utf-8");
    const lines = content.split("\n").length;

    checks.push({
      id: "ctx-agents-concise", category: "context",
      name: "AGENTS.md is concise (map, not encyclopedia)",
      description: "Should be ~100 lines. A map, not an encyclopedia — progressive disclosure",
      pass: lines <= 200, severity: "important",
      details: `${lines} lines`,
      fix: "Keep AGENTS.md under 200 lines. Move details to docs/ and link from AGENTS.md.",
    });

    checks.push({
      id: "ctx-agents-build", category: "context",
      name: "AGENTS.md includes build/test commands",
      description: "Agents must know how to build and test",
      pass: /npm run|yarn|pnpm|make|cargo|go build|gradle|mvn/i.test(content),
      severity: "critical",
      fix: "Add '## Build & Test' section with exact commands.",
    });

    checks.push({
      id: "ctx-agents-arch", category: "context",
      name: "AGENTS.md includes architecture overview",
      description: "Project structure and layer descriptions",
      pass: /structure|architecture|layer|directory|계층|구조|아키텍처/i.test(content),
      severity: "important",
      fix: "Add project structure/architecture section.",
    });

    checks.push({
      id: "ctx-agents-pitfalls", category: "context",
      name: "AGENTS.md includes common pitfalls",
      description: "Rules derived from past agent failures (each line = one past failure)",
      pass: /pitfall|gotcha|avoid|don'?t|common mistake|실수|주의|금지/i.test(content),
      severity: "important",
      fix: "Add '## Common Pitfalls' section.",
    });

    checks.push({
      id: "ctx-agents-security", category: "context",
      name: "AGENTS.md includes security section",
      description: "Security considerations and policies",
      pass: /security|credential|secret|auth|보안/i.test(content),
      severity: "nice-to-have",
      fix: "Add security section or link to SECURITY.md.",
    });

    checks.push({
      id: "ctx-agents-links-docs", category: "context",
      name: "AGENTS.md links to deeper docs (progressive disclosure)",
      description: "Should point to docs/ for details instead of inlining everything",
      pass: /docs\/|\.md\)|see |refer/i.test(content),
      severity: "important",
      fix: "Add links from AGENTS.md to detailed docs in docs/ directory.",
    });
  }

  // ARCHITECTURE.md
  checks.push({
    id: "ctx-architecture-md", category: "context",
    name: "ARCHITECTURE.md exists",
    description: "High-level codebase map: domains, packages, layering",
    pass: existsSync(join(p, "ARCHITECTURE.md")) || existsSync(join(p, "docs/architecture.md")) || existsSync(join(p, "docs/ARCHITECTURE.md")),
    severity: "critical",
    fix: "Create ARCHITECTURE.md with domain map and package layering (<200 lines).",
  });

  // Subdirectory AGENTS.md
  const hasSubAgents = findFiles(p, "AGENTS.md", 2).length > 1;
  checks.push({
    id: "ctx-sub-agents", category: "context",
    name: "Subdirectory AGENTS.md files for major subsystems",
    description: "Major subsystems should have their own AGENTS.md",
    pass: hasSubAgents, severity: "nice-to-have",
    fix: "Add AGENTS.md in major subdirectories (src/, packages/, etc.).",
  });

  // docs/ directory
  checks.push({
    id: "ctx-docs-dir", category: "context",
    name: "docs/ directory exists",
    description: "Structured documentation directory for progressive disclosure",
    pass: existsSync(join(p, "docs")), severity: "important",
    fix: "Create a docs/ directory with structured documentation.",
  });

  // CLAUDE.md
  checks.push({
    id: "ctx-claude-exists", category: "context",
    name: "CLAUDE.md exists",
    description: "Project guide that Claude Code reads automatically",
    pass: existsSync(join(p, "CLAUDE.md")), severity: "nice-to-have",
    fix: "Create CLAUDE.md referencing AGENTS.md.",
  });

  return checks;
}

// ─── 2. Bootstrap & Task Entry Points ───

function auditBootstrap(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const pkgPath = join(p, "package.json");
  const hasMakefile = existsSync(join(p, "Makefile"));
  const hasPackageJson = existsSync(pkgPath);
  let scripts: Record<string, string> = {};

  if (hasPackageJson) {
    try { scripts = JSON.parse(readFileSync(pkgPath, "utf-8")).scripts || {}; } catch {}
  }

  // One-command bootstrap
  const hasBootstrap = existsSync(join(p, "setup.sh")) || existsSync(join(p, "bootstrap.sh"))
    || existsSync(join(p, "Makefile")) || existsSync(join(p, "docker-compose.yml"))
    || "prepare" in scripts || "setup" in scripts || "postinstall" in scripts;
  checks.push({
    id: "boot-one-command", category: "bootstrap",
    name: "One-command bootstrap capability",
    description: "Repo can initialize from scratch with a single command",
    pass: hasBootstrap || hasPackageJson, severity: "critical",
    fix: "Add a bootstrap script or setup target.",
  });

  // Build command
  checks.push({
    id: "boot-build-cmd", category: "bootstrap",
    name: "Build command exists",
    description: "Standardized build entry point (npm run build, make build, etc.)",
    pass: "build" in scripts || hasMakefile, severity: "critical",
    fix: "Add a 'build' script to package.json.",
  });

  // Test command
  checks.push({
    id: "boot-test-cmd", category: "bootstrap",
    name: "Test command exists",
    description: "Standardized test entry point",
    pass: "test" in scripts || hasMakefile, severity: "critical",
    fix: "Add a 'test' script to package.json.",
  });

  // Lint command
  checks.push({
    id: "boot-lint-cmd", category: "bootstrap",
    name: "Lint command exists",
    description: "Standardized lint entry point",
    pass: "lint" in scripts || "check" in scripts || hasMakefile,
    severity: "critical",
    fix: "Add a 'lint' script to package.json.",
  });

  // Lockfile (reproducible environment)
  const hasLockfile = existsSync(join(p, "pnpm-lock.yaml"))
    || existsSync(join(p, "package-lock.json"))
    || existsSync(join(p, "yarn.lock"))
    || existsSync(join(p, "Cargo.lock"))
    || existsSync(join(p, "go.sum"));
  checks.push({
    id: "boot-lockfile", category: "bootstrap",
    name: "Lockfile exists (reproducible environment)",
    description: "Deterministic dependency resolution for reproducible builds",
    pass: hasLockfile, severity: "important",
    fix: "Commit your lockfile (pnpm-lock.yaml, package-lock.json, etc.).",
  });

  return checks;
}

// ─── 3. Constraints ───

function auditConstraints(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  const lintFiles = [
    ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yml",
    "eslint.config.js", "eslint.config.mjs", "eslint.config.ts",
    "biome.json", "biome.jsonc",
    ".rubocop.yml", ".pylintrc", "pyproject.toml", "ruff.toml",
    ".golangci.yml", "rustfmt.toml", "clippy.toml",
  ];
  checks.push({
    id: "cst-linter", category: "constraints",
    name: "Linter configuration exists",
    description: "Mechanically enforces code style and catches errors",
    pass: lintFiles.some((f) => existsSync(join(p, f))),
    severity: "critical",
    fix: "Add ESLint, Biome, ruff, or equivalent linter config.",
  });

  const fmtFiles = [
    ".prettierrc", ".prettierrc.json", ".prettierrc.js",
    "biome.json", "biome.jsonc",
    "rustfmt.toml", ".editorconfig",
  ];
  checks.push({
    id: "cst-formatter", category: "constraints",
    name: "Formatter configuration exists",
    description: "Enforces consistent code formatting",
    pass: fmtFiles.some((f) => existsSync(join(p, f))),
    severity: "important",
    fix: "Add Prettier, Biome, or .editorconfig.",
  });

  checks.push({
    id: "cst-precommit", category: "constraints",
    name: "Pre-commit hooks configured",
    description: "Automatic validation before commits",
    pass: existsSync(join(p, ".husky")) || existsSync(join(p, "lefthook.yml")) || existsSync(join(p, ".pre-commit-config.yaml")),
    severity: "important",
    fix: "Set up Husky, Lefthook, or pre-commit.",
  });

  // TypeScript strict
  const tsconfigPath = join(p, "tsconfig.json");
  if (existsSync(tsconfigPath)) {
    try {
      const tsconfig = readFileSync(tsconfigPath, "utf-8");
      checks.push({
        id: "cst-ts-strict", category: "constraints",
        name: "TypeScript strict mode enabled",
        description: "Enforce type safety with strict: true",
        pass: /"strict"\s*:\s*true/.test(tsconfig), severity: "important",
        fix: "Add \"strict\": true to tsconfig.json.",
      });
    } catch {}
  }

  // Architectural enforcement
  const hasArchTests = findFiles(p, "*.test.*", 3).some((f) =>
    /arch|structure|boundary|layer|depend/i.test(f));
  checks.push({
    id: "cst-arch-enforcement", category: "constraints",
    name: "Architectural boundary enforcement",
    description: "Structural tests or dependency rules that prevent layer violations",
    pass: hasArchTests, severity: "nice-to-have",
    fix: "Add structural tests that verify dependency direction rules.",
  });

  return checks;
}

// ─── 4. Eval & CI ───

function auditEval(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  const ciPaths = [".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml"];
  const hasCI = ciPaths.some((cp) => existsSync(join(p, cp)));
  checks.push({
    id: "eval-ci-exists", category: "eval",
    name: "CI pipeline exists",
    description: "Automated build/test pipeline that validates changes",
    pass: hasCI, severity: "critical",
    fix: "Add a CI workflow under .github/workflows/.",
  });

  // CI runs lint
  if (hasCI && existsSync(join(p, ".github/workflows"))) {
    const ciContent = readCIContent(p);
    checks.push({
      id: "eval-ci-lint", category: "eval",
      name: "CI runs linter",
      description: "Lint step in CI pipeline",
      pass: /lint|check|biome|eslint|ruff/i.test(ciContent), severity: "important",
      fix: "Add a lint step to your CI workflow.",
    });
  }

  // Test coverage
  const pkgPath = join(p, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const scripts = JSON.parse(readFileSync(pkgPath, "utf-8")).scripts || {};
      const hasTestScript = "test" in scripts;
      checks.push({
        id: "eval-tests-exist", category: "eval",
        name: "Test suite exists",
        description: "Regression tests to verify changes work",
        pass: hasTestScript, severity: "critical",
        fix: "Add a test suite and 'test' script.",
      });
    } catch {}
  }

  // Eval dataset
  checks.push({
    id: "eval-dataset", category: "eval",
    name: "Eval dataset exists",
    description: "Dataset for evaluating agent behavior systematically",
    pass: ["evals", "eval", "__evals__"].some((d) => existsSync(join(p, d))),
    severity: "nice-to-have",
    fix: "Add evaluation prompts to evals/datasets/.",
  });

  return checks;
}

// ─── 5. Entropy Management ───

function auditEntropy(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  checks.push({
    id: "ent-tech-debt", category: "entropy",
    name: "Tech debt tracker exists",
    description: "Versioned tech debt tracking document",
    pass: existsSync(join(p, "docs/tech-debt-tracker.md")) || existsSync(join(p, "TECH_DEBT.md")) || existsSync(join(p, "docs/TECH_DEBT.md")),
    severity: "nice-to-have",
    fix: "Create a tech-debt-tracker.md in docs/.",
  });

  // All docs in repo (not external)
  const agentsPath = join(p, "AGENTS.md");
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf-8");
    checks.push({
      id: "ent-docs-in-repo", category: "entropy",
      name: "Documentation is in-repo (not Slack/Google Docs)",
      description: "All critical knowledge must be in version control, not external tools",
      pass: !/google docs|confluence|notion\.so|slack channel/i.test(content),
      severity: "important",
      fix: "Migrate external documentation references into the repository.",
    });
  }

  return checks;
}

// ─── 6. Safety ───

function auditSafety(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  checks.push({
    id: "saf-gitignore", category: "safety",
    name: ".gitignore exists",
    description: "Prevents tracking secrets and unnecessary files",
    pass: existsSync(join(p, ".gitignore")), severity: "critical",
    fix: "Add a .gitignore file.",
  });

  // .gitignore blocks secrets
  if (existsSync(join(p, ".gitignore"))) {
    const gi = readFileSync(join(p, ".gitignore"), "utf-8");
    checks.push({
      id: "saf-gitignore-env", category: "safety",
      name: ".gitignore blocks .env files",
      description: "Secret files must not be committed",
      pass: /\.env/i.test(gi), severity: "critical",
      fix: "Add '.env' and '.env.*' to .gitignore.",
    });
  }

  // SECURITY.md
  checks.push({
    id: "saf-security-doc", category: "safety",
    name: "Security documentation exists",
    description: "SECURITY.md or docs/SECURITY.md for security policies",
    pass: existsSync(join(p, "SECURITY.md")) || existsSync(join(p, "docs/SECURITY.md")) || existsSync(join(p, "docs/security.md")),
    severity: "nice-to-have",
    fix: "Create SECURITY.md with security policies and reporting instructions.",
  });

  // No secrets in repo
  checks.push({
    id: "saf-no-env-file", category: "safety",
    name: "No .env files committed",
    description: ".env files with secrets must not be in the repository",
    pass: !existsSync(join(p, ".env")) && !existsSync(join(p, ".env.local")),
    severity: "critical",
    fix: "Remove .env files from the repository and add to .gitignore.",
  });

  return checks;
}

// ─── 7. Knowledge Management ───

function auditKnowledge(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // ADRs
  const hasADRs = existsSync(join(p, "docs/decisions"))
    || existsSync(join(p, "docs/design-docs"))
    || existsSync(join(p, "docs/adr"))
    || existsSync(join(p, "adr"));
  checks.push({
    id: "know-adrs", category: "knowledge",
    name: "Architecture Decision Records exist",
    description: "Documented 'We chose X over Y because...' decisions",
    pass: hasADRs, severity: "important",
    fix: "Create docs/decisions/ or docs/design-docs/ with ADR files.",
  });

  // README.md
  checks.push({
    id: "know-readme", category: "knowledge",
    name: "README.md exists",
    description: "Basic project documentation for onboarding",
    pass: existsSync(join(p, "README.md")) || existsSync(join(p, "readme.md")),
    severity: "important",
    fix: "Write a README.md.",
  });

  return checks;
}

// ─── 8. Workflow ───

function auditWorkflow(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  checks.push({
    id: "wf-specs-dir", category: "workflow",
    name: "specs/ folder exists",
    description: "Folder for recording ideas and requirements",
    pass: existsSync(join(p, "specs")) || existsSync(join(p, "spec")),
    severity: "nice-to-have",
    fix: "Create specs/todo, specs/done, specs/backlog.",
  });

  checks.push({
    id: "wf-tasks-dir", category: "workflow",
    name: "tasks/ folder exists",
    description: "Folder for tracking implementation work units",
    pass: existsSync(join(p, "tasks")) || existsSync(join(p, "task")),
    severity: "nice-to-have",
    fix: "Create tasks/todo, tasks/done.",
  });

  return checks;
}

// ─── Helpers ───

function findFiles(dir: string, pattern: string, maxDepth: number, depth = 0): string[] {
  if (depth > maxDepth || !existsSync(dir)) return [];
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...findFiles(fullPath, pattern, maxDepth, depth + 1));
        } else if (matchPattern(entry, pattern)) {
          results.push(fullPath);
        }
      } catch { /* permission error */ }
    }
  } catch { /* read error */ }
  return results;
}

function matchPattern(filename: string, pattern: string): boolean {
  const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$", "i");
  return regex.test(filename);
}

function readCIContent(p: string): string {
  const wfDir = join(p, ".github/workflows");
  if (!existsSync(wfDir)) return "";
  try {
    return readdirSync(wfDir)
      .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
      .map((f) => readFileSync(join(wfDir, f), "utf-8"))
      .join("\n");
  } catch { return ""; }
}

// ─── Report Builder ───

function buildReport(projectPath: string, checks: AuditCheck[]): AuditReport {
  const passed = checks.filter((c) => c.pass).length;
  const failed = checks.filter((c) => !c.pass).length;

  const weights: Record<string, number> = { critical: 3, important: 2, "nice-to-have": 1 };
  let weightedTotal = 0;
  let weightedPassed = 0;
  for (const c of checks) {
    const w = weights[c.severity] ?? 1;
    weightedTotal += w;
    if (c.pass) weightedPassed += w;
  }
  const score = weightedTotal > 0 ? Math.round((weightedPassed / weightedTotal) * 100) : 0;

  const grade =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  const categories: AuditCategory[] = ["context", "bootstrap", "constraints", "eval", "entropy", "safety", "knowledge", "workflow"];
  const byCategory: Record<string, { passed: number; total: number }> = {};
  for (const cat of categories) {
    const catChecks = checks.filter((c) => c.category === cat);
    byCategory[cat] = { passed: catChecks.filter((c) => c.pass).length, total: catChecks.length };
  }

  const criticalChecks = checks.filter((c) => c.severity === "critical");

  return {
    projectPath, timestamp: new Date().toISOString(), score, grade, checks,
    summary: {
      total: checks.length, passed, failed,
      byCritical: { passed: criticalChecks.filter((c) => c.pass).length, total: criticalChecks.length },
      byCategory: byCategory as Record<AuditCategory, { passed: number; total: number }>,
    },
  };
}

// ─── Formatters ───

const CAT_NAMES: Record<AuditCategory, string> = {
  context: "Context Engineering",
  bootstrap: "Bootstrap & Task Entry",
  constraints: "Constraints & Enforcement",
  eval: "Eval & CI",
  entropy: "Entropy Management",
  safety: "Safety & Secrets",
  knowledge: "Knowledge Management",
  workflow: "Workflow",
};

/** Format an audit report as readable text */
export function formatReport(report: AuditReport): string {
  const lines: string[] = [];
  lines.push(`## Harness Audit Report`);
  lines.push(``);
  lines.push(`**Score: ${report.score}/100 (${report.grade})**`);
  lines.push(`**Passed: ${report.summary.passed}/${report.summary.total}** | Critical: ${report.summary.byCritical.passed}/${report.summary.byCritical.total}`);
  lines.push(``);
  lines.push(`### Category Breakdown`);
  lines.push(``);
  for (const [cat, label] of Object.entries(CAT_NAMES)) {
    const s = report.summary.byCategory[cat as AuditCategory];
    if (!s || s.total === 0) continue;
    const icon = s.passed === s.total ? "PASS" : "FAIL";
    lines.push(`- [${icon}] ${label}: ${s.passed}/${s.total}`);
  }
  const failed = report.checks.filter((c) => !c.pass);
  if (failed.length > 0) {
    lines.push(``);
    lines.push(`### Failed Checks`);
    lines.push(``);
    for (const c of failed) {
      const sev = c.severity === "critical" ? "CRITICAL" : c.severity === "important" ? "IMPORTANT" : "OPTIONAL";
      lines.push(`- [${sev}] **${c.name}**: ${c.description}`);
      if (c.fix) lines.push(`  - Fix: ${c.fix}`);
    }
  }
  return lines.join("\n");
}

/** Detailed score report by category */
export function formatScore(report: AuditReport): string {
  const lines: string[] = [];
  lines.push(`## Harness Score Report`);
  lines.push(``);
  lines.push(`${renderBar(report.score)}  **${report.score}/100 (${report.grade})**`);
  lines.push(``);
  for (const [cat, label] of Object.entries(CAT_NAMES)) {
    const catChecks = report.checks.filter((c) => c.category === cat);
    if (catChecks.length === 0) continue;
    const passed = catChecks.filter((c) => c.pass).length;
    const catScore = Math.round((passed / catChecks.length) * 100);
    lines.push(`### ${label}  ${renderBar(catScore)}  ${catScore}/100  (${passed}/${catChecks.length})`);
    lines.push(``);
    for (const c of catChecks) {
      lines.push(`- [${c.pass ? "PASS" : "FAIL"}] ${c.name}`);
      if (!c.pass && c.fix) lines.push(`  -> ${c.fix}`);
    }
    lines.push(``);
  }
  return lines.join("\n");
}

function renderBar(score: number): string {
  const filled = Math.round(score / 5);
  return "[" + "#".repeat(filled) + "-".repeat(20 - filled) + "]";
}
