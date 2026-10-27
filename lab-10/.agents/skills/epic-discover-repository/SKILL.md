---
name: epic-discover-repository
description: Inspect the repository and return its stack, structure, scripts and current architecture. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

# Objective

Build an accurate picture of the repository before any code is changed.

This skill only reads. It does not modify files.

# 1. Stack

Identify:

* Language and framework (and versions from the manifest / lockfile)
* Package manager
* Router, styling, state management, data fetching
* Test framework
* Lint / format tooling
* Path aliases (`tsconfig.json`)

# 2. Scripts

List the commands for:

* dev
* build
* test
* lint
* typecheck
* format

Only report scripts that actually exist.

# 3. Structure

Map the main directories and what lives in each (`src/features`, `src/components`, `src/lib`, `src/hooks`, etc.).

# 4. Command Bus

Check whether the Command Bus is installed:

* `src/lib/command/` exists with `command-bus.ts`, `index.ts`, `global.ts`, `types.ts`.
* Existing Handles (`*-handle.tsx`), actions (`*-actions.ts`) and MobX stores (`store/store.ts`).
* Whether `mobx` and `mobx-react-lite` are installed.
* Whether Fragiola UI is set up (`components.json` with the `@fragiola` registry) and which Fragiola components are already installed.

# 5. Existing Patterns

Find 1-3 representative examples of existing code for each relevant layer (Handle, store, component, test) so later steps can imitate them.

# 6. Final Output

Return:

* Stack summary
* Available scripts (exact commands)
* Directory map
* Command Bus status: `INSTALLED` / `NOT_INSTALLED` / `PARTIAL` (with details)
* MobX status: `INSTALLED` / `NOT_INSTALLED`
* Fragiola UI status: `INSTALLED` (with components list) / `NOT_INSTALLED`
* Reference files for each layer (paths)

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
