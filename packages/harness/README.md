# @rulebased/harness

A harness-building tool for AI agents. Assess how well your project's harness engineering is set up, get recommendations for missing elements, and auto-generate them.

> **Harness Engineering** = A system design approach that constrains agent behavior (Constraints), provides context (Context), and evaluates results (Eval). Based on practices from [OpenAI](https://openai.com/index/harness-engineering/), [Anthropic](https://www.anthropic.com/engineering/claude-code-best-practices), [GitHub](https://github.blog/changelog/2025-06-06-best-practices-for-using-copilot-coding-agent/), [Stripe](https://stripe.com/blog/minions-stripes-coding-agents), [Martin Fowler](https://martinfowler.com/articles/harness-engineering.html), and more.

## Installation

### Claude Code Plugin

```bash
/plugin marketplace add rulebased-io/claude-plugin
/plugin install rulebased-harness@rulebased
```

### CLI (npm)

```bash
npx @rulebased/harness audit
npx @rulebased/harness score
npx @rulebased/harness init
npx @rulebased/harness recommend
npx @rulebased/harness eval-log
```

### skills.sh

```bash
npx skills add rulebased-io/claude-plugin --skill harness-audit
```

## Skills

After installation, the following slash commands are available:

```
/rulebased-harness:audit      # Audit harness coverage (36 checks, 0-100 score)
/rulebased-harness:score      # Per-category detailed score report
/rulebased-harness:init       # Initialize harness structure
/rulebased-harness:recommend  # Recommend missing harness elements
/rulebased-harness:eval-log   # Evaluate conversation log compliance
```

### audit

Checks 36 items derived from industry best practices (OpenAI, Anthropic, GitHub, Stripe, Google, Martin Fowler, Vercel, and others) and assigns a score from 0 to 100.

| Category | Items Checked |
|----------|---------------|
| Context Engineering | AGENTS.md, ARCHITECTURE.md, subdirectory AGENTS.md, docs/, CLAUDE.md |
| Bootstrap & Task Entry | One-command setup, build/test/lint commands, lockfile |
| Constraints & Enforcement | Linter, formatter, pre-commit hooks, TypeScript strict |
| Eval & CI | CI pipeline, CI lint step, test suite, eval dataset |
| Entropy Management | Tech debt tracker, in-repo documentation |
| Safety & Secrets | .gitignore, .env blocking, security docs |
| Knowledge Management | ADRs, README |
| Workflow | specs/, tasks/ directories |

### score

Per-category detailed score report with pass/fail per check.

### init

Initializes the harness structure: `AGENTS.md`, `CLAUDE.md`, `.harness.json`, `specs/`, `tasks/`, `.gitignore`.

Presets: `standard` (all 36 checks) or `minimal` (AGENTS.md + build commands).

### recommend

Recommends missing harness elements by priority and can auto-generate them.

### eval-log

Evaluates a Claude Code conversation transcript against harness compliance. Auto-triggers via Stop hook when a session with 10+ agent turns ends.

## Scoring

| Severity | Weight | Examples |
|----------|--------|----------|
| Critical | 3 | AGENTS.md, build/test/lint commands, CI pipeline, .gitignore |
| Important | 2 | Architecture, linter, formatter, pre-commit, lockfile, ADRs |
| Nice-to-have | 1 | Workflow directories, eval dataset, security docs |

Grades: A (90+), B (75+), C (60+), D (40+), F

## License

MIT
