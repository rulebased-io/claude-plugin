---
name: refactor
description: Split large notes, merge small notes, and move notes between folders
type: skill
created: 2026-03-19
---

Reshape notes to maintain atomic note principles.

## When to Use

- A note has grown too large (500+ lines)
- Multiple small notes cover the same topic
- Moving notes between folders (inbox → notes, notes → archive)
- Reorganizing after a connect or organize session
- `/rulebased-second-brain:refactor` invoked

## Procedure

### Mode 1: Split a Large Note

1. **Read the target note** fully.
2. **Identify natural split points**: separate topics, distinct h2/h3 sections, different content types
3. **Propose split plan**:
   ```
   Split "system-design-notes.md" (450 lines) into:
   1. notes/load-balancing.md — lines 1-120
   2. notes/database-sharding.md — lines 121-280
   3. notes/caching-layers.md — lines 281-400
   4. notes/system-design-overview.md — lines 401-450 (MOC)
   Proceed? [yes / adjust / cancel]
   ```
4. **Execute split**:
   - Create each new note with proper frontmatter
   - Inherit tags from the original
   - `created` = original's `created`, `updated` = now
   - Add cross-links between all split notes
   - Create a summary/MOC note if 3+ pieces
5. **Update references**: find all `[[wiki-links]]` to original → update to most relevant split note
6. **Handle original**: move to `archive/` with redirect note

### Mode 2: Merge Small Notes

1. **Identify merge candidates** (or accept user selection):
   - Overlapping tags AND similar titles
   - Notes < 20 lines that reference each other
   - Multiple inbox items on the same topic
2. **Propose merge plan** and get approval
3. **Execute merge**:
   - Choose the most complete note as target
   - Append content under clear section headers
   - Combine tags (deduplicate)
   - Update `updated` timestamp
4. **Update references**: redirect all links from merged-away notes to target
5. **Archive merged-away notes** with redirect marker

### Mode 3: Move / Promote

| Action | From | To | Status change |
|--------|------|----|--------------|
| promote | inbox/ | notes/ | inbox → active |
| archive | notes/ | archive/ | active → archive |
| to-moc | notes/ | maps/ | unchanged |
| restore | archive/ | notes/ | archive → active |

Update all references and frontmatter after move.

## Rules

- Never lose content during refactoring. Every line from original must appear in result.
- Always update `[[wiki-links]]` across the entire brain after any move/split/merge.
- Archive originals instead of deleting them.
- Show a clear before/after plan and get user approval before executing.
- Preserve original `created` dates. Only update `updated`.
- If a split creates a note < 10 lines, warn that it might be too small.

$ARGUMENTS
