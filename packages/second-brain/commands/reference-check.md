---
description: Scan for broken wikilinks and path references, suggest and execute fixes
argument-hint: "[all | links | paths]"
---

Full scan of broken references across the brain — wikilinks and inline path references.

## Scan Modes

- `all` (default): Both wikilinks and path references
- `links`: `[[wikilink]]` only — checks target existence, detects moved files, flags ambiguous targets
- `paths`: Backtick path references only — checks file/folder existence

Excludes `archives/` from scanning. Presents a table of broken references with suggestions, then executes user-approved fixes.

$ARGUMENTS
