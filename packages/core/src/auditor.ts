/**
 * Harness Auditor - 프로젝트의 하네스 구축 정도를 점검
 *
 * OpenAI Harness Engineering의 3가지 기둥을 기준으로 감사:
 * 1. Context Engineering (AGENTS.md, 문서)
 * 2. Architectural Constraints (제약, lint)
 * 3. Eval System (평가 데이터셋)
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AuditCheck, AuditCategory, AuditReport, HarnessConfig } from "./types.js";
import { getPreset, mergeConfig, isCheckDisabled, getSeverity } from "./presets.js";

/** .harness.json 로드 (없으면 standard 프리셋) */
export function loadConfig(projectPath: string): HarnessConfig {
  const configPath = join(projectPath, ".harness.json");
  const base = getPreset("standard");

  if (!existsSync(configPath)) return base;

  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    const preset = raw.preset ? getPreset(raw.preset) : base;
    return mergeConfig(preset, raw);
  } catch {
    return base;
  }
}

/** 프로젝트 경로에 대해 하네스 감사 실행 */
export function audit(projectPath: string, config?: HarnessConfig): AuditReport {
  const cfg = config ?? loadConfig(projectPath);

  const allChecks: AuditCheck[] = [
    ...auditContext(projectPath),
    ...auditWorkflow(projectPath),
    ...auditConstraints(projectPath),
    ...auditEval(projectPath),
    ...auditConventions(projectPath),
    ...auditBuild(projectPath),
    ...auditDocs(projectPath),
  ];

  // 프리셋/설정에 따라 체크 필터링 + 심각도 오버라이드
  const checks = allChecks
    .filter((c) => !isCheckDisabled(c.id, cfg))
    .map((c) => ({
      ...c,
      severity: getSeverity(c.id, c.severity, cfg),
    }));

  return buildReport(projectPath, checks);
}

// ─── Context Engineering ───

function auditContext(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // AGENTS.md 존재
  const agentsPath = join(p, "AGENTS.md");
  const agentsExists = existsSync(agentsPath);
  checks.push({
    id: "ctx-agents-exists",
    category: "context",
    name: "AGENTS.md 존재",
    description: "프로젝트 루트에 AGENTS.md가 있어야 합니다",
    pass: agentsExists,
    severity: "critical",
    fix: "AGENTS.md 파일을 생성하세요. /rulebased:harness-init 으로 자동 생성 가능합니다.",
  });

  if (agentsExists) {
    const content = readFileSync(agentsPath, "utf-8");

    // 빌드 명령어 섹션
    checks.push({
      id: "ctx-agents-build",
      category: "context",
      name: "AGENTS.md에 빌드 명령어 포함",
      description: "에이전트가 빌드/테스트 방법을 알아야 합니다",
      pass: /npm run|yarn|pnpm|make|cargo|go build/i.test(content),
      severity: "critical",
      fix: "AGENTS.md에 '## 빌드 & 테스트' 섹션을 추가하세요.",
    });

    // 아키텍처 정보
    checks.push({
      id: "ctx-agents-arch",
      category: "context",
      name: "AGENTS.md에 아키텍처 설명 포함",
      description: "프로젝트 구조와 계층 설명이 필요합니다",
      pass: /구조|아키텍처|architecture|계층|layer|디렉토리/i.test(content),
      severity: "important",
      fix: "AGENTS.md에 프로젝트 구조/아키텍처 섹션을 추가하세요.",
    });

    // 흔한 실수
    checks.push({
      id: "ctx-agents-pitfalls",
      category: "context",
      name: "AGENTS.md에 흔한 실수 방지 목록",
      description: "과거 에이전트 실패에서 도출된 규칙이 있어야 합니다",
      pass: /실수|주의|금지|하지.마|pitfall|gotcha|avoid|don'?t/i.test(content),
      severity: "important",
      fix: "AGENTS.md에 '## 흔한 실수 방지' 섹션을 추가하세요.",
    });
  }

  // CLAUDE.md 존재
  checks.push({
    id: "ctx-claude-exists",
    category: "context",
    name: "CLAUDE.md 존재",
    description: "Claude Code가 자동으로 읽는 프로젝트 가이드",
    pass: existsSync(join(p, "CLAUDE.md")),
    severity: "important",
    fix: "CLAUDE.md 파일을 생성하세요. AGENTS.md를 참조하는 것만으로도 충분합니다.",
  });

  return checks;
}

// ─── Workflow ───

function auditWorkflow(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  const hasSpecs = existsSync(join(p, "specs")) || existsSync(join(p, "spec"));
  checks.push({
    id: "wf-specs-dir",
    category: "workflow",
    name: "specs 폴더 존재",
    description: "아이디어/요구사항을 기록하는 specs 폴더",
    pass: hasSpecs,
    severity: "nice-to-have",
    fix: "specs/todo, specs/done, specs/backlog 폴더를 생성하세요.",
  });

  const hasTasks = existsSync(join(p, "tasks")) || existsSync(join(p, "task"));
  checks.push({
    id: "wf-tasks-dir",
    category: "workflow",
    name: "tasks 폴더 존재",
    description: "구현 단위 작업을 추적하는 tasks 폴더",
    pass: hasTasks,
    severity: "nice-to-have",
    fix: "tasks/todo, tasks/done 폴더를 생성하세요.",
  });

  return checks;
}

