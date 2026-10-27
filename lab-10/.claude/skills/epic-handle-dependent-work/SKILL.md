---
name: epic-handle-dependent-work
description: Resolve the execution order of Epic Issues from their dependencies and decide what may run independently. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the Issues with their declared dependencies.

# Objective

Return a safe execution order.

This skill does not modify code.

# 1. Build the Dependency Order

1. Use declared dependencies and the Epic execution order.
2. Add implicit dependencies found in the code (e.g. an Issue that needs an action, store or Handle created by another Issue).
3. Prerequisites (Command Bus setup, MobX install) always come first.
4. Report a cycle as `BLOCKED`.

# 2. Independent Work

Issues are independent only when they do not touch the same files, actions, stores or Handles.

Do not parallelize work when it creates merge conflicts or architectural risk.

Prefer correctness and coherent implementation over artificial parallelism.

# 3. Final Output

Return:

* Ordered list of Issues
* For each Issue: what it depends on
* Groups that are genuinely independent
* `BLOCKED` with the cycle, when one exists

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
