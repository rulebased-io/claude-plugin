/**
 * Harness Initializer - 프로젝트에 하네스 구조를 초기화
 *
 * 대상 프로젝트에 AGENTS.md, specs/, tasks/ 등을 생성합니다.
 * 이미 존재하는 파일은 건너뜁니다 (--force 시 덮어쓰기).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { InitOptions, InitResult, PresetName } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "../../templates");

/** 프로젝트에 하네스 구조 초기화 */
export function initHarness(projectPath: string, options: InitOptions = {}): InitResult {
  const created: string[] = [];
  const skipped: string[] = [];

  const projectName = options.projectName || guessProjectName(projectPath);
  const preset: PresetName = options.preset ?? "standard";

  // 0. .harness.json
  writeTemplate(
    projectPath,
    ".harness.json",
    JSON.stringify({ preset }, null, 2) + "\n",
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
    `# CLAUDE.md\n\n@AGENTS.md 를 참조하세요.\n`,
    options.force,
    created,
    skipped,
  );

  // 3. Workflow 폴더
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

  // 4. .gitignore에 추가 (있으면 스킵)
  const gitignorePath = join(projectPath, ".gitignore");
  if (!existsSync(gitignorePath)) {
    writeTemplate(projectPath, ".gitignore", defaultGitignore(), options.force, created, skipped);
  }

  return {
    created,
    skipped,
    message: `하네스 초기화 완료: ${created.length}개 생성, ${skipped.length}개 스킵`,
  };
}

// ─── Template Generators ───

function generateAgentsMd(projectName: string): string {
  return `# AGENTS.md - ${projectName}

이 파일은 AI 에이전트가 이 프로젝트에서 작업할 때 따라야 하는 규칙을 정의합니다.

## 프로젝트 개요

${projectName} - TODO: 프로젝트 설명을 작성하세요.

## 빌드 & 테스트

\`\`\`bash
# TODO: 프로젝트에 맞는 빌드/테스트 명령어를 작성하세요
npm install
npm run build
npm test
\`\`\`

**코드 변경 후 반드시 빌드와 테스트를 확인하세요.**

## 프로젝트 구조

\`\`\`
TODO: 디렉토리 구조와 각 모듈의 역할을 설명하세요.
\`\`\`

## 코딩 규칙

- TODO: 이 프로젝트의 코딩 컨벤션을 작성하세요
- TODO: 사용하는 언어/프레임워크별 규칙

## 흔한 실수 방지

1. TODO: 과거 에이전트가 저지른 실수를 기록하세요
2. 이 목록은 실패가 발생할 때마다 업데이트합니다

## 파일 수정 시 체크리스트

- [ ] 빌드 성공
- [ ] 테스트 통과
- [ ] lint 통과
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
    skipped.push(relativePath + "/");
    return;
  }
  mkdirSync(fullPath, { recursive: true });
  writeFileSync(join(fullPath, ".gitkeep"), "", "utf-8");
  created.push(relativePath + "/");
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
