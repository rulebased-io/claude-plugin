# @rulebased/harness

A harness-building tool for AI agents. Assess how well your project's harness engineering is set up, get recommendations for missing elements, and auto-generate them.

> **Harness Engineering** = A system design approach that constrains agent behavior (Constraints), provides context (Context), and evaluates results (Eval). See [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/).

[한국어](README.ko.md)

## Installation

### Claude Code

1. Add the marketplace, then install the plugin:

```bash
# Step 1: Add marketplace (inside Claude Code)
/plugin marketplace add rulebased-io/harness

# Step 2: Install the plugin
/plugin install rulebased@rulebased-harness
```

2. Or test locally during development:

```bash
claude --plugin-dir ./packages/plugin-claude
```

After installation, the following slash commands are available:

```
/rulebased:harness-audit      # Audit harness coverage (34 checks, 0-100 score)
/rulebased:harness-score      # Per-category detailed score report
/rulebased:harness-init       # Initialize harness structure
/rulebased:harness-recommend  # Recommend missing harness elements
/rulebased:harness-eval-log   # Evaluate conversation log compliance
```

The plugin also includes a **Stop hook** that automatically evaluates session compliance when a session with 10+ agent turns ends.

### skills.sh

```bash
# Install all skills
npx skills add rulebased-io/harness

# Install a specific skill only
npx skills add rulebased-io/harness --skill harness-audit
```

### CLI (npm)

```bash
npx @rulebased/cli audit
npx @rulebased/cli score
npx @rulebased/cli init
npx @rulebased/cli recommend
npx @rulebased/cli eval-log
```

## Skills

### harness-audit

Audits how well your project's harness is set up. Checks 34 items based on [OpenAI Codex harness standards](https://openai.com/index/unlocking-the-codex-harness/) and assigns a score from 0 to 100.

**Checklist categories:**

| Category | Items Checked |
|----------|---------------|
| Context Engineering | AGENTS.md (conciseness, build cmds, architecture, pitfalls, security, progressive disclosure), ARCHITECTURE.md, subdirectory AGENTS.md, docs/, CLAUDE.md |
| Bootstrap & Task Entry | One-command setup, build/test/lint commands, lockfile |
| Constraints & Enforcement | Linter, formatter, pre-commit hooks, TypeScript strict, architectural boundary tests |
| Eval & CI | CI pipeline, CI lint step, test suite, eval dataset |
| Entropy Management | Tech debt tracker, in-repo documentation |
| Safety & Secrets | .gitignore, .env blocking, security docs, no secrets committed |
| Knowledge Management | Architecture Decision Records, README |
| Workflow | specs/, tasks/ directories |

### harness-score

Per-category detailed score report. Shows how well each harness area is implemented.

```
## Harness Score Report

[################----]  **81/100 (B)**

### Context Engineering  [####################]  100/100  (9/9)
- [PASS] AGENTS.md exists
- [PASS] AGENTS.md includes build/test commands
...

### Constraints  [--------------------]  0/100  (0/2)
- [FAIL] Linter configuration exists
  -> Add ESLint, Biome, ruff, or equivalent linter config.
```

### harness-init

Initializes the harness structure for your project.

Creates: `AGENTS.md`, `CLAUDE.md`, `.harness.json`, `specs/`, `tasks/`, `.gitignore`

**Presets:**
- `standard` (default) — all 34 checks enabled
- `minimal` — essential checks only (AGENTS.md + build commands)

Customize via `.harness.json`:
```json
{
  "preset": "standard",
  "checks": { "disable": ["eval-dataset", "cst-precommit"] }
}
```

### harness-recommend

Recommends missing harness elements by priority and can auto-generate them.

### harness-eval-log

Evaluates a Claude Code conversation transcript against harness compliance.

**Evaluation criteria:**
- Human turn count (fewer = more autonomous)
- Autonomy ratio (agent turns / total turns)
- Build/test execution (Bash tool usage)
- Tool diversity (number of unique tools used)
- Session duration

**Auto-trigger:** Runs automatically via Stop hook when a session with 10+ agent turns ends.

## Project Structure

```
@rulebased/harness (pnpm monorepo)
├── skills/                      # Skills (skills.sh + Claude Code)
│   ├── audit/SKILL.md
│   ├── score/SKILL.md
│   ├── init/SKILL.md
│   ├── recommend/SKILL.md
│   └── eval-log/SKILL.md
├── packages/
│   ├── core/                    # @rulebased/core - Auditor, recommender, initializer, transcript parser
│   ├── cli/                     # @rulebased/cli - CLI entry point
│   └── plugin-claude/           # @rulebased/plugin-claude - Claude Code plugin (hooks, agents)
├── specs/                       # Spec workflow (todo/done/backlog)
├── tasks/                       # Task workflow (todo/done)
└── docs/                        # Documentation
```

## Development

```bash
pnpm install
pnpm build
pnpm test          # 26 tests
```

## Scoring System

| Severity | Weight | Examples |
|----------|--------|----------|
| Critical | 3 | AGENTS.md exists, build/test/lint commands, CI pipeline, .gitignore |
| Important | 2 | Architecture description, linter, formatter, pre-commit, lockfile, ADRs |
| Nice-to-have | 1 | Workflow directories, eval dataset, security docs, tech debt tracker |

Grades: A (90+), B (75+), C (60+), D (40+), F

## Roadmap

- [x] npm publish — `@rulebased/core` and `@rulebased/cli`
- [ ] Onboarding wizard — interactive setup by project type (frontend, backend, fullstack)
- [ ] Built-in templates — per-project-type AGENTS.md, hooks, and audit presets
- [ ] Harness import — bring harness setup from another project, diff and apply
- [ ] Multi-agent plugins — Codex, Cursor support

## License

MIT
