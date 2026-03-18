---
description: Analyze brain structure — tags, duplicates, broken links, and health
argument-hint: ""
---

Analyze the brain's health and suggest structural improvements.

## When to Use

- Brain feels disorganized or hard to navigate
- After a period of heavy capture without organization
- Checking for duplicates or inconsistencies
- Building or updating Maps of Content
- `/second-brain:organize` invoked

## Procedure

### Step 1: Brain Health Scan

Run a diagnostic across the entire brain:

```
Brain Health Report
==================
Total notes: <count>
  inbox/: <count> (target: 0)
  notes/: <count>
  daily/: <count>
  maps/:  <count>
  archive/: <count>

Tag usage:
  Top 10 tags: #tag1 (15), #tag2 (12), ...
  Singleton tags (used once): #rare1, #rare2, ...
  Untagged notes: <count>

Link health:
  Total wiki-links: <count>
  Broken links (target missing): <count>
  Orphan notes (no links): <count>

Issues found: <count>
```

### Step 2: Issue Detection

Check for these issues (in priority order):

1. **Broken links**: `[[target]]` where target file doesn't exist → suggest create, fix typo, or remove
2. **Duplicate notes**: Similar titles or overlapping content → suggest merge
3. **Tag inconsistencies**: Similar tags (#js, #javascript) → suggest unify
4. **Inbox overflow**: inbox 10+ items → suggest review
5. **Large notes**: 500+ lines → suggest refactor/split
6. **Missing frontmatter**: No YAML frontmatter → suggest add
7. **Stale notes**: 6+ months unupdated with status=active → suggest review or archive

### Step 3: Present Action Plan

Group issues by severity: Critical / Recommended / Optional

### Step 4: Execute Fixes

Process user-approved fixes only:
- **Broken links**: Fix or remove, update referencing notes
- **Duplicates**: Show diff, let user choose, merge content
- **Tag unification**: Bulk rename with `replace_all`
- **Frontmatter**: Add missing fields with sensible defaults
- **MOC generation**: Create `maps/<topic>.md` linking related notes

### Step 5: Post-Organize Summary

```
Organization complete:
  Fixed: 3 broken links, 5 tag inconsistencies
  Skipped: 2 items
  Brain health: 85% → 94%
```

## Rules

- Never delete notes without explicit user approval. Archive instead.
- Tag renames must be applied to ALL notes containing that tag.
- When fixing broken links, prefer fixing over removing.
- Show diffs before merging duplicates.
- Create backup-friendly changes (no destructive operations).

$ARGUMENTS
