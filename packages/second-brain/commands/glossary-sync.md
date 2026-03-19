---
description: Detect new terms in notes and add them to the glossary
argument-hint: "[recent | full]"
---

Scan notes for new domain-specific terms and sync them into `system/glossary.md`.

## Scan Modes

- `recent` (default): Files changed in the last 7 days
- `full`: All `.md` files in the brain

Detects domain-specific concepts, project abbreviations, and special-meaning terms. Excludes generic dev terms and common words. Presents candidates for user approval before inserting into the glossary in alphabetical order.

$ARGUMENTS
