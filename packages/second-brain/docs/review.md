---
name: review
description: Resurface and review old notes using spaced repetition or random selection. Use when the user wants to revisit their knowledge, process inbox items, or maintain note quality.
type: skill
created: 2026-03-19
---

Bring old notes back to attention for review, update, or archival.

## When to Use

- Regular review habit (weekly/daily)
- Processing inbox backlog
- Rediscovering forgotten knowledge
- `/rulebased-second-brain:review` invoked

## Procedure

### Step 1: Select Review Mode

Ask user (or detect from arguments):

- **Inbox processing** — Review unprocessed inbox items
- **Random resurface** — Surface random notes from the brain
- **Oldest unreviewed** — Notes with oldest or missing `reviewed` date
- **Tag-based** — Review all notes with a specific tag

### Step 2: Gather Review Candidates

Read `AGENTS.md` Structure table to know which folders to scan.

**Inbox processing**: list all files in `inbox/`, sorted by creation date (oldest first), batch of 5

**Random resurface**: glob `**/*.md` across content folders (exclude `system/`, `templates/`), randomly select 5, prefer notes not reviewed in 30+ days

**Oldest unreviewed**: scan frontmatter `reviewed` field, sort ascending (missing = highest priority), pick top 5

### Step 3: Present Each Note

```
## Review: <title>
Created: <date> | Last reviewed: <date or "never">
Tags: <tags> | Status: <status>
Location: <file path>

<first 10 lines of content or full if short>

---
Actions: [keep] [update] [connect] [archive] [skip]
```

### Step 4: Process User Action

| Action | What happens |
|--------|-------------|
| keep | Update `reviewed` timestamp, no other changes |
| update | User edits content, update `reviewed` and `updated` |
| connect | Invoke connect skill for this note |
| archive | Move to `archives/` |
| skip | Move to next note, no changes |

For **inbox processing**, additional actions:

| Action | What happens |
|--------|-------------|
| promote | Move from `inbox/` to appropriate folder (read AGENTS.md to determine destination), set `status: seedling` |
| merge | Merge content into an existing note |

### Step 5: Maturity Check

After reviewing a note, evaluate whether its `status` should be promoted per `system/conventions.md` maturity model:
- `seedling` with connections and refined content → suggest promoting to `budding`
- `budding` with dense links and polished content → suggest promoting to `evergreen`

### Step 6: Summary

```
Review complete:
- Reviewed: 5 notes
- Kept: 2 | Updated: 1 | Archived: 1 | Skipped: 1
- Maturity promotions: 1 (seedling → budding)
- Next review suggestion: 3 days
```

## Rules

- Always update the `reviewed` field with current date (YYYY-MM-DD).
- When moving files (archive, promote), update all `[[wiki-links]]` that reference them.
- Never delete notes during review. Archive instead.
- Present notes one at a time, wait for user action before proceeding.
- Keep the review flow fast — minimize unnecessary output.
- Use folder paths from AGENTS.md, not hardcoded paths.

$ARGUMENTS
