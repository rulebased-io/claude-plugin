---
name: create
description: Create a new delegate agent definition file with name, role, and disclosure scope
---

Create a new delegate agent definition file under `.rulebased/agents/delegates/`.

The `CLAUDE_PLUGIN_PATH` provided by the hook is this plugin's root.

## How to Create a Delegate

1. If agent name is not provided in `$ARGUMENTS`, ask: "What should this delegate be named? (e.g., `api`, `db-admin`, `test-runner`)"
2. If role description is not provided, ask: "Describe this delegate's role in one sentence."
3. Create the file `.rulebased/agents/delegates/{name}.md`:

```markdown
---
name: {name}
description: {role-description}
---

## Role

{role-description}

## Disclosure Scope

Define what information this delegate is allowed to share with other agents:

- **Allowed**: (e.g., API endpoints, schema definitions, build status)
- **Restricted**: (e.g., credentials, internal implementation details)

## Capabilities

List the tasks this delegate can perform or answer questions about:

- (e.g., Answer questions about REST API contracts)
- (e.g., Report test suite status)
```

4. Confirm creation and prompt the user to fill in the Disclosure Scope and Capabilities sections.

## Next Steps

After creating delegates, run `/rulebased-agents:online` to register them with the agents server.

$ARGUMENTS
