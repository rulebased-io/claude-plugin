---
description: Capture an idea, note, or reference into inbox
argument-hint: "[content]"
---

Rapidly save an idea, reference, or thought into `inbox/` before it's lost.

## When to Use

- User wants to quickly save an idea
- Capturing a URL, quote, or reference
- Recording a fleeting thought during other work
- `/second-brain:capture` invoked

## Procedure

1. **Determine content**: Ask the user what to capture if not provided. Accept:
   - Free-form text
   - A URL or reference
   - A question to explore later
   - A code snippet or command

2. **Generate filename**: Use kebab-case from the title or first meaningful words.
   - Format: `inbox/YYYY-MM-DD-<slug>.md`
   - Example: `inbox/2026-03-19-distributed-caching-idea.md`

3. **Create the note**:

```markdown
---
title: <extracted or provided title>
created: <ISO 8601 with timezone>
updated: <same as created>
tags: [<auto-suggested tags, max 3>]
status: inbox
source: <URL or context if available>
---

<captured content>
```

4. **Auto-tag**: Suggest up to 3 tags based on content. Common tag categories:
   - Domain: `dev`, `design`, `business`, `personal`, `reading`
   - Type: `idea`, `reference`, `question`, `quote`, `snippet`
   - Urgency: `urgent`, `explore-later`, `someday`

5. **Confirm**: Show the created file path and a one-line summary.

## Rules

- Never ask more than one clarifying question. Capture fast, organize later.
- If `inbox/` doesn't exist, create it.
- If content is ambiguous, capture it anyway with a `#question` tag.
- Preserve the user's original wording. Don't rewrite or summarize unless asked.
- Multiple ideas in one message → create multiple notes.

## Output

```
Captured → inbox/2026-03-19-<slug>.md
Tags: #idea #dev
```

$ARGUMENTS
