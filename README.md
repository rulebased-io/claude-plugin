# Claude Code Plugins by rulebased.io

Claude Code plugins for harness engineering and personal knowledge management.

[한국어](README.ko.md)

---

## Plugins

### @rulebased/harness

A harness-building tool for AI agents. Assess how well your project's harness engineering is set up, get recommendations for missing elements, and auto-generate them.

> **Harness Engineering** = A system design approach that constrains agent behavior (Constraints), provides context (Context), and evaluates results (Eval). See [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/).

### @rulebased/second-brain

A personal knowledge management tool. Initialize a structured second brain, capture ideas, connect knowledge, review and organize your thinking — all from Claude Code.

> Based on PKM methodologies: PARA, CODE (Capture→Organize→Distill→Express), Zettelkasten, MOC, and Spaced Repetition.

---

## Installation

### Claude Code

1. Add the marketplace, then install the plugin:

```bash
# Step 1: Add marketplace (inside Claude Code)
/plugin marketplace add rulebased-io/claude-plugin

# Step 2: Install a plugin
/plugin install rulebased-harness@rulebased
/plugin install rulebased-second-brain@rulebased
```

2. Or test locally during development:

```bash
claude --plugin-dir ./packages/harness
claude --plugin-dir ./packages/second-brain
```

### skills.sh

```bash
# Install all skills
npx skills add rulebased-io/claude-plugin

# Install a specific skill only
npx skills add rulebased-io/claude-plugin --skill harness-audit
```

### CLI (npm) — harness only

```bash
npx @rulebased/harness audit
npx @rulebased/harness score
npx @rulebased/harness init
npx @rulebased/harness recommend
npx @rulebased/harness eval-log
```

---

## Harness Skills

After installation, the following slash commands are available:

```
/rulebased-harness:audit      # Audit harness coverage (36 checks, 0-100 score)
/rulebased-harness:score      # Per-category detailed score report
/rulebased-harness:init       # Initialize harness structure
/rulebased-harness:recommend  # Recommend missing harness elements
/rulebased-harness:eval-log   # Evaluate conversation log compliance
```

The plugin also includes a **Stop hook** that automatically evaluates session compliance when a session with 10+ agent turns ends.

### harness-audit

Audits how well your project's harness is set up. Checks 36 items based on [OpenAI Codex harness standards](https://openai.com/index/unlocking-the-codex-harness/) and assigns a score from 0 to 100.

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

### harness-init

Initializes the harness structure for your project.

Creates: `AGENTS.md`, `CLAUDE.md`, `.harness.json`, `specs/`, `tasks/`, `.gitignore`

**Presets:**
- `standard` (default) — all 36 checks enabled
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

---

## Second Brain Skills

```
/rulebased-second-brain:init        # Initialize second brain structure
/rulebased-second-brain:capture     # Quick capture to inbox
/rulebased-second-brain:connect     # Find and link related knowledge
/rulebased-second-brain:review      # Spaced repetition review
/rulebased-second-brain:organize    # Classify and move content
/rulebased-second-brain:synthesize  # Generate insights from connections
/rulebased-second-brain:search      # Search across the brain
/rulebased-second-brain:daily       # Daily journal entry
/rulebased-second-brain:refactor        # Restructure and clean up
/rulebased-second-brain:reference-check # Scan and fix broken references
/rulebased-second-brain:glossary-sync   # Detect and add new terms to glossary
```

### second-brain-init

Scaffolds a complete second brain structure with:

```
<brain-root>/
├── BRAIN.md              # External agent access policy
├── AGENTS.md             # Agent roles and workflows
├── system/               # Rules, schema, glossary, templates
├── inbox/                # Quick capture (CODE: Capture)
├── workspace/            # Active work
│   ├── knowledge/        # Memos, readings, refined knowledge
│   ├── code/             # Snippets, TIL
│   ├── projects/         # Active projects
│   └── resources/        # Reference materials
├── ideas/                # Idea staging (seed→growing→ripe)
├── journal/              # Daily reflection
├── areas/                # Ongoing life areas (PARA)
├── archives/             # Inactive storage
└── brains/               # Permission sets for external agents
```

### Other second-brain skills

- **capture** — Quick capture to inbox with minimal friction
- **connect** — Find related items and create wiki-links
- **review** — Spaced repetition review of knowledge
- **organize** — Classify inbox items, move to proper locations
- **synthesize** — Generate insights from connected knowledge
- **search** — Full-text and tag-based search
- **daily** — Create or continue today's journal entry
- **refactor** — Restructure, merge, or split content
- **reference-check** — Scan for broken wikilinks and path references, suggest fixes
- **glossary-sync** — Detect new domain-specific terms and sync to glossary

---

## Scoring System (Harness)

| Severity | Weight | Examples |
|----------|--------|----------|
| Critical | 3 | AGENTS.md exists, build/test/lint commands, CI pipeline, .gitignore |
| Important | 2 | Architecture description, linter, formatter, pre-commit, lockfile, ADRs |
| Nice-to-have | 1 | Workflow directories, eval dataset, security docs, tech debt tracker |

Grades: A (90+), B (75+), C (60+), D (40+), F

## Project Structure

```
rulebased-plugin (pnpm monorepo)
├── packages/
│   ├── harness/                 # @rulebased/harness - audit, init, recommend, eval
│   │   ├── skills/              # Skills (skills.sh + Claude Code)
│   │   ├── commands/            # Claude Code commands
│   │   ├── agents/              # Autonomous agents
│   │   ├── hooks/               # Plugin hooks
│   │   ├── reference/           # Evaluation criteria
│   │   ├── src/                 # Auditor, recommender, initializer, CLI
│   │   └── tests/               # Tests + fixtures
│   └── second-brain/            # @rulebased/second-brain - PKM tools
│       ├── skills/              # 11 skills (init, capture, connect, ...)
│       ├── commands/            # Claude Code commands
│       ├── scaffold/            # Init templates and structure
│       └── docs/                # Shared documentation
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

## Roadmap

- [x] npm publish — `@rulebased/harness`
- [ ] Onboarding wizard — interactive setup by project type (frontend, backend, fullstack)
- [ ] Built-in templates — per-project-type AGENTS.md, hooks, and audit presets
- [ ] Harness import — bring harness setup from another project, diff and apply
- [ ] Multi-agent plugins — Codex, Cursor support
- [ ] npm publish — `@rulebased/second-brain`

## License

MIT
