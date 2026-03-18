---
name: review
description: Resurface and review old notes using spaced repetition or random selection. Use when the user wants to revisit their knowledge, process inbox items, or maintain note quality.
---

Bring old notes back to attention for review, update, or archival.

## When to Use

- Regular review habit (weekly/daily)
- Processing inbox backlog
- Rediscovering forgotten knowledge
- `/second-brain:review` invoked

## Procedure

### Step 1: Select Review Mode

Ask user (or detect from arguments):

- **Inbox processing** — Review unprocessed inbox items
- **Random resurface** — Surface random notes from `notes/`
- **Oldest unreviewed** — Notes with oldest or missing `reviewed` date
- **Tag-based** — Review all notes with a specific tag

### Step 2: Gather Review Candidates

**Inbox processing**: list all files in `inbox/`, sorted by creation date (oldest first), batch of 5

**Random resurface**: glob `notes/**/*.md` and `maps/**/*.md`, randomly select 5, prefer notes not reviewed in 30+ days

**Oldest unreviewed**: scan frontmatter `reviewed` field, sort ascending (missing = highest priority), pick top 5

### Step 3: Present Each Note

```
## Review: <title>
Created: <date> | Last reviewed: <date or "never">
Tags: <tags>
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
| archive | Move to `archive/`, set `status: archive` |
| skip | Move to next note, no changes |

For **inbox processing**, additional actions:

| Action | What happens |
|--------|-------------|
| promote | Move from `inbox/` to `notes/`, set `status: active` |
| merge | Merge content into an existing note |

### Step 5: Summary

```
Review complete:
- Reviewed: 5 notes
- Kept: 2 | Updated: 1 | Archived: 1 | Skipped: 1
- Next review suggestion: 3 days
```

## Rules

- Always update the `reviewed` field with current ISO 8601 timestamp.
- When moving files (archive, promote), update all `[[wiki-links]]` that reference them.
- Never delete notes during review. Archive instead.
- Present notes one at a time, wait for user action before proceeding.
- Keep the review flow fast — minimize unnecessary output.

$ARGUMENTS