// ─── Constraints ───

function auditConstraints(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // lint/format 설정 존재
  const lintFiles = [
    ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yml",
    "eslint.config.js", "eslint.config.mjs",
    ".prettierrc", ".prettierrc.json",
    "biome.json", "biome.jsonc",
    ".rubocop.yml", ".pylintrc", "pyproject.toml",
    ".golangci.yml", "rustfmt.toml",
  ];
  const hasLint = lintFiles.some((f) => existsSync(join(p, f)));
  checks.push({
    id: "cst-lint",
    category: "constraints",
    name: "린터/포맷터 설정 존재",
    description: "코드 스타일을 기계적으로 강제하는 설정",
    pass: hasLint,
    severity: "important",
    fix: "ESLint, Prettier, Biome 등의 설정 파일을 추가하세요.",
  });

  // pre-commit hook
  const hasHusky = existsSync(join(p, ".husky"));
  const hasLefthook = existsSync(join(p, "lefthook.yml"));
  const hasPreCommit = existsSync(join(p, ".pre-commit-config.yaml"));
  checks.push({
    id: "cst-precommit",
    category: "constraints",
    name: "Pre-commit 훅 설정",
    description: "커밋 전 자동 검증으로 제약을 강제합니다",
    pass: hasHusky || hasLefthook || hasPreCommit,
    severity: "nice-to-have",
    fix: "Husky, Lefthook, 또는 pre-commit을 설정하세요.",
  });

  return checks;
}

// ─── Eval ───

function auditEval(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  const evalDirs = ["evals", "eval", "__evals__"];
  const hasEval = evalDirs.some((d) => existsSync(join(p, d)));
  checks.push({
    id: "eval-dir",
    category: "eval",
    name: "Eval 데이터셋 존재",
    description: "에이전트 행동을 평가하는 데이터셋",
    pass: hasEval,
    severity: "nice-to-have",
    fix: "evals/datasets/ 폴더에 평가 프롬프트 CSV를 추가하세요.",
  });

  return checks;
}

// ─── Conventions ───

function auditConventions(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // .editorconfig
  checks.push({
    id: "conv-editorconfig",
    category: "conventions",
    name: ".editorconfig 존재",
    description: "에디터 간 일관된 코딩 스타일",
    pass: existsSync(join(p, ".editorconfig")),
    severity: "nice-to-have",
    fix: ".editorconfig 파일을 추가하세요.",
  });

  // TypeScript strict (tsconfig.json 존재 시)
  const tsconfigPath = join(p, "tsconfig.json");
  if (existsSync(tsconfigPath)) {
    try {
      const tsconfig = readFileSync(tsconfigPath, "utf-8");
      checks.push({
        id: "conv-ts-strict",
        category: "conventions",
        name: "TypeScript strict 모드",
        description: "strict: true로 타입 안전성 강화",
        pass: /"strict"\s*:\s*true/.test(tsconfig),
        severity: "important",
        fix: "tsconfig.json에 \"strict\": true를 추가하세요.",
      });
    } catch {
      // tsconfig 파싱 실패 시 스킵
    }
  }

  return checks;
}

// ─── Build ───

function auditBuild(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // package.json scripts
  const pkgPath = join(p, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const scripts = pkg.scripts || {};

      checks.push({
        id: "build-test-script",
        category: "build",
        name: "테스트 스크립트 정의",
        description: "npm test로 테스트를 실행할 수 있어야 합니다",
        pass: "test" in scripts,
        severity: "critical",
        fix: "package.json scripts에 \"test\" 명령어를 추가하세요.",
      });

      checks.push({
        id: "build-build-script",
        category: "build",
        name: "빌드 스크립트 정의",
        description: "npm run build로 빌드할 수 있어야 합니다",
        pass: "build" in scripts,
        severity: "important",
        fix: "package.json scripts에 \"build\" 명령어를 추가하세요.",
      });
    } catch {
      // package.json 파싱 실패
    }
  }

  // CI 설정
  const ciPaths = [
    ".github/workflows",
    ".gitlab-ci.yml",
    ".circleci",
    "Jenkinsfile",
    ".travis.yml",
  ];
  const hasCI = ciPaths.some((cp) => existsSync(join(p, cp)));
  checks.push({
    id: "build-ci",
    category: "build",
    name: "CI/CD 설정 존재",
    description: "자동 빌드/테스트 파이프라인",
    pass: hasCI,
    severity: "nice-to-have",
    fix: ".github/workflows/ 에 CI 워크플로우를 추가하세요.",
  });

  return checks;
}

// ─── Docs ───

