---
title: Projects
description: Active efforts with specific deadlines or outcomes
type: reference
created: {{DATE}}
---

# Projects

Short-term efforts with a clear end state. Each project gets its own subfolder.

## Structure

```
projects/
├── my-project/
│   ├── README.md        # Goals, status, key decisions
│   └── ...              # Project-specific notes
└── another-project/
```

## Lifecycle

1. **Start**: Create subfolder + README from `templates/project.md`
2. **Work**: Add notes, decisions, references inside the project folder
3. **Complete**: Move entire folder to `archives/`
4. **Link back**: Reference original idea with `[[wikilinks]]` if applicable

## Guidelines

- Each project should have a clear definition of "done"
- When a project stalls for 30+ days, consider archiving
