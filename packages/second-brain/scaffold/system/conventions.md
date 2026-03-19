---
title: Conventions
description: Frontmatter, naming, tags, links, and maturity model
type: reference
created: {{DATE}}
---

# Conventions

## Frontmatter

Required on every note:

```yaml
---
title: "Note title"
created: YYYY-MM-DD
tags: [topic1, topic2]
---
```

Optional fields:

```yaml
updated: YYYY-MM-DD
status: seedling            # seedling | budding | evergreen
type: note                  # note | project | journal | reference
source: "https://..."       # Source URL or book title
related: ["[[other-note]]"] # Related note links
```

Use frontmatter actively for classification. Tags and metadata take priority over folder structure.

## File Naming

- General notes: `YYYY-MM-DD-slug.md` (slug: lowercase, hyphenated)
- Journal: `YYYY-MM-DD.md`

## Tags

- Lowercase, hyphenated (`distributed-systems`, not `Distributed Systems`)
- 2-5 per note
- Use tags to distinguish content types: `#reading`, `#snippet`, `#til`, `#idea`

## Links

- Use `[[wikilinks]]` to connect related notes
- Aim for bidirectional links — if A links to B, mention A in B as well

## Maturity Model

| Status | Meaning | Next Step |
|--------|---------|-----------|
| `seedling` | Early draft. Rough and incomplete | Refine and connect to reach budding |
| `budding` | Cleaned up. Has connections to other notes | Dense linking and polish to reach evergreen |
| `evergreen` | Mature and reliable knowledge | Periodic review to keep current |
