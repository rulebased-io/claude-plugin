# @rulebased/second-brain

A personal knowledge management tool for Claude Code. Initialize a structured second brain, capture ideas, connect knowledge, review and organize your thinking.

> Based on PKM methodologies: [PARA](https://fortelabs.com/blog/para/), [CODE](https://www.buildingasecondbrain.com/) (Capture→Organize→Distill→Express), [Zettelkasten](https://zettelkasten.de/), and [Digital Garden](https://maggieappleton.com/evergreens) (seedling→budding→evergreen).

## Installation

### Claude Code Plugin

```bash
/plugin marketplace add rulebased-io/claude-plugin
/plugin install rulebased-second-brain@rulebased
```

### skills.sh

```bash
npx skills add rulebased-io/claude-plugin
```

## Skills

```
/rulebased-second-brain:init            # Initialize second brain structure
/rulebased-second-brain:capture         # Quick capture to inbox
/rulebased-second-brain:organize        # Analyze and fix brain health
/rulebased-second-brain:connect         # Find and link related knowledge
/rulebased-second-brain:review          # Spaced repetition review
/rulebased-second-brain:search          # Search across the brain
/rulebased-second-brain:refactor        # Split, merge, or move notes
/rulebased-second-brain:synthesize      # Generate insights from connections
/rulebased-second-brain:daily           # Daily journal entry
/rulebased-second-brain:reference-check # Scan and fix broken references
/rulebased-second-brain:glossary-sync   # Detect and add new terms to glossary
```

## Brain Structure (PARA-based)

`/rulebased-second-brain:init` scaffolds this structure:

```
<brain-root>/
├── CLAUDE.md             # References AGENTS.md
├── AGENTS.md             # Structure index + rules
├── system/               # Conventions, workflow, growth triggers
├── inbox/                # Quick capture (CODE: Capture)
├── projects/             # Active efforts with deadlines
├── areas/                # Ongoing responsibilities (health, career)
├── resources/            # Reference materials, learning notes, snippets
├── archives/             # Inactive storage
├── journal/              # Daily reflection
└── templates/            # Note templates (note, project, journal)
```

## Key Concepts

### Maturity Model (Digital Garden)

Notes progress through maturity stages tracked via `status` frontmatter:

| Status | Meaning |
|--------|---------|
| `seedling` | Early draft, rough and incomplete |
| `budding` | Refined, has connections to other notes |
| `evergreen` | Mature, densely linked, reliable knowledge |

### Frontmatter

Every note requires:

```yaml
---
title: "Note title"
created: 2026-03-19
tags: [topic1, topic2]
---
```

Optional: `updated`, `status`, `type`, `source`, `related`.

### Growth Triggers

The brain starts minimal. `system/growth-triggers.md` defines when to add structure:

- **Subfolders**: When a tag appears on 10+ files, or a folder has 30+ files
- **MOC**: When 3+ notes form a wikilink cluster or 5+ notes share a tag
- **Glossary**: When 10+ domain-specific terms appear without a glossary
- **Archive**: When projects stall 30+ days or seedlings stagnate 90+ days

The `organize` skill checks these triggers on every run.

### Workflow (CODE)

1. **Capture** → `inbox/`. Fast, unstructured.
2. **Organize** → Move to `projects/`, `areas/`, or `resources/` within 7 days.
3. **Distill** → Highlight key ideas. Promote `status` from seedling → budding → evergreen.
4. **Express** → Use knowledge to create output.

## License

MIT
