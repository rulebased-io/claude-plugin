---
description: Discover and suggest wiki-link connections between notes
argument-hint: "[note-path]"
---

Find hidden connections between notes and suggest bidirectional wiki-links.

Three modes: connect a specific note (rank by shared tags/keywords, top 5), orphan scan (find notes with zero links), cluster discovery (suggest new MOCs per `system/growth-triggers.md`).

Links are always bidirectional. Updates `related` frontmatter and inline `[[wiki-links]]`. Never deletes existing links.

$ARGUMENTS
