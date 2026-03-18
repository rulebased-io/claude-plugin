/**
 * Harness Recommender - Recommends missing harness elements
 *
 * Generates recommendations based on audit results.
 * Categories aligned with OpenAI Codex harness standards.
 */

import type { AuditReport, Recommendation } from "./types.js";

/** Derive recommendations from an audit report */
export function recommend(report: AuditReport): Recommendation[] {
  const recs: Recommendation[] = [];
  const failedIds = new Set(
    report.checks.filter((c) => !c.pass).map((c) => c.id),
  );

  // ─── Context ───

  if (failedIds.has("ctx-agents-exists")) {
    recs.push({
      id: "rec-agents-md",
      category: "context",
      title: "Create AGENTS.md",
      description:
        "Primary agent instruction file with build commands, architecture, and common pitfalls.",
      priority: "high",
      effort: "medium",
      template: "agents-md",
      targetPath: "AGENTS.md",
    });
  }
  if (failedIds.has("ctx-architecture-md")) {
    recs.push({
      id: "rec-architecture-md",
      category: "context",
      title: "Create ARCHITECTURE.md",
      description:
        "High-level codebase map: domains, packages, layering (<200 lines).",
      priority: "high",
      effort: "medium",
      template: "architecture-md",
      targetPath: "ARCHITECTURE.md",
    });
  }
  if (failedIds.has("ctx-claude-exists")) {
    recs.push({
      id: "rec-claude-md",
      category: "context",
      title: "Create CLAUDE.md",
      description:
        "Project guide for Claude Code. Simply referencing AGENTS.md is sufficient.",
      priority: "medium",
      effort: "small",
      template: "claude-md",
      targetPath: "CLAUDE.md",
    });
  }
  if (failedIds.has("ctx-agents-build")) {
    recs.push({
      id: "rec-agents-build",
      category: "context",
      title: "Add build commands to AGENTS.md",
      description: "Agents need exact commands for build, test, and lint.",
      priority: "high",
      effort: "small",
    });
  }
  if (failedIds.has("ctx-agents-arch")) {
    recs.push({
      id: "rec-agents-arch",
      category: "context",
      title: "Add architecture section to AGENTS.md",
      description: "Project structure, layers, module relationships.",
      priority: "medium",
      effort: "medium",
    });
  }
  if (failedIds.has("ctx-agents-pitfalls")) {
    recs.push({
      id: "rec-agents-pitfalls",
      category: "context",
      title: "Add common pitfalls to AGENTS.md",
      description: "Each line corresponds to a past agent failure.",
      priority: "medium",
      effort: "small",
    });
  }
  if (failedIds.has("ctx-agents-links-docs")) {
    recs.push({
      id: "rec-agents-links",
      category: "context",
      title: "Add links to docs/ in AGENTS.md",
      description:
        "Progressive disclosure: keep AGENTS.md concise, link to detailed docs.",
      priority: "medium",
      effort: "small",
    });
  }
  if (failedIds.has("ctx-docs-dir")) {
    recs.push({
      id: "rec-docs-dir",
      category: "context",
      title: "Create docs/ directory",
      description: "Structured documentation for progressive disclosure.",
      priority: "medium",
      effort: "small",
      template: "docs-dir",
      targetPath: "docs/",
    });
  }

  // ─── Bootstrap ───

  if (failedIds.has("boot-build-cmd")) {
    recs.push({
      id: "rec-build-cmd",
      category: "bootstrap",
      title: "Add build command",
      description:
        "Standardized build entry point (npm run build, make build, etc.).",
      priority: "high",
      effort: "small",
    });
  }
  if (failedIds.has("boot-test-cmd")) {
    recs.push({
      id: "rec-test-cmd",
      category: "bootstrap",
      title: "Add test command",
      description: "Standardized test entry point.",
      priority: "high",
      effort: "small",
    });
  }
  if (failedIds.has("boot-lint-cmd")) {
    recs.push({
      id: "rec-lint-cmd",
      category: "bootstrap",
      title: "Add lint command",
      description: "Standardized lint entry point.",
      priority: "high",
      effort: "small",
    });
  }
  if (failedIds.has("boot-lockfile")) {
    recs.push({
      id: "rec-lockfile",
      category: "bootstrap",
      title: "Commit lockfile",
      description:
        "Deterministic dependency resolution for reproducible builds.",
      priority: "medium",
      effort: "small",
    });
  }

  // ─── Constraints ───

  if (failedIds.has("cst-linter")) {
    recs.push({
      id: "rec-linter",
      category: "constraints",
      title: "Add linter configuration",
      description:
        "Mechanically enforces code style (ESLint, Biome, ruff, etc.).",
      priority: "high",
      effort: "small",
    });
  }
  if (failedIds.has("cst-formatter")) {
    recs.push({
      id: "rec-formatter",
      category: "constraints",
      title: "Add formatter configuration",
      description:
        "Consistent code formatting (Prettier, Biome, .editorconfig).",
      priority: "medium",
      effort: "small",
    });
  }
  if (failedIds.has("cst-precommit")) {
    recs.push({
      id: "rec-precommit",
      category: "constraints",
      title: "Set up pre-commit hooks",
      description: "Automatic validation before commits.",
      priority: "medium",
      effort: "small",
    });
  }

  // ─── Eval & CI ───

  if (failedIds.has("eval-ci-exists")) {
    recs.push({
      id: "rec-ci",
      category: "eval",
      title: "Add CI pipeline",
      description:
        "Automated build/test pipeline (GitHub Actions, GitLab CI, etc.).",
      priority: "high",
      effort: "medium",
    });
  }
  if (failedIds.has("eval-tests-exist")) {
    recs.push({
      id: "rec-tests",
      category: "eval",
      title: "Add test suite",
      description: "Regression tests to verify changes work.",
      priority: "high",
      effort: "medium",
    });
  }

  // ─── Safety ───

  if (failedIds.has("saf-gitignore")) {
    recs.push({
      id: "rec-gitignore",
      category: "safety",
      title: "Add .gitignore",
      description: "Prevent tracking secrets and build artifacts.",
      priority: "high",
      effort: "small",
      template: "gitignore",
      targetPath: ".gitignore",
    });
  }
  if (failedIds.has("saf-gitignore-env")) {
    recs.push({
      id: "rec-gitignore-env",
      category: "safety",
      title: "Add .env to .gitignore",
      description: "Secret files must not be committed.",
      priority: "high",
      effort: "small",
    });
  }

  // ─── Knowledge ───

  if (failedIds.has("know-readme")) {
    recs.push({
      id: "rec-readme",
      category: "knowledge",
      title: "Write README.md",
      description: "Project overview, installation, and usage.",
      priority: "medium",
      effort: "small",
    });
  }
  if (failedIds.has("know-adrs")) {
    recs.push({
      id: "rec-adrs",
      category: "knowledge",
      title: "Create Architecture Decision Records",
      description:
        "Document 'We chose X over Y because...' decisions in docs/decisions/.",
      priority: "medium",
      effort: "medium",
    });
  }

  // ─── Workflow ───

  if (failedIds.has("wf-specs-dir")) {
    recs.push({
      id: "rec-specs-dir",
      category: "workflow",
      title: "Create specs folder",
      description: "Record ideas and requirements systematically.",
      priority: "low",
      effort: "small",
      template: "specs-dir",
      targetPath: "specs/",
    });
  }
  if (failedIds.has("wf-tasks-dir")) {
    recs.push({
      id: "rec-tasks-dir",
      category: "workflow",
      title: "Create tasks folder",
      description: "Track implementation work units.",
      priority: "low",
      effort: "small",
      template: "tasks-dir",
      targetPath: "tasks/",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return recs;
}

/** Format recommendations as readable text */
export function formatRecommendations(recs: Recommendation[]): string {
  if (recs.length === 0) {
    return "All harness elements are in place. No recommendations.";
  }
  const lines: string[] = [];
  lines.push(`## Harness Recommendations (${recs.length})`);
  lines.push(``);
  const grouped = {
    high: [] as Recommendation[],
    medium: [] as Recommendation[],
    low: [] as Recommendation[],
  };
  for (const r of recs) grouped[r.priority].push(r);
  const labels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Nice to Have",
  };
  for (const [priority, items] of Object.entries(grouped)) {
    if (items.length === 0) continue;
    lines.push(`### ${labels[priority as keyof typeof labels]}`);
    lines.push(``);
    for (const r of items) {
      const autoTag = r.template ? " [auto-fix]" : "";
      lines.push(`- **${r.title}**${autoTag} (${r.effort})`);
      lines.push(`  ${r.description}`);
      if (r.targetPath) lines.push(`  -> ${r.targetPath}`);
    }
    lines.push(``);
  }
  return lines.join("\n");
}
