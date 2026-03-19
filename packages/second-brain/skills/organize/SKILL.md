---
name: organize
description: Analyze and improve the brain's structure — tag consistency, folder organization, duplicate detection, and MOC generation. Use when the brain feels messy or disorganized.
---

Analyze the brain's health and suggest structural improvements.

## When to Use

- Brain feels disorganized or hard to navigate
- After a period of heavy capture without organization
- Checking for duplicates or inconsistencies
- Building or updating Maps of Content
- `/rulebased-second-brain:organize` invoked

## Procedure

### Step 1: Read Brain Structure

Read `AGENTS.md` Structure table to understand folder purposes and `system/conventions.md` for frontmatter rules.

### Step 2: Brain Health Scan

Run a diagnostic across the entire brain. Count files per folder (as defined in AGENTS.md), then report:

```
Brain Health Report
==================
Total notes: <count>
  <folder>: <count> (per AGENTS.md Structure)
  ...

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

### Step 3: Issue Detection

Check for these issues (in priority order):

1. **Broken links**: `[[target]]` where target file doesn't exist → suggest create, fix typo, or remove
2. **Duplicate notes**: Similar titles or overlapping content → suggest merge
3. **Tag inconsistencies**: Similar tags (#js, #javascript) → suggest unify
4. **Inbox overflow**: inbox 10+ items → suggest review
5. **Large notes**: 500+ lines → suggest refactor/split
6. **Missing frontmatter**: No YAML frontmatter → suggest add (per `system/conventions.md`)
7. **Stale notes**: 6+ months unupdated with `status: seedling` → suggest review or archive

### Step 4: Check Growth Triggers

Read `system/growth-triggers.md` and evaluate each trigger against the current brain state. Report any triggered recommendations (subfolder creation, MOC, glossary, area separation, archive suggestions).

### Step 5: Present Action Plan

Group all issues and growth trigger recommendations by severity: Critical / Recommended / Optional

### Step 6: Execute Fixes

Process user-approved fixes only:
- **Broken links**: Fix or remove, update referencing notes
- **Duplicates**: Show diff, let user choose, merge content
- **Tag unification**: Bulk rename with `replace_all`
- **Frontmatter**: Add missing fields with sensible defaults
- **MOC generation**: Create MOC note linking related notes in the appropriate folder
- **Growth trigger actions**: Create subfolders, suggest archiving, etc.

### Step 7: Post-Organize Summary

```
Organization complete:
  Fixed: 3 broken links, 5 tag inconsistencies
  Skipped: 2 items
  Growth recommendations applied: 1
```

## Rules

- Never delete notes without explicit user approval. Archive instead.
- Tag renames must be applied to ALL notes containing that tag.
- When fixing broken links, prefer fixing over removing.
- Show diffs before merging duplicates.
- Create backup-friendly changes (no destructive operations).
- Use folder paths from AGENTS.md, not hardcoded paths.

$ARGUMENTS
