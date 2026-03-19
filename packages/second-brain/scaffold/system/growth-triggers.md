---
title: Growth Triggers
description: Quantitative criteria for recommending new structure as the brain grows
type: reference
created: {{DATE}}
---

# Growth Triggers

Criteria for when the brain needs new structure.
The organize skill checks these triggers on every run and proactively recommends actions to the user.

---

## Subfolder Creation

| Target | Condition | Recommended Action |
|--------|-----------|-------------------|
| `resources/` | 10+ files share the same tag | Suggest creating a subfolder named after the tag (e.g., `resources/python/`) |
| `journal/` | 90+ days of entries accumulated | Suggest monthly subfolders (e.g., `journal/2026-03/`) |
| Any folder | 30+ files in a single folder | Analyze tag frequency, suggest splitting into top 2-3 topic subfolders |

## MOC (Map of Content) Creation

| Condition | Recommended Action |
|-----------|-------------------|
| 3+ notes form a cluster via `[[wikilinks]]` | Suggest creating a MOC note as the hub for the cluster |
| 5+ notes share the same tag | Suggest creating a MOC for that topic |
| User repeatedly searches the same topic | Suggest creating a MOC to consolidate search results |

## Glossary Creation

| Condition | Recommended Action |
|-----------|-------------------|
| No `resources/glossary.md` exists and 10+ domain-specific terms appear across the brain | Suggest running glossary-sync or creating `resources/glossary.md` |

## Area Separation

| Condition | Recommended Action |
|-----------|-------------------|
| A topic in `resources/` is updated 3+ times in the last 30 days and has no deadline | Suggest moving to `areas/` ("This topic looks like an ongoing area") |

## Archive Suggestions

| Condition | Recommended Action |
|-----------|-------------------|
| A project in `projects/` has no changes for 30+ days | Ask if it's complete → suggest moving to `archives/` |
| A note with `status: seedling` has no changes for 90+ days | Ask about growth potential → suggest archiving if none |
| A file in `inbox/` has been there for 7+ days | Suggest classifying or deleting |
