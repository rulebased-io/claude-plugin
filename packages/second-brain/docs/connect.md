---
name: connect
description: Discover and suggest connections (wiki-links) between notes
type: skill
created: 2026-03-19
---

Find hidden connections between notes and suggest wiki-links.

## When to Use

- User wants to find related notes
- After a batch of captures, to weave them into the graph
- Finding orphan notes (no incoming or outgoing links)
- Building or updating a Map of Content (MOC)
- `/second-brain:connect` invoked

## Procedure

### Mode 1: Connect a Specific Note

1. **Read the target note** fully.
2. **Scan the brain** for related notes:
   - Grep for shared keywords, phrases, and concepts
   - Check tags overlap
   - Look at existing `[[wiki-links]]` for neighborhood
3. **Rank candidates** by relevance:
   - Shared tags (weight: 2)
   - Shared keywords in title (weight: 3)
   - Shared keywords in body (weight: 1)
   - Same folder proximity (weight: 1)
4. **Present top 5 connections** with reasoning:
   ```
   Suggested connections for "distributed-caching-idea":
   1. [[redis-patterns]] — shared: #dev #caching, both discuss TTL strategies
   2. [[system-design-notes]] — shared: #architecture, mentions caching layer
   3. [[project-x-perf]] — discusses cache invalidation problems
   ```
5. **On approval**, add `[[wiki-links]]` to both notes (bidirectional).

### Mode 2: Orphan Scan

1. **Build link index**: Scan all `.md` files for `[[...]]` patterns.
2. **Find orphans**: Notes with zero incoming AND zero outgoing links.
3. **Report**:
   ```
   Orphan notes (no connections):
   - inbox/2026-03-10-random-thought.md
   - notes/old-api-design.md

   Suggested actions:
   - Connect "random-thought" → [[brainstorming-ideas]]
   - Archive "old-api-design" (outdated, last updated 6 months ago)
   ```
4. **Act on user choices** — connect, archive, or skip each.

### Mode 3: Cluster Discovery

1. **Scan all notes** for tag and keyword clusters.
2. **Identify topic groups** that could become MOCs.
3. **Suggest new MOC creation** in `maps/`:
   ```
   Potential Map of Content:
   - "Distributed Systems" — 7 related notes found
   - "Reading Notes" — 12 notes with #reading tag
   ```

## Rules

- Always make links bidirectional: if A links to B, B should link to A.
- Add links to the `links` frontmatter array AND as inline `[[wiki-links]]`.
- Never delete existing links. Only add new ones.
- Show reasoning for each suggested connection.
- Limit suggestions to top 5 per note to avoid noise.

## Output Format

For each connection suggestion:
```
[relevance: high|medium] [[target-note]] — reason
```

$ARGUMENTS
