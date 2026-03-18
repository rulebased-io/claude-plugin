---
name: synthesize
description: Combine multiple related notes into a new synthesis note that extracts insights and creates new understanding. Use when the user wants to summarize a topic, prepare a write-up, or consolidate scattered knowledge.
---

Combine multiple notes into a synthesis that extracts patterns and insights.

## When to Use

- User wants to understand what they know about a topic
- Preparing a write-up or document from scattered notes
- Creating a comprehensive overview from fragments
- Building a new MOC with synthesized content
- `/second-brain:synthesize` invoked

## Procedure

### Step 1: Define the Topic

Get the synthesis topic from the user. It can be:
- A keyword or phrase: "distributed systems"
- A tag: "#architecture"
- A question: "What are my thoughts on team management?"
- A set of specific notes to combine

### Step 2: Gather Source Notes

1. **Search** the brain for related notes (tag match, title match, content match, link neighborhood)
2. **Present candidates** for user confirmation:
   ```
   Found 8 notes related to "distributed systems":
   1. notes/cap-theorem.md (tags: #distributed #theory)
   2. notes/redis-patterns.md (tags: #caching #distributed)
   3. inbox/eventual-consistency-thought.md
   ...
   Include all? Or select specific notes? [all / select]
   ```

### Step 3: Analyze and Extract

For each source note:
1. Read the full content
2. Extract key points, insights, and arguments
3. Note contradictions or tensions between sources
4. Identify gaps — topics mentioned but not explored

### Step 4: Create Synthesis Note

Generate in `notes/` (or `maps/` if overview):

```markdown
---
title: "Synthesis: <topic>"
created: <ISO 8601>
updated: <ISO 8601>
tags: [synthesis, <topic-tags>]
status: active
sources:
  - <source-paths>
---

# <Topic>

## Overview
<2-3 sentence summary>

## Key Insights
### <Theme 1>
- From [[source-note-1]]: <key point>
- From [[source-note-2]]: <contrasting point>

## Tensions and Open Questions
<Contradictions found between notes>

## Gaps
<Topics mentioned but not explored>

## Sources
<Wiki-link list of all source notes>
```

### Step 5: Update Source Notes

For each source note:
- Add a wiki-link back to the synthesis: `[[synthesis-topic]]`
- Add to `links` frontmatter if not already there

### Step 6: Confirm

```
Synthesis created → notes/synthesis-distributed-systems.md
Sources: 8 notes referenced
Themes: 3 identified
Open questions: 2 flagged
```

## Rules

- Always cite source notes with `[[wiki-links]]`.
- Never hallucinate content. Only synthesize from existing notes.
- Preserve the user's original insights — add structure, not new opinions.
- Flag contradictions explicitly rather than silently resolving them.
- If fewer than 2 source notes found, suggest capturing more first.
- Keep synthesis concise. Quality over length.

$ARGUMENTS
