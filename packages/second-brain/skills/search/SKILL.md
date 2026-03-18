---
name: search
description: Search the brain for notes by keyword, tag, date, or semantic meaning. Use when the user is looking for specific knowledge, trying to find a note they wrote, or exploring what exists on a topic.
---

Search across all notes using multiple strategies.

## When to Use

- User is looking for a specific note
- Exploring what exists on a topic
- Finding notes by tag, date range, or status
- `/second-brain:search` invoked

## Procedure

### Step 1: Parse the Query

| Input pattern | Search type | Example |
|--------------|-------------|---------|
| Plain text | Full-text | `caching strategies` |
| `#tag` | Tag search | `#architecture` |
| `@YYYY-MM-DD` | Date search | `@2026-03` |
| `in:folder` | Folder search | `in:inbox` |
| `status:X` | Status search | `status:active` |
| `orphan` | Orphan search | `orphan notes` |
| Combined | Multi-filter | `#dev in:notes @2026` |

### Step 2: Execute Search

**Full-text**: grep all `.md` files, also search frontmatter `title`, rank by match density

**Tag search**: grep frontmatter `tags:` arrays + inline `#tag` in body

**Date search**: parse frontmatter `created`/`updated`, match date/month/year

**Folder search**: glob within specified directory

**Multi-filter**: apply each filter as AND conditions

### Step 3: Present Results

```
Search: "caching strategies"
Found: 5 notes

1. notes/redis-patterns.md ★★★
   Tags: #caching #redis #dev
   "...LRU eviction as the default caching strategy..."
   Updated: 2026-03-15

2. notes/cdn-architecture.md ★★☆
   Tags: #architecture #performance
   "...edge caching reduces latency by..."
   Updated: 2026-02-28

3. inbox/cache-invalidation-problem.md ★☆☆
   Tags: #idea #caching
   "Cache invalidation is one of the hardest..."
   Updated: 2026-03-10

[1-5 to open | refine search | done]
```

### Step 4: Act on Selection

- **Read**: show full note content
- **Edit**: open for editing
- **Connect**: run connect skill on this note
- **Continue searching**: refine or new query

## Rules

- Always search across ALL directories (inbox, notes, daily, maps, archive).
- Show context snippets (surrounding line of match), not just filenames.
- Limit initial results to 10. Offer "show more" if there are more.
- For empty results, suggest broader terms, related tags, or capture.
- Search is case-insensitive by default.
- Archive notes should be included but marked as `[archived]`.

$ARGUMENTS