function auditDocs(p: string): AuditCheck[] {
  const checks: AuditCheck[] = [];

  checks.push({
    id: "docs-readme",
    category: "docs",
    name: "README.md 존재",
    description: "프로젝트 기본 문서",
    pass: existsSync(join(p, "README.md")) || existsSync(join(p, "readme.md")),
    severity: "important",
    fix: "README.md를 작성하세요.",
  });

  // .gitignore
  checks.push({
    id: "docs-gitignore",
    category: "docs",
    name: ".gitignore 존재",
    description: "불필요한 파일 추적 방지",
    pass: existsSync(join(p, ".gitignore")),
    severity: "important",
    fix: ".gitignore 파일을 추가하세요.",
  });

  return checks;
}

// ─── Report Builder ───

function buildReport(projectPath: string, checks: AuditCheck[]): AuditReport {
  const passed = checks.filter((c) => c.pass).length;
  const failed = checks.filter((c) => !c.pass).length;

  // 가중치 점수: critical=3, important=2, nice-to-have=1
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
    score >= 90 ? "A" :
    score >= 75 ? "B" :
    score >= 60 ? "C" :
    score >= 40 ? "D" : "F";

  // 카테고리별 집계
  const categories: AuditCategory[] = ["context", "workflow", "constraints", "eval", "conventions", "build", "docs"];
  const byCategory: Record<string, { passed: number; total: number }> = {};
  for (const cat of categories) {
    const catChecks = checks.filter((c) => c.category === cat);
    byCategory[cat] = {
      passed: catChecks.filter((c) => c.pass).length,
      total: catChecks.length,
    };
  }

  const criticalChecks = checks.filter((c) => c.severity === "critical");

  return {
    projectPath,
    timestamp: new Date().toISOString(),
    score,
    grade,
    checks,
    summary: {
      total: checks.length,
      passed,
      failed,
      byCritical: {
        passed: criticalChecks.filter((c) => c.pass).length,
        total: criticalChecks.length,
      },
      byCategory: byCategory as Record<AuditCategory, { passed: number; total: number }>,
    },
  };
}

/** 감사 리포트를 읽기 좋은 텍스트로 포맷 */
export function formatReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push(`## Harness Audit Report`);
  lines.push(``);
  lines.push(`**Score: ${report.score}/100 (${report.grade})**`);
  lines.push(`**Passed: ${report.summary.passed}/${report.summary.total}** | Critical: ${report.summary.byCritical.passed}/${report.summary.byCritical.total}`);
  lines.push(``);

  // 카테고리별 요약
  lines.push(`### Category Breakdown`);
  lines.push(``);
  const catNames: Record<AuditCategory, string> = {
    context: "Context Engineering",
    workflow: "Workflow",
    constraints: "Constraints",
    eval: "Eval System",
    conventions: "Conventions",
    build: "Build & Test",
    docs: "Documentation",
  };
  for (const [cat, label] of Object.entries(catNames)) {
    const s = report.summary.byCategory[cat as AuditCategory];
    if (!s) continue;
    const icon = s.passed === s.total ? "PASS" : "FAIL";
    lines.push(`- [${icon}] ${label}: ${s.passed}/${s.total}`);
  }

  // 실패 항목
  const failed = report.checks.filter((c) => !c.pass);
  if (failed.length > 0) {
    lines.push(``);
    lines.push(`### Failed Checks`);
    lines.push(``);
    for (const c of failed) {
      const sevIcon = c.severity === "critical" ? "CRITICAL" : c.severity === "important" ? "IMPORTANT" : "OPTIONAL";
      lines.push(`- [${sevIcon}] **${c.name}**: ${c.description}`);
      if (c.fix) {
        lines.push(`  - Fix: ${c.fix}`);
      }
    }
  }

  return lines.join("\n");
}

/** 카테고리별 상세 점수 리포트 */
export function formatScore(report: AuditReport): string {
  const lines: string[] = [];

  lines.push(`## Harness Score Report`);
  lines.push(``);
  lines.push(`${renderBar(report.score)}  **${report.score}/100 (${report.grade})**`);
  lines.push(``);

  const catNames: Record<AuditCategory, string> = {
    context: "Context Engineering",
    workflow: "Workflow",
    constraints: "Constraints",
    eval: "Eval System",
    conventions: "Conventions",
    build: "Build & Test",
    docs: "Documentation",
  };

  // 카테고리별 점수 + 항목 상세
  for (const [cat, label] of Object.entries(catNames)) {
    const catChecks = report.checks.filter((c) => c.category === cat);
    if (catChecks.length === 0) continue;

    const passed = catChecks.filter((c) => c.pass).length;
    const catScore = Math.round((passed / catChecks.length) * 100);
    const catBar = renderBar(catScore);

    lines.push(`### ${label}  ${catBar}  ${catScore}/100  (${passed}/${catChecks.length})`);
    lines.push(``);

    for (const c of catChecks) {
      const icon = c.pass ? "PASS" : "FAIL";
      lines.push(`- [${icon}] ${c.name}`);
      if (!c.pass && c.fix) {
        lines.push(`  -> ${c.fix}`);
      }
    }
    lines.push(``);
  }

  return lines.join("\n");
}

function renderBar(score: number): string {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  return "[" + "#".repeat(filled) + "-".repeat(empty) + "]";
}
