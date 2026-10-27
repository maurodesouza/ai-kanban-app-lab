---
name: epic-plan-execution
description: Produce the execution plan for an Epic from the Epic summary, repository report and conventions. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the outputs of `epic-read`, `epic-discover-repository` and `epic-repository-rules`.

# Objective

Decide what will be done, in which order, and how it maps to the Command Bus architecture.

This skill does not modify code.

# 1. Order the Work

Use `epic-handle-dependent-work` to resolve the order of the Issues.

# 2. Map Each Issue to the Architecture

Start from the Issue's Architecture Map (written by `tech-lead`). Verify it against the current code and complete or correct it.

For each Issue, list:

* Domains / features touched
* Actions to declare (`Action` or `ScopedAction`) and their location
* Handles to create or change
* MobX stores to create or change: primitives, setters and `$` derived values (including one `$<part>UI` per component)
* Components to create or change (read `$<part>UI`, present it, dispatch through `actions`) and the Fragiola UI components they use
* Tests to create or change

Follow `command-bus-architecture`. Every interaction (modal, drawer, notification, navigation, form, request, loading) must appear as an action + handler, never as logic inside a component or store. Every value a component presents must come from a `$` derived value in a store.

# 3. Prerequisites

Mark as the first step, when needed:

* `setup-command-system` when Command Bus status is `NOT_INSTALLED`.
* MobX installation when MobX status is `NOT_INSTALLED` (verified with `epic-current-documentation`).
* Fragiola registry setup (`fragiola-ui`) when `components.json` has no `@fragiola` registry.

# 4. Scope Check

Do not create unnecessary work.

Do not add anything outside the Epic scope.

If implementation details need to change while remaining within scope, adapt the plan and note why.

# 5. Final Output

Return:

* Ordered list of Issues
* Per-Issue architecture map (section 2)
* Prerequisite steps
* Risks or decisions that may trigger a stop condition

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
