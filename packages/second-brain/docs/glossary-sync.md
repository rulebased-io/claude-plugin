---
name: glossary-sync
description: Detect new domain-specific terms in notes and add them to the glossary
type: skill
created: 2026-03-19
---

Scan notes for new terms and sync them into the glossary.

## When to Use

- After writing several new notes with domain-specific vocabulary
- Periodic glossary maintenance
- `/rulebased-second-brain:glossary-sync` invoked

## Procedure

### Step 1: Locate Glossary

1. Check `system/glossary.md` (scaffold default)
2. If not found, glob for `**/glossary.md`
3. If no glossary exists, propose creating `system/glossary.md` with the scaffold format

### Step 2: Load Existing Terms

Parse the glossary file:
- Extract all `### Term` headings as registered terms
- Build a set of known terms (case-insensitive) for deduplication

### Step 3: Determine Scan Scope

Read `$ARGUMENTS`:

| Argument | Scope |
|----------|-------|
| *(empty)* or `recent` | Files changed in the last 7 days (`git diff --name-only` or file mtime) |
| `full` | All `.md` files in the brain |

Exclude from scanning:
- `system/` directory (configuration, not content)
- `archives/` directory
- Hidden directories
- The glossary file itself

### Step 4: Detect New Terms

Scan target files for term candidates:

**Include** — terms worth adding:
- Domain-specific concepts (e.g., "Zettelkasten", "Spaced Repetition", "Transit Schema")
- Project-specific abbreviations or acronyms with special meaning
- Words used with a specific meaning different from common usage
- Technical terms that appear 2+ times across different notes

**Exclude** — terms to skip:
- Generic development terms (API, JSON, Git, HTTP, CSS, HTML, npm, etc.)
- Common natural language words (even if frequently used)
- Terms that appear only once and are unlikely to recur
- Terms already registered in the glossary

### Step 5: Present Candidates

```markdown
## Glossary Sync — {scope} ({date})

### New Term Candidates ({N})

| Term | Draft Definition | Source |
|------|-----------------|--------|
| `Term Name` | One-line definition | `file.md:42` |

### Already Registered (skipped)
- term1, term2, ...

Add terms? (all / select numbers / cancel)
```

### Step 6: User Confirmation and Insertion

For each approved term:

1. Let user edit the draft definition if needed
2. Insert into glossary under the correct alphabetical section (`## A`, `## B`, etc.)
3. Use the format: `### Term Name` + one-line definition
4. If the alphabetical section doesn't exist, create it in order
5. Maintain alphabetical order within each section

Report results:

```
Glossary sync complete:
  Added: {N} terms
  Skipped: {M} terms
  Total glossary size: {T} terms
```

## Rules

- Never add terms without user approval. Always present candidates first.
- Draft definitions are suggestions — the user has final say on wording.
- Alphabetical ordering uses the term's first letter (case-insensitive).
- One term = one `### heading` + one-line definition. Keep it concise.
- If a term could be an alias of an existing term, flag it instead of adding a duplicate.
- Preserve existing glossary formatting and content — only append, never rewrite.

$ARGUMENTS
