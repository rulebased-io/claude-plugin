---
name: capture
description: Quickly capture an idea, note, or reference into the brain's inbox folder. Use when the user wants to jot down a thought, save a link, or record something before it's lost.
---

Rapidly save an idea, reference, or thought into `inbox/` before it's lost.

## When to Use

- User wants to quickly save an idea
- Capturing a URL, quote, or reference
- Recording a fleeting thought during other work
- `/rulebased-second-brain:capture` invoked

## Procedure

1. **Determine content**: Ask the user what to capture if not provided. Accept:
   - Free-form text
   - A URL or reference
   - A question to explore later
   - A code snippet or command

2. **Generate filename**: `inbox/YYYY-MM-DD-<slug>.md` (kebab-case from title or first meaningful words)

3. **Create the note** following `system/conventions.md` frontmatter rules:

```markdown
---
title: <extracted or provided title>
created: YYYY-MM-DD
tags: [<auto-suggested tags, max 3>]
status: seedling
source: <URL or context if available>
---

<captured content>
```

4. **Auto-tag**: Suggest up to 3 tags based on content. Common categories:
   - Domain: `dev`, `design`, `business`, `personal`, `reading`
   - Type: `idea`, `reference`, `question`, `quote`, `snippet`

5. **Confirm**: Show the created file path and a one-line summary.

## Rules

- Never ask more than one clarifying question. Capture fast, organize later.
- If `inbox/` doesn't exist, create it.
- If content is ambiguous, capture it anyway with a `#question` tag.
- Preserve the user's original wording. Don't rewrite or summarize unless asked.
- Multiple ideas in one message → create multiple notes.
- Follow `system/conventions.md` for frontmatter fields and naming.

## Output

```
Captured → inbox/2026-03-19-<slug>.md
Tags: #idea #dev
```

$ARGUMENTS
