---
name: connect
description: Discover and suggest connections (wiki-links) between notes. Use when the user wants to find relationships, reduce orphan notes, or build a knowledge graph from existing notes.
type: skill
created: 2026-03-19
---

Find hidden connections between notes and suggest wiki-links.

## When to Use

- User wants to find related notes
- After a batch of captures, to weave them into the graph
- Finding orphan notes (no incoming or outgoing links)
- Building or updating a Map of Content (MOC)
- `/rulebased-second-brain:connect` invoked

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
5. **On approval**, add `[[wiki-links]]` to both notes (bidirectional) and update `related` frontmatter field.

### Mode 2: Orphan Scan

1. **Build link index**: Scan all `.md` files for `[[...]]` patterns.
2. **Find orphans**: Notes with zero incoming AND zero outgoing links.
3. **Report** orphans with suggested actions (connect, archive, or skip).
4. **Act on user choices**.

### Mode 3: Cluster Discovery

1. **Scan all notes** for tag and keyword clusters.
2. **Identify topic groups** that could become MOCs (check `system/growth-triggers.md` for MOC creation criteria).
3. **Suggest new MOC creation** in the appropriate folder.

## Rules

- Always make links bidirectional: if A links to B, B should link to A.
- Add links to the `related` frontmatter array AND as inline `[[wiki-links]]`.
- Never delete existing links. Only add new ones.
- Show reasoning for each suggested connection.
- Limit suggestions to top 5 per note to avoid noise.

## Output Format

For each connection suggestion:
```
[relevance: high|medium] [[target-note]] — reason
```

$ARGUMENTS
