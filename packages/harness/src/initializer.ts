/**
 * Harness Initializer - Initializes the harness structure in a project
 *
 * Creates AGENTS.md, specs/, tasks/, etc. in the target project.
 * Existing files are skipped (use --force to overwrite).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { InitOptions, InitResult, PresetName } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const _TEMPLATES_DIR = join(__dirname, "../../templates");

/** Initialize the harness structure in a project */
export function initHarness(
  projectPath: string,
  options: InitOptions = {},
): InitResult {
  const created: string[] = [];
  const skipped: string[] = [];

  const projectName = options.projectName || guessProjectName(projectPath);
  const preset: PresetName = options.preset ?? "standard";

  // 0. .harness.json
  writeTemplate(
    projectPath,
    ".harness.json",
    `${JSON.stringify({ preset }, null, 2)}\n`,
    options.force,
    created,
    skipped,
  );

  // 1. AGENTS.md
  writeTemplate(
    projectPath,
    "AGENTS.md",
    generateAgentsMd(projectName),
    options.force,
    created,
    skipped,
  );

  // 2. CLAUDE.md
  writeTemplate(
    projectPath,
    "CLAUDE.md",
    `# CLAUDE.md\n\nSee @AGENTS.md for details.\n`,
    options.force,
    created,
    skipped,
  );

  // 3. Workflow folders
  if (!options.skipWorkflow) {
    for (const dir of [
      "specs/todo",
      "specs/done",
      "specs/backlog",
      "tasks/todo",
      "tasks/done",
    ]) {
      createDir(projectPath, dir, created, skipped);
    }
  }

  // 4. Add .gitignore (skip if it already exists)
  const gitignorePath = join(projectPath, ".gitignore");
  if (!existsSync(gitignorePath)) {
    writeTemplate(
      projectPath,
      ".gitignore",
      defaultGitignore(),
      options.force,
      created,
      skipped,
    );
  }

  return {
    created,
    skipped,
    message: `Harness initialization complete: ${created.length} created, ${skipped.length} skipped`,
  };
}

// ─── Template Generators ───

function generateAgentsMd(projectName: string): string {
  return `# AGENTS.md - ${projectName}

This file defines the rules that AI agents must follow when working on this project.

## Project Overview

${projectName} - TODO: Write a project description.

## Build & Test

\`\`\`bash
# TODO: Write the build/test commands for your project
npm install
npm run build
npm test
\`\`\`

**Always verify that builds and tests pass after making code changes.**

## Project Structure

\`\`\`
TODO: Describe the directory structure and the role of each module.
\`\`\`

## Coding Rules

- TODO: Document the coding conventions for this project
- TODO: Add rules specific to your language/framework

## Common Pitfalls

1. TODO: Record mistakes that agents have made in the past
2. This list should be updated whenever a failure occurs

## Checklist for File Changes

- [ ] Build succeeds
- [ ] Tests pass
- [ ] Lint passes
`;
}

function defaultGitignore(): string {
  return `node_modules/
dist/
.env
.env.local
*.log
coverage/
.DS_Store
`;
}

// ─── Helpers ───

function writeTemplate(
  projectPath: string,
  relativePath: string,
  content: string,
  force: boolean | undefined,
  created: string[],
  skipped: string[],
): void {
  const fullPath = join(projectPath, relativePath);
  if (existsSync(fullPath) && !force) {
    skipped.push(relativePath);
    return;
  }
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(fullPath, content, "utf-8");
  created.push(relativePath);
}

function createDir(
  projectPath: string,
  relativePath: string,
  created: string[],
  skipped: string[],
): void {
  const fullPath = join(projectPath, relativePath);
  if (existsSync(fullPath)) {
    skipped.push(`${relativePath}/`);
    return;
  }
  mkdirSync(fullPath, { recursive: true });
  writeFileSync(join(fullPath, ".gitkeep"), "", "utf-8");
  created.push(`${relativePath}/`);
}

function guessProjectName(projectPath: string): string {
  const pkgPath = join(projectPath, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      if (pkg.name) return pkg.name;
    } catch {
      // ignore
    }
  }
  return projectPath.split("/").filter(Boolean).pop() || "my-project";
}
