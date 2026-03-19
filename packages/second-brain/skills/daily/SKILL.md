---
name: daily
description: Create a daily note and run a daily review routine — capture the day's thoughts, link recent activity, and surface notes for review. Use at the start or end of each day.
---

Create today's daily note and run the daily brain routine.

## When to Use

- Start of day: create daily note, review agenda
- End of day: summarize, process inbox
- Journaling or reflection
- `/rulebased-second-brain:daily` invoked

## Procedure

### Step 1: Determine Time of Day

Ask or detect from arguments:
- **Morning** — Create daily note, surface review items
- **Evening** — Summarize the day, process inbox
- **Anytime** — Just create/open today's daily note

### Step 2: Create or Open Daily Note

Read AGENTS.md to find the journal folder. Create the file as `<journal-folder>/YYYY-MM-DD.md`.

If it doesn't exist, use `templates/journal.md` if available. Otherwise create with frontmatter per `system/conventions.md`:

```markdown
---
created: YYYY-MM-DD
tags: [journal]
type: journal
mood:
energy:
---

# YYYY-MM-DD

## Done today

## Learned

## Tomorrow

## Reflection
```

If it exists, open and show current content.

### Step 3: Morning Routine

If morning mode:

1. **Show inbox count**: how many items in `inbox/`
2. **Surface review notes** (2-3 notes): pick from notes not reviewed in the longest time, add to daily note
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
- If the journal folder doesn't exist, create it.
- Keep the routine fast — the daily note is a launchpad, not a blocker.
- Unfinished tasks should be offered for carry-forward, never silently dropped.
- Use folder paths from AGENTS.md, not hardcoded paths.

$ARGUMENTS
