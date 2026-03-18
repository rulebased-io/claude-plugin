---
name: daily
description: Create a daily note and run a daily review routine — capture the day's thoughts, link recent activity, and surface notes for review. Use at the start or end of each day.
---

Create today's daily note and run the daily brain routine.

## When to Use

- Start of day: create daily note, review agenda
- End of day: summarize, process inbox
- Journaling or reflection
- `/second-brain:daily` invoked

## Procedure

### Step 1: Determine Time of Day

Ask or detect from arguments:
- **Morning** — Create daily note, surface review items
- **Evening** — Summarize the day, process inbox
- **Anytime** — Just create/open today's daily note

### Step 2: Create or Open Daily Note

Filename: `daily/YYYY-MM-DD.md`

If it doesn't exist, create from template:

```markdown
---
title: <YYYY-MM-DD Day-of-Week>
created: <ISO 8601>
updated: <ISO 8601>
tags: [daily]
status: active
---

# <YYYY-MM-DD Day-of-Week>

## Captures
<!-- Quick thoughts throughout the day -->


## Tasks
<!-- Things to do today -->
- [ ]


## Notes
<!-- Longer form thoughts -->


## Review
<!-- Notes resurfaced today -->


## Reflection
<!-- End of day reflection -->

```

If it exists, open and show current content.

### Step 3: Morning Routine

If morning mode:

1. **Show inbox count**: how many items in `inbox/`
2. **Surface review notes** (2-3 notes): pick from notes not reviewed in the longest time, add to daily note's Review section
3. **Show yesterday's unfinished tasks**: find unchecked `- [ ]` items, offer to carry forward
4. **Recent captures**: show items added to inbox in the last 24 hours

### Step 4: Evening Routine

If evening mode:

1. **Process inbox**: offer to invoke review skill
2. **Summarize captures**: list everything captured today
3. **Check task completion**: show completion rate, offer carry-forward for unfinished
4. **Prompt reflection**: optional reflection prompts
5. **Update daily note** with summary and reflection

### Step 5: Link Daily Note

- Add `[[wiki-links]]` to any notes referenced today
- Link to yesterday's and tomorrow's daily notes:
  ```
  ← [[YYYY-MM-(DD-1)]] | [[YYYY-MM-(DD+1)]] →
  ```

## Rules

- One daily note per day. Never create duplicates.
- Daily notes live in `daily/` folder only.
- If `daily/` doesn't exist, create it.
- If templates exist in `templates/daily.md`, use that instead of the default.
- Keep the routine fast — the daily note is a launchpad, not a blocker.
- Unfinished tasks should be offered for carry-forward, never silently dropped.

$ARGUMENTS
