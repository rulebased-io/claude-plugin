---
name: reference-check
description: Scan for broken wikilinks and path references, suggest and execute fixes
type: skill
created: 2026-03-19
---

Full scan of broken references across the brain — wikilinks and inline path references.

## When to Use

- After moving, renaming, or deleting files
- Periodic brain maintenance (deeper than organize's link check)
- `/rulebased-second-brain:reference-check` invoked

## Difference from organize

- **organize**: Brain-wide health diagnosis; broken links are one item among many (count only)
- **reference-check**: Dedicated deep scan — finds every broken reference, suggests fixes, executes repairs

## Procedure

### Step 1: Determine Scope

Read `$ARGUMENTS` to decide scope:

| Argument | Scope |
|----------|-------|
| *(empty)* or `all` | Both wikilinks and path references |
| `links` | `[[wikilink]]` only |
| `paths` | Inline path references only |

### Step 2: Collect All Markdown Files

Glob `**/*.md` from the brain root. Exclude:
- `archives/` directory (historical records, not actively maintained)
- Hidden directories (`.git/`, `.obsidian/`, etc.)

### Step 3: Scan for Broken References

#### 3a: Wikilinks (`[[...]]`)

For each `[[target]]` found in `.md` files:

1. **Resolve target**: Search for a file whose stem matches `target` (case-insensitive, ignore path)
2. **Classify result**:
   - **Valid**: Exactly one matching file exists → skip
   - **Broken**: No matching file found → check if a similarly-named file exists (fuzzy match for typos/renames)
   - **Moved**: No file at expected location, but same filename exists elsewhere → suggest path update
   - **Ambiguous**: Multiple files match the same stem → flag for user decision

#### 3b: Path References (backtick paths)

Scan for patterns like `` `path/to/file.md` ``, `` `folder/` ``, `` `./relative/path` `` inside backticks:

1. **Resolve path**: Relative to the brain root
2. **Check existence**: Verify the file or directory exists
3. **Skip**: URLs (`http://`, `https://`), code-only references (inside code blocks), shell commands

### Step 4: Present Results

```markdown
## Reference Check — {scope} ({date})

### Broken References

#### Wikilinks ({count})
| File | Line | Broken Reference | Suggestion |
|------|------|-----------------|------------|
| `file.md` | 42 | `[[old-name]]` | → `[[new-name]]` (moved to workspace/knowledge/) |

#### Path References ({count})
| File | Line | Broken Path | Suggestion |
|------|------|-------------|------------|
| `README.md` | 15 | `notes/permanent/` | → `workspace/knowledge/` |

### Summary
Total: {N} broken references. Wikilinks: {A}, Paths: {B}.
Auto-fixable: {M} items.

Proceed with fixes? (all / select / cancel)
```

### Step 5: Execute Fixes

Process only user-approved items:
- **Moved files**: Update wikilink/path to new location
- **Typos**: Fix to closest match
- **Deleted targets**: Ask user — remove reference, update to alternative, or leave as-is
- **Ambiguous**: Ask user to choose the correct target

Report results:

```
Reference check complete:
  Fixed: {N} references
  Skipped: {M} items
  Remaining broken: {R}
```

## Rules

- Never silently remove a reference. Always ask before deleting.
- Prefer fixing over removing — try to find the correct target first.
- When multiple candidates exist, present all options to the user.
- Do not scan inside fenced code blocks (```...```) for path references.
- `archives/` is excluded from scanning but can be a valid link target.
- Wikilink resolution is case-insensitive and path-independent (matches filename stem).

$ARGUMENTS
